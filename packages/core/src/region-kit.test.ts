import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DatasetLoadError,
  DatasetValidationError,
  RegionKitClosedError,
  RegionNotFoundError,
} from "./errors/index.js";

import type { RegionPage, RegionSearchPage } from "./query/index.js";

import { RegionKit } from "./region-kit.js";
import { MemoryRegionStore, type RegionStore } from "./store/index.js";

import {
  regionStoreContractDataset,
  regionStoreContractMetadata,
} from "../test/contract/region-store-contract-dataset.js";

function createStore(): MemoryRegionStore {
  return MemoryRegionStore.fromData(
    structuredClone(regionStoreContractDataset),
  );
}

function createRegionStoreStub(
  overrides: Partial<RegionStore> = {},
): RegionStore {
  const emptyRegionPage: RegionPage = {
    items: [],
    page: {
      limit: 50,
      offset: 0,
      hasMore: false,
      total: 0,
    },
  };

  const emptySearchPage: RegionSearchPage = {
    items: [],
    page: {
      limit: 50,
      offset: 0,
      hasMore: false,
      total: 0,
    },
  };

  return {
    async getMetadata() {
      return structuredClone(regionStoreContractMetadata);
    },

    async getById() {
      return null;
    },

    async findByCode() {
      return emptyRegionPage;
    },

    async findByName() {
      return emptyRegionPage;
    },

    async search() {
      return emptySearchPage;
    },

    async filter() {
      return emptyRegionPage;
    },

    async parentOf() {
      return null;
    },

    async childrenOf() {
      return emptyRegionPage;
    },

    async ancestorsOf() {
      return [];
    },

    async descendantsOf() {
      return emptyRegionPage;
    },

    async close() {
      return undefined;
    },

    ...overrides,
  };
}

describe("RegionKit.fromFile", () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "region-kit-from-file-"));
  });

  afterEach(async () => {
    await rm(directory, {
      recursive: true,
      force: true,
    });
  });

  it("creates a RegionKit instance from a JSON file", async () => {
    const path = join(directory, "regions.json");

    await writeFile(path, JSON.stringify(regionStoreContractDataset), "utf8");

    const regions = await RegionKit.fromFile(path);

    await expect(regions.getById("ID-JB")).resolves.toEqual(
      expect.objectContaining({
        id: "ID-JB",
        name: "Jawa Barat",
      }),
    );

    await regions.close();
  });

  it("accepts a file URL", async () => {
    const path = join(directory, "regions.json");

    await writeFile(path, JSON.stringify(regionStoreContractDataset), "utf8");

    const regions = await RegionKit.fromFile(pathToFileURL(path));

    await expect(regions.getMetadata()).resolves.toMatchObject({
      datasetVersion: "2026.7.0",
    });

    await regions.close();
  });

  it("reports file read failures", async () => {
    const path = join(directory, "missing.json");

    await expect(RegionKit.fromFile(path)).rejects.toMatchObject({
      code: "DATASET_LOAD_FAILED",
      stage: "read",
      source: path,
      cause: expect.any(Error),
    });
  });

  it("reports malformed JSON separately from dataset validation", async () => {
    const path = join(directory, "malformed.json");

    await writeFile(path, "{invalid", "utf8");

    await expect(RegionKit.fromFile(path)).rejects.toMatchObject({
      code: "DATASET_LOAD_FAILED",
      stage: "parse",
      source: path,
      cause: expect.any(SyntaxError),
    });
  });

  it("preserves DatasetValidationError for invalid datasets", async () => {
    const path = join(directory, "invalid-dataset.json");

    await writeFile(
      path,
      JSON.stringify({
        schemaVersion: "1.0.0",
      }),
      "utf8",
    );

    try {
      await RegionKit.fromFile(path);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(DatasetValidationError);
      expect(error).not.toBeInstanceOf(DatasetLoadError);
    }
  });

  it("reports invalid file sources through rejected promises", async () => {
    const result = RegionKit.fromFile("" as never);

    expect(result).toBeInstanceOf(Promise);

    await expect(result).rejects.toBeInstanceOf(TypeError);
  });
});

