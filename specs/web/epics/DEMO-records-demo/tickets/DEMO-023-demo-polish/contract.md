---
size: small
objective: "The critic's remaining Consider and Should-fix polish on the demo surfaces is fixed or ruled, so a round shows only what the design layer accepts."
slice_type: "A polish sweep across surfaces; the risk is fixing beyond what a finding asks."
non_negotiables:
  - "Each item is fixed in its owning surface's files, or logged as a coverage gap when the locked canvas draws it (D-DEMO-16)."
devs_call: "Order, and which items are ruled instead of fixed."
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
  - "Reading text, control states and skeletons: their own follow-ups."
criteria:
  - id: C1
    statement: "On fresh captures the critic raises none of the findings listed in Build notes, or each is answered by a coverage-gap line."
    evidence: capture
    path: "evidence/critic.md"
id: DEMO-23
---

# Contract — demo polish from the critic run

## Build notes

- **Found by:** DEMO-17, rounds 1 and 2.
  - records-table 834: "Annual value (USD)" and "Renews" headers about 4px apart, and the value header's right edge about 13px past the figures (C-R06, C-R11). DEMO-17 widened the column below lg; the button's negative margin still overshoots.
  - records-table: the `deleted` toast covers data rows at every width; in `loading` New record stays enabled while the filters are disabled (C-R10).
  - record-detail: history rows sit as far apart as sections (C-R06); `partial` stacks a separator on the alert border (C-R07); `empty` and `no-history` say "3 days ago by Ana Okafor" against no or one old version (C-R10); `offline` notice has no icon (C-R07).
  - Dialogs: title and body centred above right-aligned actions at 834 and 1440, where delete-dialog.md asks left-aligned (delete-dialog and record-form `dirty`, C-R06 / C-R02).
  - onboarding: beat-3 slot is a raised rounded-xl card unlike beats 1-2; `empty` line has no bordered slot; the inert dialog's buttons look live (C-R07, C-R05).
  - settings: offline alert text wraps at about 250px in a 358px alert at 390 (C-R06); the 390 `saved` toast covers Reset demo data (C-R13).
  - Three radii on one screen (pill, about 6px, about 10px, toast and dialog about 14px), settings and record-detail (C-R07): a DESIGN.md ruling may settle it.
  - Retry outline on settings `error` (failed save) against solid on `partial` (failed load): rule whether D-DEMO-22 covers saves; record-form `partial` Retry is outline in a neutral notice (C-R02).
