import { describe, expect, it } from "vitest";
import {
  assertSupportedDatasetSchemaVersion,
  isSupportedDatasetSchemaVersion,
  parseDatasetSchemaVersion,
} from "./schema-version.js";
import { DatasetValidationError } from "../errors/index.js";

describe("parseDatasetSchemaVersion", () => {
  it.each([
    ["0.0.0", 0, 0, 0],
    ["1.0.0", 1, 0, 0],
    ["1.12.345", 1, 12, 345],
  ])("parses %s", (raw, major, minor, patch) => {
    const version = parseDatasetSchemaVersion(raw);

    expect(version).toEqual({
      raw,
      major,
      minor,
      patch,
    });
    expect(Object.isFrozen(version)).toBe(true);
  });

  it.each([
    "",
    "1",
    "1.0",
    "v1.0.0",
    "01.0.0",
    "1.00.0",
    "1.0.0-beta",
    "1.0.0-beta.1",
    "1.0.0+build",
    "1.0.-1",
    "1.0.0 ",
    "9007199254740992.0.0",
  ])("rejects invalid version %j", (value) => {
    expect(() => parseDatasetSchemaVersion(value)).toThrow(TypeError);
  });
});

describe("isSupportedDatasetSchemaVersion", () => {
  it("accepts supported major versions", () => {
    expect(isSupportedDatasetSchemaVersion("1.0.0")).toBe(true);
    expect(isSupportedDatasetSchemaVersion("1.99.200")).toBe(true);
  });

  it("rejects unsupported major versions", () => {
    expect(isSupportedDatasetSchemaVersion("0.9.0")).toBe(false);
    expect(isSupportedDatasetSchemaVersion("2.0.0")).toBe(false);
  });

  it("rejects malformed versions", () => {
    expect(isSupportedDatasetSchemaVersion("invalid")).toBe(false);
  });
});

describe("assertSupportedDatasetSchemaVersion", () => {
  it("returns the parsed supported version", () => {
    expect(assertSupportedDatasetSchemaVersion("1.2.3")).toEqual({
      raw: "1.2.3",
      major: 1,
      minor: 2,
      patch: 3,
    });
  });

  it("throws a validation error for malformed versions", () => {
    try {
      assertSupportedDatasetSchemaVersion("1.0");
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(DatasetValidationError);

      if (!(error instanceof DatasetValidationError)) {
        return;
      }

      expect(error.issues).toEqual([
        {
          code: "INVALID_FIELD_VALUE",
          path: ["schemaVersion"],
          message: 'schemaVersion must use the "MAJOR.MINOR.PATCH" format.',
        },
      ]);
    }
  });

  it("reports unsupported major versions", () => {
    try {
      assertSupportedDatasetSchemaVersion("2.0.0");
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(DatasetValidationError);

      if (!(error instanceof DatasetValidationError)) {
        return;
      }

      expect(error.issues).toEqual([
        expect.objectContaining({
          code: "UNSUPPORTED_SCHEMA_VERSION",
          path: ["schemaVersion"],
        }),
      ]);
    }
  });
});
