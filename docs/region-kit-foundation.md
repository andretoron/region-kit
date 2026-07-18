# Region-Kit — Fondasi Proyek

> Status dokumen: Draft awal
> Tujuan: Mencatat keputusan dasar sebelum implementasi dimulai.
> Dokumen ini bersifat hidup dan diperbarui setiap kali keputusan disepakati.

## Gambaran singkat

`region-kit` direncanakan sebagai library Node.js yang framework-agnostic dan sedikit opinionated untuk menggunakan, menavigasi, serta mengolah data wilayah administratif.

Data wilayah tidak diambil langsung oleh `region-kit`. Proses crawling tetap menjadi tanggung jawab proyek terpisah, yaitu `region_squirrel`. Output dari `region_squirrel` menjadi salah satu sumber data yang dapat diproses atau digunakan oleh `region-kit`.

## Status keputusan

- **Belum dibahas** — belum ada keputusan.
- **Disepakati** — keputusan telah diterima sebagai dasar implementasi.
- **Ditunda** — sengaja belum diputuskan karena belum diperlukan.
- **Perlu ditinjau ulang** — keputusan lama mungkin perlu diubah.

---

## 1. Tujuan dan Batas Tanggung Jawab

**Status:** Disepakati

### Tujuan

`region-kit` adalah library Node.js yang framework-agnostic dan sedikit opinionated untuk menelusuri, mencari, memfilter, dan menyajikan data wilayah administratif melalui model serta API yang konsisten.

`region-kit` mengonsumsi dataset matang yang telah memenuhi **Region-Kit Dataset Contract**. Library ini tidak bertanggung jawab membentuk dataset dari data mentah.

### Tanggung Jawab Inti

`region-kit` bertanggung jawab untuk:

- Memuat dataset yang memenuhi **Region-Kit Dataset Contract**.
- Memeriksa kompatibilitas schema dan versi dataset.
- Melakukan validasi internal sebelum dataset digunakan.
- Melakukan lookup wilayah berdasarkan identifier yang didukung, seperti ID atau kode.
- Melakukan pencarian berdasarkan nama wilayah.
- Melakukan filtering berdasarkan level, tipe, parent, atau atribut lain yang didukung.
- Menavigasi hubungan hierarkis:
  - `parent`
  - `children`
  - `ancestors`
  - `descendants`
- Menyajikan data wilayah dan metadata sumber secara konsisten.
- Menghasilkan error yang jelas dan konsisten ketika dataset atau operasi tidak dapat diproses.

### Validasi Internal

Walaupun dataset dianggap sudah matang, `region-kit` tetap wajib melakukan validasi pada batas masuk library.

Validasi internal dapat mencakup:

- Dataset dapat dibaca.
- Versi schema didukung.
- Field wajib tersedia.
- Tipe dan struktur dasar sesuai kontrak.
- Struktur yang diperlukan untuk pencarian dan penelusuran tersedia.
- Kerusakan yang dapat mengganggu operasi dasar dapat dideteksi.

Validasi ini bertujuan memastikan dataset aman digunakan oleh operasi internal dan menghasilkan error yang jelas apabila kontrak tidak terpenuhi.

Validasi internal bukan proses:

- Pembersihan data mentah.
- Normalisasi data.
- Perbaikan dataset.
- Rekonsiliasi antar-sumber.
- Verifikasi penuh terhadap kebenaran faktual data.

Jika dataset tidak memenuhi kontrak, `region-kit` harus menolaknya dan memberikan error yang sesuai. Library tidak boleh memperbaiki atau menormalisasi dataset secara diam-diam.

### Di Luar Tanggung Jawab

`region-kit` tidak bertanggung jawab untuk:

- Melakukan crawling atau scraping.
- Mengunduh data dari situs sumber.
- Membersihkan data mentah.
- Menormalisasi data dari sumber eksternal.
- Memperbaiki dataset yang tidak valid.
- Menjadwalkan pengambilan atau pembaruan dataset.
- Menjamin kebenaran faktual data dari pihak ketiga.
- Menjadi database atau sistem penyimpanan.
- Menyediakan HTTP server, REST API, atau GraphQL API.
- Menyediakan antarmuka pengguna.
- Bergantung pada framework aplikasi tertentu.
- Menyediakan geocoding, routing, rendering peta, atau analisis geospasial penuh.
- Memaksakan seluruh sistem administratif negara lain ke dalam hierarki administratif Indonesia.

### Hubungan dengan `region_squirrel`

`region_squirrel` bertanggung jawab atas pipeline pembentukan dataset, termasuk:

- Mengambil data dari sumber.
- Membersihkan data mentah.
- Menormalisasi data ke format standar.
- Memvalidasi struktur dan hubungan hierarkis.
- Mendeteksi duplikasi, orphan region, dan relasi yang tidak valid.
- Menghasilkan dataset matang.
- Menyertakan metadata sumber dan versi dataset.

Output `region_squirrel` dapat menjadi salah satu dataset resmi yang dikonsumsi oleh `region-kit`, selama output tersebut memenuhi **Region-Kit Dataset Contract**.

`region_squirrel` dan `region-kit` tetap menjadi proyek terpisah dengan tanggung jawab yang berbeda.

### Dukungan terhadap Sumber Lain

Dataset dari sumber selain `region_squirrel` dapat digunakan apabila telah dikonversi dan divalidasi agar memenuhi **Region-Kit Dataset Contract**.

Proses konversi dan validasi tersebut dilakukan oleh tooling atau pipeline terpisah, bukan oleh core `region-kit`.

### Prinsip Batas Sistem

> `region_squirrel` bertanggung jawab menghasilkan dataset yang matang dan benar secara struktural. `region-kit` bertanggung jawab menggunakan dataset tersebut untuk pencarian dan penelusuran, sambil tetap memeriksa kompatibilitas kontraknya sebelum digunakan.

## 2. Target Pengguna dan Lingkungan Runtime

**Status:** Disepakati

### Target Pengguna

`region-kit` ditujukan untuk developer JavaScript dan TypeScript yang membutuhkan kemampuan pencarian, penelusuran, filtering, dan penyajian data wilayah administratif dalam aplikasi Node.js.

Library dapat digunakan pada berbagai jenis aplikasi Node.js, termasuk:

- Backend application.
- Command-line application.
- Data processing pipeline.
- Automation script.
- Development tooling.
- Framework-based application yang berjalan di Node.js.

Penggunaan `region-kit` tidak mengharuskan framework tertentu.

### Target Runtime

`region-kit` secara resmi hanya menargetkan Node.js.

Browser dan edge runtime tidak didukung pada MVP. Keputusan ini memungkinkan `region-kit` menggunakan API bawaan Node.js secara langsung tanpa menyediakan abstraksi atau implementasi alternatif yang belum dibutuhkan.

Dukungan browser atau edge runtime hanya akan dipertimbangkan apabila terdapat kebutuhan nyata pada masa mendatang.

### Bahasa Pengembangan

Source code `region-kit` ditulis menggunakan TypeScript.

Package hasil build harus dapat digunakan oleh:

- Project TypeScript.
- Project JavaScript yang mendukung ESM.

Type definition harus disertakan dalam package agar pengguna TypeScript mendapatkan type checking dan editor support.

### Module System

`region-kit` menggunakan ESM sebagai module system resmi.

Contoh penggunaan:

```ts
import { RegionKit } from "region-kit";
```

Package tidak menyediakan distribusi CommonJS pada MVP.

Contoh berikut tidak didukung:

```js
const { RegionKit } = require("region-kit");
```

Dukungan ESM-only dipilih karena:

- ESM merupakan standar resmi module system JavaScript.
- `region-kit` merupakan proyek baru tanpa kewajiban kompatibilitas dengan pengguna CommonJS lama.
- Dual package ESM dan CommonJS menambah kompleksitas build, konfigurasi package, testing, dan module resolution.
- Dukungan CommonJS belum memberikan manfaat yang sebanding dengan kompleksitas tersebut.

Dukungan CommonJS dapat dievaluasi kembali apabila terdapat kebutuhan pengguna yang nyata.

### Versi Node.js

Versi minimum yang didukung adalah Node.js 22.

Konfigurasi package:

```json
{
  "engines": {
    "node": ">=22"
  }
}
```

Kebijakan dukungan versi Node.js:

- `region-kit` mendukung release line Node.js yang masih berstatus LTS dan diuji secara resmi melalui CI.
- Pada tahap MVP, CI harus menjalankan test suite menggunakan Node.js 22 dan Node.js 24.
- Development utama dapat dilakukan menggunakan Node.js 24 LTS, tetapi kompatibilitas dengan Node.js 22 harus dibuktikan melalui automated testing dan tidak boleh hanya diasumsikan.
- Implementasi harus menghindari penggunaan API yang hanya tersedia pada Node.js 24 apabila tidak tersedia alternatif yang kompatibel dengan Node.js 22.
- Node.js 26 akan ditambahkan sebagai target pengujian setelah release line tersebut berstatus LTS.
- Versi Node.js yang telah mencapai End-of-Life tidak didukung, meskipun masih dapat menjalankan sebagian fungsi library.

### Dukungan Filesystem

Karena `region-kit` secara resmi menargetkan Node.js, library dapat menggunakan API filesystem bawaan Node.js untuk memuat dataset dari file lokal.

Contoh API yang diharapkan:

```ts
import { RegionKit } from "region-kit";

const regions = await RegionKit.fromFile("./data/regions.json");
```

API filesystem dapat diekspos langsung melalui package utama. Subpath export seperti `region-kit/node` belum diperlukan pada MVP.

Pemisahan antara logika pencarian, penelusuran, dan pemuatan file tetap dilakukan secara internal agar struktur source code terjaga.

### Independensi Framework

`region-kit` tidak bergantung pada framework aplikasi tertentu.

Library harus dapat digunakan dalam project berbasis:

- Node.js standar.
- Express.
- Fastify.
- NestJS.
- Next.js pada lingkungan server.
- Framework Node.js lainnya.

Daftar tersebut bukan jaminan integrasi khusus. Framework hanya bertindak sebagai consumer dari public API `region-kit`.

`region-kit` tidak boleh mengimpor, mengharuskan, atau menyesuaikan core API terhadap framework tertentu.

### Ringkasan Keputusan

| Aspek                    | Keputusan                           |
| ------------------------ | ----------------------------------- |
| Target pengguna          | Developer JavaScript dan TypeScript |
| Runtime resmi            | Node.js                             |
| Browser                  | Tidak didukung pada MVP             |
| Edge runtime             | Tidak didukung pada MVP             |
| Bahasa source code       | TypeScript                          |
| Konsumen package         | TypeScript dan JavaScript ESM       |
| Module system            | ESM-only                            |
| CommonJS                 | Tidak didukung pada MVP             |
| Versi minimum Node.js    | Node.js 22                          |
| Versi pengujian CI awal  | Node.js 22 dan Node.js 24           |
| Node.js 26               | Didukung setelah berstatus LTS      |
| Filesystem API           | Diekspos melalui package utama      |
| Ketergantungan framework | Tidak ada                           |

Exit code: 0
Wall time: 0.3 seconds
Output:

## 3. Model Data Wilayah

**Status:** Disepakati

### Tujuan Model Data

Model data `region-kit` harus menyediakan representasi wilayah administratif yang:

- Konsisten.
- Dapat digunakan untuk pencarian dan penelusuran hierarki.
- Tidak terikat pada struktur administratif Indonesia.
- Tidak bergantung pada format asli sumber data.
- Dapat dikembangkan untuk negara lain pada masa mendatang.
- Tetap sederhana untuk kebutuhan MVP.

Model data terdiri atas dua bagian utama:

- `Region`, yang merepresentasikan satu wilayah administratif.
- `RegionDataset`, yang membungkus kumpulan wilayah beserta metadata dataset.

### Model `Region`

```ts
interface Region {
  id: string;
  code: string;
  name: string;
  level: number;
  type: string;
  parentId: string | null;
  aliases?: string[];
  attributes?: Record<string, unknown>;
}
```

Contoh:

```json
{
  "id": "id:bps:3273",
  "code": "3273",
  "name": "Kota Bandung",
  "level": 2,
  "type": "city",
  "parentId": "id:bps:32",
  "aliases": ["Bandung City"]
}
```

### Identitas Internal

Field `id` merupakan identitas unik internal untuk setiap wilayah di dalam dataset.

Ketentuan `id`:

* Wajib tersedia.
* Bertipe string.
* Harus unik di dalam dataset.
* Bersifat opaque bagi pengguna.
* Tidak boleh diasumsikan memiliki format tertentu oleh consumer.
* Tidak boleh digunakan dengan cara membongkar bagian-bagian string-nya.

Contoh:

```json
{
  "id": "id:bps:3273"
}
```

Format pembentukan `id` ditentukan oleh pipeline pembuat dataset dan harus tetap stabil selama identitas wilayah yang direpresentasikan tidak berubah.

### Kode Wilayah

Field `code` merupakan kode wilayah yang berasal dari sumber data.

Ketentuan `code`:

* Wajib tersedia.
* Bertipe string.
* Nilai asli harus dipertahankan, termasuk leading zero.
* Tidak diasumsikan unik secara global.
* Dapat digunakan untuk lookup dalam cakupan dataset.

`id` dan `code` memiliki tanggung jawab berbeda:

* `id` digunakan sebagai identitas internal dan relasi.
* `code` digunakan sebagai kode resmi atau kode sumber.

### Nama dan Alias

Field `name` merupakan nama utama wilayah yang digunakan untuk penyajian dan pencarian.

```ts
name: string;
```

Field `aliases` bersifat opsional dan berisi nama alternatif yang dapat digunakan dalam pencarian.

```ts
aliases?: string[];
```

Alias dapat berupa:

* Nama lama.
* Nama tidak resmi yang umum digunakan.
* Singkatan.
* Variasi penulisan.
* Nama dalam bahasa lain.
* Bentuk nama tanpa awalan administratif jika memang diperlukan.

Nilai dalam `aliases` tidak menggantikan `name` sebagai nama utama.

`region_squirrel` belum wajib menghasilkan alias pada tahap awal. Field tersebut tetap menjadi bagian opsional dari kontrak agar dataset dapat dikembangkan sesuai kebutuhan dunia nyata.

Alias harus berasal dari sumber atau aturan transformasi yang dapat dipertanggungjawabkan. `region-kit` tidak membuat alias secara otomatis.

### Level Administratif

Field `level` menyatakan kedalaman wilayah dalam hierarki administratif.

```ts
level: number;
```

Level dimulai dari `0`:

| Level | Contoh untuk Indonesia |
| ----- | ---------------------- |
| `0`   | Negara                 |
| `1`   | Provinsi               |
| `2`   | Kabupaten atau kota    |
| `3`   | Kecamatan              |
| `4`   | Desa atau kelurahan    |

