"use client";

import type { DailyPrice, WeeklySummary } from "@/lib/types";
import { XIcon, TrendUpIcon, TrendDownIcon } from "./icons";

interface DayDetailProps {
  day?: DailyPrice | null;
  week?: WeeklySummary | null;
  currency: string;
  symbol: string;
  onClose: () => void;
}

function formatNumber(value: number, currency: string): string {
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

function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)}B`;
  }
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(2)}M`;
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(2)}K`;
  }
  return volume.toLocaleString();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DayDetail({
  day,
  week,
  currency,
  symbol,
  onClose,
}: DayDetailProps) {
  const isWeekly = Boolean(week);
  const data = week ?? day;

  if (!data) return null;

  const isPositive = data.changePercent != null && data.changePercent > 0;
  const isNegative = data.changePercent != null && data.changePercent < 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700 ${
          isPositive
            ? "bg-emerald-50 dark:bg-emerald-950/30"
            : isNegative
            ? "bg-red-50 dark:bg-red-950/30"
            : "bg-zinc-50 dark:bg-zinc-800/50"
        }`}
      >
        <div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono mb-0.5">
            <span>{symbol}</span>
            {isWeekly && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Weekly Summary
              </span>
            )}
          </div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {isWeekly && week
              ? `${week.label} (${week.dateRange})`
              : day
              ? formatDate(day.date)
              : ""}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-500"
          aria-label="Close"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Price Summary */}
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {formatNumber(data.close, currency)}
          </span>
          {data.changePercent != null && (
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${
                isPositive
                  ? "text-emerald-600"
                  : isNegative
                  ? "text-red-500"
                  : "text-zinc-500"
              }`}
            >
              {isPositive ? (
                <TrendUpIcon className="w-4 h-4" />
              ) : isNegative ? (
                <TrendDownIcon className="w-4 h-4" />
              ) : null}
              <span>
                {isPositive ? "+" : ""}
                {data.changePercent.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        {data.change != null && (
          <div
            className={`text-xs mt-0.5 ${
              isPositive
                ? "text-emerald-600"
                : isNegative
                ? "text-red-500"
                : "text-zinc-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {formatNumber(data.change, currency)}
            {isWeekly ? " (Weekly Change)" : " (Daily Change)"}
          </div>
        )}
      </div>

      {/* OHLC table */}
      <div className="p-4 space-y-2">
        {[
          { label: isWeekly ? "Week Open" : "Open", value: data.open },
          { label: isWeekly ? "Week High" : "High", value: data.high },
          { label: isWeekly ? "Week Low" : "Low", value: data.low },
          { label: isWeekly ? "Week Close" : "Close", value: data.close },
          ...(data.previousClose != null
            ? [
                {
                  label: isWeekly ? "Prev. Week Close" : "Previous Close",
                  value: data.previousClose,
                },
              ]
            : []),
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-center">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {row.label}
            </span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 font-mono">
              {formatNumber(row.value, currency)}
            </span>
          </div>
        ))}

        {isWeekly && week && (
          <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Trading Days
            </span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 font-mono">
              {week.tradingDays} days
            </span>
          </div>
        )}

        {data.volume != null && (
          <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {isWeekly ? "Total Volume" : "Volume"}
            </span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 font-mono">
              {formatVolume(data.volume)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
