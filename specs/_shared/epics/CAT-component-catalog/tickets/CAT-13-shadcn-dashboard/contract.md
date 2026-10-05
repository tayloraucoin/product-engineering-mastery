---
size: medium
objective: "The catalog holds shadcn's dashboard-01 block, so a new project can start its admin home from it."
slice_type: "One large block (11 files) with new dependencies; the risk is drag-and-drop accessibility and a second toast vendor."
non_negotiables:
  - "The block lives in packages/catalog/src/shadcn/display/dashboard-01/ under shadcn's MIT LICENSE and imports the kit through @pem/ui subpaths only."
  - "Toasts use the kit's toast (CS-04), never sonner."
  - "Row reordering by drag has a keyboard path, as dnd-kit's sensors allow, proven by a story."
  - "Every new dependency (@dnd-kit/core, modifiers, sortable, utilities; zod and @tanstack/react-table for the catalog, at the repo's existing pins) is pinned exactly, at least a week old, with its tech-stack row and in the catalog module."
  - "No text on a translucent foreground the audit cannot see; no token-lint waiver; the chart's values do not animate (A-14)."
devs_call: "Story content and names."
cites:
  - "specs/_shared/epics/CAT-component-catalog/technical.md"
  - "D-CAT-1"
  - "D-CAT-2"
truth_files: "none: no living UX file covers the starter's kit"
reviewers: []
operator_review: false
planned_paths:
  - "packages/catalog/src/shadcn/**"
  - "packages/catalog/manifest.json"
  - "packages/catalog/package.json"
  - "packages/catalog/STATUS.md"
  - "yarn.lock"
  - "toolkit.json"
  - "docs/engineering/tech-stack.md"
depends_on:
  - CAT-12
out_of_scope:
  - "Promoting any of its parts into the kit."
criteria:
  - id: C1
    statement: "dashboard-01 is storied with its source, verdict and layer tags and provenance, and is no longer link-only; STATUS.md is current."
    evidence: check
    command: "yarn check-catalog --ticket CAT-13"
  - id: C2
    statement: "Its stories pass interactions and axe, including keyboard row reordering, with the kit's others."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "The new code passes the token lint and every package's lint with no waiver."
    evidence: check
    command: "yarn lint"
  - id: C4
    statement: "Every audited colour pair passes AA in light and dark."
    evidence: check
    command: "yarn contrast-audit"
  - id: C5
    statement: "The kit, the catalog and both apps type-check."
    evidence: check
    command: "yarn check-types"
  - id: C6
    statement: "Every new dependency is in the stack manifest with its pin."
    evidence: check
    command: "yarn check-stack"
id: CAT-13
---

# Contract — shadcn dashboard block

## Build notes

- **Approach:** CAT-12's block path for `dashboard-01` (the registry JSON at ui.shadcn.com/r/styles/base-vega/dashboard-01.json): imports to `@pem/ui` subpaths, icons to lucide, the copy-in mapping, then a story. Swap sonner's `toast()` for the kit's toast manager.
- **Decisions that apply:** D-CAT-1 (CS-01, CS-04, CS-05, CS-10 to CS-16); D-CAT-2; EN-14.
- **Gotchas:** dnd-kit's pointer sensors do not run in jsdom; prove reordering through the keyboard sensor or assert state. The block's data table duplicates the kit's composed data table; keep it as upstream, since the catalog is a shelf.
- **Model:** any current model.
