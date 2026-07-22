import type { DatasetMetadata, Region } from "../dataset/index.js";
import { RegionNotFoundError } from "../errors/index.js";
import type {
  DescendantOptions,
  FindByCodeOptions,
  FindByNameOptions,
  QueryOptions,
  RegionFilter,
  RegionPage,
} from "../query/index.js";
import {
  resolveChildrenQuery,
  resolveDescendantQuery,
  resolveFindByCodeQuery,
  resolveFindByNameQuery,
  resolveFilterQuery,
  validateRegionId,
} from "../query/query-validation.js";
import { createRegionSortRules, sortRegions } from "../query/region-sorting.js";
import { buildMemoryIndexes, type MemoryIndexes } from "./memory-indexes.js";
import {
  createMemoryRegionPage,
  filterMemoryRegions,
  filterMemoryRegionsByCriteria,
  findMemoryNameCandidates,
} from "./memory-query.js";
import {
  findMemoryAncestors,
  findMemoryDescendants,
} from "./memory-traversal.js";
import {
  prepareMemoryDataset,
  type PreparedMemoryDataset,
} from "./prepare-memory-dataset.js";
import type { RegionStore } from "./region-store.js";

/**
 * A read-only RegionStore backed by a validated in-memory dataset.
 */
export class MemoryRegionStore implements RegionStore {
  readonly #metadata: DatasetMetadata;
  readonly #regions: readonly Region[];
  readonly #indexes: MemoryIndexes;

  private constructor(prepared: PreparedMemoryDataset) {
    this.#metadata = prepared.metadata;
    this.#regions = prepared.regions;
    this.#indexes = buildMemoryIndexes(prepared.regions);
  }

  /**
   * Validates a dataset and build an indexed memory store.
   */
  static fromData(input: unknown): MemoryRegionStore {
    return new MemoryRegionStore(prepareMemoryDataset(input));
  }

  #requireInternalRegion(id: string): Region {
    const region = this.#indexes.byId.get(id);

    if (region === undefined) {
      throw new RegionNotFoundError(id);
    }

    return region;
  }

  getMetadata(): Promise<DatasetMetadata> {
    return Promise.resolve(this.#metadata);
  }

  async getById(id: string): Promise<Region | null> {
    validateRegionId(id);

    const region = this.#indexes.byId.get(id);

    return region === undefined ? null : structuredClone(region);
  }

  async findByCode(
    code: string,
    options: FindByCodeOptions = {},
  ): Promise<RegionPage> {
    const resolved = resolveFindByCodeQuery(code, options);

    const candidates = this.#indexes.byCode.get(code) ?? [];

    const filtered = filterMemoryRegions(candidates, resolved.options);

    const sorted = sortRegions(
      filtered,
      createRegionSortRules(resolved.sort.sortBy, resolved.sort.direction),
    );

    return createMemoryRegionPage(sorted, resolved.pagination);
  }

  async findByName(
    name: string,
    options: FindByNameOptions = {},
  ): Promise<RegionPage> {
    const resolved = resolveFindByNameQuery(name, options);

    const candidates = findMemoryNameCandidates(
      this.#regions,
      this.#indexes,
      name,
      resolved.options,
    );

    const filtered = filterMemoryRegions(candidates, resolved.options);

    const sorted = sortRegions(
      filtered,
      createRegionSortRules(resolved.sort.sortBy, resolved.sort.direction),
    );

    return createMemoryRegionPage(sorted, resolved.pagination);
  }

  async filter(
    criteria: RegionFilter,
    options: QueryOptions = {},
  ): Promise<RegionPage> {
    const resolved = resolveFilterQuery(criteria, options);

    const filtered = filterMemoryRegionsByCriteria(
      this.#regions,
      resolved.criteria,
    );

    const useDefaultSort =
      resolved.options.sortBy === undefined &&
      resolved.options.direction === undefined;

    const sorted = sortRegions(
      filtered,
      createRegionSortRules(
        resolved.sort.sortBy,
        resolved.sort.direction,
        useDefaultSort ? ["code"] : [],
      ),
    );

    return createMemoryRegionPage(sorted, resolved.pagination);
  }

  async parentOf(id: string): Promise<Region | null> {
    validateRegionId(id);

    const region = this.#requireInternalRegion(id);

    if (region.parentId === null) {
      return null;
    }

    const parent = this.#indexes.byId.get(region.parentId);

    if (parent === undefined) {
      throw new Error(
        `Memory store invariant violated: parent "${region.parentId}" was not found.`,
      );
    }

    return structuredClone(parent);
  }

  async childrenOf(
    id: string,
    options: QueryOptions = {},
  ): Promise<RegionPage> {
    const resolved = resolveChildrenQuery(id, options);

    this.#requireInternalRegion(id);

    const children = this.#indexes.byParentId.get(id) ?? [];

    const sorted = sortRegions(
      children,
      createRegionSortRules(resolved.sort.sortBy, resolved.sort.direction),
    );

    return createMemoryRegionPage(sorted, resolved.pagination);
  }

  async ancestorsOf(id: string): Promise<readonly Region[]> {
    validateRegionId(id);

    const region = this.#requireInternalRegion(id);

    const ancestors = structuredClone(
      findMemoryAncestors(region, this.#indexes),
    );

    return Object.freeze(ancestors);
  }

  async descendantsOf(
    id: string,
    options: DescendantOptions = {},
  ): Promise<RegionPage> {
    const resolved = resolveDescendantQuery(id, options);

    this.#requireInternalRegion(id);

    const descendants = findMemoryDescendants(
      id,
      this.#indexes,
      resolved.options.maxDepth,
    );

    const useDefaultSort =
      resolved.options.sortBy === undefined &&
      resolved.options.direction === undefined;

    const sorted = sortRegions(
      descendants,
      createRegionSortRules(
        resolved.sort.sortBy,
        resolved.sort.direction,
        useDefaultSort ? ["code"] : [],
      ),
    );

    return createMemoryRegionPage(sorted, resolved.pagination);
  }

  close(): Promise<void> {
    return Promise.resolve();
  }
}
