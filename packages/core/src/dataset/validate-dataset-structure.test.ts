import { describe, expect, it } from "vitest";

import { DatasetValidationError } from "../errors/index.js";
import { validateDatasetStructure } from "./validate-dataset-structure.js";

function createValidDataset(): Record<string, unknown> {
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
    regions: [],
  };
}

function createRegion(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: "id:bps:country:ID",
    code: "ID",
    name: "Indonesia",
    level: 0,
    type: "country",
    parentId: null,
    ...overrides,
  };
}

function captureValidationError(input: unknown): DatasetValidationError {
  try {
    validateDatasetStructure(input);
    throw new Error("Expected dataset validation to fail.");
  } catch (error) {
    if (error instanceof DatasetValidationError) {
      return error;
    }

    throw error;
  }
}

function expectIssue(
  error: DatasetValidationError,
  code: string,
  path: readonly (string | number)[],
): void {
  expect(error.issues).toContainEqual(
    expect.objectContaining({
      code,
      path,
    }),
  );
}

describe("validateDatasetStructure", () => {
  it("returns the original structurally valid dataset", () => {
    const dataset = createValidDataset();

    expect(validateDatasetStructure(dataset)).toBe(dataset);
  });

  it("does not mutate the input", () => {
    const dataset = createValidDataset();
    dataset.regions = [
      createRegion({
        aliases: ["Indonesia"],
        attributes: { population: 280_000_000 },
      }),
    ];
    const before = structuredClone(dataset);

    validateDatasetStructure(dataset);

    expect(dataset).toEqual(before);
  });

  it("accepts optional source metadata and additional properties", () => {
    const dataset = createValidDataset();
    const source = dataset.source as Record<string, unknown>;

    source.url = "https://example.com/dataset";
    source.retrievedAt = "2026-07-01T08:00:00.000Z";
    source.license = "Example";
    dataset.experimental = true;
    dataset.regions = [createRegion({ futureMetadata: { enabled: true } })];

    expect(() => validateDatasetStructure(dataset)).not.toThrow();
  });

  it.each([null, [], "dataset", 123, true])(
    "rejects a non-object dataset: %j",
    (input) => {
      const error = captureValidationError(input);

      expect(error.issues).toEqual([
        expect.objectContaining({
          code: "INVALID_DATASET",
          path: [],
        }),
      ]);
    },
  );

  it("collects independent top-level issues", () => {
    const error = captureValidationError({});

    expect(error.issues).toHaveLength(6);
    expectIssue(error, "MISSING_REQUIRED_FIELD", ["schemaVersion"]);
    expectIssue(error, "MISSING_REQUIRED_FIELD", ["datasetVersion"]);
    expectIssue(error, "MISSING_REQUIRED_FIELD", ["country"]);
    expectIssue(error, "MISSING_REQUIRED_FIELD", ["source"]);
    expectIssue(error, "MISSING_REQUIRED_FIELD", ["generatedAt"]);
    expectIssue(error, "MISSING_REQUIRED_FIELD", ["regions"]);
  });

  it("distinguishes missing fields from fields with invalid types", () => {
    const missingDataset = createValidDataset();
    delete missingDataset.datasetVersion;

    expectIssue(
      captureValidationError(missingDataset),
      "MISSING_REQUIRED_FIELD",
      ["datasetVersion"],
    );

    const invalidDataset = createValidDataset();
    invalidDataset.datasetVersion = undefined;

    expectIssue(captureValidationError(invalidDataset), "INVALID_FIELD_TYPE", [
      "datasetVersion",
    ]);
  });

  it.each([
    ["datasetVersion", ["datasetVersion"]],
    ["generatedAt", ["generatedAt"]],
  ] as const)("rejects an empty %s", (field, path) => {
    const dataset = createValidDataset();
    dataset[field] = "   ";

    expectIssue(captureValidationError(dataset), "INVALID_FIELD_VALUE", path);
  });

  it("validates nested required strings", () => {
    const dataset = createValidDataset();
    (dataset.country as Record<string, unknown>).code = "";
    dataset.regions = [createRegion({ name: 123 })];

    const error = captureValidationError(dataset);

    expectIssue(error, "INVALID_FIELD_VALUE", ["country", "code"]);
    expectIssue(error, "INVALID_FIELD_TYPE", ["regions", 0, "name"]);
  });

  it("rejects malformed schema versions while collecting other issues", () => {
    const dataset = createValidDataset();
    dataset.schemaVersion = "1.0";
    delete dataset.generatedAt;

    const error = captureValidationError(dataset);

    expectIssue(error, "INVALID_FIELD_VALUE", ["schemaVersion"]);
    expectIssue(error, "MISSING_REQUIRED_FIELD", ["generatedAt"]);
  });

  it("rejects unsupported schema major versions", () => {
    const dataset = createValidDataset();
    dataset.schemaVersion = "2.0.0";

    expectIssue(captureValidationError(dataset), "UNSUPPORTED_SCHEMA_VERSION", [
      "schemaVersion",
    ]);
  });

  it("does not run schema compatibility checks for a non-string version", () => {
    const dataset = createValidDataset();
    dataset.schemaVersion = 1;

    const error = captureValidationError(dataset);

    expect(error.issues).toHaveLength(1);
    expectIssue(error, "INVALID_FIELD_TYPE", ["schemaVersion"]);
  });

  it.each([
    ["country", "Indonesia"],
    ["source", []],
  ])("rejects a non-object %s without child issues", (field, value) => {
    const dataset = createValidDataset();
    dataset[field] = value;

    const error = captureValidationError(dataset);

    expect(error.issues).toHaveLength(1);
    expectIssue(error, "INVALID_FIELD_TYPE", [field]);
  });

  it.each([
    ["url", " ", "INVALID_FIELD_VALUE"],
    ["url", 123, "INVALID_FIELD_TYPE"],
    ["retrievedAt", " ", "INVALID_FIELD_VALUE"],
    ["retrievedAt", false, "INVALID_FIELD_TYPE"],
  ] as const)(
    "rejects an invalid optional source.%s value %j",
    (field, value, code) => {
      const dataset = createValidDataset();
      (dataset.source as Record<string, unknown>)[field] = value;

      expectIssue(captureValidationError(dataset), code, ["source", field]);
    },
  );

  it("rejects regions when it is not an array", () => {
    const dataset = createValidDataset();
    dataset.regions = {};

    expectIssue(captureValidationError(dataset), "INVALID_FIELD_TYPE", [
      "regions",
    ]);
  });

  it("rejects a non-object region without child issues", () => {
    const dataset = createValidDataset();
    dataset.regions = [null];

    const error = captureValidationError(dataset);

    expect(error.issues).toHaveLength(1);
    expectIssue(error, "INVALID_FIELD_TYPE", ["regions", 0]);
  });

  it("reports all missing required region fields", () => {
    const dataset = createValidDataset();
    dataset.regions = [{}];

    const error = captureValidationError(dataset);

    expect(error.issues).toHaveLength(6);
    for (const field of ["id", "code", "name", "type", "level", "parentId"]) {
      expectIssue(error, "MISSING_REQUIRED_FIELD", ["regions", 0, field]);
    }
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53])(
    "rejects an invalid region level: %s",
    (level) => {
      const dataset = createValidDataset();
      dataset.regions = [createRegion({ level })];

      expectIssue(captureValidationError(dataset), "INVALID_FIELD_VALUE", [
        "regions",
        0,
        "level",
      ]);
    },
  );

  it("distinguishes an invalid level type from an invalid value", () => {
    const dataset = createValidDataset();
    dataset.regions = [createRegion({ level: "1" })];

    expectIssue(captureValidationError(dataset), "INVALID_FIELD_TYPE", [
      "regions",
      0,
      "level",
    ]);
  });

  it.each([null, "id:bps:country:ID"])(
    "accepts parentId %j structurally",
    (parentId) => {
      const dataset = createValidDataset();
      dataset.regions = [createRegion({ parentId })];

      expect(() => validateDatasetStructure(dataset)).not.toThrow();
    },
  );

  it.each([
    [123, "INVALID_FIELD_TYPE"],
    [" ", "INVALID_FIELD_VALUE"],
  ])("rejects invalid parentId %j", (parentId, code) => {
    const dataset = createValidDataset();
    dataset.regions = [createRegion({ parentId })];

    expectIssue(captureValidationError(dataset), code, [
      "regions",
      0,
      "parentId",
    ]);
  });

  it("rejects aliases that are not an array", () => {
    const dataset = createValidDataset();
    dataset.regions = [createRegion({ aliases: "Indonesia" })];

    expectIssue(captureValidationError(dataset), "INVALID_FIELD_TYPE", [
      "regions",
      0,
      "aliases",
    ]);
  });

  it("reports the exact invalid alias indexes", () => {
    const dataset = createValidDataset();
    dataset.regions = [createRegion({ aliases: ["Indonesia", "", 123] })];

    const error = captureValidationError(dataset);

    expectIssue(error, "INVALID_FIELD_VALUE", ["regions", 0, "aliases", 1]);
    expectIssue(error, "INVALID_FIELD_TYPE", ["regions", 0, "aliases", 2]);
  });

  it.each([null, [], "attributes", 123])(
    "rejects invalid attributes: %j",
    (attributes) => {
      const dataset = createValidDataset();
      dataset.regions = [createRegion({ attributes })];

      expectIssue(captureValidationError(dataset), "INVALID_FIELD_TYPE", [
        "regions",
        0,
        "attributes",
      ]);
    },
  );

  it("accepts an empty regions array structurally", () => {
    expect(() => validateDatasetStructure(createValidDataset())).not.toThrow();
  });

  it("does not perform hierarchy validation", () => {
    const dataset = createValidDataset();
    dataset.regions = [
      createRegion({ id: "duplicate", code: "A" }),
      createRegion({
        id: "duplicate",
        code: "B",
        level: 1,
        type: "province",
        parentId: "missing-parent",
      }),
    ];

    expect(() => validateDatasetStructure(dataset)).not.toThrow();
  });
});
