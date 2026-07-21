export type {
  DatasetCountry,
  DatasetSource,
  Region,
  RegionDataset,
  DatasetMetadata,
} from "./dataset/index.js";

export { validateRegionDataset } from "./dataset/index.js";

export { RegionKitError } from "./errors/index.js";
export type { RegionKitErrorCode } from "./errors/index.js";

export { DatasetValidationError } from "./errors/index.js";

export type {
  DatasetValidationIssue,
  DatasetValidationIssueCode,
  DatasetValidationPath,
  DatasetValidationPathSegment,
} from "./errors/index.js";

export type {
  FindByCodeOptions,
  FindByNameOptions,
  PageInfo,
  PaginationOptions,
  RegionPage,
  TextMatch,
} from "./query/index.js";

export type { RegionStore } from "./store/index.js";
export { MemoryRegionStore } from "./store/index.js";
