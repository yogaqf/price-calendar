/**
 * Route Handler: GET /api/seasonality
 *
 * Query parameters:
 *   symbol - Instrument symbol (required)
 *   years  - Number of historical years (optional, default 8)
 *
 * Response: SeasonalityResponse JSON
 */

import { type NextRequest } from "next/server";
import { fetchSeasonality } from "@/lib/yahoo-finance-provider";
import { getCachedSeasonality, setCachedSeasonality } from "@/lib/server-cache";
import { SUPPORTED_SYMBOLS } from "@/lib/instruments";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const symbol = searchParams.get("symbol");
  const yearsParam = searchParams.get("years");
  const yearsBack = yearsParam ? Math.min(15, Math.max(3, parseInt(yearsParam, 10) || 8)) : 8;

  if (!symbol || symbol.trim() === "") {
    return Response.json(
      { error: "Parameter 'symbol' is required." },
      { status: 400 }
    );
  }

  if (!SUPPORTED_SYMBOLS.has(symbol)) {
    return Response.json(
      { error: `Symbol '${symbol}' is not supported.` },
      { status: 400 }
    );
  }

  // Check in-memory cache
  const cached = getCachedSeasonality(symbol);
  if (cached) {
    return Response.json(cached, {
      headers: { "X-Cache": "HIT" },
    });
  }

  try {
    const data = await fetchSeasonality(symbol, yearsBack);
    setCachedSeasonality(symbol, data);

    return Response.json(data, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (err: unknown) {
    console.error(`[api/seasonality] Error fetching seasonality for ${symbol}:`, err);
    return Response.json(
      { error: "Failed to fetch seasonality data." },
      { status: 500 }
    );
  }
}
