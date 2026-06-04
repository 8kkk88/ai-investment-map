"use client";

import { useMemo, useState } from "react";
import { portfolios } from "@/data/mock-market";
import { getHeatmapAssets, getPortfolioBySlug } from "@/lib/market";
import { formatPercent } from "@/lib/format";
import type { HeatmapAsset, Timeframe } from "@/types/market";
import { AssetDrawer } from "@/components/asset-drawer";
import { HeatmapLegend } from "@/components/heatmap-legend";
import { HeatmapView } from "@/components/heatmap-view";
import { PortfolioSelector } from "@/components/portfolio-selector";
import { SearchBox } from "@/components/search-box";
import { TimeframeTabs } from "@/components/timeframe-tabs";

export function InvestmentMapDashboard() {
  const [selectedPortfolioSlug, setSelectedPortfolioSlug] = useState(portfolios[0].slug);
  const [timeframe, setTimeframe] = useState<Timeframe>("daily");
  const [selectedAsset, setSelectedAsset] = useState<HeatmapAsset | null>(null);

  const portfolio = useMemo(() => getPortfolioBySlug(selectedPortfolioSlug), [selectedPortfolioSlug]);
  const heatmapAssets = useMemo(() => getHeatmapAssets(portfolio, timeframe), [portfolio, timeframe]);

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

  return (
    <main className="min-h-screen bg-ink text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col px-3 py-3 sm:px-5 sm:py-5">
        <header className="mb-3 rounded-md border border-slate-800 bg-panel/95 p-3 shadow-glow">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
            <div className="min-w-[250px] flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
                Frontend Demo
              </div>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                AI Investment Map
              </h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-500">
                A dark-mode AI ecosystem treemap. Tile size follows portfolio weight; tile color
                follows selected period return.
              </p>
            </div>

            <div className="grid flex-[2] grid-cols-1 gap-3 md:grid-cols-[minmax(240px,1fr)_240px_250px] xl:max-w-5xl">
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

        <section className="mb-3 grid gap-3 md:grid-cols-3">
          <Stat label="Holdings" value={heatmapAssets.length.toString()} />
          <Stat label="Weighted return" value={formatPercent(weightedReturn)} tone={weightedReturn >= 0 ? "up" : "down"} />
          <Stat label="Largest position" value={topHolding ? `${topHolding.symbol} ${topHolding.weightPct.toFixed(1)}%` : "-"} />
        </section>

        <section className="mb-3 rounded-md border border-slate-800 bg-panel/80 p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-black text-white">{portfolio.name}</h2>
              <p className="mt-1 max-w-3xl text-sm text-slate-500">{portfolio.description}</p>
            </div>
            <HeatmapLegend />
          </div>
        </section>

        <HeatmapView assets={heatmapAssets} onSelect={setSelectedAsset} />
      </div>

      <AssetDrawer asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
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
    <div className="rounded-md border border-slate-800 bg-panel/80 px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div
        className={[
          "mt-1 text-xl font-black",
          tone === "up" ? "text-emerald-300" : tone === "down" ? "text-red-300" : "text-white"
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}
