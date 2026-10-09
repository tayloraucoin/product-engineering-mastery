# Round 1 — six surfaces

- **Build:** production build of `7533047` in a detached worktree, served on :3171; the epic's untracked `brief.md` and `ux/demo/*.md` copied in so the critic could read them (a first pass without them was voided: `void-run/README.md`).
- **Captures:** `CAPTURE_BASE_URL=http://localhost:3171 yarn capture`, all surfaces, 2026-10-08 21:05. 240 passed, 18 failed. Captures are git-ignored; they were written to `<worktree>/apps/web/.captures/<surface>/<key>-<width>[-dark].png`.
- **Critic:** `tk-ui-critic` (`.claude/skills/tk-ui-critic/SKILL.md` at `0f2c7aa`), one fresh `claude-opus-5-5` context per surface with only the skill path, the surface id and the round, never a summary. Each review below is that run's reply, extracted byte for byte from its hand-back.
- **Hands off, checked:** the skill is `disable-model-invocation`, so it ran as a subagent given the SKILL.md path, and its `allowed-tools` were not enforced. Glob and Grep were not available to the subagents, so each listed and read files with read-only shell (`ls`, `find`, `grep`, `cat`, `head`); an audit of every command found no write and no redirect other than `2>/dev/null`, and `git status` in the worktree showed nothing changed.

| Surface         | Captured | Verdict | Blocking                                                       | Review                                               |
| --------------- | -------- | ------- | -------------------------------------------------------------- | ---------------------------------------------------- |
| onboarding      | 48/48    | PASS    | none                                                           | [round-1/onboarding.md](round-1/onboarding.md)       |
| records-table   | 42/42    | FAIL    | C-R05 ×2: search and the status/owner selects have no visible label | [round-1/records-table.md](round-1/records-table.md) |
| record-detail   | 54/54    | PASS    | none                                                           | [round-1/record-detail.md](round-1/record-detail.md) |
| record-form     | 48/48    | FAIL    | C-R03 ×2: dirty 390, solid Save below a clipped scrim          | [round-1/record-form.md](round-1/record-form.md)     |
| delete-dialog   | 6/24     | FAIL    | C-R10: deleting, error, offline uncaptured; A-20: 900ms wait   | [round-1/delete-dialog.md](round-1/delete-dialog.md) |
| settings        | 42/42    | FAIL    | C-R10: `saved` shows no toast                                  | [round-1/settings.md](round-1/settings.md)           |

## C1 against this round

Every key of five surfaces is captured at 390, 834 and 1440, light and dark. delete-dialog is not: `deleting`, `error` and `offline` fail the harness's render check (`root data-demo-state is "default"`), the defect DEMO-13 drafted as DEMO-18. Those 18 captures are UNVERIFIED in the review, never passed.
