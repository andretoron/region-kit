import { describe, expect, it } from "vitest";

import type { Region } from "../dataset/index.js";

import { regionStoreContractDataset } from "../../test/contract/region-store-contract-dataset.js";

import {
  createMemoryRegionSearchPage,
  findMemorySearchResults,
} from "./memory-search.js";
import { prepareMemoryDataset } from "./prepare-memory-dataset.js";

function createSearchFixture() {
  return prepareMemoryDataset(structuredClone(regionStoreContractDataset));
}

function createBandungResults() {
  const prepared = createSearchFixture();
  const results = findMemorySearchResults(
    prepared.regions,
    "bandung",
    "contains",
    {},
  );

  return {
    prepared,
    results,
  };
}

describe("findMemorySearchResults", () => {
  it("prefers a primary name match over aliases", () => {
    const prepared = createSearchFixture();
    const result = findMemorySearchResults(
      prepared.regions,
      "bandung",
      "contains",
      {},
    );
    const city = result.find((item) => item.region.id === "ID-JB-CITY-BDG");

    expect(city).toMatchObject({
      matchedField: "name",
      matchedValue: "Kota Bandung",
    });
  });

  it("reports exact alias matches", () => {
    const prepared = createSearchFixture();
    const result = findMemorySearchResults(
      prepared.regions,
      "Bandung",
      "exact",
      {},
    );

    expect(result).toEqual([
      expect.objectContaining({
        region: expect.objectContaining({
          id: "ID-JB-CITY-BDG",
        }),
        matchedField: "alias",
        matchedValue: "Bandung",
      }),
      expect.objectContaining({
        region: expect.objectContaining({
          id: "ID-JB-REG-BDG",
        }),
        matchedField: "alias",
        matchedValue: "Bandung",
      }),
    ]);
  });

  it("reports alias-only matches", () => {
    const prepared = createSearchFixture();
    const result = findMemorySearchResults(
      prepared.regions,
      "west",
      "contains",
      {},
    );

    expect(result).toEqual([
      expect.objectContaining({
        region: expect.objectContaining({
          id: "ID-JB",
        }),
        matchedField: "alias",
        matchedValue: "West Java",
      }),
    ]);
  });

  it("uses the first matching alias", () => {
    const region: Region = {
      id: "region-bandung",
      code: "01",
      name: "Other Name",
      level: 1,
      type: "city",
      parentId: null,
      aliases: ["Bandung City", "Greater Bandung"],
    };

    const result = findMemorySearchResults([region], "bandung", "contains", {});

    expect(result).toEqual([
      {
        region,
        matchedField: "alias",
        matchedValue: "Bandung City",
      },
    ]);
  });

  it("returns one result when name and multiple aliases match", () => {
    const region: Region = {
      id: "region-bandung",
      code: "01",
      name: "Bandung",
      level: 1,
      type: "city",
      parentId: null,
      aliases: ["Bandung", "Bandung City"],
    };

    const result = findMemorySearchResults([region], "bandung", "contains", {});

    expect(result).toEqual([
      {
        region,
        matchedField: "name",
        matchedValue: "Bandung",
      },
    ]);
  });

  it("filters by parent id", () => {
    const prepared = createSearchFixture();
    const result = findMemorySearchResults(
      prepared.regions,
      "bandung",
      "contains",
      {
        parentId: "ID-JB",
      },
    );

    expect(result.map((item) => item.region.id)).toEqual([
      "ID-JB-CITY-BDG",
      "ID-JB-REG-BDG",
    ]);
  });

  it("filters by levels", () => {
    const prepared = createSearchFixture();
    const result = findMemorySearchResults(
      prepared.regions,
      "bandung",
      "contains",
      {
        levels: [2],
      },
    );

    expect(result.map((item) => item.region.id)).toEqual([
      "ID-JB-CITY-BDG",
      "ID-JB-REG-BDG",
    ]);
  });

  it("filters by types", () => {
    const prepared = createSearchFixture();
    const result = findMemorySearchResults(
      prepared.regions,
      "bandung",
      "contains",
      {
        types: ["city"],
      },
    );

    expect(result.map((item) => item.region.id)).toEqual(["ID-JB-CITY-BDG"]);
  });

  it("combines search filters with AND", () => {
    const prepared = createSearchFixture();
    const result = findMemorySearchResults(
      prepared.regions,
      "bandung",
      "contains",
      {
        parentId: "ID-JB",
        levels: [2],
        types: ["city"],
      },
    );

    expect(result.map((item) => item.region.id)).toEqual(["ID-JB-CITY-BDG"]);
  });

  it.each([{ levels: [] }, { types: [] }])(
    "returns no results for an empty filter array %#",
    (options) => {
      const prepared = createSearchFixture();

      expect(
        findMemorySearchResults(
          prepared.regions,
          "bandung",
          "contains",
          options,
        ),
      ).toEqual([]);
    },
  );
});

describe("createMemoryRegionSearchPage", () => {
  it("uses default pagination", () => {
    const { results } = createBandungResults();
    const page = createMemoryRegionSearchPage(results);

    expect(page.items).toHaveLength(2);
    expect(page.page).toEqual({
      limit: 50,
      offset: 0,
      hasMore: false,
      total: 2,
    });
  });

  it("applies limit and offset", () => {
    const { results } = createBandungResults();
    const page = createMemoryRegionSearchPage(results, {
      limit: 1,
      offset: 1,
    });

    expect(page.items.map((item) => item.region.id)).toEqual(["ID-JB-REG-BDG"]);
    expect(page.page).toEqual({
      limit: 1,
      offset: 1,
      hasMore: false,
      total: 2,
    });
  });

  it("returns an empty exhausted page", () => {
    const { results } = createBandungResults();
    const page = createMemoryRegionSearchPage(results, {
      limit: 1,
      offset: 2,
    });

    expect(page.items).toEqual([]);
    expect(page.page).toEqual({
      limit: 1,
      offset: 2,
      hasMore: false,
      total: 2,
    });
  });

  it("does not expose internal result or region references", () => {
    const { results } = createBandungResults();
    const source = results[0];
    const page = createMemoryRegionSearchPage(results);
    const publicResult = page.items[0];

    expect(source).toBeDefined();
    expect(publicResult).toBeDefined();

    if (source === undefined || publicResult === undefined) {
      return;
    }

    expect(publicResult).not.toBe(source);
    expect(publicResult.region).not.toBe(source.region);

    Reflect.set(publicResult, "matchedValue", "Mutated");
    Reflect.set(publicResult.region, "name", "Mutated");

    if (publicResult.region.aliases !== undefined) {
      Reflect.set(publicResult.region.aliases, "0", "Mutated Alias");
    }

    expect(source.matchedValue).toBe("Kota Bandung");
    expect(source.region.name).toBe("Kota Bandung");
    expect(source.region.aliases).toEqual(["Bandung"]);
  });

  it("freezes page containers", () => {
    const { results } = createBandungResults();
    const page = createMemoryRegionSearchPage(results);

    expect(Object.isFrozen(page)).toBe(true);
    expect(Object.isFrozen(page.items)).toBe(true);
    expect(Object.isFrozen(page.page)).toBe(true);
  });

  it("does not mutate input results", () => {
    const { results } = createBandungResults();
    const snapshot = structuredClone(results);

    createMemoryRegionSearchPage(results, {
      limit: 1,
      offset: 1,
    });

    expect(results).toEqual(snapshot);
  });
});
