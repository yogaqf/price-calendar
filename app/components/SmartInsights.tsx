"use client";

import { useState } from "react";
import type {
  InstrumentStats,
  SeasonalityResponse,
  DowSeasonalityResponse,
  HistoryResponse,
} from "@/lib/types";
import { generateMarketInsights, type InsightType } from "@/lib/insights";

interface SmartInsightsProps {
  symbol: string;
  year: number;
  month: number;
  stats: InstrumentStats | null;
  seasonality: SeasonalityResponse | null;
  dow: DowSeasonalityResponse | null;
  historyData: HistoryResponse | null;
}

function getBadgeStyle(type: InsightType): string {
  switch (type) {
    case "bullish":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60";
    case "bearish":
      return "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800/60";
    case "warning":
      return "bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800/60";
    case "highlight":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700";
  }
}

function getItemCardStyle(type: InsightType): string {
  switch (type) {
    case "bullish":
      return "border-emerald-200/80 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/15";
    case "bearish":
      return "border-rose-200/80 bg-rose-50/30 dark:border-rose-900/40 dark:bg-rose-950/15";
    case "warning":
      return "border-amber-200/80 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/15";
    case "highlight":
      return "border-indigo-200/80 bg-indigo-50/30 dark:border-indigo-900/40 dark:bg-indigo-950/15";
    default:
      return "border-zinc-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80";
  }
}

export default function SmartInsights({
  symbol,
  year,
  month,
  stats,
  seasonality,
  dow,
  historyData,
}: SmartInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const insights = generateMarketInsights({
    symbol,
    year,
    month,
    stats,
    seasonality,
    dow,
    historyData,
  });

  if (!insights.items || insights.items.length === 0) return null;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-zinc-50/80 via-white to-zinc-50/80 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900/90">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">💡</span>
            <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              Smart Market Insights
            </h2>
          </div>
          {/* Overall Bias Tag */}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${getBadgeStyle(
              insights.biasType
            )}`}
          >
            {insights.overallBias}
          </span>
        </div>

        {/* Expand/Collapse Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? "Hide" : "Show Insights"}</span>
          <span className="text-[10px]">{isExpanded ? "▲" : "▼"}</span>
        </button>
      </div>

      {/* Insight Items Grid */}
      {isExpanded && (
        <div className="p-3.5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {insights.items.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg border p-3 flex flex-col justify-between transition-all ${getItemCardStyle(
                item.type
              )}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                      {item.title}
                    </span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border whitespace-nowrap ${getBadgeStyle(
                        item.type
                      )}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {item.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
