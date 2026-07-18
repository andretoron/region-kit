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
