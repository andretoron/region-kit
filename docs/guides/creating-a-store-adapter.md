# Membuat RegionStore Adapter

Implementasikan `RegionStore` ketika data harus dibaca dari database, service,
atau storage lain. `RegionKit.fromStore()` hanya memeriksa bahwa semua method
tersedia; adapter bertanggung jawab memenuhi semantic contract-nya.

```ts
import {
  RegionKit,
  type DatasetMetadata,
  type DescendantOptions,
  type FindByCodeOptions,
  type FindByNameOptions,
  type QueryOptions,
  type Region,
  type RegionFilter,
  type RegionPage,
  type RegionSearchPage,
  type RegionStore,
  type SearchOptions,
} from "region-kit";

class DatabaseRegionStore implements RegionStore {
  // Implementasikan seluruh method RegionStore di sini.
}

const store = new DatabaseRegionStore();
const regions = await RegionKit.fromStore(store);

try {
  console.log(await regions.search("bandung"));
} finally {
  await regions.close();
}
```

## Behavioral contract

Adapter harus:

- mengimplementasikan seluruh method asynchronous `RegionStore`;
- mengembalikan `null` hanya untuk optional `getById()` dan parent root;
- menggunakan `RegionNotFoundError` untuk target traversal yang tidak ada;
- memvalidasi query invalid dengan `QueryValidationError`;
- menerapkan filter menggunakan AND dan nilai array menggunakan OR;
- menjaga ordering deterministik, termasuk tie-breaker stabil;
- menerapkan `limit`, `offset`, `hasMore`, dan `total` secara konsisten;
- mengurutkan ancestor dari parent langsung menuju root;
- menghormati `maxDepth` pada descendant traversal;
- membuat `close()` idempotent dan menunggu resource benar-benar dilepas.

## Ownership dan lifecycle

Store yang diberikan ke `RegionKit.fromStore()` menjadi milik instance tersebut.
`RegionKit.close()` memanggil `store.close()` tepat melalui shared close promise.
Jangan memakai store yang sama di beberapa owner kecuali adapter memang memiliki
reference counting atau lifecycle eksternal yang jelas.

Hindari mengekspos mutable internal state melalui hasil query. Clone, freeze,
atau materialize hasil sesuai karakter storage. Lihat runnable example
`examples/custom-store` untuk implementasi delegating adapter yang lengkap.
