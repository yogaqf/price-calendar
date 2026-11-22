// Tipe data untuk aplikasi price-history

export interface DailyPrice {
  date: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
}

export interface WeeklySummary {
  weekIndex: number; // 0, 1, 2, ...
  label: string; // e.g. "Minggu 1"
  dateRange: string; // e.g. "01 - 04 Okt"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
  tradingDays: number;
}

export interface RangeStat {
  high: number | null;
  low: number | null;
}

export interface InstrumentStats {
  symbol: string;
  currency: string;
  currentPrice: number | null;
  allTime: RangeStat;
  thisYear: RangeStat;
  thisMonth: RangeStat;
  thisWeek: RangeStat;
  today: RangeStat;
}

export interface HistoryResponse {
  symbol: string;
  currency: string;
  data: DailyPrice[];
}

export interface ApiError {
  error: string;
  code?: string;
}
