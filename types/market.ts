export type Timeframe = "daily" | "weekly" | "monthly";

export type AssetType = "stock" | "etf";

export type MarketCapBucket = "mega" | "large" | "mid";

export type Sector =
  | "Semiconductors"
  | "Cloud"
  | "AI Infrastructure"
  | "Software"
  | "Consumer AI"
  | "Data Centers";

export type Asset = {
  id: string;
  symbol: string;
  name: string;
  sector: Sector;
  assetType: AssetType;
  price: number;
  marketCap: number;
  volume: number;
  marketCapBucket: MarketCapBucket;
  returns: Record<Timeframe, number>;
};

export type Holding = {
  assetId: string;
  weightPct: number;
};

export type Portfolio = {
  id: string;
  slug: string;
  name: string;
  description: string;
  holdings: Holding[];
};

export type HeatmapAsset = Asset & {
  weightPct: number;
  returnPct: number;
};
