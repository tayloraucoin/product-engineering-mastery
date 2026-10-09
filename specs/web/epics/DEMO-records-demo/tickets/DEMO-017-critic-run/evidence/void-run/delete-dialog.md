# Review — delete-dialog, round 1
Model: claude-opus-5-5
Read: docs/design/canon-rubric.md; docs/design/canon.md (§2, read in full); apps/web/docs/design/DESIGN.md, tokens.md, components.md, anti-patterns.md, states.md; apps/web/lib/demo/surfaces/delete-dialog.ts; apps/web/lib/demo/surfaces/types.ts. Not found: the surface file (tried specs/web/ux/demo/delete-dialog.md, specs/web/ux/delete-dialog.md, specs/web/epics/DEMO-records-demo/ux/demo/delete-dialog.md and …/ux/delete-dialog.md) and specs/web/epics/DEMO-records-demo/brief.md. This checkout does not hold them, and this run had no Glob or Grep tool, so captures and specs were found by reading each expected path directly.
Coverage: 6/24 files read; missing: deleting-390, deleting-390-dark, deleting-834, deleting-834-dark, deleting-1440, deleting-1440-dark, error-390, error-390-dark, error-834, error-834-dark, error-1440, error-1440-dark, offline-390, offline-390-dark, offline-834, offline-834-dark, offline-1440, offline-1440-dark

Top 3
1. Three of the four keys (deleting, error, offline) have no captures at any width or theme, so 18 of 24 files are missing. C-R10 and P-A01 cannot be scored for those keys. This matches the capture-harness defect drafted as DEMO-18.
2. At 390, the scrim stops partway down the page. Below about y≈870 the record detail's History (Version 3 to Version 1) shows at full contrast under a modal dialog, so the page no longer has one focal point.
3. The dialog's description and notice text look about 14px by eye, below the 16px reading-text floor. Measure them against the text-style token.

Lines
C-R01 PASS — every finding below cites a key, width, theme and pixel region
C-R02 1 issue — at 390 the scrim does not cover the lower page, so History competes with the dialog
C-R03 PASS — one solid destructive "Delete record", and only inside its confirmation; Cancel is outlined
C-R04 1 issue — the description and notice look about 14px by eye; the dialog uses 2 to 3 sizes
C-R05 PASS — the confirm reads "Delete record", the title names the object and the body states the consequence; there are no inputs
C-R06 PASS — groups are spaced wider than their contents (title to body, then body to notice, then notice to actions)
C-R07 PASS — one dialog surface, no nested card; the notice is an icon-and-text line, not an alert box (as components.md requires)
C-R08 PASS — no region shows a color, radius or shadow outside the token set; source not grepped (no Grep this run)
C-R09 PASS — the one hue, destructive, marks loss only; dark mode flips to dark text on a light tint; text contrast in the dialog looks AA by eye
C-R10 UNVERIFIED — deleting, error and offline have no captures; on partial, Cancel's focus ring is visible at every width and theme
C-R11 N/A — the dialog shows no numbers
C-R12 NOT RUN (no tk-motion review found in this checkout; Grep unavailable to search specs/web/)
C-R13 PASS — every visible element has a job (title, consequence, notice icon and text, two actions); the brief's job lines were not read
C-R14 PASS — none of A-01 to A-20 visible: no blur, gradient, accent stripe or urgency copy; Geist is a declared choice (DESIGN.md Type)
C-R15 N/A — no references file loaded for this run
P-A01 UNVERIFIED — partial keeps the same words and rows at 390, 834 and 1440, and only the button order changes (stacked at 390, inline at 834 and 1440), which is layout; deleting, error and offline cannot be compared
Code lint: UNVERIFIED (tk-ui-code-lint not installed)

Findings
- [Blocking] C-R10 · deleting, error, offline · all widths, light and dark · apps/web/.captures/delete-dialog/ · 18 expected captures do not exist, so these three states from states.md are not evidenced; C-P08 asks for every reachable state to be captured (UNVERIFIED, never passed)
- [Should-fix] C-R02 · partial 390 light and dark · scrim edge at about y≈870 down to 1248, x 0–390 · History rows "Version 3" to "Version 1" and "Back to PEM" render at full contrast below the scrim (the scrim edge also cuts across the "Version 3" label), while everything above is dimmed; under a modal the backdrop should recede uniformly. It may be a full-page capture of a scrim fixed to the viewport, so confirm in a live 390 viewport.
- [Should-fix] C-R04 · partial 834, 1440 and 390, light and dark · dialog body at about x 520–920, y 395–480 at 1440 · the description ("The record and its terms are removed…") and the notice line look about 14px by eye; reading text should be 16px or more. Measure against the text-style token.

Not covered: the default view without `?state=`; the deleting, error and offline states; hover and active on Cancel and "Delete record"; the fade-in and fade-out motion (opacity only per DESIGN.md); measured contrast ratios; Escape and scrim-click dismissal and where focus returns.
Reason: 18 of 24 expected captures are missing (deleting, error, offline), leaving C-R10 and P-A01 UNVERIFIED and a Blocking state-coverage finding; the surface file and the epic brief were also not present to read.
Verdict: FAIL
