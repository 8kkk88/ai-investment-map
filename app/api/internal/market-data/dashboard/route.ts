import { NextResponse } from "next/server";
import { getServerDashboardData } from "@/lib/market-data/serverDataService";
import type { Sector, Timeframe } from "@/types/market";

const allowedTimeframes = new Set<Timeframe>(["daily", "weekly", "monthly"]);

export async function POST(request: Request) {
  const payload = await readPayload(request);
  const portfolioSlug = typeof payload.portfolioSlug === "string" ? payload.portfolioSlug : "openai-ecosystem";
  const timeframe = allowedTimeframes.has(payload.timeframe as Timeframe)
    ? (payload.timeframe as Timeframe)
    : "daily";
  const sector = typeof payload.sector === "string" ? (payload.sector as Sector | "all") : "all";
  const dashboardData = await getServerDashboardData({
    portfolioSlug,
    timeframe,
    sector
  });

  return NextResponse.json(dashboardData, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate"
    }
  });
}

async function readPayload(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}
