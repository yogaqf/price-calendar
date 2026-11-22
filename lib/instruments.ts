// Daftar instrumen yang didukung oleh aplikasi

export type AssetCategory = "Forex" | "Stocks" | "Crypto";

export interface Instrument {
  symbol: string;
  name: string;
  category: AssetCategory;
}

export const INSTRUMENTS: Instrument[] = [
  // Forex
  { symbol: "EURUSD=X", name: "EUR/USD", category: "Forex" },
  { symbol: "GBPUSD=X", name: "GBP/USD", category: "Forex" },
  { symbol: "USDJPY=X", name: "USD/JPY", category: "Forex" },
  { symbol: "AUDUSD=X", name: "AUD/USD", category: "Forex" },
  { symbol: "USDIDR=X", name: "USD/IDR", category: "Forex" },
  { symbol: "GC=F", name: "Gold (XAU/USD)", category: "Forex" },

  // Stocks
  { symbol: "BBCA.JK", name: "Bank BCA", category: "Stocks" },
  { symbol: "BBRI.JK", name: "Bank BRI", category: "Stocks" },
  { symbol: "BMRI.JK", name: "Bank Mandiri", category: "Stocks" },
  { symbol: "AAPL", name: "Apple", category: "Stocks" },
  { symbol: "MSFT", name: "Microsoft", category: "Stocks" },
  { symbol: "NVDA", name: "NVIDIA", category: "Stocks" },

  // Crypto
  { symbol: "BTC-USD", name: "Bitcoin", category: "Crypto" },
  { symbol: "ETH-USD", name: "Ethereum", category: "Crypto" },
  { symbol: "BNB-USD", name: "BNB", category: "Crypto" },
  { symbol: "SOL-USD", name: "Solana", category: "Crypto" },
  { symbol: "XRP-USD", name: "XRP", category: "Crypto" },
];

export const SUPPORTED_SYMBOLS = new Set(INSTRUMENTS.map((i) => i.symbol));

export function getInstrument(symbol: string): Instrument | undefined {
  return INSTRUMENTS.find((i) => i.symbol === symbol);
}

export function getInstrumentsByCategory(
  category: AssetCategory
): Instrument[] {
  return INSTRUMENTS.filter((i) => i.category === category);
}
