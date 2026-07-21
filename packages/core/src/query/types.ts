import type { Region } from "../dataset/index.js";

export interface PaginationOptions {
  readonly limit?: number;
  readonly offset?: number;
}

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

export interface FindByCodeOptions extends PaginationOptions {
  readonly parentId?: string;
  readonly level?: number;
  readonly type?: string;
}

export interface FindByNameOptions extends PaginationOptions {
  readonly match?: TextMatch;
  readonly includeAliases?: boolean;
  readonly parentId?: string;
  readonly level?: number;
  readonly type?: string;
}
