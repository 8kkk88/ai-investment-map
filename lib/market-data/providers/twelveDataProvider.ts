import "server-only";

import { mockProvider } from "@/lib/market-data/providers/mockProvider";
import type {
  DataFreshness,
  DataQualityStatus,
  FallbackReason,
  HistoricalBarRange,
  MarketDataError,
  MarketDataMetadata,
  MarketDataProvider,
  MarketDataResult,
  NormalizedAsset,
  NormalizedBar,
  NormalizedPortfolio,
  NormalizedQuote
} from "@/lib/market-data/types";

const providerId = "twelve-data";
const providerBaseUrl = "https://api.twelvedata.com";
const requestTimeoutMs = 5_000;
const minimumUsableRatio = 0.7;
const staleAfterDays = 7;

type TwelveDataProviderOptions = {
  portfolioId: string;
  apiKey?: string;
  allowProviderMode: boolean;
};

type ProviderBuildResult = {
  metadata: MarketDataMetadata;
  errors: MarketDataError[];
  assets: NormalizedAsset[];
  portfolio: NormalizedPortfolio;
  quotes: NormalizedQuote[];
  bars: NormalizedBar[];
};

type RequestFailure = {
  code: FallbackReason;
  message: string;
  dataQuality: DataQualityStatus;
  dataFreshness: DataFreshness;
};

type TwelveQuotePayload = {
  symbol?: string;
  close?: string;
  price?: string;
  volume?: string;
  percent_change?: string;
  datetime?: string;
  timestamp?: number;
  code?: number;
  message?: string;
  status?: string;
};

type TwelveTimeSeriesPayload = {
  meta?: {
    symbol?: string;
  };
  values?: Array<{
    datetime?: string;
    open?: string;
    high?: string;
    low?: string;
    close?: string;
    volume?: string;
  }>;
  code?: number;
  message?: string;
  status?: string;
};

export async function createTwelveDataProvider({
  portfolioId,
  apiKey,
  allowProviderMode
}: TwelveDataProviderOptions): Promise<MarketDataProvider> {
  const buildResult = await buildTwelveDataSnapshot({
    portfolioId,
    apiKey,
    allowProviderMode
  });

  return {
    id: providerId,
    mode: "provider",
    getAssets() {
      return createResult(buildResult.assets, buildResult);
    },
    getQuotes(symbols) {
      const symbolSet = normalizeSymbolSet(symbols);
      return createResult(
        buildResult.quotes.filter((quote) => symbolSet.has(quote.symbol)),
        buildResult
      );
    },
    getHistoricalBars(symbols, range: HistoricalBarRange) {
      const symbolSet = normalizeSymbolSet(symbols);
      return createResult(
        buildResult.bars
          .filter((bar) => symbolSet.has(bar.symbol))
          .filter((bar) => isWithinRange(bar, range)),
        buildResult
      );
    },
    getPortfolioHoldings(portfolioIdToRead) {
      if (portfolioIdToRead !== buildResult.portfolio.id && portfolioIdToRead !== buildResult.portfolio.slug) {
        return createResult(createUnavailablePortfolio(portfolioIdToRead), {
          ...buildResult,
          metadata: {
            ...buildResult.metadata,
            fallbackReason: "insufficient_data",
            dataQuality: "unavailable",
            dataFreshness: "unavailable"
          },
          errors: [
            ...buildResult.errors,
            {
              code: "portfolio_not_found",
              message: `Portfolio ${portfolioIdToRead} is not available in the Twelve Data snapshot.`
            }
          ]
        });
      }

      return createResult(buildResult.portfolio, buildResult);
    }
  };
}

