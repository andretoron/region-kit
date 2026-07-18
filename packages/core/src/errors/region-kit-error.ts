export type RegionKitErrorCode = "DATASET_INVALID";

export abstract class RegionKitError extends Error {
  abstract readonly code: RegionKitErrorCode;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
