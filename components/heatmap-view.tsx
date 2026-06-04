"use client";

import { hierarchy, treemap, treemapSquarify } from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import { getReturnTileStyle } from "@/lib/color-scale";
import { formatPercent } from "@/lib/format";
import type { HeatmapAsset, Timeframe } from "@/types/market";

type SectorNode = {
  name: string;
  children: HeatmapNode[];
};

type HeatmapNode = {
  name: string;
  asset: HeatmapAsset;
  value: number;
};

type RootNode = {
  name: string;
  children: SectorNode[];
};

type HeatmapViewProps = {
  assets: HeatmapAsset[];
  selectedAssetId?: string;
  timeframe: Timeframe;
  onSelect: (asset: HeatmapAsset) => void;
};

export function HeatmapView({ assets, selectedAssetId, timeframe, onSelect }: HeatmapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hoveredAsset, setHoveredAsset] = useState<HeatmapAsset | null>(null);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: Math.floor(entry.contentRect.width),
        height: Math.floor(entry.contentRect.height)
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const tree = useMemo(() => {
    if (size.width <= 0 || size.height <= 0) {
      return null;
    }

    const sectors = Array.from(new Set(assets.map((asset) => asset.sector))).map((sector) => ({
      name: sector,
      children: assets
        .filter((asset) => asset.sector === sector)
        .map((asset) => ({
          name: asset.symbol,
          asset,
          value: asset.weightPct
        }))
    }));

    const root = hierarchy<RootNode | SectorNode | HeatmapNode>({
      name: "AI Investment Map",
      children: sectors
    } as RootNode)
      .sum((node) => ("value" in node ? node.value : 0))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    return treemap<RootNode | SectorNode | HeatmapNode>()
      .tile(treemapSquarify.ratio(1.15))
      .size([size.width, size.height])
      .round(true)
      .paddingOuter(4)
      .paddingInner(3)
      .paddingTop((node) => (node.depth === 1 ? 26 : 0))(root);
  }, [assets, size.height, size.width]);

  const leaves = tree?.leaves() ?? [];
  const sectorNodes = tree?.children ?? [];

  return (
    <div
      ref={containerRef}
      className="relative min-h-[520px] overflow-hidden rounded-md border border-slate-800 bg-[#070b12] shadow-glow sm:min-h-[560px] xl:min-h-[calc(100vh-212px)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.09),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.45),transparent)]" />

      {sectorNodes.map((node) => (
        <div
          key={node.data.name}
          className="pointer-events-none absolute rounded border border-slate-700/50 bg-slate-950/15"
          style={{
            left: node.x0,
            top: node.y0,
            width: Math.max(0, node.x1 - node.x0),
            height: Math.max(0, node.y1 - node.y0)
          }}
        >
          <div className="h-6 truncate border-b border-slate-700/35 bg-black/20 px-2 pt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            {node.data.name}
          </div>
        </div>
      ))}

      {leaves.map((node) => {
        const data = node.data;

        if (!("asset" in data)) {
          return null;
        }

        const asset = data.asset;
        const width = Math.max(0, node.x1 - node.x0);
        const height = Math.max(0, node.y1 - node.y0);
        const area = width * height;
        const showWeight = area > 8500 && width > 72 && height > 58;
        const compact = area < 3300 || height < 46;
        const style = getReturnTileStyle(asset.returnPct);
        const selected = asset.id === selectedAssetId;

        return (
          <button
            key={`${asset.id}-${node.x0}-${node.y0}`}
            type="button"
            onClick={() => onSelect(asset)}
            onMouseEnter={() => setHoveredAsset(asset)}
            onMouseLeave={() => setHoveredAsset(null)}
            title={`${asset.symbol} ${formatPercent(asset.returnPct)} / ${asset.weightPct.toFixed(1)}%`}
            className={[
              "absolute overflow-hidden rounded border p-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition duration-150 hover:z-20 hover:scale-[1.015] hover:brightness-110 focus:z-20 focus:outline-none focus:ring-2 focus:ring-emerald-300",
              selected ? "z-10 ring-2 ring-white/80" : ""
            ].join(" ")}
            style={{
              left: node.x0,
              top: node.y0,
              width,
              height,
              background: style.background,
              borderColor: style.borderColor
            }}
          >
            <span className="flex h-full min-h-0 flex-col justify-between">
              <span>
                <span
                  className={[
                    "block truncate font-black text-white drop-shadow",
                    compact ? "text-[11px]" : "text-sm md:text-base"
                  ].join(" ")}
                >
                  {asset.symbol}
                </span>
                {!compact ? (
                  <span className="mt-0.5 block truncate text-[11px] font-medium text-white/70">
                    {asset.sector}
                  </span>
                ) : null}
              </span>
              <span className="flex items-end justify-between gap-1">
                <span className={compact ? "text-[10px] font-bold text-white drop-shadow" : "text-sm font-black text-white drop-shadow"}>
                  {formatPercent(asset.returnPct)}
                </span>
                {showWeight ? (
                  <span className="rounded bg-black/20 px-1.5 py-0.5 text-[11px] font-semibold text-white/80">
                    {asset.weightPct.toFixed(1)}%
                  </span>
                ) : null}
              </span>
            </span>
          </button>
        );
      })}

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-col gap-2 sm:right-auto sm:w-[360px]">
        <div className="rounded-md border border-slate-700/80 bg-slate-950/85 px-3 py-2 shadow-glow backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {timeframe} view
            </span>
            <span className="text-[11px] text-slate-500">Simulated data</span>
          </div>
          {hoveredAsset ? (
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="mr-2 text-sm font-black text-slate-100">{hoveredAsset.symbol}</span>
                <span className="truncate text-xs text-slate-500">{hoveredAsset.sector}</span>
              </span>
              <span className={hoveredAsset.returnPct >= 0 ? "text-sm font-black text-emerald-300" : "text-sm font-black text-red-300"}>
                {formatPercent(hoveredAsset.returnPct)} / {hoveredAsset.weightPct.toFixed(1)}%
              </span>
            </div>
          ) : (
            <div className="mt-1 text-xs text-slate-400">
              <span className="sm:hidden">Tap a tile to open asset details.</span>
              <span className="hidden sm:inline">
                Hover or tap a tile to inspect return, weight, and sector context.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