async function buildTwelveDataSnapshot({
  portfolioId,
  apiKey,
  allowProviderMode
}: TwelveDataProviderOptions): Promise<ProviderBuildResult> {
  const portfolioResult = mockProvider.getPortfolioHoldings(portfolioId);
  const portfolio = portfolioResult.data.holdings.length
    ? portfolioResult.data
    : mockProvider.getPortfolioHoldings("openai-ecosystem").data;
  const assets = mockProvider.getAssets().data;
  const symbols = portfolio.holdings.map((holding) => holding.symbol);

  if (!allowProviderMode) {
    return unavailableSnapshot({
      portfolio,
      assets,
      code: "provider_rights_blocked",
      message: "Provider mode is blocked for this environment.",
      dataQuality: "notConfigured",
      dataFreshness: "unavailable"
    });
  }

  if (!apiKey) {
    return unavailableSnapshot({
      portfolio,
      assets,
      code: "provider_not_configured",
      message: "Twelve Data API key is not configured.",
      dataQuality: "notConfigured",
      dataFreshness: "unavailable"
    });
  }

  try {
    const [quotesResponse, barsResponse] = await Promise.all([
      fetchTwelveData("quote", { symbol: symbols.join(",") }, apiKey),
      fetchTwelveData(
        "time_series",
        {
          symbol: symbols.join(","),
          interval: "1day",
          outputsize: "70"
        },
        apiKey
      )
    ]);

    if (quotesResponse.failure) {
      return unavailableSnapshot({
        portfolio,
        assets,
        ...quotesResponse.failure
      });
    }

    if (barsResponse.failure) {
      return unavailableSnapshot({
        portfolio,
        assets,
        ...barsResponse.failure
      });
    }

    const mockQuotesBySymbol = new Map(
      mockProvider.getQuotes(symbols).data.map((quote) => [quote.symbol, quote])
    );
    const quotes = normalizeQuotePayload(quotesResponse.data, symbols, mockQuotesBySymbol);
    const bars = normalizeTimeSeriesPayload(barsResponse.data, symbols);
    const usableSymbols = findUsableSymbols(symbols, quotes, bars);
    const usableRatio = symbols.length ? usableSymbols.size / symbols.length : 0;
    const latestAsOf = readLatestAsOf(quotes, bars);
    const stale = isStale(latestAsOf);

    if (usableRatio < minimumUsableRatio) {
      return {
        portfolio,
        assets,
        quotes,
        bars,
        metadata: createMetadata({
          asOf: latestAsOf,
          fallbackReason: "partial_data",
          dataQuality: "providerError",
          dataFreshness: "unavailable"
        }),
        errors: [
          {
            code: "provider_partial_below_threshold",
            message: `Only ${usableSymbols.size} of ${symbols.length} requested symbols returned usable provider data.`
          }
        ]
      };
    }

    return {
      portfolio,
      assets,
      quotes,
      bars,
      metadata: createMetadata({
        asOf: latestAsOf,
        fallbackReason: usableSymbols.size === symbols.length ? "none" : "partial_data",
        dataQuality: usableSymbols.size === symbols.length ? (stale ? "stale" : "complete") : "partial",
        dataFreshness: usableSymbols.size === symbols.length ? (stale ? "stale" : "fresh") : "partial"
      }),
      errors:
        usableSymbols.size === symbols.length
          ? []
          : [
              {
                code: "provider_partial",
                message: `${usableSymbols.size} of ${symbols.length} requested symbols returned usable provider data.`
              }
            ]
    };
  } catch {
    return unavailableSnapshot({
      portfolio,
      assets,
      code: "network_error",
      message: "Twelve Data provider request failed.",
      dataQuality: "providerError",
      dataFreshness: "unavailable"
    });
  }
}

