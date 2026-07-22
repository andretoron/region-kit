import { RegionKitError } from "./region-kit-error.js";

export class QueryValidationError extends RegionKitError {
  readonly code = "QUERY_INVALID" as const;
  readonly parameter: string;

  constructor(parameter: string, message: string) {
    super(`Invalid query parameter "${parameter}": ${message}`);

    this.parameter = parameter;
  }
}
