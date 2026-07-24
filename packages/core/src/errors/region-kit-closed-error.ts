import { RegionKitError } from "./region-kit-error.js";

/** Indicates that a query was attempted after a RegionKit instance was closed. */
export class RegionKitClosedError extends RegionKitError {
  /** Stable error code for queries against a closed instance. */
  readonly code = "REGION_KIT_CLOSED" as const;

  /** Creates an error for an operation attempted after `close()`. */
  constructor() {
    super("RegionKit instance is closed.");
  }
}