describe("RegionKit.fromData", () => {
  it("creates a working RegionKit instance", async () => {
    const regions = await RegionKit.fromData(
      structuredClone(regionStoreContractDataset),
    );

    await expect(regions.getById("ID-JB")).resolves.toEqual(
      expect.objectContaining({
        id: "ID-JB",
        name: "Jawa Barat",
      }),
    );

    await regions.close();
  });

  it("reports invalid datasets through a rejected promise", async () => {
    const result = RegionKit.fromData(null);

    expect(result).toBeInstanceOf(Promise);

    await expect(result).rejects.toBeInstanceOf(DatasetValidationError);
  });
});

describe("RegionKit.fromStore", () => {
  it("creates an instance from an existing store", async () => {
    const regions = await RegionKit.fromStore(createStore());

    await expect(regions.getById("ID-JB")).resolves.toEqual(
      expect.objectContaining({
        id: "ID-JB",
      }),
    );

    await regions.close();
  });

  it("works with a custom RegionStore implementation", async () => {
    const getById = vi.fn(async (id: string) => {
      if (id !== "custom-region") {
        return null;
      }

      return {
        id: "custom-region",
        code: "CUSTOM",
        name: "Custom Region",
        level: 0,
        type: "custom",
        parentId: null,
      };
    });

    const close = vi.fn(async () => undefined);

    const store = createRegionStoreStub({
      getById,
      close,
    });

    const regions = await RegionKit.fromStore(store);

    await expect(regions.getById("custom-region")).resolves.toEqual(
      expect.objectContaining({
        id: "custom-region",
        name: "Custom Region",
      }),
    );

    expect(getById).toHaveBeenCalledWith("custom-region");

    await regions.close();

    expect(close).toHaveBeenCalledTimes(1);
  });

  it.each([
    null,
    [],
    {},
    {
      close() {
        return Promise.resolve();
      },
    },
  ])("rejects an invalid RegionStore: %#", async (store) => {
    await expect(RegionKit.fromStore(store as never)).rejects.toBeInstanceOf(
      TypeError,
    );
  });

  it("requires every RegionStore method", async () => {
    const store = createStore();
    const storeWithoutAncestors = new Proxy(store, {
      get(target, property, receiver) {
        if (property === "ancestorsOf") {
          return undefined;
        }

        return Reflect.get(target, property, receiver);
      },
    });

    await expect(RegionKit.fromStore(storeWithoutAncestors)).rejects.toThrow(
      'RegionKit.fromStore() requires RegionStore method "ancestorsOf()".',
    );

    await store.close();
  });
});

