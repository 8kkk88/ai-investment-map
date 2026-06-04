"use client";

import type { Portfolio } from "@/types/market";

type PortfolioSelectorProps = {
  portfolios: Portfolio[];
  selectedSlug: string;
  onChange: (slug: string) => void;
};

export function PortfolioSelector({
  portfolios,
  selectedSlug,
  onChange
}: PortfolioSelectorProps) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
        Portfolio
      </span>
      <select
        value={selectedSlug}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-slate-700/80 bg-slate-950/80 px-3 text-sm font-medium text-slate-100 outline-none transition hover:border-slate-500 focus:border-emerald-400"
      >
        {portfolios.map((portfolio) => (
          <option key={portfolio.id} value={portfolio.slug}>
            {portfolio.name}
          </option>
        ))}
      </select>
    </label>
  );
}
