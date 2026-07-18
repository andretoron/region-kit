import { describe, expect, it } from "vitest";

import { DatasetValidationError } from "../errors/index.js";
import { validateRegionDataset } from "./validate-region-dataset.js";

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
    regions: [
      {
        id: "ID",
        code: "ID",
        name: "Indonesia",
        level: 0,
        type: "country",
        parentId: null,
      },
      {
        id: "ID-JB",
        code: "32",
        name: "Jawa Barat",
        level: 1,
        type: "province",
        parentId: "ID",
      },
      {
        id: "ID-JB-BDG",
        code: "3273",
        name: "Kota Bandung",
        level: 2,
        type: "city",
        parentId: "ID-JB",
        aliases: ["Bandung"],
        attributes: {
          sourceCode: "3273",
        },
      },
    ],
  };
}

describe("validateRegionDataset", () => {
  it("returns a valid region dataset", () => {
    const input = createValidDataset();

    const dataset = validateRegionDataset(input);

    expect(dataset).toBe(input);
    expect(dataset.country.code).toBe("ID");
    expect(dataset.regions).toHaveLength(3);
  });

  it("does not mutate the input", () => {
    const input = createValidDataset();
    const before = structuredClone(input);

    validateRegionDataset(input);

    expect(input).toEqual(before);
  });

  it("stops before hierarchy validation when structure is invalid", () => {
    const input = createValidDataset();

    input.regions = "not-an-array";

    try {
      validateRegionDataset(input);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(DatasetValidationError);

      if (!(error instanceof DatasetValidationError)) {
        return;
      }

      expect(error.issues).toContainEqual(
        expect.objectContaining({
          code: "INVALID_FIELD_TYPE",
          path: ["regions"],
        }),
      );

      expect(error.issues).not.toContainEqual(
        expect.objectContaining({
          code: "INVALID_ROOT_COUNT",
        }),
      );
    }
  });

  it("reports only structural issues for an incomplete object", () => {
    try {
      validateRegionDataset({});
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(DatasetValidationError);

      if (!(error instanceof DatasetValidationError)) {
        return;
      }

      expect(error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "MISSING_REQUIRED_FIELD",
            path: ["schemaVersion"],
          }),
          expect.objectContaining({
            code: "MISSING_REQUIRED_FIELD",
            path: ["regions"],
          }),
        ]),
      );

      expect(error.issues).not.toContainEqual(
        expect.objectContaining({
          code: "INVALID_ROOT_COUNT",
        }),
      );
      expect(error.issues).not.toContainEqual(
        expect.objectContaining({
          code: "HIERARCHY_CYCLE",
        }),
      );
    }
  });

  it("performs hierarchy validation after structural validation", () => {
    const input = createValidDataset();

    input.regions = [];

    try {
      validateRegionDataset(input);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(DatasetValidationError);

      if (!(error instanceof DatasetValidationError)) {
        return;
      }

      expect(error.issues).toContainEqual(
        expect.objectContaining({
          code: "INVALID_ROOT_COUNT",
          path: ["regions"],
        }),
      );

      expect(error.issues).not.toContainEqual(
        expect.objectContaining({
          code: "INVALID_FIELD_TYPE",
          path: ["regions"],
        }),
      );
    }
  });

  it("reports duplicate region ids", () => {
    const input = createValidDataset();
    const regions = input.regions as Array<Record<string, unknown>>;

    regions.push({
      id: "ID-JB",
      code: "duplicate",
      name: "Duplicate Province",
      level: 1,
      type: "province",
      parentId: "ID",
    });

    try {
      validateRegionDataset(input);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(DatasetValidationError);

      if (!(error instanceof DatasetValidationError)) {
        return;
      }

      expect(error.issues).toContainEqual(
        expect.objectContaining({
          code: "DUPLICATE_REGION_ID",
          path: ["regions", 3, "id"],
        }),
      );
    }
  });

  it("reports hierarchy cycles", () => {
    const input = createValidDataset();
    const regions = input.regions as Array<Record<string, unknown>>;

    regions.push(
      {
        id: "cycle-a",
        code: "A",
        name: "Cycle A",
        level: 3,
        type: "district",
        parentId: "cycle-b",
      },
      {
        id: "cycle-b",
        code: "B",
        name: "Cycle B",
        level: 4,
        type: "village",
        parentId: "cycle-a",
      },
    );

    try {
      validateRegionDataset(input);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(DatasetValidationError);

      if (!(error instanceof DatasetValidationError)) {
        return;
      }

      expect(error.issues).toContainEqual(
        expect.objectContaining({
          code: "HIERARCHY_CYCLE",
        }),
      );
    }
  });

  it("throws DatasetValidationError for validation failures", () => {
    expect(() => validateRegionDataset(null)).toThrow(DatasetValidationError);
  });
});
