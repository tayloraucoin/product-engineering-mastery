---
title: "Remove the catalog — a removal runbook"
description: "Follow from step 4 of new-project/README.md once the product has copied the components it keeps; delete the shelf, its check and its workshop wiring, then prove it gone with yarn check-stack."
layer: runbooks
status: draft
thread: CAT
role: Usher
date: 2026-10-04
last_reviewed: 2026-10-04
supersedes:
load_when:
---

# Remove the catalog

> **Module:** `@pem/catalog`, the shelf beside the kit (CS-07, record 0011): shadcn blocks, ecosystem items, custom lifts and alternate tracks, shown in the workshop and imported by nothing.
> **Built by:** CAT-3; its items arrive ticket by ticket in the CAT epic.
> **Run from:** step 4 of [`new-project/README.md`](../new-project/README.md), after the product has copied what it keeps into its own code or into `@pem/ui`. Nothing outside the workshop imports the catalog, so removing it changes no app. The manifest is also the kit's check-off: once the catalog is gone, the kit's components are tracked by their stories alone, and step 7 of `docs/design/component-sources.md` no longer applies.

## Files to delete

- `packages/catalog/` (the manifest, `STATUS.md`, every item)
- `tooling/check-catalog.ts`, `tooling/check-catalog.test.ts`

## Files to edit

- `packages/ui/.storybook/main.ts`: drop `"../../catalog/src/**/*.stories.tsx"` from `stories`.
- `packages/ui/.storybook/preview.css`: drop the `@source "../../catalog/src";` line and its comment.
- `packages/ui/.storybook/stories.test.ts`: drop the catalog glob from `import.meta.glob`.
- `package.json`: drop the `check-catalog` script and `yarn check-catalog &&` from `verify`.
- `.prettierignore`: drop `packages/catalog/STATUS.md`.
- `docs/engineering/codebase-conventions.md`: drop the `@pem/catalog` row of the package table.

The kit's stories keep their `source:`, `verdict:` and `layer:` tags and their provenance: the sidebar filter and the Provenance panel still serve the kit.

## Variables

None.

## Dependencies

- `@pem/catalog` (a workspace; it disappears with its folder). Run `yarn install` after deleting it.

## Boundaries entries

In `packages/config/eslint/boundaries.js`: the `catalog` element in `ELEMENTS`, its row in `PACKAGE_IMPORTS`, and `"catalog"` in `NOT_FOR_APPS`; the two catalog probes and the catalog line under `ALLOWED` in `tooling/boundaries.test.ts`.

## Vendor-side steps

None.

## Verify

1. In `toolkit.json`, set `"removed": true` on the `catalog` entry of `stack`.
2. `yarn check-stack` exits 0: no listed file or dependency of the module is left.
3. `yarn verify` exits 0.