describe("RegionKit queries", () => {
  it("delegates every public store query with its arguments", async () => {
    const store = createStore();
    const getMetadata = vi.spyOn(store, "getMetadata");
    const getById = vi.spyOn(store, "getById");
    const findByCode = vi.spyOn(store, "findByCode");
    const findByName = vi.spyOn(store, "findByName");
    const search = vi.spyOn(store, "search");
    const filter = vi.spyOn(store, "filter");
    const parentOf = vi.spyOn(store, "parentOf");
    const childrenOf = vi.spyOn(store, "childrenOf");
    const ancestorsOf = vi.spyOn(store, "ancestorsOf");
    const descendantsOf = vi.spyOn(store, "descendantsOf");
    const regions = await RegionKit.fromStore(store);

    await regions.getMetadata();
    await regions.getById("ID-JB");
    await regions.findByCode("32", { limit: 1 });
    await regions.findByName("Jawa", { match: "prefix" });
    await regions.search("bandung", { match: "contains" });
    await regions.filter({ levels: [2] }, { sortBy: "code" });
    await regions.parentOf("ID-JB");
    await regions.childrenOf("ID", { limit: 1 });
    await regions.ancestorsOf("ID-JB");
    await regions.descendantsOf("ID-JB", { maxDepth: 1 });

    expect(getMetadata).toHaveBeenCalledWith();
    expect(getById).toHaveBeenCalledWith("ID-JB");
    expect(findByCode).toHaveBeenCalledWith("32", { limit: 1 });
    expect(findByName).toHaveBeenCalledWith("Jawa", {
      match: "prefix",
    });
    expect(search).toHaveBeenCalledWith("bandung", {
      match: "contains",
    });
    expect(filter).toHaveBeenCalledWith({ levels: [2] }, { sortBy: "code" });
    expect(parentOf).toHaveBeenCalledWith("ID-JB");
    expect(childrenOf).toHaveBeenCalledWith("ID", { limit: 1 });
    expect(ancestorsOf).toHaveBeenCalledWith("ID-JB");
    expect(descendantsOf).toHaveBeenCalledWith("ID-JB", {
      maxDepth: 1,
    });

    await regions.close();
  });

  it("returns a required region using the store ID lookup", async () => {
    const store = createStore();
    const getById = vi.spyOn(store, "getById");
    const regions = await RegionKit.fromStore(store);

    await expect(regions.requireById("ID-JB")).resolves.toEqual(
      expect.objectContaining({
        id: "ID-JB",
      }),
    );

    expect(getById).toHaveBeenCalledWith("ID-JB");

    await regions.close();
  });

  it("throws RegionNotFoundError when a required region is absent", async () => {
    const regions = await RegionKit.fromData(
      structuredClone(regionStoreContractDataset),
    );

    await expect(regions.requireById("unknown")).rejects.toMatchObject({
      code: "REGION_NOT_FOUND",
      regionId: "unknown",
    });

    await expect(regions.requireById("unknown")).rejects.toBeInstanceOf(
      RegionNotFoundError,
    );

    await regions.close();
  });
});

describe("RegionKit lifecycle", () => {
  it("closes the underlying store exactly once", async () => {
    const store = createStore();
    const close = vi.spyOn(store, "close");
    const regions = await RegionKit.fromStore(store);

    const firstClose = regions.close();
    const secondClose = regions.close();

    expect(secondClose).toBe(firstClose);

    await Promise.all([firstClose, secondClose, regions.close()]);

    expect(close).toHaveBeenCalledTimes(1);
    await expect(regions.close()).resolves.toBeUndefined();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("rejects every read operation after close", async () => {
    const regions = await RegionKit.fromData(
      structuredClone(regionStoreContractDataset),
    );

    await regions.close();

    const operations: readonly [
      name: string,
      execute: () => Promise<unknown>,
    ][] = [
      ["getMetadata", () => regions.getMetadata()],
      ["getById", () => regions.getById("ID-JB")],
      ["requireById", () => regions.requireById("ID-JB")],
      ["findByCode", () => regions.findByCode("32")],
      ["findByName", () => regions.findByName("Jawa Barat")],
      ["search", () => regions.search("jawa")],
      ["filter", () => regions.filter({ levels: [1] })],
      ["parentOf", () => regions.parentOf("ID-JB")],
      ["childrenOf", () => regions.childrenOf("ID")],
      ["ancestorsOf", () => regions.ancestorsOf("ID-JB")],
      ["descendantsOf", () => regions.descendantsOf("ID")],
    ];

    for (const [name, execute] of operations) {
      const result = execute();

      expect(result, name).toBeInstanceOf(Promise);
      await expect(result, name).rejects.toBeInstanceOf(RegionKitClosedError);
    }

    await expect(regions.getById("")).rejects.toBeInstanceOf(
      RegionKitClosedError,
    );
  });

  it("does not forward queries after closing", async () => {
    const store = createStore();
    const getById = vi.spyOn(store, "getById");
    const regions = await RegionKit.fromStore(store);

    await regions.close();

    await expect(regions.getById("ID-JB")).rejects.toBeInstanceOf(
      RegionKitClosedError,
    );

    expect(getById).not.toHaveBeenCalled();
  });
});
