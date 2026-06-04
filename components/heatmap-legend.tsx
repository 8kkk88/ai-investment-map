import { legendItems, getReturnTileStyle } from "@/lib/color-scale";

export function HeatmapLegend() {
  return (
    <div className="no-scrollbar flex max-w-full flex-nowrap items-center gap-1.5 overflow-x-auto pb-1 text-xs text-slate-500 sm:flex-wrap sm:overflow-visible sm:pb-0">
      <span className="mr-1 shrink-0 font-semibold uppercase tracking-[0.16em] text-slate-400">Return</span>
      {legendItems.map((item) => {
        const style = getReturnTileStyle(item.value);

        return (
          <span
            key={item.label}
            className="flex shrink-0 items-center gap-1.5 rounded border border-slate-800 bg-slate-950/70 px-2 py-1"
          >
            <span
              className="h-3 w-3 rounded-sm border"
              style={{ background: style.background, borderColor: style.borderColor }}
            />
            {item.label}
          </span>
        );
      })}
    </div>
  );
}
