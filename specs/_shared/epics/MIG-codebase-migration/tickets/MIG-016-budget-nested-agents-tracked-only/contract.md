---
id: MIG-16
size: small
objective: "budget.ts counts only tracked nested AGENTS.md files under each code root, so a vendored or generated folder never counts toward the cap."
slice_type: "Repo tooling; the risk is a nested AGENTS.md in an ignored folder (out/, public/vendor/) failing the 1,500 cap on a host repo."
non_negotiables:
  - "Nested AGENTS.md files come from `git ls-files` under each code root (untracked but not ignored files included), never a raw directory walk."
  - "At starter the budget report is byte for byte unchanged."
devs_call: "The git call and its fallback outside a git checkout."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/technical/overlay.md"
truth_files: "none: repo tooling; no living UX file changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "tooling/budget.ts"
  - "tooling/overlay.test.ts"
depends_on:
  - MIG-1
out_of_scope:
  - "The caps."
criteria:
  - id: C1
    statement: "On the single-app repo, an oversized AGENTS.md under a gitignored folder is not counted, and one under src/ is."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "The starter's budget report is unchanged."
    evidence: check
    command: "yarn budget"
---

# Contract — MIG-16 budget-nested-agents-tracked-only

## Build notes

- **Approach:** from MIG-1's mason review (round 2, grey finding 6). Replace `nestedAgentsFiles` in `tooling/budget.ts` with `git ls-files --cached --others --exclude-standard -- '<root>/**/AGENTS.md'` per code root, dropping the root's own spine file.
- **Per path:** `tooling/budget.ts`; one case beside MIG-1's nested AGENTS.md case in `tooling/overlay.test.ts`.
