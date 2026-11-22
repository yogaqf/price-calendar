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
  highDate: string | null; // YYYY-MM-DD or YYYY-MM for all-time
  low: number | null;
  lowDate: string | null;
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

export interface MonthReturn {
  month: number; // 0 = Jan, ..., 11 = Dec
  open: number;
  close: number;
  changePercent: number;
}

export interface YearSeasonality {
  year: number;
  months: (MonthReturn | null)[]; // Array 12 elemen (index 0=Jan s.d. 11=Dec)
  ytdReturn: number | null;
}

export interface SeasonalityResponse {
  symbol: string;
  currency: string;
  years: YearSeasonality[];
  monthlyAverages: (number | null)[]; // 12 elemen: rata-rata % return per bulan
  positiveWinRates: (number | null)[]; // 12 elemen: % tahun yang hijau per bulan
}

export interface ApiError {
  error: string;
  code?: string;
}

// --- Day-of-Week Seasonality ---

export interface DowDayStats {
  dayIndex: number;   // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri
  dayName: string;    // "Monday" … "Friday"
  dayShort: string;   // "Mon" … "Fri"
  count: number;      // sample size
  avgChangePercent: number;
  avgChange: number;  // nominal average
  winRate: number;    // % of positive sessions
  upDays: number;
  downDays: number;
  flatDays: number;
  bestChangePercent: number;
  worstChangePercent: number;
  bestDate: string;
  worstDate: string;
}

export interface DowSeasonalityResponse {
  symbol: string;
  currency: string;
  fromDate: string;
  toDate: string;
  yearsOfData: number;
  stats: DowDayStats[]; // always 5 elements: Mon-Fri
}
