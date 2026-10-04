# STK-3 C4 — re-read after STK-9

Re-read by the builder (claude-opus-5-5, Claude Code) on 2026-10-03, at `cc95735`. The cold-reader record is `evidence/C4.md` (recorded at `5703e9e`); this re-read covers what changed since. Command: `git diff 5703e9e cc95735 -- <the planned paths>`.

## What changed

| File                                        | Change                                                                                                                                                                                                                                                                                                                                                     | Owner                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `docs/runbooks/remove-supabase-database.md` | every "Not built yet: STK-9 fills this" replaced by the module's real files, edits, variables, dependencies, boundaries entries and vendor-side steps; Verify step 1 names the `db` entry                                                                                                                                                                  | STK-9                           |
| `docs/runbooks/new-project.md` step 4       | the line "Today none of the six is built … every row is skipped" was false once STK-9 added a `db` entry that is not locked (caught by vigil's review of STK-3, which failed it). It now says the database is built and its runbook is followed when the briefing drops it, the other five are skipped, and to read the `stack` block rather than the line | STK-3, at STK-9's close         |
| `docs/runbooks/new-project.md` step 1       | a sentence: `yarn hooks:install` exits 1 from an agent's sandboxed shell, so a person runs that line                                                                                                                                                                                                                                                       | STK-3 (vigil's earlier finding) |
| `docs/runbooks/new-project.md` step 4 table | Billing is built by STK-16 and STK-21                                                                                                                                                                                                                                                                                                                      | STK-3                           |
| `docs/_generated/directory-map.md`          | three description lines regenerated (PR-15)                                                                                                                                                                                                                                                                                                                | PJ                              |

## Does C4 still hold

The criterion: a reader holding the guide and a briefing names every step and the check that ends it.

- Steps 0 to 7 and their eight `**Check:**` lines are unchanged; no step was added, removed or reordered, so both cold reads in `C4.md` still name the same steps and checks.
- Step 4 now leads a reader who drops the database into `remove-supabase-database.md`, which ends on Verify: set `"removed": true` on the `db` entry, `yarn check-stack` exits 0, `yarn verify` exits 0. That is the step-4 check the guide names (`yarn check-stack` after each runbook and once at the end). Before the fix, the same reader would have skipped the row and both closing checks would still have exited 0 with the database in place.
- The step-1 sentence names who runs one command; the step and its check (`yarn doctor` names nothing broken) are unchanged.

## Verdict

PASS.
