"use client";

import type { Sector } from "@/types/market";

type FilterChipsProps = {
  sectors: Sector[];
  selectedSector: Sector | "all";
  onChange: (sector: Sector | "all") => void;
};

export function FilterChips({ sectors, selectedSector, onChange }: FilterChipsProps) {
  return (
    <div className="relative max-w-full">
      <div className="no-scrollbar flex max-w-full flex-nowrap items-center gap-1.5 overflow-x-auto pb-1 pr-8 sm:flex-wrap sm:overflow-visible sm:pb-0 sm:pr-0">
        <span className="mr-1 shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Sector
        </span>
        <button
          type="button"
          onClick={() => onChange("all")}
          className={[
            "shrink-0",
            "rounded border px-2.5 py-1 text-xs font-semibold transition",
            selectedSector === "all"
              ? "border-slate-100 bg-slate-100 text-slate-950"
              : "border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-600 hover:text-slate-100"
          ].join(" ")}
        >
          All
        </button>
        {sectors.map((sector) => {
          const selected = selectedSector === sector;

          return (
            <button
              key={sector}
              type="button"
              onClick={() => onChange(sector)}
              className={[
                "shrink-0",
                "rounded border px-2.5 py-1 text-xs font-semibold transition",
                selected
                  ? "border-emerald-300 bg-emerald-300 text-slate-950"
                  : "border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-600 hover:text-slate-100"
              ].join(" ")}
            >
              {sector}
            </button>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-panel via-panel/90 to-transparent sm:hidden" />
    </div>
  );
}
