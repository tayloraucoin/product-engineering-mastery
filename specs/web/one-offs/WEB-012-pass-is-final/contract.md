---
id: WEB-12
size: small
objective: "A review PASS is final for its round: fixes to orange and yellow findings re-prove and never re-review, a FAIL earns one re-review, and a third run of the same reviewer on one ticket needs the operator's word."
slice_type: "A change to what the Q3 ledger means and to the review loop's cap; the risk is a cap that can be talked past, or one that resets a PASS it should keep."
non_negotiables:
  - "A recorded review PASS is reset by a change to the contract's criteria and by nothing else: never by the as-built, never by a planned-path commit."
  - "The cap is per reviewer per ticket and read from tooling's own record; a hand edit to results.json or to the review file never earns a run."
  - "--operator <reason> is the only way past the cap, and the reason is written into the review file."
  - "The review file header keeps recording the contract and as-built hashes it read."
  - "--strict at a merge is not loosened: a review whose criteria changed, or recorded off this branch, still fails it."
  - "No results.json or review file is edited by hand; no LAB or STK review is re-run."
  - "The reviewer prompt's scope and wording are another thread's (C3) and are not changed here."
devs_call: "Field names, the refusal wording, the test names, where the corpus table sits in the as-built."
cites:
  - "PR-14"
  - "PR-15"
  - "PR-19"
truth_files: "none: tooling and workflow prose; no app behaviour changes"
qa: Q2
reviewers:
  - vigil
focus: []
planned_paths:
  - "tooling/review-run.ts"
  - "tooling/lib/specs.ts"
  - "tooling/check-specs.ts"
  - "tooling/status.ts"
  - "tooling/contract-review.test.ts"
  - "docs/engineering/schemas/results.schema.json"
  - "docs/workflows/qa-levels.md"
  - "docs/workflows/stages/build.md"
  - ".claude/skills/tk-batch/SKILL.md"
  - "docs/engineering/tooling.md"
  - "docs/decisions/ledger.md"
  - "docs/decisions/changelog.md"
  - "specs/web/one-offs/WEB-012-pass-is-final/"
depends_on: []
out_of_scope:
  - "The reviewer prompt's scope and wording (C3, another thread)."
  - "Recording a run's cost (C4, another thread)."
  - "Re-running any LAB or STK review, or editing their files."
  - "Loosening check-specs --strict."
criteria:
  - id: C1
    statement: "On a Q3 ticket still closing (a second reviewer not yet run), a recorded review PASS survives a later as-built edit and a later commit to a planned path: check-specs --strict and yarn status report it PASS, not stale."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "After a recorded PASS, review:run refuses a second run of the same reviewer; after a recorded FAIL it allows one; a third run is refused without --operator and runs with it, the reason written into the review file."
    evidence: test
    command: "yarn test:tooling"
  - id: C3
    statement: "A FAIL written into results.json by hand earns no run (the verdict is read from the hash-bound review file); a criterion added with contract:add resets a PASS and allows one run, and the third still needs --operator."
    evidence: test
    command: "yarn test:tooling"
  - id: C4
    statement: "The check-specs fixtures and the live tree pass."
    evidence: check
    command: "yarn check-specs"
  - id: C5
    statement: "Tooling types pass."
    evidence: check
    command: "yarn check-types:tooling"
  - id: C6
    statement: "The amended workflow prose passes the docs lint."
    evidence: check
    command: "yarn lint:docs"
  - id: C7
    statement: "The amended workflow prose stays inside the token budget."
    evidence: check
    command: "yarn budget"
---

# Contract — WEB-12 pass-is-final

## Build notes

- **Approach:** three parts. (1) `readItemState` stops applying the planned-path staleness to `review:<role>` criteria; a review is stale only when the criteria set changed after it ran (its run record carries `criteria_sha256`, compared with `results.criteria_sha256`) or it was recorded off this branch. The as-built hash was already not compared (PR-15); the stale header comment and stop message in `review-run.ts` say so now. (2) `review:run` keeps a `runs` count per review criterion (verdict-bearing runs only). Before running: a prior PASS with the criteria unchanged refuses a run; a prior FAIL allows the second; a third needs `--operator "<reason>"`, which also lifts the first refusal; the verdict is read from the recorded review file, whose hash must match the run record. A refusal is recorded in the criterion's `refused` list (the field C4 added). (3) The prose in qa-levels, build.md, tk-batch and tooling.md; a ledger line (PR-20) and a changelog entry.
- **Decisions that apply:** PR-14, "a proof goes stale only when its own planned paths change" (reviews now excepted). PR-15, "reviews bound to the contract and as-built hashes" displaced. PR-19, only Q3 keeps recorded proofs and review files. The audit's R1, R2 and C1 are the evidence.
- **Interfaces:** `CriterionResult.runs`; `RunRecord.criteria_sha256`; `yarn review:run <role> <id> [--operator "<reason>"]`; review header lines `criteria_sha256:` and `operator:`.
- **Per path:** `review-run.ts` the guard, the flag, the header lines, the counter; `lib/specs.ts` the type, the serializer, the review branch of `readItemState`; `check-specs.ts` and `status.ts` the reported reason (wording only); `results.schema.json` the two fields; `contract-review.test.ts` C1 to C3 as new tests; the three prose files, `tooling.md`'s review:run and check-specs entries; the ledger and changelog.
- **Gotchas:** a closed ticket is frozen, so the existing PR-15 test does not exercise the rule; C1 needs two reviewers with one still FAIL. The shared tree holds other threads' hunks in `specs.ts`, `check-specs.ts`, `status.ts`, `SKILL.md` and `review-run.ts` (C3's prompt block): edit around them, commit through a private index with `git commit -- <paths>`. `runs` has no history on older tickets: a run record with no counter counts as one run.
- **Model:** Fable 5.1; a smaller model satisfies the fixture and misses the rule it encodes.
