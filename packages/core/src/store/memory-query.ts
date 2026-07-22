import type { Region } from "../dataset/index.js";
import type {
  FindByNameOptions,
  PaginationOptions,
  RegionFilter,
  RegionPage,
  TextMatch,
} from "../query/index.js";
import type { MemoryIndexes } from "./memory-indexes.js";

import { resolvePaginationOptions } from "../query/query-validation.js";
import {
  matchesRegionText,
  normalizeRegionText,
} from "../query/text-matching.js";

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

function regionMatchesName(
  region: Region,
  normalizedQuery: string,
  match: TextMatch,
  includeAliases: boolean,
): boolean {
  if (matchesRegionText(region.name, normalizedQuery, match)) {
    return true;
  }

  if (!includeAliases) {
    return false;
  }

  return (region.aliases ?? []).some((alias) =>
    matchesRegionText(alias, normalizedQuery, match),
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

export function filterMemoryRegionsByCriteria(
  regions: readonly Region[],
  criteria: RegionFilter,
): readonly Region[] {
  const ids = criteria.ids === undefined ? undefined : new Set(criteria.ids);

  const codes =
    criteria.codes === undefined ? undefined : new Set(criteria.codes);

  const levels =
    criteria.levels === undefined ? undefined : new Set(criteria.levels);

  const types =
    criteria.types === undefined ? undefined : new Set(criteria.types);

  return regions.filter((region) => {
    if (ids !== undefined && !ids.has(region.id)) {
      return false;
    }

    if (codes !== undefined && !codes.has(region.code)) {
      return false;
    }

    if (
      criteria.parentId !== undefined &&
      region.parentId !== criteria.parentId
    ) {
      return false;
    }

    if (levels !== undefined && !levels.has(region.level)) {
      return false;
    }

    if (types !== undefined && !types.has(region.type)) {
      return false;
    }

    return true;
  });
}
