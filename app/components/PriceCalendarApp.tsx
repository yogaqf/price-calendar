"use client";

import { useState, useEffect, useCallback } from "react";
import AssetSelector from "./AssetSelector";
import MonthNav from "./MonthNav";
import CalendarGrid from "./CalendarGrid";
import DayDetail from "./DayDetail";
import PriceStats from "./PriceStats";
import MonthlyPerformanceBar from "./MonthlyPerformanceBar";
import SeasonalityMatrix from "./SeasonalityMatrix";
import ThemeToggle from "./ThemeToggle";
import UnitModeToggle from "./UnitModeToggle";
import DowSeasonality from "./DowSeasonality";
import SmartInsights from "./SmartInsights";
import { RefreshIcon } from "./icons";
import type {
  DailyPrice,
  HistoryResponse,
  WeeklySummary,
  InstrumentStats,
  SeasonalityResponse,
  DowSeasonalityResponse,
} from "@/lib/types";
import { type UnitMode } from "@/lib/pips";
import { getInstrument } from "@/lib/instruments";

function getMonthRange(year: number, month: number): { from: string; to: string } {
  const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const to = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

type LoadState = "idle" | "loading" | "success" | "error";

export default function PriceCalendarApp() {
  // Use lazy initializers so they run client-side only
  const [symbol, setSymbol] = useState("BTC-USD");
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth()); // 0-indexed

  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<HistoryResponse | null>(null);

  const [statsData, setStatsData] = useState<InstrumentStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [selectedDay, setSelectedDay] = useState<DailyPrice | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<WeeklySummary | null>(null);

  // Seasonality Matrix data state
  const [seasonalityData, setSeasonalityData] = useState<SeasonalityResponse | null>(null);
  const [seasonalityLoading, setSeasonalityLoading] = useState(false);

  // Day-of-Week Seasonality data state
  const [dowData, setDowData] = useState<DowSeasonalityResponse | null>(null);
  const [dowLoading, setDowLoading] = useState(false);

  // Active view tab: 'calendar' or 'seasonality'
  const [activeTab, setActiveTab] = useState<"calendar" | "seasonality" | "dow">("calendar");

  // Unit mode: percent (default) or pips/nominal
  const [unitMode, setUnitMode] = useState<UnitMode>("percent");

  const instrument = getInstrument(symbol);

  const fetchData = useCallback(async (sym: string, y: number, m: number) => {
    const { from, to } = getMonthRange(y, m);
    setLoadState("loading");
    setErrorMsg(null);
    setSelectedDay(null);
    setSelectedWeek(null);

    try {
      const res = await fetch(`/api/history?symbol=${encodeURIComponent(sym)}&from=${from}&to=${to}`);
      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.error ?? "Failed to fetch data.");
        setLoadState("error");
        setHistoryData(null);
        return;
      }

      setHistoryData(json as HistoryResponse);
      setLoadState("success");
    } catch {
      setErrorMsg("Connection failed. Please check your network connection.");
      setLoadState("error");
      setHistoryData(null);
    }
  }, []);

  const fetchStats = useCallback(async (sym: string) => {
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/stats?symbol=${encodeURIComponent(sym)}`);
      if (res.ok) {
        const json = await res.json();
        setStatsData(json as InstrumentStats);
      }
    } catch {
      // ignore
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchSeasonalityData = useCallback(async (sym: string) => {
    setSeasonalityLoading(true);
    try {
      const res = await fetch(`/api/seasonality?symbol=${encodeURIComponent(sym)}`);
      if (res.ok) {
        const json = await res.json();
        setSeasonalityData(json as SeasonalityResponse);
      }
    } catch {
      // ignore
    } finally {
      setSeasonalityLoading(false);
    }
  }, []);

  const fetchDowData = useCallback(async (sym: string) => {
    setDowLoading(true);
    try {
      const res = await fetch(`/api/dow-seasonality?symbol=${encodeURIComponent(sym)}`);
      if (res.ok) {
        const json = await res.json();
        setDowData(json as DowSeasonalityResponse);
      }
    } catch {
      // ignore
    } finally {
      setDowLoading(false);
    }
  }, []);

  // Fetch when symbol/month changes
  useEffect(() => {
    fetchData(symbol, year, month);
  }, [symbol, year, month, fetchData]);

  // Fetch stats and seasonality when symbol changes
  useEffect(() => {
    fetchStats(symbol);
    fetchSeasonalityData(symbol);
    fetchDowData(symbol);
  }, [symbol, fetchStats, fetchSeasonalityData, fetchDowData]);

  function handleMonthChange(y: number, m: number) {
    setYear(y);
    setMonth(m);
  }

  function handleSymbolSelect(sym: string) {
    setSymbol(sym);
  }

  function handleSelectSeasonalityMonth(y: number, m: number) {
    setYear(y);
    setMonth(m);
    setActiveTab("calendar");
  }

  function handleSelectDay(day: DailyPrice) {
    setSelectedDay(day);
    setSelectedWeek(null);
  }

  function handleSelectWeek(week: WeeklySummary) {
    setSelectedWeek(week);
    setSelectedDay(null);
  }

  function handleCloseDetail() {
    setSelectedDay(null);
    setSelectedWeek(null);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            <div>
              <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                Price History Calendar
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-none mt-0.5">
                Forex · Stocks · Crypto
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Asset Selector (Dropdown Picker) */}
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
            Select Instrument
          </h2>
          <AssetSelector selectedSymbol={symbol} onSelect={handleSymbolSelect} />
        </section>

        {/* High / Low Statistics Cards (ATH, ATL, YTD, Month, Week, Today) */}
        <PriceStats stats={statsData} loading={statsLoading} />

        {/* Smart Market Insights Widget */}
        <SmartInsights
          symbol={symbol}
          year={year}
          month={month}
          stats={statsData}
          seasonality={seasonalityData}
          dow={dowData}
          historyData={historyData}
        />

        {/* View Tabs: Monthly Calendar vs Seasonality Matrix */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "calendar"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <span>📅</span>
              <span>Monthly Calendar</span>
            </button>
            <button
              onClick={() => setActiveTab("seasonality")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "seasonality"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <span>🗓️</span>
              <span>Seasonality Matrix</span>
              {seasonalityData?.years && (
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded-full font-bold">
                  {seasonalityData.years.length}Y
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("dow")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "dow"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <span>📆</span>
              <span>Day of Week</span>
              {dowData && (
                <span className="text-[10px] bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 px-1.5 py-0.2 rounded-full font-bold">
                  {dowData.yearsOfData}Y
                </span>
              )}
            </button>
          </div>

          {/* Unit Mode Toggle — shown on Calendar and Day-of-Week tabs */}
          {(activeTab === "calendar" || activeTab === "dow") && (
            <UnitModeToggle mode={unitMode} onChange={setUnitMode} symbol={symbol} />
          )}
        </div>

        {/* TAB 1: CALENDAR VIEW */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            {/* Instrument Info + Month Nav with Date Jumper */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              {instrument && (
                <div>
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {instrument.name}
                  </span>
                  <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                    {instrument.symbol}
                  </span>
                  {historyData?.currency && (
                    <span className="ml-2 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                      {historyData.currency}
                    </span>
                  )}
                </div>
              )}
              <MonthNav year={year} month={month} onChange={handleMonthChange} />
            </div>

            {/* Monthly Performance & Win Rate Summary Bar */}
            {historyData && historyData.data.length > 0 && (
              <MonthlyPerformanceBar
                data={historyData.data}
                currency={historyData.currency}
                unitMode={unitMode}
                symbol={symbol}
              />
            )}

            {/* Calendar + Detail side by side on large screens */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-5 items-start">
              {/* Calendar Grid (including Weekly column) */}
              <div className="space-y-6">
                {loadState === "loading" && (
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 min-h-[400px] flex flex-col items-center justify-center gap-3 text-zinc-400">
                    <div className="w-8 h-8 border-2 border-zinc-300 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-sm">Loading calendar data...</span>
                  </div>
                )}

                {loadState === "error" && (
                  <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 min-h-[400px] flex flex-col items-center justify-center gap-4 text-center p-6">
                    <div className="text-3xl">⚠️</div>
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium max-w-xs">
                      {errorMsg}
                    </p>
                    <button
                      onClick={() => fetchData(symbol, year, month)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <RefreshIcon className="w-4 h-4" />
                      Try Again
                    </button>
                  </div>
                )}

                {(loadState === "success" || loadState === "idle") && historyData && (
                  <CalendarGrid
                    year={year}
                    month={month}
                    historyData={historyData}
                    selectedDate={selectedDay?.date ?? null}
                    selectedWeekIndex={selectedWeek?.weekIndex ?? null}
                    onSelectDate={handleSelectDay}
                    onSelectWeek={handleSelectWeek}
                    unitMode={unitMode}
                    symbol={symbol}
                  />
                )}

                {loadState === "success" && historyData && historyData.data.length === 0 && (
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 min-h-[200px] flex flex-col items-center justify-center gap-2 text-zinc-400">
                    <span className="text-2xl">📭</span>
                    <p className="text-sm">No data available for this period.</p>
                  </div>
                )}
              </div>

              {/* Day / Week Detail Panel */}
              <div className="lg:sticky lg:top-20">
                {selectedDay || selectedWeek ? (
                  <DayDetail
                    day={selectedDay}
                    week={selectedWeek}
                    currency={historyData?.currency ?? "USD"}
                    symbol={symbol}
                    unitMode={unitMode}
                    onClose={handleCloseDetail}
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 p-6 flex flex-col items-center justify-center gap-2 text-zinc-400 min-h-[180px]">
                    <span className="text-2xl">👆</span>
                    <p className="text-sm text-center font-medium">
                      Click any date or <span className="text-indigo-500 font-bold">Weekly</span> column to view detailed OHLC & performance
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 pb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300" />
                <span>Up</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-red-100 dark:bg-red-900/50 border border-red-300" />
                <span>Down</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-300" />
                <span>Weekly Summary Column</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-300" />
                <span>Weekend / No Trading</span>
              </div>
            </div>

            {/* Also render Seasonality Matrix below calendar for quick reference */}
            <div className="pt-4">
              <SeasonalityMatrix
                data={seasonalityData}
                loading={seasonalityLoading}
                onSelectMonth={handleSelectSeasonalityMonth}
              />
            </div>
          </div>
        )}

        {/* TAB 2: STANDALONE SEASONALITY MATRIX VIEW */}
        {activeTab === "seasonality" && (
          <div className="space-y-6">
            <SeasonalityMatrix
              data={seasonalityData}
              loading={seasonalityLoading}
              onSelectMonth={handleSelectSeasonalityMonth}
            />
          </div>
        )}

        {/* TAB 3: DAY OF WEEK SEASONALITY */}
        {activeTab === "dow" && (
          <div className="space-y-6">
            <DowSeasonality
              data={dowData}
              loading={dowLoading}
              unitMode={unitMode}
              symbol={symbol}
            />
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 pt-2 pb-6 border-t border-zinc-200 dark:border-zinc-800">
          <span>Historical prices &amp; monthly seasonality analytics</span>
          <span>Data: Yahoo Finance · 5-minute cache</span>
        </div>
      </main>
    </div>
  );
}
