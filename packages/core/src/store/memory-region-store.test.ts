import { describe, expect, it } from "vitest";

import {
  DatasetValidationError,
  QueryValidationError,
} from "../errors/index.js";

import { regionStoreContractDataset } from "../../test/contract/region-store-contract-dataset.js";

import { defineRegionStoreContract } from "../../test/contract/region-store.contract.js";

import { MemoryRegionStore } from "./memory-region-store.js";

function createStore(): MemoryRegionStore {
  return MemoryRegionStore.fromData(
    structuredClone(regionStoreContractDataset),
  );
}

defineRegionStoreContract({
  createStore: async () => {
    return MemoryRegionStore.fromData(
      structuredClone(regionStoreContractDataset),
    );
  },
});

describe("MemoryRegionStore", () => {
  it("rejects invalid datasets before creating a store", () => {
    expect(() => MemoryRegionStore.fromData({})).toThrow(
      DatasetValidationError,
    );
  });

  it("does not retain caller-owned region references", async () => {
    const input = structuredClone(regionStoreContractDataset);

    const store = MemoryRegionStore.fromData(input);

    const mutableRegion = input.regions[2] as unknown as {
      name: string;
      aliases: string[];
      attributes: Record<string, unknown>;
    };

    mutableRegion.name = "Mutated";
    mutableRegion.aliases[0] = "Mutated Alias";
    mutableRegion.attributes.category = "mutated";

    await expect(store.getById("ID-JB-CITY-BDG")).resolves.toEqual(
      expect.objectContaining({
        name: "Kota Bandung",
        aliases: ["Bandung"],
        attributes: {
          category: "urban",
        },
      }),
    );

    await store.close();
  });

  it("rejects an empty region id", async () => {
    const store = createStore();

    await expect(store.getById("")).rejects.toBeInstanceOf(
      QueryValidationError,
    );
  });

  it("rejects an empty code", async () => {
    const store = createStore();

    await expect(store.findByCode("")).rejects.toBeInstanceOf(
      QueryValidationError,
    );
  });

  it("rejects a blank name", async () => {
    const store = createStore();

    await expect(store.findByName("   ")).rejects.toBeInstanceOf(
      QueryValidationError,
    );
  });

  it.each([{ limit: 0 }, { limit: 1001 }, { offset: -1 }])(
    "rejects invalid pagination %#",
    async (options) => {
      const store = createStore();

      await expect(store.findByCode("01", options)).rejects.toBeInstanceOf(
        QueryValidationError,
      );
    },
  );

  it("rejects an invalid text match", async () => {
    const store = createStore();

    await expect(
      store.findByName("Bandung", {
        match: "fuzzy" as never,
      }),
    ).rejects.toBeInstanceOf(QueryValidationError);
  });

  it("rejects an invalid sort field", async () => {
    const store = createStore();

    await expect(
      store.findByCode("01", {
        sortBy: "id" as never,
      }),
    ).rejects.toBeInstanceOf(QueryValidationError);
  });

  it("sorts code lookup by code and then id by default", async () => {
    const store = createStore();

    const result = await store.findByCode("01");

    expect(result.items.map((region) => region.id)).toEqual([
      "ID-JB-CITY-BDG-DISTRICT",
      "ID-JB-REG-BDG-DISTRICT",
    ]);
  });

  it("sorts name lookup by name and then id by default", async () => {
    const store = createStore();

    const result = await store.findByName("Bandung");

    expect(result.items.map((region) => region.id)).toEqual([
      "ID-JB-REG-BDG",
      "ID-JB-CITY-BDG",
    ]);
  });

  it("supports descending sorting", async () => {
    const store = createStore();

    const result = await store.findByName("Bandung", {
      direction: "desc",
    });

    expect(result.items.map((region) => region.id)).toEqual([
      "ID-JB-CITY-BDG",
      "ID-JB-REG-BDG",
    ]);
  });

  it("sorts before applying pagination", async () => {
    const store = createStore();

    const firstPage = await store.findByName("bandung", {
      match: "contains",
      sortBy: "name",
      direction: "asc",
      limit: 1,
      offset: 0,
    });
    const secondPage = await store.findByName("bandung", {
      match: "contains",
      sortBy: "name",
      direction: "asc",
      limit: 1,
      offset: 1,
    });

    expect(firstPage.items.map((region) => region.id)).toEqual([
      "ID-JB-REG-BDG",
    ]);
    expect(secondPage.items.map((region) => region.id)).toEqual([
      "ID-JB-CITY-BDG",
    ]);
  });
});
