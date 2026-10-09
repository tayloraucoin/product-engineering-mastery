---
size: small
objective: "Every demo control reads its state at a glance: a selected segment sits clearly above rest, controls of one kind share one rest look and one value size, and an outline button has a visible edge in light."
slice_type: "A sweep of control states; the risk is drifting from the locked canvas instead of logging a coverage gap, or a kit change made for one product."
non_negotiables:
  - "A change the locked canvas disagrees with is logged in apps/web/docs/design/coverage-gaps.md first (D-DEMO-16)."
  - "Kit-level fixes (date-picker rest border, outline edge, native-select value size) go to @pem/ui as their own ticket."
devs_call: "Which fixes are demo call sites and which are kit tickets."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/overview.md"
truth_files: "none: no behaviour changes"
qa: Q1
reviewers: []
operator_review: false
planned_paths:
  - "apps/web/app/demo/**"
depends_on:
  - DEMO-17
out_of_scope:
  - "Motion and focus rings: tk-motion's review and the e2e journeys."
criteria:
  - id: C1
    statement: "On fresh captures the critic raises none of the findings listed in Build notes."
    evidence: capture
    path: "evidence/critic.md"
id: DEMO-21
---

# Contract — control states read at a glance

## Build notes

- **Found by:** DEMO-17, rounds 1 and 2.
  - Selected segment marked only by a faint fill: record-detail Current/Compare (`terms-section.tsx:109`), settings Theme toggle-group (C-R09, C-R10).
  - Settings shows the theme twice in two orders, "Light, Dark, System" and "System, Light, Dark" (C-R13 / A-17).
  - Dark unselected radio rings faint on the near-black page; measure (C-R09).
  - record-form: the date picker's rest border and fill differ from the inputs (C-R09, C-R07); at 390 selects and the date picker show values at 14px beside 16px inputs (C-R04).
  - Outline button edge nearly invisible in light: record-detail not-found "Back to records", records-table `error` New record (C-R05).
  - record-form `submitting`: Annual value keeps a rest-strength border while its siblings dim; it carries the same `inputDim` class, so the cause is not yet traced (C-R10).
  - record-form `submitting` light: dimmed helpers and values may fall below 4.5:1; measure, or rule the inactive form exempt (C-R09, round 2).
- **Model:** minimum and recommended Opus 5.5 at medium (ledger PR-22). Choosing down tends to fix the visible states and leave the untraced `submitting` border, or to settle by eye a contrast the ticket asks to measure.
