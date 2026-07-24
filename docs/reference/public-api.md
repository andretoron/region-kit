# Public API Reference

Consumer hanya boleh mengimpor dari root package:

```ts
import { RegionKit, type Region } from "region-kit";
```

Internal deep import tidak didukung dan ditolak oleh package `exports`.

## Runtime exports

- `RegionKit`
- `MemoryRegionStore`
- `validateRegionDataset()`
- `RegionKitError`
- `DatasetLoadError`
- `DatasetValidationError`
- `QueryValidationError`
- `RegionNotFoundError`
- `RegionKitClosedError`

## Type exports

Public types mencakup:

- model dataset: `Region`, `RegionDataset`, `DatasetMetadata`,
  `DatasetCountry`, dan `DatasetSource`;
- query dan pagination: `QueryOptions`, `PaginationOptions`, `SortOptions`,
  `PageInfo`, `RegionPage`, serta search/filter option dan result types;
- extension contract: `RegionStore`;
- error code, loading stage, validation issue, dan validation path types.

Daftar authoritative berada di `packages/core/src/index.ts`. Referensi HTML yang
menjelaskan signature, property, default, ordering, lifecycle, dan error dapat
dihasilkan dengan:

```bash
pnpm run docs
```

Output tersedia di `.generated/docs/api/index.html`. CI menjalankan
`pnpm docs:check` dan memperlakukan warning dokumentasi sebagai error.
