"use client";

import type { Timeframe } from "@/types/market";

const timeframes: { label: string; value: Timeframe }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" }
];

type TimeframeTabsProps = {
  value: Timeframe;
  onChange: (value: Timeframe) => void;
};

export function TimeframeTabs({ value, onChange }: TimeframeTabsProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
        Period
      </span>
      <div className="grid h-10 grid-cols-3 rounded-md border border-slate-700/70 bg-slate-950/70 p-1">
        {timeframes.map((timeframe) => {
          const selected = value === timeframe.value;

          return (
            <button
              key={timeframe.value}
              type="button"
              onClick={() => onChange(timeframe.value)}
              className={[
                "rounded px-3 text-sm font-medium transition",
                selected
                  ? "bg-slate-100 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              ].join(" ")}
            >
              {timeframe.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
