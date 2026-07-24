import type { DatasetMetadata, RegionDataset } from "./types.js";

export function createDatasetMetadata(dataset: RegionDataset): DatasetMetadata {
  const metadata = {
    schemaVersion: dataset.schemaVersion,
    datasetVersion: dataset.datasetVersion,
    country: Object.freeze({ ...dataset.country }),
    source: Object.freeze({ ...dataset.source }),
    generatedAt: dataset.generatedAt,
  } satisfies DatasetMetadata;

  return Object.freeze(metadata);
}
