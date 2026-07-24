import { describe, expect, it } from "vitest";

import { QueryValidationError } from "../errors/index.js";

import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from "./constants.js";
import {
  resolveChildrenQuery,
  resolveDescendantQuery,
  resolveFindByCodeQuery,
  resolveFindByNameQuery,
  resolveFilterQuery,
  resolvePaginationOptions,
  resolveSearchQuery,
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

describe("resolveFilterQuery", () => {
  it("resolves filter defaults", () => {
    expect(resolveFilterQuery({}, undefined)).toMatchObject({
      criteria: {},
      options: {},
      pagination: {
        limit: DEFAULT_PAGE_LIMIT,
        offset: 0,
      },
      sort: {
        sortBy: "level",
        direction: "asc",
      },
    });
  });

  it("accepts empty arrays and a null parent id", () => {
    expect(
      resolveFilterQuery(
        {
          ids: [],
          codes: [],
          parentId: null,
          levels: [],
          types: [],
        },
        undefined,
      ).criteria,
    ).toEqual({
      ids: [],
      codes: [],
      parentId: null,
      levels: [],
      types: [],
    });
  });

  it.each([
    undefined,
    null,
    [],
    "invalid",
    { ids: "ID" },
    { ids: [""] },
    { codes: ["   "] },
    { parentId: "" },
    { levels: "2" },
    { levels: [-1] },
    { levels: [1.5] },
    { levels: [undefined] },
    { types: [""] },
  ])("rejects invalid criteria %#", (criteria) => {
    expect(() => resolveFilterQuery(criteria, undefined)).toThrow(
      QueryValidationError,
    );
  });

  it("rejects malformed filter arrays", () => {
    expect(() =>
      resolveFilterQuery(
        {
          ids: [undefined] as never,
        },
        undefined,
      ),
    ).toThrow(QueryValidationError);
  });
});

describe("traversal query validation", () => {
  it("resolves children defaults", () => {
    expect(resolveChildrenQuery("ID-JB", undefined)).toMatchObject({
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

  it("resolves descendant defaults", () => {
    expect(resolveDescendantQuery("ID-JB", undefined)).toMatchObject({
      pagination: {
        limit: DEFAULT_PAGE_LIMIT,
        offset: 0,
      },
      sort: {
        sortBy: "level",
        direction: "asc",
      },
    });
  });

  it.each([-1, 1.5, Number.NaN])("rejects invalid max depth %j", (maxDepth) => {
    expect(() =>
      resolveDescendantQuery("ID-JB", {
        maxDepth,
      }),
    ).toThrow(QueryValidationError);
  });
});

describe("resolveSearchQuery", () => {
  it("resolves search defaults", () => {
    expect(resolveSearchQuery("bandung", undefined)).toMatchObject({
      match: "contains",
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

  it("resolves valid custom search options", () => {
    expect(
      resolveSearchQuery("bandung", {
        match: "prefix",
        parentId: "ID-JB",
        levels: [2],
        types: ["city"],
        limit: 10,
        offset: 5,
        sortBy: "code",
        direction: "desc",
      }),
    ).toMatchObject({
      match: "prefix",
      pagination: {
        limit: 10,
        offset: 5,
      },
      sort: {
        sortBy: "code",
        direction: "desc",
      },
    });
  });

  it("rejects undefined values inside numeric arrays", () => {
    expect(() =>
      resolveSearchQuery("bandung", {
        levels: [undefined] as never,
      }),
    ).toThrow(QueryValidationError);
  });

  it("rejects sparse numeric arrays", () => {
    const levels = new Array<number>(1);

    expect(() =>
      resolveSearchQuery("bandung", {
        levels,
      }),
    ).toThrow(QueryValidationError);
  });

  it("rejects sparse string arrays", () => {
    const types = new Array<string>(1);

    expect(() =>
      resolveSearchQuery("bandung", {
        types,
      }),
    ).toThrow(QueryValidationError);
  });

  it.each(["", "   "])("rejects invalid search query %j", (query) => {
    expect(() => resolveSearchQuery(query, undefined)).toThrow(
      QueryValidationError,
    );
  });

  it.each([
    null,
    { match: "fuzzy" },
    { parentId: "" },
    { levels: 2 },
    { levels: [-1] },
    { types: "city" },
    { types: [""] },
    { limit: 0 },
    { sortBy: "id" },
  ])("rejects invalid search options %#", (options) => {
    expect(() => resolveSearchQuery("bandung", options)).toThrow(
      QueryValidationError,
    );
  });
});
