"use client";

import type { DailyPrice } from "@/lib/types";
import { type UnitMode, formatChangeByMode } from "@/lib/pips";

interface MonthlyPerformanceBarProps {
  data: DailyPrice[];
  currency: string;
  unitMode: UnitMode;
  symbol: string;
}

function formatCurrency(value: number, currency: string): string {
  let fractionDigits = 2;
  if (value >= 10000) fractionDigits = 0;
  else if (value >= 1000) fractionDigits = 2;
  else if (value >= 1) fractionDigits = 4;
  else fractionDigits = 6;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    return `${value.toFixed(fractionDigits)} ${currency}`;
  }
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MonthlyPerformanceBar({
  data,
  currency,
  unitMode,
  symbol,
}: MonthlyPerformanceBarProps) {
  if (!data || data.length === 0) return null;

  // Calculate Green / Red days
  let upDays = 0;
  let downDays = 0;
  let flatDays = 0;

  let bestDay: DailyPrice | null = null;
  let worstDay: DailyPrice | null = null;

  for (const day of data) {
    if (day.changePercent != null) {
      if (day.changePercent > 0) upDays++;
      else if (day.changePercent < 0) downDays++;
      else flatDays++;

      if (!bestDay || day.changePercent > (bestDay.changePercent ?? -Infinity)) {
        bestDay = day;
      }
      if (!worstDay || day.changePercent < (worstDay.changePercent ?? Infinity)) {
        worstDay = day;
      }
    }
  }

  const totalTradingDays = data.length;
  const winRate =
    totalTradingDays > 0 ? (upDays / totalTradingDays) * 100 : 0;

  // Total Month Return
  const firstDay = data[0];
  const lastDay = data[data.length - 1];

  let monthChange: number | null = null;
  let monthReturnPercent: number | null = null;

  if (firstDay && lastDay) {
    const basePrice = firstDay.previousClose ?? firstDay.open;
    if (basePrice !== 0) {
      monthChange = lastDay.close - basePrice;
      monthReturnPercent = (monthChange / basePrice) * 100;
    }
  }

  const isPositive = monthReturnPercent != null && monthReturnPercent > 0;
  const isNegative = monthReturnPercent != null && monthReturnPercent < 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800">
        {/* Month Return */}
        <div className="flex flex-col justify-between pt-2 sm:pt-0 sm:px-4 first:sm:pl-1">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Month Return
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-lg sm:text-xl font-bold font-mono ${
                isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : isNegative
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {formatChangeByMode(monthChange, monthReturnPercent, symbol, currency, unitMode)}
            </span>
            {unitMode === "percent" && monthChange != null && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                ({isPositive ? "+" : ""}
                {formatCurrency(monthChange, currency)})
              </span>
            )}
          </div>
        </div>

        {/* Win Rate & Day Ratio */}
        <div className="flex flex-col justify-between pt-2 sm:pt-0 sm:px-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Win Rate
            </span>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {winRate.toFixed(1)}%
            </span>
          </div>
          <div className="mt-1 flex flex-col items-start">
            {/* Mini Progress Bar for Up vs Down - shortened & left aligned */}
            <div className="h-2 w-28 sm:w-32 max-w-[130px] bg-rose-100 dark:bg-rose-950/60 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${winRate}%` }}
                title={`${upDays} Up Days (${winRate.toFixed(1)}%)`}
              />
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                ▲ {upDays} Up
              </span>
              {flatDays > 0 && <span>• {flatDays} Flat</span>}
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                ▼ {downDays} Down
              </span>
            </div>
          </div>
        </div>

        {/* Best Day */}
        <div className="flex flex-col justify-between pt-2 sm:pt-0 sm:px-4">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Best Session
          </span>
          {bestDay && bestDay.changePercent != null ? (
            <div className="mt-1">
              <span className="text-sm sm:text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatChangeByMode(bestDay.change, bestDay.changePercent, symbol, currency, unitMode)}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1.5">
                ({formatDateShort(bestDay.date)})
              </span>
            </div>
          ) : (
            <span className="text-xs text-zinc-400 mt-1">-</span>
          )}
        </div>

        {/* Worst Day */}
        <div className="flex flex-col justify-between pt-2 sm:pt-0 sm:px-4">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Worst Session
          </span>
          {worstDay && worstDay.changePercent != null ? (
            <div className="mt-1">
              <span className="text-sm sm:text-base font-bold font-mono text-rose-600 dark:text-rose-400">
                {formatChangeByMode(worstDay.change, worstDay.changePercent, symbol, currency, unitMode)}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1.5">
                ({formatDateShort(worstDay.date)})
              </span>
            </div>
          ) : (
            <span className="text-xs text-zinc-400 mt-1">-</span>
          )}
        </div>
      </div>
    </div>
  );
}
