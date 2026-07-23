export type {
  DatasetCountry,
  DatasetMetadata,
  DatasetSource,
  Region,
  RegionDataset,
} from "./dataset/index.js";

export { validateRegionDataset } from "./dataset/index.js";

export {
  DatasetLoadError,
  DatasetValidationError,
  QueryValidationError,
  RegionKitClosedError,
  RegionKitError,
  RegionNotFoundError,
} from "./errors/index.js";

export type {
  DatasetLoadStage,
  DatasetValidationIssue,
  DatasetValidationIssueCode,
  DatasetValidationPath,
  DatasetValidationPathSegment,
  RegionKitErrorCode,
} from "./errors/index.js";

export type {
  DescendantOptions,
  FindByCodeOptions,
  FindByNameOptions,
  PageInfo,
  PaginationOptions,
  QueryOptions,
  RegionFilter,
  RegionPage,
  RegionSearchMatchedField,
  RegionSearchPage,
  RegionSearchResult,
  RegionSortField,
  SearchOptions,
  SortDirection,
  SortOptions,
  TextMatch,
} from "./query/index.js";

export { RegionKit } from "./region-kit.js";

export type { RegionStore } from "./store/index.js";
export { MemoryRegionStore } from "./store/index.js";
