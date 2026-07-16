import { describe, expect, it } from "vitest";

describe("public entry point", () => {
  it("can be imported as an ESM module", async () => {
    const module = await import("../../src/index.js");

    expect(module).toBeDefined();
    expect(module).not.toHaveProperty("SUPPORTED_DATASET_SCHEMA_MAJOR");
    expect(module).not.toHaveProperty("assertSupportedDatasetSchemaVersion");
    expect(module).not.toHaveProperty("formatDatasetValidationPath");
    expect(module).not.toHaveProperty("isSupportedDatasetSchemaVersion");
    expect(module).not.toHaveProperty("parseDatasetSchemaVersion");
  });
});