Entitas negara wajib dimasukkan sebagai root pada level `0`.

Contoh:

```json
{
  "id": "id:bps:country:ID",
  "code": "ID",
  "name": "Indonesia",
  "level": 0,
  "type": "country",
  "parentId": null
}
```

Hanya region root yang boleh memiliki `parentId` bernilai `null`.

Nilai dan makna level di luar Indonesia dapat berbeda, tetapi aturan hierarkinya tetap sama: level child harus lebih dalam daripada level parent.

### Tipe Wilayah

Field `type` menyatakan kategori administratif suatu wilayah.

```ts
type: string;
```

`type` dipisahkan dari `level` karena beberapa tipe wilayah dapat berada pada level yang sama.

Contoh:

```text
regency
city
```

Keduanya dapat berada pada level `2`, tetapi merepresentasikan kategori administratif yang berbeda.

Nilai `type` tidak dikunci secara global oleh core `region-kit`. Setiap dataset dapat mendefinisikan tipe administratif sesuai negara dan sumbernya, selama digunakan secara konsisten.

### Relasi Hierarkis

Relasi langsung antarwilayah disimpan melalui:

```ts
parentId: string | null;
```

Ketentuan relasi:

* `parentId` harus merujuk pada `id` region lain dalam dataset yang sama.
* Region root memiliki `parentId: null`.
* Region selain root wajib memiliki parent.
* Sebuah region tidak boleh menjadi parent bagi dirinya sendiri.
* Relasi tidak boleh membentuk siklus.
* Relasi tidak boleh menunjuk pada region yang tidak tersedia.

Dataset tidak perlu menyimpan field berikut pada setiap region:

* `childrenIds`
* `ancestorIds`
* `descendantIds`
* `path`

`region-kit` membangun indeks relasi yang diperlukan ketika dataset dimuat. Dengan demikian, `parentId` tetap menjadi satu-satunya sumber kebenaran untuk hubungan hierarkis.

### Atribut Tambahan

Field `attributes` dapat digunakan untuk menyimpan informasi tambahan yang tidak termasuk dalam model inti.

```ts
attributes?: Record<string, unknown>;
```

Contoh:

```json
{
  "attributes": {
    "postalCode": "40111",
    "sourceLabel": "KOTA BANDUNG"
  }
}
```

Ketentuan penggunaan `attributes`:

* Bersifat opsional.
* Tidak digunakan sebagai pengganti field inti.
* Tidak boleh berisi data yang diperlukan oleh operasi dasar `region-kit`.
* Dapat berisi informasi khusus negara atau sumber.
* Tidak dijamin memiliki struktur yang sama antar-dataset.

Field yang kemudian terbukti menjadi kebutuhan utama lintas dataset dapat dipromosikan menjadi bagian resmi model pada versi schema berikutnya.

### Wilayah Nonaktif dan Data Historis

Dataset MVP hanya memuat wilayah yang aktif pada versi dataset tersebut.

Wilayah nonaktif, wilayah historis, pemekaran, penggabungan, penggantian kode, serta perubahan batas administratif belum menjadi bagian dari MVP.

Karena MVP hanya memuat wilayah aktif, field `status` tidak dimasukkan ke model awal. Menambahkan `status: "active"` pada seluruh record tidak memberikan informasi yang berguna dan dapat memberikan kesan seolah-olah data historis sudah didukung.

Dukungan data historis akan memerlukan model yang lebih lengkap, seperti:

```ts
status: "active" | "inactive";
validFrom?: string;
validTo?: string;
replacedBy?: string[];
replaces?: string[];
```

Model tersebut hanya akan ditambahkan setelah aturan temporal, identitas wilayah, dan perubahan administratif didefinisikan dengan jelas.

### Model `RegionDataset`

```ts
interface RegionDataset {
  schemaVersion: string;
  datasetVersion: string;
  country: {
    code: string;
    name: string;
  };
  source: {
    id: string;
    name: string;
    url?: string;
    retrievedAt?: string;
  };
  generatedAt: string;
  regions: Region[];
}
```

Contoh:

```json
{
  "schemaVersion": "1.0.0",
  "datasetVersion": "2026.1.0",
  "country": {
    "code": "ID",
    "name": "Indonesia"
  },
  "source": {
    "id": "bps",
    "name": "Badan Pusat Statistik",
    "url": "https://www.bps.go.id",
    "retrievedAt": "2026-07-01T08:00:00.000Z"
  },
  "generatedAt": "2026-07-01T09:00:00.000Z",
  "regions": []
}
```

### Cakupan Negara

Satu `RegionDataset` hanya mencakup satu negara.

Keputusan ini dipilih karena:

* Setiap negara dapat memiliki struktur administratif berbeda.
* Dataset lebih mudah divalidasi dan diperbarui secara independen.
* Ukuran dan versi dataset dapat dikelola per negara.
* Kegagalan atau perubahan pada satu negara tidak memengaruhi negara lain.
* Consumer dapat memuat hanya negara yang dibutuhkan.

Aplikasi tetap dapat menggunakan beberapa dataset negara secara bersamaan melalui instance atau mekanisme agregasi pada level aplikasi.

### Cakupan Sumber

Pada MVP, satu `RegionDataset` memiliki satu sumber utama yang bertanggung jawab atas data wilayah di dalamnya.

Contoh:

```text
Indonesia + BPS = satu dataset
Indonesia + Kemendagri = dataset lain
```

Data dari beberapa sumber tidak digabungkan secara diam-diam ke dalam satu dataset karena:

* Kode wilayah antar-sumber dapat berbeda.
* Struktur administratif dapat berbeda.
* Waktu pembaruan dapat berbeda.
* Konflik data memerlukan aturan rekonsiliasi yang eksplisit.
* Provenance setiap nilai akan menjadi tidak jelas.

Jika pada masa mendatang diperlukan dataset gabungan, proses rekonsiliasi harus dilakukan oleh pipeline terpisah. Hasilnya harus dipublikasikan sebagai dataset baru dengan identitas sumber yang jelas, bukan dianggap sebagai dataset dari salah satu sumber aslinya.

### Versi Schema dan Dataset

`schemaVersion` dan `datasetVersion` memiliki fungsi berbeda:

* `schemaVersion` menunjukkan versi struktur atau kontrak data.
* `datasetVersion` menunjukkan versi isi dataset.

Perubahan data wilayah tanpa perubahan struktur hanya menaikkan `datasetVersion`.

Perubahan field, tipe, atau aturan kontrak dapat menaikkan `schemaVersion`.

Kedua nilai harus diperlakukan sebagai string dan mengikuti aturan versioning yang akan ditetapkan secara terpisah.

### Validasi Dasar Model

Saat dataset dimuat, `region-kit` harus memeriksa sekurangnya:

* Metadata wajib tersedia.
* `schemaVersion` didukung.
* Hanya terdapat satu root.
* Root berada pada level `0`.
* Root memiliki tipe `country`.
* Root memiliki `parentId: null`.
* Semua `id` unik.
* Semua `parentId` valid.
* Tidak terdapat orphan region.
* Tidak terdapat self-reference.
* Tidak terdapat siklus hierarki.
* Field wajib memiliki tipe yang sesuai.
* Setiap region selain root memiliki parent.
* Struktur hierarki dapat diindeks untuk pencarian dan penelusuran.

Validasi tersebut tidak mengubah atau memperbaiki dataset.

### Ringkasan Keputusan

| Aspek                  | Keputusan                           |
| ---------------------- | ----------------------------------- |
| Model wilayah          | Generik dan tidak terikat Indonesia |
| Root hierarchy         | Negara pada level `0`               |
| Identitas internal     | `id` bertipe string dan opaque      |
| Kode sumber            | Disimpan pada `code`                |
| Nama utama             | Disimpan pada `name`                |
| Nama alternatif        | `aliases` opsional                  |
| Posisi hierarki        | Disimpan pada `level`               |
| Kategori administratif | Disimpan pada `type`                |
| Relasi utama           | `parentId`                          |
| Relasi turunan         | Dibangun oleh `region-kit`          |
| Atribut khusus         | Disimpan pada `attributes`          |
| Wilayah nonaktif       | Tidak termasuk MVP                  |
| Data historis          | Ditunda setelah MVP                 |
| Cakupan dataset        | Satu negara                         |
| Sumber dataset         | Satu sumber utama                   |
| Metadata sumber        | Disimpan pada level dataset         |
| Versi struktur         | `schemaVersion`                     |
| Versi isi              | `datasetVersion`                    |

## 4. Arsitektur Library

**Status:** Disepakati — direvisi untuk mendukung beberapa jenis storage

### Pendekatan Arsitektur

Core `region-kit` menggunakan **single package dengan modular monolith internal** pada MVP. Core menentukan model domain, public API, kontrak storage, tipe query, validasi, dan error model.

Arsitektur harus memungkinkan penggunaan JSON di memory serta database tanpa membuat core bergantung pada PostgreSQL, MySQL, MongoDB, atau driver tertentu.

```text
RegionKit Public API
        ↓
Read-Only RegionStore Contract
        ├── Memory/JSON Store
        ├── PostgreSQL Adapter
        ├── MySQL Adapter
        ├── MongoDB Adapter
        └── Custom Adapter
```

Core MVP tetap satu package. Adapter database resmi dapat diterbitkan sebagai package terpisah ketika diimplementasikan agar dependency dan siklus rilisnya tidak membebani pengguna yang hanya membutuhkan JSON.

### Public Facade

Class `RegionKit` menjadi pintu masuk utama dan menyembunyikan strategi storage dari consumer.

```ts
const regions = await RegionKit.fromFile("./regions.json");

const bandung = await regions.findByCode("3273");
const children = await regions.childrenOf("id:bps:32");
```

Instance yang menggunakan database menyediakan bentuk query yang sama:

```ts
const regions = await RegionKit.fromStore(store);

const bandung = await regions.findByCode("3273");
```

Consumer tidak boleh bergantung pada struktur internal memory store, query SQL, MongoDB query, atau indeks suatu adapter.

### Public API Asinkron

Semua operasi query public menggunakan `Promise`, termasuk ketika storage yang digunakan adalah memory store.

Keputusan ini menjaga satu kontrak API yang konsisten untuk JSON, SQL, dan non-SQL serta mencegah breaking change ketika database adapter ditambahkan.

```ts
const region = await regions.getById(id);
const matches = await regions.search(query);
const children = await regions.childrenOf(id);
```

### Read-Only Storage Contract

Core mendefinisikan kontrak storage read-only yang harus dipenuhi setiap adapter.

Contoh konseptual:

```ts
interface RegionStore {
  getById(id: string): Promise<Region | null>;
  findByCode(code: string): Promise<Region[]>;
  findByName(name: string): Promise<Region[]>;
  search(query: RegionSearchQuery): Promise<Region[]>;
  filter(criteria: RegionFilter): Promise<Region[]>;
  parentOf(id: string): Promise<Region | null>;
  childrenOf(id: string): Promise<Region[]>;
  ancestorsOf(id: string): Promise<Region[]>;
  descendantsOf(id: string): Promise<Region[]>;
}
```

Kontrak final, pagination, sorting, connection lifecycle, dan capability negotiation ditetapkan ketika public API dirancang.

`region-kit` tetap merupakan query library. Runtime API tidak menyediakan `addRegion()`, `updateRegion()`, atau `deleteRegion()`. Penulisan data dilakukan oleh import tooling atau pipeline terpisah.

### Memory/JSON Store

Memory store merupakan implementasi default pada MVP.

`fromData()` menerima object JavaScript, sedangkan `fromFile()` membaca JSON dan meneruskannya ke alur validasi yang sama.

```ts
const fromObject = await RegionKit.fromData(dataset);
const fromFile = await RegionKit.fromFile("./regions.json");
```

Setelah validasi penuh, memory store membangun indeks runtime, sekurangnya:

- ID index.
- Code index.
- Parent-to-children index.
- Normalized-name index.
- Level index.
- Type index.

Indeks tersebut hanya merupakan strategi implementasi memory store. Database adapter tidak diwajibkan membangun struktur yang sama di memory dan harus memanfaatkan query serta indeks native database.

### Database Adapter

Adapter database mengimplementasikan `RegionStore` menggunakan kemampuan storage masing-masing:

- PostgreSQL dan MySQL menggunakan query, constraint, transaction, serta database index.
- MongoDB menggunakan collection query dan MongoDB index.
- Custom adapter dapat menggunakan storage lain selama memenuhi kontrak dan semantic public API.

Core tidak boleh memuat seluruh isi database ke memory hanya untuk melakukan query. Filtering, pagination, pencarian, dan traversal sebisa mungkin dijalankan oleh database.

Adapter resmi direncanakan bertahap:

1. Memory/JSON store dalam core MVP.
2. PostgreSQL adapter sebagai adapter database pertama.
3. MySQL adapter.
4. MongoDB adapter.

Urutan setelah PostgreSQL dapat berubah berdasarkan kebutuhan dan hasil implementasi.

### Query Semantics dan Strategi Eksekusi

Core mendefinisikan nama operasi, input, output, dan perilakunya. Adapter menentukan strategi eksekusi yang sesuai dengan storage.

Pencarian MVP tetap bersifat deterministik, meliputi:

- Case-insensitive matching.
- Normalisasi whitespace.
- Exact match.
- Prefix match.
- Substring match.
- Pencarian terhadap `name` dan `aliases`.

Semantic pencarian harus didefinisikan cukup presisi agar hasil antar-adapter tidak berbeda tanpa alasan yang terdokumentasi. Fuzzy search, typo tolerance, stemming, dan ranking kompleks belum menjadi bagian dari MVP.

### Validasi Berdasarkan Storage

Memory/JSON store melakukan validasi penuh ketika dataset dimuat, termasuk metadata, field, ID, root, parent, level, orphan, self-reference, dan siklus.

Database tidak divalidasi penuh pada setiap startup karena pemindaian seluruh record akan mahal. Validasi dibagi menjadi:

#### Validasi saat import

- Validasi penuh Region-Kit Dataset Contract.
- Validasi hubungan hierarkis.
- Validasi schema dan dataset version.
- Penulisan atomik atau transactional apabila didukung.
- Pembuatan constraint dan indeks database yang diperlukan.

#### Validasi saat runtime

- Koneksi dapat digunakan.
- Tabel, schema, atau collection tersedia.
- Storage schema version didukung.
- Metadata dataset tersedia.
- Query dasar dapat dijalankan.

Runtime mempercayai bahwa data database telah dimasukkan melalui proses import yang benar dan tidak memindai ulang seluruh dataset pada setiap inisialisasi.

### Import Tooling

Import data ke database merupakan write-side tooling yang terpisah dari runtime query API.

Alur yang direncanakan:

```text
Region-squirrel release JSON
        ↓
Checksum verification
        ↓
Full contract validation
        ↓
Database importer
        ↓
Database schema, metadata, constraints, and indexes
        ↓
Read-only RegionKit runtime
```

