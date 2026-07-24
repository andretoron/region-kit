# Querying Regions

Gunakan facade `RegionKit` untuk memuat dataset, mencari region, menelusuri
hierarki, dan mengelola lifecycle store melalui satu public API.

## Membuat Instance

Dataset JSON lokal dapat dimuat dari path atau `file:` URL:

```ts
import { RegionKit } from "region-kit";

const regions = await RegionKit.fromFile("./data/regions.json");
```

Gunakan `RegionKit.fromData()` ketika dataset sudah tersedia sebagai nilai
JavaScript, atau `RegionKit.fromStore()` untuk implementasi `RegionStore`
sendiri:

```ts
import { RegionKit, type RegionStore } from "region-kit";

const fromData = await RegionKit.fromData(dataset);

declare const store: RegionStore;
const fromStore = await RegionKit.fromStore(store);
```

Input `fromData()` dan hasil JSON dari `fromFile()` divalidasi sebelum memory
store dibuat.

## Optional dan Required Lookup

`getById()` cocok ketika region boleh tidak tersedia. Method ini mengembalikan
`null` untuk ID yang tidak ditemukan:

```ts
const region = await regions.getById("ID-JB");

if (region === null) {
  console.log("Region tidak ditemukan");
}
```

Gunakan `requireById()` ketika region wajib tersedia. ID yang tidak ditemukan
menghasilkan `RegionNotFoundError`:

```ts
const province = await regions.requireById("ID-JB");
```

Code tidak dijamin unik, sehingga `findByCode()` mengembalikan page, bukan satu
region:

```ts
const matches = await regions.findByCode("32", {
  level: 1,
});
```

## Search dan Name Lookup

Gunakan `findByName()` untuk lookup nama yang terarah, termasuk pencocokan alias
bila diminta:

```ts
const matches = await regions.findByName("Bandung", {
  match: "exact",
  includeAliases: true,
});
```

Gunakan `search()` ketika hasil perlu menjelaskan apakah nama atau alias yang
cocok. Setiap item membawa `matchedField` dan `matchedValue`:

```ts
const results = await regions.search("bandung", {
  match: "contains",
  levels: [2],
  types: ["city", "regency"],
});

for (const item of results.items) {
  console.log(item.region.name, item.matchedField, item.matchedValue);
}
```

Mode pencocokan yang tersedia adalah `exact`, `prefix`, dan `contains`.

## Filtering

`filter()` menggabungkan field criteria menggunakan AND. Beberapa nilai di
dalam satu array menggunakan OR:

```ts
const cities = await regions.filter({
  parentId: "ID-JB",
  levels: [2],
  types: ["city"],
});
```

Gunakan `parentId: null` untuk memilih root region.

## Traversal

Method traversal mengikuti hubungan parent-child dalam dataset:

```ts
const parent = await regions.parentOf("ID-JB-CITY-BDG");
const children = await regions.childrenOf("ID-JB");
const ancestors = await regions.ancestorsOf("ID-JB-CITY-BDG-DISTRICT");
const descendants = await regions.descendantsOf("ID-JB", {
  maxDepth: 2,
});
```

`parentOf()` mengembalikan `null` hanya untuk root. Ancestor diurutkan dari
parent langsung menuju root. Target traversal yang tidak dikenal menghasilkan
`RegionNotFoundError`.

## Pagination dan Sorting

Collection query mendukung offset pagination dan sorting:

```ts
const page = await regions.filter(
  { levels: [2] },
  {
    limit: 20,
    offset: 0,
    sortBy: "name",
    direction: "asc",
  },
);

console.log(page.page.hasMore, page.page.total);
```

Default `limit` adalah `50` dan maksimum `1000`. Field sorting yang tersedia
adalah `code`, `name`, `level`, dan `type`. Semua collection memakai ID sebagai
internal tie-breaker agar urutannya deterministik.

## Lifecycle

Selalu tutup instance ketika selesai digunakan:

```ts
const regions = await RegionKit.fromFile("./data/regions.json");

try {
  const result = await regions.search("bandung");
  console.log(result.items);
} finally {
  await regions.close();
}
```

`close()` bersifat idempotent. Query setelah instance ditutup menghasilkan
`RegionKitClosedError`.
