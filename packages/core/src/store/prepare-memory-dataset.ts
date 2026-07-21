import {
  createDatasetMetadata,
  validateRegionDataset,
} from "../dataset/index.js";
import type { DatasetMetadata, Region } from "../dataset/index.js";

export interface PreparedMemoryDataset {
  readonly metadata: DatasetMetadata;
  readonly regions: readonly Region[];
}

export function prepareMemoryDataset(input: unknown): PreparedMemoryDataset {
  const dataset = validateRegionDataset(input);

  const regions = structuredClone(dataset.regions);

  return Object.freeze({
    metadata: createDatasetMetadata(dataset),
    regions: Object.freeze(regions),
  });
}
