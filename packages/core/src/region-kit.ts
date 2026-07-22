import type { DatasetMetadata, Region } from "./dataset/index.js";

import { RegionKitClosedError, RegionNotFoundError } from "./errors/index.js";

import type {
  DescendantOptions,
  FindByCodeOptions,
  FindByNameOptions,
  QueryOptions,
  RegionFilter,
  RegionPage,
  RegionSearchPage,
  SearchOptions,
} from "./query/index.js";

import { MemoryRegionStore, type RegionStore } from "./store/index.js";

const REGION_STORE_METHODS = [
  "getMetadata",
  "getById",
  "findByCode",
  "findByName",
  "search",
  "filter",
  "parentOf",
  "childrenOf",
  "ancestorsOf",
  "descendantsOf",
  "close",
] as const satisfies readonly (keyof RegionStore)[];

export class RegionKit {
  readonly #store: RegionStore;

  #closed = false;
  #closePromise: Promise<void> | undefined;

  private constructor(store: RegionStore) {
    this.#store = store;
  }

  static async fromData(dataset: unknown): Promise<RegionKit> {
    const store = MemoryRegionStore.fromData(dataset);

    return new RegionKit(store);
  }

  static async fromStore(store: RegionStore): Promise<RegionKit> {
    assertRegionStore(store);

    return new RegionKit(store);
  }

  async getMetadata(): Promise<DatasetMetadata> {
    this.#assertOpen();

    return this.#store.getMetadata();
  }

  async getById(id: string): Promise<Region | null> {
    this.#assertOpen();

    return this.#store.getById(id);
  }

  async requireById(id: string): Promise<Region> {
    this.#assertOpen();

    const region = await this.#store.getById(id);

    if (region === null) {
      throw new RegionNotFoundError(id);
    }

    return region;
  }

  async findByCode(
    code: string,
    options: FindByCodeOptions = {},
  ): Promise<RegionPage> {
    this.#assertOpen();

    return this.#store.findByCode(code, options);
  }

  async findByName(
    name: string,
    options: FindByNameOptions = {},
  ): Promise<RegionPage> {
    this.#assertOpen();

    return this.#store.findByName(name, options);
  }

  async search(
    query: string,
    options: SearchOptions = {},
  ): Promise<RegionSearchPage> {
    this.#assertOpen();

    return this.#store.search(query, options);
  }

  async filter(
    criteria: RegionFilter,
    options: QueryOptions = {},
  ): Promise<RegionPage> {
    this.#assertOpen();

    return this.#store.filter(criteria, options);
  }

  async parentOf(id: string): Promise<Region | null> {
    this.#assertOpen();

    return this.#store.parentOf(id);
  }

  async childrenOf(
    id: string,
    options: QueryOptions = {},
  ): Promise<RegionPage> {
    this.#assertOpen();

    return this.#store.childrenOf(id, options);
  }

  async ancestorsOf(id: string): Promise<readonly Region[]> {
    this.#assertOpen();

    return this.#store.ancestorsOf(id);
  }

  async descendantsOf(
    id: string,
    options: DescendantOptions = {},
  ): Promise<RegionPage> {
    this.#assertOpen();

    return this.#store.descendantsOf(id, options);
  }

  close(): Promise<void> {
    if (this.#closePromise === undefined) {
      this.#closed = true;

      this.#closePromise = Promise.resolve().then(() => this.#store.close());
    }

    return this.#closePromise;
  }

  #assertOpen(): void {
    if (this.#closed) {
      throw new RegionKitClosedError();
    }
  }
}

function assertRegionStore(value: unknown): asserts value is RegionStore {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("RegionKit.fromStore() requires a RegionStore object.");
  }

  const candidate = value as Record<PropertyKey, unknown>;

  for (const method of REGION_STORE_METHODS) {
    if (typeof candidate[method] !== "function") {
      throw new TypeError(
        `RegionKit.fromStore() requires RegionStore method "${method}()".`,
      );
    }
  }
}
