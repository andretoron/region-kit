import { RegionKitError } from "./region-kit-error.js";

/** File-loading operation that failed. */
export type DatasetLoadStage = "read" | "parse";

/** Indicates that a local dataset file could not be read or parsed as JSON. */
export class DatasetLoadError extends RegionKitError {
  /** Stable error code for dataset-loading failures. */
  readonly code = "DATASET_LOAD_FAILED" as const;
  /** File path or file URL supplied by the caller. */
  readonly source: string;
  /** Whether reading the file or parsing its JSON failed. */
  readonly stage: DatasetLoadStage;

  /**
   * Creates a dataset-loading error while preserving the original cause.
   *
   * @param source - File path or file URL supplied by the caller.
   * @param stage - Loading operation that failed.
   * @param cause - Original filesystem or JSON parsing error.
   */
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