Import CLI belum wajib menjadi bagian core MVP. Tool tersebut dikembangkan setelah storage contract dan database schema stabil.

### Error Model

`region-kit` menggunakan error class dan stable error code. Selain error dataset, dukungan storage membutuhkan kategori seperti:

```text
RegionKitError
├── DatasetLoadError
├── DatasetParseError
├── DatasetValidationError
├── UnsupportedSchemaError
├── RegionNotFoundError
├── StorageConnectionError
├── StorageCompatibilityError
└── StorageQueryError
```

Error storage harus membungkus error asli melalui `cause` tanpa membocorkan detail sensitif connection string atau credential.

### Extension Point

Extension point resmi adalah implementasi `RegionStore`, bukan plugin system umum atau adapter registry global.

```ts
const store = new CustomRegionStore(options);
const regions = await RegionKit.fromStore(store);
```

Core tidak menggunakan dependency injection container. Dependency diberikan secara eksplisit melalui constructor atau factory.

### Struktur Package dan Source Awal

Core MVP:

```text
region-kit/
└── src/
    ├── index.ts
    ├── region-kit.ts
    ├── dataset/
    │   ├── loader.ts
    │   ├── validator.ts
    │   └── schema.ts
    ├── store/
    │   ├── region-store.ts
    │   └── memory-region-store.ts
    ├── query/
    │   ├── types.ts
    │   └── semantics.ts
    ├── errors/
    ├── types/
    └── internal/
```

Package adapter masa depan dapat berbentuk:

```text
region-kit
@region-kit/postgresql
@region-kit/mysql
@region-kit/mongodb
```

Nama package final akan diputuskan ketika strategi repository dan distribusi package dibahas.

### Ringkasan Keputusan Arsitektur

| Aspek | Keputusan |
| --- | --- |
| Core MVP | Single package modular monolith |
| Public facade | `RegionKit` |
| Storage boundary | Read-only `RegionStore` contract |
| Public query | Selalu asinkron |
| Default storage | Memory/JSON |
| Runtime indexes | Khusus memory store |
| Database query | Dieksekusi native oleh adapter |
| Mutasi runtime | Tidak didukung |
| Import database | Tooling terpisah |
| Database adapter pertama | PostgreSQL |
| Driver database dalam core | Tidak ada |
| Extension point | Implementasi `RegionStore` |
| Plugin system umum | Tidak digunakan |
| Dependency injection | Explicit dependency melalui constructor/factory |
| Optimasi | Berdasarkan benchmark nyata |

## 5. Penyimpanan dan Distribusi Data

**Status:** Disepakati

### Pemisahan Library dan Dataset

Package `region-kit` tidak membundel dataset wilayah.

Instalasi core hanya membawa runtime library, type definitions, validator, kontrak storage, query semantics, memory store, dan JSON loader.

```bash
npm install region-kit
```

Pemisahan ini dipilih karena:

- Library dan dataset memiliki siklus pembaruan berbeda.
- Perubahan data wilayah tidak seharusnya memerlukan release core.
- Ukuran package core tetap kecil.
- Pengguna hanya mengambil dataset yang diperlukan.
- Negara dan sumber berbeda dapat dikelola secara independen.
- Satu versi library dapat menggunakan beberapa versi dataset yang kompatibel.

### Distribusi Dataset Resmi

Dataset matang diterbitkan melalui release `region_squirrel`, bukan melalui package utama `region-kit`.

Contoh artefak release:

```text
indonesia-bps-regions-v1.0.0.json
indonesia-bps-regions-v1.0.0.json.sha256
```

Metadata release sekurangnya memuat:

- Negara.
- Sumber data.
- `schemaVersion`.
- `datasetVersion`.
- Waktu pembuatan.
- Ukuran file.
- SHA-256 checksum.

Checksum digunakan untuk memastikan file tidak rusak atau berubah selama distribusi. Verifikasi checksum dilakukan oleh pengguna, deployment pipeline, atau import tooling sebelum dataset digunakan.

### JSON sebagai Format Pertukaran Resmi

JSON menjadi format pertukaran resmi pada MVP dan format default untuk penggunaan tanpa database.

JSON dipilih karena dapat merepresentasikan metadata dataset, `aliases`, `attributes`, dan struktur kontrak tanpa parser eksternal.

CSV dapat tetap menjadi output tambahan `region_squirrel`, tetapi tidak menjadi input resmi core `region-kit` pada MVP. CSV harus dikonversi menjadi Region-Kit Dataset Contract sebelum digunakan.

### Mode Memory/JSON

Dalam mode default, seluruh dataset:

1. Dibaca dari file atau object JavaScript.
2. Diparse jika berasal dari file.
3. Divalidasi penuh.
4. Disimpan di memory.
5. Dibentuk menjadi runtime indexes.
6. Diakses melalui public API asinkron.

Mode ini tidak memerlukan database dan cocok untuk aplikasi kecil hingga menengah, CLI, automation, development tooling, serta deployment yang mengutamakan kesederhanaan.

Memory store dapat lebih cepat daripada database untuk lookup lokal karena tidak memiliki network round-trip. Database bukan pengganti otomatis yang selalu lebih cepat; pilihan storage ditentukan oleh skala, pola query, concurrency, dan kebutuhan operasional.

### Mode Database

`region-kit` dirancang agar dapat menggunakan database SQL dan non-SQL melalui adapter.

Target adapter:

- PostgreSQL.
- MySQL.
- MongoDB.

Database lebih sesuai ketika:

- Banyak process atau service menggunakan dataset yang sama.
- Dataset tidak efisien dimuat penuh pada setiap process.
- Dibutuhkan pagination dan filtering pada data besar.
- Query dan concurrency meningkat.
- Indeks perlu dikelola secara terpusat.
- Aplikasi sudah memiliki infrastruktur database.

Adapter harus menggunakan kemampuan native storage dan tidak memindahkan seluruh isi database ke memory untuk menjalankan query.

### Distribusi Adapter Database

Driver dan adapter database tidak dimasukkan ke core package.

Adapter resmi direncanakan sebagai package terpisah, misalnya:

```text
@region-kit/postgresql
@region-kit/mysql
@region-kit/mongodb
```

Dengan pemisahan tersebut, pengguna hanya memasang adapter dan driver yang dibutuhkan. Nama package final ditentukan kemudian.

Core MVP menyediakan memory/JSON store terlebih dahulu. Dukungan database dikembangkan secara bertahap dengan PostgreSQL sebagai prioritas pertama.

### Penyimpanan Database

Database menyimpan sekurangnya:

- Metadata dataset.
- Region records.
- Relasi parent-child.
- Storage schema version.
- Indeks yang dibutuhkan adapter.

Database schema merupakan detail milik adapter, tetapi semantic data harus tetap mengikuti Region-Kit Dataset Contract.

Constraint database harus digunakan jika tersedia untuk membantu menjaga keunikan ID, validitas nilai wajib, dan integritas relasi. Pencegahan siklus atau validasi hierarki kompleks dapat tetap dilakukan oleh importer apabila tidak praktis diterapkan sebagai constraint database.

### Import ke Database

Dataset database berasal dari artefak matang `region_squirrel` atau dataset lain yang memenuhi kontrak.

Proses import bertanggung jawab untuk:

- Memverifikasi checksum jika tersedia.
- Memvalidasi dataset secara penuh.
- Memeriksa kompatibilitas schema.
- Membuat atau memeriksa storage schema.
- Menulis metadata dan region records.
- Membuat constraint serta indeks.
- Menghindari kondisi dataset terisi sebagian.
- Menggunakan transaction atau mekanisme atomik jika didukung.

Import bukan bagian dari operasi query runtime dan tidak dilakukan secara otomatis saat aplikasi dimulai.

### Tidak Ada Download Otomatis Saat Runtime

Core `region-kit` tidak mengunduh dataset dari internet secara otomatis.

Pengambilan dan pembaruan dataset dilakukan melalui:

- Proses manual.
- Script aplikasi.
- CI/CD.
- Deployment pipeline.
- Import tooling.

Keputusan ini mencegah startup aplikasi bergantung pada jaringan, menghindari perubahan dataset tanpa disadari, dan menjaga deployment tetap reproducible.

### Versioning Terpisah

Versi core library, schema kontrak, isi dataset, dan storage schema merupakan konsep berbeda.

```text
region-kit version:       1.2.0
schemaVersion:            1.0.0
datasetVersion:           2026.7.0
storageSchemaVersion:     1.0.0
```

- Versi `region-kit` berubah ketika runtime atau public API berubah.
- `schemaVersion` berubah ketika Region-Kit Dataset Contract berubah.
- `datasetVersion` berubah ketika isi dataset diperbarui.
- `storageSchemaVersion` berubah ketika struktur penyimpanan milik adapter berubah.

Adapter bertanggung jawab memeriksa kompatibilitas storage schema. Core dan importer bertanggung jawab memeriksa kompatibilitas dataset schema sesuai konteksnya.

### Kompatibilitas Schema

Aturan awal:

- Schema patch harus backward-compatible.
- Schema minor hanya boleh menambahkan kemampuan secara backward-compatible.
- Schema major dapat membawa breaking change.
- Dataset dengan major schema yang tidak didukung harus ditolak.

Aturan ini diformalisasi ketika JSON Schema atau kontrak validasi dibuat.

### Kompresi

Dataset release boleh menyediakan format terkompresi seperti `.json.gz` untuk mengurangi ukuran transfer.

Pada MVP, `fromFile()` hanya diwajibkan menerima JSON biasa. File terkompresi didekompresi oleh pengguna, deployment pipeline, atau import tooling sebelum diberikan kepada core.

Dukungan kompresi langsung hanya ditambahkan jika ukuran dataset dan pola penggunaan membuktikan kebutuhan tersebut.

### Strategi Loading dan Performa

Memory/JSON store menggunakan eager loading dan runtime indexing pada MVP.

Database adapter menggunakan query, pagination, dan indeks native storage. Core tidak menyamakan strategi performa semua adapter.

Benchmark harus mengukur sekurangnya:

- Ukuran file JSON.
- Waktu parsing.
- Waktu validasi.
- Waktu pembangunan indeks memory.
- Penggunaan memory.
- Latency lookup dan traversal.
- Latency database termasuk network round-trip.
- Performa import database.

Streaming JSON, lazy loading, partial dataset loading, dan caching persisten ditunda sampai benchmark menunjukkan kebutuhan nyata.

### Ringkasan Keputusan Penyimpanan dan Distribusi

| Aspek | Keputusan |
| --- | --- |
| Dataset dalam core package | Tidak dibundel |
| Penerbit dataset resmi | Release `region_squirrel` |
| Integritas release | SHA-256 checksum |
| Format pertukaran MVP | JSON |
| Default storage | Memory/JSON |
| SQL target | PostgreSQL dan MySQL |
| Non-SQL target | MongoDB |
| Prioritas database pertama | PostgreSQL |
| Adapter database | Package terpisah |
| Driver database dalam core | Tidak ada |
| Query database | Native melalui adapter |
| Import database | Tooling terpisah dari runtime |
| Download runtime otomatis | Tidak didukung |
| Validasi file | Penuh saat loading |
| Validasi database penuh | Saat import |
| Validasi database runtime | Koneksi dan kompatibilitas |
| Versi library, schema, dataset, storage | Dipisahkan |
| Kompresi release | Boleh disediakan |
| Loading memory | Eager pada MVP |
| Optimasi lanjutan | Berdasarkan benchmark |

## 6. Public API

**Status:** Disepakati

### Prinsip Public API

Public API merupakan kontrak stabil antara `region-kit` dan consumer. Implementasi internal serta strategi storage dapat berubah selama perilaku public API tetap kompatibel.

Public API harus:

- Selalu asinkron.
- Konsisten antara memory/JSON dan database adapter.
- Bersifat read-only.
- Tidak mengekspos query atau struktur internal storage.
- Memberikan hasil yang deterministik.
- Mendukung pagination untuk operasi yang dapat menghasilkan banyak data.
- Memiliki perilaku yang jelas ketika data tidak ditemukan.
- Menggunakan error class dan stable error code.

### Inisialisasi

Instance dibuat melalui static asynchronous factory. Constructor `RegionKit` tidak menjadi bagian public API.

#### Dari file JSON

```ts
const regions = await RegionKit.fromFile("./data/regions.json");
```

#### Dari object JavaScript

```ts
const regions = await RegionKit.fromData(dataset);
```

#### Dari storage adapter

```ts
const store = new PostgresRegionStore({ connection });
const regions = await RegionKit.fromStore(store);
```

Static factory dipilih karena proses inisialisasi dapat melibatkan parsing, validasi, pembangunan indeks, pemeriksaan koneksi, dan pemeriksaan storage schema secara asinkron.

Signature konseptual:

```ts
class RegionKit {
  static fromFile(
    path: string | URL,
    options?: FileLoadOptions,
  ): Promise<RegionKit>;

  static fromData(
    dataset: unknown,
    options?: DataLoadOptions,
  ): Promise<RegionKit>;

  static fromStore(
    store: RegionStore,
    options?: StoreOptions,
  ): Promise<RegionKit>;
}
```

### Operasi Public Utama

```ts
class RegionKit {
  getMetadata(): Promise<DatasetMetadata>;

  getById(id: string): Promise<Region | null>;
  requireById(id: string): Promise<Region>;

  findByCode(
    code: string,
    options?: FindOptions,
  ): Promise<RegionPage>;

  findByName(
    name: string,
    options?: FindByNameOptions,
  ): Promise<RegionPage>;

  search(
    query: string,
    options?: SearchOptions,
  ): Promise<RegionSearchPage>;

  filter(
    criteria: RegionFilter,
    options?: QueryOptions,
  ): Promise<RegionPage>;

  parentOf(id: string): Promise<Region | null>;

  childrenOf(
    id: string,
    options?: QueryOptions,
  ): Promise<RegionPage>;

  ancestorsOf(id: string): Promise<readonly Region[]>;

  descendantsOf(
    id: string,
    options?: DescendantOptions,
  ): Promise<RegionPage>;

  close(): Promise<void>;
}
```

Signature tersebut menjadi arah kontrak MVP. Detail tipe dapat disempurnakan selama implementasi tanpa mengubah semantic yang telah disepakati.

### Lookup Berdasarkan ID

`id` unik dalam dataset. `getById()` mengembalikan satu region atau `null`.

```ts
const region = await regions.getById("id:bps:3273");

if (region === null) {
  // Region tidak ditemukan.
}
```

Jika keberadaan region diwajibkan, consumer menggunakan `requireById()`:

```ts
const region = await regions.requireById("id:bps:3273");
```

`requireById()` melempar `RegionNotFoundError` jika region tidak ditemukan.

