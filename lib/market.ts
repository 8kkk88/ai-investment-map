import type { HeatmapAsset, Portfolio, Timeframe } from "@/types/market";
import {
  getDashboardData,
  getPortfolioCatalog
} from "@/lib/market-data/dataService";

export function getPortfolioBySlug(slug: string): Portfolio {
  const portfolios = getPortfolioCatalog();
  return portfolios.find((portfolio) => portfolio.slug === slug) ?? portfolios[0];
}

export function getHeatmapAssets(portfolio: Portfolio, timeframe: Timeframe): HeatmapAsset[] {
  return getDashboardData({
    portfolioSlug: portfolio.slug,
    timeframe,
    sector: "all"
  }).portfolioAssets;
}

export function getPortfolios(): Portfolio[] {
  return getPortfolioCatalog();
}

export function searchHeatmapAssets(assetsToSearch: HeatmapAsset[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return assetsToSearch
    .filter((asset) => {
      return (
        asset.symbol.toLowerCase().includes(normalizedQuery) ||
        asset.name.toLowerCase().includes(normalizedQuery)
      );
    })
    .slice(0, 8);
}
