import { describe, expect, it } from "vitest";

import { RegionKitError } from "./region-kit-error.js";
import { RegionNotFoundError } from "./region-not-found-error.js";

describe("RegionNotFoundError", () => {
  it("exposes a stable error code and region id", () => {
    const error = new RegionNotFoundError("id:test:1");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RegionNotFoundError);
    expect(error).toBeInstanceOf(RegionKitError);
    expect(error.name).toBe("RegionNotFoundError");
    expect(error.code).toBe("REGION_NOT_FOUND");
    expect(error.regionId).toBe("id:test:1");
    expect(error.message).toBe('Region "id:test:1" was not found.');
  });
});
