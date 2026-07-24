import type { Region } from "../dataset/index.js";

/** Offset-based pagination controls shared by collection queries. */
export interface PaginationOptions {
  /** Maximum items to return. Defaults to 50 and cannot exceed 1000. */
  readonly limit?: number;
  /** Number of matching items to skip. Defaults to zero. */
  readonly offset?: number;
}

/** Region field available for deterministic collection sorting. */
export type RegionSortField = "code" | "name" | "level" | "type";

/** Sort direction applied to the selected field. */
export type SortDirection = "asc" | "desc";

/** Sorting controls shared by collection queries. */
export interface SortOptions {
  /** Region field to sort by. The default depends on the query operation. */
  readonly sortBy?: RegionSortField;
  /** Sort direction. Defaults to ascending. */
  readonly direction?: SortDirection;
}

/** Common pagination and sorting controls for collection queries. */
export interface QueryOptions extends PaginationOptions, SortOptions {}

/** Metadata describing an offset-paginated result. */
export interface PageInfo {
  /** Effective item limit used for this page. */
  readonly limit: number;
  /** Effective offset used for this page. */
  readonly offset: number;
  /** Whether more matching items exist after this page. */
  readonly hasMore: boolean;
  /** Total number of matches when the store can provide it. */
  readonly total?: number;
}

/** A page of regions in deterministic order. */
export interface RegionPage {
  /** Regions contained in this page. */
  readonly items: readonly Region[];
  /** Pagination metadata for the result. */
  readonly page: PageInfo;
}

/** Supported case-insensitive text matching strategies. */
export type TextMatch = "exact" | "prefix" | "contains";

/** Options for looking up regions by a possibly non-unique code. */
export interface FindByCodeOptions extends QueryOptions {
  /** Restrict matches to direct children of this region. */
  readonly parentId?: string;
  /** Restrict matches to this hierarchy level. */
  readonly level?: number;
  /** Restrict matches to this dataset-defined administrative type. */
  readonly type?: string;
}

/** Options for looking up regions by primary name or alias. */
export interface FindByNameOptions extends QueryOptions {
  /** Text matching strategy. Defaults to `exact`. */
  readonly match?: TextMatch;
  /** Whether aliases participate in matching. Defaults to `true`. */
  readonly includeAliases?: boolean;
  /** Restrict matches to direct children of this region. */
  readonly parentId?: string;
  /** Restrict matches to this hierarchy level. */
  readonly level?: number;
  /** Restrict matches to this dataset-defined administrative type. */
  readonly type?: string;
}

/** Options for searching primary names and aliases. */
export interface SearchOptions extends QueryOptions {
  /** Text matching strategy. Defaults to `contains`. */
  readonly match?: TextMatch;
  /** Restrict matches to direct children of this region. */
  readonly parentId?: string;
  /** Restrict matches to any of these hierarchy levels. */
  readonly levels?: readonly number[];
  /** Restrict matches to any of these dataset-defined administrative types. */
  readonly types?: readonly string[];
}

/** Region property that produced a search match. */
export type RegionSearchMatchedField = "name" | "alias";

/** A region search match together with the value that matched. */
export interface RegionSearchResult {
  /** Matching region. */
  readonly region: Region;
  /** Whether the primary name or an alias matched. */
  readonly matchedField: RegionSearchMatchedField;
  /** Original name or alias value that matched the query. */
  readonly matchedValue: string;
}

/** A page of annotated region search matches. */
export interface RegionSearchPage {
  /** Search matches contained in this page. */
  readonly items: readonly RegionSearchResult[];
  /** Pagination metadata for the result. */
  readonly page: PageInfo;
}

/** Criteria combined with AND to select regions. Array values match with OR. */
export interface RegionFilter {
  /** Match any of these region identifiers. */
  readonly ids?: readonly string[];
  /** Match any of these region codes. */
  readonly codes?: readonly string[];
  /** Match this parent; `null` selects the root region. */
  readonly parentId?: string | null;
  /** Match any of these hierarchy levels. */
  readonly levels?: readonly number[];
  /** Match any of these dataset-defined administrative types. */
  readonly types?: readonly string[];
}

/** Pagination, sorting, and depth controls for descendant traversal. */
export interface DescendantOptions extends QueryOptions {
  /** Maximum edges below the target to include; zero returns no descendants. */
  readonly maxDepth?: number;
}
