---
id: LAB-30
size: small
objective: "A reviewer's view log stays a faithful record: a switch to the design already recorded as last is not written, and one access cannot write views faster than a person can switch."
slice_type: "A bound on the view action (door 4); the risk is a looping client inflating its own toggle count and time per design, which LAB-23's results read."
non_negotiables:
  - "recordViewEvent skips a switch whose design equals the reviewer's last_design, in the same transaction, and says so in its result."
  - "A per-access cap on view rows per minute, one constant, beyond which the action returns not-counted and writes nothing; a load is never refused."
  - "No new table; the bound reads sandbox_view_events by access and time, on its existing index."
devs_call: "The cap's value, and whether the skip lives in SQL or in the action."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/experimental/experiment.md"
truth_files: "none: no behaviour a person sees changes"
qa: Q2
reviewers:
  - mason
focus: []
operator_review: false
planned_paths:
  - "packages/db/src/sandbox/experiment.ts"
  - "packages/db/test/sandbox/isolation.test.ts"
  - "packages/db/test/sandbox/experiment.test.ts"
  - "apps/web/lib/sandbox/experiment.ts"
  - "apps/web/lib/sandbox/experiment.test.ts"
depends_on:
  - LAB-11
out_of_scope:
  - "The order log and time per design: LAB-23."
criteria:
  - id: C1
    statement: "A switch to the reviewer's last design writes no row; a switch to another design writes one."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C2
    statement: "Past the per-minute cap one access's further switches write nothing and the action returns not-counted; another access is unaffected."
    evidence: test
    command: "yarn workspace @pem/db test:db"
---

# Contract — LAB-30 view-log-bounds

## Build notes

- From LAB-11's Mason review (yellow): `recordView` has no throttle, so a script holding a reviewer's cookie can post switches in a loop, inflating that reviewer's toggle count and time per design and growing the table. Only the caller's own data is affected.
- `recordViewEvent` already sets `last_design` in its transaction; compare before the insert.
