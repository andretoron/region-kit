export type RegionKitErrorCode =
  | "DATASET_INVALID"
  | "DATASET_LOAD_FAILED"
  | "QUERY_INVALID"
  | "REGION_NOT_FOUND"
  | "REGION_KIT_CLOSED";

export abstract class RegionKitError extends Error {
  abstract readonly code: RegionKitErrorCode;

  protected constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}
