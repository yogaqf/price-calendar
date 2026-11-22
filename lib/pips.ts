/**
 * Helper utility for Pips calculation and display mode formatting.
 */

export type UnitMode = "percent" | "pips";

/**
 * Returns the label for the secondary unit mode based on the asset symbol.
 * E.g. "Pips" for Forex, "Value ($)" for US Stocks/Crypto, "Value (IDR)" for Indonesian Stocks.
 */
export function getUnitModeLabel(symbol: string): string {
  if (symbol === "GC=F" || (symbol.endsWith("=X") && !symbol.includes("IDR"))) {
    return "Pips";
  }
  if (symbol.endsWith(".JK") || symbol.includes("IDR")) {
    return "Value (Rp)";
  }
  return "Value ($)";
}

/**
 * Calculates pips for Forex instruments.
 * Returns null for non-forex instruments.
 */
export function calculatePips(change: number | null, symbol: string): number | null {
  if (change == null) return null;

  if (symbol.includes("JPY")) {
    // JPY pairs: 1 pip = 0.01 (2nd decimal place)
    return change * 100;
  }
  if (symbol === "GC=F") {
    // Gold COMEX: 1 pip = $0.10
    return change * 10;
  }
  if (symbol.endsWith("=X") && !symbol.includes("IDR")) {
    // Standard Forex 4-decimal: 1 pip = 0.0001
    return change * 10000;
  }

  return null;
}

/**
 * Formats price change according to active unit mode (percentage vs pips / nominal value).
 */
export function formatChangeByMode(
  change: number | null,
  percent: number | null,
  symbol: string,
  currency: string,
  mode: UnitMode
): string {
  if (percent == null && change == null) return "-";
  const prefix = (percent ?? change ?? 0) > 0 ? "+" : "";

  // 1. Percentage Mode
  if (mode === "percent") {
    if (percent == null) return "-";
    return `${prefix}${percent.toFixed(2)}%`;
  }

  // 2. Pips / Nominal Value Mode
  if (change == null) return "-";

  const pips = calculatePips(change, symbol);
  if (pips != null) {
    return `${prefix}${pips.toFixed(1)} pips`;
  }

  // Stocks & Crypto Nominal Currency formatting
  const absVal = Math.abs(change);
  let digits = 2;
  if (absVal >= 1000) digits = 0;
  else if (absVal >= 1) digits = 2;
  else digits = 4;

  try {
    return `${prefix}${new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(change)}`;
  } catch {
    return `${prefix}${change.toFixed(digits)} ${currency}`;
  }
}
