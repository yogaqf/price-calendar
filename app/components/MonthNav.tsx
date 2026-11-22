"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

interface MonthNavProps {
  year: number;
  month: number; // 0-indexed
  onChange: (year: number, month: number) => void;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Generate selectable years from current year down to 2015
const currentRealYear = new Date().getFullYear();
const currentRealMonth = new Date().getMonth();
const YEARS = Array.from(
  { length: currentRealYear - 2014 },
  (_, idx) => currentRealYear - idx
);

export default function MonthNav({ year, month, onChange }: MonthNavProps) {
  function prev() {
    if (month === 0) {
      onChange(year - 1, 11);
    } else {
      onChange(year, month - 1);
    }
  }

  function next() {
    if (year === currentRealYear && month >= currentRealMonth) return;

    if (month === 11) {
      onChange(year + 1, 0);
    } else {
      onChange(year, month + 1);
    }
  }

  function jumpToToday() {
    onChange(currentRealYear, currentRealMonth);
  }

  const isCurrentMonth =
    year === currentRealYear && month === currentRealMonth;

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {/* Quick "Today" Button */}
      <button
        onClick={jumpToToday}
        disabled={isCurrentMonth}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
          isCurrentMonth
            ? "border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-600 cursor-default"
            : "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/60 shadow-xs"
        }`}
      >
        Today
      </button>

      {/* Nav Controls */}
      <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 shadow-xs">
        <button
          onClick={prev}
          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        {/* Month Selector Dropdown */}
        <select
          value={month}
          onChange={(e) => onChange(year, Number(e.target.value))}
          className="bg-transparent text-sm font-semibold text-zinc-800 dark:text-zinc-200 py-1 px-1.5 focus:outline-none cursor-pointer"
          aria-label="Select month"
        >
          {MONTH_NAMES.map((name, idx) => {
            const isFuture =
              year === currentRealYear && idx > currentRealMonth;
            return (
              <option key={name} value={idx} disabled={isFuture} className="text-zinc-900 dark:text-zinc-100 dark:bg-zinc-900">
                {name}
              </option>
            );
          })}
        </select>

        {/* Year Selector Dropdown */}
        <select
          value={year}
          onChange={(e) => {
            const newYear = Number(e.target.value);
            // If selecting current year and month is in future, cap to current month
            const newMonth =
              newYear === currentRealYear && month > currentRealMonth
                ? currentRealMonth
                : month;
            onChange(newYear, newMonth);
          }}
          className="bg-transparent text-sm font-bold text-zinc-900 dark:text-zinc-100 py-1 px-1.5 focus:outline-none cursor-pointer border-l border-zinc-200 dark:border-zinc-700"
          aria-label="Select year"
        >
          {YEARS.map((y) => (
            <option key={y} value={y} className="text-zinc-900 dark:text-zinc-100 dark:bg-zinc-900">
              {y}
            </option>
          ))}
        </select>

        <button
          onClick={next}
          disabled={isCurrentMonth}
          className={`p-1.5 rounded-lg transition-colors ${
            isCurrentMonth
              ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          }`}
          aria-label="Next month"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
