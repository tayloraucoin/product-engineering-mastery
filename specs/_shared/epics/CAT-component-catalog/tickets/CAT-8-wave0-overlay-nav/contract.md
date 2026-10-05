---
id: CAT-8
size: medium
objective: "Product code can open popovers, tooltips, hover cards, dropdown and context menus, and navigate with a navigation menu and breadcrumbs from the kit, and set reading direction with a provider."
slice_type: "Kit components on the kit path; the risk is a state or a contrast the jsdom run cannot see."
non_negotiables:
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
  - "packages/ui/src/primitives/feedback/**"
  - "packages/ui/src/primitives/navigation/**"
  - "packages/ui/src/providers/direction/**"
  - "packages/ui/package.json"
  - "packages/catalog/STATUS.md"
depends_on:
  - CAT-7
out_of_scope:
  - "Dialogs, sheets and toast (CAT-9)."
criteria:
  - id: C1
    statement: "Every entry of CAT-8 is storied (or link-only) with its source, verdict and layer tags and provenance, and STATUS.md is current."
    evidence: check
    command: "yarn check-catalog --ticket CAT-8"
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
tier: 1
---

# Contract — CAT-8 wave0-overlay-nav

## Build notes

- **Approach:** the kit path in `docs/design/component-sources.md` for each entry the manifest gives CAT-8.
- **Decisions that apply:** D-CAT-1 (CS-02, CS-04, CS-05, CS-10 to CS-16); D-CAT-2; EN-14.
- **Interfaces:** one `@pem/ui` subpath per component.
- **Per path:** as planned.
- **Gotchas:** the lessons of the CAT-5 and CAT-6 reviews: jsdom renders no colour (compute tints), Base UI focus guards are exempt from aria-hidden-focus, jsdom rejects Base UI's synthetic KeyboardEvent and PointerEvent in some parts (assert state instead), a role-less element takes no aria-label.
- **Model:** any current model.
