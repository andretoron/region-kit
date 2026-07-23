import { RegionKitError } from "./region-kit-error.js";

export class RegionNotFoundError extends RegionKitError {
  readonly code = "REGION_NOT_FOUND" as const;
  readonly regionId: string;

  constructor(regionId: string) {
    super(`Region "${regionId}" was not found.`);

    this.regionId = regionId;
  }
}
