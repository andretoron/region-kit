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

## Public API — Milestone 4

Baseline Milestone 4 mengukur operasi melalui public entry point `region-kit`:

- Inisialisasi melalui `RegionKit.fromData()` dan `RegionKit.fromFile()`.
- Lookup berdasarkan ID dan code.
- Exact, prefix, dan contains search.
- Filtering dan pagination pada hasil besar.
- Children, ancestors, dan descendants traversal.
- Lifecycle `close()`.

Hasil lengkap beserta informasi environment tersedia di
[`public-api-milestone-4.json`](./public-api-milestone-4.json).

### Menjalankan benchmark public API

Jalankan dari repository root:

```bash
pnpm benchmark:public-api
```

Command tersebut membangun package, membuat dataset dan file sementara,
menjalankan warmup serta sepuluh timing iterations, memperbarui baseline JSON,
lalu membersihkan file sementara.

### Dataset dan konfigurasi public API

Dataset sintetis menggunakan pohon seimbang agar traversal tidak diukur pada
hierarki datar:

| Parameter              |     Nilai |
| ---------------------- | --------: |
| Region                 |    11.111 |
| Branching factor       |        10 |
| Kedalaman hierarki     |         4 |
| Leaf region            |    10.000 |
| Ukuran JSON serialized | 1,929 MiB |
| Warmup iterations      |         3 |
| Timing iterations      |        10 |
| Pagination limit       |       100 |
| Pagination offset      |     5.000 |

### Baseline public API tersimpan

Baseline berikut dihasilkan pada Node.js 24.18.0, Windows x64, menggunakan Intel
Core i5-11400H:

| Pengukuran             | Minimum |  Median | Maksimum |
| ---------------------- | ------: | ------: | -------: |
| `fromData()`           | 100,232 | 118,077 |  144,112 |
| `fromFile()`           |  73,358 |  92,150 |  114,034 |
| `getById()`            |   0,004 |   0,005 |    0,023 |
| `findByCode()`         |   0,008 |   0,012 |    0,018 |
| Exact name search      |   8,981 |   9,200 |   14,197 |
| Prefix search          |   9,756 |  10,064 |   12,147 |
| Contains search        |   6,523 |   6,756 |    7,861 |
| Filtering              |   0,559 |   0,582 |    0,754 |
| Pagination hasil besar |   1,278 |   1,343 |    1,488 |
| `childrenOf()`         |   0,025 |   0,027 |    0,035 |
| `ancestorsOf()`        |   0,010 |   0,011 |    0,017 |
| `descendantsOf()`      |   1,935 |   2,055 |    2,119 |
| `close()`              |   0,006 |   0,007 |    0,009 |

Seluruh angka timing menggunakan milidetik. `fromFile()` mencakup pembacaan
file, JSON parsing, validasi, snapshot creation, dan pembangunan index, tetapi
tidak mencakup pembuatan file sementara. Hasil tetap bersifat informasional dan
tidak menjadi threshold CI.
