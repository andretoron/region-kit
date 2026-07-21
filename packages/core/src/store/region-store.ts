import type { DatasetMetadata, Region } from "../dataset/index.js";

import type {
  FindByCodeOptions,
  FindByNameOptions,
  RegionPage,
} from "../query/index.js";

export interface RegionStore {
  getMetadata(): Promise<DatasetMetadata>;

  getById(id: string): Promise<Region | null>;

  findByCode(code: string, options?: FindByCodeOptions): Promise<RegionPage>;

  findByName(name: string, options?: FindByNameOptions): Promise<RegionPage>;

  close(): Promise<void>;
}
