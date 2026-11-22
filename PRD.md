# Product Requirements Document (PRD)
## Forex, Stocks & Crypto Historical Price Calendar

**Versi:** 1.1  
**Status:** Draft  
**Platform:** Web Application

---

## 1. Ringkasan Produk

Aplikasi web sederhana untuk memantau harga historis instrumen Forex, saham, dan cryptocurrency dalam tampilan kalender bulanan.

Setiap tanggal pada kalender menampilkan harga penutupan (*close price*) dan perubahan persentase harian (*daily percentage change*). Pengguna dapat memilih tanggal untuk melihat detail pergerakan harga berupa Open, High, Low, Close (OHLC), serta volume transaksi jika tersedia.

Aplikasi berfokus pada pemantauan data historis, bukan aktivitas trading atau pengelolaan portofolio.

## 2. Tujuan Produk

- Memudahkan pengguna melihat pergerakan harga aset berdasarkan tanggal.
- Menampilkan perubahan harga harian dalam kalender bulanan.
- Memungkinkan pengguna membandingkan pergerakan harga antarhari secara cepat.
- Menyediakan detail OHLC untuk tanggal tertentu.
- Mendukung beberapa kategori aset: Forex, saham, dan cryptocurrency.

## 3. Target Pengguna

Pengguna yang ingin memantau pergerakan harga historis aset secara sederhana tanpa harus membuka aplikasi trading atau platform charting yang kompleks.

## 4. Teknologi

| Komponen | Teknologi |
|---|---|
| Framework | Next.js (App Router) |
| Bahasa | TypeScript |
| UI Components | shadcn/ui |
| Styling | Tailwind CSS |
| Data Provider | Yahoo Finance |
| Data Fetching | Server-side Route Handler |
| Database | Tidak diperlukan |
| ORM | Tidak diperlukan |

### Arsitektur Data

Aplikasi mengambil data langsung dari Yahoo Finance melalui Next.js Route Handler.

Alur pengambilan data:

1. Browser meminta data historis ke endpoint aplikasi.
2. Route Handler memeriksa cache.
3. Jika data tersedia di cache dan belum kedaluwarsa, gunakan data tersebut.
4. Jika tidak tersedia, server mengambil data dari Yahoo Finance.
5. Server mengolah data dan mengembalikan respons JSON.
6. Browser menampilkan data pada kalender.

**Catatan:** Browser tidak boleh mengakses Yahoo Finance secara langsung. Semua permintaan data harus melalui server agar lebih mudah mengelola cache dan menghindari ketergantungan pada akses API dari sisi klien.

Tidak ada PostgreSQL, Prisma, atau penyimpanan database untuk MVP.

## 5. Sumber Data

Yahoo Finance digunakan sebagai penyedia data historis.

Library yang dapat digunakan:
- `yahoo-finance2`

Library tersebut merupakan integrasi tidak resmi dengan Yahoo Finance. Ketersediaan endpoint, rate limit, format data, dan ketentuan penggunaan dapat berubah sewaktu-waktu.

Karena itu, implementasi pengambilan data sebaiknya dibuat dalam modul provider terpisah agar sumber data dapat diganti di kemudian hari tanpa mengubah seluruh aplikasi.

### Contoh instrumen

**Forex**
- EURUSD=X
- GBPUSD=X
- JPY=X (representasi USD/JPY perlu diverifikasi dan disesuaikan)
- AUDUSD=X
- USDIDR=X
- XAUUSD=X (perlu verifikasi simbol)

**Stocks**
- BBCA.JK
- BBRI.JK
- BMRI.JK
- AAPL
- MSFT
- NVDA

**Crypto**
- BTC-USD
- ETH-USD
- BNB-USD
- SOL-USD
- XRP-USD

Daftar simbol merupakan kandidat awal dan perlu diuji ketersediaannya pada Yahoo Finance sebelum dimasukkan ke aplikasi.

## 6. Fitur MVP

### 6.1. Asset Selector

Pengguna dapat memilih instrumen yang ingin dipantau.

Informasi yang ditampilkan:
- Nama atau simbol aset.
- Kategori aset.
- Mata uang harga jika tersedia.

