import { describe, expect, it } from "vitest";

import { regionStoreContractDataset } from "../../test/contract/region-store-contract-dataset.js";

import { buildMemoryIndexes } from "./memory-indexes.js";
import { prepareMemoryDataset } from "./prepare-memory-dataset.js";
import {
  findMemoryAncestors,
  findMemoryDescendants,
} from "./memory-traversal.js";

function createTraversalFixture() {
  const prepared = prepareMemoryDataset(
    structuredClone(regionStoreContractDataset),
  );

  return {
    prepared,
    indexes: buildMemoryIndexes(prepared.regions),
  };
}

describe("findMemoryAncestors", () => {
  it("returns direct parent through root", () => {
    const { indexes } = createTraversalFixture();
    const region = indexes.byId.get("ID-JB-CITY-BDG-DISTRICT");

    expect(region).toBeDefined();

    if (region === undefined) {
      return;
    }

    expect(
      findMemoryAncestors(region, indexes).map((ancestor) => ancestor.id),
    ).toEqual(["ID-JB-CITY-BDG", "ID-JB", "ID"]);
  });

  it("returns no ancestors for the root", () => {
    const { indexes } = createTraversalFixture();
    const root = indexes.byId.get("ID");

    expect(root).toBeDefined();

    if (root === undefined) {
      return;
    }

    expect(findMemoryAncestors(root, indexes)).toEqual([]);
  });
});

describe("findMemoryDescendants", () => {
  it("finds all descendants", () => {
    const { indexes } = createTraversalFixture();

    expect(
      findMemoryDescendants("ID-JB", indexes).map((region) => region.id),
    ).toEqual(
      expect.arrayContaining([
        "ID-JB-CITY-BDG",
        "ID-JB-REG-BDG",
        "ID-JB-CITY-BDG-DISTRICT",
        "ID-JB-REG-BDG-DISTRICT",
      ]),
    );
  });

  it("returns no descendants at max depth zero", () => {
    const { indexes } = createTraversalFixture();

    expect(findMemoryDescendants("ID-JB", indexes, 0)).toEqual([]);
  });

  it("returns direct children at max depth one", () => {
    const { indexes } = createTraversalFixture();

    expect(
      findMemoryDescendants("ID-JB", indexes, 1).map((region) => region.id),
    ).toEqual(["ID-JB-CITY-BDG", "ID-JB-REG-BDG"]);
  });

  it("returns children and grandchildren at max depth two", () => {
    const { indexes } = createTraversalFixture();

    expect(
      findMemoryDescendants("ID-JB", indexes, 2).map((region) => region.id),
    ).toEqual([
      "ID-JB-CITY-BDG",
      "ID-JB-REG-BDG",
      "ID-JB-CITY-BDG-DISTRICT",
      "ID-JB-REG-BDG-DISTRICT",
    ]);
  });

  it("returns no descendants for a leaf", () => {
    const { indexes } = createTraversalFixture();

    expect(findMemoryDescendants("ID-JB-CITY-BDG-DISTRICT", indexes)).toEqual(
      [],
    );
  });
});
