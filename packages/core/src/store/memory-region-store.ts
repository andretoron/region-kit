import type { DatasetMetadata, Region } from "../dataset/index.js";
import type {
  FindByCodeOptions,
  FindByNameOptions,
  RegionPage,
} from "../query/index.js";
import { buildMemoryIndexes, type MemoryIndexes } from "./memory-indexes.js";
import {
  createMemoryRegionPage,
  filterMemoryRegions,
  findMemoryNameCandidates,
} from "./memory-query.js";
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

  getMetadata(): Promise<DatasetMetadata> {
    return Promise.resolve(this.#metadata);
  }

  getById(id: string): Promise<Region | null> {
    const region = this.#indexes.byId.get(id);

    if (region === undefined) {
      return Promise.resolve(null);
    }

    return Promise.resolve(structuredClone(region));
  }

  findByCode(
    code: string,
    options: FindByCodeOptions = {},
  ): Promise<RegionPage> {
    const candidates = this.#indexes.byCode.get(code) ?? [];

    const filtered = filterMemoryRegions(candidates, options);

    return Promise.resolve(createMemoryRegionPage(filtered, options));
  }

  findByName(
    name: string,
    options: FindByNameOptions = {},
  ): Promise<RegionPage> {
    const candidates = findMemoryNameCandidates(
      this.#regions,
      this.#indexes,
      name,
      options,
    );

    const filtered = filterMemoryRegions(candidates, options);

    return Promise.resolve(createMemoryRegionPage(filtered, options));
  }

  close(): Promise<void> {
    return Promise.resolve();
  }
}
