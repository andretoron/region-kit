import type { DatasetMetadata, Region } from "../dataset/index.js";

import type {
  DescendantOptions,
  FindByCodeOptions,
  FindByNameOptions,
  QueryOptions,
  RegionFilter,
  RegionPage,
  RegionSearchPage,
  SearchOptions,
} from "../query/index.js";

/**
 * Asynchronous read-only storage contract consumed by {@link RegionKit}.
 *
 * Implementations must provide deterministic collection ordering, offset
 * pagination, hierarchy traversal, and an idempotent {@link RegionStore.close}
 * operation. RegionKit owns a store passed to `fromStore()` and closes it when
 * the facade is closed.
 */
export interface RegionStore {
  /** Returns dataset metadata without the region collection. */
  getMetadata(): Promise<DatasetMetadata>;

  /**
   * Looks up a region by its unique identifier.
   *
   * @param id - Region identifier.
   * @returns The region, or `null` when it does not exist.
   */
  getById(id: string): Promise<Region | null>;

  /**
   * Finds regions whose source-defined code matches exactly.
   *
   * @param code - Region code. Codes may be non-unique.
   * @param options - Optional filters, pagination, and sorting.
   */
  findByCode(code: string, options?: FindByCodeOptions): Promise<RegionPage>;

  /**
   * Finds regions by primary name and, by default, aliases.
   *
   * @param name - Text to match.
   * @param options - Matching, filtering, pagination, and sorting controls.
   */
  findByName(name: string, options?: FindByNameOptions): Promise<RegionPage>;

  /**
   * Searches primary names and aliases and reports the matched value.
   *
   * @param query - Text to search for.
   * @param options - Matching, filtering, pagination, and sorting controls.
   */
  search(query: string, options?: SearchOptions): Promise<RegionSearchPage>;

  /**
   * Filters regions by criteria combined with AND.
   *
   * @param criteria - Region selection criteria.
   * @param options - Pagination and sorting controls.
   */
  filter(criteria: RegionFilter, options?: QueryOptions): Promise<RegionPage>;

  /**
   * Returns the direct parent of a region.
   *
   * @param id - Target region identifier.
   * @returns The direct parent, or `null` when the target is the root region.
   * @throws {RegionNotFoundError} When the target does not exist.
   */
  parentOf(id: string): Promise<Region | null>;

  /**
   * Returns direct children of a region in deterministic order.
   *
   * @param id - Target region identifier.
   * @param options - Pagination and sorting controls.
   * @throws {RegionNotFoundError} When the target does not exist.
   */
  childrenOf(id: string, options?: QueryOptions): Promise<RegionPage>;

  /**
   * Returns ancestors ordered from the direct parent toward the root.
   *
   * @param id - Target region identifier.
   * @throws {RegionNotFoundError} When the target does not exist.
   */
  ancestorsOf(id: string): Promise<readonly Region[]>;

  /**
   * Returns descendants breadth-first, then applies deterministic sorting.
   *
   * @param id - Target region identifier.
   * @param options - Depth, pagination, and sorting controls.
   * @throws {RegionNotFoundError} When the target does not exist.
   */
  descendantsOf(id: string, options?: DescendantOptions): Promise<RegionPage>;

  /** Releases resources owned by the store; repeated calls must be safe. */
  close(): Promise<void>;
}
