/** Stable machine-readable codes exposed by region-kit errors. */
export type RegionKitErrorCode =
  | "DATASET_INVALID"
  | "DATASET_LOAD_FAILED"
  | "QUERY_INVALID"
  | "REGION_NOT_FOUND"
  | "REGION_KIT_CLOSED";

/** Base class for operational errors intentionally exposed by region-kit. */
export abstract class RegionKitError extends Error {
  /** Stable error code suitable for programmatic branching. */
  abstract readonly code: RegionKitErrorCode;

  protected constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}
