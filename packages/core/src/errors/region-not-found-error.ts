import { RegionKitError } from "./region-kit-error.js";

/** Indicates that a hierarchy operation requires a region that does not exist. */
export class RegionNotFoundError extends RegionKitError {
  /** Stable error code for required regions that were not found. */
  readonly code = "REGION_NOT_FOUND" as const;
  /** Identifier requested by the caller. */
  readonly regionId: string;

  /**
   * Creates a not-found error for a required region.
   *
   * @param regionId - Identifier requested by the caller.
   */
  constructor(regionId: string) {
    super(`Region "${regionId}" was not found.`);

    this.regionId = regionId;
  }
}
