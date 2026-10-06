# As-built — STK-22

## Shipped against the contract

- C1: `tooling/check-ui-layout.ts` exports `checkUiLayout(root)` and holds `TOP` and `KINDS`. `tooling/check-ui-layout.test.ts` has twelve cases over temp trees: a conforming tree passes, and a stray top-level folder, an unknown kind, a missing `<name>.tsx`, a missing `index.ts`, a `cva` import outside a `*.variants.ts` and a missing `exports` target each fail with one line naming the path. After the batch review the check also fails a primitive with a `copy.ts` or an import of another component, and a wildcard export; a case runs the command and asserts exit 1.
- C2: `@pem/ui` is re-slotted: `src/primitives/control/button/` (`button.tsx`, `button.variants.ts`, `index.ts`), `src/composed/control/theme-toggle/` (`theme-toggle.tsx`, `copy.ts`, `index.ts`) and `src/providers/theme/`; `lib/` and `styles/` are unchanged. `yarn check-ui-layout` passes, and it runs in `yarn verify` after `contrast-audit`.
- C3, C4, C5: the `exports` keys are unchanged and only their targets moved, so no import in either app changed. Types, lint (tokens included) and both builds pass.

## Deviations

- **devs_call, settled:** the theme constants stay in `providers/theme/themes.ts` beside the provider. The toggle's copy imports the `Theme` type from there, and `satisfies Record<Theme, string>` keeps the labels in step with the options.
- **Batch review fixes** (`_batch-review-2026-10-04.md`): the kinds are named only in the check, and `AGENTS.md` points to them; the docs name exactly what the check enforces; `hooks/` is DOM-bound only; `tooling/budget.ts`'s probe path moved, with the file added to `planned_paths`.
- **Docs beyond the code:** `packages/ui/AGENTS.md` (with a `CLAUDE.md` shim, so Claude Code loads it by path) holds the layout rule; `codebase-conventions.md` §4 points to it; ledger EN-11 and a changelog entry record the amendment.
- [ASSUMPTION] `THEME_TOGGLE_COPY` is not a public export, which keeps the contract's "no export changes". Synapse exports its copy objects; add the export when a consumer needs it.
- [ASSUMPTION] The kind list is the union of the two audited repos' common kinds plus `media`. Conscious Connections also has `brand`, `icons`, `auth` and `legal`, which are product-specific and are added when a product needs them.

## Not verified

- No capture criterion. The demo home was rendered in the browser pane after the move: the toggle reads its labels and `aria-label` from `copy.ts`, and selecting Dark sets `dark` on `<html>`, with no console errors. The docs app was built but not rendered.
- `docs/index.md`'s budget counts only apps' nested `AGENTS.md`; `packages/ui/AGENTS.md` (about 450 tokens) is smaller than `apps/web/AGENTS.md`, so the budget's figure for the heaviest file still holds.

## Next

STK-8 puts each story beside its component as `<name>.stories.tsx`, and can extend `check-ui-layout` for its story-coverage rule rather than adding a second walker.