Kategori:
- Forex
- Stocks
- Crypto

Pengguna dapat berpindah instrumen tanpa meninggalkan halaman kalender.

### 6.2. Monthly Price Calendar

Menampilkan harga historis dalam format kalender bulanan.

Komponen kalender:
- Navigasi bulan sebelumnya.
- Navigasi bulan berikutnya.
- Informasi bulan dan tahun aktif.
- Header hari Senin sampai Minggu.
- Grid kalender dengan tujuh kolom.

Setiap tanggal yang memiliki data menampilkan:
- Tanggal.
- Harga penutupan (*close price*).
- Persentase perubahan harian.

Indikator perubahan:
- Hijau: harga naik.
- Merah: harga turun.
- Netral: harga tidak berubah.

Tanggal tanpa data, seperti akhir pekan atau hari libur bursa, tetap ditampilkan sebagai bagian dari kalender tetapi tidak memiliki informasi harga.

### 6.3. Daily Price Detail

Ketika pengguna mengklik tanggal yang memiliki data, aplikasi menampilkan detail harga tanggal tersebut.

Informasi:
- Date
- Open
- High
- Low
- Close
- Previous Close
- Change
- Change Percent
- Volume (jika tersedia)

Detail dapat ditampilkan menggunakan dialog atau panel di samping kalender.

### 6.4. Month Navigation

Pengguna dapat berpindah bulan untuk melihat data historis.

Ketika bulan berubah:
- Aplikasi mengambil data untuk bulan yang dipilih.
- Kalender menampilkan data sesuai bulan aktif.
- Loading indicator ditampilkan selama proses pengambilan data.
- Jika terjadi kegagalan, tampilkan pesan error dan opsi untuk mencoba kembali.

### 6.5. Loading dan Error State

Aplikasi harus memiliki kondisi tampilan untuk:
- Loading data.
- Data berhasil dimuat.
- Tidak ada data.
- Simbol tidak valid atau tidak didukung.
- Kegagalan mengambil data dari provider.
- Kegagalan akibat rate limit atau gangguan layanan.

## 7. Perhitungan Harga

### Daily Change

Perubahan harga harian dihitung menggunakan:

`Change = Current Close - Previous Close`

### Daily Change Percent

`Change Percent = (Current Close - Previous Close) / Previous Close × 100`

Previous Close mengacu pada harga penutupan sesi perdagangan sebelumnya, bukan selalu tanggal kalender sebelumnya.

Untuk hari pertama dalam bulan, server harus mengambil harga penutupan sesi perdagangan sebelumnya agar persentase perubahan dapat dihitung dengan benar.

Jika previous close tidak tersedia atau bernilai nol, persentase perubahan tidak ditampilkan.

## 8. API Specification

### Endpoint

`GET /api/history`

### Query Parameters

| Parameter | Tipe | Wajib | Keterangan |
|---|---|---|---|
| symbol | string | Ya | Simbol instrumen |
| from | string | Ya | Tanggal awal (YYYY-MM-DD) |
| to | string | Ya | Tanggal akhir (YYYY-MM-DD) |

Contoh:

`GET /api/history?symbol=BTC-USD&from=2026-11-01&to=2026-11-30`

### Response

```json
{
  "symbol": "BTC-USD",
  "currency": "USD",
  "data": [
    {
      "date": "2026-11-01",
      "open": 67000,
      "high": 68500,
      "low": 66500,
      "close": 68000,
      "previousClose": 67500,
      "change": 500,
      "changePercent": 0.74,
      "volume": 125000000
    }
  ]
}
```

Catatan:
- `volume` boleh bernilai `null` jika provider tidak menyediakan data.
- Nilai harga harus menggunakan tipe numerik.
- Tanggal menggunakan format `YYYY-MM-DD`.
- Data disusun berdasarkan tanggal secara ascending.

### Validasi API

Server harus memvalidasi:
- Parameter `symbol` tidak kosong.
- Format tanggal valid.
- Tanggal awal tidak lebih besar dari tanggal akhir.
- Rentang tanggal tidak melebihi batas yang ditentukan aplikasi.
- Simbol termasuk simbol yang didukung atau dapat diverifikasi oleh provider.

