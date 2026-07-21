import { describe, it, expect } from "vitest";

import { DatasetValidationError } from "../errors/index.js";

import { regionStoreContractDataset } from "../../test/contract/region-store-contract-dataset.js";

import { defineRegionStoreContract } from "../../test/contract/region-store.contract.js";

import { MemoryRegionStore } from "./memory-region-store.js";

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
});
