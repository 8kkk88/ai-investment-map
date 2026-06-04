"use client";

import { hierarchy, treemap, treemapSquarify } from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import { getReturnTileStyle } from "@/lib/color-scale";
import { formatPercent } from "@/lib/format";
import type { HeatmapAsset } from "@/types/market";

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
  onSelect: (asset: HeatmapAsset) => void;
};

export function HeatmapView({ assets, onSelect }: HeatmapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

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
      .paddingOuter(3)
      .paddingInner(3)
      .paddingTop((node) => (node.depth === 1 ? 24 : 0))(root);
  }, [assets, size.height, size.width]);

  const leaves = tree?.leaves() ?? [];
  const sectorNodes = tree?.children ?? [];

  return (
    <div
      ref={containerRef}
      className="relative min-h-[560px] overflow-hidden rounded-md border border-slate-800 bg-[#070b12] shadow-glow lg:min-h-[calc(100vh-210px)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.09),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.45),transparent)]" />

      {sectorNodes.map((node) => (
        <div
          key={node.data.name}
          className="pointer-events-none absolute rounded border border-slate-700/40"
          style={{
            left: node.x0,
            top: node.y0,
            width: Math.max(0, node.x1 - node.x0),
            height: Math.max(0, node.y1 - node.y0)
          }}
        >
          <div className="h-6 truncate px-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
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

        return (
          <button
            key={`${asset.id}-${node.x0}-${node.y0}`}
            type="button"
            onClick={() => onSelect(asset)}
            title={`${asset.symbol} ${formatPercent(asset.returnPct)} / ${asset.weightPct.toFixed(1)}%`}
            className="absolute overflow-hidden rounded border p-2 text-left transition duration-150 hover:z-20 hover:scale-[1.015] hover:brightness-110 focus:z-20 focus:outline-none focus:ring-2 focus:ring-emerald-300"
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
                    "block truncate font-black text-white",
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
                <span className={compact ? "text-[10px] font-bold text-white" : "text-sm font-black text-white"}>
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
    </div>
  );
}