async function fetchTwelveData(
  endpoint: "quote" | "time_series",
  params: Record<string, string>,
  apiKey: string
): Promise<{ data: unknown; failure: null } | { data: null; failure: RequestFailure }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  const url = new URL(`${providerBaseUrl}/${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  url.searchParams.set("apikey", apiKey);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal
    });

    if (response.status === 429) {
      return {
        data: null,
        failure: {
          code: "rate_limited",
          message: "Twelve Data quota or rate limit was reached.",
          dataQuality: "rateLimited",
          dataFreshness: "unavailable"
        }
      };
    }

    if (!response.ok) {
      return {
        data: null,
        failure: {
          code: "provider_error",
          message: `Twelve Data request failed with HTTP ${response.status}.`,
          dataQuality: "providerError",
          dataFreshness: "unavailable"
        }
      };
    }

    const data = (await response.json()) as unknown;

    if (isProviderErrorPayload(data)) {
      return {
        data: null,
        failure: {
          code: data.code === 429 ? "rate_limited" : data.code === 400 ? "invalid_symbol" : "provider_error",
          message: sanitizeProviderMessage(data.message ?? "Twelve Data returned an API error."),
          dataQuality: data.code === 429 ? "rateLimited" : "providerError",
          dataFreshness: "unavailable"
        }
      };
    }

    return { data, failure: null };
  } catch (error) {
    return {
      data: null,
      failure: {
        code: error instanceof DOMException && error.name === "AbortError" ? "provider_timeout" : "network_error",
        message: error instanceof DOMException && error.name === "AbortError"
          ? "Twelve Data request timed out."
          : "Twelve Data network request failed.",
        dataQuality: "providerError",
        dataFreshness: "unavailable"
      }
    };
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeQuotePayload(
  payload: unknown,
  symbols: string[],
  mockQuotesBySymbol: Map<string, NormalizedQuote>
): NormalizedQuote[] {
  return symbols
    .map((symbol): NormalizedQuote | null => {
      const item = readPayloadForSymbol<TwelveQuotePayload>(payload, symbol);

      if (!item || item.status === "error") {
        return null;
      }

      const mockQuote = mockQuotesBySymbol.get(symbol);
      const price = parseNumber(item.close ?? item.price);
      const volume = parseNumber(item.volume);
      const changePct = parseNumber(item.percent_change);

      if (price === null) {
        return null;
      }

      return {
        symbol,
        price,
        changePct,
        marketCap: mockQuote?.marketCap ?? null,
        volume: volume ?? mockQuote?.volume ?? null,
        asOf: normalizeAsOf(item.datetime, item.timestamp)
      };
    })
    .filter((quote): quote is NormalizedQuote => quote !== null);
}

function normalizeTimeSeriesPayload(payload: unknown, symbols: string[]): NormalizedBar[] {
  return symbols.flatMap((symbol) => {
    const item = readPayloadForSymbol<TwelveTimeSeriesPayload>(payload, symbol);

    if (!item || item.status === "error" || !Array.isArray(item.values)) {
      return [];
    }

    return item.values
      .map((value): NormalizedBar | null => {
        const date = value.datetime;
        const open = parseNumber(value.open);
        const high = parseNumber(value.high);
        const low = parseNumber(value.low);
        const close = parseNumber(value.close);

        if (!date || open === null || high === null || low === null || close === null) {
          return null;
        }

        return {
          symbol,
          date,
          open,
          high,
          low,
          close,
          volume: parseNumber(value.volume),
          priceAdjustmentPolicy: "raw" as const
        };
      })
      .filter((bar): bar is NormalizedBar => bar !== null);
  });
}

function readPayloadForSymbol<T extends { symbol?: string; meta?: { symbol?: string } }>(
  payload: unknown,
  symbol: string
): T | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (typeof payload.symbol === "string" || isRecord(payload.meta)) {
    return payload as T;
  }

  const direct = payload[symbol];

  if (isRecord(direct)) {
    return direct as T;
  }

  return null;
}

function findUsableSymbols(symbols: string[], quotes: NormalizedQuote[], bars: NormalizedBar[]) {
  const quoteSymbols = new Set(quotes.filter((quote) => quote.price !== null).map((quote) => quote.symbol));
  const barsBySymbol = new Map<string, number>();

  for (const bar of bars) {
    barsBySymbol.set(bar.symbol, (barsBySymbol.get(bar.symbol) ?? 0) + 1);
  }

  return new Set(
    symbols.filter((symbol) => quoteSymbols.has(symbol) && (barsBySymbol.get(symbol) ?? 0) > 21)
  );
}

function unavailableSnapshot({
  portfolio,
  assets,
  code,
  message,
  dataQuality,
  dataFreshness
}: {
  portfolio: NormalizedPortfolio;
  assets: NormalizedAsset[];
  code: FallbackReason;
  message: string;
  dataQuality: DataQualityStatus;
  dataFreshness: DataFreshness;
}): ProviderBuildResult {
  return {
    portfolio,
    assets,
    quotes: [],
    bars: [],
    metadata: createMetadata({
      fallbackReason: code,
      dataQuality,
      dataFreshness
    }),
    errors: [
      {
        code,
        message
      }
    ]
  };
}

function createResult<T>(data: T, buildResult: ProviderBuildResult): MarketDataResult<T> {
  return {
    data,
    metadata: buildResult.metadata,
    errors: buildResult.errors.length ? buildResult.errors : undefined
  };
}

function createMetadata({
  asOf = new Date().toISOString(),
  fallbackReason,
  dataQuality,
  dataFreshness
}: {
  asOf?: string;
  fallbackReason: FallbackReason;
  dataQuality: DataQualityStatus;
  dataFreshness: DataFreshness;
}): MarketDataMetadata {
  return {
    source: providerId,
    asOf,
    isDelayed: true,
    isSimulated: false,
    fallbackReason,
    dataQuality,
    marketStatus: "unknown",
    dataFreshness,
    priceAdjustmentPolicy: "raw"
  };
}

function createUnavailablePortfolio(portfolioId: string): NormalizedPortfolio {
  return {
    id: portfolioId,
    slug: portfolioId,
    name: "Unavailable portfolio",
    description: "Portfolio holdings are unavailable for this provider snapshot.",
    portfolioType: "model",
    holdings: []
  };
}

function readLatestAsOf(quotes: NormalizedQuote[], bars: NormalizedBar[]) {
  const quoteDates = quotes.map((quote) => quote.asOf).filter(Boolean);
  const barDates = bars.map((bar) => `${bar.date}T00:00:00.000Z`);
  const sorted = [...quoteDates, ...barDates].sort();

  return sorted.at(-1) ?? new Date().toISOString();
}

function isStale(asOf: string) {
  const asOfTime = Date.parse(asOf);

  if (!Number.isFinite(asOfTime)) {
    return true;
  }

  const ageMs = Date.now() - asOfTime;

  return ageMs > staleAfterDays * 24 * 60 * 60 * 1000;
}

function normalizeAsOf(datetime?: string, timestamp?: number) {
  if (timestamp && Number.isFinite(timestamp)) {
    return new Date(timestamp * 1000).toISOString();
  }

  if (datetime) {
    const normalized = datetime.includes("T") ? datetime : `${datetime}T00:00:00.000Z`;
    const parsed = Date.parse(normalized);

    if (Number.isFinite(parsed)) {
      return new Date(parsed).toISOString();
    }
  }

  return new Date().toISOString();
}

function parseNumber(value: string | number | undefined | null) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function isWithinRange(bar: NormalizedBar, range: HistoricalBarRange) {
  if (range.from && bar.date < range.from) {
    return false;
  }

  if (range.to && bar.date > range.to) {
    return false;
  }

  return true;
}

function normalizeSymbolSet(symbols: string[]) {
  return new Set(symbols.map((symbol) => symbol.toUpperCase()));
}

function isProviderErrorPayload(data: unknown): data is { code?: number; message?: string; status?: string } {
  return isRecord(data) && (data.status === "error" || typeof data.code === "number");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sanitizeProviderMessage(message: string) {
  return message
    .replace(/apikey=[^&\s]+/gi, "apikey=[redacted]")
    .replace(/api[_-]?key[:=]\s*[^\s]+/gi, "api_key=[redacted]");
}
