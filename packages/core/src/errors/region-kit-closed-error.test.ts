import { describe, expect, it } from "vitest";

import { RegionKitClosedError } from "./region-kit-closed-error.js";
import { RegionKitError } from "./region-kit-error.js";

describe("RegionKitClosedError", () => {
  it("exposes a stable error code", () => {
    const error = new RegionKitClosedError();

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RegionKitClosedError);
    expect(error).toBeInstanceOf(RegionKitError);
    expect(error.name).toBe("RegionKitClosedError");
    expect(error.code).toBe("REGION_KIT_CLOSED");
    expect(error.message).toBe("RegionKit instance is closed.");
  });
});
