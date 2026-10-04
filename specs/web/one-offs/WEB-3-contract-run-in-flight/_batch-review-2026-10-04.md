# Batch review — WEB-3 (tier 1), 2026-10-04

Reviewer: `vigil` subagent, fresh context, handed the contract, results, as-built and the list of changed files. Its reply, with the criteria verbatim and the findings condensed:

WEB-3 batch review (tier 1): pass with conditions. Nothing is Blocking. Two Should-fix findings follow, and both are worth doing before the next batch close.

I built the checklist from the contract before reading the code. The tests that print proof are recorded in the evidence logs; I have no shell, so everything else below comes from reading the code and those logs.

## Criteria

- **C1: met.** `run()` in `tooling/contract.ts:494-547` writes each log to `.<id>.log.<pid>.tmp`, hashes it (:530), renames it into place (:538) and calls `writeResults` (:539), all inside the loop. Rename comes before the results write, so the gap reads as "newer header, so stale", not tampered. The test "C1 a criterion that runs check-specs passes on a second full run…" passes (`evidence/C1.log:273`, 54 of 54). The test does not pin the "after each criterion" half (Should-fix 1).
- **C2: met.** On a hash mismatch for a test or check log, `tooling/lib/specs.ts:907-925` reads the header (`readRunHeader`, :198-216). A matching command with a later `at`, or the same `at` with another `head`, is stale with the "newer run … recorded (…)" reason. `check-specs.ts:144-147` makes stale a warning unless the ticket has an as-built and `--strict` is on. The test at `contract-run.test.ts:107-129` checks exit 0, the warning text, the recorded `at`, and that the tampered message is absent. It passes (ok 46).
- **C3: met.** `contract-run.test.ts:131-149` covers three edits: header kept, older header, and header stripped. Each one exits non-zero with "changed after it was recorded" (ok 47). The same-`at`, same-`head` case also stops a regression from loosening `>` to `>=`.
- **C4: met.** Two new fixtures pin both directions:
  - `pass-evidence-run-in-flight` (header newer, expects pass) fails if the in-flight branch is removed.
  - `fail-evidence-edited-run-header-kept` (same header, edited body, expects fail with "changed after it was recorded") fails if the branch is loosened to cover any mismatch.
  - `fail-evidence-changed-after-record` (no header) still fails.
  - `evidence/C4.log:73` says "26 fixtures behaved", which matches the 26 `case.json` files, so both new fixtures ran.
- **C5: met.** `evidence/C5.log` shows exit 0 with empty output.

**Non-negotiables:**

- A log edited with its header matching: still tampered.
- A log with an older header or none: still tampered.
- An in-flight log never becomes PASS: `state.status` stays FAIL, and `check-specs.ts:145` makes it an error on a closing ticket under `--strict`.
- No lock file is used.
- `results.json` was written by tooling: each run record's `at`, `head` and hash agrees with its log's header. That fits A9, but I could not prove where the file came from.

## Can the in-flight branch be used to make edited evidence pass or go unreported?

- **Pass: no.** The branch only sets `stale`. Status stays FAIL, and nothing that reads `CriterionState` treats stale as PASS. `_status.md` reads recorded status only.
- **Unreported: no, but it can be downgraded from an error to a warning** (Should-fix 2).

## Findings

**Should-fix 1: the C1 test would not catch a revert of the per-criterion write.** `tooling/contract-run.test.ts:98-104`. If `writeResults` moved back after the loop, C2's check-specs in the second run would see C1's new log next to the old record, which with the new branch reads as stale and only warns: exit 0, C2 still PASS. Fix: assert C2.log does not match `/no longer holds|newer run/`.

**Should-fix 2: a forged header turns tampered evidence into a warning in `yarn verify`, merged tickets included.** `tooling/lib/specs.ts:916-925`. Any header claiming a later `at` is trusted, including one in the future (the C2 test uses `2999-01-01T00:00:00Z`), and any other `head` at the same `at`. The immutability check (`check-specs.ts:209-226`) does not cover evidence logs, so on main an edited merged log with a forged header would pass CI. Not Blocking: the Build notes chose this, every case is still reported, and `--strict` at close catches it on open tickets. Tightenings: skip the branch when `merged`; treat `header.at > now()` as tampered; with git on, require `header.head` in HEAD's ancestry. Name the residual in Not verified.

**Consider 1: a crash can leave a temp file behind.** `tooling/contract.ts:516-538`. `.tmp` is not gitignored; on a ticket whose own folder is a planned path, `requireProvable` refuses the next run until it is removed, and `git add -A` could commit it. Fix: `.gitignore` it, or remove it in a `finally`.

**Consider 2: no test covers the command check.** `header.command === run.command` (`tooling/lib/specs.ts:918`) is unpinned; add a C3 case with another command.

## Runtime checklist (for a human)

1. The pass fixture's C1.log must not hash to `1f05be9d…`.
2. Move `writeResults` after the loop and run the C1 test; it should fail once Should-fix 1 is applied.
3. `yarn check-specs --strict` should name nothing WEB-3 still owes.

VERDICT: PASS

## Disposition (builder)

- Should-fix 1: fixed. C1's test asserts C2.log names no stale or in-flight C1. Checklist 2 run: with `writeResults` moved after the loop, the C1 test fails.
- Should-fix 2: fixed. The in-flight reading needs a ticket not merged, `at` no later than now, and (git on) `head` in HEAD's ancestry. The C2 test now uses a real re-run with `results.json` held back, not a 2999 date. The residual (a plausible forged header on an open ticket) is named in the as-built's Not verified.
- Consider 1: fixed. `.gitignore` ignores `specs/**/evidence/.*.tmp`; checked with `git status` on a touched temp file.
- Consider 2: fixed. C3 covers another command, a future `at` and an off-branch `head`.
- Checklist 1: the three fixture logs hash `5ddcfb15…`, `b6b83869…`, `d9f25639…`, none `1f05be9d…`.
- WEB-3 re-proven after the fixes: C1 to C5 PASS.
