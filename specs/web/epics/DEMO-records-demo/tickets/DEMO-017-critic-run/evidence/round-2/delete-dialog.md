# Review — delete-dialog, round 2
Model: claude-opus-5-5
Read: docs/design/canon-rubric.md; docs/design/canon.md §2 (A-01 to A-20); apps/web/docs/design/DESIGN.md, tokens.md, components.md, anti-patterns.md, states.md; specs/web/epics/DEMO-records-demo/ux/demo/delete-dialog.md (no living specs/web/ux/demo/ copy exists); specs/web/epics/DEMO-records-demo/brief.md; apps/web/lib/demo/surfaces/delete-dialog.ts; specs/web/epics/DEMO-records-demo/tickets/DEMO-015-motion-skill/evidence/motion-review.md; apps/web/app/demo/(shell)/_components/confirm-dialog.tsx; packages/ui/src/primitives/feedback/alert-dialog/alert-dialog.tsx
Coverage: 6/24 files read; missing: deleting-390, deleting-390-dark, deleting-834, deleting-834-dark, deleting-1440, deleting-1440-dark, error-390, error-390-dark, error-834, error-834-dark, error-1440, error-1440-dark, offline-390, offline-390-dark, offline-834, offline-834-dark, offline-1440, offline-1440-dark

Top 3
1. Capture the 18 missing files. `deleting`, `error` and `offline` have no capture at any width or theme, so their states, the error line's colour and the disabled-confirm treatment can't be scored. This is the same capture-harness gap DEMO-18 names.
2. At 834 and 1440, the title, body and notice are centred while the actions are right-aligned. The surface file asks for left-aligned text at 1440, so the dialog has two alignment axes.
3. At 390, the scrim ends partway down the page, and History below about y≈895 renders undimmed and competes with the dialog.

Lines
C-R01 PASS — every finding below cites a region or file:line; the uncaptured keys are marked UNVERIFIED, never passed
C-R02 2 issues — in partial, the dialog is the focal point at every width, but the 390 page shows undimmed content below the scrim and 834/1440 mix centred text with right-aligned actions
C-R03 PASS — one primary in the dialog: the solid destructive "Delete record" inside its own confirmation, with "Cancel" as outline
C-R04 1 issue — three sizes in the dialog (title, body, button), but the body reads at about 14px, under the 16px reading minimum
C-R05 PASS — the actions are outcome verbs ("Delete record", "Cancel"), the notice is an icon and a sentence, and the dialog has no inputs
C-R06 PASS — the space between groups (title and body, then notice, then actions) is larger than the space inside them at all three widths
C-R07 PASS — one dialog surface with a hairline ring, one radius each for the dialog and the buttons, no nested card, and the notice is not boxed (D-DEMO-17)
C-R08 PASS — every colour, radius and spacing seen matches a token; confirm-dialog.tsx:92 uses only token classes
C-R09 PASS — in partial, destructive marks only the confirm, the notice is in the muted foreground, and contrast by eye looks above AA in both themes
C-R10 UNVERIFIED — deleting, error and offline are not captured; partial is captured and designed, and the focus ring on Cancel is visible in all 6 files
C-R11 N/A — the dialog shows no numbers in partial
C-R12 2 issues — the tk-motion review (DEMO-015 evidence/motion-review.md) found: M2 Should-fix (no keyboard gate, confirm-dialog.tsx:91), M8 Consider (exit 180ms against the 200ms the spec asks), M10 Should-fix (the scrim keeps its fade under reduced motion, alert-dialog.tsx:37); never blocks
C-R13 PASS — every element in the dialog has a stated job
C-R14 PASS — none of A-01 to A-20 is seen in partial; Geist is declared in DESIGN.md, so not A-01; A-20 can't be checked for deleting until it is captured
C-R15 N/A — no references file was loaded for this run
P-A01 PASS — partial keeps the same words and rows at 390, 834 and 1440; only line wraps and the action stacking change
Code lint: UNVERIFIED (tk-ui-code-lint not installed)

Findings
- [Blocking] C-R10 · deleting, error, offline · 390/834/1440 · light and dark · apps/web/.captures/delete-dialog/ (18 files missing) · No capture exists for three of the four keys. The rubric requires every state in states.md to be captured; UNVERIFIED per C-R01.
- [Should-fix] C-R02 · partial · 834 and 1440 · light and dark · the dialog header and notice (1440 ≈ x495–945, y360–480) and confirm-dialog.tsx:94 · The title, body and notice are centred (`sm:…place-items-center sm:…text-center`, and the notice uses `justify-center`, confirm-dialog.tsx:102) above right-aligned actions, giving two alignment axes. delete-dialog.md's 1440 layout says "title and body left-aligned".
- [Should-fix] C-R02 · partial · 390 · light and dark · the page below the dialog, about x0–390, y895–1248 · The scrim stops at about y≈895: "Version 3" is cut through by the scrim edge, and Versions 3, 2 and 1 and "Back to PEM" render at full contrast below it. The dimmed page should recede as a whole. This may come from a fixed `inset-0` overlay (alert-dialog.tsx:37) in a full-page capture; check it at a real viewport height.
- [Should-fix] C-R04 · partial · 390/834/1440 · light and dark · the dialog body, e.g. 1440 ≈ x520–920, y395–435, and alert-dialog.tsx:140 · The body "The record and its terms are removed…" and the notice line (confirm-dialog.tsx:102) are `text-sm`, about 14px by eye. The rubric asks for reading text of 16px or more.
- [Should-fix] C-R12 · all keys · motion · confirm-dialog.tsx:91, alert-dialog.tsx:37 · M2: a keyboard-opened dialog still fades. M10: under reduced motion the scrim fades while the dialog appears at once (DEMO-015 motion-review.md).
- [Consider] C-R12 · all keys · motion · confirm-dialog.tsx:91 · M8: the exit runs on `--motion-duration-base`, 180ms, against the 200ms the spec asks for, and no token has 200ms.

Not covered: the default confirm view without `?state=` (not in the surface's `keys`); hover and active on Cancel and Delete record; the scrim and Escape behaviour; focus trapping and the return of focus to Delete; the 250/200ms fade; measured contrast of the dark-theme confirm (a light destructive fill with dark text) and of the muted notice text; reduced-motion rendering
Reason: 18 of 24 expected captures are missing (deleting, error and offline at every width and theme), which leaves C-R10 UNVERIFIED and raises a Blocking missing-state finding
Verdict: FAIL
