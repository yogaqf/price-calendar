"use client";

import { useState } from "react";
import type { SeasonalityResponse, MonthReturn } from "@/lib/types";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface SeasonalityMatrixProps {
  data: SeasonalityResponse | null;
  loading: boolean;
  onSelectMonth?: (year: number, month: number) => void;
}

function getCellColorClass(pct: number | null): string {
  if (pct == null) {
    return "bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-300 dark:text-zinc-600";
  }

  if (pct > 0) {
    if (pct >= 15) {
      return "bg-emerald-500/25 text-emerald-800 dark:bg-emerald-500/30 dark:text-emerald-200 font-bold";
    }
    if (pct >= 5) {
      return "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-medium";
    }
    return "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
  }

  if (pct < 0) {
    if (pct <= -15) {
      return "bg-red-500/25 text-red-800 dark:bg-red-500/30 dark:text-red-200 font-bold";
    }
    if (pct <= -5) {
      return "bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-300 font-medium";
    }
    return "bg-red-500/10 text-red-600 dark:bg-red-500/10 dark:text-red-400";
  }

  return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
}

function formatPercent(val: number | null): string {
  if (val == null) return "-";
  const prefix = val > 0 ? "+" : "";
  return `${prefix}${val.toFixed(1)}%`;
}

export default function SeasonalityMatrix({
  data,
  loading,
  onSelectMonth,
}: SeasonalityMatrixProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    year: number;
    month: number;
    mr: MonthReturn;
  } | null>(null);

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-72 bg-zinc-100 dark:bg-zinc-800/60 rounded animate-pulse" />
          </div>
          <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
        </div>
        <div className="h-64 bg-zinc-50 dark:bg-zinc-800/20 rounded-xl border border-zinc-100 dark:border-zinc-800 animate-pulse" />
      </div>
    );
  }

  if (!data || data.years.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden transition-all">
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-50/60 dark:bg-zinc-900/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🗓️</span>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
              Yearly Seasonality Matrix
            </h3>
            <span className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium border border-indigo-100 dark:border-indigo-900/40">
              {data.years.length} Years
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Historical monthly return (Jan – Dec) and win rate. Click any cell to jump to that month in the calendar.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono flex-wrap">
          <span className="text-[10px] uppercase font-semibold text-zinc-400">Heatmap:</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> &gt; +5%
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/25" /> 0% to +5%
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-red-500/25" /> 0% to -5%
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-red-500" /> &lt; -5%
          </span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-center border-collapse">
          {/* Table Head */}
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3 text-left sticky left-0 bg-zinc-50 dark:bg-zinc-800/40 z-10 border-r border-zinc-200 dark:border-zinc-800">
                Year
              </th>
              {MONTH_NAMES.map((m) => (
                <th key={m} className="py-2.5 px-2 font-semibold min-w-[56px]">
                  {m}
                </th>
              ))}
              <th className="py-2.5 px-3 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-800/60 font-bold min-w-[64px]">
                YTD
              </th>
            </tr>
          </thead>

          {/* Table Body (Years) */}
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
            {data.years.map((yearRow) => (
              <tr
                key={yearRow.year}
                className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
              >
                {/* Year Label */}
                <td className="py-2.5 px-3 font-bold text-left text-zinc-800 dark:text-zinc-200 sticky left-0 bg-white dark:bg-zinc-900 z-10 border-r border-zinc-200 dark:border-zinc-800">
                  {yearRow.year}
                </td>

                {/* 12 Months */}
                {yearRow.months.map((mReturn, mIdx) => {
                  const cellColor = getCellColorClass(mReturn ? mReturn.changePercent : null);
                  const isInteractive = mReturn !== null && onSelectMonth !== undefined;

                  return (
                    <td
                      key={`m-${yearRow.year}-${mIdx}`}
                      onClick={() => {
                        if (isInteractive) {
                          onSelectMonth(yearRow.year, mIdx);
                        }
                      }}
                      onMouseEnter={() => {
                        if (mReturn) {
                          setHoveredCell({
                            year: yearRow.year,
                            month: mIdx,
                            mr: mReturn,
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={
                        mReturn
                          ? `${MONTH_NAMES[mIdx]} ${yearRow.year}: ${formatPercent(mReturn.changePercent)} (Open: ${mReturn.open.toFixed(2)}, Close: ${mReturn.close.toFixed(2)})`
                          : undefined
                      }
                      className={`
                        py-2 px-1 text-[11px] transition-all relative
                        ${cellColor}
                        ${
                          isInteractive
                            ? "cursor-pointer hover:ring-2 hover:ring-inset hover:ring-blue-500 hover:z-10"
                            : "cursor-default"
                        }
                      `}
                    >
                      {mReturn ? formatPercent(mReturn.changePercent) : "-"}
                    </td>
                  );
                })}

                {/* YTD Return */}
                <td
                  className={`
                    py-2 px-2 text-[11px] font-bold border-l border-zinc-200 dark:border-zinc-800
                    ${getCellColorClass(yearRow.ytdReturn)}
                  `}
                >
                  {formatPercent(yearRow.ytdReturn)}
                </td>
              </tr>
            ))}
          </tbody>

          {/* Table Footer: Monthly Averages & Win Rate */}
          <tfoot className="border-t-2 border-zinc-300 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-800/50 font-mono text-xs">
            {/* Average Return Row */}
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <td className="py-2.5 px-3 text-left font-bold text-zinc-900 dark:text-zinc-100 sticky left-0 bg-zinc-50 dark:bg-zinc-800/80 z-10 border-r border-zinc-200 dark:border-zinc-800">
                Avg Return
              </td>
              {data.monthlyAverages.map((avg, idx) => (
                <td
                  key={`avg-${idx}`}
                  className={`py-2 px-1 font-semibold text-[11px] ${getCellColorClass(avg)}`}
                  title={`Average return for ${MONTH_NAMES[idx]}: ${formatPercent(avg)}`}
                >
                  {formatPercent(avg)}
                </td>
              ))}
              <td className="py-2 px-2 font-bold border-l border-zinc-200 dark:border-zinc-800 text-zinc-400">
                -
              </td>
            </tr>

            {/* Win Rate Row (% of years that were positive) */}
            <tr>
              <td className="py-2.5 px-3 text-left font-bold text-zinc-900 dark:text-zinc-100 sticky left-0 bg-zinc-50 dark:bg-zinc-800/80 z-10 border-r border-zinc-200 dark:border-zinc-800">
                Win Rate
              </td>
              {data.positiveWinRates.map((winRate, idx) => {
                let badgeClass = "text-zinc-500 dark:text-zinc-400";
                if (winRate != null) {
                  if (winRate >= 60) {
                    badgeClass = "text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/10";
                  } else if (winRate <= 40) {
                    badgeClass = "text-red-700 dark:text-red-300 font-bold bg-red-500/10";
                  }
                }

                return (
                  <td
                    key={`win-${idx}`}
                    className={`py-2 px-1 text-[11px] font-medium ${badgeClass}`}
                    title={`${winRate != null ? winRate.toFixed(1) : "-"}% of past years had a positive ${MONTH_NAMES[idx]}`}
                  >
                    {winRate != null ? `${winRate.toFixed(0)}%` : "-"}
                  </td>
                );
              })}
              <td className="py-2 px-2 font-bold border-l border-zinc-200 dark:border-zinc-800 text-zinc-400">
                -
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Bottom Info Status Bar - permanently visible, updates on hover */}
      <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 min-h-[42px] transition-colors">
        {hoveredCell ? (
          <>
            <div className="truncate pr-2">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {MONTH_NAMES[hoveredCell.month]} {hoveredCell.year}:
              </span>{" "}
              Open{" "}
              <span className="font-mono text-zinc-700 dark:text-zinc-300">
                {hoveredCell.mr.open.toLocaleString("en-US", { maximumFractionDigits: 4 })}
              </span>
              {" · "}Close{" "}
              <span className="font-mono text-zinc-700 dark:text-zinc-300">
                {hoveredCell.mr.close.toLocaleString("en-US", { maximumFractionDigits: 4 })}
              </span>
              {" · "}Return{" "}
              <span
                className={`font-mono font-bold ${
                  hoveredCell.mr.changePercent > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : hoveredCell.mr.changePercent < 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {formatPercent(hoveredCell.mr.changePercent)}
              </span>
            </div>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">
              Click cell to open in Calendar ↗
            </span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 truncate">
              <span>💡</span>
              <span>Hover over any month cell to inspect Open, Close &amp; Return values. Click cell to jump to that month.</span>
            </div>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono hidden sm:inline whitespace-nowrap">
              Historical Seasonality
            </span>
          </>
        )}
      </div>
    </div>
  );
}
