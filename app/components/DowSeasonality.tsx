"use client";

import type { DowSeasonalityResponse, DowDayStats } from "@/lib/types";
import { type UnitMode, formatChangeByMode } from "@/lib/pips";

interface DowSeasonalityProps {
  data: DowSeasonalityResponse | null;
  loading: boolean;
  unitMode: UnitMode;
  symbol: string;
}

function formatDateShort(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Strength bar: maps avgChangePercent to a capped visual width */
function StrengthBar({ avg, maxAbs }: { avg: number; maxAbs: number }) {
  const pct = maxAbs > 0 ? Math.min(100, (Math.abs(avg) / maxAbs) * 100) : 0;
  const isPos = avg >= 0;
  return (
    <div className="flex items-center gap-1.5 w-full">
      {/* Negative side */}
      <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full flex justify-end overflow-hidden">
        {!isPos && (
          <div
            className="h-full bg-rose-500 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
      {/* Center axis */}
      <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-600 flex-shrink-0" />
      {/* Positive side */}
      <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        {isPos && (
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  );
}

function DayCard({
  stat,
  maxAbsAvg,
  currency,
  unitMode,
  symbol,
}: {
  stat: DowDayStats;
  maxAbsAvg: number;
  currency: string;
  unitMode: UnitMode;
  symbol: string;
}) {
  const isPos = stat.avgChangePercent > 0;
  const isNeg = stat.avgChangePercent < 0;

  const avgLabel = formatChangeByMode(
    stat.avgChange,
    stat.avgChangePercent,
    symbol,
    currency,
    unitMode
  );
  const bestLabel = formatChangeByMode(
    null,
    stat.bestChangePercent,
    symbol,
    currency,
    unitMode
  );
  const worstLabel = formatChangeByMode(
    null,
    stat.worstChangePercent,
    symbol,
    currency,
    unitMode
  );

  return (
    <div
      className={`rounded-xl border p-3.5 flex flex-col gap-2.5 transition-all ${
        isPos
          ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20"
          : isNeg
          ? "border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20"
          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
      }`}
    >
      {/* Day header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {stat.dayName}
        </span>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
          {stat.count} sessions
        </span>
      </div>

      {/* Avg Return — prominent */}
      <div className="flex items-baseline gap-1.5">
        <span
          className={`text-xl font-bold font-mono tabular-nums ${
            isPos
              ? "text-emerald-600 dark:text-emerald-400"
              : isNeg
              ? "text-rose-600 dark:text-rose-400"
              : "text-zinc-500"
          }`}
        >
          {avgLabel}
        </span>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">avg</span>
      </div>

      {/* Bidirectional strength bar */}
      <StrengthBar avg={stat.avgChangePercent} maxAbs={maxAbsAvg} />

      {/* Win Rate */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">Win Rate</span>
          <span
            className={`font-bold ${
              stat.winRate >= 55
                ? "text-emerald-600 dark:text-emerald-400"
                : stat.winRate <= 45
                ? "text-rose-600 dark:text-rose-400"
                : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            {stat.winRate.toFixed(1)}%
          </span>
        </div>
        {/* Win Rate Bar */}
        <div className="h-1.5 w-full bg-rose-100 dark:bg-rose-950/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${stat.winRate}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            ▲ {stat.upDays}
          </span>
          {stat.flatDays > 0 && <span>• {stat.flatDays}</span>}
          <span className="text-rose-600 dark:text-rose-400 font-semibold">
            ▼ {stat.downDays}
          </span>
        </div>
      </div>

      {/* Best / Worst */}
      <div className="border-t border-zinc-200/80 dark:border-zinc-700/60 pt-2 space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-400 dark:text-zinc-500">Best</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              {bestLabel}
            </span>
            {stat.bestDate && (
              <span className="text-zinc-400 dark:text-zinc-500">
                {formatDateShort(stat.bestDate)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-400 dark:text-zinc-500">Worst</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
              {worstLabel}
            </span>
            {stat.worstDate && (
              <span className="text-zinc-400 dark:text-zinc-500">
                {formatDateShort(stat.worstDate)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton loader for day cards */
function DowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div
      className={`grid gap-3 ${
        count === 7
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7"
          : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
      }`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 h-52 animate-pulse"
        />
      ))}
    </div>
  );
}

export default function DowSeasonality({
  data,
  loading,
  unitMode,
  symbol,
}: DowSeasonalityProps) {
  if (loading && !data) return <DowSkeleton count={symbol.includes("BTC") || symbol.includes("ETH") || symbol.includes("SOL") ? 7 : 5} />;
  if (!data) return null;

  const isSevenDays = data.stats.length === 7;
  const currency = data.stats[0] ? "USD" : "USD"; // will be overridden by parent if needed
  const maxAbsAvg = Math.max(...data.stats.map((s) => Math.abs(s.avgChangePercent)), 0.001);

  // Rank days by avg return for the summary table
  const ranked = [...data.stats].sort((a, b) => b.avgChangePercent - a.avgChangePercent);
  const bestDayName = ranked[0]?.dayName ?? "-";
  const worstDayName = ranked[ranked.length - 1]?.dayName ?? "-";

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
            <span>📆</span> Day-of-Week Seasonality
          </h2>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
            Average daily performance {isSevenDays ? "Mon–Sun (24/7)" : "Mon–Fri"} · {data.yearsOfData} years of data
            <span className="ml-1 font-mono">
              ({data.fromDate.slice(0, 7)} → {data.toDate.slice(0, 7)})
            </span>
          </p>
        </div>
        {/* Quick summary badges */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
            💪 Strongest: {bestDayName}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold">
            💀 Weakest: {worstDayName}
          </span>
        </div>
      </div>

      {/* Day Cards */}
      <div
        className={`grid gap-3 ${
          isSevenDays
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
        }`}
      >
        {data.stats.map((stat) => (
          <DayCard
            key={stat.dayIndex}
            stat={stat}
            maxAbsAvg={maxAbsAvg}
            currency={data.currency}
            unitMode={unitMode}
            symbol={symbol}
          />
        ))}
      </div>

      {/* Summary Table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="grid grid-cols-6 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/40 px-4 py-2">
          <span>Day</span>
          <span className="text-right">Avg Return</span>
          <span className="text-right">Win Rate</span>
          <span className="text-right">Up</span>
          <span className="text-right">Down</span>
          <span className="text-right">Sessions</span>
        </div>
        {data.stats.map((stat, i) => {
          const isPos = stat.avgChangePercent > 0;
          const isNeg = stat.avgChangePercent < 0;
          const isBest = stat.dayName === bestDayName;
          const isWorst = stat.dayName === worstDayName;
          return (
            <div
              key={stat.dayIndex}
              className={`grid grid-cols-6 px-4 py-2.5 text-xs items-center ${
                i < data.stats.length - 1
                  ? "border-b border-zinc-100 dark:border-zinc-800"
                  : ""
              } ${isBest ? "bg-emerald-50/60 dark:bg-emerald-950/20" : isWorst ? "bg-rose-50/60 dark:bg-rose-950/20" : ""}`}
            >
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                {stat.dayName}
                {isBest && <span className="text-emerald-500">★</span>}
                {isWorst && <span className="text-rose-500">★</span>}
              </span>
              <span
                className={`text-right font-mono font-semibold ${
                  isPos
                    ? "text-emerald-600 dark:text-emerald-400"
                    : isNeg
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-zinc-500"
                }`}
              >
                {formatChangeByMode(stat.avgChange, stat.avgChangePercent, symbol, data.currency, unitMode)}
              </span>
              <span className="text-right font-mono text-zinc-700 dark:text-zinc-300">
                {stat.winRate.toFixed(1)}%
              </span>
              <span className="text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                {stat.upDays}
              </span>
              <span className="text-right text-rose-600 dark:text-rose-400 font-semibold">
                {stat.downDays}
              </span>
              <span className="text-right text-zinc-400 dark:text-zinc-500">
                {stat.count}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
