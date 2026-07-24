# Versioning and Migrations

Versi package `region-kit`, versi schema, dan versi dataset merupakan tiga hal
yang independen:

- package version mengikuti SemVer untuk runtime dan public API;
- `schemaVersion` mengikuti compatibility line Region-Kit Dataset Contract;
- `datasetVersion` ditentukan publisher dataset berdasarkan siklus datanya.

## Kebijakan package 0.x

- Patch release digunakan untuk perubahan backward-compatible, perbaikan bug,
  dokumentasi, dan metadata distribusi.
- Minor release dapat membawa breaking change sebelum `1.0.0`.
- Breaking change tetap wajib memiliki changeset dan migration note yang
  menjelaskan perubahan import, signature, behavior, atau kontrak adapter.
- Deprecation diberikan bila praktis, tetapi belum dijamin untuk seluruh
  perubahan sebelum `1.0.0`.
- Setelah `1.0.0`, breaking public API change memerlukan major release.

## Compatibility schema

MVP menerima schema `1.x.x`. Perubahan minor/patch schema harus tetap dapat
dipahami validator pada compatibility line yang sama. Schema major baru dapat
mengubah field atau invariant dan memerlukan dukungan eksplisit dari versi
package yang kompatibel.

Upgrade package tidak otomatis memigrasikan dataset. Sebelum upgrade:

1. baca changelog dan migration note;
2. jalankan validator baru terhadap representative dataset;
3. jalankan contract tests untuk custom `RegionStore`;
4. verifikasi ordering, pagination, error handling, dan lifecycle;
5. deploy package dan dataset sebagai artefak terpisah sesuai kebutuhan.

Adapter storage boleh memiliki versi package sendiri. Adapter harus menyatakan
rentang versi `region-kit` yang didukung melalui peer dependency atau kebijakan
compatibility yang terdokumentasi.
