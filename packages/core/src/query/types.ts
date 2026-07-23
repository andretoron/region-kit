import type { Region } from "../dataset/index.js";

export interface PaginationOptions {
  readonly limit?: number;
  readonly offset?: number;
}

export type RegionSortField = "code" | "name" | "level" | "type";

export type SortDirection = "asc" | "desc";

export interface SortOptions {
  readonly sortBy?: RegionSortField;
  readonly direction?: SortDirection;
}

export interface QueryOptions extends PaginationOptions, SortOptions {}

export interface PageInfo {
  readonly limit: number;
  readonly offset: number;
  readonly hasMore: boolean;
  readonly total?: number;
}

export interface RegionPage {
  readonly items: readonly Region[];
  readonly page: PageInfo;
}

export type TextMatch = "exact" | "prefix" | "contains";

export interface FindByCodeOptions extends QueryOptions {
  readonly parentId?: string;
  readonly level?: number;
  readonly type?: string;
}

export interface FindByNameOptions extends QueryOptions {
  readonly match?: TextMatch;
  readonly includeAliases?: boolean;
  readonly parentId?: string;
  readonly level?: number;
  readonly type?: string;
}

export interface SearchOptions extends QueryOptions {
  readonly match?: TextMatch;
  readonly parentId?: string;
  readonly levels?: readonly number[];
  readonly types?: readonly string[];
}

export type RegionSearchMatchedField = "name" | "alias";

export interface RegionSearchResult {
  readonly region: Region;
  readonly matchedField: RegionSearchMatchedField;
  readonly matchedValue: string;
}

export interface RegionSearchPage {
  readonly items: readonly RegionSearchResult[];
  readonly page: PageInfo;
}

export interface RegionFilter {
  readonly ids?: readonly string[];
  readonly codes?: readonly string[];
  readonly parentId?: string | null;
  readonly levels?: readonly number[];
  readonly types?: readonly string[];
}

export interface DescendantOptions extends QueryOptions {
  readonly maxDepth?: number;
}
