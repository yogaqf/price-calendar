"use client";

import type { DailyPrice, HistoryResponse, WeeklySummary } from "@/lib/types";
import { type UnitMode, formatChangeByMode } from "@/lib/pips";

interface CalendarGridProps {
  year: number;
  month: number; // 0-indexed
  historyData: HistoryResponse | null;
  selectedDate: string | null;
  selectedWeekIndex: number | null;
  onSelectDate: (day: DailyPrice) => void;
  onSelectWeek: (week: WeeklySummary) => void;
  unitMode: UnitMode;
  symbol: string;
}

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Weekly"];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function formatPrice(value: number): string {
  if (value >= 10000) {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 0,
    });
  }
  if (value >= 1) {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 4,
      minimumFractionDigits: 2,
    });
  }
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 6,
  });
}


interface WeekRowData {
  weekIndex: number;
  days: (number | null)[];
  summary: WeeklySummary | null;
}

export default function CalendarGrid({
  year,
  month,
  historyData,
  selectedDate,
  selectedWeekIndex,
  onSelectDate,
  onSelectWeek,
  unitMode,
  symbol,
}: CalendarGridProps) {
  // Build lookup map: date string -> DailyPrice
  const priceMap = new Map<string, DailyPrice>();
  if (historyData) {
    for (const d of historyData.data) {
      priceMap.set(d.date, d);
    }
  }

  // Build calendar cells (Mon=0, ..., Sun=6)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Mon=0
  const daysInMonth = lastDay.getDate();

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  function getCellDate(day: number): string {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  }

  // Chunk cells into weekly rows of 7 days and compute weekly performance
  const weekRows: WeekRowData[] = [];

  for (let w = 0; w < cells.length; w += 7) {
    const weekDays = cells.slice(w, w + 7);
    const validDays = weekDays.filter((d): d is number => d !== null);

    const weekPrices: DailyPrice[] = [];
    for (const d of validDays) {
      const p = priceMap.get(getCellDate(d));
      if (p) weekPrices.push(p);
    }

    let summary: WeeklySummary | null = null;
    const weekIndex = Math.floor(w / 7);

    if (validDays.length > 0 && weekPrices.length > 0) {
      // Sort prices ascending by date
      weekPrices.sort((a, b) => a.date.localeCompare(b.date));

      const firstPrice = weekPrices[0];
      const lastPrice = weekPrices[weekPrices.length - 1];

      const high = Math.max(...weekPrices.map((p) => p.high));
      const low = Math.min(...weekPrices.map((p) => p.low));
      const open = firstPrice.open;
      const close = lastPrice.close;
      const previousClose = firstPrice.previousClose;

      let change: number | null = null;
      let changePercent: number | null = null;

      if (previousClose != null && previousClose !== 0) {
        change = close - previousClose;
        changePercent = (change / previousClose) * 100;
      } else if (open !== 0) {
        change = close - open;
        changePercent = (change / open) * 100;
      }

      let totalVolume: number | null = null;
      let hasVolume = false;
      for (const p of weekPrices) {
        if (p.volume != null) {
          totalVolume = (totalVolume ?? 0) + p.volume;
          hasVolume = true;
        }
      }
      if (!hasVolume) totalVolume = null;

      const firstNum = String(validDays[0]).padStart(2, "0");
      const lastNum = String(validDays[validDays.length - 1]).padStart(2, "0");
      const monthName = MONTH_SHORT[month];

      summary = {
        weekIndex,
        label: `Week ${weekIndex + 1}`,
        dateRange: `${firstNum} - ${lastNum} ${monthName}`,
        startDate: getCellDate(validDays[0]),
        endDate: getCellDate(validDays[validDays.length - 1]),
        open,
        high,
        low,
        close,
        previousClose,
        change,
        changePercent,
        volume: totalVolume,
        tradingDays: weekPrices.length,
      };
    }

    weekRows.push({
      weekIndex,
      days: weekDays,
      summary,
    });
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden">
      {/* Day + Weekly Headers */}
      <div className="grid grid-cols-8 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30">
        {DAY_HEADERS.map((h) => {
          const isWeekend = h === "Sat" || h === "Sun";
          const isWeekly = h === "Weekly";
          return (
            <div
              key={h}
              className={`py-2 text-center text-xs font-semibold ${
                isWeekly
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/20 border-l border-indigo-100 dark:border-indigo-900/40"
                  : isWeekend
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {h}
            </div>
          );
        })}
      </div>

      {/* Calendar Rows */}
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {weekRows.map((row) => {
          const isWeekSelected = selectedWeekIndex === row.weekIndex;

          return (
            <div key={`row-${row.weekIndex}`} className="grid grid-cols-8">
              {/* 7 Days (Mon - Sun) */}
              {row.days.map((day, colIdx) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${row.weekIndex}-${colIdx}`}
                      className="border-r border-zinc-200 dark:border-zinc-800 min-h-[72px] sm:min-h-[88px] bg-zinc-50/50 dark:bg-zinc-800/20"
                    />
                  );
                }

                const dateStr = getCellDate(day);
                const price = priceMap.get(dateStr);
                const isSelected = selectedDate === dateStr;
                const isWeekend = colIdx === 5 || colIdx === 6;

                let changeBg = "";
                let changeText = "";
                if (price?.changePercent != null) {
                  if (price.changePercent > 0) {
                    changeBg = "bg-emerald-500/10 dark:bg-emerald-500/15";
                    changeText = "text-emerald-700 dark:text-emerald-300";
                  } else if (price.changePercent < 0) {
                    changeBg = "bg-rose-500/10 dark:bg-rose-500/15";
                    changeText = "text-rose-700 dark:text-rose-300";
                  } else {
                    changeText = "text-zinc-500";
                  }
                }

                return (
                  <div
                    key={dateStr}
                    onClick={() => price && onSelectDate(price)}
                    className={`
                      relative border-r border-zinc-200 dark:border-zinc-800
                      min-h-[72px] sm:min-h-[88px]
                      flex flex-col p-1.5 sm:p-2
                      transition-all
                      ${price ? "cursor-pointer" : "cursor-default"}
                      ${
                        isSelected
                          ? "ring-2 ring-inset ring-blue-500 z-10"
                          : price
                          ? `${changeBg} hover:brightness-95 dark:hover:brightness-110`
                          : isWeekend
                          ? "bg-zinc-50/80 dark:bg-zinc-800/30"
                          : "bg-white dark:bg-zinc-900"
                      }
                    `}
                  >
                    <span
                      className={`text-xs font-semibold leading-none mb-1 ${
                        isWeekend
                          ? "text-blue-500 dark:text-blue-400"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {day}
                    </span>

                    {price && (
                      <>
                        <span className="text-[11px] sm:text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200 leading-tight truncate">
                          {formatPrice(price.close)}
                        </span>

                        {price.changePercent != null && (
                          <span
                            className={`text-[10px] sm:text-xs font-semibold leading-tight mt-auto ${changeText}`}
                          >
                            {formatChangeByMode(price.change, price.changePercent, symbol, historyData?.currency ?? "USD", unitMode)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}

              {/* 8th Column: Weekly Summary Cell for this week */}
              <div
                onClick={() => row.summary && onSelectWeek(row.summary)}
                className={`
                  border-l border-indigo-100 dark:border-indigo-900/50
                  min-h-[72px] sm:min-h-[88px]
                  flex flex-col p-1.5 sm:p-2
                  transition-all
                  ${row.summary ? "cursor-pointer" : "cursor-default"}
                  ${
                    isWeekSelected
                      ? "ring-2 ring-inset ring-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 z-10"
                      : row.summary
                      ? "bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40"
                      : "bg-zinc-50/40 dark:bg-zinc-800/20"
                  }
                `}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    W{row.weekIndex + 1}
                  </span>
                  {row.summary && (
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono hidden sm:inline">
                      {row.summary.tradingDays}d
                    </span>
                  )}
                </div>

                {row.summary ? (
                  <>
                    <span className="text-[11px] sm:text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200 leading-tight truncate">
                      {formatPrice(row.summary.close)}
                    </span>

                    {row.summary.changePercent != null && (
                      <span
                        className={`text-[10px] sm:text-xs font-bold leading-tight mt-auto ${
                          row.summary.changePercent > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : row.summary.changePercent < 0
                            ? "text-red-500 dark:text-red-400"
                            : "text-zinc-500"
                        }`}
                      >
                        {formatChangeByMode(row.summary.change, row.summary.changePercent, symbol, historyData?.currency ?? "USD", unitMode)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-auto">
                    -
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
