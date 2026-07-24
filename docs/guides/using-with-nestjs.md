# Menggunakan `region-kit` dengan NestJS

Integrasikan `RegionKit` sebagai provider singleton yang mengikuti lifecycle
aplikasi NestJS. Buat instance sekali ketika module diinisialisasi, gunakan
instance yang sama untuk setiap request, lalu tutup ketika aplikasi berhenti.

Jangan membuat instance baru di setiap request. `RegionKit.fromData()`
memvalidasi dataset dan membangun index, sehingga mengulang proses tersebut
menambah pekerjaan yang tidak diperlukan. Store adapter lain juga dapat
memiliki connection pool atau resource eksternal yang harus ditutup.

## Konfigurasi ESM

`region-kit` adalah package ESM-only. Pastikan `package.json` aplikasi berisi:

```json
{
  "type": "module"
}
```

Gunakan module resolution Node.js pada `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

Import relatif dalam source TypeScript menggunakan ekstensi output `.js`:

```ts
import { AppModule } from "./app.module.js";
```

## Siapkan dataset

Contoh berikut menyimpan dataset kecil dalam `dataset.ts`. Aplikasi nyata dapat
mengganti sumbernya dengan file JSON lokal melalui `RegionKit.fromFile()`.

```ts
import type { RegionDataset } from "region-kit";

export const dataset = {
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
    {
      id: "ID-JB",
      code: "32",
      name: "Jawa Barat",
      level: 1,
      type: "province",
      parentId: "ID",
    },
  ],
} satisfies RegionDataset;
```

## Buat provider

Gunakan `OnModuleInit` untuk menunggu pembuatan instance sebelum aplikasi mulai
menerima request. Gunakan `OnModuleDestroy` untuk melepaskan resource ketika
aplikasi ditutup.

```ts
import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from "@nestjs/common";
import { RegionKit, type Region } from "region-kit";

import { dataset } from "./dataset.js";

@Injectable()
export class RegionService implements OnModuleInit, OnModuleDestroy {
  #regions: RegionKit | undefined;

  public async onModuleInit(): Promise<void> {
    this.#regions = await RegionKit.fromData(dataset);
  }

  public async getById(id: string): Promise<Region | null> {
    const regions = this.#regions;

    if (!regions) {
      throw new ServiceUnavailableException(
        "RegionKit has not been initialized",
      );
    }

    return regions.getById(id);
  }

  public async onModuleDestroy(): Promise<void> {
    const regions = this.#regions;
    this.#regions = undefined;

    await regions?.close();
  }
}
```

Nest menunggu `Promise` dari `onModuleInit()`. Jika loading atau validasi dataset
gagal, proses bootstrap ikut gagal dan aplikasi tidak mulai menerima request
dengan state yang belum siap.

Provider ini harus tetap menggunakan scope singleton bawaan Nest. Jangan
menambahkan `Scope.REQUEST`, karena request-scoped provider tidak mengikuti
lifecycle aplikasi yang sama dan akan membuat instance baru untuk setiap
request.

## Daftarkan provider

```ts
import { Module } from "@nestjs/common";

import { RegionService } from "./region.service.js";

@Module({
  providers: [RegionService],
  exports: [RegionService],
})
export class RegionModule {}
```

Module lain dapat mengimpor `RegionModule` dan menyuntikkan `RegionService` ke
controller atau service:

```ts
import { Controller, Get, Param } from "@nestjs/common";

import { RegionService } from "./region.service.js";

@Controller("regions")
export class RegionController {
  public constructor(private readonly regions: RegionService) {}

  @Get(":id")
  public getById(@Param("id") id: string) {
    return this.regions.getById(id);
  }
}
```

## Aktifkan shutdown hooks

`onModuleDestroy()` dijalankan ketika aplikasi memanggil `app.close()`. Agar
signal proses seperti `SIGINT` dan `SIGTERM` juga memicu lifecycle shutdown,
aktifkan shutdown hooks saat bootstrap:

```ts
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module.js";

const app = await NestFactory.create(AppModule);

app.enableShutdownHooks();

await app.listen(process.env.PORT ?? 3000);
```

Dukungan signal tertentu bergantung pada sistem operasi. Pemanggilan
`await app.close()` secara eksplisit tetap menjalankan lifecycle shutdown Nest.
Lihat dokumentasi resmi
[NestJS lifecycle events](https://docs.nestjs.com/fundamentals/lifecycle-events)
untuk detail platform dan urutan hook.

## Pengujian

Tutup application atau testing module setelah setiap test agar
`onModuleDestroy()` dijalankan:

```ts
import { Test } from "@nestjs/testing";

import { RegionModule } from "./region.module.js";
import { RegionService } from "./region.service.js";

const module = await Test.createTestingModule({
  imports: [RegionModule],
}).compile();

try {
  const regions = module.get(RegionService);
  expect(await regions.getById("ID-JB")).toMatchObject({
    name: "Jawa Barat",
  });
} finally {
  await module.close();
}
```

`RegionKit.close()` bersifat idempotent, tetapi setiap owner tetap sebaiknya
memiliki satu jalur cleanup yang jelas.
