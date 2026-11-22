/**
 * Route Handler: GET /api/history
 *
 * Query parameters:
 *   symbol  - Instrument symbol (required)
 *   from    - Start date YYYY-MM-DD (required)
 *   to      - End date YYYY-MM-DD (required)
 *
 * Response: HistoryResponse JSON
 */

import { type NextRequest } from "next/server";
import { fetchHistoricalData } from "@/lib/yahoo-finance-provider";
import { getCached, setCached } from "@/lib/server-cache";
import { SUPPORTED_SYMBOLS } from "@/lib/instruments";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 366;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const symbol = searchParams.get("symbol");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // --- Parameter Validation ---
  if (!symbol || symbol.trim() === "") {
    return Response.json(
      { error: "Parameter 'symbol' is required." },
      { status: 400 }
    );
  }

  if (!from || !DATE_REGEX.test(from)) {
    return Response.json(
      { error: "Parameter 'from' must be in YYYY-MM-DD format." },
      { status: 400 }
    );
  }

  if (!to || !DATE_REGEX.test(to)) {
    return Response.json(
      { error: "Parameter 'to' must be in YYYY-MM-DD format." },
      { status: 400 }
    );
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return Response.json({ error: "Invalid date format." }, { status: 400 });
  }

  if (fromDate > toDate) {
    return Response.json(
      { error: "Start date 'from' cannot be greater than end date 'to'." },
      { status: 400 }
    );
  }

  const rangeDays =
    (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
  if (rangeDays > MAX_RANGE_DAYS) {
    return Response.json(
      { error: `Maximum date range is ${MAX_RANGE_DAYS} days.` },
      { status: 400 }
    );
  }

  if (!SUPPORTED_SYMBOLS.has(symbol)) {
    return Response.json(
      { error: `Symbol '${symbol}' is not supported.` },
      { status: 400 }
    );
  }

  // --- Check Cache ---
  const cached = getCached(symbol, from, to);
  if (cached) {
    return Response.json(cached, {
      headers: { "X-Cache": "HIT" },
    });
  }

  // --- Fetch from Provider ---
  try {
    const data = await fetchHistoricalData(symbol, from, to);
    setCached(symbol, from, to, data);

    return Response.json(data, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (err: unknown) {
    console.error(`[api/history] Error fetching ${symbol}:`, err);

    const message = err instanceof Error ? err.message : String(err);

    if (
      message.toLowerCase().includes("no data") ||
      message.toLowerCase().includes("not found")
    ) {
      return Response.json(
        { error: `No data available for symbol '${symbol}'.` },
        { status: 404 }
      );
    }

    if (
      message.toLowerCase().includes("rate") ||
      message.toLowerCase().includes("429")
    ) {
      return Response.json(
        { error: "Rate limit reached. Please try again shortly." },
        { status: 429 }
      );
    }

    return Response.json(
      { error: "Failed to fetch data from provider. Please try again later." },
      { status: 502 }
    );
  }
}
