import { NextRequest, NextResponse } from "next/server";
import { fetchDowSeasonality } from "@/lib/yahoo-finance-provider";
import { getCachedDow, setCachedDow } from "@/lib/server-cache";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 });
  }

  // Serve from cache if available
  const cached = getCachedDow(symbol);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const data = await fetchDowSeasonality(symbol);
    setCachedDow(symbol, data);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
