---
id: MIG-19
size: small
objective: "Every precondition failure names the fix for its real cause: a diverged migration branch is told to start fresh, the end check never complains about toolkit.json, and the counts in the fix lines read right."
slice_type: "Read-only tooling messages from MIG-7's review; the risk is an operator sent to the wrong fix at minute one."
non_negotiables:
  - "A migration branch with its own commits while the protected branch has also moved past the fork point fails fork-point-clean (start fresh), and protected-holds-fork reads 'moved past the fork point', never 'set the protected branch'."
  - "With --end and no --protected, no-toolkit-json is not emitted; the start-only rules stay start-only on every path."
  - "The counts in the fix lines resolve refs/heads/<protected>, as the verdict does, and read '1 commit' and '2 commits'."
devs_call: "The exact wording, and whether the diverged case gets its own id."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/technical.md"
  - "T4"
truth_files: "none: repo tooling; no living UX file changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "tooling/lib/assess/preconditions.ts"
  - "tooling/migrate-assess-check.test.ts"
depends_on:
  - MIG-7
out_of_scope:
  - "A remote not named origin: the dry run's question (MIG-7 as-built)."
  - "A force-reset protected branch at the end: out of T4's cases."
criteria:
  - id: C1
    statement: "A scratch repo whose migration branch has its own pushed commits while main moved past the fork point fails fork-point-clean with the fresh-branch fix; --check --end without --protected lists protected-named and no no-toolkit-json."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "The behind and ahead fix lines read '1 commit' for one and count against refs/heads/<protected> when a tag of the same name exists."
    evidence: test
    command: "yarn test:tooling"
  - id: C3
    statement: "Tooling types pass."
    evidence: check
    command: "yarn check-types:tooling"
---

# Contract — MIG-0 precondition-messages

## Build notes

- **Approach:** in `checkPreconditions`, treat "not an ancestor, not behind, not pushed elsewhere" as own commits; guard the no-`--protected` branch's `no-toolkit-json` with `!end`; resolve the counts' refs as `refs/heads/<protected>`; pluralise. Tests beside the existing ones in `tooling/migrate-assess-check.test.ts`.
- **Decisions that apply:** T4 ("the check is cheap to tighten"); MIG-7's as-built, review round 2 (Vigil), yellows 1 and 2 and greys 3 and 4.
- **Interfaces:** none new.
- **Per path:** the two planned files.
- **Gotchas:** the runbook's step 0 lists the failures by cause; keep its wording in step with the fix lines.
- **Model:** Sonnet 5.5 (`claude-sonnet-5-5`). Bounded message fixes with a failing test first.
