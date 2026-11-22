// Daftar instrumen yang didukung oleh aplikasi

export type AssetCategory = "Forex" | "Stocks" | "Crypto";

export interface Instrument {
  symbol: string;
  name: string;
  category: AssetCategory;
}


export const INSTRUMENTS: Instrument[] = [
  // ==========================================
  // FOREX - MAJOR PAIRS
  // ==========================================
  { symbol: "AUDUSD=X", name: "AUD/USD", category: "Forex" },
  { symbol: "EURUSD=X", name: "EUR/USD", category: "Forex" },
  { symbol: "GBPUSD=X", name: "GBP/USD", category: "Forex" },
  { symbol: "NZDUSD=X", name: "NZD/USD", category: "Forex" },
  { symbol: "USDCAD=X", name: "USD/CAD", category: "Forex" },
  { symbol: "USDCHF=X", name: "USD/CHF", category: "Forex" },
  { symbol: "USDJPY=X", name: "USD/JPY", category: "Forex" },
  { symbol: "USDIDR=X", name: "USD/IDR", category: "Forex" },

  // FOREX - JPY CROSSES
  { symbol: "GBPJPY=X", name: "GBP/JPY", category: "Forex" },
  { symbol: "EURJPY=X", name: "EUR/JPY", category: "Forex" },
  { symbol: "AUDJPY=X", name: "AUD/JPY", category: "Forex" },
  { symbol: "NZDJPY=X", name: "NZD/JPY", category: "Forex" },
  { symbol: "CHFJPY=X", name: "CHF/JPY", category: "Forex" },
  { symbol: "CADJPY=X", name: "CAD/JPY", category: "Forex" },

  // FOREX - EUR CROSSES
  { symbol: "EURGBP=X", name: "EUR/GBP", category: "Forex" },
  { symbol: "EURAUD=X", name: "EUR/AUD", category: "Forex" },
  { symbol: "EURNZD=X", name: "EUR/NZD", category: "Forex" },
  { symbol: "EURCAD=X", name: "EUR/CAD", category: "Forex" },
  { symbol: "EURCHF=X", name: "EUR/CHF", category: "Forex" },

  // FOREX - GBP CROSSES
  { symbol: "GBPAUD=X", name: "GBP/AUD", category: "Forex" },
  { symbol: "GBPNZD=X", name: "GBP/NZD", category: "Forex" },
  { symbol: "GBPCAD=X", name: "GBP/CAD", category: "Forex" },
  { symbol: "GBPCHF=X", name: "GBP/CHF", category: "Forex" },

  // FOREX - AUD CROSSES
  { symbol: "AUDNZD=X", name: "AUD/NZD", category: "Forex" },
  { symbol: "AUDCAD=X", name: "AUD/CAD", category: "Forex" },
  { symbol: "AUDCHF=X", name: "AUD/CHF", category: "Forex" },

  // FOREX - NZD CROSSES
  { symbol: "NZDCAD=X", name: "NZD/CAD", category: "Forex" },
  { symbol: "NZDCHF=X", name: "NZD/CHF", category: "Forex" },

  // FOREX - CHF CROSSES
  { symbol: "CADCHF=X", name: "CAD/CHF", category: "Forex" },

  // FOREX - INDEX & GOLD
  { symbol: "DX-Y.NYB", name: "DXY", category: "Forex" },
  { symbol: "GC=F", name: "Gold (XAU/USD)", category: "Forex" },

  // ==========================================
  // INDONESIA STOCKS - BANKING
  // ==========================================
  { symbol: "BBCA.JK", name: "Bank BCA", category: "Stocks" },
  { symbol: "BBRI.JK", name: "Bank BRI", category: "Stocks" },
  { symbol: "BMRI.JK", name: "Bank Mandiri", category: "Stocks" },
  { symbol: "BBNI.JK", name: "Bank BNI", category: "Stocks" },
  { symbol: "BBTN.JK", name: "Bank BTN", category: "Stocks" },
  { symbol: "BRIS.JK", name: "Bank Syariah Indonesia", category: "Stocks" },
  { symbol: "ARTO.JK", name: "Bank Jago", category: "Stocks" },
  { symbol: "BTPS.JK", name: "Bank BTPN Syariah", category: "Stocks" },
  { symbol: "BNGA.JK", name: "Bank CIMB Niaga", category: "Stocks" },
  { symbol: "MEGA.JK", name: "Bank Mega", category: "Stocks" },

  // INDONESIA STOCKS - ENERGY & MINING
  { symbol: "ADRO.JK", name: "Alamtri Resources", category: "Stocks" },
  { symbol: "PTBA.JK", name: "Bukit Asam", category: "Stocks" },
  { symbol: "ITMG.JK", name: "Indo Tambangraya Megah", category: "Stocks" },
  { symbol: "ANTM.JK", name: "Aneka Tambang", category: "Stocks" },
  { symbol: "MDKA.JK", name: "Merdeka Copper Gold", category: "Stocks" },
  { symbol: "AMMN.JK", name: "Amman Mineral", category: "Stocks" },
  { symbol: "INCO.JK", name: "Vale Indonesia", category: "Stocks" },
  { symbol: "TINS.JK", name: "Timah", category: "Stocks" },
  { symbol: "MEDC.JK", name: "Medco Energi", category: "Stocks" },
  { symbol: "PGAS.JK", name: "Perusahaan Gas Negara", category: "Stocks" },
  { symbol: "HRUM.JK", name: "Harum Energy", category: "Stocks" },
  { symbol: "BYAN.JK", name: "Bayan Resources", category: "Stocks" },

  // INDONESIA STOCKS - TELECOM & INFRASTRUCTURE
  { symbol: "TLKM.JK", name: "Telkom Indonesia", category: "Stocks" },
  { symbol: "ISAT.JK", name: "Indosat", category: "Stocks" },
  { symbol: "EXCL.JK", name: "XL Axiata", category: "Stocks" },
  { symbol: "TOWR.JK", name: "Sarana Menara Nusantara", category: "Stocks" },

  // INDONESIA STOCKS - CONSUMER & RETAIL
  { symbol: "ASII.JK", name: "Astra International", category: "Stocks" },
  { symbol: "UNVR.JK", name: "Unilever Indonesia", category: "Stocks" },
  { symbol: "ICBP.JK", name: "Indofood CBP", category: "Stocks" },
  { symbol: "INDF.JK", name: "Indofood Sukses Makmur", category: "Stocks" },
  { symbol: "MYOR.JK", name: "Mayora Indah", category: "Stocks" },
  { symbol: "AMRT.JK", name: "Sumber Alfaria Trijaya", category: "Stocks" },
  { symbol: "MAPI.JK", name: "Mitra Adiperkasa", category: "Stocks" },
  { symbol: "ACES.JK", name: "Aspirasi Hidup Indonesia", category: "Stocks" },
  { symbol: "KLBF.JK", name: "Kalbe Farma", category: "Stocks" },
  { symbol: "SIDO.JK", name: "Industri Jamu Sido Muncul", category: "Stocks" },
  { symbol: "GGRM.JK", name: "Gudang Garam", category: "Stocks" },
  { symbol: "HMSP.JK", name: "HM Sampoerna", category: "Stocks" },

  // INDONESIA STOCKS - PROPERTY & CONSTRUCTION
  { symbol: "BSDE.JK", name: "Bumi Serpong Damai", category: "Stocks" },
  { symbol: "CTRA.JK", name: "Ciputra Development", category: "Stocks" },
  { symbol: "PWON.JK", name: "Pakuwon Jati", category: "Stocks" },
  { symbol: "SMRA.JK", name: "Summarecon Agung", category: "Stocks" },
  { symbol: "WSKT.JK", name: "Waskita Karya", category: "Stocks" },
  { symbol: "WIKA.JK", name: "Wijaya Karya", category: "Stocks" },
  { symbol: "PTPP.JK", name: "PP (Persero)", category: "Stocks" },

  // INDONESIA STOCKS - INDUSTRIAL & OTHERS
  { symbol: "UNTR.JK", name: "United Tractors", category: "Stocks" },
  { symbol: "CPIN.JK", name: "Charoen Pokphand Indonesia", category: "Stocks" },
  { symbol: "JPFA.JK", name: "Japfa Comfeed Indonesia", category: "Stocks" },
  { symbol: "SMGR.JK", name: "Semen Indonesia", category: "Stocks" },
  { symbol: "BRPT.JK", name: "Barito Pacific", category: "Stocks" },
  { symbol: "TPIA.JK", name: "Chandra Asri Pacific", category: "Stocks" },
  { symbol: "GOTO.JK", name: "GoTo Gojek Tokopedia", category: "Stocks" },
  { symbol: "BUKA.JK", name: "Bukalapak", category: "Stocks" },

  // ==========================================
  // US STOCKS - TECHNOLOGY
  // ==========================================
  { symbol: "AAPL", name: "Apple", category: "Stocks" },
  { symbol: "MSFT", name: "Microsoft", category: "Stocks" },
  { symbol: "NVDA", name: "NVIDIA", category: "Stocks" },
  { symbol: "GOOGL", name: "Alphabet Class A", category: "Stocks" },
  { symbol: "GOOG", name: "Alphabet Class C", category: "Stocks" },
  { symbol: "META", name: "Meta Platforms", category: "Stocks" },
  { symbol: "AMZN", name: "Amazon", category: "Stocks" },
  { symbol: "AVGO", name: "Broadcom", category: "Stocks" },
  { symbol: "AMD", name: "Advanced Micro Devices", category: "Stocks" },
  { symbol: "ORCL", name: "Oracle", category: "Stocks" },
  { symbol: "CRM", name: "Salesforce", category: "Stocks" },
  { symbol: "ADBE", name: "Adobe", category: "Stocks" },
  { symbol: "CSCO", name: "Cisco", category: "Stocks" },
  { symbol: "QCOM", name: "Qualcomm", category: "Stocks" },
  { symbol: "INTC", name: "Intel", category: "Stocks" },
  { symbol: "IBM", name: "IBM", category: "Stocks" },
  { symbol: "NFLX", name: "Netflix", category: "Stocks" },
  { symbol: "TSLA", name: "Tesla", category: "Stocks" },

  // US STOCKS - SEMICONDUCTOR & AI
  { symbol: "MU", name: "Micron Technology", category: "Stocks" },
  { symbol: "AMAT", name: "Applied Materials", category: "Stocks" },
  { symbol: "LRCX", name: "Lam Research", category: "Stocks" },
  { symbol: "KLAC", name: "KLA Corporation", category: "Stocks" },
  { symbol: "ARM", name: "Arm Holdings", category: "Stocks" },
  { symbol: "SMCI", name: "Super Micro Computer", category: "Stocks" },
  { symbol: "PLTR", name: "Palantir", category: "Stocks" },

  // US STOCKS - FINANCE
  { symbol: "BRK-B", name: "Berkshire Hathaway", category: "Stocks" },
  { symbol: "JPM", name: "JPMorgan Chase", category: "Stocks" },
  { symbol: "BAC", name: "Bank of America", category: "Stocks" },
  { symbol: "WFC", name: "Wells Fargo", category: "Stocks" },
  { symbol: "GS", name: "Goldman Sachs", category: "Stocks" },
  { symbol: "MS", name: "Morgan Stanley", category: "Stocks" },
  { symbol: "V", name: "Visa", category: "Stocks" },
  { symbol: "MA", name: "Mastercard", category: "Stocks" },
  { symbol: "AXP", name: "American Express", category: "Stocks" },

  // US STOCKS - HEALTHCARE
  { symbol: "LLY", name: "Eli Lilly", category: "Stocks" },
  { symbol: "JNJ", name: "Johnson & Johnson", category: "Stocks" },
  { symbol: "ABBV", name: "AbbVie", category: "Stocks" },
  { symbol: "MRK", name: "Merck", category: "Stocks" },
  { symbol: "UNH", name: "UnitedHealth Group", category: "Stocks" },
  { symbol: "PFE", name: "Pfizer", category: "Stocks" },
  { symbol: "MRNA", name: "Moderna", category: "Stocks" },

  // US STOCKS - CONSUMER & RETAIL
  { symbol: "WMT", name: "Walmart", category: "Stocks" },
  { symbol: "COST", name: "Costco", category: "Stocks" },
  { symbol: "HD", name: "Home Depot", category: "Stocks" },
  { symbol: "MCD", name: "McDonald's", category: "Stocks" },
  { symbol: "KO", name: "Coca-Cola", category: "Stocks" },
  { symbol: "PEP", name: "PepsiCo", category: "Stocks" },
  { symbol: "NKE", name: "Nike", category: "Stocks" },
  { symbol: "SBUX", name: "Starbucks", category: "Stocks" },
  { symbol: "DIS", name: "Walt Disney", category: "Stocks" },

  // US STOCKS - ENERGY & INDUSTRIAL
  { symbol: "XOM", name: "Exxon Mobil", category: "Stocks" },
  { symbol: "CVX", name: "Chevron", category: "Stocks" },
  { symbol: "COP", name: "ConocoPhillips", category: "Stocks" },
  { symbol: "CAT", name: "Caterpillar", category: "Stocks" },
  { symbol: "GE", name: "GE Aerospace", category: "Stocks" },
  { symbol: "BA", name: "Boeing", category: "Stocks" },
  { symbol: "UPS", name: "UPS", category: "Stocks" },
  { symbol: "RTX", name: "RTX Corporation", category: "Stocks" },

  // ==========================================
  // CRYPTO - MAJOR COINS
  // ==========================================
  { symbol: "BTC-USD", name: "Bitcoin", category: "Crypto" },
  { symbol: "ETH-USD", name: "Ethereum", category: "Crypto" },
  { symbol: "BNB-USD", name: "BNB", category: "Crypto" },
  { symbol: "SOL-USD", name: "Solana", category: "Crypto" },
  { symbol: "XRP-USD", name: "XRP", category: "Crypto" },

  // CRYPTO - STABLECOINS
  { symbol: "USDT-USD", name: "Tether", category: "Crypto" },
  { symbol: "USDC-USD", name: "USD Coin", category: "Crypto" },

  // CRYPTO - POPULAR ALTCOINS
  { symbol: "ADA-USD", name: "Cardano", category: "Crypto" },
  { symbol: "DOGE-USD", name: "Dogecoin", category: "Crypto" },
  { symbol: "TRX-USD", name: "TRON", category: "Crypto" },
  { symbol: "LINK-USD", name: "Chainlink", category: "Crypto" },
  { symbol: "AVAX-USD", name: "Avalanche", category: "Crypto" },
  { symbol: "DOT-USD", name: "Polkadot", category: "Crypto" },
  { symbol: "LTC-USD", name: "Litecoin", category: "Crypto" },
  { symbol: "BCH-USD", name: "Bitcoin Cash", category: "Crypto" },
  { symbol: "XLM-USD", name: "Stellar", category: "Crypto" },
  { symbol: "XMR-USD", name: "Monero", category: "Crypto" },
  { symbol: "ZEC-USD", name: "Zcash", category: "Crypto" },
  { symbol: "ETC-USD", name: "Ethereum Classic", category: "Crypto" },
  { symbol: "ATOM-USD", name: "Cosmos", category: "Crypto" },

  // CRYPTO - DEFI
  { symbol: "UNI-USD", name: "Uniswap", category: "Crypto" },
  { symbol: "AAVE-USD", name: "Aave", category: "Crypto" },
  { symbol: "MKR-USD", name: "Maker", category: "Crypto" },
  { symbol: "CRO-USD", name: "Cronos", category: "Crypto" },

  // CRYPTO - LAYER 1 & LAYER 2
  { symbol: "NEAR-USD", name: "NEAR Protocol", category: "Crypto" },
  { symbol: "APT-USD", name: "Aptos", category: "Crypto" },
  { symbol: "SUI-USD", name: "Sui", category: "Crypto" },
  { symbol: "ARB-USD", name: "Arbitrum", category: "Crypto" },
  { symbol: "OP-USD", name: "Optimism", category: "Crypto" },
  { symbol: "ICP-USD", name: "Internet Computer", category: "Crypto" },
  { symbol: "FIL-USD", name: "Filecoin", category: "Crypto" },
  { symbol: "HBAR-USD", name: "Hedera", category: "Crypto" },
  { symbol: "INJ-USD", name: "Injective", category: "Crypto" },

  // CRYPTO - MEME COINS
  { symbol: "SHIB-USD", name: "Shiba Inu", category: "Crypto" },
  { symbol: "PEPE-USD", name: "Pepe", category: "Crypto" },
  { symbol: "TON-USD", name: "Toncoin", category: "Crypto" },
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
