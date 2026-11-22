/**
 * Yahoo Finance data provider module.
 * Semua akses ke Yahoo Finance dilakukan di sini, bukan di client.
 * Jika ingin mengganti sumber data, cukup ganti file ini.
 */

import YahooFinance from "yahoo-finance2";
import type {
  DailyPrice,
  HistoryResponse,
  InstrumentStats,
  MonthReturn,
  YearSeasonality,
  SeasonalityResponse,
  DowDayStats,
  DowSeasonalityResponse,
} from "./types";
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
  // Tambahkan 2 hari setelah 'to' agar hari terakhir bulan tidak terpotong oleh timezone (period2 bersifat eksklusif di Yahoo).
  const extendedFrom = getExtendedFrom(from);
  const extendedTo = getExtendedTo(to);

  const result = await yahooFinance.chart(symbol, {
    period1: extendedFrom,
    period2: extendedTo,
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
  const instrument = getInstrument(symbol);
  const isCrypto = instrument?.category === "Crypto";

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonthStr = String(now.getUTCMonth() + 1).padStart(2, "0");

  // Awal minggu ini (Senin)
  const currentDayOfWeek = (now.getUTCDay() + 6) % 7; // Mon=0, ..., Sun=6
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - currentDayOfWeek);

  const [chartRes, chartMonthly, summaryRes] = await Promise.all([
    yahooFinance.chart(symbol, {
      period1: `${currentYear}-01-01`,
      interval: "1d",
      includePrePost: false,
    }),
    yahooFinance
      .chart(symbol, {
        period1: "2000-01-01",
        interval: "1mo",
        includePrePost: false,
      })
      .catch(() => null),
    yahooFinance.quoteSummary(symbol, { modules: ["summaryDetail", "price"] }).catch(() => null),
  ]);

  const summary = summaryRes?.summaryDetail;
  const priceMeta = summaryRes?.price;
  const currency = chartRes.meta?.currency ?? priceMeta?.currency ?? "USD";
  const exchangeTz = chartRes.meta?.exchangeTimezoneName || "UTC";

  const weekdayFmt = new Intl.DateTimeFormat("en-US", { timeZone: exchangeTz, weekday: "short" });
  const dateFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: exchangeTz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const mondayStr = dateFmt.format(monday);
  const monthPrefix = `${currentYear}-${currentMonthStr}`;

  // Filter out weekend snapshots (Saturday/Sunday) for Forex and Stocks
  const validDaily: { dateStr: string; high: number; low: number; close: number }[] = [];
  if (chartRes.quotes && chartRes.quotes.length > 0) {
    for (const q of chartRes.quotes) {
      if (!q.date || q.close == null) continue;
      const rawDate = q.date instanceof Date ? q.date : new Date(q.date);
      const weekday = weekdayFmt.format(rawDate);
      if (!isCrypto && (weekday === "Sat" || weekday === "Sun")) {
        continue;
      }
      validDaily.push({
        dateStr: dateFmt.format(rawDate),
        high: q.high ?? q.close,
        low: q.low ?? q.close,
        close: q.close,
      });
    }
  }

  let ytdHigh = -Infinity, ytdHighDate = "";
  let ytdLow = Infinity,   ytdLowDate  = "";
  let monthHigh = -Infinity, monthHighDate = "";
  let monthLow  = Infinity,  monthLowDate  = "";
  let weekHigh  = -Infinity, weekHighDate  = "";
  let weekLow   = Infinity,  weekLowDate   = "";

  for (const q of validDaily) {
    if (q.high > ytdHigh) { ytdHigh = q.high; ytdHighDate = q.dateStr; }
    if (q.low  < ytdLow)  { ytdLow  = q.low;  ytdLowDate  = q.dateStr; }

    if (q.dateStr.startsWith(monthPrefix)) {
      if (q.high > monthHigh) { monthHigh = q.high; monthHighDate = q.dateStr; }
      if (q.low  < monthLow)  { monthLow  = q.low;  monthLowDate  = q.dateStr; }
    }

    if (q.dateStr >= mondayStr) {
      if (q.high > weekHigh) { weekHigh = q.high; weekHighDate = q.dateStr; }
      if (q.low  < weekLow)  { weekLow  = q.low;  weekLowDate  = q.dateStr; }
    }
  }

  // Today / Latest trading session
  const lastTradingDay = validDaily.length > 0 ? validDaily[validDaily.length - 1] : null;
  const todayHigh = lastTradingDay ? lastTradingDay.high : null;
  const todayLow = lastTradingDay ? lastTradingDay.low : null;

  // Current Price: if weekend and Forex/Stocks, use last trading session close
  const currentPrice =
    !isCrypto && lastTradingDay
      ? lastTradingDay.close
      : priceMeta?.regularMarketPrice ?? chartRes.meta?.regularMarketPrice ?? lastTradingDay?.close ?? null;

  // Accurate ATH & ATL across full history (since 2000)
  let ath = -Infinity, athDate = "";
  let atl = Infinity,  atlDate = "";

  // Monthly date formatter for ATH/ATL — only month precision
  const monthlyDateFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: exchangeTz,
    year: "numeric",
    month: "2-digit",
  });

  if (chartMonthly?.quotes && chartMonthly.quotes.length > 0) {
    const isForexOrGold = symbol.endsWith("=X") || symbol === "GC=F";

    for (const q of chartMonthly.quotes) {
      if (q.high == null || q.low == null) continue;

      // Filter bad-tick data anomalies (e.g. Nov 2007 USDJPY 635.03 glitch in Yahoo Finance)
      // For major Forex/Gold, a single monthly wick > 1.8x open/close or < 0.2x is an erroneous feed tick
      const open = q.open ?? q.close ?? 0;
      const close = q.close ?? 0;
      const refPrice = Math.max(open, close);
      const minRefPrice = Math.min(open, close);

      const isBadHighSpike = isForexOrGold && refPrice > 0 && q.high > refPrice * 1.8;
      const isBadLowSpike = isForexOrGold && minRefPrice > 0 && q.low < minRefPrice * 0.2;

      const validHigh = isBadHighSpike ? refPrice : q.high;
      const validLow = isBadLowSpike ? minRefPrice : q.low;

      if (validHigh > ath) {
        ath = validHigh;
        try {
          const d = q.date instanceof Date ? q.date : new Date(q.date);
          athDate = monthlyDateFmt.format(d); // "YYYY-MM"
        } catch { athDate = ""; }
      }
      if (validLow < atl) {
        atl = validLow;
        try {
          const d = q.date instanceof Date ? q.date : new Date(q.date);
          atlDate = monthlyDateFmt.format(d); // "YYYY-MM"
        } catch { atlDate = ""; }
      }
    }
  }

  let athVal: number | null = ath !== -Infinity ? ath : null;
  let atlVal: number | null = atl !== Infinity  ? atl : null;

  // Fallbacks if monthly chart unavailable
  if (athVal == null) {
    athVal = summary?.allTimeHigh ?? summary?.fiftyTwoWeekHigh ?? (ytdHigh !== -Infinity ? ytdHigh : null);
    athDate = ytdHighDate;
  }
  if (atlVal == null) {
    atlVal = summary?.fiftyTwoWeekLow ?? (ytdLow !== Infinity ? ytdLow : null);
    atlDate = ytdLowDate;
  }

  const validYtdHigh   = ytdHigh   !== -Infinity ? ytdHigh   : null;
  const validYtdLow    = ytdLow    !== Infinity  ? ytdLow    : null;
  const validMonthHigh = monthHigh !== -Infinity ? monthHigh : validYtdHigh;
  const validMonthLow  = monthLow  !== Infinity  ? monthLow  : validYtdLow;
  const validWeekHigh  = weekHigh  !== -Infinity ? weekHigh  : validMonthHigh;
  const validWeekLow   = weekLow   !== Infinity  ? weekLow   : validMonthLow;

  // Fallback dates
  if (!monthHighDate) monthHighDate = ytdHighDate;
  if (!monthLowDate)  monthLowDate  = ytdLowDate;
  if (!weekHighDate)  weekHighDate  = monthHighDate;
  if (!weekLowDate)   weekLowDate   = monthLowDate;

  const todayDate = lastTradingDay?.dateStr ?? null;

  return {
    symbol,
    currency,
    currentPrice,
    allTime:   { high: athVal,          highDate: athDate || null,       low: atlVal,          lowDate: atlDate || null },
    thisYear:  { high: validYtdHigh,    highDate: ytdHighDate  || null,  low: validYtdLow,     lowDate: ytdLowDate  || null },
    thisMonth: { high: validMonthHigh,  highDate: monthHighDate || null, low: validMonthLow,   lowDate: monthLowDate || null },
    thisWeek:  { high: validWeekHigh,   highDate: weekHighDate  || null, low: validWeekLow,    lowDate: weekLowDate  || null },
    today:     { high: todayHigh,       highDate: todayDate,             low: todayLow,         lowDate: todayDate },
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

/**
 * Extend tanggal akhir ke depan +2 hari karena parameter period2 pada Yahoo Finance
 * chart bersifat eksklusif (T00:00:00Z) sehingga bisa memotong sesi trading hari terakhir
 * jika pasar berada di timezone positif (seperti Asia/Jakarta UTC+7).
 */
function getExtendedTo(to: string): string {
  const d = new Date(to + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 2);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Mengambil data musiman tahunan (Yearly Seasonality Matrix: Jan - Dec)
 * dari Yahoo Finance.
 * Menggunakan agregasi data harian ('1d') agar tidak ada bulan yang hilang
 * pada instrumen komoditas/futures seperti Gold (GC=F) akibat siklus rollover kontrak.
 * @param symbol - Simbol instrumen
 * @param yearsBack - Jumlah tahun ke belakang (default: 8 tahun)
 */
export async function fetchSeasonality(
  symbol: string,
  yearsBack: number = 8
): Promise<SeasonalityResponse> {
  const currentYear = new Date().getUTCFullYear();
  const startYear = currentYear - yearsBack + 1; // e.g. 2026 - 8 + 1 = 2019
  const fromDate = `${startYear}-01-01`;
  const toDate = `${currentYear}-12-31`;

  const result = await yahooFinance.chart(symbol, {
    period1: fromDate,
    period2: toDate,
    interval: "1d",
    includePrePost: false,
  });

  if (!result || !result.quotes || result.quotes.length === 0) {
    throw new Error(`No seasonality data found for symbol: ${symbol}`);
  }

  const exchangeTz = result.meta?.exchangeTimezoneName || "UTC";
  const dateFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: exchangeTz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Group quotes by year and month
  // Map: year -> Map: monthIndex (0..11) -> Array of { open, close, dateStr }
  const monthQuotesMap = new Map<number, Map<number, { open: number; close: number; dateStr: string }[]>>();

  for (let y = currentYear; y >= startYear; y--) {
    monthQuotesMap.set(y, new Map());
  }

  for (const q of result.quotes) {
    if (!q.date || q.close == null) continue;
    const rawDate = q.date instanceof Date ? q.date : new Date(q.date);
    const dateStr = dateFmt.format(rawDate);
    const [yStr, mStr] = dateStr.split("-");
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10) - 1; // 0-indexed

    if (!monthQuotesMap.has(year)) {
      monthQuotesMap.set(year, new Map());
    }
    const yearMonths = monthQuotesMap.get(year)!;
    if (!yearMonths.has(month)) {
      yearMonths.set(month, []);
    }
    yearMonths.get(month)!.push({
      dateStr,
      open: q.open ?? q.close,
      close: q.close,
    });
  }

  // Map: year -> array of 12 MonthReturn or null
  const yearsMap = new Map<number, (MonthReturn | null)[]>();

  for (let y = currentYear; y >= startYear; y--) {
    const monthsArr: (MonthReturn | null)[] = Array(12).fill(null);
    const yearMonths = monthQuotesMap.get(y);

    if (yearMonths) {
      for (let m = 0; m < 12; m++) {
        const quotes = yearMonths.get(m);
        if (quotes && quotes.length > 0) {
          quotes.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
          const first = quotes[0];
          const last = quotes[quotes.length - 1];
          const open = first.open;
          const close = last.close;
          let changePercent = 0;
          if (open !== 0) {
            changePercent = ((close - open) / open) * 100;
          }
          monthsArr[m] = {
            month: m,
            open,
            close,
            changePercent: Number(changePercent.toFixed(2)),
          };
        }
      }
    }
    yearsMap.set(y, monthsArr);
  }

  // Bangun array YearSeasonality (urut dari tahun terbaru ke terlama)
  const sortedYears = Array.from(yearsMap.keys()).sort((a, b) => b - a);
  const years: YearSeasonality[] = [];

  for (const year of sortedYears) {
    const months = yearsMap.get(year)!;
    const activeMonths = months.filter((m): m is MonthReturn => m !== null);

    // Abaikan tahun jika sama sekali tidak ada data
    if (activeMonths.length === 0) continue;

    // Hitung YTD Return untuk tahun tersebut: dari open bulan pertama yang ada ke close bulan terakhir
    let ytdReturn: number | null = null;
    const firstMonth = activeMonths[0];
    const lastMonth = activeMonths[activeMonths.length - 1];

    if (firstMonth && lastMonth && firstMonth.open !== 0) {
      const ytd = ((lastMonth.close - firstMonth.open) / firstMonth.open) * 100;
      ytdReturn = Number(ytd.toFixed(2));
    }

    years.push({
      year,
      months,
      ytdReturn,
    });
  }

  // Hitung rata-rata dan win rate per bulan (kolom Jan s.d. Dec)
  const monthlyAverages: (number | null)[] = Array(12).fill(null);
  const positiveWinRates: (number | null)[] = Array(12).fill(null);

  for (let m = 0; m < 12; m++) {
    const returnsForMonth: number[] = [];
    for (const yr of years) {
      const mr = yr.months[m];
      if (mr != null) {
        returnsForMonth.push(mr.changePercent);
      }
    }

    if (returnsForMonth.length > 0) {
      const sum = returnsForMonth.reduce((acc, val) => acc + val, 0);
      const avg = sum / returnsForMonth.length;
      monthlyAverages[m] = Number(avg.toFixed(2));

      const positiveCount = returnsForMonth.filter((r) => r > 0).length;
      const winRate = (positiveCount / returnsForMonth.length) * 100;
      positiveWinRates[m] = Number(winRate.toFixed(1));
    }
  }

  return {
    symbol,
    currency: result.meta?.currency ?? "USD",
    years,
    monthlyAverages,
    positiveWinRates,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Day-of-Week Seasonality
// ─────────────────────────────────────────────────────────────────────────────

// Mon=0 … Sun=6
const DOW_NAMES_ALL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DOW_SHORT_ALL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ISO_MAP: Record<string, number> = {
  Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4,
  Saturday: 5, Sunday: 6,
};

/**
 * Fetches ~5 years of daily data and aggregates by weekday.
 * Forex/Stocks: Mon–Fri (5 days). Crypto: Mon–Sun (7 days).
 */
export async function fetchDowSeasonality(
  symbol: string,
  yearsBack: number = 5
): Promise<DowSeasonalityResponse> {
  const instrument = getInstrument(symbol);
  const isCrypto = instrument?.category === "Crypto";

  const now = new Date();
  const toDate = now.toISOString().slice(0, 10);
  const fromYear = now.getUTCFullYear() - yearsBack + 1;
  const fromDate = `${fromYear}-01-01`;

  const result = await yahooFinance.chart(symbol, {
    period1: fromDate,
    period2: toDate,
    interval: "1d",
    includePrePost: false,
  });

  if (!result?.quotes?.length) {
    throw new Error(`No DOW data for ${symbol}`);
  }

  const currency = result.meta?.currency ?? "USD";
  const exchangeTz = result.meta?.exchangeTimezoneName || "UTC";

  const dateFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: exchangeTz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const weekdayNumFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: exchangeTz,
    weekday: "long",
  });

  // Buckets: 7 slots (Mon=0…Sun=6), Forex/Stocks only fills 0-4
  interface Bucket {
    changes: number[];
    nominalChanges: number[];
    best: { pct: number; date: string } | null;
    worst: { pct: number; date: string } | null;
  }
  const buckets: Bucket[] = Array.from({ length: 7 }, () => ({
    changes: [],
    nominalChanges: [],
    best: null,
    worst: null,
  }));

  // Build ordered quote map
  const quoteMap = new Map<string, { dateStr: string; close: number; change: number | null; changePercent: number | null; weekdayIdx: number }>();

  for (const q of result.quotes) {
    if (!q.date || q.close == null) continue;
    const rawDate = q.date instanceof Date ? q.date : new Date(q.date);
    const fullDay = weekdayNumFmt.format(rawDate);
    const weekdayIdx = ISO_MAP[fullDay] ?? -1;
    if (weekdayIdx < 0) continue;

    // For non-crypto, skip weekends
    if (!isCrypto && weekdayIdx >= 5) continue;

    const dateStr = dateFmt.format(rawDate);
    quoteMap.set(dateStr, {
      dateStr,
      close: q.close,
      change: null,
      changePercent: null,
      weekdayIdx,
    });
  }

  // Sort ascending, compute change vs previous session
  const sorted = Array.from(quoteMap.values()).sort((a, b) => a.dateStr.localeCompare(b.dateStr));

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    if (prev.close !== 0) {
      cur.change = cur.close - prev.close;
      cur.changePercent = (cur.change / prev.close) * 100;
    }
  }

  // Skip first entry (no previous close)
  for (let i = 1; i < sorted.length; i++) {
    const q = sorted[i];
    if (q.changePercent == null || q.change == null) continue;
    const bucket = buckets[q.weekdayIdx];
    bucket.changes.push(q.changePercent);
    bucket.nominalChanges.push(q.change);

    if (!bucket.best || q.changePercent > bucket.best.pct) {
      bucket.best = { pct: q.changePercent, date: q.dateStr };
    }
    if (!bucket.worst || q.changePercent < bucket.worst.pct) {
      bucket.worst = { pct: q.changePercent, date: q.dateStr };
    }
  }

  // Determine how many day slots to include
  const maxDays = isCrypto ? 7 : 5;

  // Aggregate
  const stats: DowDayStats[] = [];
  for (let idx = 0; idx < maxDays; idx++) {
    const b = buckets[idx];
    const count = b.changes.length;
    const avgChangePercent = count > 0 ? b.changes.reduce((s, v) => s + v, 0) / count : 0;
    const avgChange = count > 0 ? b.nominalChanges.reduce((s, v) => s + v, 0) / count : 0;
    const upDays = b.changes.filter((c) => c > 0).length;
    const downDays = b.changes.filter((c) => c < 0).length;
    const flatDays = count - upDays - downDays;
    const winRate = count > 0 ? (upDays / count) * 100 : 0;

    stats.push({
      dayIndex: idx,
      dayName: DOW_NAMES_ALL[idx],
      dayShort: DOW_SHORT_ALL[idx],
      count,
      avgChangePercent: Number(avgChangePercent.toFixed(3)),
      avgChange: Number(avgChange.toFixed(5)),
      winRate: Number(winRate.toFixed(1)),
      upDays,
      downDays,
      flatDays,
      bestChangePercent: b.best ? Number(b.best.pct.toFixed(3)) : 0,
      worstChangePercent: b.worst ? Number(b.worst.pct.toFixed(3)) : 0,
      bestDate: b.best?.date ?? "",
      worstDate: b.worst?.date ?? "",
    });
  }

  // Compute actual years span
  const firstDate = sorted[0]?.dateStr ?? fromDate;
  const lastDate = sorted[sorted.length - 1]?.dateStr ?? toDate;
  const firstYear = parseInt(firstDate.slice(0, 4), 10);
  const lastYear = parseInt(lastDate.slice(0, 4), 10);

  return {
    symbol,
    currency,
    fromDate: firstDate,
    toDate: lastDate,
    yearsOfData: lastYear - firstYear + 1,
    stats,
  };
}
