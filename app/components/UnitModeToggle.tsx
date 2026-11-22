"use client";

import { type UnitMode, getUnitModeLabel } from "@/lib/pips";

interface UnitModeToggleProps {
  mode: UnitMode;
  onChange: (mode: UnitMode) => void;
  symbol: string;
}

export default function UnitModeToggle({
  mode,
  onChange,
  symbol,
}: UnitModeToggleProps) {
  const secondaryLabel = getUnitModeLabel(symbol);
  const isPips = secondaryLabel === "Pips";

  return (
    <div className="inline-flex items-center p-0.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-800/60 shadow-xs text-xs">
      {/* Percent Mode Button */}
      <button
        onClick={() => onChange("percent")}
        className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
          mode === "percent"
            ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
        }`}
        title="Display daily and weekly changes in Percentage (%)"
      >
        <span>%</span>
        <span>Percent</span>
      </button>

      {/* Pips / Nominal Value Button */}
      <button
        onClick={() => onChange("pips")}
        className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
          mode === "pips"
            ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
        }`}
        title={`Display daily and weekly changes in ${secondaryLabel}`}
      >
        <span>{isPips ? "🎯" : "💵"}</span>
        <span>{secondaryLabel}</span>
      </button>
    </div>
  );
}
