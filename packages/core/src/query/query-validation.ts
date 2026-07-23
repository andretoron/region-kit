import { QueryValidationError } from "../errors/index.js";
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from "./constants.js";

import type {
  DescendantOptions,
  FindByCodeOptions,
  FindByNameOptions,
  PaginationOptions,
  QueryOptions,
  RegionFilter,
  RegionSortField,
  SearchOptions,
  SortDirection,
  SortOptions,
  TextMatch,
} from "./types.js";

const REGION_SORT_FIELDS = new Set<RegionSortField>([
  "code",
  "name",
  "level",
  "type",
]);

const SORT_DIRECTIONS = new Set<SortDirection>(["asc", "desc"]);

const TEXT_MATCHES = new Set<TextMatch>(["exact", "prefix", "contains"]);

export interface ResolvedSearchQuery {
  readonly options: SearchOptions;
  readonly match: TextMatch;
  readonly pagination: ResolvedPaginationOptions;
  readonly sort: ResolvedSortOptions;
}
export interface ResolvedFilterQuery {
  readonly criteria: RegionFilter;
  readonly options: QueryOptions;
  readonly pagination: ResolvedPaginationOptions;
  readonly sort: ResolvedSortOptions;
}

export interface ResolvedChildrenQuery {
  readonly options: QueryOptions;
  readonly pagination: ResolvedPaginationOptions;
  readonly sort: ResolvedSortOptions;
}

export interface ResolvedDescendantQuery {
  readonly options: DescendantOptions;
  readonly pagination: ResolvedPaginationOptions;
  readonly sort: ResolvedSortOptions;
}
export interface ResolvedPaginationOptions {
  readonly limit: number;
  readonly offset: number;
}

export interface ResolvedSortOptions {
  readonly sortBy: RegionSortField;
  readonly direction: SortDirection;
}

export interface ResolvedFindByCodeQuery {
  readonly options: FindByCodeOptions;
  readonly pagination: ResolvedPaginationOptions;
  readonly sort: ResolvedSortOptions;
}

export interface ResolvedFindByNameQuery {
  readonly options: FindByNameOptions;
  readonly pagination: ResolvedPaginationOptions;
  readonly sort: ResolvedSortOptions;
}

function validateOptionsObject<T extends object>(
  value: unknown,
  parameter = "options",
): T {
  if (value === undefined) {
    return {} as T;
  }

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new QueryValidationError(parameter, "Expected an object.");
  }

  return value as T;
}

function validateRequiredString(
  value: unknown,
  parameter: string,
): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new QueryValidationError(parameter, "Expected a non-empty string.");
  }
}

function validateOptionalString(value: unknown, parameter: string): void {
  if (value === undefined) {
    return;
  }

  validateRequiredString(value, parameter);
}

function validateRequiredNonNegativeInteger(
  value: unknown,
  parameter: string,
): asserts value is number {
  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new QueryValidationError(
      parameter,
      "Expected a non-negative integer.",
    );
  }
}

function validateOptionalNonNegativeInteger(
  value: unknown,
  parameter: string,
): void {
  if (value === undefined) {
    return;
  }

  validateRequiredNonNegativeInteger(value, parameter);
}

function validateOptionalStringArray(value: unknown, parameter: string): void {
  if (value === undefined) {
    return;
  }

  if (!Array.isArray(value)) {
    throw new QueryValidationError(
      parameter,
      "Expected an array of non-empty strings.",
    );
  }

  for (let index = 0; index < value.length; index += 1) {
    validateRequiredString(value[index], `${parameter}[${index}]`);
  }
}

function validateOptionalNonNegativeIntegerArray(
  value: unknown,
  parameter: string,
): void {
  if (value === undefined) {
    return;
  }

  if (!Array.isArray(value)) {
    throw new QueryValidationError(
      parameter,
      "Expected an array of non-negative integers.",
    );
  }

  for (let index = 0; index < value.length; index += 1) {
    validateRequiredNonNegativeInteger(value[index], `${parameter}[${index}]`);
  }
}

function validateOptionalNullableString(
  value: unknown,
  parameter: string,
): void {
  if (value === undefined || value === null) {
    return;
  }

  validateRequiredString(value, parameter);
}

export function resolvePaginationOptions(
  options: PaginationOptions,
): ResolvedPaginationOptions {
  const limit = options.limit ?? DEFAULT_PAGE_LIMIT;
  const offset = options.offset ?? 0;

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_LIMIT) {
    throw new QueryValidationError(
      "limit",
      `Expected an integer between 1 and ${MAX_PAGE_LIMIT}.`,
    );
  }

  if (!Number.isInteger(offset) || offset < 0) {
    throw new QueryValidationError(
      "offset",
      "Expected a non-negative integer.",
    );
  }

  return Object.freeze({
    limit,
    offset,
  });
}

