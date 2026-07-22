import type { Region } from "../dataset/index.js";
import type {
  FindByNameOptions,
  PaginationOptions,
  RegionPage,
  TextMatch,
} from "../query/index.js";
import { normalizeRegionText, type MemoryIndexes } from "./memory-indexes.js";

import { resolvePaginationOptions } from "../query/query-validation.js";

export interface MemoryRegionFilter {
  readonly parentId?: string;
  readonly level?: number;
  readonly type?: string;
}

export function filterMemoryRegions(
  regions: readonly Region[],
  filter: MemoryRegionFilter,
): readonly Region[] {
  return regions.filter((region) => {
    if (filter.parentId !== undefined && region.parentId !== filter.parentId) {
      return false;
    }

    if (filter.level !== undefined && region.level !== filter.level) {
      return false;
    }

    if (filter.type !== undefined && region.type !== filter.type) {
      return false;
    }

    return true;
  });
}

function matchesText(value: string, query: string, match: TextMatch): boolean {
  switch (match) {
    case "exact":
      return value === query;
    case "prefix":
      return value.startsWith(query);
    case "contains":
      return value.includes(query);
  }
}

function regionMatchesName(
  region: Region,
  normalizedQuery: string,
  match: TextMatch,
  includeAliases: boolean,
): boolean {
  if (matchesText(normalizeRegionText(region.name), normalizedQuery, match)) {
    return true;
  }

  if (!includeAliases) {
    return false;
  }

  return (region.aliases ?? []).some((alias) =>
    matchesText(normalizeRegionText(alias), normalizedQuery, match),
  );
}

export function findMemoryNameCandidates(
  regions: readonly Region[],
  indexes: MemoryIndexes,
  name: string,
  options: FindByNameOptions = {},
): readonly Region[] {
  const normalizedQuery = normalizeRegionText(name);
  const match = options.match ?? "exact";
  const includeAliases = options.includeAliases ?? true;

  if (match === "exact") {
    const exactCandidates = indexes.byNormalizedName.get(normalizedQuery) ?? [];

    if (includeAliases) {
      return exactCandidates;
    }

    return exactCandidates.filter(
      (region) => normalizeRegionText(region.name) === normalizedQuery,
    );
  }

  return regions.filter((region) =>
    regionMatchesName(region, normalizedQuery, match, includeAliases),
  );
}

export function createMemoryRegionPage(
  regions: readonly Region[],
  options: PaginationOptions = {},
): RegionPage {
  const { limit, offset } = resolvePaginationOptions(options);
  const total = regions.length;

  const items = structuredClone(regions.slice(offset, offset + limit));

  const page = Object.freeze({
    limit,
    offset,
    hasMore: offset + items.length < total,
    total,
  });

  return Object.freeze({
    items: Object.freeze(items),
    page,
  });
}
