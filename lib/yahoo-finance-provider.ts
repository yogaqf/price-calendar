/**
 * Yahoo Finance data provider module.
 * Semua akses ke Yahoo Finance dilakukan di sini, bukan di client.
 * Jika ingin mengganti sumber data, cukup ganti file ini.
 */

import YahooFinance from "yahoo-finance2";
import type { DailyPrice, HistoryResponse, InstrumentStats } from "./types";
import { getInstrument } from "./instruments";

// Instantiate once at module scope (server-side singleton)
const yahooFinance = new YahooFinance();

/**
 * Mengambil data historis untuk sebuah simbol dari Yahoo Finance.
 * @param symbol - Simbol instrumen (e.g. "BTC-USD", "AAPL")
 * @param from   - Tanggal awal (YYYY-MM-DD)
 * @param to     - Tanggal akhir (YYYY-MM-DD)
 */
export async function fetchHistoricalData(
  symbol: string,
  from: string,
  to: string
): Promise<HistoryResponse> {
  const instrument = getInstrument(symbol);
  const isCrypto = instrument?.category === "Crypto";

  // Ambil data sebelum 'from' (14 hari) agar selalu mendapatkan previousClose
  // untuk sesi perdagangan pertama dalam rentang, bahkan setelah hari libur panjang.
  const extendedFrom = getExtendedFrom(from);

  const result = await yahooFinance.chart(symbol, {
    period1: extendedFrom,
    period2: to,
    interval: "1d",
    includePrePost: false,
  });

  if (!result || !result.quotes || result.quotes.length === 0) {
    throw new Error(`No data available for symbol: ${symbol}`);
  }

  const currency = result.meta?.currency ?? "USD";
  const exchangeTz = result.meta?.exchangeTimezoneName || "UTC";

  // Gunakan Intl.DateTimeFormat dengan exchangeTimezoneName resmi bursa
  // Ini menangani Daylight Saving Time (DST) musim panas/dingin dan timezone bursa dengan akurat
  const dateFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: exchangeTz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const weekdayFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: exchangeTz,
    weekday: "short",
  });

  const quoteMap = new Map<
    string,
    {
      dateStr: string;
      rawDate: Date;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number | null;
    }
  >();

  for (const q of result.quotes) {
    if (!q.date || q.close == null) continue;

    const rawDate = q.date instanceof Date ? q.date : new Date(q.date);
    const dateStr = dateFmt.format(rawDate);
    const weekday = weekdayFmt.format(rawDate);

    // Untuk Forex & Saham, bursa tutup pada akhir pekan (Sabtu & Minggu).
    // Abaikan snapshot off-market akhir pekan.
    if (!isCrypto && (weekday === "Sat" || weekday === "Sun")) {
      continue;
    }

    // Jika ada lebih dari satu quote di hari yang sama, simpan quote terbaru
    quoteMap.set(dateStr, {
      dateStr,
      rawDate,
      open: q.open ?? q.close ?? 0,
      high: q.high ?? q.close ?? 0,
      low: q.low ?? q.close ?? 0,
      close: q.close ?? 0,
      volume: q.volume ?? null,
    });
  }

  // Sort secara kronologis ascending
  const sortedQuotes = Array.from(quoteMap.values()).sort((a, b) =>
    a.dateStr.localeCompare(b.dateStr)
  );

  // Hitung previous close dan persentase perubahan harian
  const dailyPrices: DailyPrice[] = [];

  for (let i = 0; i < sortedQuotes.length; i++) {
    const current = sortedQuotes[i];

    // Hanya masukkan ke data output jika tanggal berada dalam rentang [from, to]
    if (current.dateStr < from || current.dateStr > to) {
      continue;
    }

    // Previous close mengacu pada sesi perdagangan sebelumnya yang valid
    const prevQuote = i > 0 ? sortedQuotes[i - 1] : null;
    const previousClose = prevQuote?.close ?? null;

    let change: number | null = null;
    let changePercent: number | null = null;

    if (previousClose != null && previousClose !== 0) {
      change = current.close - previousClose;
      changePercent = (change / previousClose) * 100;
    }

    dailyPrices.push({
      date: current.dateStr,
      open: current.open,
      high: current.high,
      low: current.low,
      close: current.close,
      previousClose,
      change,
      changePercent,
      volume: current.volume,
    });
  }

  return {
    symbol,
    currency,
    data: dailyPrices,
  };
}

