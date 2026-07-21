# Benchmark

Folder ini menyimpan baseline benchmark informasional untuk `region-kit`.
Benchmark belum menjadi quality gate karena hasilnya dapat berubah mengikuti
dataset, versi Node.js, perangkat keras, dan beban sistem ketika pengukuran
dijalankan.

## Memory store — Milestone 2

Baseline Milestone 2 mengukur biaya utama untuk membangun
`MemoryRegionStore` dari object dataset yang sudah tersedia di memory:

- Validasi dataset.
- Pembangunan runtime indexes.
- Inisialisasi store secara lengkap, termasuk snapshot cloning dan metadata
  projection.
- Perkiraan retained heap setelah store dibuat.

Hasil lengkap beserta informasi environment tersedia di
[`memory-store-milestone-2.json`](./memory-store-milestone-2.json).

### Menjalankan benchmark

Jalankan dari repository root:

```bash
pnpm benchmark:memory
```

Command tersebut membangun package terlebih dahulu, menjalankan Node.js dengan
`--expose-gc`, lalu memperbarui file baseline JSON.

### Dataset dan konfigurasi

Baseline menggunakan dataset sintetis dengan hierarki datar:

| Parameter              |     Nilai |
| ---------------------- | --------: |
| Region                 |    10.000 |
| Ukuran JSON serialized | 1,602 MiB |
| Warmup iterations      |         3 |
| Timing iterations      |        10 |
| Memory iterations      |         5 |

Dataset sintetis membuat benchmark dapat dijalankan tanpa mengunduh artefak
eksternal. Dataset ini bukan pengganti benchmark masa depan menggunakan dataset
produksi yang dikunci.

### Baseline tersimpan

Baseline berikut dihasilkan pada Node.js 24.18.0, Windows x64, menggunakan Intel
Core i5-11400H:

| Pengukuran          |   Minimum |    Median |   Maksimum |
| ------------------- | --------: | --------: | ---------: |
| Validasi            | 13,798 ms | 23,443 ms |  67,721 ms |
| Pembangunan indeks  | 32,015 ms | 43,955 ms |  54,784 ms |
| Inisialisasi store  | 57,843 ms | 91,999 ms | 121,819 ms |
| Retained heap delta | 8,348 MiB | 8,349 MiB |  8,349 MiB |

Inisialisasi store mencakup validasi, snapshot cloning, metadata projection,
dan pembangunan seluruh runtime indexes. Karena tahap-tahap tersebut juga
diukur secara terpisah, nilainya tidak boleh dijumlahkan dengan waktu
inisialisasi store.

### Interpretasi dan batasan

- Angka memory merupakan retained heap delta tingkat proses setelah garbage
  collection, bukan peak RSS dan bukan total memory proses.
- Input dataset sudah dialokasikan sebelum pengukuran retained heap sehingga
  angka tersebut terutama menggambarkan tambahan memory untuk snapshot dan
  indexes milik store.
- Timing dapat berubah antar-run. Baseline digunakan untuk observasi dan
  investigasi regresi besar, bukan sebagai threshold CI.
- Benchmark ini belum mengukur pembacaan file, JSON parsing, lookup latency,
  traversal, atau pagination.
- Performance gate baru layak dipertimbangkan setelah dataset dikunci,
  beberapa baseline environment tersedia, variasi normal diketahui, dan
  threshold regresi dapat dipertanggungjawabkan.
