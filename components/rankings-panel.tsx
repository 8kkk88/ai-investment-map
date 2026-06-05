"use client";

import { useMemo, useState } from "react";
import { formatPercent } from "@/lib/format";
import type { HeatmapAsset } from "@/types/market";
import type { MarketMovers } from "@/lib/market-data/types";

type RankingType = "gainers" | "losers" | "holdings";

type RankingsPanelProps = {
  assets: HeatmapAsset[];
  rankings?: MarketMovers;
  onSelect: (asset: HeatmapAsset) => void;
};

const rankingTabs: { label: string; value: RankingType }[] = [
  { label: "Top Gainers", value: "gainers" },
  { label: "Top Losers", value: "losers" },
  { label: "Largest Holdings", value: "holdings" }
];

export function RankingsPanel({ assets, rankings, onSelect }: RankingsPanelProps) {
  const [activeTab, setActiveTab] = useState<RankingType>("gainers");

  const rows = useMemo(() => {
    if (rankings) {
      if (activeTab === "gainers") {
        return rankings.topGainers;
      }

      if (activeTab === "losers") {
        return rankings.topLosers;
      }

      return rankings.largestHoldings;
    }

    const sorted = [...assets];

    if (activeTab === "gainers") {
      sorted.sort((a, b) => b.returnPct - a.returnPct);
    }

    if (activeTab === "losers") {
      sorted.sort((a, b) => a.returnPct - b.returnPct);
    }

    if (activeTab === "holdings") {
      sorted.sort((a, b) => b.weightPct - a.weightPct);
    }

    return sorted.slice(0, 8);
  }, [activeTab, assets, rankings]);

  return (
    <aside id="rankings" className="scroll-mt-3 rounded-md border border-slate-800 bg-panel/90 p-3 shadow-glow">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.14em] text-slate-100">
            Market Movers
          </h2>
          <p className="mt-1 text-xs text-slate-500">Rankings by current portfolio and period</p>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-1 rounded-md border border-slate-800 bg-slate-950/70 p-1">
        {rankingTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={[
              "rounded px-2 py-1.5 text-[11px] font-semibold leading-tight transition",
              activeTab === tab.value
                ? "bg-slate-100 text-slate-950"
                : "text-slate-500 hover:bg-slate-800 hover:text-slate-100"
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {rows.map((asset, index) => (
          <button
            key={asset.id}
            type="button"
            onClick={() => onSelect(asset)}
            className="grid w-full grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2 rounded border border-transparent px-2 py-2 text-left transition hover:border-slate-700 hover:bg-slate-900"
          >
            <span className="text-xs font-black text-slate-600">{index + 1}</span>
            <span className="min-w-0">
              <span className="block text-sm font-black text-slate-100">{asset.symbol}</span>
              <span className="block truncate text-xs text-slate-500">{asset.name}</span>
            </span>
            <span className="text-right">
              <span
                className={[
                  "block text-sm font-black",
                  asset.returnPct >= 0 ? "text-emerald-300" : "text-red-300"
                ].join(" ")}
              >
                {activeTab === "holdings"
                  ? `${asset.weightPct.toFixed(1)}%`
                  : formatPercent(asset.returnPct)}
              </span>
              <span className="block text-[11px] text-slate-600">
                {activeTab === "holdings" ? formatPercent(asset.returnPct) : `${asset.weightPct.toFixed(1)}%`}
              </span>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
