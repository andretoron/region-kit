# Region-Kit Dataset Contract

`region-kit` menerima dataset matang yang sudah memiliki metadata, provenance,
dan satu hierarki wilayah yang konsisten. Package tidak membundel dataset dan
tidak melakukan crawling. Proyek seperti `region_squirrel` dapat menghasilkan
dataset, tetapi tetap merupakan proyek terpisah dan output-nya harus memenuhi
kontrak ini sebelum digunakan.

## Bentuk dataset

```json
{
  "schemaVersion": "1.0.0",
  "datasetVersion": "2026.07.0",
  "country": {
    "code": "ID",
    "name": "Indonesia"
  },
  "source": {
    "id": "example",
    "name": "Example source",
    "url": "https://example.com/regions",
    "retrievedAt": "2026-07-20T00:00:00.000Z"
  },
  "generatedAt": "2026-07-21T00:00:00.000Z",
  "regions": [
    {
      "id": "ID",
      "code": "ID",
      "name": "Indonesia",
      "level": 0,
      "type": "country",
      "parentId": null
    },
    {
      "id": "ID-JB",
      "code": "32",
      "name": "Jawa Barat",
      "level": 1,
      "type": "province",
      "parentId": "ID",
      "aliases": ["West Java"],
      "attributes": {
        "capital": "Bandung"
      }
    }
  ]
}
```

## Metadata

- `schemaVersion` menyatakan versi kontrak struktur. MVP menerima versi valid
  `1.x.x` dan menolak major version lain.
- `datasetVersion` ditentukan publisher dataset dan tidak harus sama dengan
  versi package `region-kit`.
- `country` mengidentifikasi negara yang direpresentasikan dataset.
- `source` menyimpan identitas dan provenance sumber. `url` dan `retrievedAt`
  bersifat opsional.
- `generatedAt` mencatat waktu dataset dihasilkan.

Timestamp dan URL saat ini divalidasi sebagai string non-kosong, belum divalidasi
secara semantik sebagai ISO 8601 atau URL yang dapat diakses.

## Region

Setiap region wajib memiliki:

- `id` unik dalam dataset;
- `code`, yang tidak harus unik secara global;
- `name` sebagai nama utama;
- `level` berupa bilangan bulat non-negatif;
- `type` yang konsisten dengan definisi administratif dataset;
- `parentId` yang menunjuk region lain atau `null` untuk root.

`aliases` dan `attributes` bersifat opsional. Core menggunakan alias untuk
pencarian, tetapi tidak menafsirkan isi `attributes`.

## Validasi dan normalisasi

`validateRegionDataset()` menjalankan validasi struktural sebelum validasi
hierarki. Validator mengembalikan object input yang sama dan tidak:

- memperbaiki data;
- mengubah kapitalisasi atau whitespace;
- mengurutkan region;
- menghasilkan alias;
- menyalin atau membekukan object secara mendalam.

Additional properties diterima agar kontrak dapat diperluas tanpa membuat core
menafsirkan field yang tidak dikenalnya. Nilai `readonly` pada tipe TypeScript
bukan runtime deep-freeze.

Lihat [panduan validasi](../guides/dataset-validation.md) dan
[model hierarki](./hierarchy-model.md) untuk invariant lengkap.
