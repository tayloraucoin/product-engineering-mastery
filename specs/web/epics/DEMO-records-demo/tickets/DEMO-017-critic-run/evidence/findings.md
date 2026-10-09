# Round-1 findings, each fixed or followed up

Every finding in `round-1/<surface>.md`, in the critic's order. **Fixed** names the file changed in `a73f355` and what round 2 saw on fresh captures. **Follow-up** names the drafted ticket and why it is not fixed here. Nothing was fixed that round 1 did not raise.

## delete-dialog (round 1 FAIL, round 2 FAIL)

| # | Sev | Line | Finding | Outcome |
| - | --- | ---- | ------- | ------- |
| 1 | Blocking | C-R10 | `deleting`, `error`, `offline` uncaptured (18 files) | **Follow-up DEMO-18**: the harness reads detail's root, not the dialog's; test tooling outside this ticket's paths. Still missing in round 2. |
| 2 | Blocking | A-20 | 900ms `setTimeout` before an in-memory delete | **Fixed** `app/demo/(shell)/records/[id]/_components/delete-dialog.tsx`: the delete runs at once, a ref stops a second press; `e2e/demo/delete-dialog.spec.ts` no longer waits to see "Deleting" mid-delete (Test changes). Round 2: no A-20. |
| 3 | Should-fix | C-R02 | 390 scrim stops at about y=897 in the full-page capture | **Follow-up DEMO-19**: a capture artifact (see `round-2.md`), harness fix. |
| 4 | Should-fix | C-R04 | body and notice about 14px | **Follow-up DEMO-20**: kit `AlertDialogDescription` is `text-sm`; needs a type ruling first. |
| 5 | Should-fix | C-R10 | pending confirm has no spinner | **Fixed** `app/demo/(shell)/_components/confirm-dialog.tsx`: `Spinner` beside "Deleting", same width. Pixels unverified until DEMO-18 captures `deleting`. |
| 6 | Consider | C-R02 | title and body centred, spec asks left-aligned at 1440 | **Follow-up DEMO-23** (dialog alignment). |

## settings (round 1 FAIL, round 2 PASS)

| # | Sev | Line | Finding | Outcome |
| - | --- | ---- | ------- | ------- |
| 1 | Blocking | C-R10 | `saved` shows no toast | **Fixed** `app/demo/(shell)/settings/_components/settings-view.tsx`: toasts go through the provider's `useToastManager()`; the module `toast` subscribed after the view's mount effect, so the mount toast was lost. Round 2: toast seen. |
| 2 | Should-fix | C-R10 | `partial` is a neutral alert with outline Retry | **Fixed** same file: destructive alert, solid Retry (components.md, D-DEMO-22). Round 2: PASS on C-R10's alert. |
| 3 | Should-fix | C-R10 | 390 loading skeletons do not copy the 390 layout | **Follow-up DEMO-22**. Round 2 raised it again. |
| 4 | Should-fix | C-R09 | Theme toggle-group selected segment only a faint fill | **Follow-up DEMO-21**: kit toggle look; the canvas draws it. |
| 5 | Consider | C-R13 | two theme controls in two orders | **Follow-up DEMO-21**. |
| 6 | Consider | C-R06 | 390 offline alert text wraps early | **Follow-up DEMO-23**. |

## onboarding (round 1 PASS, round 2 PASS)

| # | Sev | Line | Finding | Outcome |
| - | --- | ---- | ------- | ------- |
| 1 | Should-fix | C-R10 | 390 loading skeleton draws one title line and two body lines | **Fixed** `app/demo/welcome/_components/onboarding-view.tsx`: two title and three body bars below md. Round 2: "That closes the round-1 skeleton height issue." |
| 2 | Consider | C-R07 | beat-3 slot is a raised rounded-xl card | **Follow-up DEMO-23**. |
| 3 | Consider | C-R05 | inert dialog's buttons look live | **Follow-up DEMO-23**. |
| 4 | Consider | C-R07 | `empty` line has no bordered slot | **Follow-up DEMO-23**. |

## records-table (round 1 FAIL, round 2 PASS)

