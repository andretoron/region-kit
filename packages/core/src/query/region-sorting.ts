import type { Region } from "../dataset/index.js";

import type {
  RegionSearchResult,
  RegionSortField,
  SortDirection,
} from "./types.js";

export interface RegionSortRule {
  readonly field: RegionSortField | "id";
  readonly direction: SortDirection;
}

export function createRegionSortRules(
  sortBy: RegionSortField,
  direction: SortDirection,
  secondaryFields: readonly RegionSortField[] = [],
): readonly RegionSortRule[] {
  return Object.freeze([
    Object.freeze({
      field: sortBy,
      direction,
    }),
    ...secondaryFields.map((field) =>
      Object.freeze({
        field,
        direction: "asc" as const,
      }),
    ),
    Object.freeze({
      field: "id",
      direction: "asc" as const,
    }),
  ]);
}

export function sortRegions(
  regions: readonly Region[],
  rules: readonly RegionSortRule[],
): readonly Region[] {
  return [...regions].sort((left, right) => compareRegions(left, right, rules));
}

export function sortRegionSearchResults(
  results: readonly RegionSearchResult[],
  rules: readonly RegionSortRule[],
): readonly RegionSearchResult[] {
  return [...results].sort((left, right) =>
    compareRegions(left.region, right.region, rules),
  );
}

function compareRegionField(
  left: Region,
  right: Region,
  field: RegionSortRule["field"],
): number {
  if (field === "level") {
    return left.level - right.level;
  }

  return compareStrings(left[field], right[field]);
}

function compareStrings(left: string, right: string): number {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}

function compareRegions(
  left: Region,
  right: Region,
  rules: readonly RegionSortRule[],
): number {
  for (const rule of rules) {
    const comparison = compareRegionField(left, right, rule.field);

    if (comparison !== 0) {
      return rule.direction === "asc" ? comparison : -comparison;
    }
  }

  return 0;
}
