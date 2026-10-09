# Review — delete-dialog, round 1
Model: claude-opus-5-5
Read: .claude/skills/tk-ui-critic/SKILL.md; docs/design/canon-rubric.md; docs/design/canon.md §2 (A-01 to A-20); apps/web/docs/design/DESIGN.md, tokens.md, components.md, anti-patterns.md, states.md; specs/web/epics/DEMO-records-demo/ux/demo/delete-dialog.md (there is no living copy: specs/web/ux/ holds only admin/ and experimental/); specs/web/epics/DEMO-records-demo/brief.md; apps/web/lib/demo/surfaces/delete-dialog.ts; apps/web/app/demo/(shell)/records/[id]/_components/delete-dialog.tsx; apps/web/app/demo/(shell)/_components/confirm-dialog.tsx; specs/web/epics/DEMO-records-demo/tickets/DEMO-015-motion-skill/evidence/motion-review.md (M lines); captures partial-390, partial-390-dark, partial-834, partial-834-dark, partial-1440, partial-1440-dark
Coverage: 6/24 files read; missing: deleting-390, deleting-390-dark, deleting-834, deleting-834-dark, deleting-1440, deleting-1440-dark, error-390, error-390-dark, error-834, error-834-dark, error-1440, error-1440-dark, offline-390, offline-390-dark, offline-834, offline-834-dark, offline-1440, offline-1440-dark

Top 3
1. Three of four keys (deleting, error, offline) have no captures at any width or theme: 18 of 24 files are missing. Every line stays UNVERIFIED for those keys until the set is captured.
2. The demo invents latency: `DELETE_MS = 900` exists only "so the pending state is seen". `?state=deleting` already reaches that state, so the timer should go.
3. At 390 the scrim stops partway down the full-page capture. History below it renders at full contrast and competes with the dialog, and the scrim's edge cuts through "Version 3".

Lines
C-R01 UNVERIFIED — 18 expected captures are missing; deleting, error and offline were never seen, so none of them is passed.
C-R02 UNVERIFIED — partial: the dialog is the single focal point at 834 and 1440; at 390 the History list below the scrim is not dimmed (1 issue). Other keys not captured.
C-R03 UNVERIFIED — partial: one solid destructive confirm, inside its confirmation, in all 6 files. Other keys not captured.
C-R04 UNVERIFIED — partial: 3 type sizes in the dialog; the body and notice line are about 14px, below the 16px reading minimum (1 issue). Other keys not captured.
C-R05 UNVERIFIED — partial: actions are outcome verbs ("Delete record", "Cancel"); there are no inputs and no empty eyebrows. Other keys not captured.
C-R06 UNVERIFIED — partial: the gaps between title/body, notice and actions are larger than the gaps inside each group; nothing looks off-scale. Other keys not captured.
C-R07 UNVERIFIED — partial: one dialog surface, no nested card, no stray border. Other keys not captured.
C-R08 UNVERIFIED — partial: no color or radius that matches no token; the source uses token utilities (confirm-dialog.tsx:91). Other keys not captured.
C-R09 UNVERIFIED — partial: destructive marks the loss action only; the notice is an icon plus text, not color alone; light and dark confirm text look above AA by eye. The error tone (text-destructive) was not captured.
C-R10 UNVERIFIED — 3 of the 4 captured-state keys in states.md are missing (1 Blocking issue); the pending spinner is absent in source (1 issue); Cancel's focus ring is visible in all 6 partial files.
C-R11 N/A — the dialog shows no numbers in a numeric role; the partial body drops the version count.
C-R12 3 issues — tk-motion review (DEMO-15 motion-review.md:18): M2, M8 and M10 have issues; M10 is that the scrim keeps --motion-duration-fast under reduced motion (alert-dialog.tsx:37). 6 PASS, 3 N/A. Never blocks.
C-R13 UNVERIFIED — partial: every element has a job; no decorative assets. Other keys not captured.
C-R14 UNVERIFIED — A-20 added latency at delete-dialog.tsx:19-20 (1 Blocking issue); Geist is a declared choice in DESIGN.md, so it is not A-01; no pixel tells in partial. Other keys not captured.
C-R15 N/A — no references file loaded for this run.
P-A01 UNVERIFIED — partial: title, body, notice and both actions keep the same words and rows at 390, 834 and 1440, light and dark; deleting, error and offline not captured.
Code lint: UNVERIFIED (tk-ui-code-lint not installed)

Findings
- [Blocking] C-R10 · deleting, error, offline · all widths, light and dark · apps/web/.captures/delete-dialog/ (18 files missing) · only partial-*.png exist; the rubric asks for every state in states.md to be captured (the default view does not count here; see Not covered).
- [Blocking] A-20 (C-R14) · deleting · n/a · apps/web/app/demo/(shell)/records/[id]/_components/delete-dialog.tsx:19-20, :91-94 · a 900ms setTimeout before an in-memory delete, commented "so the pending state is seen". That is added latency that says the system is working when it is not. The rule asks for acknowledgement within 400ms and real stages only; `?state=deleting` already shows the pending state.
- [Should-fix] C-R02 · partial · 390 light and dark · History region, about (0,700)-(390,1220); scrim edge near y≈897 across "Version 3" · the scrim covers only the first viewport, so Versions 3, 2 and 1 and "Back to PEM" render undimmed below the dialog. The page needs one focal point, with everything else receding.
- [Should-fix] C-R04 · partial · 390/834/1440 light and dark · dialog body and notice line, 1440 at about (515,395)-(925,480) · reading text is about 14px (`text-sm`, confirm-dialog.tsx:101; the body comes from the kit's AlertDialogDescription); the rubric asks for reading text of at least 16px.
- [Should-fix] C-R10 · deleting · n/a · apps/web/app/demo/(shell)/_components/confirm-dialog.tsx:127 · the pending confirm renders only the "Deleting" label, with no `spinner`. components.md (Pending) and the surface file (Deleting) require a spinner at the same width. Pixels unconfirmed because deleting-* is missing.
- [Consider] C-R02 · partial · 834, 1440 light and dark · dialog header, 1440 at about (515,360)-(925,435) · the title and the two-line body are centred (confirm-dialog.tsx:93 centres them from sm up). The surface file (delete-dialog.md:43) asks for left-aligned title and body at 1440, which also reads better than a centred multi-line body. The spec cannot set severity, so this stays at Consider.

Not covered: the default view (confirm, no `?state=`), which is not in the surface's capture keys; hover and active on Cancel and Delete record; Escape and scrim behaviour while deleting; focus moving back to Delete on close; the open/close fade and reduced-motion timing; measured contrast ratios (dark salmon confirm with dark text, and the muted notice line).
Reason: 18 of 24 expected captures are missing (deleting, error, offline UNVERIFIED), plus Blocking findings on C-R10 (missing states) and A-20 (900ms invented delay).
Verdict: FAIL

