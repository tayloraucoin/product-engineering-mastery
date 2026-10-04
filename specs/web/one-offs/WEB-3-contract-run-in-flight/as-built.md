# As-built — WEB-3

## Shipped against the contract

- C1: `contract:run` writes each log to `.<C>.log.<pid>.tmp`, hashes it, renames it into place and writes `results.json` at once, inside the loop (`tooling/contract.ts`). Test: a second full run of a ticket whose C2 runs check-specs passes. It fails on the old code.
- C2: on a hash mismatch, `readItemState` reads the log's run header (`readRunHeader`, `tooling/lib/specs.ts`). A newer `at`, or the same `at` with another `head`, makes the PASS stale with a reason naming both runs; check-specs warns and exits 0. Test fails on the old code.
- C3: a log edited with its header kept, given an older header, or with the header removed still fails as "changed after it was recorded". The test passes on old and new code alike, so the hard failure is unchanged.
- C4: fixtures `pass-evidence-run-in-flight` and `fail-evidence-edited-run-header-kept`; `fail-evidence-changed-after-record` (no header) still fails.
- C5: tooling types pass.

## Deviations

- No ledger line: a defect fix under PR-14 and PR-15, not a new ruling. The changelog has the entry.
- Built in an app-made worktree branch (`claude/funny-aryabhata-60d663`), which Taylor fast-forwarded to `agent/STK-3` at `4ac308f`. It merges back into `agent/STK-3`.

## Not verified

- A real cross-thread race. The tests reproduce the state a race leaves (a new log beside an old result) rather than timing two processes. A gap of one rename plus one write remains, and check-specs reads it as stale, not tampered.
- A re-run within the same second on the same commit reads as tampered if check-specs lands in that gap: `now()` has one-second resolution.

## Next

Re-run `yarn contract:run STK-2` once this merges into `agent/STK-3`; its C7 should then pass on a full run.
