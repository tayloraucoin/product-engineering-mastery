---
id: STK-20
size: small
objective: "A cold agent turns a duplicate of this repo into a product repo from a briefing, and the guide absorbs every stop."
slice_type: "Validation of the guide; the risk is a guide that reads well and fails cold."
non_negotiables:
  - "The run uses a synthetic briefing and a fresh clone, by an agent given only the guide."
  - "Every stop is logged with the step, the cause and the fix made to the guide or a runbook."
  - "The result passes yarn check-stack and yarn verify with Supabase Auth, billing and AI removed."
  - "Timing per step is recorded in the as-built."
  - "The README porting section points at the guide and the timing."
devs_call: "The synthetic product's name and which modules the briefing removes."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-14"
  - "D-STK-13"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers: []
planned_paths:
  - "docs/runbooks/new-project/README.md"
  - "docs/runbooks/remove/supabase-auth.md"
  - "docs/runbooks/remove/billing.md"
  - "docs/runbooks/remove/ai.md"
  - "README.md"
  - "docs/prompts/phases/port-dry-run.md"
depends_on:
  - STK-3
  - STK-8
  - STK-11
  - STK-14
  - STK-15
  - STK-21
  - STK-17
  - STK-18
  - STK-19
out_of_scope:
  - "Shipping the dry-run product anywhere."
  - "Changes to module code; a code defect found here becomes a one-off."
criteria:
  - id: C1
    statement: "Frontmatter and names pass on the amended runbooks."
    evidence: check
    command: "yarn lint:docs"
  - id: C2
    statement: "Every reference in the amended runbooks resolves."
    evidence: check
    command: "yarn check-refs"
  - id: C3
    statement: "The duplicate passes verify and check-stack after the removals; the log holds each stop with its cause and fix, the per-step timings and the empty grep for each removed vendor."
    evidence: capture
    path: "specs/_shared/epics/STK-default-stack/tickets/STK-20-removal-dry-run/evidence/dry-run-1.txt"
  - id: C4
    statement: "A second cold run after the fixes completes with no stop; the log holds its per-step timings."
    evidence: capture
    path: "specs/_shared/epics/STK-default-stack/tickets/STK-20-removal-dry-run/evidence/dry-run-2.txt"
---

# Contract — STK-20 removal-dry-run

## Notes

This ticket retires the Phase 5 port-dry-run prompt; say so in that file by a dated amendment block, never in place.
