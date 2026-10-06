---
size: medium
objective: "Every highlighted, current and selected item in the kit is visible by more than a faint fill, and chart colours are audited, so a person can always see where they are and what they chose."
slice_type: "Design-token and marker work across the kit; the risk is a fill that passes the eye in one theme and not the other."
non_negotiables:
  - "A menu or listbox's highlighted item meets 3:1 against --popover, or carries a non-fill cue (C-P07); the new pair is in the contrast audit."
  - "Selection and current-ness use bg-selected plus a marker that is not fill alone: sidebar active item (also on the icon rail), navigation-menu current link, pagination current page, calendar range middle and today."
  - "chart-1 to chart-5 are audited as non-text on --background and --card in both themes, and retuned until they pass."
  - "The carousel jumps (no smooth scroll) from keys and under reduced motion, and names each slide 'N of M'."
  - "No token-lint waiver; every new tint under text is computed or audited."
devs_call: "The exact marker per component, within the canon's options."
cites:
  - "specs/_shared/epics/CAT-component-catalog/technical.md"
  - "D-CAT-1"
  - "D-CAT-2"
truth_files: "none: no living UX file covers the starter's kit"
reviewers: []
operator_review: true
planned_paths:
  - "packages/config/tailwind/preset.css"
  - "tooling/contrast-audit.ts"
  - "tooling/contrast-audit.test.ts"
  - "packages/ui/src/primitives/**"
  - "packages/ui/src/composed/**"
  - "packages/catalog/src/shadcn/**"
  - "docs/decisions/ledger.md"
  - "docs/decisions/changelog.md"
depends_on:
  - CAT-11
out_of_scope:
  - "The brand's own colours (P-K)."
criteria:
  - id: C1
    statement: "Every audited pair, including the new highlight, sidebar and chart pairs, passes in light and dark."
    evidence: check
    command: "yarn contrast-audit"
  - id: C2
    statement: "Stories show each highlighted, current and selected state, with plays asserting aria-current, aria-selected or aria-pressed and axe passing."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "No token-lint waiver."
    evidence: check
    command: "yarn lint"
  - id: C4
    statement: "The kit, the catalog and both apps type-check."
    evidence: check
    command: "yarn check-types"
id: CAT-14
qa: Q1
---

# Contract — state contrast and markers

## Build notes

- **Approach:** the items the CAT-7 to CAT-11 and CAT-12 reviews routed to design (`_batch-review-2026-10-04-CAT-7-11.md` S4 to S8, S12, S16, S17 and S19; `_batch-review-2026-10-04-CAT-12.md` N6 and N7).
  - A highlight role (or a non-fill cue) for menus, command and combobox.
  - `bg-selected` plus a marker for the current and selected items.
  - Chart roles audited and retuned.
  - Carousel jumps and slide names.
  - The message scroller's `scrollbar-*` utilities, made real or replaced.
  - The pairs the blocks introduced, added to the audit.
  - The sidebar's and headers' `ease-linear` on a motion token.
- **Decisions that apply:** CS-11 to CS-16; a ruling for the highlight role goes in the ledger (plan mode).
- **Nits to sweep with it:**
  - toggle-group's `data-[state=on]`;
  - the navigation menu's malformed `data-activation-direction` variants and no-op `easing-[ease]`;
  - `tabular-nums` on table amounts (C-P10).
- **Model:** any current model.
