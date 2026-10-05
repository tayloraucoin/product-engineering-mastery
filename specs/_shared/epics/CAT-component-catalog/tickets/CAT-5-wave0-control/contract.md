---
id: CAT-5
size: medium
objective: "Product code can build any form control from the kit: input, textarea, checkbox, radio group, switch, slider, select, native select, toggle, one-time code and tabs, each shadcn's Vega component on Base UI and house tokens, storied per state; and no install can take a release younger than a week."
slice_type: "Eleven kit primitives, one dependency and the install age gate; the risk is a control whose boundary or label is below AA, or a release taken before the community has seen it."
non_negotiables:
  - ".yarnrc.yml sets npmMinimalAgeGate to a week, as deps.md says; a version younger is quarantined."
  - "Every component follows the kit path in component-sources.md: --view source, house layout, cn from the package, tokens by the copy-in mapping, no token-lint waiver."
  - "A control's boundary (--input) meets 3:1 on the background in both themes (WCAG 1.4.11), audited by contrast-audit."
  - "No label sits on a translucent foreground the audit cannot measure; inactive tab labels use muted-foreground."
  - "input-otp is pinned exactly, at least a week old, with its tech-stack row and in the ui module's dependencies."
  - "Each component's stories cover its variants and its states: default, focused, disabled, invalid, and checked or selected where it has them."
devs_call: "Story names and the order of exports."
cites:
  - "specs/_shared/epics/CAT-component-catalog/technical.md"
  - "D-CAT-1"
  - "D-CAT-2"
truth_files: "none: no living UX file covers the starter's kit"
reviewers: []
operator_review: false
planned_paths:
  - ".yarnrc.yml"
  - "packages/config/tailwind/preset.css"
  - "tooling/contrast-audit.ts"
  - "tooling/contrast-audit.test.ts"
  - "packages/ui/src/primitives/control/**"
  - "packages/ui/package.json"
  - "packages/ui/.storybook/vitest.config.ts"
  - "packages/ui/.storybook/vitest.setup.ts"
  - "packages/ui/.storybook/preview.tsx"
  - "yarn.lock"
  - "toolkit.json"
  - "docs/engineering/tech-stack.md"
  - "packages/catalog/STATUS.md"
depends_on:
  - CAT-4
out_of_scope:
  - "Field, input group and the form library (CAT-9); combobox (CAT-11)."
criteria:
  - id: C1
    statement: "All eleven controls are storied with source:shadcn, verdict:kit and layer:primitive, and STATUS.md is current."
    evidence: check
    command: "yarn check-catalog --ticket CAT-5"
  - id: C2
    statement: "Every control's stories pass their interactions and axe, with the kit's other stories."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "The controls pass the token lint with no waiver."
    evidence: check
    command: "yarn lint"
  - id: C4
    statement: "The kit keeps the house layout: one folder per control under primitives/control, each with its exports entry."
    evidence: check
    command: "yarn check-ui-layout"
  - id: C5
    statement: "A control's boundary meets 3:1 on the background in light and dark, and every other pair still passes AA."
    evidence: check
    command: "yarn contrast-audit"
  - id: C6
    statement: "The kit and both apps type-check with the new controls."
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "input-otp is a listed dependency of the ui module with its pin."
    evidence: check
    command: "yarn check-stack"
qa: Q1
---

# Contract — CAT-5 wave0-control

## Build notes

- **Approach:** set the age gate; for each control, take `yarn shadcn add <name> --dry-run --view`, write `primitives/control/<name>/` (`<name>.tsx`, `<name>.variants.ts` for a cva, `index.ts`, `<name>.stories.tsx`), map by the copy-in table, add the `exports` entry and the control README example; pin `input-otp`.
- **Decisions that apply:** D-CAT-1 (CS-02 Base UI, CS-05 cn, CS-10 lucide, CS-11 elevation `shadow-resting|raised|overlay|modal`, CS-12 motion, CS-13 lint); D-CAT-2 (the kit path).
- **Interfaces:** subpaths `@pem/ui/input`, `textarea`, `checkbox`, `radio-group`, `switch`, `slider`, `select`, `native-select`, `toggle`, `input-otp`, `tabs`.
- **Per path:** listed above.
- **Gotchas:** input-otp keeps a stray `cn-input-otp` placeholder class (drop it); its caret's `duration-1000` does nothing (tw-animate's caret-blink runs 1.25s), so it goes; native select's `bg-[Canvas] text-[CanvasText]` become the popover roles; `bg-white` on the slider thumb becomes `bg-background`; the switch's px sizes become spacing steps.
- **Model:** any current model.
