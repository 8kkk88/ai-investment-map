import "server-only";

import { getDashboardDataWithProvider } from "@/lib/market-data/dataService";
import { mockProvider } from "@/lib/market-data/providers/mockProvider";
import { realProviderPlaceholder } from "@/lib/market-data/providers/realProviderPlaceholder";
import { createTwelveDataProvider } from "@/lib/market-data/providers/twelveDataProvider";
import type { DashboardData } from "@/lib/market-data/types";
import type { Sector, Timeframe } from "@/types/market";

type ServerDashboardOptions = {
  portfolioSlug: string;
  timeframe: Timeframe;
  sector?: Sector | "all";
};

export async function getServerDashboardData(options: ServerDashboardOptions): Promise<DashboardData> {
  const provider = await resolveServerProvider(options.portfolioSlug);

  return getDashboardDataWithProvider(provider, options);
}

async function resolveServerProvider(portfolioSlug: string) {
  const mode = process.env.MARKET_DATA_MODE === "provider" ? "provider" : "simulated";
  const providerName = process.env.MARKET_DATA_PROVIDER;

  if (mode !== "provider") {
    return mockProvider;
  }

  if (providerName !== "twelve-data") {
    return realProviderPlaceholder;
  }

  return createTwelveDataProvider({
    portfolioId: portfolioSlug,
    apiKey: process.env.MARKET_DATA_API_KEY,
    allowProviderMode: canUseProviderMode()
  });
}

function canUseProviderMode() {
  if (process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview") {
    return false;
  }

  if (process.env.NODE_ENV === "production") {
    return false;
  }

  return true;
}
