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

const placeholderMetadata: MarketDataMetadata = {
  source: "placeholder",
  asOf: "2026-06-05T00:00:00.000Z",
  isDelayed: false,
  isSimulated: false,
  fallbackReason: "provider_not_configured",
  dataQuality: "notConfigured",
  marketStatus: "unknown",
  dataFreshness: "unavailable",
  priceAdjustmentPolicy: "adjusted"
};

export const realProviderPlaceholder: MarketDataProvider = {
  id: "placeholder",
  mode: "provider",
  getAssets() {
    return unavailableResult<NormalizedAsset[]>(
      [],
      "provider_not_configured",
      "Real market data provider is not configured for Phase 2.1."
    );
  },
  getQuotes(symbols) {
    return unavailableResult<NormalizedQuote[]>(
      [],
      "provider_not_configured",
      `Real quote provider is not configured for ${symbols.length} symbols.`
    );
  },
  getHistoricalBars(symbols, range: HistoricalBarRange) {
    void range;

    return unavailableResult<NormalizedBar[]>(
      [],
      "provider_not_configured",
      `Real historical bar provider is not configured for ${symbols.length} symbols.`
    );
  },
  getPortfolioHoldings(portfolioId) {
    return unavailableResult<NormalizedPortfolio>(
      {
        id: portfolioId,
        slug: portfolioId,
        name: "Provider not configured",
        description: "Real provider portfolio holdings are unavailable in Phase 2.1.",
        portfolioType: "model",
        holdings: []
      },
      "provider_not_configured",
      "Real portfolio provider is not configured for Phase 2.1."
    );
  }
};

function unavailableResult<T>(
  data: T,
  code: string,
  message: string
): MarketDataResult<T> {
  return {
    data,
    metadata: placeholderMetadata,
    errors: [
      {
        code,
        message
      }
    ]
  };
}
