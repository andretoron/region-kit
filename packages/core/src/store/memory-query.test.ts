import { describe, expect, it } from "vitest";

import { regionStoreContractDataset } from "../../test/contract/region-store-contract-dataset.js";

import { buildMemoryIndexes } from "./memory-indexes.js";

import {
  createMemoryRegionPage,
  DEFAULT_MEMORY_PAGE_LIMIT,
  filterMemoryRegions,
  findMemoryNameCandidates,
} from "./memory-query.js";

import { prepareMemoryDataset } from "./prepare-memory-dataset.js";

function createQueryFixture() {
  const prepared = prepareMemoryDataset(
    structuredClone(regionStoreContractDataset),
  );

  return {
    prepared,
    indexes: buildMemoryIndexes(prepared.regions),
  };
}

describe("filterMemoryRegions", () => {
  it("filters regions by parent, level, and type", () => {
    const { prepared } = createQueryFixture();

    const result = filterMemoryRegions(prepared.regions, {
      parentId: "ID-JB",
      level: 2,
      type: "city",
    });

    expect(result.map((region) => region.id)).toEqual(["ID-JB-CITY-BDG"]);
  });

  it("returns all candidates when no filters are provided", () => {
    const { prepared } = createQueryFixture();

    const result = filterMemoryRegions(prepared.regions, {});

    expect(result).toEqual(prepared.regions);
  });
});

describe("findMemoryNameCandidates", () => {
  it("uses exact matching by default", () => {
    const { prepared, indexes } = createQueryFixture();

    const result = findMemoryNameCandidates(
      prepared.regions,
      indexes,
      "  JAWA   BARAT ",
    );

    expect(result.map((region) => region.id)).toEqual(["ID-JB"]);
  });

  it("includes aliases by default", () => {
    const { prepared, indexes } = createQueryFixture();

    const result = findMemoryNameCandidates(
      prepared.regions,
      indexes,
      "Bandung",
    );

    expect(result.map((region) => region.id)).toEqual([
      "ID-JB-CITY-BDG",
      "ID-JB-REG-BDG",
    ]);
  });

  it("can exclude aliases", () => {
    const { prepared, indexes } = createQueryFixture();

    const result = findMemoryNameCandidates(
      prepared.regions,
      indexes,
      "Bandung",
      {
        includeAliases: false,
      },
    );

    expect(result).toEqual([]);
  });

  it("supports prefix matching", () => {
    const { prepared, indexes } = createQueryFixture();

    const result = findMemoryNameCandidates(prepared.regions, indexes, "kota", {
      match: "prefix",
    });

    expect(result.map((region) => region.id)).toEqual(["ID-JB-CITY-BDG"]);
  });

  it("supports contains matching against aliases", () => {
    const { prepared, indexes } = createQueryFixture();

    const result = findMemoryNameCandidates(prepared.regions, indexes, "west", {
      match: "contains",
    });

    expect(result.map((region) => region.id)).toEqual(["ID-JB"]);
  });

  it("does not duplicate a region matching multiple names", () => {
    const { prepared, indexes } = createQueryFixture();

    const result = findMemoryNameCandidates(
      prepared.regions,
      indexes,
      "bandung",
      {
        match: "contains",
      },
    );

    expect(result.map((region) => region.id)).toEqual([
      "ID-JB-CITY-BDG",
      "ID-JB-REG-BDG",
    ]);
  });
});

describe("createMemoryRegionPage", () => {
  it("uses the default pagination values", () => {
    const { prepared } = createQueryFixture();

    const result = createMemoryRegionPage(prepared.regions);

    expect(result.items).toHaveLength(prepared.regions.length);

    expect(result.page).toEqual({
      limit: DEFAULT_MEMORY_PAGE_LIMIT,
      offset: 0,
      hasMore: false,
      total: prepared.regions.length,
    });
  });

  it("applies limit and offset", () => {
    const { indexes } = createQueryFixture();
    const candidates = indexes.byCode.get("01") ?? [];

    const first = createMemoryRegionPage(candidates, {
      limit: 1,
      offset: 0,
    });

    const second = createMemoryRegionPage(candidates, {
      limit: 1,
      offset: 1,
    });

    expect(first.items).toHaveLength(1);
    expect(first.page).toEqual({
      limit: 1,
      offset: 0,
      hasMore: true,
      total: 2,
    });

    expect(second.items).toHaveLength(1);
    expect(second.page).toEqual({
      limit: 1,
      offset: 1,
      hasMore: false,
      total: 2,
    });
  });

  it("returns an empty exhausted page", () => {
    const { indexes } = createQueryFixture();
    const candidates = indexes.byCode.get("01") ?? [];

    const result = createMemoryRegionPage(candidates, {
      limit: 1,
      offset: 2,
    });

    expect(result.items).toEqual([]);
    expect(result.page).toEqual({
      limit: 1,
      offset: 2,
      hasMore: false,
      total: 2,
    });
  });

  it("does not expose internal region references", () => {
    const { prepared } = createQueryFixture();
    const internalRegion = prepared.regions[2];

    expect(internalRegion).toBeDefined();

    if (internalRegion === undefined) {
      return;
    }

    const result = createMemoryRegionPage([internalRegion]);

    const publicRegion = result.items[0];

    expect(publicRegion).toBeDefined();

    if (publicRegion === undefined) {
      return;
    }

    expect(publicRegion).not.toBe(internalRegion);
    expect(publicRegion.aliases).not.toBe(internalRegion.aliases);
    expect(publicRegion.attributes).not.toBe(internalRegion.attributes);

    Reflect.set(publicRegion, "name", "Mutated");

    if (publicRegion.aliases !== undefined) {
      Reflect.set(publicRegion.aliases, "0", "Mutated Alias");
    }

    if (publicRegion.attributes !== undefined) {
      Reflect.set(publicRegion.attributes, "category", "mutated");
    }

    expect(internalRegion).toEqual(
      expect.objectContaining({
        name: "Kota Bandung",
        aliases: ["Bandung"],
        attributes: {
          category: "urban",
        },
      }),
    );
  });

  it("freezes the page containers", () => {
    const { prepared } = createQueryFixture();

    const result = createMemoryRegionPage(prepared.regions);

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.items)).toBe(true);
    expect(Object.isFrozen(result.page)).toBe(true);
  });
});