export function resolveSortOptions(
  options: SortOptions,
  defaultSortBy: RegionSortField,
): ResolvedSortOptions {
  const sortBy = options.sortBy ?? defaultSortBy;
  const direction = options.direction ?? "asc";

  if (!REGION_SORT_FIELDS.has(sortBy)) {
    throw new QueryValidationError(
      "sortBy",
      'Expected "code", "name", "level", or "type".',
    );
  }

  if (!SORT_DIRECTIONS.has(direction)) {
    throw new QueryValidationError("direction", 'Expected "asc" or "desc".');
  }

  return Object.freeze({
    sortBy,
    direction,
  });
}

export function validateRegionId(id: unknown): asserts id is string {
  validateRequiredString(id, "id");
}

export function resolveFindByCodeQuery(
  code: unknown,
  options: unknown,
): ResolvedFindByCodeQuery {
  validateRequiredString(code, "code");

  const queryOptions = validateOptionsObject<FindByCodeOptions>(options);

  validateOptionalString(queryOptions.parentId, "parentId");
  validateOptionalNonNegativeInteger(queryOptions.level, "level");
  validateOptionalString(queryOptions.type, "type");

  return Object.freeze({
    options: queryOptions,
    pagination: resolvePaginationOptions(queryOptions),
    sort: resolveSortOptions(queryOptions, "code"),
  });
}

export function resolveFindByNameQuery(
  name: unknown,
  options: unknown,
): ResolvedFindByNameQuery {
  validateRequiredString(name, "name");

  const queryOptions = validateOptionsObject<FindByNameOptions>(options);

  validateOptionalString(queryOptions.parentId, "parentId");
  validateOptionalNonNegativeInteger(queryOptions.level, "level");
  validateOptionalString(queryOptions.type, "type");

  if (
    queryOptions.match !== undefined &&
    !TEXT_MATCHES.has(queryOptions.match)
  ) {
    throw new QueryValidationError(
      "match",
      'Expected "exact", "prefix", or "contains".',
    );
  }

  if (
    queryOptions.includeAliases !== undefined &&
    typeof queryOptions.includeAliases !== "boolean"
  ) {
    throw new QueryValidationError("includeAliases", "Expected a boolean.");
  }

  return Object.freeze({
    options: queryOptions,
    pagination: resolvePaginationOptions(queryOptions),
    sort: resolveSortOptions(queryOptions, "name"),
  });
}

export function resolveFilterQuery(
  criteria: unknown,
  options: unknown,
): ResolvedFilterQuery {
  const regionFilter = validateOptionsObject<RegionFilter>(
    criteria,
    "criteria",
  );

  validateOptionalStringArray(regionFilter.ids, "criteria.ids");
  validateOptionalStringArray(regionFilter.codes, "criteria.codes");
  validateOptionalNullableString(regionFilter.parentId, "criteria.parentId");
  validateOptionalNonNegativeIntegerArray(
    regionFilter.levels,
    "criteria.levels",
  );
  validateOptionalStringArray(regionFilter.types, "criteria.types");

  const queryOptions = validateOptionsObject<QueryOptions>(options, "options");

  return Object.freeze({
    criteria: regionFilter,
    options: queryOptions,
    pagination: resolvePaginationOptions(queryOptions),
    sort: resolveSortOptions(queryOptions, "level"),
  });
}

export function resolveChildrenQuery(
  id: unknown,
  options: unknown,
): ResolvedChildrenQuery {
  validateRegionId(id);

  const queryOptions = validateOptionsObject<QueryOptions>(options, "options");

  return Object.freeze({
    options: queryOptions,
    pagination: resolvePaginationOptions(queryOptions),
    sort: resolveSortOptions(queryOptions, "code"),
  });
}

export function resolveDescendantQuery(
  id: unknown,
  options: unknown,
): ResolvedDescendantQuery {
  validateRegionId(id);

  const descendantOptions = validateOptionsObject<DescendantOptions>(
    options,
    "options",
  );

  validateOptionalNonNegativeInteger(descendantOptions.maxDepth, "maxDepth");

  return Object.freeze({
    options: descendantOptions,
    pagination: resolvePaginationOptions(descendantOptions),
    sort: resolveSortOptions(descendantOptions, "level"),
  });
}

export function resolveSearchQuery(
  query: unknown,
  options: unknown,
): ResolvedSearchQuery {
  validateRequiredString(query, "query");

  const searchOptions = validateOptionsObject<SearchOptions>(
    options,
    "options",
  );

  if (
    searchOptions.match !== undefined &&
    !TEXT_MATCHES.has(searchOptions.match)
  ) {
    throw new QueryValidationError(
      "match",
      'Expected "exact", "prefix", or "contains".',
    );
  }

  validateOptionalString(searchOptions.parentId, "parentId");

  validateOptionalNonNegativeIntegerArray(searchOptions.levels, "levels");

  validateOptionalStringArray(searchOptions.types, "types");

  return Object.freeze({
    options: searchOptions,
    match: searchOptions.match ?? "contains",
    pagination: resolvePaginationOptions(searchOptions),
    sort: resolveSortOptions(searchOptions, "name"),
  });
}
