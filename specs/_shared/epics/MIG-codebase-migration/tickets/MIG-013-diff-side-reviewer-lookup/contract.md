---
id: MIG-13
size: small
objective: "A ticket's whole diff, including files outside its planned paths, is matched against the reviewer map, so a Stripe import added to a stray file still suggests mason, warden and chancery."
slice_type: "Tooling only: the reviewer lookup gains a diff-side pass; the risk is Risk 6 through a file the builder touched outside planned_paths."
non_negotiables:
  - "One matcher: the diff pass calls findRowReach / findImportMatch from tooling/lib/specs.ts, never a second scanner."
  - "The pass reads tracked source files only, as MIG-4's scanner does."
  - "A seat the diff suggests is a warning naming the file and the import, never an assignment: the operator confirms reviewers."
devs_call: "How the warning reads in check-specs (the one planned surface; review:run and contract:run are not planned paths), and whether the base is getBaseRef or the ticket's first commit."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/tickets/MIG-004-reviewer-imports/as-built.md"
truth_files: "none: repo tooling; no living UX file changes"
qa: Q2
reviewers:
  - vigil
focus: []
operator_review: false
planned_paths:
  - "tooling/lib/specs.ts"
  - "tooling/check-specs.ts"
  - "tooling/check-reviewers.test.ts"
depends_on:
  - MIG-4
out_of_scope:
  - "Changing a ticket's QA level automatically."
criteria:
  - id: C1
    statement: "On a scratch repo, a ticket whose diff adds a stripe import to a file outside its planned paths gets a warning naming that file, the import and the roles mason, warden and chancery."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "Tooling types pass."
    evidence: check
    command: "yarn check-types:tooling"
---

# Contract — diff-reviewers

## Build notes

- **Why:** Vigil's S1 on MIG-4: suggestReviewers scans only the tracked files the planned paths hold; no tool compares a ticket's diff with the reviewer map, so a stray file importing stripe reaches no seat.
- **Approach:** list the ticket's changed files against base (`listChangedAgainstBase`, the same call review:run uses), run each through `findRowReach` with `readImportedModules`, and report roles the contract does not list.