Pemisahan ini mempertahankan `null` sebagai hasil normal untuk optional lookup dan exception untuk lookup yang diwajibkan.

### Lookup Berdasarkan Kode

`code` tidak dijamin unik oleh kontrak generik. Oleh karena itu, `findByCode()` mengembalikan collection terpaginasikan.

```ts
const result = await regions.findByCode("3273", {
  parentId: "id:bps:32",
  type: "city",
});
```

Public API tidak menyediakan `getByCode()` pada MVP karena nama tersebut menyiratkan satu hasil unik.

### Pencarian Nama

`findByName()` mencari nama dengan aturan pencocokan eksplisit.

```ts
const result = await regions.findByName("Bandung", {
  match: "exact",
  includeAliases: true,
});
```

```ts
type TextMatch = "exact" | "prefix" | "contains";

interface FindByNameOptions extends QueryOptions {
  match?: TextMatch;
  includeAliases?: boolean;
  parentId?: string;
  level?: number;
  type?: string;
}
```

Default:

```ts
{
  match: "exact",
  includeAliases: true
}
```

Exact match dipilih sebagai default karena deterministik dan dapat diindeks secara efisien oleh berbagai storage.

### Search

`search()` digunakan untuk pencarian teks yang lebih luas.

```ts
const result = await regions.search("bandung", {
  match: "contains",
  levels: [2],
  types: ["city", "regency"],
  limit: 20,
  offset: 0,
});
```

Search MVP mendukung exact, prefix, dan substring matching terhadap `name` serta `aliases`. Fuzzy search, typo tolerance, stemming, dan ranking kompleks belum didukung.

Hasil search menyertakan alasan match:

```ts
interface RegionSearchResult {
  readonly region: Region;
  readonly matchedField: "name" | "alias";
  readonly matchedValue: string;
}

interface RegionSearchPage {
  readonly items: readonly RegionSearchResult[];
  readonly page: PageInfo;
}
```

### Filtering

```ts
const result = await regions.filter({
  parentId: "id:bps:32",
  levels: [2],
  types: ["city"],
});
```

Model filter awal:

```ts
interface RegionFilter {
  ids?: readonly string[];
  codes?: readonly string[];
  parentId?: string | null;
  levels?: readonly number[];
  types?: readonly string[];
}
```

Filtering bebas terhadap `attributes` tidak menjadi bagian MVP karena struktur field tersebut tidak konsisten dan semantic query JSON berbeda antara memory, PostgreSQL, MySQL, dan MongoDB.

Kemampuan khusus storage tidak boleh dimasukkan ke universal public API sebelum perilakunya dapat didefinisikan secara konsisten.

### Pagination

Operasi yang dapat menghasilkan banyak data menggunakan offset pagination pada MVP.

```ts
interface PaginationOptions {
  limit?: number;
  offset?: number;
}
```

Default pagination:

```ts
{
  limit: 50,
  offset: 0
}
```

Nilai maksimum `limit` adalah `1000`. Nilai di luar batas ditolak dengan `QueryValidationError`, bukan dikoreksi secara diam-diam.

```ts
interface PageInfo {
  readonly limit: number;
  readonly offset: number;
  readonly hasMore: boolean;
  readonly total?: number;
}

interface RegionPage {
  readonly items: readonly Region[];
  readonly page: PageInfo;
}
```

`total` bersifat opsional karena menghitung total dapat mahal pada database. Adapter tidak diwajibkan menjalankan operasi count untuk setiap query.

Cursor pagination ditunda. Dataset wilayah bersifat read-mostly dan relatif stabil sehingga offset pagination cukup untuk MVP.

### Sorting

Collection harus memiliki urutan deterministik untuk menjaga hasil dan pagination tetap stabil.

```ts
type RegionSortField = "code" | "name" | "level" | "type";
type SortDirection = "asc" | "desc";

interface SortOptions {
  sortBy?: RegionSortField;
  direction?: SortDirection;
}
```

Default sorting:

| Operasi | Urutan default |
| --- | --- |
| `findByCode()` | `code ASC`, lalu `id ASC` |
| `findByName()` | `name ASC`, lalu `id ASC` |
| `childrenOf()` | `code ASC`, lalu `id ASC` |
| `descendantsOf()` | `level ASC`, `code ASC`, lalu `id ASC` |
| `filter()` | `level ASC`, `code ASC`, lalu `id ASC` |

`id` selalu digunakan sebagai tie-breaker internal.

### Traversal Hierarki

Semua traversal memeriksa keberadaan target awal. Target yang tidak ditemukan menghasilkan `RegionNotFoundError`.

#### Parent

```ts
const parent = await regions.parentOf(regionId);
```

`parentOf()` mengembalikan `null` hanya jika target merupakan root. `null` tidak digunakan untuk menyatakan target yang tidak ditemukan.

#### Children

```ts
const children = await regions.childrenOf(regionId, {
  limit: 100,
});
```

Target tanpa child menghasilkan page kosong.

#### Ancestors

```ts
const ancestors = await regions.ancestorsOf(regionId);
```

Urutan ancestor adalah parent langsung menuju country root. Karena kedalaman hierarki administratif relatif kecil, ancestors tidak menggunakan pagination. Root menghasilkan array kosong.

#### Descendants

```ts
const descendants = await regions.descendantsOf(regionId, {
  maxDepth: 2,
  limit: 100,
  offset: 0,
});
```

```ts
interface DescendantOptions extends QueryOptions {
  maxDepth?: number;
}
```

Tanpa `maxDepth`, seluruh kedalaman di bawah target dapat dicari, tetapi hasil tetap terpaginasikan. Target tanpa descendant menghasilkan page kosong.

### Immutability Hasil

Tipe public menggunakan `readonly`:

```ts
interface Region {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly level: number;
  readonly type: string;
  readonly parentId: string | null;
  readonly aliases?: readonly string[];
  readonly attributes?: Readonly<Record<string, unknown>>;
}
```

Public API tidak boleh memberikan referensi yang memungkinkan consumer mengubah internal state. Karena TypeScript `readonly` hanya berlaku pada compile time, implementasi dapat menggunakan projection, cloning, atau freezing berdasarkan benchmark.

Perubahan terhadap object hasil di sisi consumer tidak boleh memengaruhi state instance `RegionKit`.

### Metadata Dataset

```ts
const metadata = await regions.getMetadata();
```

```ts
interface DatasetMetadata {
  readonly schemaVersion: string;
  readonly datasetVersion: string;
  readonly country: {
    readonly code: string;
    readonly name: string;
  };
  readonly source: {
    readonly id: string;
    readonly name: string;
    readonly url?: string;
    readonly retrievedAt?: string;
  };
  readonly generatedAt: string;
}
```

Metadata tidak menyertakan array `regions`.

### Lifecycle dan Resource Ownership

`close()` disediakan karena database adapter dapat memiliki connection pool atau resource internal.

```ts
const regions = await RegionKit.fromStore(store);

try {
  const result = await regions.search("bandung");
} finally {
  await regions.close();
}
```

Aturan lifecycle:

- `close()` aman dipanggil lebih dari sekali.
- Query setelah instance ditutup menghasilkan `RegionKitClosedError`.
- Jika adapter membuat resource sendiri, adapter bertanggung jawab menutupnya.
- Jika consumer memberikan connection atau pool, resource tersebut tetap dimiliki consumer kecuali ownership transfer dinyatakan secara eksplisit.
- `RegionKit.close()` tidak boleh menutup connection eksternal secara diam-diam.
- Memory store tetap mengimplementasikan lifecycle yang sama meskipun tidak memiliki resource eksternal.

### Error Behaviour

Stable error code awal:

```ts
type RegionKitErrorCode =
  | "DATASET_LOAD_FAILED"
  | "DATASET_PARSE_FAILED"
  | "DATASET_INVALID"
  | "SCHEMA_UNSUPPORTED"
  | "REGION_NOT_FOUND"
  | "QUERY_INVALID"
  | "STORAGE_CONNECTION_FAILED"
  | "STORAGE_INCOMPATIBLE"
  | "STORAGE_QUERY_FAILED"
  | "INSTANCE_CLOSED";
```

Aturan hasil dan error:

- `getById()` yang tidak menemukan data mengembalikan `null`.
- `requireById()` yang tidak menemukan data melempar `RegionNotFoundError`.
- Traversal terhadap target tidak dikenal melempar `RegionNotFoundError`.
- Collection tanpa hasil mengembalikan page dengan `items: []`.
- Input query tidak valid melempar `QueryValidationError`.
- Kegagalan storage dibungkus dalam error storage yang sesuai dan dapat menyimpan error asli melalui `cause`.
- Dataset tidak valid melempar `DatasetValidationError`.
- Schema tidak didukung melempar `UnsupportedSchemaError`.
- Query setelah instance ditutup melempar `RegionKitClosedError`.

Error operasional menggunakan exception. Bentuk `{ success: false, error }` tidak digunakan sebagai return type universal.

### Export Surface

Package utama hanya mengekspor kontrak yang memang diperlukan consumer atau adapter author.

```ts
export {
  RegionKit,
  RegionKitError,
  DatasetLoadError,
  DatasetValidationError,
  UnsupportedSchemaError,
  RegionNotFoundError,
  QueryValidationError,
  StorageConnectionError,
  StorageCompatibilityError,
  StorageQueryError,
  RegionKitClosedError,
};

export type {
  Region,
  RegionDataset,
  DatasetMetadata,
  RegionStore,
  RegionFilter,
  SearchOptions,
  QueryOptions,
  RegionPage,
  RegionSearchPage,
};
```

Internal validator implementation, memory indexes, normalizer, dan storage-specific query tidak diekspor kecuali sengaja dijadikan extension contract.

### Di Luar Public API MVP

Public API MVP tidak menyediakan:

- Create, update, atau delete region.
- Arbitrary SQL query.
- MongoDB query object passthrough.
- Filter bebas terhadap `attributes`.
- Download dataset otomatis.
- Import database melalui runtime instance.
- Fuzzy search.
- Query builder kompleks.
- Framework-specific API.
- Akses langsung ke internal indexes.
- Akses database mentah melalui `RegionKit`.

### Ringkasan Keputusan

| Aspek | Keputusan |
| --- | --- |
| Inisialisasi | Static async factory |
| Constructor public | Tidak diekspos |
| Factory JSON | `fromFile()` dan `fromData()` |
| Factory adapter | `fromStore()` |
| Operasi public | Selalu mengembalikan `Promise` |
| Optional ID lookup | `getById()` menghasilkan `Region \| null` |
| Required ID lookup | `requireById()` atau error |
| Lookup kode | Collection terpaginasikan |
| Search match | Exact, prefix, contains |
| Fuzzy search | Tidak didukung pada MVP |
| Pagination | Offset pagination |
| Default limit | `50` |
| Maximum limit | `1000` |
| Total count | Opsional |
| Sorting | Deterministik dengan `id` tie-breaker |
| Target traversal tidak ditemukan | `RegionNotFoundError` |
| Urutan ancestors | Parent langsung menuju root |
| Descendants | Terpaginasikan dan mendukung `maxDepth` |
| Mutasi internal melalui hasil | Tidak diizinkan |
| Metadata | `getMetadata()` |
| Resource lifecycle | `close()` |
| Error handling | Exception class dan stable code |
| Storage-specific query | Tidak masuk universal API |
| Export surface | Minimal dan eksplisit |

## 7. Toolchain

**Status:** Disepakati

### Prinsip Pemilihan Toolchain

Toolchain `region-kit` harus:

- Mendukung Node.js 22 dan Node.js 24.
- Menghasilkan package ESM yang sesuai dengan module resolution Node.js.
- Menyertakan type declarations untuk pengguna TypeScript.
- Menjaga build tetap sederhana.
- Mendukung pengujian unit, integrasi, dan kompatibilitas storage adapter.
- Memvalidasi package sebelum dipublikasikan.
- Mendukung automated release tanpa menyimpan npm token jangka panjang.
- Tidak menambahkan tool yang belum memiliki kebutuhan nyata.

### Package Manager

`region-kit` menggunakan `pnpm` sebagai package manager resmi.

```text
pnpm
```

Versi `pnpm` harus dikunci melalui field `packageManager` dalam `package.json`.

Contoh:

```json
{
  "packageManager": "pnpm@<exact-version>"
}
```

Nomor versi aktual ditentukan ketika repository diinisialisasi dan tidak menggunakan rentang versi.

Perintah instalasi resmi:

```bash
pnpm install
```

CI menggunakan:

```bash
pnpm install --frozen-lockfile
```

File berikut wajib di-commit:

```text
pnpm-lock.yaml
```

Dependency tidak boleh dipasang menggunakan npm atau Yarn dalam repository yang sama karena dapat menghasilkan lockfile dan dependency resolution berbeda.

### Workspace

Core MVP dapat dimulai sebagai single package.

Namun, `pnpm-workspace.yaml` dapat disiapkan sejak awal karena ekosistem direncanakan memiliki adapter terpisah seperti PostgreSQL, MySQL, dan MongoDB.

Struktur konseptual masa depan:

```text
packages/
├── region-kit/
├── postgresql/
├── mysql/
└── mongodb/
```

Keberadaan workspace tidak berarti seluruh adapter harus langsung dibuat. Pada MVP, workspace hanya boleh berisi package yang benar-benar sedang dikembangkan.

### Bahasa dan Compiler

Source code ditulis menggunakan TypeScript.

Compiler resmi adalah TypeScript compiler:

```text
tsc
```

Core MVP tidak menggunakan bundler seperti Rollup, esbuild, tsup, atau Vite untuk menghasilkan package.

TypeScript compiler dipilih karena:

* `region-kit` merupakan library Node.js ESM.
* Node.js dapat menjalankan output ESM secara langsung.
* Tidak ada kebutuhan browser bundle.
* Tidak ada kebutuhan menggabungkan seluruh modul menjadi satu file.
* Build dan source map lebih mudah diperiksa.
* Type declaration dapat dihasilkan langsung.
* Struktur module internal tetap terlihat dan dapat dianalisis.

Bundler hanya ditambahkan jika kemudian terdapat kebutuhan yang tidak dapat dipenuhi oleh `tsc`.

### Konfigurasi TypeScript

