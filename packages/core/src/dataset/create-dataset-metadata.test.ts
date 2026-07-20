import { describe, expect, it } from "vitest";
import type { RegionDataset } from "./types.js";
import { createDatasetMetadata } from "./create-dataset-metadata.js";

describe("createDatasetMetadata", () => {
  it("creates immutable metadata without regions", () => {
    const dataset: RegionDataset = {
      schemaVersion: "1.0.0",
      datasetVersion: "2026.7.0",
      country: {
        code: "ID",
        name: "Indonesia",
      },
      source: {
        id: "bps",
        name: "Badan Pusat Statistik",
      },
      generatedAt: "2026-07-19T00:00:00.000Z",
      regions: [],
    };

    const metadata = createDatasetMetadata(dataset);

    expect(metadata).toEqual({
      schemaVersion: "1.0.0",
      datasetVersion: "2026.7.0",
      country: {
        code: "ID",
        name: "Indonesia",
      },
      source: {
        id: "bps",
        name: "Badan Pusat Statistik",
      },
      generatedAt: "2026-07-19T00:00:00.000Z",
    });

    expect(metadata).not.toHaveProperty("regions");
    expect(metadata.country).not.toBe(dataset.country);
    expect(metadata.source).not.toBe(dataset.source);

    expect(Object.isFrozen(metadata)).toBe(true);
    expect(Object.isFrozen(metadata.country)).toBe(true);
    expect(Object.isFrozen(metadata.source)).toBe(true);
  });
});
