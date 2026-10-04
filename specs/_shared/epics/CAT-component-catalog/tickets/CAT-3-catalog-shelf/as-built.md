# As-built — CAT-3

## Shipped against the contract

- C1: `catalog` is a boundaries element importing `config` and `ui`; no package lists it and apps are kept off it (`NOT_FOR_APPS`). Probes: `apps/web` and `packages/ui` importing `@pem/catalog/manifest` fail; the catalog importing `@pem/ui/button` passes.
- C2: `tooling/check-catalog.ts` derives planned, present, storied and link-only from the tree; seven tests on synthetic trees cover each state, a missing story failing its ticket, a planned entry and an empty ticket, a wrong title, tag or provenance, an orphan story, a stale STATUS.md and four kinds of malformed entry.
- C3: the button and theme toggle (kit, `source:custom`, `verdict:kit`) and the copy button (catalog, `verdict:unruled`) are storied; `packages/catalog/STATUS.md` is generated and current.
- C4: the workshop and `yarn test` glob `packages/catalog/src/**/*.stories.tsx`; the copy button's four stories (idle, copied, failed, a caller's own words) run with their play and axe checks.
- C5: `toolkit.json` has a `catalog` module (`locked: false`), `docs/runbooks/remove-catalog.md` lists every file, dependency and boundary entry to remove, and `new-project.md` step 4 lists it.
- C6: the sidebar filter lists the tags with counts and narrows to `verdict:unruled`; the Provenance panel shows source, verdict, layer, upstream, licence and adaptation (evidence `C6-workshop.md`, two screenshots).

## Deviations

- **Provenance is a manager panel, not a canvas strip** (D-CAT-6 amended in technical.md): axe and layout see only the component, and the workshop needs no import of the catalog.
- **The workshop reaches the catalog by glob only;** `ui-workshop` gained no `catalog` edge: `@pem/ui` depending on `@pem/catalog` would cycle with the catalog's own dependency on `@pem/ui` (D-CAT-4 amended).
- **A CAT-2 defect fixed here:** the root boundaries pass did not load the `pem-tokens` plugin, so the OG image's waiver comment broke `yarn lint:boundaries`. `tokens.js` now exports `tokensPlugin` and `eslint.config.mjs` loads it without running it. Found by the STK-12 thread.
- **Verdict tags are `kit`, `after-edits`, `shelf`, `mine`, `unruled`:** `kit` for every `@pem/ui` entry, else the source's verdict, so "what may a product use as is" is one filter.
- `[ASSUMPTION]` The proof item is the copy button lifted from taylor-aucoin (survey rank 25): small, a real live-region job, and on the house Button with no new dependency.
- Paths added before editing: `.prettierignore` (STATUS.md is generated), `eslint.config.mjs`, `packages/config/eslint/tokens.js`.

## Not verified

- The workshop in dark mode and at a narrow width; the panel inherits Storybook's theme.

## Next

CAT-4 sets up shadcn on the Base track (components.json, the pinned CLI and Base UI) and enters every shadcn component in the manifest as planned.
