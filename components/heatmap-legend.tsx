import { legendItems, getReturnTileStyle } from "@/lib/color-scale";

export function HeatmapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
      <span className="mr-1 font-medium text-slate-400">Return color</span>
      {legendItems.map((item) => {
        const style = getReturnTileStyle(item.value);

        return (
          <span key={item.label} className="flex items-center gap-1.5">
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
