"use client";

import { useId } from "react";
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

function formatExtremeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  // Monthly candle format "YYYY-MM" (e.g. from ATH / ATL)
  if (dateStr.length === 7) {
    const [y, m] = dateStr.split("-");
    const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }
  // Daily date format "YYYY-MM-DD"
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface RightTriangleRangeProps {
  percentPos: number;
  high: number | null;
  low: number | null;
  currentPrice: number | null;
  currency: string;
  isAllTime?: boolean;
}

function RightTriangleRange({
  percentPos,
  high,
  low,
  currentPrice,
  currency,
  isAllTime,
}: RightTriangleRangeProps) {
  const reactId = useId();
  const gradId = "tri-grad-" + reactId.replace(/:/g, "");
  const clamped = Math.min(100, Math.max(0, percentPos));

  // Taller slope coordinates in viewBox="0 0 200 66"
  // Low (left): X=10, Y=56
  // High (right): X=190, Y=18
  // Base line: Y=56
  const x = 10 + (clamped / 100) * 180;
  const y = 56 - (clamped / 100) * 38;

  // Horizontal clamp for the floating % label so it doesn't clip on edges
  const labelX = Math.max(16, Math.min(184, x));
  const labelY = y - 7;

  return (
    <div className="w-full mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
      {/* Top Labels: Low di kiri, High di kanan */}
      <div className="flex justify-between items-center text-[10px] mb-1 font-mono leading-none">
        <span
          className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-0.5 truncate"
          title={`Low: ${formatStatPrice(low, currency)}`}
        >
          <span>▼</span>
          <span>{formatStatPrice(low, currency)}</span>
        </span>

        <span
          className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 truncate ml-auto"
          title={`High: ${formatStatPrice(high, currency)}`}
        >
          <span>▲</span>
          <span>{formatStatPrice(high, currency)}</span>
        </span>
      </div>

      {/* Visual Segitiga Siku-siku dengan label % melayang tepat di atas lingkaran pin */}
      <div className="w-full h-12 flex items-center justify-center">
        <svg
          viewBox="0 0 200 66"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
              {isAllTime ? (
                <>
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ea580c" stopOpacity="0.95" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.95" />
                </>
              )}
            </linearGradient>
          </defs>

          {/* Segitiga siku-siku latar belakang */}
          <path
            d="M 10 56 L 190 18 L 190 56 Z"
            className="fill-zinc-100 dark:fill-zinc-800/60 stroke-zinc-200 dark:stroke-zinc-700"
            strokeWidth="1"
            strokeLinejoin="round"
          />

          {/* Bagian segitiga yang terisi sesuai posisi Current Price */}
          {clamped > 0 && (
            <path
              d={`M 10 56 L ${x.toFixed(1)} ${y.toFixed(1)} L ${x.toFixed(1)} 56 Z`}
              fill={`url(#${gradId})`}
              className="transition-all duration-300"
            />
          )}

          {/* Garis vertikal putus-putus penanda posisi harga */}
          <line
            x1={x.toFixed(1)}
            y1={y.toFixed(1)}
            x2={x.toFixed(1)}
            y2="56"
            className="stroke-zinc-500 dark:stroke-zinc-400"
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />

          {/* Label % tepat di atas lingkaran pin */}
          <text
            x={labelX.toFixed(1)}
            y={labelY.toFixed(1)}
            textAnchor="middle"
            className="text-[9.5px] font-bold font-mono fill-zinc-900 dark:fill-zinc-100 select-none"
          >
            {clamped.toFixed(0)}%
          </text>

          {/* Titik Pin Current Price tepat di lereng segitiga */}
          <circle
            cx={x.toFixed(1)}
            cy={y.toFixed(1)}
            r="4.5"
            className="fill-white dark:fill-zinc-100 stroke-zinc-900 dark:stroke-zinc-900 transition-all duration-300 shadow-md"
            strokeWidth="2"
          />
          {/* Titik aksen di dalam pin */}
          <circle
            cx={x.toFixed(1)}
            cy={y.toFixed(1)}
            r="1.8"
            fill={isAllTime ? "#f59e0b" : clamped >= 60 ? "#10b981" : clamped <= 30 ? "#f43f5e" : "#f59e0b"}
          />
        </svg>
      </div>

      {/* Current Price di bawah agar clean & rapi */}
      {currentPrice != null && (
        <div className="flex items-center justify-center mt-1 text-[11px] font-mono leading-none">
          <span className="text-zinc-400 dark:text-zinc-500 mr-1 text-[10px] font-sans">
            Current:
          </span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            {formatStatPrice(currentPrice, currency)}
          </span>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  badge: string;
  icon: string;
  high: number | null;
  highDate?: string | null;
  low: number | null;
  lowDate?: string | null;
  currentPrice: number | null;
  currency: string;
  isAllTime?: boolean;
}

function StatCard({
  title,
  badge,
  icon,
  high,
  highDate,
  low,
  lowDate,
  currentPrice,
  currency,
  isAllTime,
}: StatCardProps) {
  // Calculate current price position within [low, high]
  let percentPos = 0;
  let hasRange = false;

  if (high != null && low != null) {
    hasRange = true;
    if (high > low && currentPrice != null) {
      percentPos = Math.min(100, Math.max(0, ((currentPrice - low) / (high - low)) * 100));
    } else if (high === low) {
      // Single price traded or market tick
      percentPos = 50;
    }
  }

  return (
    <div
      className={`rounded-xl border p-3 flex flex-col justify-between transition-all ${
        isAllTime
          ? "border-amber-300/80 bg-gradient-to-br from-amber-50/60 to-orange-50/40 dark:border-amber-900/50 dark:from-amber-950/20 dark:to-orange-950/10"
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
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="text-xs">▲</span> {isAllTime ? "ATH" : "High"}
            </span>
            {highDate && (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono leading-tight">
                {formatExtremeDate(highDate)}
              </span>
            )}
          </div>
          <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {formatStatPrice(high, currency)}
          </span>
        </div>

        {/* Low */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <span className="text-xs">▼</span> {isAllTime ? "ATL" : "Low"}
            </span>
            {lowDate && (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono leading-tight">
                {formatExtremeDate(lowDate)}
              </span>
            )}
          </div>
          <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {formatStatPrice(low, currency)}
          </span>
        </div>
      </div>

      {/* Visual Segitiga Siku-siku Range dengan Current Price Pin */}
      {hasRange && (
        <RightTriangleRange
          percentPos={percentPos}
          high={high}
          low={low}
          currentPrice={currentPrice}
          currency={currency}
          isAllTime={isAllTime}
        />
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
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 h-36 animate-pulse flex flex-col justify-between"
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
          highDate={stats.thisWeek.highDate}
          low={stats.thisWeek.low}
          lowDate={stats.thisWeek.lowDate}
          currentPrice={current}
          currency={cur}
        />

        {/* This Month */}
        <StatCard
          title="This Month"
          badge="Month"
          icon="🗓️"
          high={stats.thisMonth.high}
          highDate={stats.thisMonth.highDate}
          low={stats.thisMonth.low}
          lowDate={stats.thisMonth.lowDate}
          currentPrice={current}
          currency={cur}
        />

        {/* This Year */}
        <StatCard
          title="This Year"
          badge="YTD"
          icon="📈"
          high={stats.thisYear.high}
          highDate={stats.thisYear.highDate}
          low={stats.thisYear.low}
          lowDate={stats.thisYear.lowDate}
          currentPrice={current}
          currency={cur}
        />

        {/* All Time High & Low */}
        <StatCard
          title="All Time"
          badge="ATH / ATL"
          icon="🏆"
          high={stats.allTime.high}
          highDate={stats.allTime.highDate}
          low={stats.allTime.low}
          lowDate={stats.allTime.lowDate}
          currentPrice={current}
          currency={cur}
          isAllTime
        />
      </div>
    </section>
  );
}
