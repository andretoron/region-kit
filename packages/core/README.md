# region-kit

A framework-agnostic Node.js library for querying and navigating administrative
region datasets.

> `region-kit` is under active development and has not reached its first stable
> release.

## Requirements

- Node.js 22 or later
- ECMAScript modules

```bash
pnpm add region-kit
```

## Quick start

Load a Region-Kit JSON dataset from a local file:

```ts
import { RegionKit } from "region-kit";

const regions = await RegionKit.fromFile("./data/regions.json");

try {
  const province = await regions.requireById("ID-JB");

  const cities = await regions.filter({
    parentId: province.id,
    types: ["city"],
  });

  console.log(cities.items);
} finally {
  await regions.close();
}
```

`RegionKit.fromFile()` accepts a file path string or a `file:` URL. It reads and
parses the JSON file, validates the dataset, and creates an indexed in-memory
store.

## Creating an instance

### From a JSON file

```ts
const regions = await RegionKit.fromFile("./data/regions.json");
```

```ts
const regions = await RegionKit.fromFile(
  new URL("./data/regions.json", import.meta.url),
);
```

Only local JSON files are supported. Runtime HTTP downloads, compressed files,
and automatic dataset updates are outside the current API.

### From an object

```ts
const input: unknown = JSON.parse(jsonText);

const regions = await RegionKit.fromData(input);
```

The input is validated before the instance is created.

### From a store

```ts
import { RegionKit, type RegionStore } from "region-kit";

declare const store: RegionStore;

const regions = await RegionKit.fromStore(store);
```

Applications and adapter packages can implement `RegionStore` without depending
on the built-in memory store.

## Lookup

### Optional ID lookup

```ts
const region = await regions.getById("ID-JB");

if (region === null) {
  console.log("Region not found");
}
```

### Required ID lookup

```ts
const region = await regions.requireById("ID-JB");
```

`requireById()` throws `RegionNotFoundError` when the region does not exist.

### Code lookup

Codes are not guaranteed to be unique, so `findByCode()` returns a page:

```ts
const result = await regions.findByCode("01", {
  parentId: "ID-JB-CITY-BDG",
  limit: 20,
  offset: 0,
});
```

### Name lookup

```ts
const result = await regions.findByName("Bandung", {
  match: "exact",
  includeAliases: true,
});
```

Supported match modes are:

- `exact`
- `prefix`
- `contains`

Name matching is case-insensitive and normalizes surrounding and repeated
whitespace.

## Search

`search()` searches primary names and aliases:

```ts
const result = await regions.search("bandung", {
  match: "contains",
  levels: [2],
  types: ["city", "regency"],
  limit: 20,
});
```

Each result explains why it matched:

```ts
for (const item of result.items) {
  console.log(item.region.name, item.matchedField, item.matchedValue);
}
```

`matchedField` is either `"name"` or `"alias"`.

Fuzzy search, typo tolerance, stemming, and relevance ranking are not currently
supported.

## Filtering

```ts
const result = await regions.filter(
  {
    parentId: "ID-JB",
    levels: [2],
    types: ["city"],
  },
  {
    sortBy: "name",
    direction: "asc",
  },
);
```

Supported filter fields are:

- `ids`
- `codes`
- `parentId`
- `levels`
- `types`

Filter fields are combined using AND. Values inside one array are combined
using OR.

`parentId: null` selects root regions.

## Hierarchy traversal

### Parent

```ts
const parent = await regions.parentOf("ID-JB-CITY-BDG");
```

`parentOf()` returns `null` only when the target is a root region. An unknown
target throws `RegionNotFoundError`.

### Children

```ts
const children = await regions.childrenOf("ID-JB", {
  limit: 100,
});
```

### Ancestors

```ts
const ancestors = await regions.ancestorsOf("ID-JB-CITY-BDG-DISTRICT");
```

Ancestors are ordered from the direct parent toward the root.

### Descendants

```ts
const descendants = await regions.descendantsOf("ID-JB", {
  maxDepth: 2,
  limit: 100,
  offset: 0,
});
```

Omitting `maxDepth` includes every depth below the target.

## Pagination and sorting

Collection operations use offset pagination:

```ts
{
  limit: 50,
  offset: 0,
}
```

The maximum `limit` is `1000`. Invalid pagination values throw
`QueryValidationError`.

A page has this shape:

```ts
interface RegionPage {
  readonly items: readonly Region[];
  readonly page: {
    readonly limit: number;
    readonly offset: number;
    readonly hasMore: boolean;
    readonly total?: number;
  };
}
```

Supported sort fields are:

- `code`
- `name`
- `level`
- `type`

Supported directions are:

- `asc`
- `desc`

All collection results use deterministic ordering with the region ID as an
internal tie-breaker.

## Metadata

```ts
const metadata = await regions.getMetadata();

console.log(metadata.datasetVersion);
console.log(metadata.country);
console.log(metadata.source);
```

Metadata does not include the region collection.

## Lifecycle

```ts
const regions = await RegionKit.fromFile("./data/regions.json");

try {
  const result = await regions.search("bandung");
  console.log(result.items);
} finally {
  await regions.close();
}
```

`close()` is idempotent. Queries made after closing the instance throw
`RegionKitClosedError`.

## Error handling

```ts
import {
  DatasetLoadError,
  DatasetValidationError,
  QueryValidationError,
  RegionKitClosedError,
  RegionNotFoundError,
} from "region-kit";

try {
  const regions = await RegionKit.fromFile("./data/regions.json");

  try {
    await regions.requireById("unknown");
  } finally {
    await regions.close();
  }
} catch (error) {
  if (error instanceof DatasetLoadError) {
    console.error(error.stage, error.source, error.cause);
  } else if (error instanceof DatasetValidationError) {
    console.error(error.issues);
  } else if (error instanceof QueryValidationError) {
    console.error(error.parameter, error.message);
  } else if (error instanceof RegionNotFoundError) {
    console.error(error.regionId);
  } else if (error instanceof RegionKitClosedError) {
    console.error(error.message);
  } else {
    throw error;
  }
}
```

`DatasetLoadError.stage` is:

- `"read"` when the file cannot be read
- `"parse"` when the file does not contain valid JSON

Valid JSON that violates the Region-Kit Dataset Contract produces
`DatasetValidationError`, not `DatasetLoadError`.

## Dataset validation

The validator can also be used independently:

```ts
import { DatasetValidationError, validateRegionDataset } from "region-kit";

const input: unknown = JSON.parse(jsonText);

try {
  const dataset = validateRegionDataset(input);

  console.log(dataset.country.name);
} catch (error) {
  if (error instanceof DatasetValidationError) {
    for (const issue of error.issues) {
      console.error(issue.code, issue.path, issue.message);
    }
  } else {
    throw error;
  }
}
```

The standalone validator returns the original input after validation succeeds.
It does not normalize, copy, or freeze the dataset.

Instances created through `RegionKit.fromData()` or `RegionKit.fromFile()` use
an internal validated memory snapshot and do not expose mutable internal region
state.
