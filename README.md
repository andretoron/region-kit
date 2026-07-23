# region-kit

A framework-agnostic Node.js library for querying and navigating administrative
region datasets.

The project is currently under active development.

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

The project has not reached its first MVP release. Package hardening, external
consumer verification, coverage gates, and release documentation remain in
later milestones.

## Project resources

- [Documentation](./docs/README.md)
- [Contributing](./CONTRIBUTING.md)
- [Security policy](./SECURITY.md)
- [License](./LICENSE)
