/**
 * Simple in-memory cache untuk server-side.
 * Cache berlaku selama CACHE_TTL_MS milidetik.
 * Key berdasarkan kombinasi symbol + from + to.
 */

import type { HistoryResponse, InstrumentStats } from "./types";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 menit

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// Cache disimpan di module scope (server memory)
const historyCache = new Map<string, CacheEntry<HistoryResponse>>();
const statsCache = new Map<string, CacheEntry<InstrumentStats>>();

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

export function clearCache(): void {
  historyCache.clear();
  statsCache.clear();
}
