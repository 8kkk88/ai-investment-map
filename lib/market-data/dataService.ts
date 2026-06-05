import type {
  Asset,
  AssetType,
  HeatmapAsset,
  MarketCapBucket,
  Portfolio,
  Sector,
  Timeframe
} from "@/types/market";
import { computeReturns } from "@/lib/market-data/computeReturns";
import { mockProvider, createSimulatedMetadata, getSimulatedPortfolioCatalog } from "@/lib/market-data/providers/mockProvider";
import { realProviderPlaceholder } from "@/lib/market-data/providers/realProviderPlaceholder";
import type {
  AssetDetailContext,
  DashboardData,
  DataQualityStatus,
  FallbackReason,
  MarketDataMetadata,
  MarketDataMode,
  MarketDataProvider,
  MarketDataResult,
  MarketMovers,
  NormalizedAsset,
  NormalizedPortfolio,
  NormalizedQuote,
  PriceAdjustmentPolicy
} from "@/lib/market-data/types";

const defaultPriceAdjustmentPolicy: PriceAdjustmentPolicy = "adjusted";
const defaultPortfolioSlug = getSimulatedPortfolioCatalog()[0]?.slug ?? "openai-ecosystem";

type DashboardOptions = {
  portfolioSlug: string;
  timeframe: Timeframe;
  sector?: Sector | "all";
};

export function readMarketDataMode(): MarketDataMode {
  const mode = process.env.MARKET_DATA_MODE;
  return mode === "provider" ? "provider" : "simulated";
}

export function resolveMarketDataProvider(mode: MarketDataMode = readMarketDataMode()): MarketDataProvider {
  return mode === "provider" ? realProviderPlaceholder : mockProvider;
}

export function getPortfolioCatalog(): Portfolio[] {
  return getSimulatedPortfolioCatalog().map(toUiPortfolio);
}

export function getDashboardData({
  portfolioSlug,
  timeframe,
  sector = "all"
}: DashboardOptions): DashboardData {
  const provider = resolveMarketDataProvider();
  const providerPortfolio = provider.getPortfolioHoldings(portfolioSlug);
  const needsFallback = shouldFallback(providerPortfolio.metadata);
  const activeProvider = needsFallback ? mockProvider : provider;
  const activePortfolio = needsFallback ? mockProvider.getPortfolioHoldings(portfolioSlug) : providerPortfolio;
  const assetsResult = activeProvider.getAssets();
  const portfolio = activePortfolio.data.holdings.length
    ? activePortfolio.data
    : mockProvider.getPortfolioHoldings(defaultPortfolioSlug).data;
  const symbols = portfolio.holdings.map((holding) => holding.symbol);
  const quoteResult = activeProvider.getQuotes(symbols);
  const barsResult = activeProvider.getHistoricalBars(symbols, {
    interval: "1day",
    priceAdjustmentPolicy: defaultPriceAdjustmentPolicy
  });
  const metadata = mergeMetadata({
    primary: activePortfolio.metadata,
    fallbackReason: needsFallback ? providerPortfolio.metadata.fallbackReason : "none",
    dataQuality: needsFallback ? "simulated" : activePortfolio.metadata.dataQuality
  });
  const portfolioAssets = buildHeatmapAssets({
    assets: assetsResult.data,
    quotes: quoteResult.data,
    portfolio,
    timeframe,
    bars: barsResult.data,
    metadata
  });
  const heatmapAssets =
    sector === "all" ? portfolioAssets : portfolioAssets.filter((asset) => asset.sector === sector);

  return {
    portfolio,
    portfolioAssets,
    heatmapAssets,
    sectors: Array.from(new Set(portfolioAssets.map((asset) => asset.sector))).sort(),
    rankings: computeMarketMovers(heatmapAssets),
    metadata,
  };
}

export function computeMarketMovers(assets: HeatmapAsset[]): MarketMovers {
  const validAssets = assets.filter((asset) => Number.isFinite(asset.returnPct));

  return {
    topGainers: [...validAssets].sort((a, b) => b.returnPct - a.returnPct).slice(0, 8),
    topLosers: [...validAssets].sort((a, b) => a.returnPct - b.returnPct).slice(0, 8),
    largestHoldings: [...assets].sort((a, b) => b.weightPct - a.weightPct).slice(0, 8)
  };
}

