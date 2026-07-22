export type RegionKitErrorCode =
  | "DATASET_INVALID"
  | "QUERY_INVALID"
  | "REGION_NOT_FOUND"
  | "REGION_KIT_CLOSED";

export abstract class RegionKitError extends Error {
  abstract readonly code: RegionKitErrorCode;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
