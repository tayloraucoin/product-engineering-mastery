---
id: WEB-3
size: small
objective: "A contract:run in flight is never read as tampered evidence: a yarn verify in another thread, or a criterion of the same run that runs check-specs, no longer fails on a log rewritten a moment before its results.json line."
slice_type: "Integrity check of the contract loop; the risk is loosening the tamper check until an edited log passes, or leaving a race that fails verify spuriously."
non_negotiables:
  - "A log whose header at and head match the recorded run, but whose hash differs, still fails check-specs as changed after it was recorded."
  - "A log with no run header, or an older one, still fails as tampered."
  - "An in-flight log never counts as PASS; it reads as stale, so check-specs --strict on a closing ticket still fails it."
  - "results.json is written only by the tooling, never by hand (A9)."
  - "No lock file a crashed run could leave behind."
devs_call: "The temp file's name, the helper names, the warning's wording and the fixtures' names."
cites:
  - "PR-14"
  - "PR-15"
  - "A9"
truth_files: "none: no living UX file covers the contract loop"
reviewers: []
planned_paths:
  - "tooling/contract.ts"
  - ".gitignore"
  - "tooling/lib/specs.ts"
  - "tooling/lib/scratch-repo.ts"
  - "tooling/contract-run.test.ts"
  - "tooling/fixtures/specs/pass-evidence-run-in-flight/"
  - "tooling/fixtures/specs/fail-evidence-edited-run-header-kept/"
  - "docs/decisions/changelog.md"
  - "specs/web/one-offs/WEB-3-contract-run-in-flight/"
depends_on: []
out_of_scope:
  - "A lock file around contract:run, or serialising runs across threads."
  - "contract:record and review:run evidence, which has no run header."
  - "Changing what yarn verify runs."
criteria:
  - id: C1
    statement: "contract:run writes results.json after each criterion, so a later criterion that runs check-specs passes on a second full run of the same ticket."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "A log rewritten by a newer run whose results.json line is not written yet makes check-specs warn that a run is being recorded, and exit 0."
    evidence: test
    command: "yarn test:tooling"
  - id: C3
    statement: "A log edited after its run, header kept, fails check-specs as changed after it was recorded; so does one with an older header."
    evidence: test
    command: "yarn test:tooling"
  - id: C4
    statement: "The check-specs fixtures pin both cases: an in-flight log passes, an edited log with a matching header fails."
    evidence: check
    command: "yarn check-specs"
  - id: C5
    statement: "Tooling types pass."
    evidence: check
    command: "yarn check-types:tooling"
qa: Q1
---

# Contract — WEB-3 contract-run-in-flight

## Build notes

- **Approach:** two halves. (1) `contract:run` writes each criterion's log to a temp file beside it, hashes it, renames it into place, and writes `results.json` at once, inside the loop, instead of once after the loop. The window between a log and its result shrinks from a whole run to the gap between a rename and a write, and a later criterion (a `yarn verify`) sees every earlier result already recorded. (2) `readItemState` reads the run header of a `test` or `check` log whose hash differs. Header `at` newer than the recorded `at`, or the same `at` with another `head`, means a newer run wrote it and has not recorded it yet: the criterion is stale, with a reason naming the newer run, so check-specs warns while the ticket is open and fails under `--strict` once it has an as-built. A header that matches the recorded run, an older one, or none at all stays tampered, a hard failure.
- **Decisions that apply:** PR-14, "parallel tickets share the branch checked out". PR-15, "`check-specs` warns on work in flight and fails it only with `--strict`". A9, results are written only by tooling.
- **Interfaces:** `readRunHeader(rel)` in `tooling/lib/specs.ts` (the `command`, `exit`, `at`, `head` lines before `---`); the `check:specs` script in the scratch repo's `package.json`.
- **Per path:**
  - `tooling/contract.ts`: temp, hash, rename, `writeResults` per criterion.
  - `.gitignore`: the temp log a crashed run leaves (`specs/**/evidence/.*.tmp`).
  - `tooling/lib/specs.ts`: `readRunHeader`; the in-flight branch in `readItemState`.
  - `tooling/lib/scratch-repo.ts`: a `check:specs` script running `check-specs.ts --skip-fixtures`.
  - `tooling/contract-run.test.ts`: C1 to C3.
  - `tooling/fixtures/specs/pass-evidence-run-in-flight/`, `fail-evidence-edited-run-header-kept/`: C4.
  - `docs/decisions/changelog.md`: one entry.
- **Gotchas:** `now()` has one-second resolution, so a re-run within the same second has the same `at`; `head` breaks the tie, and a same-second re-run on the same head reads as tampered (a test must not depend on that). Fixtures run with git off and strict; the in-flight fixture has no as-built, so its stale PASS is a warning. The scratch repo's criterion that runs check-specs must skip fixtures (the scratch repo has none).
- **Model:** Opus; a smaller model tends to make the mismatch a warning outright, which lets an edited log pass.
