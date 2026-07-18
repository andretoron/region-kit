import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  DatasetValidationError,
  validateRegionDataset,
  type RegionDataset,
} from "../index.js";

async function loadFixture(relativePath: string): Promise<unknown> {
  const fixtureUrl = new URL(
    `../../test/fixtures/dataset/${relativePath}`,
    import.meta.url,
  );
  const contents = await readFile(fixtureUrl, "utf8");

  return JSON.parse(contents) as unknown;
}

async function captureFixtureValidationError(
  relativePath: string,
): Promise<DatasetValidationError> {
  const input = await loadFixture(relativePath);

  try {
    validateRegionDataset(input);
    throw new Error(`Expected fixture "${relativePath}" to be invalid.`);
  } catch (error) {
    if (error instanceof DatasetValidationError) {
      return error;
    }

    throw error;
  }
}

describe("valid dataset fixtures", () => {
  it.each(["valid/minimal.json", "valid/complete.json"])(
    "accepts %s",
    async (fixturePath) => {
      const input = await loadFixture(fixturePath);
      const before = structuredClone(input);

      const dataset: RegionDataset = validateRegionDataset(input);

      expect(dataset).toBe(input);
      expect(input).toEqual(before);
    },
  );
});

describe("invalid dataset fixtures", () => {
  it.each([
    {
      path: "invalid/duplicate-id.json",
      code: "DUPLICATE_REGION_ID",
      issuePath: ["regions", 2, "id"],
    },
    {
      path: "invalid/unknown-parent.json",
      code: "UNKNOWN_PARENT",
      issuePath: ["regions", 1, "parentId"],
    },
    {
      path: "invalid/multiple-roots.json",
      code: "INVALID_ROOT_COUNT",
      issuePath: ["regions"],
    },
    {
      path: "invalid/invalid-child-level.json",
      code: "INVALID_CHILD_LEVEL",
      issuePath: ["regions", 2, "level"],
    },
    {
      path: "invalid/hierarchy-cycle.json",
      code: "HIERARCHY_CYCLE",
      issuePath: undefined,
    },
  ] as const)("rejects $path", async ({ path, code, issuePath }) => {
    const error = await captureFixtureValidationError(path);
    const issue = error.issues.find((candidate) => candidate.code === code);

    expect(issue).toBeDefined();

    if (issuePath !== undefined) {
      expect(issue?.path).toEqual(issuePath);
    }
  });

  it("collects structural issues from a JSON fixture", async () => {
    const error = await captureFixtureValidationError(
      "invalid/structural.json",
    );

    expect(error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "INVALID_FIELD_TYPE",
          path: ["schemaVersion"],
        }),
        expect.objectContaining({
          code: "INVALID_FIELD_VALUE",
          path: ["datasetVersion"],
        }),
        expect.objectContaining({
          code: "INVALID_FIELD_TYPE",
          path: ["country"],
        }),
        expect.objectContaining({
          code: "MISSING_REQUIRED_FIELD",
          path: ["source", "name"],
        }),
        expect.objectContaining({
          code: "INVALID_FIELD_TYPE",
          path: ["generatedAt"],
        }),
        expect.objectContaining({
          code: "INVALID_FIELD_TYPE",
          path: ["regions"],
        }),
      ]),
    );
    expect(error.issues).not.toContainEqual(
      expect.objectContaining({
        code: "INVALID_ROOT_COUNT",
      }),
    );
  });
});

describe("dataset schema compatibility fixtures", () => {
  it.each([
    "compatibility/supported-current.json",
    "compatibility/supported-later-minor.json",
  ])("accepts supported schema fixture %s", async (fixturePath) => {
    const input = await loadFixture(fixturePath);

    const dataset = validateRegionDataset(input);

    expect(dataset).toBe(input);
  });

  it.each([
    "compatibility/unsupported-previous-major.json",
    "compatibility/unsupported-next-major.json",
  ])("rejects unsupported schema fixture %s", async (fixturePath) => {
    const error = await captureFixtureValidationError(fixturePath);

    expect(error.issues).toContainEqual(
      expect.objectContaining({
        code: "UNSUPPORTED_SCHEMA_VERSION",
        path: ["schemaVersion"],
      }),
    );
  });
});