export function getAssetDetailContext(
  portfolioAssets: HeatmapAsset[],
  selectedAssetId: string
): AssetDetailContext | null {
  const asset = portfolioAssets.find((item) => item.id === selectedAssetId);

  if (!asset) {
    return null;
  }

  const sectorPeers = portfolioAssets
    .filter((item) => item.sector === asset.sector)
    .sort((a, b) => b.returnPct - a.returnPct);
  const sectorRank = sectorPeers.findIndex((item) => item.id === asset.id) + 1;

  return {
    asset,
    sectorRank,
    sectorPeerCount: sectorPeers.length
  };
}

export function toUiPortfolio(portfolio: NormalizedPortfolio): Portfolio {
  return {
    id: portfolio.id,
    slug: portfolio.slug,
    name: portfolio.name,
    description: portfolio.description,
    holdings: portfolio.holdings.map((holding) => ({
      assetId: holding.assetId,
      weightPct: holding.weightPct
    }))
  };
}

function buildHeatmapAssets({
  assets,
  quotes,
  portfolio,
  timeframe,
  bars,
  metadata
}: {
  assets: NormalizedAsset[];
  quotes: NormalizedQuote[];
  portfolio: NormalizedPortfolio;
  timeframe: Timeframe;
  bars: Parameters<typeof computeReturns>[0];
  metadata: MarketDataMetadata;
}): HeatmapAsset[] {
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
  const quotesBySymbol = new Map(quotes.map((quote) => [quote.symbol, quote]));
  const returnsBySymbol = computeReturns(bars, metadata.priceAdjustmentPolicy);

  return portfolio.holdings
    .map((holding) => {
      const normalizedAsset = assetsById.get(holding.assetId);

      if (!normalizedAsset) {
        return null;
      }

      const quote = quotesBySymbol.get(normalizedAsset.symbol);
      const computedReturns = returnsBySymbol.get(normalizedAsset.symbol);
      const returns = {
        daily: computedReturns?.returns.daily ?? quote?.changePct ?? 0,
        weekly: computedReturns?.returns.weekly ?? quote?.changePct ?? 0,
        monthly: computedReturns?.returns.monthly ?? quote?.changePct ?? 0
      };
      const asset: Asset = {
        id: normalizedAsset.id,
        symbol: normalizedAsset.symbol,
        name: normalizedAsset.name,
        sector: normalizedAsset.sector as Sector,
        assetType: normalizeAssetType(normalizedAsset.assetType),
        price: quote?.price ?? 0,
        marketCap: quote?.marketCap ?? 0,
        volume: quote?.volume ?? 0,
        marketCapBucket: normalizeMarketCapBucket(
          normalizedAsset.marketCapBucket ?? deriveMarketCapBucket(quote?.marketCap ?? 0)
        ),
        returns
      };

      return {
        ...asset,
        weightPct: holding.weightPct,
        returnPct: returns[timeframe]
      };
    })
    .filter((asset): asset is HeatmapAsset => asset !== null)
    .sort((a, b) => b.weightPct - a.weightPct);
}

function shouldFallback(metadata: MarketDataMetadata) {
  return (
    metadata.dataQuality === "notConfigured" ||
    metadata.dataQuality === "providerError" ||
    metadata.dataFreshness === "unavailable"
  );
}

function mergeMetadata({
  primary,
  fallbackReason,
  dataQuality
}: {
  primary: MarketDataMetadata;
  fallbackReason: FallbackReason;
  dataQuality: DataQualityStatus;
}) {
  if (fallbackReason === "none") {
    return primary;
  }

  return createSimulatedMetadata({
    fallbackReason,
    dataQuality,
    isSimulated: true,
    source: "simulated"
  });
}

function normalizeAssetType(assetType: NormalizedAsset["assetType"]): AssetType {
  return assetType === "stock" ? "stock" : "etf";
}

function normalizeMarketCapBucket(bucket: NormalizedAsset["marketCapBucket"]): MarketCapBucket {
  return bucket === "small" ? "mid" : bucket ?? "mid";
}

function deriveMarketCapBucket(marketCap: number): MarketCapBucket {
  if (marketCap >= 200_000_000_000) {
    return "mega";
  }

  if (marketCap >= 50_000_000_000) {
    return "large";
  }

  return "mid";
}

export function unwrapMarketDataResult<T>(result: MarketDataResult<T>) {
  return result.data;
}
