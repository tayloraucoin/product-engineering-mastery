# Motion review — delete dialog (DEMO-15 C2)

Run once with `tk-motion` `references/review.md`, on the code of DEMO-12 (`apps/web/app/demo/(shell)/_components/confirm-dialog.tsx:91`, `packages/ui/src/primitives/feedback/alert-dialog/alert-dialog.tsx:37,59`). Static code read; nothing recorded, so timing is UNVERIFIED-IN-RENDER. Motion line: `delete-dialog.md` Access (opacity only, in 250ms, out 200ms, keyboard or reduced motion at once).

M1: PASS — the fade is a state change (dialog opened or closed); no animation without a job.
M2: issue — no keyboard gate: nothing sets `data-input="keyboard"` or skips the fade for a dialog opened by shortcut, so "opened by keyboard appears at once" is not met (`confirm-dialog.tsx:91`). Should-fix.
M3: N/A — no data values, rows or counters animate in this dialog.
M4: PASS — high-stress path is opacity only: `fade-in-0`/`fade-out-0`, no zoom, shake, pulse or bounce (`alert-dialog.tsx:59`; error notice is static text, `confirm-dialog.tsx:101`).
M5: PASS — only `duration-(--motion-duration-*)` tokens; no raw ms or cubic-bezier. (`DELETE_MS = 900` in `delete-dialog.tsx:20` is the fixture's pending delay, not a transition.)
M6: PASS — no ease-in, bounce or spring in the dialog.
M7: PASS — opacity only; no layout properties, no `backdrop-filter`, no blur.
M8: issue — enter `--motion-duration-moderate` 250ms is right; exit `--motion-duration-base` 180ms is the nearest token to 200ms, so the contract's "out at 200ms" has no token and runs 20ms short (`confirm-dialog.tsx:91`). Consider.
M9: N/A — a modal: no trigger origin; no scale is applied.
M10: issue — `motion-reduce:duration-(--motion-duration-instant)` is on the content only; the scrim keeps `--motion-duration-fast` (`alert-dialog.tsx:37`), so under reduced motion the scrim fades while the dialog appears at once. Should-fix.
M11: N/A — retired for this repo (map-camera check, cut at install).
M12: PASS — a confirm over a record is occasional, not tens of times a day; the catalog treatment is not exceeded.

Summary: 3 issues (M2, M8, M10), 6 PASS, 3 N/A. For DEMO-17: gate the fade on keyboard-opened, mirror `motion-reduce` on the scrim, decide whether 180ms exit or a new token.
