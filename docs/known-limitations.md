# Known Limitations

`region-kit 0.1.x` adalah MVP. Batas dukungan saat ini:

- hanya Node.js 22 atau lebih baru;
- hanya ECMAScript modules; CommonJS, browser, edge runtime, dan React Native
  belum didukung;
- package tidak membundel dataset dan tidak mengunduh dataset otomatis;
- `fromFile()` hanya membaca JSON lokal, tanpa HTTP(S), archive, streaming, atau
  file watcher;
- built-in store memuat seluruh dataset dan index ke memory;
- satu dataset merepresentasikan satu hierarki dengan tepat satu country root;
- query teks hanya mendukung exact, prefix, dan contains yang case-insensitive;
  belum ada fuzzy search, typo tolerance, stemming, locale collation, atau
  relevance ranking;
- pagination menggunakan offset, bukan cursor;
- runtime bersifat read-only dan tidak menyediakan add, update, atau delete;
- validator belum memeriksa timestamp sebagai ISO 8601 atau URL sebagai URL
  yang dapat diakses;
- `attributes` diteruskan sebagai data dataset-specific dan tidak diinterpretasi
  core;
- API publik dapat berubah sebelum `1.0.0` sesuai kebijakan migrasi.

Database adapter, import tooling, caching terdistribusi, dataset publishing, dan
normalization pipeline berada di luar package core MVP.
