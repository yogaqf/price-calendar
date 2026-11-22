# Product Requirements Document (PRD)
## Forex, Stocks & Crypto Historical Price Calendar

**Versi:** 1.2  
**Status:** In Development (Iterative)  
**Platform:** Web Application  
**Language:** English (UI & API)

---

## 1. Ringkasan Produk

Aplikasi web untuk memantau harga historis instrumen Forex, Saham, dan Cryptocurrency dalam tampilan kalender bulanan interaktif.

Setiap tanggal pada kalender menampilkan harga penutupan (*close price*) dan perubahan persentase harian (*daily percentage change*). Pengguna dapat memilih tanggal untuk melihat detail pergerakan harga berupa Open, High, Low, Close (OHLC), serta volume transaksi jika tersedia. Kalender juga dilengkapi kolom ringkasan mingguan (*Weekly Summary*), kartu statistik ekstrem harga (*All-Time High/Low, YTD, Month, Week, Today*), serta ringkasan performa bulanan (*Monthly Return & Win Rate*).

Aplikasi berfokus pada pemantauan dan analisis data historis, bukan aktivitas trading langsung atau pengelolaan portofolio.

## 2. Tujuan Produk

- Memudahkan pengguna melihat pergerakan harga aset berdasarkan tanggal dalam format kalender bulanan.
- Menyediakan kolom performa mingguan (*Weekly*) pada setiap baris kalender.
- Menyajikan statistik ekstrem harga (*ATH, ATL, YTD High/Low, Month High/Low, Week High/Low, Today High/Low*).
- Menampilkan metrik performa bulanan (*Monthly Return, Win Rate, Green vs Red Days*).
- Menyediakan navigasi cepat (*Today button* & pemilih tahun).
- Menyediakan detail OHLC dan volume untuk tanggal atau minggu tertentu.
- Mendukung beberapa kategori aset: Forex, Saham, dan Cryptocurrency.

## 3. Target Pengguna

Pengguna, trader, atau analis yang ingin memantau dan menganalisis performa historis serta musiman (*seasonality*) aset secara visual dan cepat tanpa harus membuka platform charting yang kompleks.

## 4. Teknologi

| Komponen | Teknologi |
|---|---|
| Framework | Next.js (App Router, Turbopack) |
| Bahasa | TypeScript |
| UI & Styling | Tailwind CSS |
| Data Provider | Yahoo Finance (`yahoo-finance2`) |
| Data Fetching | Server-side Route Handlers (`/api/history`, `/api/stats`) |
| Caching | In-Memory Server Cache (5 menit TTL) |
| Database | Tidak diperlukan |

### Arsitektur Data

Aplikasi mengambil data langsung dari Yahoo Finance melalui Next.js Route Handler di sisi server.
1. Browser meminta data ke endpoint aplikasi (`/api/history` atau `/api/stats`).
2. Route Handler memeriksa in-memory cache server.
3. Jika data tersedia di cache dan belum kedaluwarsa, kembalikan dari cache (*HIT*).
4. Jika tidak tersedia, server mengambil data dari Yahoo Finance, menyesuaikan tanggal sesuai zona waktu bursa (*exchange timezone* via `Intl.DateTimeFormat`), memfilter akhir pekan untuk instrumen non-Crypto, menyimpannya ke cache, dan mengembalikan respons JSON (*MISS*).
5. Browser menampilkan data pada komponen kalender dan kartu statistik.

## 5. Sumber Data & Instrumen

### Forex
- `EURUSD=X` (EUR/USD)
- `GBPUSD=X` (GBP/USD)
- `USDJPY=X` (USD/JPY)
- `AUDUSD=X` (AUD/USD)
- `USDIDR=X` (USD/IDR)
- `GC=F` (Gold - XAU/USD Futures)

### Stocks
- `BBCA.JK` (Bank Central Asia)
- `BBRI.JK` (Bank Rakyat Indonesia)
- `BMRI.JK` (Bank Mandiri)
- `AAPL` (Apple Inc.)
- `MSFT` (Microsoft Corp.)
- `NVDA` (NVIDIA Corp.)

### Crypto
- `BTC-USD` (Bitcoin)
- `ETH-USD` (Ethereum)
- `BNB-USD` (BNB)
- `SOL-USD` (Solana)
- `XRP-USD` (XRP)

## 6. Fitur yang Sudah Selesai (Completed Features)

### 6.1. Dropdown Asset Picker
- Pemilihan instrumen menggunakan dropdown select yang rapi dan terkelompok (*grouped options*) berdasarkan kategori: Forex, Stocks, dan Crypto.
- Badge indikator kategori dan simbol aset aktif.

