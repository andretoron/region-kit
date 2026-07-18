# Memvalidasi Dataset JSON

Gunakan `validateRegionDataset()` untuk memvalidasi nilai yang belum dipercaya
sebelum menggunakannya sebagai `RegionDataset`.

```ts
import { DatasetValidationError, validateRegionDataset } from "region-kit";

const input: unknown = JSON.parse(jsonText);

try {
  const dataset = validateRegionDataset(input);

  console.log(dataset.country.name);
} catch (error) {
  if (error instanceof DatasetValidationError) {
    for (const issue of error.issues) {
      console.error(issue.code, issue.path, issue.message);
    }
  } else {
    throw error;
  }
}
```

Pada contoh tersebut, `jsonText` adalah string JSON yang diperoleh oleh aplikasi.
`validateRegionDataset()` menerima `unknown` dan melempar
`DatasetValidationError` ketika dataset tidak memenuhi kontrak. Hindari mencatat
seluruh input invalid karena data tersebut dapat berukuran besar atau memuat
informasi sensitif.

## Tanggung Jawab Validator

`validateRegionDataset()`:

- menerima input bertipe `unknown` dan mengembalikan `RegionDataset`;
- mengembalikan object input yang sama tanpa menyalin, membekukan,
  menormalisasi, atau mengurutkan isinya;
- menjalankan validasi struktural sebelum validasi hierarki;
- mengumpulkan sebanyak mungkin issue independen yang aman diperiksa;
- melempar `DatasetValidationError` ketika validasi gagal;
- menerima additional properties yang tidak menjadi bagian kontrak saat ini;
- menerima schema `1.x.x` dengan format ketat `MAJOR.MINOR.PATCH`.

Validasi hierarki hanya dijalankan jika struktur input sudah aman. Karena itu,
masalah struktural tidak dicampur dengan issue hierarki yang bergantung pada
struktur tersebut.

Validator tidak mengubah `readonly` menjadi runtime deep-freeze. Validator juga
belum menjamin format ISO untuk timestamp, validitas `source.url`, atau format
versi tertentu untuk `datasetVersion`; field tersebut saat ini hanya diperiksa
sebagai string yang tidak kosong.

## Invariant Hierarki

Dataset yang valid harus memenuhi aturan berikut:

- memiliki tepat satu root;
- root memiliki `parentId: null`, level `0`, dan type `"country"`;
- setiap region memiliki ID unik;
- parent setiap region non-root tersedia;
- region tidak menjadi parent dirinya sendiri;
- level child lebih besar daripada level parent;
- hierarki tidak mengandung cycle.