Konfigurasi awal yang direkomendasikan:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",

    "rootDir": "./src",
    "outDir": "./dist",

    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "useUnknownInCatchVariables": true,
    "noFallthroughCasesInSwitch": true,

    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules"]
}
```

`NodeNext` digunakan agar compiler mengikuti aturan ESM dan package resolution milik Node.js. TypeScript juga merekomendasikan Node-oriented module resolution untuk library yang tidak dibundel.

Source import lokal harus menuliskan ekstensi output JavaScript:

```ts
import { RegionKitError } from "./errors/region-kit-error.js";
```

Bukan:

```ts
import { RegionKitError } from "./errors/region-kit-error";
```

Walaupun source file menggunakan `.ts`, specifier memakai `.js` karena itulah file yang akan tersedia setelah build.

### Konfigurasi Package ESM

`package.json` sekurangnya memuat:

```json
{
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "engines": {
    "node": ">=22"
  }
}
```

CommonJS entry tidak disediakan pada MVP.

Field `exports` menjadi daftar resmi entry point package. Modul internal yang tidak tercantum di dalam `exports` tidak dianggap sebagai public API.

### Build

Perintah build resmi:

```bash
pnpm build
```

Script awal:

```json
{
  "scripts": {
    "clean": "rimraf dist",
    "build": "pnpm clean && tsc -p tsconfig.build.json",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  }
}
```

Jika penggunaan `rimraf` dianggap tidak diperlukan karena target runtime dan development environment mendukung solusi Node.js internal, clean script dapat dibuat melalui script Node.js kecil. Shell command yang bergantung pada Unix tidak boleh digunakan karena development juga dilakukan di Windows.

Build harus menghasilkan:

```text
dist/
├── index.js
├── index.d.ts
├── index.js.map
├── index.d.ts.map
└── internal module outputs
```

Folder `dist` tidak perlu di-commit ke Git selama release pipeline membangunnya secara deterministik sebelum publish.

### Testing

Test runner resmi adalah Vitest.

```text
vitest
```

Perintah testing:

```bash
pnpm test
```

Script awal:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

Jenis pengujian:

```text
test/
├── unit/
├── integration/
├── contract/
└── fixtures/
```

#### Unit Test

Unit test memeriksa komponen terisolasi seperti:

* Dataset validation.
* Search normalization.
* Pagination.
* Sorting.
* Hierarchy traversal.
* Error mapping.
* Memory indexes.

#### Integration Test

Integration test memeriksa beberapa komponen bersama-sama:

* `fromFile()` dengan file JSON.
* `fromData()` dengan object JavaScript.
* Pembangunan memory store.
* Public API terhadap dataset nyata atau fixture representatif.
* Lifecycle instance.

#### Storage Contract Test

Semua storage adapter harus menjalankan contract test suite yang sama.

Contoh konseptual:

```ts
defineRegionStoreContract(() => createTestStore());
```

Contract suite memeriksa bahwa memory, PostgreSQL, MySQL, dan MongoDB menghasilkan semantic public API yang konsisten.

Test khusus adapter tetap diperbolehkan untuk memeriksa:

* Connection handling.
* Database schema.
* Transaction.
* Native indexing.
* Error translation.
* Resource cleanup.

#### Test Database

Integration test adapter database menggunakan instance database nyata pada CI, bukan hanya mock driver.

Mock dapat digunakan untuk unit test error tertentu, tetapi tidak cukup untuk membuktikan kompatibilitas query SQL atau MongoDB.

### Coverage

Vitest menggunakan V8 coverage provider.

```bash
pnpm test:coverage
```

Coverage digunakan sebagai indikator area yang belum diuji, bukan sebagai bukti tunggal kualitas.

Threshold coverage final ditetapkan pada poin quality gates. Critical path seperti validator, hierarchy traversal, pagination, dan storage contract harus mendapatkan pengujian langsung meskipun total coverage repository terlihat tinggi.

### Linting

Linting menggunakan:

```text
ESLint
typescript-eslint
```

Konfigurasi menggunakan ESLint flat config:

```text
eslint.config.js
```

Perintah:

```bash
pnpm lint
```

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

Linting bertanggung jawab untuk:

* Menemukan kemungkinan bug.
* Menegakkan praktik TypeScript yang aman.
* Menemukan import yang tidak valid.
* Menemukan Promise yang tidak ditangani.
* Menemukan variable atau kode yang tidak digunakan.
* Menjaga konsistensi aturan source code.

Aturan lint yang memerlukan type information hanya digunakan jika manfaatnya sebanding dengan biaya eksekusinya.

### Formatting

Formatting menggunakan Prettier.

```text
Prettier
```

Perintah:

```bash
pnpm format
pnpm format:check
```

```json
{
  "scripts": {
    "format": "prettier . --write",
    "format:check": "prettier . --check"
  }
}
```

Pembagian tanggung jawab:

* ESLint memeriksa kualitas dan potensi kesalahan kode.
* Prettier mengatur formatting.
* Aturan formatting tidak diduplikasi secara manual dalam ESLint.

File generated, build output, coverage, dan fixture besar harus dimasukkan ke `.prettierignore` jika tidak layak diformat.

### Dokumentasi API

Dokumentasi public API menggunakan:

```text
TypeDoc
```

TypeDoc menghasilkan dokumentasi dari type declarations dan TSDoc comment.

```bash
pnpm docs
```

```json
{
  "scripts": {
    "docs": "typedoc"
  }
}
```

Dokumentasi tidak hanya mengandalkan output TypeDoc. Repository tetap membutuhkan:

* `README.md`.
* Installation guide.
* Quick-start example.
* JSON usage example.
* Database adapter example setelah tersedia.
* Public API concepts.
* Error handling guide.
* Dataset compatibility guide.
* Migration guide untuk breaking release.

TSDoc wajib digunakan pada public export yang perilakunya tidak langsung jelas.

Internal function tidak wajib memiliki komentar jika nama, tipe, dan strukturnya sudah menjelaskan tujuan kode.

### Validasi Package

Sebelum publish, package harus diperiksa menggunakan:

```text
publint
@arethetypeswrong/cli
```

Pemeriksaan tersebut membantu menemukan masalah pada:

* `package.json`.
* ESM exports.
* Type declaration resolution.
* Entry point.
* File yang tidak sengaja ikut dipublikasikan.
* Ketidaksesuaian JavaScript dan TypeScript consumer.

Script:

```json
{
  "scripts": {
    "check:package": "publint && attw --pack"
  }
}
```

Release pipeline juga harus menjalankan:

```bash
pnpm pack
```

Isi tarball harus diperiksa agar dataset, source fixture besar, credential, coverage report, dan file development tidak ikut diterbitkan.

### Script Standar

Script awal yang direkomendasikan:

```json
{
  "scripts": {
    "clean": "rimraf dist",
    "build": "pnpm clean && tsc -p tsconfig.build.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",

    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",

    "lint": "eslint .",
    "lint:fix": "eslint . --fix",

    "format": "prettier . --write",
    "format:check": "prettier . --check",

    "docs": "typedoc",
    "check:package": "publint && attw --pack",

    "check": "pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build && pnpm check:package"
  }
}
```

`pnpm check` menjadi pemeriksaan lokal utama sebelum perubahan dianggap siap.

### Continuous Integration

CI menggunakan GitHub Actions.

Pull request dan push ke branch utama menjalankan:

```text
Install
├── pnpm install --frozen-lockfile
├── lint
├── format check
├── typecheck
├── test
├── build
└── package validation
```

Compatibility test menggunakan matrix:

```text
Node.js 22
Node.js 24
```

Node.js 26 ditambahkan setelah berstatus LTS.

Strategi yang direkomendasikan:

* Lint, formatting, dan typecheck cukup dijalankan sekali pada Node.js utama.
* Test dijalankan pada seluruh Node.js compatibility matrix.
* Build dan package validation dijalankan pada Node.js versi release.
* Dependency cache menggunakan dukungan cache pnpm pada GitHub Actions.
* CI selalu memakai frozen lockfile.
* Release tidak boleh berjalan jika quality checks gagal.

Dokumentasi resmi pnpm menyediakan pola integrasi GitHub Actions dan penggunaan dependency store cache. [pnpm CI documentation](https://pnpm.io/continuous-integration)

### Versioning dan Changelog

Versioning menggunakan Semantic Versioning.

```text
MAJOR.MINOR.PATCH
```

Perubahan version dan changelog dikelola menggunakan Changesets.

```text
@changesets/cli
```

Contributor menambahkan changeset untuk perubahan yang berdampak pada package:

```bash
pnpm changeset
```

Changeset mencatat:

* Package yang berubah.
* Jenis perubahan: major, minor, atau patch.
* Ringkasan perubahan untuk changelog.

Perubahan internal yang tidak berdampak pada package dapat tidak memiliki changeset.

Changesets dipilih karena dapat menangani single package sekarang dan beberapa adapter package pada masa mendatang. pnpm juga mendokumentasikan integrasi Changesets dengan GitHub Actions untuk version PR dan publishing. [pnpm Changesets documentation](https://pnpm.io/using-changesets)

### Automated Release

Release menggunakan GitHub Actions dan npm trusted publishing melalui OpenID Connect.

Alur release:

```text
Changeset masuk ke main
        ↓
GitHub Actions membuat atau memperbarui Version Packages PR
        ↓
Maintainer memeriksa version dan changelog
        ↓
Version Packages PR di-merge
        ↓
Quality checks dan package validation dijalankan
        ↓
Package dipublikasikan ke npm
        ↓
Git tag dan GitHub Release dibuat
```

Trusted publishing dipilih karena tidak memerlukan npm access token jangka panjang di repository secrets. npm merekomendasikan trusted publishing untuk CI/CD, dan provenance attestation dibuat otomatis ketika trusted publishing digunakan. [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/), [npm provenance](https://docs.npmjs.com/generating-provenance-statements/)

Workflow publish harus memiliki permission minimum:

```yaml
permissions:
  contents: write
  id-token: write
```

Release environment dapat menggunakan GitHub Environment dengan approval maintainer, terutama untuk release awal.

Publikasi manual dari mesin developer tidak menjadi jalur release normal.

### Dependency Management

Aturan dependency:

* Gunakan dependency hanya jika manfaatnya jelas.
* Dependency runtime dijaga seminimal mungkin.
* Tool build, test, lint, dan dokumentasi ditempatkan dalam `devDependencies`.
* Driver PostgreSQL, MySQL, dan MongoDB tidak menjadi dependency core.
* Adapter database menentukan driver atau peer dependency masing-masing.
* Dependency version dikunci melalui `pnpm-lock.yaml`.
* Pembaruan dependency harus melewati CI.
* Install script dependency hanya diizinkan untuk package yang dipercaya dan memang membutuhkannya.

pnpm menyediakan kontrol terhadap dependency build script untuk mengurangi risiko supply-chain. [pnpm supply-chain security](https://pnpm.io/supply-chain-security)

### Git Hooks

Git hook seperti Husky dan lint-staged tidak digunakan pada MVP.

Pemeriksaan lokal tetap dapat dijalankan melalui:

```bash
pnpm check
```

CI menjadi enforcement yang sebenarnya. Git hook hanya dipertimbangkan jika tim bertambah dan masalah konsistensi lokal benar-benar muncul.

### Tool yang Tidak Digunakan pada MVP

Toolchain MVP tidak menggunakan:

* Bundler.
* CommonJS build.
* Babel.
* Husky.
* lint-staged.
* Jest.
* Multiple test runners.
* Automated dependency bot tanpa konfigurasi yang jelas.
* Custom release script.
* npm access token jangka panjang.
* Commit `dist` ke repository.
* Database driver dalam core package.

### Ringkasan Keputusan

| Aspek                     | Keputusan                            |
| ------------------------- | ------------------------------------ |
| Package manager           | pnpm                                 |
| Lockfile                  | `pnpm-lock.yaml`                     |
| Workspace                 | Disiapkan untuk perkembangan adapter |
| Bahasa                    | TypeScript                           |
| Compiler                  | `tsc`                                |
| Build bundler             | Tidak digunakan                      |
| Module configuration      | `NodeNext`                           |
| Output module             | ESM                                  |
| Target JavaScript         | ES2022                               |
| Type declarations         | Dihasilkan saat build                |
| Test runner               | Vitest                               |
| Coverage provider         | V8                                   |
| Storage adapter test      | Shared contract test                 |
| Database integration test | Database nyata di CI                 |
| Linter                    | ESLint dan typescript-eslint         |
| Formatter                 | Prettier                             |
| API documentation         | TypeDoc dan TSDoc                    |
| Package validation        | publint dan Are The Types Wrong      |
| CI                        | GitHub Actions                       |
| CI Node.js matrix         | Node.js 22 dan 24                    |
| Versioning                | Semantic Versioning                  |
| Version management        | Changesets                           |
| Automated release         | GitHub Actions                       |
| npm authentication        | Trusted publishing dengan OIDC       |
| npm provenance            | Aktif melalui trusted publishing     |
| Git hooks                 | Tidak digunakan pada MVP             |
| Build output dalam Git    | Tidak di-commit                      |

## 8. Struktur Repository

**Status:** Disepakati

### Pendekatan Repository

`region-kit` menggunakan satu repository berbasis pnpm workspace.

Repository dimulai dengan satu package core yang dapat dirilis, tetapi strukturnya disiapkan untuk menampung adapter database sebagai package terpisah pada masa mendatang.

Pendekatan ini dapat disebut sebagai **workspace-ready monorepo**:

- MVP hanya mengembangkan dan merilis core package.
- Package adapter tidak dibuat sebelum benar-benar dikerjakan.
- Toolchain dan konfigurasi bersama ditempatkan pada root repository.
- Setiap package memiliki batas dependency dan public export sendiri.
- Penambahan package baru tidak memerlukan migrasi besar struktur repository.

### Struktur Tingkat Atas

Struktur awal yang direkomendasikan:

```text
region-kit/
├── .changeset/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── release.yml
│   ├── ISSUE_TEMPLATE/
│   ├── pull_request_template.md
│   └── dependabot.yml
├── docs/
├── examples/
├── packages/
│   └── core/
├── scripts/
├── .editorconfig
├── .gitignore
├── .npmrc
├── .prettierignore
├── .prettierrc.json
├── CHANGELOG.md
├── CONTRIBUTING.md
├── eslint.config.js
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── SECURITY.md
├── tsconfig.base.json
├── typedoc.json
└── vitest.workspace.ts
```

Tidak semua file harus dibuat sebelum dibutuhkan. Struktur tersebut merupakan target organisasi repository, bukan kewajiban membuat file kosong sejak awal.

### Workspace Configuration

`pnpm-workspace.yaml` mendefinisikan lokasi package dan example.

```yaml
packages:
  - "packages/*"
  - "examples/*"
