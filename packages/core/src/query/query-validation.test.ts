import { describe, expect, it } from "vitest";

import { QueryValidationError } from "../errors/index.js";

import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from "./constants.js";
import {
  resolveFindByCodeQuery,
  resolveFindByNameQuery,
  resolvePaginationOptions,
  resolveSortOptions,
  validateRegionId,
} from "./query-validation.js";

describe("resolvePaginationOptions", () => {
  it("resolves default pagination", () => {
    expect(resolvePaginationOptions({})).toEqual({
      limit: DEFAULT_PAGE_LIMIT,
      offset: 0,
    });
  });

  it("accepts the maximum limit and a non-zero offset", () => {
    expect(
      resolvePaginationOptions({
        limit: MAX_PAGE_LIMIT,
        offset: 10,
      }),
    ).toEqual({
      limit: MAX_PAGE_LIMIT,
      offset: 10,
    });
  });

  it.each([
    { limit: 0 },
    { limit: -1 },
    { limit: MAX_PAGE_LIMIT + 1 },
    { limit: 1.5 },
    { limit: Number.NaN },
    { limit: "10" as never },
  ])("rejects invalid limit %#", (options) => {
    expect(() => resolvePaginationOptions(options)).toThrow(
      QueryValidationError,
    );
  });

  it.each([
    { offset: -1 },
    { offset: 1.5 },
    { offset: Number.NaN },
    { offset: "10" as never },
  ])("rejects invalid offset %#", (options) => {
    expect(() => resolvePaginationOptions(options)).toThrow(
      QueryValidationError,
    );
  });
});

describe("query input validation", () => {
  it.each(["", "   "])("rejects invalid region id %j", (id) => {
    expect(() => validateRegionId(id)).toThrow(QueryValidationError);
  });

  it.each(["", "   "])("rejects invalid code %j", (code) => {
    expect(() => resolveFindByCodeQuery(code, undefined)).toThrow(
      QueryValidationError,
    );
  });

  it.each(["", "   "])("rejects invalid name %j", (name) => {
    expect(() => resolveFindByNameQuery(name, undefined)).toThrow(
      QueryValidationError,
    );
  });

  it.each([null, [], "invalid"])("rejects invalid options %#", (options) => {
    expect(() => resolveFindByCodeQuery("01", options)).toThrow(
      QueryValidationError,
    );
  });
});

describe("resolveFindByCodeQuery", () => {
  it("resolves pagination and code sorting defaults", () => {
    expect(resolveFindByCodeQuery("01", undefined)).toMatchObject({
      options: {},
      pagination: {
        limit: DEFAULT_PAGE_LIMIT,
        offset: 0,
      },
      sort: {
        sortBy: "code",
        direction: "asc",
      },
    });
  });

  it.each([
    { parentId: "" },
    { level: -1 },
    { level: 1.5 },
    { type: "" },
    { sortBy: "id" },
    { direction: "up" },
  ])("rejects invalid code options %#", (options) => {
    expect(() => resolveFindByCodeQuery("01", options)).toThrow(
      QueryValidationError,
    );
  });
});

describe("resolveFindByNameQuery", () => {
  it("resolves pagination and name sorting defaults", () => {
    expect(resolveFindByNameQuery("Bandung", undefined)).toMatchObject({
      options: {},
      pagination: {
        limit: DEFAULT_PAGE_LIMIT,
        offset: 0,
      },
      sort: {
        sortBy: "name",
        direction: "asc",
      },
    });
  });

  it.each([
    { parentId: "" },
    { level: -1 },
    { level: 1.5 },
    { type: "" },
    { match: "fuzzy" },
    { includeAliases: "true" },
    { sortBy: "id" },
    { direction: "up" },
  ])("rejects invalid name options %#", (options) => {
    expect(() => resolveFindByNameQuery("Bandung", options)).toThrow(
      QueryValidationError,
    );
  });
});

describe("resolveSortOptions", () => {
  it("uses the requested default field and ascending direction", () => {
    expect(resolveSortOptions({}, "type")).toEqual({
      sortBy: "type",
      direction: "asc",
    });
  });

  it("accepts a custom field and direction", () => {
    expect(
      resolveSortOptions(
        {
          sortBy: "level",
          direction: "desc",
        },
        "name",
      ),
    ).toEqual({
      sortBy: "level",
      direction: "desc",
    });
  });
});