/**
 * Mengambil statistik All-Time High/Low, Year High/Low, Month High/Low, Week High/Low, Today High/Low
 */
export async function fetchInstrumentStats(symbol: string): Promise<InstrumentStats> {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonthStr = String(now.getUTCMonth() + 1).padStart(2, "0");

  // Awal minggu ini (Senin)
  const currentDayOfWeek = (now.getUTCDay() + 6) % 7; // Mon=0, ..., Sun=6
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - currentDayOfWeek);
  const mondayStr = monday.toISOString().substring(0, 10);

  const [chartRes, summaryRes] = await Promise.all([
    yahooFinance.chart(symbol, {
      period1: `${currentYear}-01-01`,
      interval: "1d",
      includePrePost: false,
    }),
    yahooFinance.quoteSummary(symbol, { modules: ["summaryDetail", "price"] }).catch(() => null),
  ]);

  const summary = summaryRes?.summaryDetail;
  const priceMeta = summaryRes?.price;
  const currency = chartRes.meta?.currency ?? priceMeta?.currency ?? "USD";
  const currentPrice = priceMeta?.regularMarketPrice ?? chartRes.meta?.regularMarketPrice ?? null;

  let ath = summary?.allTimeHigh ?? null;
  let atl = summary?.allTimeLow ?? null;
  let todayHigh = summary?.dayHigh ?? summary?.regularMarketDayHigh ?? null;
  let todayLow = summary?.dayLow ?? summary?.regularMarketDayLow ?? null;

  let ytdHigh = -Infinity, ytdLow = Infinity;
  let monthHigh = -Infinity, monthLow = Infinity;
  let weekHigh = -Infinity, weekLow = Infinity;

  const monthPrefix = `${currentYear}-${currentMonthStr}`;

  if (chartRes.quotes && chartRes.quotes.length > 0) {
    for (const q of chartRes.quotes) {
      if (!q.date) continue;
      const dateStr = q.date.toISOString().substring(0, 10);
      const h = q.high ?? q.close;
      const l = q.low ?? q.close;

      if (h != null && h > ytdHigh) ytdHigh = h;
      if (l != null && l < ytdLow) ytdLow = l;

      if (dateStr.startsWith(monthPrefix)) {
        if (h != null && h > monthHigh) monthHigh = h;
        if (l != null && l < monthLow) monthLow = l;
      }

      if (dateStr >= mondayStr) {
        if (h != null && h > weekHigh) weekHigh = h;
        if (l != null && l < weekLow) weekLow = l;
      }
    }

    const lastQuote = chartRes.quotes[chartRes.quotes.length - 1];
    if (todayHigh == null && lastQuote) {
      todayHigh = lastQuote.high ?? lastQuote.close;
    }
    if (todayLow == null && lastQuote) {
      todayLow = lastQuote.low ?? lastQuote.close;
    }
  }

  const validYtdHigh = ytdHigh !== -Infinity ? ytdHigh : null;
  const validYtdLow = ytdLow !== Infinity ? ytdLow : null;
  const validMonthHigh = monthHigh !== -Infinity ? monthHigh : validYtdHigh;
  const validMonthLow = monthLow !== Infinity ? monthLow : validYtdLow;
  const validWeekHigh = weekHigh !== -Infinity ? weekHigh : validMonthHigh;
  const validWeekLow = weekLow !== Infinity ? weekLow : validMonthLow;

  if (ath == null && validYtdHigh != null) ath = validYtdHigh;
  if (atl == null && validYtdLow != null) atl = validYtdLow;
  if (ath != null && validYtdHigh != null && validYtdHigh > ath) ath = validYtdHigh;
  if (atl != null && validYtdLow != null && validYtdLow < atl) atl = validYtdLow;

  return {
    symbol,
    currency,
    currentPrice,
    allTime: { high: ath, low: atl },
    thisYear: { high: validYtdHigh, low: validYtdLow },
    thisMonth: { high: validMonthHigh, low: validMonthLow },
    thisWeek: { high: validWeekHigh, low: validWeekLow },
    today: { high: todayHigh, low: todayLow },
  };
}

/**
 * Extend tanggal awal ke belakang ~14 hari untuk mendapatkan previous close
 * di hari pertama rentang (bahkan jika tanggal 1 adalah Senin setelah akhir pekan/libur).
 */
function getExtendedFrom(from: string): string {
  const d = new Date(from + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 14);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
