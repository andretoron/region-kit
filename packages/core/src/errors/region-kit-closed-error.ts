import { RegionKitError } from "./region-kit-error.js";

export class RegionKitClosedError extends RegionKitError {
  readonly code = "REGION_KIT_CLOSED" as const;

  constructor() {
    super("RegionKit instance is closed.");
  }
}