```

Folder yang belum memiliki package tidak memengaruhi workspace.

### Root `package.json`

Root repository bersifat private dan tidak dipublikasikan ke npm.

```json
{
  "name": "region-kit-workspace",
  "private": true,
  "packageManager": "pnpm@<exact-version>",
  "scripts": {
    "build": "pnpm -r build",
    "typecheck": "pnpm -r typecheck",
    "test": "pnpm -r test",
    "test:coverage": "pnpm -r test:coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier . --write",
    "format:check": "prettier . --check",
    "docs": "pnpm --filter region-kit docs",
    "check:package": "pnpm -r check:package",
    "check": "pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build && pnpm check:package"
  }
}
```

Root bertanggung jawab untuk:

* Workspace orchestration.
* Shared development dependencies.
* Linting dan formatting.
* CI commands.
* Release management.
* Shared TypeScript configuration.
* Shared Vitest configuration.

Root tidak boleh mengekspor runtime code.

### Package Core

Package utama ditempatkan di:

```text
packages/core/
```

Nama folder internal tidak menentukan nama npm package.

`packages/core/package.json` tetap menggunakan:

```json
{
  "name": "region-kit"
}
```

Struktur package core:

```text
packages/core/
├── src/
│   ├── dataset/
│   │   ├── load-dataset-file.ts
│   │   ├── parse-dataset.ts
│   │   ├── validate-dataset.ts
│   │   └── validation/
│   ├── errors/
│   │   ├── dataset-errors.ts
│   │   ├── query-errors.ts
│   │   ├── region-kit-error.ts
│   │   └── storage-errors.ts
│   ├── query/
│   │   ├── normalize-search-text.ts
│   │   ├── pagination.ts
│   │   ├── sorting.ts
│   │   └── types.ts
│   ├── store/
│   │   ├── memory/
│   │   │   ├── build-indexes.ts
│   │   │   ├── memory-region-store.ts
│   │   │   └── memory-store-state.ts
│   │   ├── region-store.ts
│   │   └── store-capabilities.ts
│   ├── types/
│   │   ├── dataset.ts
│   │   ├── metadata.ts
│   │   ├── query.ts
│   │   └── region.ts
│   ├── index.ts
│   └── region-kit.ts
├── test/
│   ├── contract/
│   ├── fixtures/
│   ├── integration/
│   └── unit/
├── package.json
├── README.md
├── tsconfig.json
├── tsconfig.build.json
├── typedoc.json
└── vitest.config.ts
```

Struktur source mengikuti tanggung jawab domain, bukan jenis file teknis yang terlalu umum.

Contoh:

```text
dataset/
store/
query/
errors/
types/
```

Lebih baik daripada struktur datar seperti:

```text
classes/
interfaces/
utils/
helpers/
```

Folder seperti `utils` atau `helpers` sering menjadi tempat kode tanpa batas tanggung jawab yang jelas. Helper sebaiknya ditempatkan dekat domain yang menggunakannya.

### Public Entry Point

Entry point utama:

```text
packages/core/src/index.ts
```

`index.ts` hanya mengekspor public API yang telah disepakati.

```ts
export { RegionKit } from "./region-kit.js";

export {
  RegionKitError,
  DatasetLoadError,
  DatasetValidationError,
  UnsupportedSchemaError,
  RegionNotFoundError,
  QueryValidationError,
  StorageConnectionError,
  StorageCompatibilityError,
  StorageQueryError,
  RegionKitClosedError,
} from "./errors/index.js";

export type {
  Region,
  RegionDataset,
  DatasetMetadata,
  RegionStore,
  RegionFilter,
  QueryOptions,
  SearchOptions,
  RegionPage,
  RegionSearchPage,
} from "./types/index.js";
```

Internal module tidak diekspor hanya karena tersedia di dalam `src`.

Consumer tidak diperbolehkan menggunakan deep import:

```ts
import { buildIndexes } from "region-kit/dist/store/memory/build-indexes.js";
```

Field `exports` pada `package.json` harus mencegah akses ke internal module yang bukan bagian public API.

### Internal Module Boundary

Aturan dependency internal:

```text
Public facade
    ↓
Domain types and query contracts
    ↓
RegionStore contract
    ↓
Memory store implementation
```

Ketentuan:

* `RegionKit` boleh bergantung pada `RegionStore`.
* Memory store mengimplementasikan `RegionStore`.
* Domain type tidak boleh bergantung pada memory store.
* Validator tidak boleh bergantung pada public facade.
* Error dasar tidak boleh bergantung pada storage implementation.
* Core tidak boleh mengimpor database driver.
* Adapter database tidak boleh mengakses internal file core melalui relative path atau deep import.

Jika adapter membutuhkan sebuah tipe, tipe tersebut harus menjadi bagian extension contract yang diekspor secara resmi.

### Testing Structure

Test dipisahkan berdasarkan tujuan:

```text
test/
├── unit/
├── integration/
├── contract/
└── fixtures/
```

#### Unit Tests

```text
test/unit/
```

Digunakan untuk:

* Search normalization.
* Pagination.
* Sorting.
* Dataset validation rules.
* Memory indexes.
* Error construction.
* Individual traversal behaviour.

#### Integration Tests

```text
test/integration/
```

Digunakan untuk:

* `RegionKit.fromFile()`.
* `RegionKit.fromData()`.
* Public API menggunakan memory store.
* Lifecycle instance.
* Error propagation antar-komponen.

#### Contract Tests

```text
test/contract/
```

Berisi shared behaviour yang wajib dipenuhi implementasi `RegionStore`.

Contoh:

```ts
defineRegionStoreContract({
  createStore: async () => createMemoryTestStore(),
  destroyStore: async (store) => store.close(),
});
```

Ketika adapter database dibuat, contract suite yang sama harus dapat dijalankan terhadap adapter tersebut.

Contract test utility tetap berada di package core selama hanya digunakan secara internal. Package seperti `@region-kit/testkit` belum dibuat sampai adapter eksternal benar-benar memerlukannya sebagai dependency publik.

#### Fixtures

```text
test/fixtures/
```

Fixture harus:

* Kecil.
* Deterministik.
* Mudah diperiksa.
* Mencakup kasus valid dan invalid.
* Tidak menggandakan seluruh dataset produksi.

Contoh:

```text
fixtures/
├── valid/
│   ├── minimal-dataset.json
│   └── hierarchy-dataset.json
└── invalid/
    ├── duplicate-id.json
    ├── missing-parent.json
    ├── multiple-roots.json
    ├── self-reference.json
    └── cyclic-hierarchy.json
```

Dataset Indonesia lengkap tidak dimasukkan ke repository core.

Benchmark atau integration test terhadap dataset nyata dapat mengunduh artefak release tertentu secara eksplisit atau menggunakan fixture lokal yang dikelola terpisah.

### Dokumentasi

Dokumentasi umum ditempatkan di:

```text
docs/
```

Struktur awal:

```text
docs/
├── concepts/
│   ├── dataset-contract.md
│   ├── storage-adapters.md
│   └── hierarchy-model.md
├── guides/
│   ├── using-json.md
│   ├── handling-errors.md
│   └── creating-a-store-adapter.md
├── reference/
└── decisions/
```

Pembagian dokumentasi:

* Root `README.md` untuk pengenalan dan quick start.
* `packages/core/README.md` untuk dokumentasi package npm.
* `docs/concepts/` untuk konsep arsitektur.
* `docs/guides/` untuk panduan penggunaan.
* `docs/reference/` untuk API reference atau link ke output TypeDoc.
* `docs/decisions/` untuk Architecture Decision Records.

Dokumen fondasi proyek ini dapat ditempatkan di:

```text
docs/decisions/project-foundation.md
```

### Architecture Decision Records

Keputusan arsitektur penting dicatat sebagai ADR.

Struktur:

```text
docs/decisions/
├── 0001-use-nodejs-and-esm.md
├── 0002-separate-dataset-distribution.md
├── 0003-read-only-storage-contract.md
└── 0004-use-async-public-api.md
```

Format minimal ADR:

```
# Judul Keputusan

## Status

Accepted

## Context

Masalah dan batasan yang dihadapi.

## Decision

Keputusan yang dipilih.

## Consequences

Dampak positif, kompromi, dan risiko.
```

Tidak setiap perubahan kecil memerlukan ADR. ADR digunakan untuk keputusan yang:

* Sulit dibalik.
* Memengaruhi public API.
* Memengaruhi package boundary.
* Memengaruhi storage contract.
* Mengandung trade-off penting.

### Examples

Contoh penggunaan ditempatkan di:

```text
examples/
```

Struktur awal:

```text
examples/
├── json-basic/
├── search-and-traversal/
└── custom-store/
```

Setiap example merupakan project kecil yang dapat dijalankan.

```text
examples/json-basic/
├── data/
│   └── sample-regions.json
├── src/
│   └── index.ts
├── package.json
└── tsconfig.json
```

Example menggunakan workspace dependency:

```json
{
  "dependencies": {
    "region-kit": "workspace:*"
  }
}
```

Example tidak dipublikasikan ke npm:

```json
{
  "private": true
}
```

Database example ditambahkan bersamaan dengan adapter terkait, bukan dibuat sebagai placeholder kosong.

### Scripts

Script repository ditempatkan di:

```text
scripts/
```

Folder tersebut hanya digunakan untuk automation lintas-package seperti:

* Memeriksa isi package tarball.
* Menjalankan benchmark terkoordinasi.
* Menyiapkan database integration test.
* Memverifikasi fixture atau dataset release.
* Automation dokumentasi.

Business logic dan runtime code tidak boleh ditempatkan di `scripts/`.

Script menggunakan Node.js agar dapat berjalan konsisten di Windows, Linux, dan CI.

### Adapter Package Masa Depan

Ketika adapter mulai dikembangkan, struktur dapat berkembang menjadi:

```text
packages/
├── core/
├── postgresql/
├── mysql/
└── mongodb/
```

Contoh struktur PostgreSQL adapter:

```text
packages/postgresql/
├── src/
│   ├── migration/
│   ├── query/
│   ├── postgresql-region-store.ts
│   └── index.ts
├── test/
│   ├── integration/
│   └── contract/
├── package.json
├── README.md
├── tsconfig.json
├── tsconfig.build.json
└── vitest.config.ts
```

Adapter:

* Bergantung pada public extension contract dari `region-kit`.
* Tidak menggunakan deep import dari core.
* Memiliki integration test dengan database nyata.
* Menjalankan shared RegionStore contract tests.
* Memiliki version dan changelog sendiri.
* Tidak menambahkan dependency driver ke core.

### Import Tooling Masa Depan

Import tooling tidak diletakkan dalam core runtime.

Jika diperlukan, tooling dapat menjadi package atau application terpisah:

```text
packages/
└── importer/
```

atau:

```text
tools/
└── importer/
```

Lokasi final ditentukan berdasarkan sifat distribusinya:

* Jika dipublikasikan dan digunakan consumer, jadikan package.
* Jika hanya digunakan internal repository, tempatkan sebagai tool internal.
* Jika memiliki CLI publik, definisikan package dan executable sendiri.

Importer tidak boleh membuat public runtime API core menjadi mutable.

### Build Output

Setiap package menghasilkan build output pada folder lokalnya:

```text
packages/core/dist/
packages/postgresql/dist/
```

Folder berikut tidak di-commit:

```text
dist/
coverage/
node_modules/
docs/api/
```

Output dokumentasi API dapat dihasilkan oleh CI atau documentation deployment.

### Dataset dan File Besar

Dataset produksi tidak disimpan di repository `region-kit`.

Repository hanya menyimpan fixture kecil untuk test dan example.

Tidak boleh dimasukkan:

* Seluruh output `region_squirrel`.
* File JSON produksi besar.
* Database dump.
* File hasil crawling.
* Credential database.
* Environment file pribadi.

Dataset produksi tetap didistribusikan melalui release `region_squirrel` bersama checksum.

### Environment dan Credential

File credential tidak di-commit.

Contoh environment file:

```text
.env
.env.local
.env.test.local
```

Template tanpa credential dapat disediakan:

```text
.env.example
```

Integration test database pada CI menggunakan secret atau service container sesuai kebutuhan.

Error, snapshot, dan test output tidak boleh mencetak connection string lengkap, password, token, atau credential lainnya.

### Konfigurasi Bersama dan Lokal

Konfigurasi bersama ditempatkan di root:

```text
eslint.config.js
.prettierrc.json
tsconfig.base.json
vitest.workspace.ts
typedoc.json
```

Konfigurasi package hanya menambahkan kebutuhan khusus:

```text
packages/core/tsconfig.json
packages/core/tsconfig.build.json
packages/core/vitest.config.ts
```

Package configuration tidak boleh menyalin seluruh konfigurasi root tanpa alasan.

### Naming Convention

Ketentuan awal:

* Nama folder menggunakan `kebab-case`.
* Nama file TypeScript menggunakan `kebab-case`.
* Class dan type menggunakan `PascalCase`.
* Function dan variable menggunakan `camelCase`.
* Constant menggunakan `UPPER_SNAKE_CASE` hanya untuk nilai yang benar-benar constant.
* Test file menggunakan suffix `.test.ts`.
* Type-only import menggunakan `import type`.
* Public export menggunakan nama eksplisit, bukan wildcard tanpa kontrol.

Contoh:

```text
memory-region-store.ts
validate-dataset.ts
region-kit-error.ts
```

### File Barrel

Barrel file seperti `index.ts` digunakan secara terbatas.

Diperbolehkan untuk:

* Public package entry point.
* Public error exports.
* Public type exports.

Tidak direkomendasikan membuat barrel di setiap folder internal karena dapat:

* Menyembunyikan dependency direction.
* Membuat circular dependency.
* Menambah module load yang tidak diperlukan.
* Menyulitkan pencarian asal simbol.

Internal module sebaiknya mengimpor file tujuan secara langsung.

### Dependency Direction

Dependency harus bergerak menuju kontrak dan domain, bukan menuju implementation detail.

```text
Public API
    ↓
Domain types and contracts
    ↓
RegionStore interface
    ↑
