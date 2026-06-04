"use client";

import { useMemo, useState } from "react";
import { portfolios } from "@/data/mock-market";
import { getHeatmapAssets, getPortfolioBySlug } from "@/lib/market";
import { formatPercent } from "@/lib/format";
import type { HeatmapAsset, Sector, Timeframe } from "@/types/market";
import { AssetDrawer } from "@/components/asset-drawer";
import { FilterChips } from "@/components/filter-chips";
import { HeatmapLegend } from "@/components/heatmap-legend";
import { HeatmapView } from "@/components/heatmap-view";
import { PortfolioSelector } from "@/components/portfolio-selector";
import { RankingsPanel } from "@/components/rankings-panel";
import { SearchBox } from "@/components/search-box";
import { TimeframeTabs } from "@/components/timeframe-tabs";

export function InvestmentMapDashboard() {
  const [selectedPortfolioSlug, setSelectedPortfolioSlug] = useState(portfolios[0].slug);
  const [timeframe, setTimeframe] = useState<Timeframe>("daily");
  const [selectedSector, setSelectedSector] = useState<Sector | "all">("all");
  const [selectedAsset, setSelectedAsset] = useState<HeatmapAsset | null>(null);

  const portfolio = useMemo(() => getPortfolioBySlug(selectedPortfolioSlug), [selectedPortfolioSlug]);
  const portfolioAssets = useMemo(() => getHeatmapAssets(portfolio, timeframe), [portfolio, timeframe]);
  const sectors = useMemo(
    () => Array.from(new Set(portfolioAssets.map((asset) => asset.sector))).sort(),
    [portfolioAssets]
  );
  const heatmapAssets = useMemo(() => {
    if (selectedSector === "all") {
      return portfolioAssets;
    }

    return portfolioAssets.filter((asset) => asset.sector === selectedSector);
  }, [portfolioAssets, selectedSector]);

  const totalWeight = useMemo(
    () => heatmapAssets.reduce((sum, asset) => sum + asset.weightPct, 0),
    [heatmapAssets]
  );

  const weightedReturn = useMemo(() => {
    if (!totalWeight) {
      return 0;
    }

    return (
      heatmapAssets.reduce((sum, asset) => sum + asset.returnPct * asset.weightPct, 0) / totalWeight
    );
  }, [heatmapAssets, totalWeight]);

  const topHolding = heatmapAssets[0];
  const selectedAssetContext = useMemo(() => {
    if (!selectedAsset) {
      return null;
    }

    const sectorPeers = portfolioAssets
      .filter((asset) => asset.sector === selectedAsset.sector)
      .sort((a, b) => b.returnPct - a.returnPct);
    const sectorRank = sectorPeers.findIndex((asset) => asset.id === selectedAsset.id) + 1;

    return {
      sectorRank,
      sectorPeerCount: sectorPeers.length
    };
  }, [portfolioAssets, selectedAsset]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-ink text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col overflow-x-hidden px-2 py-2 sm:px-4 sm:py-4">
        <header className="mb-2 rounded-md border border-slate-800 bg-panel/95 p-2.5 shadow-glow sm:p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
            <div className="min-w-[250px] flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
                Simulated market snapshot
              </div>
              <h1 className="mt-0.5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                AI Investment Map
              </h1>
              <p className="mt-1 hidden max-w-3xl text-sm text-slate-500 sm:block">
                A dark-mode AI ecosystem treemap. Tile size follows portfolio weight; tile color
                follows selected period return.
              </p>
            </div>

            <div className="grid w-full min-w-0 max-w-full flex-[2] grid-cols-1 gap-3 md:grid-cols-[minmax(240px,1fr)_240px_250px] xl:max-w-5xl">
              <SearchBox assets={heatmapAssets} onSelect={setSelectedAsset} />
              <PortfolioSelector
                portfolios={portfolios}
                selectedSlug={selectedPortfolioSlug}
                onChange={setSelectedPortfolioSlug}
              />
              <TimeframeTabs value={timeframe} onChange={setTimeframe} />
            </div>
          </div>
        </header>

        <section className="mb-2 grid grid-cols-3 gap-2">
          <Stat label="Holdings" value={heatmapAssets.length.toString()} />
          <Stat label="Weighted return" value={formatPercent(weightedReturn)} tone={weightedReturn >= 0 ? "up" : "down"} />
          <Stat label="Largest position" value={topHolding ? `${topHolding.symbol} ${topHolding.weightPct.toFixed(1)}%` : "-"} />
        </section>

        <section className="mb-2 rounded-md border border-slate-800 bg-panel/80 p-2.5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-black text-white">{portfolio.name}</h2>
              <p className="mt-0.5 hidden max-w-3xl text-sm text-slate-500 md:block">{portfolio.description}</p>
            </div>
            <HeatmapLegend />
          </div>
          <div className="mt-2 border-t border-slate-800 pt-2">
            <FilterChips sectors={sectors} selectedSector={selectedSector} onChange={setSelectedSector} />
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-2 text-xs sm:hidden">
            <span className="text-slate-500">Market movers are below the map.</span>
            <a
              href="#rankings"
              className="rounded border border-slate-700 bg-slate-950/70 px-2.5 py-1 font-semibold text-slate-200 transition hover:border-slate-500"
            >
              View rankings
            </a>
          </div>
        </section>

        <section className="grid flex-1 gap-2 xl:grid-cols-[minmax(0,1fr)_330px]">
          <HeatmapView
            assets={heatmapAssets}
            selectedAssetId={selectedAsset?.id}
            timeframe={timeframe}
            onSelect={setSelectedAsset}
          />
          <RankingsPanel assets={heatmapAssets} onSelect={setSelectedAsset} />
        </section>
      </div>

      <AssetDrawer
        asset={selectedAsset}
        timeframe={timeframe}
        portfolioName={portfolio.name}
        sectorRank={selectedAssetContext?.sectorRank ?? 0}
        sectorPeerCount={selectedAssetContext?.sectorPeerCount ?? 0}
        onClose={() => setSelectedAsset(null)}
      />
    </main>
  );
}

function Stat({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  return (
    <div className="min-w-0 rounded-md border border-slate-800 bg-panel/80 px-3 py-2">
      <div className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-[11px]">{label}</div>
      <div
        className={[
          "mt-0.5 truncate text-sm font-black sm:text-lg",
          tone === "up" ? "text-emerald-300" : tone === "down" ? "text-red-300" : "text-white"
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}
