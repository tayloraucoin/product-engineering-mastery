---
id: STK-23
size: small
objective: "An agent adding a @pem/ui component finds every kind folder already there, each saying what belongs in it, and a step-by-step in packages/ui/AGENTS.md."
slice_type: "Package conventions; the risk is a component filed by guess because the kinds exist only as a list in a check."
non_negotiables:
  - "Every kind has a folder under both primitives/ and composed/, each holding a README.md that states what belongs there, with examples from the audited repos."
  - "packages/ui/AGENTS.md has a kinds table (what a person does with it, examples per layer, tie-breaks) and numbered steps for adding a component."
  - "yarn check-ui-layout fails when a kind folder or its README.md is missing, or when the AGENTS.md table's kinds differ from KINDS."
  - "A README.md in a kind folder is not read as a component by the layout check or the story-coverage check."
devs_call: "The README wording and which reference components to cite as examples."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-1"
  - "D-STK-2"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers: []
planned_paths:
  - "packages/ui/src/primitives/*/README.md"
  - "packages/ui/src/composed/*/README.md"
  - "packages/ui/AGENTS.md"
  - "tooling/check-ui-layout.ts"
  - "tooling/check-ui-layout.test.ts"
  - "tooling/budget.ts"
  - "docs/decisions/changelog.md"
depends_on:
  - STK-22
out_of_scope:
  - "New components."
  - "Story coverage rules (STK-8 owns .storybook/story-coverage.ts)."
criteria:
  - id: C1
    statement: "The layout check fails, naming the path, on a missing kind folder, a kind folder without README.md, and an AGENTS.md kinds table that differs from KINDS; a README.md in a kind folder passes."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "@pem/ui's own tree passes the layout check with every kind folder and README in place."
    evidence: check
    command: "yarn check-ui-layout"
  - id: C3
    statement: "The story checks still pass with the README files in the kind folders."
    evidence: test
    command: "yarn test"
qa: Q1
---

# Contract — STK-23 ui-kind-guide

## Build notes

- **Approach:** STK-22 moved the components and named the kinds only in `KINDS`, so the kind folders don't exist until a component lands, and nothing says what each kind holds. Follow rule 9's README-seam convention (`packages/hooks/README.md` is the model): each kind folder exists from day one with a README that states its convention.
- **Decisions that apply:** D-STK-2 (conventions rule 9): "a seam ships with a default consumer or a README that states its convention".
- **Interfaces:** none exported. `checkUiLayout(root)` gains three problem classes; it reads `<root>/AGENTS.md`'s kinds table (rows of the form ``| `kind` |``).
- **Per path:**
  - `packages/ui/src/{primitives,composed}/<kind>/README.md` (14 files): what belongs in this kind at this layer, examples, and the nearest kind it is confused with.
  - `packages/ui/AGENTS.md`: a Kinds section (table plus tie-breaks) and an "Adding a component" section.
  - `tooling/check-ui-layout.ts`, `.test.ts`: the three new problem classes, and README.md allowed in a kind folder.
  - `tooling/budget.ts`: nested `AGENTS.md` in `packages/` counts toward the path-rules line, as `docs/index.md` says it loads (review N14).
  - `docs/decisions/changelog.md`: one entry.
- **Gotchas:** STK-8's `story-coverage.ts` walks only directories, so READMEs are invisible to it; C3 proves that. Kind examples come from Synapse `@syn/ui` and Conscious Connections, where they disagree (empty state, card), the table names the pick.
- **Model:** any current model.
