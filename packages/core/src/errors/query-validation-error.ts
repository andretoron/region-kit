import { RegionKitError } from "./region-kit-error.js";

/** Indicates that a query argument or option is invalid. */
export class QueryValidationError extends RegionKitError {
  /** Stable error code for query validation failures. */
  readonly code = "QUERY_INVALID" as const;
  /** Name or path of the invalid query parameter. */
  readonly parameter: string;

  /**
   * Creates a query validation error.
   *
   * @param parameter - Name or path of the invalid parameter.
   * @param message - Explanation of the expected value.
   */
  constructor(parameter: string, message: string) {
    super(`Invalid query parameter "${parameter}": ${message}`);

    this.parameter = parameter;
  }
}
