# Runnable Examples

Examples are private pnpm workspace packages that consume only the public
`region-kit` entry point.

```bash
pnpm --filter region-kit-example-json-basic start
pnpm --filter region-kit-example-search-and-traversal start
pnpm --filter region-kit-example-custom-store start
```

Run all example typechecks with the root workspace typecheck:

```bash
pnpm typecheck
```

Each example uses a small deterministic dataset, performs no network requests,
and closes its `RegionKit` instance in a `finally` block.
