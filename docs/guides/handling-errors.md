# Menangani Error

Operational error publik mewarisi `RegionKitError` dan menyediakan `code` yang
stabil untuk branching. Gunakan `instanceof` ketika class tersedia dan `code`
ketika error melewati boundary serialisasi atau logging.

| Class                    | Code                  | Kondisi                                                      |
| ------------------------ | --------------------- | ------------------------------------------------------------ |
| `DatasetLoadError`       | `DATASET_LOAD_FAILED` | File gagal dibaca atau JSON gagal di-parse.                  |
| `DatasetValidationError` | `DATASET_INVALID`     | Dataset melanggar struktur, schema, atau invariant hierarki. |
| `QueryValidationError`   | `QUERY_INVALID`       | Argumen query, filter, sorting, atau pagination invalid.     |
| `RegionNotFoundError`    | `REGION_NOT_FOUND`    | Operasi membutuhkan target region yang tidak tersedia.       |
| `RegionKitClosedError`   | `REGION_KIT_CLOSED`   | Query dijalankan setelah instance ditutup.                   |

```ts
import {
  DatasetLoadError,
  DatasetValidationError,
  QueryValidationError,
  RegionKitClosedError,
  RegionNotFoundError,
} from "region-kit";

try {
  // Operasi region-kit.
} catch (error) {
  if (error instanceof DatasetLoadError) {
    console.error(error.stage, error.source, error.cause);
  } else if (error instanceof DatasetValidationError) {
    for (const issue of error.issues) {
      console.error(issue.code, issue.path, issue.message);
    }
  } else if (error instanceof QueryValidationError) {
    console.error(error.parameter, error.message);
  } else if (error instanceof RegionNotFoundError) {
    console.error(error.regionId);
  } else if (error instanceof RegionKitClosedError) {
    console.error(error.message);
  } else {
    throw error;
  }
}
```

`getById()` adalah lookup opsional dan mengembalikan `null`. `requireById()` dan
target traversal menggunakan `RegionNotFoundError`. Pilih method berdasarkan
apakah absennya region merupakan kondisi normal atau kegagalan operasi.

Hindari mencatat seluruh dataset invalid. Log `issues`, metadata yang aman, dan
correlation ID aplikasi agar log tidak membocorkan atau menggandakan input besar.
