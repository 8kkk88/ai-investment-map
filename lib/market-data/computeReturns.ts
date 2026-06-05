import type { Timeframe } from "@/types/market";
import type {
  DataFreshness,
  DataQualityStatus,
  FallbackReason,
  NormalizedBar,
  PriceAdjustmentPolicy,
  ReturnComputation
} from "@/lib/market-data/types";

const timeframeLookback: Record<Timeframe, number> = {
  daily: 1,
  weekly: 5,
  monthly: 21
};

export function computeReturns(
  bars: NormalizedBar[],
  priceAdjustmentPolicy: PriceAdjustmentPolicy
): Map<string, ReturnComputation> {
  const barsBySymbol = new Map<string, NormalizedBar[]>();

  for (const bar of bars) {
    const symbolBars = barsBySymbol.get(bar.symbol) ?? [];
    symbolBars.push(bar);
    barsBySymbol.set(bar.symbol, symbolBars);
  }

  const results = new Map<string, ReturnComputation>();

  for (const [symbol, symbolBars] of barsBySymbol) {
    results.set(symbol, computeReturnsForSymbol(symbol, symbolBars, priceAdjustmentPolicy));
  }

  return results;
}

export function computeReturnsForSymbol(
  symbol: string,
  bars: NormalizedBar[],
  priceAdjustmentPolicy: PriceAdjustmentPolicy
): ReturnComputation {
  const sortedBars = [...bars].sort((a, b) => a.date.localeCompare(b.date));
  const returns: Record<Timeframe, number | null> = {
    daily: computeReturn(sortedBars, timeframeLookback.daily, priceAdjustmentPolicy),
    weekly: computeReturn(sortedBars, timeframeLookback.weekly, priceAdjustmentPolicy),
    monthly: computeReturn(sortedBars, timeframeLookback.monthly, priceAdjustmentPolicy)
  };

  const availableReturns = Object.values(returns).filter((value) => value !== null);
  const dataQuality: DataQualityStatus =
    availableReturns.length === 3 ? "complete" : availableReturns.length > 0 ? "partial" : "unavailable";
  const dataFreshness: DataFreshness =
    dataQuality === "complete" ? "fresh" : dataQuality === "partial" ? "partial" : "unavailable";
  const fallbackReason: FallbackReason =
    dataQuality === "complete" ? "none" : "insufficient_data";

  return {
    symbol,
    returns,
    dataQuality,
    dataFreshness,
    fallbackReason,
    priceAdjustmentPolicy
  };
}

function computeReturn(
  bars: NormalizedBar[],
  lookbackSessions: number,
  priceAdjustmentPolicy: PriceAdjustmentPolicy
) {
  if (bars.length <= lookbackSessions) {
    return null;
  }

  const latest = readClose(bars[bars.length - 1], priceAdjustmentPolicy);
  const reference = readClose(bars[bars.length - 1 - lookbackSessions], priceAdjustmentPolicy);

  if (latest === null || reference === null || reference === 0) {
    return null;
  }

  return roundPercent(((latest - reference) / reference) * 100);
}

function readClose(bar: NormalizedBar, priceAdjustmentPolicy: PriceAdjustmentPolicy) {
  if (priceAdjustmentPolicy === "adjusted") {
    return bar.adjustedClose ?? bar.close ?? null;
  }

  return bar.close ?? null;
}

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}
