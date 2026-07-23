import { RegionKitError } from "./region-kit-error.js";

export type DatasetLoadStage = "read" | "parse";

export class DatasetLoadError extends RegionKitError {
  readonly code = "DATASET_LOAD_FAILED" as const;
  readonly source: string;
  readonly stage: DatasetLoadStage;

  constructor(source: string, stage: DatasetLoadStage, cause: unknown) {
    super(createDatasetLoadMessage(source, stage), {
      cause,
    });

    this.source = source;
    this.stage = stage;
  }
}

function createDatasetLoadMessage(
  source: string,
  stage: DatasetLoadStage,
): string {
  if (stage === "read") {
    return `Failed to read region dataset from "${source}".`;
  }

  return `Failed to parse JSON region dataset from "${source}".`;
}
