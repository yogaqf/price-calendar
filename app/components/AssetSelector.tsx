"use client";

import { INSTRUMENTS, type AssetCategory } from "@/lib/instruments";

const CATEGORIES: AssetCategory[] = ["Forex", "Stocks", "Crypto"];

const CATEGORY_TAG_COLORS: Record<AssetCategory, string> = {
  Forex: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
  Stocks: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  Crypto: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300",
};

interface AssetSelectorProps {
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}

export default function AssetSelector({
  selectedSymbol,
  onSelect,
}: AssetSelectorProps) {
  const current = INSTRUMENTS.find((i) => i.symbol === selectedSymbol);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Dropdown Container */}
      <div className="relative flex-1 max-w-md">
        <select
          value={selectedSymbol}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full appearance-none rounded-xl border border-zinc-300 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-zinc-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-400"
          aria-label="Select asset instrument"
        >
          {CATEGORIES.map((category) => {
            const list = INSTRUMENTS.filter((i) => i.category === category);
            return (
              <optgroup key={category} label={`── ${category} ──`}>
                {list.map((item) => (
                  <option key={item.symbol} value={item.symbol}>
                    {item.name} ({item.symbol})
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>

        {/* Dropdown Chevron Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 dark:text-zinc-400">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Selected Asset Badge Indicator */}
      {current && (
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`px-2.5 py-1 rounded-lg font-semibold ${
              CATEGORY_TAG_COLORS[current.category]
            }`}
          >
            {current.category}
          </span>
          <span className="font-mono text-zinc-500 dark:text-zinc-400">
            {current.symbol}
          </span>
        </div>
      )}
    </div>
  );
}
