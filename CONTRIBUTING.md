# Contributing to region-kit

Thank you for considering a contribution to `region-kit`.

## Before you start

- Search existing issues before opening a new one.
- Use the bug or feature issue form when proposing a change.
- Keep changes focused on one problem or capability.
- Do not include production datasets, credentials, database dumps, or crawler
  output in the repository.

For security vulnerabilities, follow [SECURITY.md](./SECURITY.md) instead of
opening a public issue.

## Development setup

Requirements:

- Node.js 22 or newer.
- The exact pnpm version declared by `packageManager` in the root `package.json`.

Install dependencies from the repository root:

```bash
pnpm install
```

Run the local quality checks before submitting a pull request:

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm check:package
```

## Changesets

Add a changeset when a contribution changes package behaviour, public API,
compatibility, runtime dependencies, or consumer-visible performance:

```bash
pnpm changeset
```

A changeset is normally unnecessary for documentation-only changes, tests,
formatting, CI maintenance, or internal refactors with no observable behaviour
change. State why a changeset is unnecessary in the pull request.

## Documentation and tests

- Add or update behaviour tests for functional changes.
- Update documentation when changing public API, dataset contracts, error codes,
  defaults, compatibility, or storage contracts.
- Keep public examples executable and based on package exports rather than deep
  imports.

## Pull requests

- Use a concise Conventional Commit message, such as `fix: reject duplicate IDs`.
- Complete the pull request template.
- Ensure the branch is current enough for CI to evaluate it correctly.
- Resolve failed checks and review conversations before merge.
