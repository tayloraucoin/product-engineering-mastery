# As-built — STK-22

## Shipped against the contract

- C1: `tooling/check-ui-layout.ts` exports `checkUiLayout(root)` and holds `TOP` and `KINDS`. `tooling/check-ui-layout.test.ts` has seven cases over temp trees: a conforming tree passes, and a stray top-level folder, an unknown kind, a missing `<name>.tsx`, a missing `index.ts`, a `cva()` in the component file and a missing `exports` target each fail with one line naming the path.
- C2: `@pem/ui` is re-slotted: `src/primitives/control/button/` (`button.tsx`, `button.variants.ts`, `index.ts`), `src/composed/control/theme-toggle/` (`theme-toggle.tsx`, `copy.ts`, `index.ts`) and `src/providers/theme/`; `lib/` and `styles/` are unchanged. `yarn check-ui-layout` passes, and it runs in `yarn verify` after `contrast-audit`.
- C3, C4, C5: the `exports` keys are unchanged and only their targets moved, so no import in either app changed. Types, lint (tokens included) and both builds pass.

## Deviations

- **devs_call, settled:** the theme constants stay in `providers/theme/themes.ts` beside the provider. The toggle's copy imports the `Theme` type from there, and `satisfies Record<Theme, string>` keeps the labels in step with the options.
- **Docs beyond the code:** `packages/ui/AGENTS.md` (with a `CLAUDE.md` shim, so Claude Code loads it by path) holds the layout rule; `codebase-conventions.md` §4 points to it; ledger EN-11 and a changelog entry record the amendment.
- [ASSUMPTION] `THEME_TOGGLE_COPY` is not a public export, which keeps the contract's "no export changes". Synapse exports its copy objects; add the export when a consumer needs it.
- [ASSUMPTION] The kind list is the union of the two audited repos' common kinds plus `media`. Conscious Connections also has `brand`, `icons`, `auth` and `legal`, which are product-specific and are added when a product needs them.

## Not verified

- No capture: the button and toggle class strings moved byte for byte, and both apps build. Nobody looked at a rendered page after the move.
- `docs/index.md`'s budget counts only apps' nested `AGENTS.md`; `packages/ui/AGENTS.md` (about 450 tokens) is smaller than `apps/web/AGENTS.md`, so the budget's figure for the heaviest file still holds.

## Next

STK-8 puts each story beside its component as `<name>.stories.tsx`, and can extend `check-ui-layout` for its story-coverage rule rather than adding a second walker.
