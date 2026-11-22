import type {
  InstrumentStats,
  SeasonalityResponse,
  DowSeasonalityResponse,
  HistoryResponse,
} from "./types";
import { getInstrument } from "./instruments";

export type InsightType = "bullish" | "bearish" | "warning" | "neutral" | "highlight";

export interface InsightItem {
  id: string;
  type: InsightType;
  icon: string;
  title: string;
  summary: string;
  badge?: string;
}

export interface MarketInsights {
  overallBias: string;
  biasType: InsightType;
  items: InsightItem[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function generateMarketInsights(params: {
  symbol: string;
  year: number;
  month: number; // 0-indexed
  stats: InstrumentStats | null;
  seasonality: SeasonalityResponse | null;
  dow: DowSeasonalityResponse | null;
  historyData: HistoryResponse | null;
}): MarketInsights {
  const { symbol, month, stats, seasonality, dow, historyData } = params;
  const instrument = getInstrument(symbol);
  const items: InsightItem[] = [];

  const monthName = MONTH_NAMES[month];

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Price Location & Extremes
  // ─────────────────────────────────────────────────────────────────────────────
  if (stats && stats.currentPrice != null) {
    const cp = stats.currentPrice;

    // Check All-Time Range
    if (stats.allTime.high != null && stats.allTime.low != null && stats.allTime.high > stats.allTime.low) {
      const allTimePct = ((cp - stats.allTime.low) / (stats.allTime.high - stats.allTime.low)) * 100;
      if (allTimePct >= 88) {
        items.push({
          id: "ath-extreme",
          type: "warning",
          icon: "⚠️",
          title: "Near All-Time High Extension",
          badge: `${allTimePct.toFixed(0)}% ATH Range`,
          summary: `Trading at ${allTimePct.toFixed(0)}% of its multi-decade range, testing historical peak levels. Watch for resistance and heightened volatility.`,
        });
      } else if (allTimePct <= 15) {
        items.push({
          id: "atl-extreme",
          type: "highlight",
          icon: "🛡️",
          title: "Near Historic Multi-Year Low",
          badge: `${allTimePct.toFixed(0)}% ATH Range`,
          summary: `Trading at only ${allTimePct.toFixed(0)}% of its historic range, hovering near long-term valuation support.`,
        });
      }
    }

    // Check YTD / 1-Year Range
    if (stats.thisYear.high != null && stats.thisYear.low != null && stats.thisYear.high > stats.thisYear.low) {
      const ytdPct = ((cp - stats.thisYear.low) / (stats.thisYear.high - stats.thisYear.low)) * 100;
      if (ytdPct >= 85 && !items.some((i) => i.id === "ath-extreme")) {
        items.push({
          id: "ytd-high",
          type: "bullish",
          icon: "📈",
          title: "Upper Annual Range",
          badge: `${ytdPct.toFixed(0)}% YTD`,
          summary: `Price is positioned at ${ytdPct.toFixed(0)}% of its 1-year range, showing strong year-to-date momentum.`,
        });
      } else if (ytdPct <= 20 && !items.some((i) => i.id === "atl-extreme")) {
        items.push({
          id: "ytd-low",
          type: "bearish",
          icon: "📉",
          title: "Lower Annual Range",
          badge: `${ytdPct.toFixed(0)}% YTD`,
          summary: `Price is lingering at ${ytdPct.toFixed(0)}% of its 1-year range, indicating persistent downside pressure or value accumulation.`,
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Monthly Seasonality Tendency (Jan - Dec)
  // ─────────────────────────────────────────────────────────────────────────────
  if (seasonality && seasonality.monthlyAverages && seasonality.positiveWinRates) {
    const avgReturn = seasonality.monthlyAverages[month];
    const winRate = seasonality.positiveWinRates[month];

    if (winRate != null && avgReturn != null) {
      if (winRate >= 70) {
        items.push({
          id: "seasonal-strong",
          type: "bullish",
          icon: "🚀",
          title: `Strong ${monthName} Seasonality`,
          badge: `${winRate.toFixed(0)}% Win Rate`,
          summary: `Historically in ${monthName}, ${instrument?.name ?? symbol} has closed green in ${winRate.toFixed(0)}% of years with an average return of +${avgReturn.toFixed(2)}%.`,
        });
      } else if (winRate <= 35) {
        items.push({
          id: "seasonal-weak",
          type: "bearish",
          icon: "❄️",
          title: `Challenging ${monthName} Seasonality`,
          badge: `${winRate.toFixed(0)}% Win Rate`,
          summary: `Historically, ${monthName} has been a difficult month with only a ${winRate.toFixed(0)}% win rate and an average return of ${avgReturn.toFixed(2)}%.`,
        });
      } else {
        items.push({
          id: "seasonal-neutral",
          type: "neutral",
          icon: "🗓️",
          title: `${monthName} Historical Profile`,
          badge: `${winRate.toFixed(0)}% Win Rate`,
          summary: `In ${monthName}, average historical return is ${avgReturn >= 0 ? "+" : ""}${avgReturn.toFixed(2)}% with a ${winRate.toFixed(0)}% positive closing frequency over ${seasonality.years.length} years.`,
        });
      }
    }

    // Best and Worst months overall
    const validMonths = seasonality.monthlyAverages
      .map((avg, idx) => ({ month: idx, avg: avg ?? 0, winRate: seasonality.positiveWinRates[idx] ?? 0 }))
      .filter((m) => seasonality.monthlyAverages[m.month] != null);

    if (validMonths.length >= 6) {
      validMonths.sort((a, b) => b.avg - a.avg);
      const best = validMonths[0];
      const worst = validMonths[validMonths.length - 1];

      if (best && worst && best.month !== month && worst.month !== month) {
        items.push({
          id: "best-worst-months",
          type: "highlight",
          icon: "🏆",
          title: "Yearly Best vs Worst Months",
          summary: `Across all 12 months, ${MONTH_NAMES[best.month]} is statistically the strongest (+${best.avg.toFixed(1)}% avg), while ${MONTH_NAMES[worst.month]} is the weakest (${worst.avg.toFixed(1)}% avg).`,
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Day of Week Edge (Mon - Fri / Mon - Sun)
  // ─────────────────────────────────────────────────────────────────────────────
  if (dow && dow.stats && dow.stats.length >= 5) {
    const sortedDays = [...dow.stats].sort((a, b) => b.avgChangePercent - a.avgChangePercent);
    const bestDay = sortedDays[0];
    const worstDay = sortedDays[sortedDays.length - 1];

    if (bestDay && worstDay) {
      items.push({
        id: "dow-edge",
        type: bestDay.avgChangePercent > 0 ? "bullish" : "neutral",
        icon: "⚡",
        title: `Day-of-Week Edge: ${bestDay.dayName}`,
        badge: `Best: ${bestDay.dayShort}`,
        summary: `${bestDay.dayName} has been the most consistent session (avg ${bestDay.avgChangePercent > 0 ? "+" : ""}${bestDay.avgChangePercent.toFixed(2)}%, ${bestDay.winRate.toFixed(0)}% win rate), while ${worstDay.dayName} historically experiences more selling pressure (avg ${worstDay.avgChangePercent.toFixed(2)}%).`,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Current Calendar Month Momentum
  // ─────────────────────────────────────────────────────────────────────────────
  if (historyData && historyData.data && historyData.data.length > 0) {
    const validDays = historyData.data.filter((d) => d.changePercent != null);
    const upDays = validDays.filter((d) => (d.changePercent ?? 0) > 0).length;
    const downDays = validDays.filter((d) => (d.changePercent ?? 0) < 0).length;
    const totalDays = validDays.length;

    if (totalDays >= 3) {
      const winRate = (upDays / totalDays) * 100;
      const firstClose = validDays[0]?.previousClose ?? validDays[0]?.open ?? 0;
      const lastClose = validDays[validDays.length - 1]?.close ?? 0;
      let monthReturn = 0;
      if (firstClose > 0) {
        monthReturn = ((lastClose - firstClose) / firstClose) * 100;
      }

      if (winRate >= 60) {
        items.push({
          id: "current-momentum",
          type: "bullish",
          icon: "🔥",
          title: "Active Session Momentum",
          badge: `${winRate.toFixed(0)}% Win Rate`,
          summary: `Current month is running bullish with ${upDays} green sessions vs ${downDays} red sessions (${winRate.toFixed(0)}% win rate, ${monthReturn >= 0 ? "+" : ""}${monthReturn.toFixed(2)}% month-to-date).`,
        });
      } else if (winRate <= 40) {
        items.push({
          id: "current-momentum-bear",
          type: "bearish",
          icon: "🌧️",
          title: "Active Session Pressure",
          badge: `${winRate.toFixed(0)}% Win Rate`,
          summary: `Current month shows selling dominance with ${downDays} red sessions vs ${upDays} green sessions (${winRate.toFixed(0)}% win rate, ${monthReturn >= 0 ? "+" : ""}${monthReturn.toFixed(2)}% month-to-date).`,
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Determine Overall Market Bias Badge
  // ─────────────────────────────────────────────────────────────────────────────
  let bullishPoints = 0;
  let bearishPoints = 0;

  for (const item of items) {
    if (item.type === "bullish") bullishPoints++;
    if (item.type === "bearish") bearishPoints++;
  }

  let overallBias = "Neutral Bias";
  let biasType: InsightType = "neutral";

  if (items.some((i) => i.id === "ath-extreme")) {
    overallBias = "Extended Near ATH";
    biasType = "warning";
  } else if (bullishPoints > bearishPoints) {
    overallBias = "Bullish Edge";
    biasType = "bullish";
  } else if (bearishPoints > bullishPoints) {
    overallBias = "Bearish Tendency";
    biasType = "bearish";
  }

  return {
    overallBias,
    biasType,
    items,
  };
}
