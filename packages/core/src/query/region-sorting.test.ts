import { describe, expect, it } from "vitest";

import type { Region } from "../dataset/index.js";

import {
  createRegionSortRules,
  sortRegions,
  sortRegionSearchResults,
} from "./region-sorting.js";

function createRegion(overrides: Partial<Region> = {}): Region {
  return {
    id: "region",
    code: "00",
    name: "Region",
    level: 0,
    type: "region",
    parentId: null,
    ...overrides,
  };
}

describe("createRegionSortRules", () => {
  it("adds an ascending id tie-breaker", () => {
    const rules = createRegionSortRules("name", "desc");

    expect(rules).toEqual([
      {
        field: "name",
        direction: "desc",
      },
      {
        field: "id",
        direction: "asc",
      },
    ]);
    expect(Object.isFrozen(rules)).toBe(true);
    expect(rules.every((rule) => Object.isFrozen(rule))).toBe(true);
  });

  it("adds secondary fields before the id tie-breaker", () => {
    expect(createRegionSortRules("level", "asc", ["code"])).toEqual([
      {
        field: "level",
        direction: "asc",
      },
      {
        field: "code",
        direction: "asc",
      },
      {
        field: "id",
        direction: "asc",
      },
    ]);
  });
});

describe("sortRegions", () => {
  it("sorts code in ascending order", () => {
    const result = sortRegions(
      [
        createRegion({ id: "region-b", code: "02" }),
        createRegion({ id: "region-a", code: "01" }),
      ],
      createRegionSortRules("code", "asc"),
    );

    expect(result.map((region) => region.id)).toEqual(["region-a", "region-b"]);
  });

  it("sorts name in descending order", () => {
    const result = sortRegions(
      [
        createRegion({ id: "region-a", name: "Alpha" }),
        createRegion({ id: "region-z", name: "Zulu" }),
      ],
      createRegionSortRules("name", "desc"),
    );

    expect(result.map((region) => region.id)).toEqual(["region-z", "region-a"]);
  });

  it("sorts level numerically", () => {
    const result = sortRegions(
      [
        createRegion({ id: "region-10", level: 10 }),
        createRegion({ id: "region-2", level: 2 }),
      ],
      createRegionSortRules("level", "asc"),
    );

    expect(result.map((region) => region.level)).toEqual([2, 10]);
  });

  it("uses id ascending when the primary field is equal", () => {
    const result = sortRegions(
      [
        createRegion({ id: "region-b", code: "01" }),
        createRegion({ id: "region-a", code: "01" }),
      ],
      createRegionSortRules("code", "asc"),
    );

    expect(result.map((region) => region.id)).toEqual(["region-a", "region-b"]);
  });

  it("does not mutate the input array", () => {
    const input = [
      createRegion({ id: "region-b", code: "02" }),
      createRegion({ id: "region-a", code: "01" }),
    ];
    const originalOrder = input.map((region) => region.id);

    sortRegions(input, createRegionSortRules("code", "asc"));

    expect(input.map((region) => region.id)).toEqual(originalOrder);
  });

  it("produces the same result for different input orders", () => {
    const regions = [
      createRegion({ id: "region-c", code: "02" }),
      createRegion({ id: "region-b", code: "01" }),
      createRegion({ id: "region-a", code: "01" }),
    ];
    const rules = createRegionSortRules("code", "asc");

    const forward = sortRegions(regions, rules);
    const reversed = sortRegions([...regions].reverse(), rules);

    expect(forward.map((region) => region.id)).toEqual([
      "region-a",
      "region-b",
      "region-c",
    ]);
    expect(reversed.map((region) => region.id)).toEqual(
      forward.map((region) => region.id),
    );
  });
});

describe("sortRegionSearchResults", () => {
  it("sorts by region fields instead of matched value", () => {
    const results = [
      {
        region: createRegion({
          id: "region-b",
          name: "Beta",
        }),
        matchedField: "name" as const,
        matchedValue: "Beta",
      },
      {
        region: createRegion({
          id: "region-a",
          name: "Alpha",
        }),
        matchedField: "alias" as const,
        matchedValue: "Unrelated Alias",
      },
    ];

    const sorted = sortRegionSearchResults(
      results,
      createRegionSortRules("name", "asc"),
    );

    expect(sorted.map((result) => result.region.id)).toEqual([
      "region-a",
      "region-b",
    ]);
  });

  it("uses id ascending when the primary region field is equal", () => {
    const results = [
      {
        region: createRegion({ id: "region-b", name: "Bandung" }),
        matchedField: "name" as const,
        matchedValue: "Bandung",
      },
      {
        region: createRegion({ id: "region-a", name: "Bandung" }),
        matchedField: "alias" as const,
        matchedValue: "Bandung City",
      },
    ];

    const sorted = sortRegionSearchResults(
      results,
      createRegionSortRules("name", "asc"),
    );

    expect(sorted.map((result) => result.region.id)).toEqual([
      "region-a",
      "region-b",
    ]);
  });
});
