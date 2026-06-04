"use client";

import { X } from "lucide-react";
import { formatCompactCurrency, formatCompactNumber, formatPercent } from "@/lib/format";
import type { HeatmapAsset, Timeframe } from "@/types/market";

type AssetDrawerProps = {
  asset: HeatmapAsset | null;
  timeframe: Timeframe;
  portfolioName: string;
  sectorRank: number;
  sectorPeerCount: number;
  onClose: () => void;
};

export function AssetDrawer({
  asset,
  timeframe,
  portfolioName,
  sectorRank,
  sectorPeerCount,
  onClose
}: AssetDrawerProps) {
  if (!asset) {
    return null;
  }

  const positive = asset.returnPct >= 0;
  const contribution = (asset.weightPct * asset.returnPct) / 100;
  const insight =
    `Contributes ${formatInsightPercent(contribution)} to portfolio return in the ${timeframe} view. ` +
    (sectorRank
      ? `Ranked #${sectorRank} of ${sectorPeerCount} sector peers by selected-period return.`
      : "Sector peer rank is unavailable for this selection.");

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close asset drawer"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <aside className="absolute bottom-0 right-0 top-auto max-h-[88vh] w-full overflow-y-auto border-t border-slate-800 bg-slate-950 shadow-glow sm:bottom-0 sm:top-0 sm:max-h-none sm:max-w-md sm:border-l sm:border-t-0">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-800 bg-slate-950/95 px-5 py-4 backdrop-blur">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-50">{asset.symbol}</h2>
              <span className="rounded border border-slate-700 px-2 py-0.5 text-xs font-semibold uppercase text-slate-400">
                {asset.assetType}
              </span>
            </div>
            <p className="mt-1 truncate text-sm text-slate-400">{asset.name}</p>
            <p className="mt-1 text-xs text-slate-600">{portfolioName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-800 p-2 text-slate-400 transition hover:border-slate-600 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="rounded-md border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
              <span>Latest price</span>
              <span className="rounded border border-slate-800 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-400">
                {timeframe} return
              </span>
            </div>
            <div className="mt-2 flex items-end justify-between gap-4">
              <div className="text-3xl font-black text-white">${asset.price.toFixed(2)}</div>
              <div
                className={[
                  "rounded px-2.5 py-1 text-sm font-black",
                  positive ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
                ].join(" ")}
              >
                {formatPercent(asset.returnPct)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Metric label="Portfolio weight" value={`${asset.weightPct.toFixed(1)}%`} />
            <Metric label="Return contribution" value={formatInsightPercent(contribution)} />
            <Metric label="Sector" value={asset.sector} />
            <Metric label="Sector rank" value={sectorRank ? `${sectorRank} / ${sectorPeerCount}` : "-"} />
            <Metric label="Market cap" value={formatCompactCurrency(asset.marketCap)} />
            <Metric label="Volume" value={formatCompactNumber(asset.volume)} />
          </div>

          <div className="rounded-md border border-slate-800 bg-slate-900/45 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Portfolio insight
            </div>
            <p className="text-sm leading-5 text-slate-200">{insight}</p>
          </div>

          <div className="rounded-md border border-slate-800 bg-slate-900/40 p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Period returns
            </div>
            <div className="grid grid-cols-3 gap-2">
              <ReturnCell label="Daily" value={asset.returns.daily} />
              <ReturnCell label="Weekly" value={asset.returns.weekly} />
              <ReturnCell label="Monthly" value={asset.returns.monthly} />
            </div>
          </div>

          <p className="text-xs leading-5 text-slate-500">
            Demo data only. This frontend MVP uses local mock data and does not provide investment
            advice or real-time market prices.
          </p>
        </div>
      </aside>
    </div>
  );
}

function formatInsightPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/45 p-3">
      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 break-words text-sm font-semibold text-slate-100">{value}</div>
    </div>
  );
}

function ReturnCell({ label, value }: { label: string; value: number }) {
  const positive = value >= 0;

  return (
    <div className="rounded border border-slate-800 bg-black/20 p-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={["mt-1 text-sm font-black", positive ? "text-emerald-300" : "text-red-300"].join(" ")}>
        {formatPercent(value)}
      </div>
    </div>
  );
}
