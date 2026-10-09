---
size: small
objective: "Every demo loading skeleton copies its width's final layout: the same blocks, widths, row pitch and separators, so nothing moves when content arrives."
slice_type: "Skeleton geometry on three surfaces; the risk is matching one width and breaking another."
non_negotiables:
  - "Each skeleton is checked at 390, 834 and 1440 against its loaded key on fresh captures (states.md, D-DEMO-16)."
devs_call: "Whether a shared skeleton helper is worth it."
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
  - "Shimmer: the skeletons stay still (A-14)."
criteria:
  - id: C1
    statement: "The critic raises no C-R10 skeleton finding on record-detail, settings or records-table, on fresh captures."
    evidence: capture
    path: "evidence/critic.md"
id: DEMO-22
---

# Contract — skeletons copy the final layout

## Build notes

- **Found by:** DEMO-17, rounds 1 and 2.
  - record-detail `loading`: no subtitle or toggle block, separator above Terms instead of below the subtitle, history as full-width bars at about half the row pitch, action widths swapped (1440 and 390).
  - settings `loading`: Demo buttons 160px blocks at 390 against full-width buttons; Theme skeleton wider than the toggle group; the Records group's first radio sits about 12px low at 1440.
  - records-table `loading` 834: the longest Vendor bars run into the Owner bars with no gutter.