| # | Sev | Line | Finding | Outcome |
| - | --- | ---- | ------- | ------- |
| 1 | Blocking | C-R05 | vendor search has no visible label | **Fixed** `app/demo/(shell)/records/_components/table/records-toolbar.tsx`: a visible "Filter by vendor" label; the accessible name is unchanged. Round 2: "every input has a visible label". |
| 2 | Blocking | C-R05 | status and owner selects have no visible label | **Fixed** same file: visible "Status" and "Owner". Round 2: as above. |
| 3 | Should-fix | C-R14 / A-16 | placeholder used as the label | **Fixed** same file: placeholder removed, label above. |
| 4 | Should-fix | C-R06 | 834 "Annual value (USD)" overlaps "Renews" | **Fixed in part** `records-grid.tsx`: value column wider below lg (the canvas's 1440 proportions kept from lg). Round 2: no overlap, but about 4px apart and the header overshoots its figures: **Follow-up DEMO-23**. |
| 5 | Should-fix | C-R11 | "(USD)" covered by "Renews" at 834 | **Fixed** with #4: the unit reads. The edge alignment left is in DEMO-23. |
| 6 | Should-fix | P-A01 | loading shows 6 skeleton rows at 390, 14 at 1440 | **Fixed** `records-list.tsx`: 14 rows. Round 2 P-A01 PASS. |
| 7 | Should-fix | C-R04 | subtitle, alert and empty copy about 14px | **Follow-up DEMO-20**. |
| 8 | Consider | C-R10 | `deleted` toast covers data rows | **Follow-up DEMO-23**. |
| 9 | Consider | C-R10 | `loading` keeps New record enabled | **Follow-up DEMO-23**. |

## record-detail (round 1 PASS, round 2 PASS)

| # | Sev | Line | Finding | Outcome |
| - | --- | ---- | ------- | ------- |
| 1 | Should-fix | C-R10 | Current/Compare selected segment only a faint fill | **Follow-up DEMO-21**. |
| 2 | Should-fix | C-R10 | loading skeleton not the final layout | **Follow-up DEMO-22**: the largest skeleton rework; round 2 raised it again. |
| 3 | Should-fix | C-R10 | `saved` shows no toast | **Fixed** `app/demo/(shell)/records/[id]/_components/record-detail.tsx`: the provider's `useToastManager()`, as settings #1. |
| 4 | Should-fix | C-R04 | diff clause text about 14px | **Fixed** `app/demo/_components/diff.tsx`: `text-base`, as the spec's "base size" asks. Round 2: not raised. |
| 5 | Should-fix | C-R05 | `partial` Retry inherits the muted colour, reads disabled | **Fixed** `terms-section.tsx`: foreground text; it stays outline because Edit is the view's one primary (C-R03). Round 2: not raised. |
| 6 | Should-fix | C-R02 | `error` Retry is outline | **Fixed** `record-detail.tsx`: solid (D-DEMO-22). Round 2: "Retry alone in error". |
| 7 | Should-fix | C-R06 | history rows further apart than groups | **Follow-up DEMO-23**. |
| 8 | Consider | C-R05 | not-found outline button edge faint in light | **Follow-up DEMO-21** (round 2 raised it to Should-fix). |
| 9 | Consider | C-R07 | `partial` separator stacked on the alert border | **Follow-up DEMO-23**. |
| 10 | Consider | C-R10 | `empty`/`no-history` "3 days ago" contradicts the history | **Follow-up DEMO-23**. |

## record-form (round 1 FAIL, round 2 PASS)

| # | Sev | Line | Finding | Outcome |
| - | --- | ---- | ------- | ------- |
| 1 | Blocking | C-R03 | `dirty` 390 light: solid Save below a clipped scrim | **Follow-up DEMO-19**: a capture artifact. In a browser the fixed scrim covers the viewport at every scroll position; no app change alters the fullPage still. Round 2 scored the same pixels Should-fix. |
| 2 | Blocking | C-R03 | `dirty` 390 dark: the same | **Follow-up DEMO-19**, as #1. |
| 3 | Should-fix | C-R10 | Terms textarea half under the scrim | **Follow-up DEMO-19**, as #1. |
| 4 | Should-fix | C-R10 | `submitting` Annual value not dimmed | **Follow-up DEMO-21**: it carries the same `inputDim` class as its siblings; the cause is not traced. |
| 5 | Should-fix | C-R10 | loading skeleton lacks the helper rows | **Fixed** `app/demo/(shell)/records/_components/form/form-skeleton.tsx`: both helper lines as static text. Round 2: not raised. |
| 6 | Should-fix | C-R09 | date picker rest border and fill differ from inputs | **Follow-up DEMO-21**: the kit's date-picker trigger. |
| 7 | Should-fix | C-R04 | Terms text about 14px at 834 and 1440 | **Follow-up DEMO-20**. |
| 8 | Should-fix | C-R04 | 390 selects and date picker at 14px beside 16px inputs | **Follow-up DEMO-21**: kit control sizes. |
| 9 | Should-fix | P-A01 | 390 back link drops "Records" and "Edit" | **Coverage gap G-04** in `apps/web/docs/design/coverage-gaps.md`: the locked canvas and D-DEMO-20 draw it; DESIGN.md must rule. |
| 10 | Consider | C-R06 | offline alert wraps early | **Follow-up DEMO-23**. |
| 11 | Consider | C-R06 | dirty dialog centred text over right-aligned actions | **Follow-up DEMO-23** (dialog alignment, with delete-dialog #6). |

## Totals

46 findings: 7 Blocking, 26 Should-fix, 13 Consider. Fixed: 16, one of them in part (records-table #4, its remainder in DEMO-23). Followed up: 30, across DEMO-18 to DEMO-23 and coverage gap G-04. Of the 7 Blocking: 4 fixed (records-table ×2, settings `saved`, delete-dialog A-20), 2 capture artifacts (record-form `dirty` 390, DEMO-19), 1 harness defect (delete-dialog captures, DEMO-18).