### 6.2. 8-Column Monthly Price Calendar
- Header hari: `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`, dan `Weekly`.
- Kolom ke-8 "Weekly" menampilkan ringkasan harga close dan persentase perubahan mingguan (*W1, W2, W3...*).
- Pewarnaan hijau (naik), merah (turun), dan abu-abu (netral/akhir pekan).
- Penanganan timezone akurat berbasis *exchange timezone* (`Europe/London`, `America/New_York`, `Asia/Jakarta`, `UTC`), sehingga pergantian musim panas/dingin (*Daylight Saving Time*) tidak menyebabkan hari Jumat/Senin hilang atau bergeser.
- Akhir pekan (Sabtu & Minggu) otomatis diabaikan untuk Forex & Saham, namun tetap ada untuk Crypto (24/7).

### 6.3. Price Range & Extremes Statistics Card
- Menampilkan 5 kartu metrik rentang harga untuk instrumen terpilih:
  1. **Today:** High & Low hari ini
  2. **This Week:** High & Low minggu berjalan
  3. **This Month:** High & Low bulan berjalan
  4. **This Year (YTD):** High & Low tahun berjalan
  5. **All Time (ATH / ATL):** All-Time High & All-Time Low
- Visual range indicator bar yang menunjukkan posisi harga terkini (*Current Price*) di antara level Low dan High.

### 6.4. Day & Week Detail Panel
- Menampilkan rincian OHLC, Previous Close, Change, % Change, Volume, dan Trading Days saat tanggal kalender atau sel Weekly diklik.

### 6.5. Standardisasi Bahasa Inggris (All English UI)
- Seluruh antarmuka, label, legenda, dan status pesan menggunakan bahasa Inggris.

---

## 7. Rencana Pengembangan Bertahap (Phased Roadmap)

Untuk menjaga stabilitas, efisiensi token, dan kualitas kode, fitur tambahan diimplementasikan secara bertahap:

### Phase 6 — Monthly Performance & Win Rate + Quick Date Jumper (Selesai)
- **Monthly Performance Summary Card:**
  - Month Return (% dan nilai nominal perubahan harga).
  - Win Rate (% hari hijau / naik).
  - Green Days vs Red Days counter (e.g. `14 Up / 6 Down`).
  - Best Session & Worst Session harian.
- **Quick Date Jumper:**
  - Tombol **"Today"** untuk kembali ke bulan & tahun berjalan dengan 1 klik.
  - Dropdown **Year Selector** (2026 s.d. 2015) untuk navigasi cepat antar tahun tanpa klik berulang kali.
  - Dropdown **Month Selector** langsung.

### Phase 7 — Dark / Light Mode Switcher (Selesai & Diverifikasi)
- Tombol switch tema visual di header (Sun/Moon icon).
- Mendukung class-based dark mode Tailwind v4 dengan `@custom-variant dark (&:where(.dark, .dark *))`.
- Anti-FOUC script di `<head>` dan persistensi di *localStorage*.
- Telah diverifikasi bekerja sempurna baik di sistem operasi berlatar Light maupun Dark (tidak lagi terpengaruh oleh default media query `prefers-color-scheme`).

### Phase 8 — Mini Candlestick Visualizer (Selesai)
- Visual lilin (*candlestick*) proporsional di panel detail samping kanan (SVG render).
- Menampilkan body lilin (hijau jika *bullish*, merah jika *bearish*), *upper & lower wicks*, serta label harga High, Open, Close, dan Low.

### Phase 9 — Yearly Seasonality Matrix (Jan – Dec Returns) (Selesai & Diverifikasi)
- **Seasonality Heatmap Table:**
  - Matriks performa 12 bulan (Jan s.d. Dec) untuk 8 tahun terakhir beserta return YTD (*Year-to-Date*).
  - Skala warna gradasi hijau (*bullish*) dan merah (*bearish*) proporsional berdasarkan return bulanan.
  - Baris ringkasan **Average Return** historis per bulan di bagian footer.
  - Baris ringkasan **Win Rate (% Positive Years)** per bulan di bagian footer.
- **Interaktivitas & Navigasi:**
  - Klik sel bulan mana pun pada tabel Seasonality untuk langsung melompat ke kalender bulan & tahun tersebut.
  - Segmented tab switch di bagian atas: **📅 Monthly Calendar** vs **🗓️ Seasonality Matrix**.
- **Backend & Caching:**
  - Endpoint `/api/seasonality` yang memuat data `interval: '1mo'` secara efisien dengan in-memory cache server (15 menit TTL).

### Phase 10 — Custom Symbol Search & Export to CSV (Berikutnya)
- Input pencarian simbol kustom untuk memantau instrumen apa pun di Yahoo Finance.
- Tombol download CSV untuk data kalender bulan terpilih.
