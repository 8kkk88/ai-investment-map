import { assets, portfolios } from "@/data/mock-market";
import type { Asset } from "@/types/market";
import type {
  HistoricalBarRange,
  MarketDataMetadata,
  MarketDataProvider,
  MarketDataResult,
  NormalizedAsset,
  NormalizedBar,
  NormalizedPortfolio,
  NormalizedQuote
} from "@/lib/market-data/types";

export const simulatedAsOf = "2026-06-05T00:00:00.000Z";

const simulatedMetadata: MarketDataMetadata = {
  source: "simulated",
  asOf: simulatedAsOf,
  isDelayed: false,
  isSimulated: true,
  fallbackReason: "none",
  dataQuality: "simulated",
  marketStatus: "closed",
  dataFreshness: "fresh",
  priceAdjustmentPolicy: "adjusted"
};

const normalizedAssets = assets.map(normalizeAsset);
const normalizedPortfolios = portfolios.map(normalizePortfolio);
const normalizedQuotes = assets.map(normalizeQuote);
const normalizedBars = assets.flatMap(generateSimulatedDailyBars);

export const mockProvider: MarketDataProvider = {
  id: "simulated",
  mode: "simulated",
  getAssets() {
    return withMetadata(normalizedAssets);
  },
  getQuotes(symbols) {
    const symbolSet = normalizeSymbolSet(symbols);
    return withMetadata(normalizedQuotes.filter((quote) => symbolSet.has(quote.symbol)));
  },
  getHistoricalBars(symbols, range) {
    const symbolSet = normalizeSymbolSet(symbols);
    const bars = normalizedBars
      .filter((bar) => symbolSet.has(bar.symbol))
      .filter((bar) => isWithinRange(bar, range));

    return withMetadata(bars);
  },
  getPortfolioHoldings(portfolioId) {
    const portfolio = normalizedPortfolios.find(
      (item) => item.id === portfolioId || item.slug === portfolioId
    );

    if (!portfolio) {
      return {
        data: {
          id: portfolioId,
          slug: portfolioId,
          name: "Unavailable portfolio",
          description: "Portfolio data is unavailable.",
          portfolioType: "simulated",
          holdings: []
        },
        metadata: {
          ...simulatedMetadata,
          fallbackReason: "insufficient_data",
          dataQuality: "unavailable",
          dataFreshness: "unavailable"
        },
        errors: [
          {
            code: "portfolio_not_found",
            message: `Portfolio ${portfolioId} was not found.`
          }
        ]
      };
    }

    return withMetadata(portfolio);
  }
};

export function getSimulatedPortfolioCatalog() {
  return normalizedPortfolios;
}

export function createSimulatedMetadata(overrides: Partial<MarketDataMetadata> = {}) {
  return {
    ...simulatedMetadata,
    ...overrides
  };
}

function withMetadata<T>(data: T): MarketDataResult<T> {
  return {
    data,
    metadata: simulatedMetadata
  };
}

function normalizeAsset(asset: Asset): NormalizedAsset {
  return {
    id: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    sector: asset.sector,
    assetType: asset.assetType,
    currency: "USD",
    country: "US",
    marketCapBucket: asset.marketCapBucket
  };
}

function normalizeQuote(asset: Asset): NormalizedQuote {
  return {
    symbol: asset.symbol,
    price: asset.price,
    changePct: asset.returns.daily,
    marketCap: asset.marketCap,
    volume: asset.volume,
    asOf: simulatedAsOf
  };
}

function normalizePortfolio(portfolio: (typeof portfolios)[number]): NormalizedPortfolio {
  return {
    id: portfolio.id,
    slug: portfolio.slug,
    name: portfolio.name,
    description: `${portfolio.description} This is a simulated model portfolio, not official company holdings.`,
    portfolioType: "model",
    holdings: portfolio.holdings.map((holding) => {
      const asset = assets.find((item) => item.id === holding.assetId);

      return {
        portfolioId: portfolio.id,
        assetId: holding.assetId,
        symbol: asset?.symbol ?? holding.assetId.toUpperCase(),
        weightPct: holding.weightPct
      };
    })
  };
}

function generateSimulatedDailyBars(asset: Asset): NormalizedBar[] {
  const dates = generateTradingDates(22);
  const closes = interpolateCloses(asset);

  return dates.map((date, index) => {
    const close = closes[index];

    return {
      symbol: asset.symbol,
      date,
      open: roundPrice(close * 0.997),
      high: roundPrice(close * 1.008),
      low: roundPrice(close * 0.992),
      close,
      adjustedClose: close,
      volume: asset.volume,
      priceAdjustmentPolicy: "adjusted"
    };
  });
}

function interpolateCloses(asset: Asset) {
  const latest = asset.price;
  const closes = Array.from({ length: 22 }, () => latest);
  closes[0] = referencePrice(latest, asset.returns.monthly);
  closes[16] = referencePrice(latest, asset.returns.weekly);
  closes[20] = referencePrice(latest, asset.returns.daily);
  closes[21] = latest;

  interpolateSegment(closes, 0, 16);
  interpolateSegment(closes, 16, 20);
  interpolateSegment(closes, 20, 21);

  return closes.map(roundPrice);
}

function interpolateSegment(values: number[], startIndex: number, endIndex: number) {
  const start = values[startIndex];
  const end = values[endIndex];
  const steps = endIndex - startIndex;

  for (let index = startIndex + 1; index < endIndex; index += 1) {
    const progress = (index - startIndex) / steps;
    values[index] = start + (end - start) * progress;
  }
}

function generateTradingDates(length: number) {
  const dates: string[] = [];
  const date = new Date(simulatedAsOf);

  while (dates.length < length) {
    const day = date.getUTCDay();

    if (day !== 0 && day !== 6) {
      dates.unshift(date.toISOString().slice(0, 10));
    }

    date.setUTCDate(date.getUTCDate() - 1);
  }

  return dates;
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

function referencePrice(latest: number, returnPct: number) {
  return latest / (1 + returnPct / 100);
}

function roundPrice(value: number) {
  return Math.round(value * 100) / 100;
}
