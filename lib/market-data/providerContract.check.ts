import type { HeatmapAsset } from "@/types/market";
import { computeReturns } from "@/lib/market-data/computeReturns";
import { getDashboardData, resolveMarketDataProvider } from "@/lib/market-data/dataService";
import { mockProvider } from "@/lib/market-data/providers/mockProvider";
import { realProviderPlaceholder } from "@/lib/market-data/providers/realProviderPlaceholder";
import type {
  MarketDataProvider,
  MarketDataResult,
  NormalizedAsset,
  NormalizedBar,
  NormalizedPortfolio,
  NormalizedQuote
} from "@/lib/market-data/types";

const providerContracts: MarketDataProvider[] = [mockProvider, realProviderPlaceholder];
const mockAssetsResult: MarketDataResult<NormalizedAsset[]> = mockProvider.getAssets();
const mockQuoteResult: MarketDataResult<NormalizedQuote[]> = mockProvider.getQuotes(["NVDA"]);
const mockBarsResult: MarketDataResult<NormalizedBar[]> = mockProvider.getHistoricalBars(["NVDA"], {
  interval: "1day",
  priceAdjustmentPolicy: "adjusted"
});
const mockPortfolioResult: MarketDataResult<NormalizedPortfolio> =
  mockProvider.getPortfolioHoldings("openai-ecosystem");
const placeholderResult: MarketDataResult<NormalizedAsset[]> = realProviderPlaceholder.getAssets();
const dashboardResult = getDashboardData({
  portfolioSlug: "openai-ecosystem",
  timeframe: "daily",
  sector: "all"
});
const fallbackProvider: MarketDataProvider = resolveMarketDataProvider("provider");
const computedReturns = computeReturns(mockBarsResult.data, "adjusted");
const fallbackHeatmapAssets: HeatmapAsset[] = dashboardResult.heatmapAssets;
const providerMethodNames: Array<keyof MarketDataProvider> = [
  "id",
  "mode",
  "getAssets",
  "getQuotes",
  "getHistoricalBars",
  "getPortfolioHoldings"
];

export const marketDataProviderContractCheck = {
  providerContracts,
  mockAssetsResult,
  mockQuoteResult,
  mockBarsResult,
  mockPortfolioResult,
  placeholderResult,
  fallbackProvider,
  computedReturns,
  fallbackHeatmapAssets,
  providerMethodNames
};
