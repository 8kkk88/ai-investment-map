import type { HeatmapAsset, Timeframe } from "@/types/market";

export type MarketDataMode = "simulated" | "provider";

export type MarketDataSource =
  | "simulated"
  | "placeholder"
  | "alpha-vantage"
  | "massive"
  | "twelve-data"
  | "finnhub";

export type DataQualityStatus =
  | "complete"
  | "partial"
  | "stale"
  | "simulated"
  | "notConfigured"
  | "providerError"
  | "rateLimited"
  | "unavailable";

export type FallbackReason =
  | "none"
  | "provider_not_configured"
  | "provider_error"
  | "rate_limited"
  | "partial_data"
  | "insufficient_data";

export type PriceAdjustmentPolicy = "adjusted" | "raw";

export type MarketStatus = "open" | "closed" | "after-hours" | "unknown";

export type DataFreshness = "fresh" | "stale" | "partial" | "unavailable";

export type NormalizedAsset = {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  assetType: "stock" | "etf" | "fund";
  exchange?: string;
  country?: string;
  currency: string;
  marketCapBucket?: "mega" | "large" | "mid" | "small";
};

export type NormalizedQuote = {
  symbol: string;
  price: number | null;
  changePct: number | null;
  marketCap: number | null;
  volume: number | null;
  asOf: string;
};

export type NormalizedBar = {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjustedClose?: number;
  volume: number | null;
  priceAdjustmentPolicy: PriceAdjustmentPolicy;
};

export type NormalizedHolding = {
  portfolioId: string;
  assetId: string;
  symbol: string;
  weightPct: number;
};

export type NormalizedPortfolio = {
  id: string;
  slug: string;
  name: string;
  description: string;
  portfolioType: "model" | "theme" | "simulated";
  holdings: NormalizedHolding[];
};

export type HistoricalBarRange = {
  from?: string;
  to?: string;
  interval: "1day" | "1week" | "1month";
  priceAdjustmentPolicy: PriceAdjustmentPolicy;
};

export type MarketDataMetadata = {
  source: MarketDataSource;
  asOf: string;
  isDelayed: boolean;
  isSimulated: boolean;
  fallbackReason: FallbackReason;
  dataQuality: DataQualityStatus;
  marketStatus: MarketStatus;
  dataFreshness: DataFreshness;
  priceAdjustmentPolicy: PriceAdjustmentPolicy;
};

export type MarketDataError = {
  code: string;
  message: string;
  symbol?: string;
};

export type MarketDataResult<T> = {
  data: T;
  metadata: MarketDataMetadata;
  errors?: MarketDataError[];
};

export type MarketDataProvider = {
  id: MarketDataSource;
  mode: MarketDataMode;
  getAssets: () => MarketDataResult<NormalizedAsset[]>;
  getQuotes: (symbols: string[]) => MarketDataResult<NormalizedQuote[]>;
  getHistoricalBars: (
    symbols: string[],
    range: HistoricalBarRange
  ) => MarketDataResult<NormalizedBar[]>;
  getPortfolioHoldings: (portfolioId: string) => MarketDataResult<NormalizedPortfolio>;
};

export type MarketMovers = {
  topGainers: HeatmapAsset[];
  topLosers: HeatmapAsset[];
  largestHoldings: HeatmapAsset[];
};

export type AssetDetailContext = {
  asset: HeatmapAsset;
  sectorRank: number;
  sectorPeerCount: number;
};

export type DashboardData = {
  portfolio: NormalizedPortfolio;
  portfolioAssets: HeatmapAsset[];
  heatmapAssets: HeatmapAsset[];
  sectors: string[];
  rankings: MarketMovers;
  metadata: MarketDataMetadata;
};

export type ReturnComputation = {
  symbol: string;
  returns: Record<Timeframe, number | null>;
  dataQuality: DataQualityStatus;
  dataFreshness: DataFreshness;
  fallbackReason: FallbackReason;
  priceAdjustmentPolicy: PriceAdjustmentPolicy;
};
