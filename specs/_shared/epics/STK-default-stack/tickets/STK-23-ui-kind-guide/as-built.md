# As-built — STK-23

## Shipped against the contract

- C1: `checkUiLayout` gains three problem classes: a kind without its folder in a layer, a kind folder without `README.md`, and an `AGENTS.md` kinds table that differs from `KINDS` (it names the missing and the extra kinds). A `README.md` inside a kind folder is skipped as a component. The fixture tree carries every kind README and a table built from `KINDS`; sixteen cases in all.
- C2: fourteen READMEs, one per kind under `primitives/` and `composed/`, each with the kind's test, its scope at that layer, examples tagged by repo (Synapse, Conscious Connections), and where the line falls with its neighbours. Every tagged example was checked against the two repos' trees. `packages/ui/AGENTS.md` has the kinds table, the tie-breaks and "Adding a component" in six steps. `yarn check-ui-layout` passes.
- C3: STK-8's `story-coverage.ts` walks only directories, so the READMEs are not read as components; `yarn test` passes with them in place.

## Deviations

- **STK-22's non-negotiable 2 ("kinds named once, in the check") is superseded:** the kinds are also folders and the `AGENTS.md` table, which the check holds equal to `KINDS`.
- **The primitive rule is relaxed** (batch review S5): a primitive may import another primitive and never a composed component; stories are exempt. STK-22's "imports no other component" would have failed most reference primitives on port (a dialog imports the button, an input its label), and neither repo has a non-story primitive importing a composed one.
- **Batch review fixes** (`_batch-review-2026-10-04-STK-23.md`): the tie-breaks agree with the examples and both repos (overlays split into feedback and sliding panels into layout; data rows are display even when they link; the bare card is layout, a data card display; the bare empty slot is display, a composed empty state feedback; text that formats a value is display). Examples not in either repo were removed; `image-cropper` is control, as in Synapse.
- **`packages/ui/AGENTS.md` was cut to about 810 tokens,** with the per-kind examples left to the READMEs, after `tooling/budget.ts` began counting nested `AGENTS.md` in `packages/` (it counted only apps'). The path-rules line is 1,456 of 1,500.
- devs_call, settled: the picks where the repos disagree are named in the READMEs and the tie-breaks.

## Test changes

- The case "a README.md in a kind folder is not read as a component" was replaced: it repeated the conforming-tree case exactly (review N13). The new case proves a primitive may import another primitive and a story may import a composed component.
- "a primitive importing another component fails" became "a primitive importing a composed component fails", following the relaxed rule; it still imports from `composed/` and still fails.

## Not verified

- Whether an agent with only `packages/ui/AGENTS.md` and a kind README files a new component in the intended folder; no trial was run.

## Next

The first component of each kind lands beside its README and adds itself to the examples (step 5).