## 9. Caching Strategy

Untuk mengurangi permintaan berulang ke Yahoo Finance, aplikasi menggunakan cache di sisi server.

Aturan awal:
- Cache berdasarkan kombinasi `symbol`, `from`, dan `to`.
- Cache berlaku selama beberapa menit (misalnya 5 menit).
- Permintaan dengan parameter yang sama menggunakan hasil cache selama masih valid.
- Setelah cache kedaluwarsa, server mengambil data terbaru dari provider.

Untuk MVP, cache sederhana di server dapat digunakan. Jika aplikasi nantinya berjalan pada beberapa instance atau serverless deployment, pertimbangkan shared cache seperti Redis.

Tidak perlu membuat tabel database hanya untuk menyimpan cache.

## 10. User Interface

### Halaman Utama

Layout yang diharapkan:

1. Header aplikasi.
2. Asset selector.
3. Informasi instrumen terpilih.
4. Navigasi bulan.
5. Kalender harga bulanan.
6. Detail harga ketika tanggal dipilih.

### Struktur Kalender

Setiap sel kalender berisi:

- Nomor tanggal.
- Close price.
- Daily percentage change.

Kalender menggunakan custom grid tujuh kolom, bukan kalender standar, karena setiap sel harus menampilkan informasi harga tambahan.

Desain harus responsif dan tetap mudah digunakan pada layar desktop maupun mobile.

## 11. Fitur di Luar Scope MVP

Fitur berikut tidak termasuk dalam pengembangan tahap pertama:

- Trading atau eksekusi order.
- Portfolio management.
- Watchlist kompleks.
- Price alerts.
- Technical indicators.
- Candlestick chart dan advanced charting.
- Multi-user authentication.
- Database dan penyimpanan histori internal.
- Export ke Excel atau CSV.
- News dan fundamental analysis.

## 12. Acceptance Criteria

MVP dianggap selesai apabila:

1. Pengguna dapat memilih instrumen Forex, saham, atau crypto.
2. Aplikasi dapat menampilkan kalender bulanan.
3. Kalender menampilkan close price dan daily percentage change untuk tanggal yang memiliki data.
4. Pengguna dapat berpindah bulan.
5. Pengguna dapat mengklik tanggal untuk melihat detail OHLC.
6. Volume ditampilkan jika tersedia dari provider.
7. Perhitungan daily percentage change menggunakan previous trading session close.
8. Tanggal tanpa data ditampilkan tanpa nilai harga.
9. Aplikasi menampilkan loading dan error state.
10. Data diambil melalui Next.js Route Handler, bukan langsung dari browser.
11. Cache server mengurangi permintaan berulang ke Yahoo Finance.
12. Aplikasi dapat berjalan tanpa database.

## 13. Tahapan Pengembangan

### Phase 1 — Project Setup
- Inisialisasi Next.js App Router.
- Konfigurasi TypeScript.
- Instalasi Tailwind CSS dan shadcn/ui.
- Membuat struktur folder aplikasi.

### Phase 2 — Data Provider
- Instalasi dan konfigurasi `yahoo-finance2`.
- Membuat modul Yahoo Finance provider.
- Mengambil data historis.
- Menghitung previous close, change, dan change percent.
- Membuat API Route Handler.
- Menambahkan caching.

### Phase 3 — Calendar UI
- Membuat asset selector.
- Membuat navigasi bulan.
- Membuat custom monthly calendar grid.
- Menampilkan close price dan persentase perubahan.
- Membuat loading dan error state.

### Phase 4 — Daily Detail
- Menambahkan interaksi klik tanggal.
- Membuat dialog atau detail panel.
- Menampilkan OHLC dan volume.

### Phase 5 — Testing & Refinement
- Menguji berbagai simbol.
- Menguji bulan dengan akhir pekan dan hari libur.
- Menguji perhitungan perubahan harga.
- Menguji cache.
- Menguji tampilan desktop dan mobile.
- Menguji penanganan error provider.

---

**Prinsip utama MVP:** sederhana, cepat, mudah digunakan, dan fokus pada kalender harga historis. Hindari menambahkan fitur yang belum diperlukan sebelum alur utama berjalan dengan baik.