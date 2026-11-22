"use client";

import type { InstrumentStats } from "@/lib/types";

interface PriceStatsProps {
  stats: InstrumentStats | null;
  loading: boolean;
}

function formatStatPrice(value: number | null, currency: string): string {
  if (value == null) return "-";
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

interface StatCardProps {
  title: string;
  badge: string;
  icon: string;
  high: number | null;
  low: number | null;
  currentPrice: number | null;
  currency: string;
  isAllTime?: boolean;
}

function StatCard({
  title,
  badge,
  icon,
  high,
  low,
  currentPrice,
  currency,
  isAllTime,
}: StatCardProps) {
  // Calculate current price position within [low, high]
  let percentPos: number | null = null;
  if (currentPrice != null && high != null && low != null && high > low) {
    percentPos = Math.min(100, Math.max(0, ((currentPrice - low) / (high - low)) * 100));
  }

  return (
    <div
      className={`rounded-xl border p-3 flex flex-col justify-between transition-all ${
        isAllTime
          ? "border-amber-200/80 bg-gradient-to-br from-amber-50/60 to-orange-50/40 dark:border-amber-900/50 dark:from-amber-950/20 dark:to-orange-950/10"
          : "border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{icon}</span>
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
            {title}
          </span>
        </div>
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            isAllTime
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {badge}
        </span>
      </div>

      {/* High & Low Values */}
      <div className="space-y-1.5 my-1">
        {/* High */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="text-xs">▲</span> {isAllTime ? "ATH" : "High"}
          </span>
          <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {formatStatPrice(high, currency)}
          </span>
        </div>

        {/* Low */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-red-500 dark:text-red-400 flex items-center gap-1">
            <span className="text-xs">▼</span> {isAllTime ? "ATL" : "Low"}
          </span>
          <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {formatStatPrice(low, currency)}
          </span>
        </div>
      </div>

      {/* Mini Range Indicator */}
      {percentPos != null && (
        <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
            <span>Low</span>
            <span className="font-semibold text-zinc-600 dark:text-zinc-300">
              {percentPos.toFixed(0)}%
            </span>
            <span>High</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all ${
                isAllTime
                  ? "bg-gradient-to-r from-amber-400 to-orange-500"
                  : "bg-gradient-to-r from-red-400 via-amber-400 to-emerald-500"
              }`}
              style={{ width: `${percentPos}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function PriceStats({ stats, loading }: PriceStatsProps) {
  if (loading && !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 h-28 animate-pulse flex flex-col justify-between"
          >
            <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded" />
              <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cur = stats.currency;
  const current = stats.currentPrice;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
          <span>🎯</span> Price Extremes & Ranges
        </h2>
        {current != null && (
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            Current Price: <strong className="text-zinc-900 dark:text-zinc-100">{formatStatPrice(current, cur)}</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Today */}
        <StatCard
          title="Today"
          badge="Today"
          icon="⚡"
          high={stats.today.high}
          low={stats.today.low}
          currentPrice={current}
          currency={cur}
        />

        {/* This Week */}
        <StatCard
          title="This Week"
          badge="Week"
          icon="📅"
          high={stats.thisWeek.high}
          low={stats.thisWeek.low}
          currentPrice={current}
          currency={cur}
        />

        {/* This Month */}
        <StatCard
          title="This Month"
          badge="Month"
          icon="🗓️"
          high={stats.thisMonth.high}
          low={stats.thisMonth.low}
          currentPrice={current}
          currency={cur}
        />

        {/* This Year */}
        <StatCard
          title="This Year"
          badge="YTD"
          icon="📈"
          high={stats.thisYear.high}
          low={stats.thisYear.low}
          currentPrice={current}
          currency={cur}
        />

        {/* All Time High & Low */}
        <StatCard
          title="All Time"
          badge="ATH / ATL"
          icon="🏆"
          high={stats.allTime.high}
          low={stats.allTime.low}
          currentPrice={current}
          currency={cur}
          isAllTime
        />
      </div>
    </section>
  );
}
