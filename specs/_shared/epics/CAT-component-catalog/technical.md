---
epic: CAT
status: approved
---

# CAT — technical notes

> Written in the Plumb thread of 2026-10-04, with the placement checked as Mason would (plan approved by Taylor the same day). Facts verified that day: shadcn-ui/ui at `295a1f1`, Base track 62 component files in three dependency waves (43, 17, 3) plus 3 recipes and 27 blocks; the source uses `cn-*` style placeholders the CLI resolves per style; `ui.shadcn.com` answers under a per-command network approval; Storybook 10.6.1's sidebar filters on story tags (`TagOptions.defaultFilterSelection`).

## Appetite verdict

Possible: the kit in about ten small tickets, then the catalog one source or one kind of custom lift per ticket.

## Decisions

- **D-CAT-1 Rulings.** CS-01 to CS-10 in the ledger (CAT-1): source verdicts per the research; Base UI the single primitive base; Vega the house style; Toast, not sonner; `cn` rewritten to `@pem/ui/cn`; `shadcn/tailwind.css` ejected; two shelves; registry access; catalogue by job; lucide-react for icons. The form library is chosen by the first ticket that needs one.
- **D-CAT-2 The kit.** `@pem/ui` takes shadcn core on the Base track in the Vega style, in the house layout (EN-11): the CLI writes to `src/_shadcn/`, the builder moves each file to `primitives/<kind>/<name>/` (or `composed/` for the recipes), splits the `cva()` into `<name>.variants.ts`, rewrites `cn`, writes one story per state, adds the `exports` entry and the kind README example. Nothing stays in `_shadcn/`.
- **D-CAT-3 The shelf.** `packages/catalog` (`@pem/catalog`, private): `src/<source>/<kind>/<name>/` with `<name>.tsx` and `<name>.stories.tsx`; third-party folders keep the upstream `LICENSE`. Copy-in maps to house tokens and the token lint stays on; an item needing more than a mechanical rename is a link-only manifest entry with its reason.
- **D-CAT-4 Boundary.** A `catalog` element in `boundaries.js` imports `config` and `ui`; nothing lists `catalog`, so no app or package can import it. The workshop reaches catalog stories by a stories glob, never an import: `@pem/ui` taking `@pem/catalog` as a dependency would cycle with the catalog's own on `@pem/ui` (CAT-3).
- **D-CAT-5 One workshop.** `packages/ui/.storybook/main.ts` globs `../../catalog/src/**/*.stories.tsx` beside its own, so the preview, toolbar, brand font and axe tests serve both. Catalog titles: `Catalog/<Kind>/<Name>/<Source>`.
- **D-CAT-6 The toggle.** Every story carries `source:<id>`, `verdict:<kit | after-edits | shelf | mine | unruled>` (kit for every `@pem/ui` entry, else the source's) and `layer:<primitive | composed | block>` tags, as literals in each story's meta, which Storybook's sidebar filter lists; check-catalog holds them and the provenance licence to the manifest. `parameters.provenance` (upstream, licence, adapted) shows in a Provenance panel beside Controls, with the story's tags; a panel rather than a canvas strip, so axe and layout see only the component (CAT-3).
- **D-CAT-7 Check-off.** `packages/catalog/manifest.json` lists every planned entry (id, name, source, track, target, layer, kind, wave, ticket, upstream, licence, verdict). `yarn check-catalog [--ticket CAT-n]` derives each state (planned, present, storied) from the tree, fails when a named ticket's entries are not storied or when story tags disagree with the manifest, and writes `packages/catalog/STATUS.md`, failing when it is stale. Passing tests stay `yarn test`'s job.
- **D-CAT-8 Removal.** `toolkit.json`'s `stack` block gains a `catalog` module (D-STK-13): the package, the glob line, the check and its script.
- **D-CAT-9 UX level waived** for this epic, as D-STK-15 did; tickets cite this file.

## One-way doors

| Door                     | Path glob                                                     | Record or ratification                       | Reviewer     |
| ------------------------ | ------------------------------------------------------------- | -------------------------------------------- | ------------ |
| New package boundary     | `packages/config/eslint/boundaries.js`, `packages/catalog/**` | REC 0011, plan approved by Taylor 2026-10-04 | batch review |
| Primitive base (Base UI) | `packages/ui/**`                                              | CS-02, Taylor 2026-10-04                     | batch review |

## Calls routed to Taylor

None open. The form library is a call for the first form ticket, with a recommendation then.

## Test shape per risk

Tooling (`check-catalog`, the roles test) gets unit tests under `tooling/`. Components get a story per state; `yarn test` runs axe and `play` per story. The boundary gets a probe in `yarn test:boundaries`.

## Ticket order

CAT-1 rulings and filing; CAT-2 the missing colour roles; CAT-3 the shelf and the check; CAT-4 the shadcn setup and the full manifest; CAT-5 to CAT-8 wave 0 by kind group; CAT-9 and CAT-10 wave 1; CAT-11 wave 2 and the recipes; CAT-12 the blocks; then custom lifts in the research note's rank order, tablecn, Dice UI, and the unruled sources by job.

## Rabbit holes

- Placeholder classes: never copy from GitHub source; only the CLI's resolved `base-vega` output.
- The registry's `form` item is skipped until the form library is chosen; `sonner` is skipped (CS-04).
- CSS injection: every `add` runs `--dry-run` first; `cssVars`, `css` and `font` payloads are rejected or mapped by hand into the preset (CS-08).
- The yarn age gate is never skipped; a dependency too new waits.
