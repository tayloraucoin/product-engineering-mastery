---
id: CAT-10
size: medium
objective: "Product code can pick dates (calendar), page through media (carousel), chart a figure (chart), offer menus (menubar), page through lists (pagination), and build a conversation (attachment, message scroller, questionnaire) from the kit."
slice_type: "Kit components on the kit path; the risk is a state or a contrast the jsdom run cannot see."
non_negotiables:
  - "Charts do not animate their values (A-14); their colours are the chart roles."
  - "Every component follows the kit path in component-sources.md (--view, copy-in mapping, house layout, cn from the package), with no token-lint waiver."
  - "No text on a translucent foreground the audit cannot see; any new tint under text is computed or audited."
  - "Each component's stories cover its variants and states, with a play wherever it can be operated (focus, open, select, keyboard)."
  - "Every new dependency is pinned exactly, at least a week old, with its tech-stack row and in the ui module."
devs_call: "Story content and names; kinds per the kind READMEs where the manifest leaves room."
cites:
  - "specs/_shared/epics/CAT-component-catalog/technical.md"
  - "D-CAT-1"
  - "D-CAT-2"
truth_files: "none: no living UX file covers the starter's kit"
reviewers: []
operator_review: false
planned_paths:
  - "packages/ui/src/primitives/**"
  - "packages/ui/package.json"
  - "packages/catalog/STATUS.md"
  - "yarn.lock"
  - "toolkit.json"
  - "docs/engineering/tech-stack.md"
depends_on:
  - CAT-9
out_of_scope:
  - "Date picker and data table (CAT-11)."
criteria:
  - id: C1
    statement: "Every entry of CAT-10 is storied (or link-only) with its source, verdict and layer tags and provenance, and STATUS.md is current."
    evidence: check
    command: "yarn check-catalog --ticket CAT-10"
  - id: C2
    statement: "Every new story passes its interactions and axe, with the kit's others."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "The new code passes the token lint and every package's lint with no waiver."
    evidence: check
    command: "yarn lint"
  - id: C4
    statement: "The kit keeps the house layout, with an exports entry per component."
    evidence: check
    command: "yarn check-ui-layout"
  - id: C5
    statement: "Every audited colour pair passes AA in light and dark."
    evidence: check
    command: "yarn contrast-audit"
  - id: C6
    statement: "The kit, the catalog and both apps type-check."
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "Every new dependency is listed in the ui module with its pin."
    evidence: check
    command: "yarn check-stack"
tier: 1
---

# Contract — CAT-10 wave1-b

## Build notes

- **Approach:** the kit path in `docs/design/component-sources.md` for each entry the manifest gives CAT-10.
- **Decisions that apply:** D-CAT-1 (CS-02, CS-04, CS-05, CS-10 to CS-16); D-CAT-2; EN-14.
- **Interfaces:** one `@pem/ui` subpath per component.
- **Per path:** as planned.
- **Gotchas:** the lessons of the CAT-5 and CAT-6 reviews: jsdom renders no colour (compute tints), Base UI focus guards are exempt from aria-hidden-focus, jsdom rejects Base UI's synthetic KeyboardEvent and PointerEvent in some parts (assert state instead), a role-less element takes no aria-label.
- **Model:** any current model.
