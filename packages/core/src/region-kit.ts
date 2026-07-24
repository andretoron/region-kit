import type { DatasetMetadata, Region } from "./dataset/index.js";

import { RegionKitClosedError, RegionNotFoundError } from "./errors/index.js";

import { loadRegionDatasetFile } from "./loaders/load-region-dataset-file.js";

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

/**
 * Public facade for validated region lookup, search, filtering, and traversal.
 *
 * Create instances with {@link RegionKit.fromFile}, {@link RegionKit.fromData},
 * or {@link RegionKit.fromStore}; the constructor is intentionally private.
 * Collection queries are offset-paginated and deterministically sorted. Call
 * {@link RegionKit.close} when finished. Any later query throws
 * {@link RegionKitClosedError}.
 */
export class RegionKit {
  readonly #store: RegionStore;

  #closed = false;
  #closePromise: Promise<void> | undefined;

  private constructor(store: RegionStore) {
    this.#store = store;
  }

  /**
   * Loads, parses, and validates a local JSON dataset into a memory store.
   *
   * @param source - Local file path or `file:` URL.
   * @returns A ready-to-query RegionKit instance.
   * @throws {DatasetLoadError} When the file cannot be read or parsed as JSON.
   * @throws {DatasetValidationError} When the parsed value violates the dataset contract.
   */
  static async fromFile(source: string | URL): Promise<RegionKit> {
    const dataset = await loadRegionDatasetFile(source);

    return RegionKit.fromData(dataset);
  }

  /**
   * Validates an unknown value and creates an indexed memory snapshot.
   *
   * @param dataset - Unknown value expected to satisfy the dataset contract.
   * @returns A ready-to-query RegionKit instance.
   * @throws {DatasetValidationError} When validation fails.
   */
  static async fromData(dataset: unknown): Promise<RegionKit> {
    const store = MemoryRegionStore.fromData(dataset);

    return new RegionKit(store);
  }

  /**
   * Wraps a custom store and transfers lifecycle ownership to RegionKit.
   *
   * @param store - Store implementation to use for all operations.
   * @returns A RegionKit instance backed by the supplied store.
   * @throws {TypeError} When the value does not implement every store method.
   */
  static async fromStore(store: RegionStore): Promise<RegionKit> {
    assertRegionStore(store);

    return new RegionKit(store);
  }

  /** Returns metadata for the loaded dataset, excluding its regions. */
  async getMetadata(): Promise<DatasetMetadata> {
    this.#assertOpen();

    return this.#store.getMetadata();
  }

  /**
   * Looks up a region by its unique identifier.
   *
   * @param id - Region identifier.
   * @returns The region, or `null` when it does not exist.
   */
  async getById(id: string): Promise<Region | null> {
    this.#assertOpen();

    return this.#store.getById(id);
  }

  /**
   * Requires a region with the supplied identifier.
   *
   * @param id - Region identifier.
   * @returns The matching region.
   * @throws {RegionNotFoundError} When the region does not exist.
   */
  async requireById(id: string): Promise<Region> {
    this.#assertOpen();

    const region = await this.#store.getById(id);

    if (region === null) {
      throw new RegionNotFoundError(id);
    }

    return region;
  }

  /**
   * Finds regions whose source-defined code matches exactly.
   *
   * @param code - Region code. Codes may be non-unique.
   * @param options - Optional filters, pagination, and sorting.
   */
  async findByCode(
    code: string,
    options: FindByCodeOptions = {},
  ): Promise<RegionPage> {
    this.#assertOpen();

    return this.#store.findByCode(code, options);
  }

  /**
   * Finds regions by primary name and, by default, aliases.
   *
   * @param name - Text to match.
   * @param options - Matching, filtering, pagination, and sorting controls.
   */
  async findByName(
    name: string,
    options: FindByNameOptions = {},
  ): Promise<RegionPage> {
    this.#assertOpen();

    return this.#store.findByName(name, options);
  }

  /**
   * Searches primary names and aliases and reports the matched value.
   *
   * @param query - Text to search for.
   * @param options - Matching, filtering, pagination, and sorting controls.
   */
  async search(
    query: string,
    options: SearchOptions = {},
  ): Promise<RegionSearchPage> {
    this.#assertOpen();

    return this.#store.search(query, options);
  }

  /**
   * Filters regions using criteria combined with AND.
   *
   * @param criteria - Region selection criteria; array values match with OR.
   * @param options - Pagination and sorting controls.
   */
  async filter(
    criteria: RegionFilter,
    options: QueryOptions = {},
  ): Promise<RegionPage> {
    this.#assertOpen();

    return this.#store.filter(criteria, options);
  }

  /**
   * Returns the direct parent of a region.
   *
   * @param id - Target region identifier.
   * @returns The parent, or `null` when the target is the root region.
   * @throws {RegionNotFoundError} When the target does not exist.
   */
  async parentOf(id: string): Promise<Region | null> {
    this.#assertOpen();

    return this.#store.parentOf(id);
  }

  /**
   * Returns direct children of a region in deterministic order.
   *
   * @param id - Target region identifier.
   * @param options - Pagination and sorting controls.
   * @throws {RegionNotFoundError} When the target does not exist.
   */
  async childrenOf(
    id: string,
    options: QueryOptions = {},
  ): Promise<RegionPage> {
    this.#assertOpen();

    return this.#store.childrenOf(id, options);
  }

  /**
   * Returns ancestors ordered from the direct parent toward the root.
   *
   * @param id - Target region identifier.
   * @throws {RegionNotFoundError} When the target does not exist.
   */
  async ancestorsOf(id: string): Promise<readonly Region[]> {
    this.#assertOpen();

    return this.#store.ancestorsOf(id);
  }

  /**
   * Returns descendants with optional maximum depth, pagination, and sorting.
   *
   * @param id - Target region identifier.
   * @param options - Depth, pagination, and sorting controls.
   * @throws {RegionNotFoundError} When the target does not exist.
   */
  async descendantsOf(
    id: string,
    options: DescendantOptions = {},
  ): Promise<RegionPage> {
    this.#assertOpen();

    return this.#store.descendantsOf(id, options);
  }

  /**
   * Closes the owned store and permanently prevents further queries.
   *
   * Repeated calls return the same promise, including when closing fails.
   */
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
