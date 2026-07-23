import { describe, expect, expectTypeOf, it } from "vitest";

import {
  DatasetLoadError,
  DatasetValidationError,
  MemoryRegionStore,
  QueryValidationError,
  RegionKit,
  RegionKitClosedError,
  RegionKitError,
  RegionNotFoundError,
  validateRegionDataset,
} from "./index.js";

import type {
  DatasetCountry,
  DatasetLoadStage,
  DatasetMetadata,
  DatasetSource,
  DatasetValidationIssue,
  DatasetValidationIssueCode,
  DatasetValidationPath,
  DatasetValidationPathSegment,
  DescendantOptions,
  FindByCodeOptions,
  FindByNameOptions,
  PageInfo,
  PaginationOptions,
  QueryOptions,
  Region,
  RegionDataset,
  RegionFilter,
  RegionKitErrorCode,
  RegionPage,
  RegionSearchMatchedField,
  RegionSearchPage,
  RegionSearchResult,
  RegionSortField,
  RegionStore,
  SearchOptions,
  SortDirection,
  SortOptions,
  TextMatch,
} from "./index.js";

type PublicTypeSurface = {
  datasetCountry: DatasetCountry;
  datasetLoadStage: DatasetLoadStage;
  datasetMetadata: DatasetMetadata;
  datasetSource: DatasetSource;
  datasetValidationIssue: DatasetValidationIssue;
  datasetValidationIssueCode: DatasetValidationIssueCode;
  datasetValidationPath: DatasetValidationPath;
  datasetValidationPathSegment: DatasetValidationPathSegment;
  descendantOptions: DescendantOptions;
  findByCodeOptions: FindByCodeOptions;
  findByNameOptions: FindByNameOptions;
  pageInfo: PageInfo;
  paginationOptions: PaginationOptions;
  queryOptions: QueryOptions;
  region: Region;
  regionDataset: RegionDataset;
  regionFilter: RegionFilter;
  regionKitErrorCode: RegionKitErrorCode;
  regionPage: RegionPage;
  regionSearchMatchedField: RegionSearchMatchedField;
  regionSearchPage: RegionSearchPage;
  regionSearchResult: RegionSearchResult;
  regionSortField: RegionSortField;
  regionStore: RegionStore;
  searchOptions: SearchOptions;
  sortDirection: SortDirection;
  sortOptions: SortOptions;
  textMatch: TextMatch;
};

describe("public API", () => {
  it("exports the documented runtime values", () => {
    const runtimeExports = [
      DatasetLoadError,
      DatasetValidationError,
      MemoryRegionStore,
      QueryValidationError,
      RegionKit,
      RegionKitClosedError,
      RegionKitError,
      RegionNotFoundError,
      validateRegionDataset,
    ];

    for (const exportedValue of runtimeExports) {
      expect(exportedValue).toBeTypeOf("function");
    }
  });

  it("exports the documented public types", () => {
    expectTypeOf<PublicTypeSurface>().toBeObject();
  });
});
