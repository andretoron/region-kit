import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { PageInfo } from "../../src/query/index.js";
import type { RegionStore } from "../../src/store/index.js";

import {
  regionStoreContractDataset,
  regionStoreContractMetadata,
} from "./region-store-contract-dataset.js";

export interface RegionStoreContractOptions {
  readonly createStore: () => Promise<RegionStore>;

  readonly destroyStore?: (store: RegionStore) => Promise<void>;
}

interface ExpectedPageInfo {
  readonly limit: number;
  readonly offset: number;
  readonly hasMore: boolean;
  readonly total: number;
}

function expectPageInfo(page: PageInfo, expected: ExpectedPageInfo): void {
  expect(page).toEqual(
    expect.objectContaining({
      limit: expected.limit,
      offset: expected.offset,
      hasMore: expected.hasMore,
    }),
  );

  if (page.total !== undefined) {
    expect(page.total).toBe(expected.total);
  }
}

function attemptMutation(mutate: () => unknown): void {
  try {
    mutate();
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }
  }
}

export function defineRegionStoreContract(
  options: RegionStoreContractOptions,
): void {
  describe("RegionStore contract", () => {
    let store: RegionStore | undefined;

    function currentStore(): RegionStore {
      if (store === undefined) {
        throw new Error(
          "RegionStore contract test has not initialized a store",
        );
      }

      return store;
    }

    beforeEach(async () => {
      store = await options.createStore();
    });

    afterEach(async () => {
      if (store === undefined) {
        return;
      }

      if (options.destroyStore !== undefined) {
        await options.destroyStore(store);
      } else {
        await store.close();
      }

      store = undefined;
    });

    it("returns dataset metadata without regions", async () => {
      const metadata = await currentStore().getMetadata();

      expect(metadata).toEqual(regionStoreContractMetadata);
      expect(metadata).not.toHaveProperty("regions");
    });

    it("returns a region by id", async () => {
      const region = await currentStore().getById("ID-JB");

      expect(region).toEqual(regionStoreContractDataset.regions[1]);
    });

    it("returns null for an unknown id", async () => {
      await expect(currentStore().getById("unknown")).resolves.toBeNull();
    });

    it("allows multiple regions to share the same code", async () => {
      const result = await currentStore().findByCode("01");

      expect(result.items).toHaveLength(2);
      expect(result.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "ID-JB-CITY-BDG-DISTRICT",
          }),
          expect.objectContaining({
            id: "ID-JB-REG-BDG-DISTRICT",
          }),
        ]),
      );
    });

    it("returns an empty page for an unknown code", async () => {
      const result = await currentStore().findByCode("unknown");

      expect(result.items).toEqual([]);
      expect(result.page.hasMore).toBe(false);
    });

    it("filters code lookup by parent id", async () => {
      const result = await currentStore().findByCode("01", {
        parentId: "ID-JB-CITY-BDG",
      });

      expect(result.items).toEqual([
        expect.objectContaining({
          id: "ID-JB-CITY-BDG-DISTRICT",
        }),
      ]);
    });

    it("filters code lookup by level", async () => {
      const result = await currentStore().findByCode("01", {
        level: 2,
      });

      expect(result.items).toEqual([]);
    });

    it("filters code lookup by type", async () => {
      const result = await currentStore().findByCode("01", {
        type: "city",
      });

      expect(result.items).toEqual([]);
    });

    it("applies code lookup pagination with consistent page info", async () => {
      const firstPage = await currentStore().findByCode("01", {
        limit: 1,
        offset: 0,
      });
      const secondPage = await currentStore().findByCode("01", {
        limit: 1,
        offset: 1,
      });
      const exhaustedPage = await currentStore().findByCode("01", {
        limit: 1,
        offset: 2,
      });

      expect(firstPage.items).toHaveLength(1);
      expect(secondPage.items).toHaveLength(1);
      expect(exhaustedPage.items).toEqual([]);

      expect(
        new Set(
          [...firstPage.items, ...secondPage.items].map((region) => region.id),
        ),
      ).toEqual(new Set(["ID-JB-CITY-BDG-DISTRICT", "ID-JB-REG-BDG-DISTRICT"]));

      expectPageInfo(firstPage.page, {
        limit: 1,
        offset: 0,
        hasMore: true,
        total: 2,
      });
      expectPageInfo(secondPage.page, {
        limit: 1,
        offset: 1,
        hasMore: false,
        total: 2,
      });
      expectPageInfo(exhaustedPage.page, {
        limit: 1,
        offset: 2,
        hasMore: false,
        total: 2,
      });
    });

    it("finds an exact primary name", async () => {
      const result = await currentStore().findByName("Jawa Barat");

      expect(result.items).toEqual([
        expect.objectContaining({
          id: "ID-JB",
        }),
      ]);
    });

    it("matches exact names case-insensitively", async () => {
      const result = await currentStore().findByName("jAwA bArAt");

      expect(result.items).toEqual([
        expect.objectContaining({
          id: "ID-JB",
        }),
      ]);
    });

    it("normalizes whitespace in name queries", async () => {
      const result = await currentStore().findByName("  jawa   barat  ");

      expect(result.items).toEqual([
        expect.objectContaining({
          id: "ID-JB",
        }),
      ]);
    });

    it("supports prefix name matching", async () => {
      const result = await currentStore().findByName("kota", {
        match: "prefix",
      });

      expect(result.items).toEqual([
        expect.objectContaining({
          id: "ID-JB-CITY-BDG",
        }),
      ]);
    });

    it("supports contains name matching", async () => {
      const result = await currentStore().findByName("barat", {
        match: "contains",
      });

      expect(result.items).toEqual([
        expect.objectContaining({
          id: "ID-JB",
        }),
      ]);
    });

    it("includes aliases by default", async () => {
      const result = await currentStore().findByName("Bandung");

      expect(result.items).toHaveLength(2);
      expect(result.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "ID-JB-CITY-BDG",
          }),
          expect.objectContaining({
            id: "ID-JB-REG-BDG",
          }),
        ]),
      );
    });

    it("can exclude aliases", async () => {
      const result = await currentStore().findByName("Bandung", {
        includeAliases: false,
      });

      expect(result.items).toEqual([]);
    });

    it("still searches primary names when aliases are excluded", async () => {
      const result = await currentStore().findByName("Jawa Barat", {
        includeAliases: false,
      });

      expect(result.items).toEqual([
        expect.objectContaining({
          id: "ID-JB",
        }),
      ]);
    });

    it("filters name lookup by parent id", async () => {
      const result = await currentStore().findByName("Bandung", {
        parentId: "ID",
      });

      expect(result.items).toEqual([]);
    });

    it("filters name lookup by level", async () => {
      const result = await currentStore().findByName("Bandung", {
        level: 1,
      });

      expect(result.items).toEqual([]);
    });

    it("filters name lookup by type", async () => {
      const result = await currentStore().findByName("Bandung", {
        type: "city",
      });

      expect(result.items).toEqual([
        expect.objectContaining({
          id: "ID-JB-CITY-BDG",
        }),
      ]);
    });

    it("returns an empty page for an unknown name", async () => {
      const result = await currentStore().findByName("Sulawesi");

      expect(result.items).toEqual([]);
      expect(result.page.hasMore).toBe(false);
    });

    it("does not expose mutable internal region state", async () => {
      const first = await currentStore().getById("ID-JB-CITY-BDG");

      expect(first).not.toBeNull();

      if (first === null) {
        return;
      }

      attemptMutation(() => Reflect.set(first, "name", "Mutated"));

      const aliases = first.aliases;

      if (aliases !== undefined) {
        attemptMutation(() => Reflect.set(aliases, "0", "Mutated Alias"));
      }

      const attributes = first.attributes;

      if (attributes !== undefined) {
        attemptMutation(() => Reflect.set(attributes, "category", "mutated"));
      }

      const second = await currentStore().getById("ID-JB-CITY-BDG");

      expect(second).toEqual(
        expect.objectContaining({
          name: "Kota Bandung",
          aliases: ["Bandung"],
          attributes: {
            category: "urban",
          },
        }),
      );
    });

    it("does not expose mutable internal metadata state", async () => {
      const first = await currentStore().getMetadata();

      attemptMutation(() => Reflect.set(first, "datasetVersion", "mutated"));
      attemptMutation(() =>
        Reflect.set(first.country, "name", "Mutated Country"),
      );
      attemptMutation(() =>
        Reflect.set(first.source, "name", "Mutated Source"),
      );

      const second = await currentStore().getMetadata();

      expect(second).toEqual(regionStoreContractMetadata);
    });

    it("can be closed more than once", async () => {
      await currentStore().close();
      await expect(currentStore().close()).resolves.toBeUndefined();
    });
  });
}
