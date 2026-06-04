"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { searchHeatmapAssets } from "@/lib/market";
import type { HeatmapAsset } from "@/types/market";
import { formatPercent } from "@/lib/format";

type SearchBoxProps = {
  assets: HeatmapAsset[];
  onSelect: (asset: HeatmapAsset) => void;
};

export function SearchBox({ assets, onSelect }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchHeatmapAssets(assets, query), [assets, query]);

  return (
    <div className="relative w-full min-w-0 flex-1">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
          Search
        </span>
        <span className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Symbol or company name"
            className="h-10 w-full rounded-md border border-slate-700/80 bg-slate-950/80 pl-9 pr-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 hover:border-slate-500 focus:border-emerald-400"
          />
        </span>
      </label>

      {results.length > 0 ? (
        <div className="absolute left-0 right-0 top-[64px] z-40 overflow-hidden rounded-md border border-slate-700 bg-slate-950 shadow-glow">
          {results.map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => {
                onSelect(asset);
                setQuery("");
              }}
              className="flex w-full items-center justify-between gap-3 border-b border-slate-800 px-3 py-2 text-left last:border-0 hover:bg-slate-900"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-100">{asset.symbol}</span>
                <span className="block truncate text-xs text-slate-500">{asset.name}</span>
              </span>
              <span
                className={[
                  "shrink-0 text-sm font-semibold",
                  asset.returnPct >= 0 ? "text-emerald-300" : "text-red-300"
                ].join(" ")}
              >
                {formatPercent(asset.returnPct)}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
