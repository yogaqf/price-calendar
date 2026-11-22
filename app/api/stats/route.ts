/**
 * Route Handler: GET /api/stats
 *
 * Query parameters:
 *   symbol - Instrument symbol (required)
 *
 * Response: InstrumentStats JSON
 */

import { type NextRequest } from "next/server";
import { fetchInstrumentStats } from "@/lib/yahoo-finance-provider";
import { getCachedStats, setCachedStats } from "@/lib/server-cache";
import { SUPPORTED_SYMBOLS } from "@/lib/instruments";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const symbol = searchParams.get("symbol");

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

  const cached = getCachedStats(symbol);
  if (cached) {
    return Response.json(cached, {
      headers: { "X-Cache": "HIT" },
    });
  }

  try {
    const stats = await fetchInstrumentStats(symbol);
    setCachedStats(symbol, stats);

    return Response.json(stats, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (err: unknown) {
    console.error(`[api/stats] Error fetching stats for ${symbol}:`, err);
    return Response.json(
      { error: "Failed to fetch instrument statistics." },
      { status: 502 }
    );
  }
}
