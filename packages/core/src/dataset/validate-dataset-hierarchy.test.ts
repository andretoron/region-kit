import { describe, expect, it } from "vitest";
import { DatasetValidationError } from "../errors/index.js";
import type { Region, RegionDataset } from "./types.js";
import { validateDatasetHierarchy } from "./validate-dataset-hierarchy.js";

function createRegion(overrides: Partial<Region> = {}): Region {
  return {
    id: "ID",
    code: "ID",
    name: "Indonesia",
    level: 0,
    type: "country",
    parentId: null,
    ...overrides,
  };
}

function createValidDataset(
  regions: readonly Region[] = [
    createRegion(),
    createRegion({
      id: "ID-JB",
      code: "32",
      name: "Jawa Barat",
      level: 1,
      type: "province",
      parentId: "ID",
    }),
  ],
): RegionDataset {
  return {
    schemaVersion: "1.0.0",
    datasetVersion: "2026.1.0",
    country: {
      code: "ID",
      name: "Indonesia",
    },
    source: {
      id: "bps",
      name: "Badan Pusat Statistik",
    },
    generatedAt: "2026-07-01T09:00:00.000Z",
    regions,
  };
}

function captureHierarchyError(dataset: RegionDataset): DatasetValidationError {
  try {
    validateDatasetHierarchy(dataset);
    throw new Error("Expected hierarchy validation to fail.");
  } catch (error) {
    if (error instanceof DatasetValidationError) {
      return error;
    }

    throw error;
  }
}

