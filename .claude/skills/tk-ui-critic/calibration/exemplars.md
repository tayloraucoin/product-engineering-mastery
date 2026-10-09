# Calibration exemplars

Six sets, three that must PASS and three that must FAIL, annotated by rubric line. Each scored set is the full capture of one surface (every key × 390, 834, 1440 × light and dark) from a production build of commit `69332ec`; a fail set comes from a throwaway worktree build with one planted edit, never shipped code. The three planted edits are `planted-defects.diff` (apply it to a detached worktree at `69332ec`, build, then `yarn web:capture --surface <id>` against that server); `img/` holds one 1440 light crop per set, for a person or the critic to see the line; open at most 3.

Calibrated 2026-10-08 on `claude-opus-5-5` at medium effort, each set scored in its own fresh context with Read, Grep and Glob only. An annotation below says only what that run confirmed.

| Exemplar                                             | Surface, crop key             | Planted edit (fail only)                                                                     | Run verdict | Deciding line                                                                                    |
| ---------------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| [fail-two-primaries](img/fail-two-primaries.png)     | `records-table`, `no-results` | `records-view.tsx`: Clear filters loses `variant="secondary"`                                | FAIL        | C-R03 Blocking: New record and Clear filters both filled, 6 of 6 `no-results` captures           |
| [fail-low-contrast](img/fail-low-contrast.png)       | `settings`, `saved`           | `settings-view.tsx`: helper class `text-muted-foreground` becomes `text-muted-foreground/40` | FAIL        | C-R09 / A-11 Blocking: helper text below AA by eye, every key, width and theme                   |
| [fail-unlabeled-input](img/fail-unlabeled-input.png) | `record-form`, `invalid`      | `form-body.tsx`: the Vendor name `FieldLabel` gains `sr-only`                                | FAIL        | C-R05 Blocking: Vendor name has no visible label in 7 of 8 keys (the skeleton keeps it)          |
| [pass-onboarding](img/pass-onboarding.png)           | `onboarding`, `beat-1`        | n/a                                                                                          | PASS        | No Blocking; one Should-fix (C-R10: the 390 `loading` skeleton is shorter than beat-1)           |
| [pass-record-form](img/pass-record-form.png)         | `record-form`, `invalid`      | n/a                                                                                          | PASS        | No Blocking; C-R05 every field labelled. Should-fix: C-R09 (destructive marks validation), C-R07 |
| [pass-record-detail](img/pass-record-detail.png)     | `record-detail`, `diff`       | n/a                                                                                          | PASS        | No Blocking; Should-fix: C-R04 (diff text about 14px), C-R10 (no `saved` toast captured), C-R02  |

What the exemplars teach:

- The planted defect and its clean twin share a surface (record-form both ways), so the verdict turns on the one line, not on the surface.
- A Blocking line is judged per key, per width and per theme: one capture fails the round even when the rest are clean.
- A pass exemplar keeps its Should-fix and Consider findings and still passes. Do not invent a Blocking finding to look thorough, and do not withdraw a real one to look kind.
- Not exemplars: `records-table` as built carries a real Blocking finding (C-R05: the filters are labelled by placeholder or value only), DEMO-17's to fix. `settings` as built was not calibrated: its `saved` capture shows no toast, which runs scored from Should-fix to Blocking. `delete-dialog` does not capture (DEMO-18).
- The missing-capture case: `pass-onboarding` with `offline-390-dark.png` removed scores `Coverage: 47/48`, C-R10 UNVERIFIED, `Verdict: FAIL`.
