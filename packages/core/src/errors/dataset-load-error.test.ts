import { describe, expect, it } from "vitest";

import { DatasetLoadError } from "./dataset-load-error.js";
import { RegionKitError } from "./region-kit-error.js";

describe("DatasetLoadError", () => {
  it("represents file read failures", () => {
    const cause = new Error("ENOENT");

    const error = new DatasetLoadError("./regions.json", "read", cause);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RegionKitError);
    expect(error.name).toBe("DatasetLoadError");
    expect(error.code).toBe("DATASET_LOAD_FAILED");
    expect(error.source).toBe("./regions.json");
    expect(error.stage).toBe("read");
    expect(error.cause).toBe(cause);
    expect(error.message).toBe(
      'Failed to read region dataset from "./regions.json".',
    );
  });

  it("represents JSON parsing failures", () => {
    const cause = new SyntaxError("Unexpected token");

    const error = new DatasetLoadError("./regions.json", "parse", cause);

    expect(error.stage).toBe("parse");
    expect(error.cause).toBe(cause);
    expect(error.message).toBe(
      'Failed to parse JSON region dataset from "./regions.json".',
    );
  });
});
