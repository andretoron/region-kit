import { describe, expect, it } from "vitest";

import {
  DatasetValidationError,
  RegionKitError,
  type DatasetValidationIssue,
} from "../../src/index.js";
import { formatDatasetValidationPath } from "../../src/errors/dataset-validation-error.js";

describe("DatasetValidationError", () => {
  it("creates an error from one issue", () => {
    const error = new DatasetValidationError([
      {
        code: "INVALID_DATASET",
        path: [],
        message: "Expected an object.",
      },
    ]);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RegionKitError);
    expect(error).toBeInstanceOf(DatasetValidationError);
    expect(error.name).toBe("DatasetValidationError");
    expect(error.code).toBe("DATASET_INVALID");
    expect(error.message).toBe(
      "Dataset validation failed: Expected an object.",
    );
  });

  it("creates a summarized message for multiple issues", () => {
    const error = new DatasetValidationError([
      {
        code: "MISSING_REQUIRED_FIELD",
        path: ["schemaVersion"],
        message: "schemaVersion is required.",
      },
      {
        code: "INVALID_FIELD_TYPE",
        path: ["regions"],
        message: "regions must be an array.",
      },
    ]);

    expect(error.message).toBe("Dataset validation failed with 2 issues.");
  });

  it("copies issue and path data", () => {
    const path: Array<string | number> = ["regions", 0, "id"];

    const issue: DatasetValidationIssue = {
      code: "INVALID_FIELD_TYPE",
      path,
      message: "id must be a string.",
    };

    const error = new DatasetValidationError([issue]);

    path.push("unexpected");

    expect(error.issues[0]?.path).toEqual(["regions", 0, "id"]);
    expect(Object.isFrozen(error.issues)).toBe(true);
    expect(Object.isFrozen(error.issues[0])).toBe(true);
    expect(Object.isFrozen(error.issues[0]?.path)).toBe(true);
  });

  it("rejects an empty issue list", () => {
    expect(() => new DatasetValidationError([])).toThrow(
      new TypeError(
        "DatasetValidationError requires at least one (1) validation issue.",
      ),
    );
  });
});

describe("formatDatasetValidationPath", () => {
  it("formats the root path", () => {
    expect(formatDatasetValidationPath([])).toBe("$");
  });

  it("formats object properties and array indexes", () => {
    expect(formatDatasetValidationPath(["regions", 4, "parentId"])).toBe(
      "$.regions[4].parentId",
    );
  });
});
