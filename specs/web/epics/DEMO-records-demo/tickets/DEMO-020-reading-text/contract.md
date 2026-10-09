---
size: small
objective: "The demo's reading text (dialog bodies, notice and empty-state copy, the subtitle, the form's Terms) meets the rubric's 16px floor, or the design layer rules which text is control text at 14px."
slice_type: "A type ruling then a sweep; the risk is resizing control labels that are rightly 14px, or changing the kit for one product."
non_negotiables:
  - "Plumb rules first, in apps/web/docs/design/DESIGN.md: which roles are reading text (16px) and which are control text (14px)."
  - "The kit's text-sm on AlertDialogDescription and AlertDescription changes only through a @pem/ui ticket; the demo overrides at its call sites until then."
devs_call: "Call-site overrides or a kit change, after the ruling."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/overview.md"
truth_files: "none: the UX files already ask for base-size reading text"
qa: Q1
reviewers: []
operator_review: false
planned_paths:
  - "apps/web/docs/design/DESIGN.md"
  - "apps/web/app/demo/**"
depends_on:
  - DEMO-17
out_of_scope:
  - "Control labels, badges and table cells."
criteria:
  - id: C1
    statement: "The critic raises no C-R04 reading-text finding on any surface, on fresh captures."
    evidence: capture
    path: "evidence/critic.md"
id: DEMO-20
---

# Contract — reading text at the floor

## Build notes

- **Found by:** DEMO-17, rounds 1 and 2: delete-dialog body and notice (`confirm-dialog.tsx:101`, kit `AlertDialogDescription`), records-table subtitle, alert and empty copy, record-form Terms at 834 and 1440, record-detail empty and not-found copy, all about 14px by eye against the rubric's 16px.
- record-detail `empty` uses five type sizes (about 24, 18, 16, 14 and 12px) against the cap of four (C-R04, round 2).
- **Model:** minimum and recommended Opus 5.5 at medium (ledger PR-22). Choosing down tends to raise each size in place instead of through the type tokens, which breaks the four-size cap on another surface.