Storage implementations
```

Aturan:

* Core domain tidak bergantung pada adapter database.
* Adapter bergantung pada public contract core.
* Memory store berada dalam core karena merupakan implementasi default.
* Example bergantung pada package, bukan source file internal.
* Test boleh mengakses internal module package yang sedang diuji, tetapi contract test harus berorientasi pada public behaviour.
* Dokumentasi tidak menjadi dependency runtime.

### Hal yang Tidak Dilakukan pada MVP

Repository MVP tidak:

* Membuat folder adapter kosong.
* Membuat package kosong untuk PostgreSQL, MySQL, atau MongoDB.
* Membuat `@region-kit/testkit` sebelum diperlukan.
* Menyimpan dataset produksi.
* Menyimpan database dump.
* Meng-commit build output.
* Menggunakan Git submodule.
* Memisahkan core menjadi banyak package kecil.
* Menduplikasi konfigurasi pada setiap package.
* Menempatkan semua kode dalam folder `utils`.
* Mengekspor internal module untuk kemudahan sementara.

### Ringkasan Keputusan

| Aspek                     | Keputusan                            |
| ------------------------- | ------------------------------------ |
| Repository                | Satu repository                      |
| Workspace                 | pnpm workspace                       |
| Bentuk awal               | Satu core package                    |
| Bentuk jangka panjang     | Workspace dengan adapter package     |
| Lokasi core               | `packages/core`                      |
| Nama npm core             | `region-kit`                         |
| Konfigurasi bersama       | Root repository                      |
| Runtime source            | `packages/core/src`                  |
| Core tests                | `packages/core/test`                 |
| Unit test                 | `test/unit`                          |
| Integration test          | `test/integration`                   |
| Storage contract test     | `test/contract`                      |
| Test fixture              | `test/fixtures`                      |
| Dataset produksi          | Tidak disimpan di repository         |
| Dokumentasi               | `docs`                               |
| Architecture decisions    | `docs/decisions`                     |
| Contoh penggunaan         | `examples`                           |
| Automation lintas-package | `scripts`                            |
| Build output              | Folder `dist` masing-masing package  |
| Build output dalam Git    | Tidak di-commit                      |
| Database adapter          | Package terpisah ketika dikembangkan |
| Import tooling            | Terpisah dari core runtime           |
| Naming file               | `kebab-case`                         |
| Public entry point        | `src/index.ts`                       |
| Internal deep import      | Tidak didukung                       |
| Barrel file               | Digunakan secara terbatas            |

## 9. Quality gates

**Status:** Disepakati

### Tujuan Quality Gates

Quality gates memastikan perubahan aman untuk digabungkan, artefak package layak digunakan consumer, dan klaim kompatibilitas didukung oleh pengujian nyata.

Quality gates dibagi menjadi:

1. **Merge gate** — syarat perubahan dapat masuk ke branch `main`.
2. **Release gate** — syarat package dapat dipublikasikan.
3. **Informational gate** — pemeriksaan yang dilaporkan tetapi belum otomatis memblokir.

Tidak semua pemeriksaan dijadikan blocker sejak awal. Gate hanya menjadi wajib jika hasilnya deterministik dan kegagalannya menunjukkan masalah nyata.

### Required Checks Sebelum Merge

Pull request tidak boleh di-merge jika salah satu pemeriksaan berikut gagal:

```text
Formatting
Linting
Type checking
Unit tests
Integration tests
Storage contract tests
Coverage threshold
Build
Package validation
Node.js compatibility tests
Changeset check atau documented exemption
```

Command lokal utama:

```bash
pnpm check
```

Branch `main` menggunakan branch protection dengan aturan:

- Perubahan masuk melalui pull request.
- Required CI checks harus lulus.
- Branch harus mengikuti perubahan terbaru sebelum merge jika perubahan tersebut memengaruhi hasil CI.
- Review thread atau conversation yang belum selesai harus diselesaikan.
- Direct push ke `main` tidak diperbolehkan.
- Force push ke `main` tidak diperbolehkan.

Selama proyek masih dikerjakan sendiri, approval orang kedua tidak diwajibkan. CI tetap menjadi enforcement utama.

### Standar Testing

Test harus memeriksa behaviour dan kontrak, bukan hanya mengeksekusi baris kode.

#### Dataset Validator

Test validator sekurangnya mencakup:

- Dataset valid.
- Field wajib hilang.
- Tipe field salah.
- Schema version tidak didukung.
- ID duplikat.
- Root tidak tersedia.
- Root lebih dari satu.
- Root bukan level `0`.
- Root memiliki parent.
- Orphan region.
- Self-reference.
- Siklus hierarki.
- Relasi level parent-child tidak valid.
- `aliases` valid dan invalid.
- `attributes` valid dan invalid.
- Validator tidak memodifikasi input.

#### Lookup, Search, dan Filter

- ID ditemukan dan tidak ditemukan.
- `requireById()` menghasilkan error ketika target tidak tersedia.
- Code menghasilkan nol, satu, atau beberapa region.
- Exact, prefix, dan contains matching.
- Case-insensitive matching.
- Whitespace normalization.
- Alias matching.
- Filter berdasarkan parent, level, dan type.
- Sorting deterministik.
- Stable tie-breaker menggunakan `id`.
- Search result menyatakan field dan nilai yang cocok.

#### Traversal Hierarki

- Parent dari region biasa.
- Parent dari root.
- Children kosong dan tidak kosong.
- Ancestors diurutkan dari parent langsung menuju root.
- Descendants dengan dan tanpa `maxDepth`.
- Target tidak dikenal menghasilkan `RegionNotFoundError`.
- Hierarki dalam dan bercabang.

#### Pagination

- Default `limit` dan `offset`.
- Custom `limit` dan `offset`.
- Page pertama, tengah, terakhir, dan kosong.
- Perhitungan `hasMore`.
- `total` tersedia dan tidak tersedia.
- Limit nol, negatif, dan melebihi `1000`.
- Offset negatif.
- Pagination stabil ketika nilai sort utama sama.

#### Lifecycle dan Error

- `close()` dapat dipanggil lebih dari sekali.
- Query setelah `close()` ditolak.
- Error code stabil.
- Error asli tersedia melalui `cause` jika sesuai.
- Credential tidak muncul dalam error.
- Storage failure dipetakan ke error resmi.
- Memory store mengikuti lifecycle contract yang sama.

### Storage Contract Tests

Semua implementasi `RegionStore` wajib menjalankan shared contract test suite yang sama.

Contoh konseptual:

```ts
defineRegionStoreContract({
  createStore: async () => createTestStore(),
  destroyStore: async (store) => store.close(),
});
```

Contract suite memeriksa semantic public API, termasuk:

- Lookup.
- Search dan filter.
- Sorting.
- Pagination.
- Traversal.
- Metadata.
- Error behaviour.
- Lifecycle.

Adapter tidak boleh dirilis hanya karena unit test internalnya lulus.

### Database Integration Tests

Adapter database wajib diuji menggunakan database nyata dalam CI. Mock driver dapat membantu unit test, tetapi tidak cukup untuk membuktikan kompatibilitas query, transaction, constraint, index, dan connection lifecycle.

Setiap adapter sekurangnya menguji:

- Versi minimum database yang diklaim didukung.
- Versi stabil terbaru yang diklaim didukung.
- Shared storage contract.
- Schema creation atau migration.
- Transaction dan rollback.
- Constraint dan index.
- Connection failure.
- Resource cleanup.
- Error translation.
- Import data valid dan penolakan data invalid.

Versi database yang tidak diuji tidak boleh diklaim sebagai kompatibel.

### Coverage Threshold

Coverage global awal:

```ts
coverage: {
  thresholds: {
    lines: 85,
    functions: 85,
    statements: 85,
    branches: 80,
  },
}
```

Coverage adalah indikator, bukan bukti tunggal kualitas. Modul berikut tetap wajib memiliki behaviour test eksplisit:

- Dataset validator.
- Hierarchy traversal.
- Pagination.
- Storage contract.
- Error mapping.
- Resource lifecycle.

Generated file, type-only file, declaration, dan barrel `index.ts` tanpa runtime behaviour dapat dikecualikan secara eksplisit.

Threshold dapat dinaikkan setelah test suite matang. Threshold tidak boleh diturunkan hanya untuk membuat CI kembali lulus tanpa alasan terdokumentasi.

### Dataset Compatibility Gate

Repository core menggunakan fixture kecil dan deterministik:

```text
test/fixtures/
├── valid/
├── invalid/
└── compatibility/
```

Fixture compatibility mewakili schema yang masih didukung:

```text
compatibility/
├── schema-1.0.0.json
├── schema-1.1.0.json
└── schema-1.x-latest.json
```

Setiap perubahan validator harus membuktikan bahwa:

- Schema yang masih didukung tetap diterima.
- Dataset invalid tetap ditolak.
- Breaking schema tidak diterima secara diam-diam.
- Error menunjukkan lokasi dan alasan yang berguna.
- Input tidak dimutasi.

Dataset produksi tetap dirilis oleh `region_squirrel`. Pipeline release dataset idealnya mengikuti:

```text
Crawl
  ↓
Normalization
  ↓
Dataset contract validation
  ↓
Hierarchy validation
  ↓
Checksum generation
  ↓
