import type { DatasetMetadata, Region } from "../dataset/index.js";

import type {
  DescendantOptions,
  FindByCodeOptions,
  FindByNameOptions,
  QueryOptions,
  RegionFilter,
  RegionPage,
} from "../query/index.js";

export interface RegionStore {
  getMetadata(): Promise<DatasetMetadata>;

  getById(id: string): Promise<Region | null>;

  findByCode(code: string, options?: FindByCodeOptions): Promise<RegionPage>;

  findByName(name: string, options?: FindByNameOptions): Promise<RegionPage>;

  filter(criteria: RegionFilter, options?: QueryOptions): Promise<RegionPage>;

  parentOf(id: string): Promise<Region | null>;

  childrenOf(id: string, options?: QueryOptions): Promise<RegionPage>;

  ancestorsOf(id: string): Promise<readonly Region[]>;

  descendantsOf(id: string, options?: DescendantOptions): Promise<RegionPage>;

  close(): Promise<void>;
}
