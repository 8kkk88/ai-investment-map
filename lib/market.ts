import { assets, portfolios } from "@/data/mock-market";
import type { HeatmapAsset, Portfolio, Timeframe } from "@/types/market";

const assetById = new Map(assets.map((asset) => [asset.id, asset]));

export function getPortfolioBySlug(slug: string): Portfolio {
  return portfolios.find((portfolio) => portfolio.slug === slug) ?? portfolios[0];
}

export function getHeatmapAssets(portfolio: Portfolio, timeframe: Timeframe): HeatmapAsset[] {
  return portfolio.holdings
    .map((holding) => {
      const asset = assetById.get(holding.assetId);

      if (!asset) {
        return null;
      }

      return {
        ...asset,
        weightPct: holding.weightPct,
        returnPct: asset.returns[timeframe]
      };
    })
    .filter((asset): asset is HeatmapAsset => asset !== null)
    .sort((a, b) => b.weightPct - a.weightPct);
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
