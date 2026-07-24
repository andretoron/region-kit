# region-kit

A framework-agnostic Node.js library for querying and navigating administrative
region datasets.

The project is currently being prepared for its first `0.1.0` MVP release.
The public API may still change before `1.0.0`.

## Current implementation

The development branch currently includes:

- Region-Kit Dataset Contract and validation.
- Validated indexed memory storage.
- The public `RegionKit` query facade.
- JSON file and JavaScript object loading.
- ID, code, and name lookup.
- Text search and structured filtering.
- Parent, child, ancestor, and descendant traversal.
- Deterministic sorting and offset pagination.
- Stable validation, loading, query, not-found, and lifecycle errors.
- Packed JavaScript and TypeScript consumer verification.
- Automated coverage, package, distribution, and API documentation gates.
- Public API performance baselines.

The package does not bundle administrative-region data. Applications supply a
dataset that satisfies the Region-Kit Dataset Contract. Dataset acquisition and
transformation remain separate responsibilities.

## Project resources

- [Documentation](./docs/README.md)
- [Package usage](./packages/core/README.md)
- [Known limitations](./docs/known-limitations.md)
- [Versioning and migrations](./docs/versioning-and-migrations.md)
- [Contributing](./CONTRIBUTING.md)
- [Security policy](./SECURITY.md)
- [License](./LICENSE)
