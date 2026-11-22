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

export default function MonthNav({ year, month, onChange }: MonthNavProps) {
  function prev() {
    if (month === 0) {
      onChange(year - 1, 11);
    } else {
      onChange(year, month - 1);
    }
  }

  function next() {
    const now = new Date();
    if (year === now.getFullYear() && month === now.getMonth()) return;

    if (month === 11) {
      onChange(year + 1, 0);
    } else {
      onChange(year, month + 1);
    }
  }

  const now = new Date();
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={prev}
        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 min-w-[180px] text-center">
        {MONTH_NAMES[month]} {year}
      </span>

      <button
        onClick={next}
        disabled={isCurrentMonth}
        className={`p-2 rounded-lg transition-colors ${
          isCurrentMonth
            ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
            : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
        }`}
        aria-label="Next month"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
