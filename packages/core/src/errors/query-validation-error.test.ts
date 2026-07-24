import { describe, expect, it } from "vitest";

import { QueryValidationError } from "./query-validation-error.js";
import { RegionKitError } from "./region-kit-error.js";

describe("QueryValidationError", () => {
  it("exposes a stable error code and parameter", () => {
    const error = new QueryValidationError(
      "limit",
      "Expected an integer between 1 and 1000.",
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(QueryValidationError);
    expect(error).toBeInstanceOf(RegionKitError);
    expect(error.name).toBe("QueryValidationError");
    expect(error.code).toBe("QUERY_INVALID");
    expect(error.parameter).toBe("limit");
    expect(error.message).toBe(
      'Invalid query parameter "limit": Expected an integer between 1 and 1000.',
    );
  });
});
