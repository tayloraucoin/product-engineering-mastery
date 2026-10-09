# Round 2 — six surfaces, fresh captures

- **Build:** production build of `a73f355` (the round-1 fixes) in a new detached worktree, served on :3172, the epic's untracked specs copied in as in round 1. No capture carried over: `.captures/` was deleted before the run.
- **Captures:** `CAPTURE_BASE_URL=http://localhost:3172 yarn capture`, 2026-10-08 21:40. 240 passed, 18 failed (the same delete-dialog keys as round 1).
- **E2E after the fixes:** `yarn playwright test --project=e2e e2e/demo` against the same build: 54 passed.
- **Critic:** as round 1, one fresh `claude-opus-5-5` context per surface with `--round 2`, no word of what changed. Each review is that run's hand-back, byte for byte. A command audit found no write; the worktree was unchanged.

| Surface         | Captured | Verdict | Blocking                       | Review                                               |
| --------------- | -------- | ------- | ------------------------------ | ---------------------------------------------------- |
| onboarding      | 48/48    | PASS    | none                           | [round-2/onboarding.md](round-2/onboarding.md)       |
| records-table   | 42/42    | PASS    | none                           | [round-2/records-table.md](round-2/records-table.md) |
| record-detail   | 54/54    | PASS    | none                           | [round-2/record-detail.md](round-2/record-detail.md) |
| record-form     | 48/48    | PASS    | none                           | [round-2/record-form.md](round-2/record-form.md)     |
| delete-dialog   | 6/24     | FAIL    | C-R10: 18 captures missing     | [round-2/delete-dialog.md](round-2/delete-dialog.md) |
| settings        | 42/42    | PASS    | none                           | [round-2/settings.md](round-2/settings.md)           |

## C2 against this round

**Not met.** Five surfaces have no Blocking finding and no UNVERIFIED key. delete-dialog has `deleting`, `error` and `offline` UNVERIFIED at every width and theme, because the harness cannot capture them (DEMO-18). It is not a design finding the build can fix inside this ticket's paths; round 3 waits on DEMO-18.

## What round 2 says about the critic

- **Severity drift on unchanged pixels.** record-form `dirty` 390: round 1 scored the clipped scrim C-R03 Blocking (×2, light and dark); round 2 scored the same pixels C-R10 Should-fix and passed. The fix was not in the app: the harness shoots `fullPage`, the fixed scrim covers only the first 900px, and in a browser the scrim covers the viewport at every scroll position (checked at 390: the page scrolls 348px, the scrim stays over it; locking `html` overflow leaves the fullPage height at 1248). Drafted as DEMO-19.
- **A spec lowering a line.** record-form P-A01: round 1 flagged the 390 back link dropping "Records" and "Edit" and said a spec cannot lower it; round 2 passed it, citing D-DEMO-20. record-detail round 2 raised the same on `error` 390. Logged as G-04 in `apps/web/docs/design/coverage-gaps.md`.
- **New in round 2, not in round 1:** records-table radii and the 834 skeleton gutter; record-detail `empty` five sizes and `error` 390 words; record-form `partial` Retry weight and `submitting` contrast; settings dark radio rings. Each is folded into a drafted follow-up (`findings.md`).

## DEMO-14's directions, beside the reviews

Three records-table layout directions from `tk-ui-diverge` (rows, cards, grouped), rendered at 390 and 1440, light and dark: [DEMO-014 evidence/directions.png](../../DEMO-014-ui-diverge/evidence/directions.png). They live under `/demo/diverge/records-table/` and were not scored by the critic: they are directions to choose between, not a shipped surface.
