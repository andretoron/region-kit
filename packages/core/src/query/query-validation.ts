import { QueryValidationError } from "../errors/index.js";
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from "./constants.js";

import type {
  FindByCodeOptions,
  FindByNameOptions,
  PaginationOptions,
  RegionSortField,
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

function validateOptionsObject<T extends object>(value: unknown): T {
  if (value === undefined) {
    return {} as T;
  }

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new QueryValidationError("options", "Expected an object.");
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

function validateOptionalNonNegativeInteger(
  value: unknown,
  parameter: string,
): void {
  if (value === undefined) {
    return;
  }

  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new QueryValidationError(
      parameter,
      "Expected a non-negative integer.",
    );
  }
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
