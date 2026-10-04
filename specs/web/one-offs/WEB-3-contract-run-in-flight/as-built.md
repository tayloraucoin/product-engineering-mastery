# As-built — WEB-3

## Shipped against the contract

- C1: `contract:run` writes each log to `.<C>.log.<pid>.tmp`, hashes it, renames it into place and writes `results.json` at once, inside the loop (`tooling/contract.ts`). Test: a second full run of a ticket whose C2 runs check-specs passes, and C2's log names no stale or tampered C1. It fails with the write moved back after the loop.
- C2: on a hash mismatch, `readItemState` reads the log's run header (`readRunHeader`, `tooling/lib/specs.ts`). The PASS is stale (check-specs warns, exits 0) only when the header has the recorded command, an `at` no later than now, a `head` in this branch, and is newer than the recorded run (a later `at`, or the same `at` on another commit), on a ticket not merged. Test: a real re-run of C1 with its `results.json` held back. Fails on the old code.
- C3: a log edited with its header kept, an older header, none, a future `at`, a `head` outside the branch, or another command fails as "changed after it was recorded".
- C4: fixtures `pass-evidence-run-in-flight` and `fail-evidence-edited-run-header-kept`; `fail-evidence-changed-after-record` (no header) still fails.
- C5: tooling types pass.

## Deviations

- After the tier 1 review (`specs/web/_batch-review-2026-10-04-WEB-3.md`): the in-flight reading refuses merged tickets, future and off-branch headers; C1's test pins the per-criterion write; `.gitignore` ignores a crashed run's temp log (`.gitignore` added to `planned_paths`).
- No ledger line: a defect fix under PR-14 and PR-15, not a new ruling. The changelog has the entry.
- Built in an app-made worktree branch (`claude/funny-aryabhata-60d663`), which Taylor fast-forwarded to `agent/STK-3` at `4ac308f`. It merges back into `agent/STK-3`.

## Not verified

- A real cross-thread race. The tests reproduce the state a race leaves (a new log beside an old result) rather than timing two processes. A gap of one rename plus one write remains, and check-specs reads it as stale, not tampered.
- A forged header that claims a plausible later run (a past `at`, a `head` in the branch) on an open ticket still reads as stale: a warning in `yarn verify`, an error under `--strict` once the ticket has an as-built.
- A re-run within the same second on the same commit reads as tampered if check-specs lands in that gap: `now()` has one-second resolution.

## Next

Merge this branch into `agent/STK-3`. The other thread's uncommitted PR-16 run lock there also moves `writeResults` into the loop, so expect a conflict in `run()` and `contract-run.test.ts`; keep both: the lock, and this rename and header reading.
