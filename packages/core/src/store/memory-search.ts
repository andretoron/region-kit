import type { Region } from "../dataset/index.js";

import type {
  PaginationOptions,
  RegionSearchPage,
  RegionSearchResult,
  SearchOptions,
  TextMatch,
} from "../query/index.js";
import { resolvePaginationOptions } from "../query/query-validation.js";

import {
  matchesRegionText,
  normalizeRegionText,
} from "../query/text-matching.js";

export function findMemorySearchResults(
  regions: readonly Region[],
  query: string,
  match: TextMatch,
  options: SearchOptions,
): readonly RegionSearchResult[] {
  const normalizedQuery = normalizeRegionText(query);

  const levels =
    options.levels === undefined ? undefined : new Set(options.levels);

  const types =
    options.types === undefined ? undefined : new Set(options.types);

  const results: RegionSearchResult[] = [];

  for (const region of regions) {
    if (
      options.parentId !== undefined &&
      region.parentId !== options.parentId
    ) {
      continue;
    }

    if (levels !== undefined && !levels.has(region.level)) {
      continue;
    }

    if (types !== undefined && !types.has(region.type)) {
      continue;
    }

    if (matchesRegionText(region.name, normalizedQuery, match)) {
      results.push({
        region,
        matchedField: "name",
        matchedValue: region.name,
      });

      continue;
    }

    const matchingAlias = (region.aliases ?? []).find((alias) =>
      matchesRegionText(alias, normalizedQuery, match),
    );

    if (matchingAlias !== undefined) {
      results.push({
        region,
        matchedField: "alias",
        matchedValue: matchingAlias,
      });
    }
  }

  return results;
}

export function createMemoryRegionSearchPage(
  results: readonly RegionSearchResult[],
  options: PaginationOptions = {},
): RegionSearchPage {
  const { limit, offset } = resolvePaginationOptions(options);
  const total = results.length;

  const items = structuredClone(results.slice(offset, offset + limit));

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
