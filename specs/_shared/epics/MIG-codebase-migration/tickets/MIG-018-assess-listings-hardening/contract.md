---
id: MIG-18
size: small
objective: "The assess listings read right to an operator on an unusual host: a root-level log, a rule line that agrees with the toolkit, a folder row's count, the band edges and the unit of a large file."
slice_type: "Read-only tooling hardening from MIG-6's review; the risk is a listing the interview misreads."
non_negotiables:
  - "A tests or protected-branch instruction line that forbids what the toolkit forbids (never commit directly to main; never skip the tests) is no conflict, as a negated push line already is not."
  - "A log at the repo root yields no closed-spec-folder row at ./; a folder row says it carries a file count, not lines, in the report."
  - "V4's 50 and 51 percent edges and P2's 10 and 9 percent edges have tests; a host docs/decisions/ alone scores P3 1 in a test."
  - "A large file's size prints in the unit its number is computed in (MiB or MB, one of them, named); the HEAD fallback counts lines as the working-tree read does."
devs_call: "The negation vocabulary, how the folder row is labelled, and whether a Lines column header changes."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/technical.md"
  - "T1"
truth_files: "none: repo tooling; no living UX file changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "tooling/lib/assess/**"
  - "tooling/migrate-assess-listings.test.ts"
depends_on:
  - MIG-6
out_of_scope:
  - "Moving any band cut-off: the synapse dry run (T1, if wrong)."
  - "One home for the import scanner shared with tooling/lib/specs.ts: MIG-14."
criteria:
  - id: C1
    statement: "A CLAUDE.md holding only lines that agree with the toolkit (never commit directly to main, never skip the tests, never push) scores P1 0; a root DECISIONS.md yields no ./ folder row; a repo with a host docs/decisions/ folder and no logs scores P3 1."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "V4 at 50 percent scores 1 and at 51 scores 2; P2 at 10 percent scores 1 and at 9 scores 2; the folder row and the large-file line read as the non-negotiables say in the rendered markdown."
    evidence: test
    command: "yarn test:tooling"
  - id: C3
    statement: "Tooling types pass."
    evidence: check
    command: "yarn check-types:tooling"
---

# Contract — MIG-0 assess-listings-hardening

## Build notes

- **Approach:** small edits in `tooling/lib/assess/process.ts` (a negation guard per policy, as `NEGATED_PUSH` does for push; skip the folder row when `path.posix.dirname` is `.`; count lines once for both reads), `report.ts` (the folder row's label and the size unit) and tests beside the existing ones.
- **Decisions that apply:** T1, the listings are "reported, never scored" beyond the signal table; MIG-6's as-built, review round 2 (Vigil), yellows Y1 to Y4 and greys G1, G2, G5, G7.
- **Interfaces:** none new.
- **Per path:** `tooling/lib/assess/process.ts`, `report.ts`: the fixes; `tooling/migrate-assess-listings.test.ts`: C1 and C2.
- **Gotchas:** the capture in MIG-6's evidence folder is hashed; do not retake it here.
- **Model:** Sonnet 5.5 (`claude-sonnet-5-5`). Bounded fixes, each with a failing test first.
