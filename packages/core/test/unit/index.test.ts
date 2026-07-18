import { describe, expect, it } from "vitest";

import * as core from "../../src/index.js";
import type { RegionDataset } from "../../src/index.js";

function createValidDataset(): unknown {
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
    ],
  };
}

describe("public entry point", () => {
  it("can be imported as an ESM module", () => {
    expect(core).toBeDefined();
  });

  it("exports the public dataset validator", () => {
    expect(core.validateRegionDataset).toBeTypeOf("function");
  });

  it("validates datasets through the public API", () => {
    const input: unknown = createValidDataset();

    const dataset: RegionDataset = core.validateRegionDataset(input);

    expect(dataset).toBe(input);
    expect(dataset.schemaVersion).toBe("1.0.0");
  });

  it("exposes validation failures through the public error type", () => {
    expect(() => core.validateRegionDataset(null)).toThrow(
      core.DatasetValidationError,
    );
  });

  it("does not expose internal dataset utilities", () => {
    expect(core).not.toHaveProperty("SUPPORTED_DATASET_SCHEMA_MAJOR");
    expect(core).not.toHaveProperty("assertSupportedDatasetSchemaVersion");
    expect(core).not.toHaveProperty("formatDatasetValidationPath");
    expect(core).not.toHaveProperty("isSupportedDatasetSchemaVersion");
    expect(core).not.toHaveProperty("parseDatasetSchemaVersion");
    expect(core).not.toHaveProperty("validateDatasetStructure");
    expect(core).not.toHaveProperty("validateDatasetHierarchy");
  });
});