Release artifact
```

### Node.js Compatibility Gate

Core CI wajib menguji:

```text
Node.js 22
Node.js 24
```

Compatibility matrix sekurangnya menjalankan:

- Type checking.
- Unit tests.
- Integration tests.
- Build smoke test.

Implementasi tidak boleh menggunakan API yang hanya tersedia di Node.js 24 selama Node.js 22 masih didukung.

Ketika Node.js 26 berstatus LTS, versi tersebut ditambahkan ke matrix. Node.js 22 tidak langsung dihapus. Penghapusan minimum Node.js merupakan breaking change dan memerlukan major release setelah `1.0.0`.

### Package Validation Gate

Sebelum merge dan release, jalankan:

```bash
pnpm build
pnpm check:package
pnpm pack
```

Gate memeriksa:

- `publint` lulus.
- Are The Types Wrong lulus.
- ESM import berhasil.
- Type declaration dapat di-resolve.
- Entry point sesuai dengan field `exports`.
- Tidak ada deep export yang tidak disengaja.
- Tarball hanya memuat file yang diperlukan.
- JavaScript ESM consumer dapat menggunakan package.
- TypeScript ESM consumer dapat melakukan typecheck.
- CommonJS tidak diklaim didukung.

Smoke test consumer harus menginstal tarball hasil `pnpm pack`, bukan mengimpor source workspace secara langsung.

```text
test/consumer-smoke/
├── javascript-esm/
└── typescript-esm/
```

Tarball tidak boleh memuat:

- Credential.
- Dataset produksi.
- Fixture besar yang tidak diperlukan.
- Coverage report.
- Source database dump.
- Development-only file yang tidak berguna bagi consumer.

### Public API Compatibility

Perubahan berikut dianggap berdampak pada public API:

- Export dihapus atau diganti nama.
- Parameter wajib ditambahkan.
- Return type berubah secara breaking.
- Error code dihapus atau maknanya berubah.
- Default search, sorting, atau pagination berubah.
- Storage contract berubah.
- Minimum Node.js dinaikkan.

Sebelum `1.0.0`, perubahan tersebut tetap harus memiliki changeset, changelog, dan migration note jika diperlukan.

Setelah `1.0.0`, perubahan breaking wajib menaikkan major version.

API report atau API snapshot dapat ditambahkan ketika public API mulai stabil. Pemeriksaan ini belum menjadi kewajiban pada fase desain awal.

### Benchmark

Benchmark dibuat sejak MVP tetapi awalnya bersifat informational, bukan required gate.

#### Memory/JSON Benchmark

- Waktu membaca file.
- Waktu parsing JSON.
- Waktu validasi.
- Waktu pembangunan indeks.
- Peak memory usage.
- Latency `getById()`.
- Latency `findByCode()`.
- Exact, prefix, dan contains search.
- Children, ancestors, dan descendants.
- Pagination pada hasil besar.

#### Database Benchmark

- Waktu import.
- Connection initialization.
- Lookup latency.
- Search latency.
- Traversal latency.
- Pagination latency.
- Query count.
- Performa dengan dan tanpa index yang diperlukan.

Benchmark belum memblokir merge karena runner CI dapat memiliki variasi performa. Benchmark baru menjadi gate setelah:

- Dataset benchmark dikunci.
- Environment cukup stabil.
- Baseline diperoleh dari beberapa run.
- Variasi normal diketahui.
- Threshold regresi dapat dipertanggungjawabkan.

Regresi besar tetap harus diselidiki meskipun benchmark belum menjadi blocker otomatis.

### Security Gate

Pemeriksaan wajib:

- Tidak ada credential dalam repository.
- Tidak ada secret dalam fixture, log, snapshot, atau error.
- Publish menggunakan npm trusted publishing dengan OIDC.
- Dependency install menggunakan frozen lockfile.
- Driver database tidak masuk core package.
- Error sanitizer diuji.
- Isi release tarball diperiksa.
- Dependency build script dibatasi pada dependency yang dipercaya.

Dependency audit dijalankan secara berkala dan sebelum release. Tidak setiap advisory otomatis memblokir merge karena relevansinya perlu dinilai.

Critical vulnerability yang relevan terhadap runtime atau package consumer harus memblokir release.

### Documentation Gate

Perubahan berikut wajib disertai pembaruan dokumentasi:

- Public API.
- Dataset contract.
- Error code.
- Default behaviour.
- Storage contract.
- Versi Node.js yang didukung.
- Adapter configuration.
- Breaking change dan migration.

TypeDoc harus berhasil dibangun. Public export yang penting harus memiliki TSDoc. Kualitas penjelasan tetap memerlukan review manusia.

### Changeset Gate

Changeset diperlukan untuk:

- Fitur baru.
- Bug fix yang mengubah package.
- Public API change.
- Error behaviour change.
- Runtime dependency change.
- Compatibility change.
- Performance improvement yang terlihat consumer.

Changeset tidak wajib untuk:

- Dokumentasi internal.
- Test-only change.
- Refactor tanpa perubahan observable.
- CI maintenance.
- Formatting.

CI dapat memeriksa keberadaan changeset. Perubahan yang tidak memerlukan release harus menggunakan pengecualian yang eksplisit dan terdokumentasi.

### Merge Gate

Merge gate memastikan perubahan aman masuk ke `main`:

```text
format check
lint
typecheck
unit tests
integration tests
storage contract tests
coverage
build
package validation
Node.js compatibility matrix
changeset atau exemption
```

### Release Gate

Release hanya dilakukan jika:

- Release berasal dari `main`.
- Seluruh merge gate lulus.
- Node.js compatibility matrix lulus.
- Coverage threshold terpenuhi.
- Build bersih.
- Package validation lulus.
- Tarball consumer smoke tests lulus.
- Version dan changelog benar.
- Changeset telah diterapkan.
- Dokumentasi public API sesuai.
- Tidak ada critical runtime vulnerability yang relevan.
- Trusted publishing tersedia.
- Package provenance dihasilkan.
- Tidak ada credential atau dataset besar dalam tarball.

Release adapter database juga mensyaratkan:

- Shared contract tests lulus.
- Integration tests database nyata lulus.
- Versi minimum dan versi terbaru yang didukung telah diuji.
- Storage schema dan migration tervalidasi.
- README menjelaskan konfigurasi, lifecycle, dan ownership connection.

### Informational Gates

Pemeriksaan berikut awalnya menghasilkan laporan tanpa otomatis memblokir merge:

- Benchmark performa.
- Trend penggunaan memory.
- Non-critical dependency advisory.
- API report sebelum public API stabil.
- Test flakiness report.

Informational gate dapat dipromosikan menjadi required gate setelah baseline dan threshold stabil.

### Ringkasan Keputusan

| Aspek | Keputusan |
| --- | --- |
| Required checks sebelum merge | Wajib lulus |
| Branch utama | Dilindungi |
| Second-person approval | Tidak wajib selama solo development |
| Lines coverage | Minimum 85% |
| Functions coverage | Minimum 85% |
| Statements coverage | Minimum 85% |
| Branches coverage | Minimum 80% |
| Critical behaviour tests | Wajib |
| Node.js CI matrix | Node.js 22 dan 24 |
| Shared storage contract test | Wajib bagi semua adapter |
| Database integration test | Menggunakan database nyata |
| Package tarball smoke test | Wajib |
| Dataset compatibility fixtures | Wajib |
| Benchmark awal | Informational |
| Performance blocker | Setelah baseline stabil |
| Changeset | Wajib untuk perubahan package |
| Critical runtime vulnerability | Memblokir release |
| Documentation update | Wajib untuk perubahan kontrak |
| Merge gate dan release gate | Dipisahkan |
| Release source | Branch `main` |
| Automated publishing | Hanya setelah seluruh gate lulus |

## 10. Roadmap dan kriteria rilis

**Status:** Disepakati

### Definisi MVP

MVP `region-kit` adalah library Node.js ESM yang dapat memuat dataset JSON sesuai **Region-Kit Dataset Contract**, memvalidasinya, lalu menyediakan lookup, search, filter, pagination, dan traversal hierarki melalui public API asinkron dan storage contract yang dapat dikembangkan.

MVP berfokus pada core dan memory/JSON store. Adapter database resmi belum menjadi syarat rilis `v0.1.0`, tetapi memory store harus mengimplementasikan `RegionStore` agar adapter PostgreSQL dapat ditambahkan tanpa merombak public API.

### Milestone 0 — Repository Foundation

**Tujuan:** menyiapkan repository untuk development yang terkontrol.

Cakupan:

- pnpm workspace.
- Package core `region-kit`.
- TypeScript ESM.
- Vitest.
- ESLint dan Prettier.
- CI Node.js 22 dan 24.
- Changesets.
- Build dan package validation.
- Struktur dokumentasi.
- License dan contribution files.

Kriteria selesai:

```text
pnpm install
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm check:package
```

Seluruh command berhasil pada repository awal dan CI.

### Milestone 1 — Dataset Contract

**Tujuan:** menetapkan input resmi `region-kit`.

Cakupan:

- Tipe `Region`.
- Tipe `RegionDataset`.
- Metadata dataset.
- Schema version rules.
- Validator struktural.
- Validator hierarki.
- Fixture valid, invalid, dan compatibility.
- Error validation yang jelas.
- JSON Schema jika dipilih sebagai representasi formal.

Kriteria selesai:

- Dataset valid diterima.
- Kasus invalid utama ditolak.
- Validator tidak memutasi input.
- Error menunjukkan penyebab yang dapat ditindaklanjuti.
- Output `region_squirrel` dapat dihasilkan atau dikonversi sesuai kontrak.
- Dataset Indonesia–BPS representatif lulus validasi.

### Milestone 2 — Memory Store

**Tujuan:** menyediakan implementasi storage default.

Cakupan:

- `RegionStore` contract.
- `MemoryRegionStore`.
- ID index.
- Code index.
- Name dan alias index.
- Parent-to-children index.
- Level dan type index.
- Metadata access.
- Lifecycle `close()`.

Kriteria selesai:

- Memory store lulus shared storage contract tests.
- Internal state tidak dapat dimutasi melalui hasil public.
- Dataset invalid ditolak sebelum store dibuat.
- Penggunaan memory dan waktu inisialisasi telah diukur.

### Milestone 3 — Public Query API

**Tujuan:** menyelesaikan kemampuan utama pengguna.

Cakupan:

- `RegionKit.fromData()`.
- `RegionKit.fromFile()`.
- `RegionKit.fromStore()`.
- `getMetadata()`.
- `getById()`.
- `requireById()`.
- `findByCode()`.
- `findByName()`.
- `search()`.
- `filter()`.
- `parentOf()`.
- `childrenOf()`.
- `ancestorsOf()`.
- `descendantsOf()`.
- Offset pagination.
- Deterministic sorting.
- Stable error model.

Kriteria selesai:

- Semua operasi public memiliki behaviour tests.
- Search konsisten terhadap `name` dan `aliases`.
- Pagination stabil.
- Traversal memiliki urutan yang terdokumentasi.
- Target traversal tidak dikenal menghasilkan error yang benar.
- Query setelah `close()` ditolak.
- Public API tidak bergantung pada detail memory store.

### Milestone 4 — Package Hardening

**Tujuan:** membuktikan package dapat digunakan di luar workspace.

Cakupan:

- Public exports.
- Type declarations.
- Source maps.
- publint.
- Are The Types Wrong.
- `pnpm pack`.
- JavaScript ESM consumer smoke test.
- TypeScript ESM consumer smoke test.
- Coverage threshold.
- Benchmark awal.
- Security review tarball.

Kriteria selesai:

- Tarball dapat diinstal dalam project kosong.
- Import JavaScript berhasil pada Node.js 22 dan 24.
- TypeScript consumer berhasil melakukan typecheck.
- Internal module tidak terekspos tanpa sengaja.
- Dataset produksi dan file development besar tidak masuk tarball.
- Coverage gate terpenuhi.
- Benchmark baseline terdokumentasi.

### Milestone 5 — Dokumentasi dan MVP Release

**Tujuan:** menerbitkan versi pertama yang dapat digunakan.

Cakupan:

- README.
- Installation dan quick start.
- Dataset contract guide.
- JSON usage.
- Search dan traversal examples.
- Error handling.
- Custom `RegionStore` guide.
- API reference.
- Known limitations.
- Changelog.
- Migration policy.
- GitHub Release.
- npm trusted publishing.

Versi rilis pertama:

```text
region-kit v0.1.0
```

Makna `v0.1.0`:

- Package sudah dapat digunakan dan telah melewati quality gates.
- Public API belum memiliki jaminan stabilitas setingkat `1.0.0`.
- Breaking change masih dapat terjadi pada minor release selama fase `0.x`.
- Breaking change tetap harus dicatat, diberi changeset, dan disertai migration note jika diperlukan.

### Kriteria MVP Siap Dirilis

#### Fungsional

- JSON dapat dimuat dari file dan object.
- Dataset divalidasi sebelum digunakan.
- Lookup ID dan code bekerja.
- Search nama dan alias bekerja.
- Filter level, type, dan parent bekerja.
- Parent, children, ancestors, dan descendants bekerja.
- Pagination dan sorting deterministik.
- Metadata dapat diakses.
- Lifecycle dan error behaviour sesuai kontrak.

#### Kualitas

- Required CI checks lulus.
- Node.js 22 dan 24 lulus.
- Coverage minimum terpenuhi.
- Memory store lulus storage contract tests.
- Dataset compatibility fixtures lulus.
- Tidak ada known critical correctness bug.
- Tidak ada critical runtime vulnerability yang relevan.
- Benchmark baseline tersedia.

#### Package

- Build ESM berhasil.
- Type declarations tersedia.
- publint lulus.
- Are The Types Wrong lulus.
- Tarball consumer smoke tests lulus.
- Isi tarball benar.
- `engines.node` sesuai.
- `exports` hanya memuat public entry point yang disengaja.

#### Dokumentasi

- README memiliki contoh yang dapat dijalankan.
- Dataset contract terdokumentasi.
- Public API utama terdokumentasi.
- Error handling terdokumentasi.
- Limitasi MVP dijelaskan.
- Changelog tersedia.
- License tersedia.

#### Release

- Changeset diterapkan.
- Version benar.
- Git tag dan GitHub Release dibuat.
- Package dipublikasikan melalui trusted publishing.
- Provenance tersedia.
- Artefak dapat diinstal dari npm setelah publish.

### Fitur yang Tidak Memblokir MVP

Fitur berikut tidak diperlukan untuk `v0.1.0`:

- PostgreSQL adapter.
- MySQL adapter.
- MongoDB adapter.
- Database importer dan import CLI.
- Fuzzy search.
- Cursor pagination.
- Data historis dan wilayah nonaktif.
- Browser dan edge runtime.
- CommonJS.
- Automatic dataset download.
- Direct `.gz` loading.
- Persistent cache.
- Streaming JSON parser.
- Multi-country aggregation dalam satu instance.
- Universal attribute query.

Tidak adanya fitur tersebut tidak berarti desain boleh menghalangi implementasinya pada masa mendatang.

### Roadmap Setelah MVP

#### `v0.2.x` — Contract Stabilization

- Integrasi penuh dengan release dataset `region_squirrel`.
- Perbaikan validator dan search semantics berdasarkan dataset nyata.
- Benchmark dataset Indonesia–BPS.
- Penguatan extension contract `RegionStore`.
- API report atau snapshot.
- Dokumentasi adapter author.

Kriteria selesai:

- Storage contract cukup stabil untuk adapter eksternal.
- Tidak ada asumsi memory-only pada public API.
- Dataset nyata dapat digunakan tanpa internal workaround.

#### `v0.3.x` — PostgreSQL Adapter

- Package PostgreSQL adapter.
- Storage schema, constraint, dan index.
- Shared contract tests.
- Integration tests dengan PostgreSQL nyata.
- Query native untuk lookup, filter, pagination, dan traversal.
- Connection ownership.
- Storage schema version.
- Dokumentasi penggunaan.

PostgreSQL menjadi adapter referensi pertama untuk menguji kelayakan storage contract.

#### `v0.4.x` — Database Importer

- Import JSON tervalidasi ke PostgreSQL.
- Checksum verification.
- Transactional import.
- Dataset metadata.
- Re-import atau replacement strategy.
- Failure rollback.
- CLI atau programmatic importer terpisah dari runtime query.

Importer tidak menambahkan mutation API ke `RegionKit`.

#### `v0.5.x` — MySQL Adapter

- Package MySQL adapter.
- Storage schema.
- Query dan traversal.
- Contract dan integration tests.
- Import support.
- Dokumentasi.

Implementasi tidak boleh menyalin query PostgreSQL jika semantic atau kemampuan MySQL berbeda.

#### `v0.6.x` — MongoDB Adapter

- Package MongoDB adapter.
- Collection schema dan index strategy.
- Contract dan integration tests.
- Import support.
- Traversal strategy.
- Dokumentasi.

MongoDB adapter tetap harus menghasilkan semantic public API yang sama dengan memory dan SQL store.

#### `v0.7+` — Evaluasi Fitur Lanjutan

Fitur dipilih berdasarkan penggunaan nyata dan benchmark:

- Cursor pagination.
- Fuzzy search.
- Persistent cache.
- Streaming atau lazy loading.
- Compressed dataset loading.
- Attribute query contract.
- Data historis.
- Wilayah nonaktif.
- Multi-dataset orchestration.
- Testkit package untuk adapter pihak ketiga.

Nomor minor tersebut merupakan urutan kerja konseptual, bukan janji bahwa setiap milestone harus dipublikasikan tepat dengan nomor tersebut. Milestone dapat digabung, dipecah, atau diurutkan ulang berdasarkan hasil implementasi.

### Kriteria Menuju `1.0.0`

`1.0.0` menandakan public contract yang stabil, bukan sekadar jumlah fitur.

Kriteria minimum:

- Core telah digunakan dengan dataset nyata.
- Memory/JSON store stabil.
- Sekurangnya satu database adapter resmi stabil.
- Storage contract terbukti pada lebih dari satu implementasi.
- Public API tidak mengalami breaking change berulang.
- Dataset schema memiliki compatibility policy yang jelas.
- Error code stabil.
- Pagination dan sorting semantics stabil.
- Lifecycle dan connection ownership jelas.
- Migration guide tersedia.
- Security dan release pipeline matang.
- Dokumentasi cukup bagi consumer tanpa membaca source code.
- Tidak ada known critical correctness issue.
- Benchmark menunjukkan performa dapat diterima untuk target penggunaan.
- Maintainer siap mengikuti Semantic Versioning secara ketat.

PostgreSQL adapter cukup sebagai database adapter minimum menuju `1.0.0`. MySQL dan MongoDB tidak harus selesai jika belum cukup matang.

### Definisi Selesai

Sebuah milestone dianggap selesai hanya jika:

- Implementasi selesai.
- Behaviour tests tersedia.
- Quality gates lulus.
- Dokumentasi diperbarui.
- Changeset tersedia jika berdampak pada package.
- Known limitation dicatat.
- Tidak ada pekerjaan kritis yang disembunyikan sebagai TODO.
- Artefak dapat digunakan melalui public API, bukan internal workaround.

### Ringkasan Keputusan

| Aspek | Keputusan |
| --- | --- |
| Rilis MVP | `v0.1.0` |
| Fokus MVP | Core dan memory/JSON store |
| Database adapter pada MVP | Tidak wajib |
| Storage contract pada MVP | Wajib |
| Milestone pertama | Repository foundation |
| Adapter database pertama | PostgreSQL |
| Importer | Setelah PostgreSQL schema stabil |
| MySQL dan MongoDB | Setelah kontrak terbukti |
| Fitur lanjutan | Berdasarkan penggunaan dan benchmark |
| Makna `1.0.0` | Stabilitas public contract |
| Database minimum menuju `1.0.0` | Satu adapter resmi yang stabil |
| Definition of done | Code, tests, docs, dan quality gates |

---

## Urutan pembahasan

1. Tujuan dan batas tanggung jawab
2. Target pengguna dan lingkungan runtime
3. Model data wilayah
4. Arsitektur library
5. Penyimpanan dan distribusi data
6. Public API
7. Toolchain
8. Struktur repository
9. Quality gates
10. Roadmap dan kriteria rilis

## Keputusan awal yang sudah diketahui

| Keputusan                                                        | Status     | Catatan                                                                            |
| ---------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------- |
| `region-kit` dibuat sebagai library Node.js                      | Disepakati | Minimum Node.js 22; CI awal menguji Node.js 22 dan 24.                             |
| Library bersifat framework-agnostic                              | Disepakati | Tidak bergantung pada framework aplikasi tertentu.                                 |
| Library boleh sedikit opinionated                                | Disepakati | Convention dapat diberikan selama tidak mengunci pengguna pada framework tertentu. |
| Crawling bukan tanggung jawab `region-kit`                       | Disepakati | Crawling tetap ditangani oleh `region_squirrel`.                                   |
| `region_squirrel` dan `region-kit` tetap menjadi proyek terpisah | Disepakati | Pemisahan tanggung jawab dipertahankan.                                            |

## Riwayat perubahan

| Tanggal    | Perubahan                                            |
| ---------- | ---------------------------------------------------- |
| 2026-07-11 | Draft awal dibuat dari sepuluh topik fondasi proyek. |
| 2026-07-12 | Menetapkan arsitektur internal `region-kit`.         |
| 2026-07-12 | Merevisi arsitektur untuk storage adapter dan menetapkan penyimpanan serta distribusi data. |
| 2026-07-12 | Menetapkan public API, pagination, traversal, lifecycle, dan error behaviour. |
| 2026-07-12 | Menetapkan testing standards, compatibility checks, merge gates, dan release gates. |
| 2026-07-12 | Menetapkan roadmap MVP, milestone pasca-MVP, dan kriteria menuju `1.0.0`. |
