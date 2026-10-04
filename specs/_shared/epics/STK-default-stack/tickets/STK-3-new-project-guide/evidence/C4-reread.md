# STK-3 C4 — re-read at STK-9's close

Re-read by the builder (claude-opus-5-5, Claude Code) on 2026-10-03, at `5770423`, because two planned paths changed after the cold-reader record (`evidence/C4.md`, recorded at `5703e9e`). Command: `git diff 5703e9e 5770423 -- <the planned paths>`.

## What changed

| File                                        | Change                                                                                                                                                                                                   | Owner                        |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `docs/runbooks/remove-supabase-database.md` | "Not built yet: STK-9 fills this" replaced in every section by the module's real files, edits, variables, dependencies, boundaries entries and vendor-side steps; Verify step 1 now names the `db` entry | STK-9, as this runbook asked |
| `docs/_generated/directory-map.md`          | three description lines regenerated (the as-built template, `stages/build.md`, `stages/tickets.md`)                                                                                                      | PJ (PR-15)                   |

`docs/runbooks/new-project.md`, the file a cold reader holds, is unchanged since `5703e9e`.

## Does C4 still hold

- The criterion is about the guide: a reader holding it and a briefing names every step and the check that ends it. The guide's text is unchanged, so both cold reads in `C4.md` stand.
- Step 4 sends the reader into each dropped module's runbook and says its last section marks the entry `"removed": true` and runs the checks (`new-project.md:84`). The database runbook still ends on Verify, which sets `"removed": true` on the `db` entry and runs `yarn check-stack` and `yarn verify`. Step 4's check (`yarn check-stack` after each runbook and once at the end, line 99) is unchanged.
- The fill makes the database runbook followable where it was a list of placeholders; it removes none of the steps or checks the guide names.
- The directory-map lines are unrelated to the guide.

## Verdict

PASS.
