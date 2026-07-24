# Menggunakan Dataset JSON

Gunakan `RegionKit.fromData()` ketika aplikasi sudah memiliki nilai JavaScript,
atau `RegionKit.fromFile()` untuk file JSON lokal. Keduanya memvalidasi input dan
membuat indexed memory snapshot.

## Dari nilai JavaScript

```ts
import { RegionKit, type RegionDataset } from "region-kit";

const dataset: RegionDataset = {
  schemaVersion: "1.0.0",
  datasetVersion: "example-1",
  country: { code: "ID", name: "Indonesia" },
  source: { id: "example", name: "Example source" },
  generatedAt: "2026-07-24T00:00:00.000Z",
  regions: [
    {
      id: "ID",
      code: "ID",
      name: "Indonesia",
      level: 0,
      type: "country",
      parentId: null,
    },
  ],
};

const regions = await RegionKit.fromData(dataset);

try {
  console.log(await regions.getMetadata());
} finally {
  await regions.close();
}
```

Untuk input yang berasal dari luar trust boundary, pertahankan tipenya sebagai
`unknown`. `fromData()` akan menghasilkan `DatasetValidationError` jika input
tidak memenuhi kontrak.

## Dari file lokal

```ts
const regions = await RegionKit.fromFile("./data/regions.json");
```

Path relatif di-resolve dari current working directory process. `file:` URL juga
didukung:

```ts
const regions = await RegionKit.fromFile(
  new URL("./data/regions.json", import.meta.url),
);
```

`fromFile()` hanya mendukung JSON lokal. HTTP(S), compressed archives, streaming,
automatic download, dan update dataset berada di luar API MVP. Download atau
transformasi dilakukan aplikasi/tooling terlebih dahulu, kemudian hasil lokal
diberikan kepada `region-kit`.

Kegagalan membaca file menghasilkan `DatasetLoadError` dengan stage `"read"`.
JSON invalid menghasilkan stage `"parse"`, sedangkan JSON valid yang melanggar
kontrak menghasilkan `DatasetValidationError`.
