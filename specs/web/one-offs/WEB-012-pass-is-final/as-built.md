# As-built — WEB-12

## Shipped against the contract

- C1: `readItemState` (`tooling/lib/specs.ts`) no longer applies the planned-path staleness to `review:<role>` criteria; a review is stale only when `run.criteria_sha256` differs from the results' `criteria_sha256` (a criterion added after the review) or it was recorded off this branch. The as-built hash was already not compared (PR-15); the header comment and the as-built stop message in `review-run.ts` now say so. Test: a Q3 ticket with two reviewers, vigil PASS, then an as-built edit and a planned-path commit re-proven; `check-specs --strict` and `yarn status` keep vigil PASS.
- C2: `review:run` keeps `runs` per review criterion (verdict-bearing runs only) and reads the prior verdict from the recorded review file, whose hash must match the run record. A prior PASS with the criteria unchanged refuses a run; a prior FAIL allows one; a third run needs `--operator "<reason>"`, which also lifts the first refusal. The review header carries `criteria_sha256`, `run: <n> of <role> on <id>` and `operator: <reason>`; the run record carries `criteria_sha256`; refusals land in the criterion's `refused` list (the field C4's thread added). Schema: `runs` on a result, `criteria_sha256` on a run.
- C3: a status flipped to FAIL by hand in `results.json` earns no run (the file's verdict is read); an edited review file is refused as not the recorded review; `contract:add` makes the PASS stale, one run is allowed, the third still needs the operator.
- C4 to C7: the fixtures, tooling types, docs lint and budget. [NOT YET RUN: see Next.]
- Prose: `docs/workflows/qa-levels.md` (the PASS-is-final paragraph and a fourth `focus` example), `docs/workflows/stages/build.md` step 6, `.claude/skills/tk-batch/SKILL.md` step 5, `docs/engineering/tooling.md` (review:run and check-specs entries). Ledger PR-20; changelog entry.

## The LAB-1 to LAB-7 review histories under the new rule

Every recorded run is a committed version of `review-<role>.md` under `specs/web/epics/LAB-experimental-sandbox/tickets/`; each version's `at` differs, so each is one run. No ticket's `criteria_sha256` changed across rounds (every `results.json` version carries one hash), so no PASS would have been reset; every run after the first PASS of a reviewer is refused. "Blocking" was checked in every refused version's Review section: each says no Blocking finding, or lists only Should-fix and Consider headings.

| Ticket | Reviewer runs recorded (commits)                                             | Refused under PR-20                                  | Blocking in a refused run |
| ------ | ---------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------- |
| LAB-1  | mason 3, warden 3 (`d7d5707`, `d89f6e1`, `eeee269`)                          | 4: mason runs 2 and 3, warden runs 2 and 3           | none                      |
| LAB-2  | mason 3, warden 3 (`9fae3c8`, `1f28e40`, `eeee269`)                          | 4: mason runs 2 and 3, warden runs 2 and 3           | none                      |
| LAB-3  | mason 3, warden 3 (`cbe33b5`, `1b7f5b4`, `9eef622`)                          | 4: mason runs 2 and 3, warden runs 2 and 3           | none                      |
| LAB-4  | Q2, no review file                                                           | 0                                                    | n/a                       |
| LAB-5  | mason 2, warden 2 (`0fab754`, `ce40cb8`)                                     | 2: mason run 2, warden run 2                         | none                      |
| LAB-6  | warden 2 (`c9979fb`, `ce40cb8`)                                              | 1: warden run 2                                      | none                      |
| LAB-7  | assay 1, warden 1 (`ce40cb8`); the report's unrecorded attempts left no file | 0 recorded; the unrecorded attempts would be refused | none on record            |

Total: 26 recorded runs, 15 refused (the report's 19 counts per ticket, not per reviewer seat), 0 Blocking among them. Two refused runs found a Should-fix that was the loop itself: LAB-1 mason run 2 and LAB-2 mason run 3 flag the other reviewer's record predating the fixes.

## Deviations

- The cap guard records its refusals through the `refuse` helper and `refused` field the C4 thread added to `review-run.ts` and `results.schema.json` in the same tree; both threads' hunks sit in the same files, committed through private indexes.
- [ASSUMPTION] `--operator` lifts both refusals (a second run after a PASS and any third run); the decision names only the third.
- [ASSUMPTION] A run that gave no verdict (the reviewer failed to finish) is not counted: it was not a review.
- `runs` can be hand-edited in `results.json` like any other field; the results-gate hook and A9 are that boundary, as before.

## Not verified

- C4 to C7 have not run yet (the usage limit stopped the thread); C1 to C3 pass under `node --test tooling/contract-review.test.ts` (6 of 6).
- No Vigil review yet (Q2).

## Next

Commit this ticket's paths through a private index (`git commit -- <paths>`), prove in a detached worktree (`yarn contract:run WEB-12`), run Vigil in fresh context on the cap (a criteria edit to reset a PASS; a FAIL forced to earn a run), then one `yarn verify`.
