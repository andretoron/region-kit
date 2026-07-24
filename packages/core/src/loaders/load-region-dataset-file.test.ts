import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DatasetLoadError } from "../errors/index.js";

import { loadRegionDatasetFile } from "./load-region-dataset-file.js";

describe("loadRegionDatasetFile", () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "region-kit-loader-"));
  });

  afterEach(async () => {
    await rm(directory, {
      recursive: true,
      force: true,
    });
  });

  it("loads and parses a JSON file from a string path", async () => {
    const path = join(directory, "regions.json");

    await writeFile(
      path,
      JSON.stringify({
        schemaVersion: "1.0.0",
      }),
      "utf8",
    );

    await expect(loadRegionDatasetFile(path)).resolves.toEqual({
      schemaVersion: "1.0.0",
    });
  });

  it("loads a JSON file from a file URL", async () => {
    const path = join(directory, "regions.json");

    await writeFile(
      path,
      JSON.stringify({
        datasetVersion: "2026.7.0",
      }),
      "utf8",
    );

    await expect(loadRegionDatasetFile(pathToFileURL(path))).resolves.toEqual({
      datasetVersion: "2026.7.0",
    });
  });

  it("does not require a JSON file extension", async () => {
    const path = join(directory, "regions");

    await writeFile(path, JSON.stringify({ regions: [] }), "utf8");

    await expect(loadRegionDatasetFile(path)).resolves.toEqual({
      regions: [],
    });
  });

  it("wraps filesystem read failure", async () => {
    const path = join(directory, "missing.json");

    await expect(loadRegionDatasetFile(path)).rejects.toMatchObject({
      code: "DATASET_LOAD_FAILED",
      stage: "read",
      source: path,
      cause: expect.any(Error),
    });

    await expect(loadRegionDatasetFile(path)).rejects.toBeInstanceOf(
      DatasetLoadError,
    );
  });

  it("wraps malformed JSON errors", async () => {
    const path = join(directory, "invalid.json");

    await writeFile(path, '{"schemaVersion":', "utf8");

    await expect(loadRegionDatasetFile(path)).rejects.toMatchObject({
      code: "DATASET_LOAD_FAILED",
      stage: "parse",
      source: path,
      cause: expect.any(SyntaxError),
    });
  });

  it.each(["", "   ", null, undefined, {}, []])(
    "rejects an invalid source: %#",
    async (source) => {
      const result = loadRegionDatasetFile(source as never);

      expect(result).toBeInstanceOf(Promise);

      await expect(result).rejects.toBeInstanceOf(TypeError);
    },
  );

  it("rejects non-file URLs", async () => {
    await expect(
      loadRegionDatasetFile(new URL("https://example.com/regions.json")),
    ).rejects.toBeInstanceOf(TypeError);
  });
});
