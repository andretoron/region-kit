import { describe, expect, it, vi } from "vitest";

import {
  DatasetValidationError,
  RegionKitClosedError,
  RegionNotFoundError,
} from "./errors/index.js";

import { RegionKit } from "./region-kit.js";
import { MemoryRegionStore } from "./store/index.js";

import { regionStoreContractDataset } from "../test/contract/region-store-contract-dataset.js";

function createStore(): MemoryRegionStore {
  return MemoryRegionStore.fromData(
    structuredClone(regionStoreContractDataset),
  );
}

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
