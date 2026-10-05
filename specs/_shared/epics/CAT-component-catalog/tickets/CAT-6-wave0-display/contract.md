---
id: CAT-6
size: medium
objective: "Product code can show values, statuses, identities and messages from the kit (label, badge, avatar, kbd, table, empty, bubble, marker, message, skeleton, progress, alert) and a spinner, each shadcn's Vega component on house tokens and storied per state; and a security fix younger than a week has one written way in."
slice_type: "Thirteen kit primitives and the age gate's exception; the risk is text or a fill below AA that the audit cannot see, or the gate quietly lowered."
non_negotiables:
  - "The age gate stays a week; its one exception is an exact name@x.y.z in npmPreapprovedPackages with a ledger line (EN-13), held by a test."
  - "Every component follows the kit path in component-sources.md, with no token-lint waiver."
  - "No text on a translucent foreground; relative oklch() colours become token tints."
  - "A track or boundary that shows a value's extent meets 3:1 against the page (WCAG 1.4.11)."
  - "Motion that only decorates stops under reduced motion."
  - "Each component's stories cover its variants and its states, with a play wherever it can be operated."
devs_call: "Story content and names."
cites:
  - "specs/_shared/epics/CAT-component-catalog/technical.md"
  - "D-CAT-1"
  - "D-CAT-2"
truth_files: "none: no living UX file covers the starter's kit"
reviewers: []
operator_review: false
planned_paths:
  - ".yarnrc.yml"
  - ".claude/rules/deps.md"
  - "tooling/age-gate.test.ts"
  - "docs/decisions/ledger.md"
  - "docs/decisions/changelog.md"
  - "packages/ui/src/primitives/display/**"
  - "packages/ui/src/primitives/feedback/**"
  - "packages/ui/package.json"
  - "packages/catalog/STATUS.md"
depends_on:
  - CAT-5
out_of_scope:
  - "Overlays and navigation (CAT-8); toast (CAT-9)."
criteria:
  - id: C1
    statement: "All thirteen are storied with source:shadcn, verdict:kit and layer:primitive, and STATUS.md is current."
    evidence: check
    command: "yarn check-catalog --ticket CAT-6"
  - id: C2
    statement: "The age gate is a week, and every pre-approved package is one exact version named in the ledger."
    evidence: test
    command: "yarn test:tooling"
  - id: C3
    statement: "Every new story passes its interactions and axe, with the kit's others."
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "The components pass the token lint with no waiver."
    evidence: check
    command: "yarn lint"
  - id: C5
    statement: "The kit keeps the house layout, with an exports entry per component."
    evidence: check
    command: "yarn check-ui-layout"
  - id: C6
    statement: "Every audited pair still passes AA."
    evidence: check
    command: "yarn contrast-audit"
  - id: C7
    statement: "The kit and both apps type-check."
    evidence: check
    command: "yarn check-types"
tier: 1
---

# Contract — CAT-6 wave0-display

## Build notes

- **Approach:** the hatch (EN-13) in `.yarnrc.yml`, `deps.md`, the ledger and a tooling test; then the kit path for each display component, kind `display` except the spinner (`feedback`), carrying CAT-5's review lessons.
- **Decisions that apply:** D-CAT-1 (CS-02, CS-05, CS-10 to CS-13); D-CAT-2; EN-13.
- **Interfaces:** subpaths `@pem/ui/label`, `badge`, `avatar`, `kbd`, `table`, `empty`, `bubble`, `marker`, `message`, `skeleton`, `progress`, `alert`, `spinner`.
- **Per path:** listed above.
- **Gotchas:** bubble's tinted variant uses relative `oklch(from var(--primary) …)` colours (map to a primary tint); alert's destructive description is `text-destructive/90` (solid); bubble has two cva calls; the progress track on `bg-muted` hides the bar's length (use `bg-input`); skeleton's pulse needs `motion-reduce:animate-none`.
- **Model:** any current model.