describe("validateDatasetHierarchy", () => {
  it("returns the original dataset when the hierarchy is valid", () => {
    const dataset = createValidDataset();

    expect(validateDatasetHierarchy(dataset)).toBe(dataset);
  });

  it("does not mutate the dataset", () => {
    const dataset = createValidDataset();
    const before = structuredClone(dataset);

    validateDatasetHierarchy(dataset);

    expect(dataset).toEqual(before);
  });

  it("rejects duplicate region ids", () => {
    const dataset = createValidDataset([
      createRegion(),
      createRegion({
        id: "ID",
        code: "duplicate",
        name: "Duplicate",
        level: 1,
        type: "province",
        parentId: "ID",
      }),
    ]);

    const error = captureHierarchyError(dataset);

    expect(error.issues).toContainEqual({
      code: "DUPLICATE_REGION_ID",
      path: ["regions", 1, "id"],
      message: 'Region id "ID" duplicates the region at index 0.',
    });
  });

  it("reports every occurrence after the first duplicate id", () => {
    const dataset = createValidDataset([
      createRegion(),
      createRegion({
        id: "ID",
        code: "duplicate-1",
        name: "Duplicate 1",
        level: 1,
        type: "province",
        parentId: "ID",
      }),
      createRegion({
        id: "ID",
        code: "duplicate-2",
        name: "Duplicate 2",
        level: 1,
        type: "province",
        parentId: "ID",
      }),
    ]);

    const error = captureHierarchyError(dataset);

    expect(
      error.issues.filter((issue) => issue.code === "DUPLICATE_REGION_ID"),
    ).toHaveLength(2);
  });

  it("rejects a dataset without a root", () => {
    const dataset = createValidDataset([
      createRegion({
        id: "A",
        code: "A",
        name: "A",
        level: 1,
        type: "province",
        parentId: "B",
      }),
      createRegion({
        id: "B",
        code: "B",
        name: "B",
        level: 1,
        type: "province",
        parentId: "A",
      }),
    ]);

    const error = captureHierarchyError(dataset);

    expect(error.issues).toContainEqual(
      expect.objectContaining({
        code: "INVALID_ROOT_COUNT",
        path: ["regions"],
      }),
    );
  });

  it("rejects an empty region collection", () => {
    const dataset = createValidDataset([]);

    const error = captureHierarchyError(dataset);

    expect(error.issues).toContainEqual(
      expect.objectContaining({
        code: "INVALID_ROOT_COUNT",
        path: ["regions"],
      }),
    );
  });

  it("rejects multiple roots", () => {
    const dataset = createValidDataset([
      createRegion({
        id: "ID",
        code: "ID",
        name: "Indonesia",
      }),
      createRegion({
        id: "MY",
        code: "MY",
        name: "Malaysia",
      }),
    ]);

    const error = captureHierarchyError(dataset);

    expect(error.issues).toContainEqual(
      expect.objectContaining({
        code: "INVALID_ROOT_COUNT",
        path: ["regions"],
      }),
    );
  });

  it("requires the root to have level 0", () => {
    const dataset = createValidDataset([
      createRegion({
        level: 1,
      }),
    ]);

    const error = captureHierarchyError(dataset);

    expect(error.issues).toContainEqual(
      expect.objectContaining({
        code: "INVALID_ROOT_REGION",
        path: ["regions", 0, "level"],
      }),
    );
  });

  it('requires the root to have type "country"', () => {
    const dataset = createValidDataset([
      createRegion({
        type: "province",
      }),
    ]);

    const error = captureHierarchyError(dataset);

    expect(error.issues).toContainEqual(
      expect.objectContaining({
        code: "INVALID_ROOT_REGION",
        path: ["regions", 0, "type"],
      }),
    );
  });

  it("collects multiple root-shape issues", () => {
    const dataset = createValidDataset([
      createRegion({
        level: 2,
        type: "province",
      }),
    ]);

    const error = captureHierarchyError(dataset);

    expect(error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "INVALID_ROOT_REGION",
          path: ["regions", 0, "level"],
        }),
        expect.objectContaining({
          code: "INVALID_ROOT_REGION",
          path: ["regions", 0, "type"],
        }),
      ]),
    );
  });

  it("rejects an unknown parent reference", () => {
    const dataset = createValidDataset([
      createRegion(),
      createRegion({
        id: "ID-JB",
        code: "32",
        name: "Jawa Barat",
        level: 1,
        type: "province",
        parentId: "UNKNOWN",
      }),
    ]);

    const error = captureHierarchyError(dataset);

    expect(error.issues).toContainEqual(
      expect.objectContaining({
        code: "UNKNOWN_PARENT",
        path: ["regions", 1, "parentId"],
      }),
    );
  });

  it("rejects a self-parent relationship", () => {
    const dataset = createValidDataset([
      createRegion(),
      createRegion({
        id: "ID-JB",
        code: "32",
        name: "Jawa Barat",
        level: 1,
        type: "province",
        parentId: "ID-JB",
      }),
    ]);

    const error = captureHierarchyError(dataset);

    expect(error.issues).toContainEqual(
      expect.objectContaining({
        code: "SELF_PARENT",
        path: ["regions", 1, "parentId"],
      }),
    );

    expect(error.issues).not.toContainEqual(
      expect.objectContaining({
        code: "UNKNOWN_PARENT",
        path: ["regions", 1, "parentId"],
      }),
    );
  });

  it("collects independent hierarchy issues", () => {
    const dataset = createValidDataset([
      createRegion(),
      createRegion({
        id: "duplicate",
        code: "A",
        name: "A",
        level: 1,
        type: "province",
        parentId: "UNKNOWN",
      }),
      createRegion({
        id: "duplicate",
        code: "B",
        name: "B",
        level: 1,
        type: "province",
        parentId: "duplicate",
      }),
    ]);

    const error = captureHierarchyError(dataset);

    expect(error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "DUPLICATE_REGION_ID",
          path: ["regions", 2, "id"],
        }),
        expect.objectContaining({
          code: "UNKNOWN_PARENT",
          path: ["regions", 1, "parentId"],
        }),
        expect.objectContaining({
          code: "SELF_PARENT",
          path: ["regions", 2, "parentId"],
        }),
      ]),
    );
  });
});
