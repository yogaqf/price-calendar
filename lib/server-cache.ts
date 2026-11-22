/**
 * Simple in-memory cache untuk server-side.
 * Cache berlaku selama CACHE_TTL_MS milidetik.
 * Key berdasarkan kombinasi symbol + from + to.
 */

import type { HistoryResponse, InstrumentStats, SeasonalityResponse, DowSeasonalityResponse } from "./types";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 menit
const SEASONALITY_CACHE_TTL_MS = 15 * 60 * 1000; // 15 menit untuk data bulanan

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// Cache disimpan di module scope (server memory)
const historyCache = new Map<string, CacheEntry<HistoryResponse>>();
const statsCache = new Map<string, CacheEntry<InstrumentStats>>();
const seasonalityCache = new Map<string, CacheEntry<SeasonalityResponse>>();
const dowCache = new Map<string, CacheEntry<DowSeasonalityResponse>>();

function buildKey(symbol: string, from: string, to: string): string {
  return `${symbol}::${from}::${to}`;
}

export function getCached(
  symbol: string,
  from: string,
  to: string
): HistoryResponse | null {
  const key = buildKey(symbol, from, to);
  const entry = historyCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    historyCache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCached(
  symbol: string,
  from: string,
  to: string,
  data: HistoryResponse
): void {
  const key = buildKey(symbol, from, to);
  historyCache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function getCachedStats(symbol: string): InstrumentStats | null {
  const entry = statsCache.get(symbol);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    statsCache.delete(symbol);
    return null;
  }
  return entry.data;
}

export function setCachedStats(symbol: string, data: InstrumentStats): void {
  statsCache.set(symbol, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function getCachedSeasonality(symbol: string): SeasonalityResponse | null {
  const entry = seasonalityCache.get(symbol);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    seasonalityCache.delete(symbol);
    return null;
  }
  return entry.data;
}

export function setCachedSeasonality(symbol: string, data: SeasonalityResponse): void {
  seasonalityCache.set(symbol, {
    data,
    expiresAt: Date.now() + SEASONALITY_CACHE_TTL_MS,
  });
}

export function clearCache(): void {
  historyCache.clear();
  statsCache.clear();
  seasonalityCache.clear();
  dowCache.clear();
}

export function getCachedDow(symbol: string): DowSeasonalityResponse | null {
  const entry = dowCache.get(symbol);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    dowCache.delete(symbol);
    return null;
  }
  return entry.data;
}

export function setCachedDow(symbol: string, data: DowSeasonalityResponse): void {
  dowCache.set(symbol, {
    data,
    expiresAt: Date.now() + SEASONALITY_CACHE_TTL_MS,
  });
}
