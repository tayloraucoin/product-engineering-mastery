# Review — settings, round 2
Model: claude-opus-5-5
Read: .claude/skills/tk-ui-critic/SKILL.md; docs/design/canon-rubric.md; docs/design/canon.md §2 (A-01 to A-20); apps/web/docs/design/DESIGN.md, tokens.md, components.md, anti-patterns.md, states.md; specs/web/epics/DEMO-records-demo/ux/demo/settings.md (no living specs/web/ux/ copy exists); specs/web/epics/DEMO-records-demo/brief.md; apps/web/lib/demo/surfaces/settings.ts
Coverage: 42/42 files read; missing: none

Top 3
1. The loading skeletons do not copy each width's final layout: at 390 the two Demo buttons are full-width but their skeletons are 160px blocks, and at 1440 the Demo group sits 12px lower than in the loaded page (states.md, A-18 alternative).
2. Two dark-theme controls need a contrast measurement. The unselected radio rings are faint on the near-black page, and the selected Theme segment is marked only by a faint fill.
3. There are three corner radii on one screen: buttons and the toggle group are about 6px, alerts and the shell theme toggle about 10px, the toast and dialog about 14px.

Lines
C-R01 PASS — every finding below cites a key, width, theme and pixel region; the default view is listed under Not covered
C-R02 PASS — desaturated, the h1 and group h2s lead and helpers recede; in partial the one solid Retry is the focal point
C-R03 PASS — at most one solid action per view (Retry in partial); the solid destructive "Reset data" appears only inside its confirm
C-R04 PASS — four sizes or fewer (h1, dialog title, h2, 14px UI text); labels and helpers are control text, not reading prose
C-R05 PASS — Theme, Compact rows and Default sort each have a visible label and helper; actions are outcome verbs ("Replay onboarding", "Reset demo data", "Retry", "Reset data")
C-R06 PASS — gaps between groups (about 44px plus a separator) are larger than gaps inside a group (about 20–28px); the values look on-scale
C-R07 1 issues — three radii on one screen
C-R08 PASS — the pixels show no colour, radius or shadow outside the neutral and destructive roles; the token lint covers the rest
C-R09 1 issues — dark radio rings and the selected Theme segment look low-contrast by eye; destructive red is used only for loss and failure
C-R10 1 issues — all 7 keys captured, focus ring visible on Cancel in reset, empty state designed; loading skeletons diverge from the final layout
C-R11 N/A — no numeric columns or values on this surface
C-R12 NOT RUN (no tk-motion review filed)
C-R13 PASS — every element has a stated job in settings.md
C-R14 1 issues — the same intent (theme) appears in two option orders on one screen; no other tell seen (Geist is chosen with a reason in DESIGN.md, so A-01 does not apply; alerts use icon plus text, no stripe)
C-R15 N/A — no references file loaded for this run
P-A01 PASS — each key keeps the same words and rows at 390, 834 and 1440; only placement changes ("Back to PEM" moves to a footer, the reset buttons stack, the shell toggle wraps to a second row)
Code lint: UNVERIFIED (tk-ui-code-lint not installed)

Findings
- [Should-fix] C-R10 · loading 390 light/dark · Demo group, skeletons at x16–176 y749–784 and x16–160 y853–888 · the loaded page has full-width "Replay onboarding" and "Reset demo data" buttons (x16–374, saved-390/empty-390), but the skeletons are short left-aligned blocks, and the Theme skeleton is about 208px wide against a 166px toggle group; states.md asks skeletons to copy each width's final layout.
- [Should-fix] C-R10 · loading 1440 light/dark · Records group, y415–510, and Demo h2 at y585 · the gap from "Default sort" to the first skeleton row is about 30px against about 18px when loaded, which pushes the Demo h2 to y585 (y573 when loaded, saved-1440). The Theme skeleton (x800–1008) is wider than the real toggle group (x842–1008); the skeleton should match the final geometry.
- [Should-fix] C-R09 · saved/empty/error 1440, 834 and 390 dark · unselected radio rings, e.g. x432–448 y453–497 at 1440 · the rings read as dark grey on the near-black page, below a 3:1 non-text contrast by eye; this needs a measured check against the dark `--input`/`--border` token.
- [Should-fix] C-R09 · saved/empty 1440 light and dark · Theme toggle group, selected segment x909–958 y206–242 · the selected option is marked only by a faint background fill, with no second cue (the shell toggle uses a dot); this needs a measured check of the fill against its neighbours, or a second cue.
- [Should-fix] C-R07 · saved 1440 light · buttons and toggle group (e.g. "Replay onboarding" x863–1008 y604–640) about 6px; shell theme toggle x1156–1408 y7–49 and alerts (error-1440 x432–1008 y513–581) about 10px; toast x1040–1424 y806–884 and reset dialog (reset-1440 x495–945 y358–542) about 14px · three radii on one screen; Shift Nudge's rule is one radius per screen.
- [Consider] C-R14 A-17 · saved 1440 light · shell toggle x1156–1408 y7–49 reads "Light, Dark, System" while the page toggle group x842–1008 y206–242 reads "System, Light, Dark" · one intent shown in two orders on the same screen; the spec ties both to the same state, so one order should be used everywhere.
- [Consider] C-R13 · saved 390 light/dark · toast x16–374 y807–883 · the toast covers the "Demo data" helper and the "Reset demo data" button while it shows; a toast should not cover a control on the focal column.
- [Consider] C-R01 · reset 390 light/dark · "Back to PEM" at y920 · the dialog backdrop dims only the viewport, so the footer link below it shows at full strength in the full-page still. This is probably a capture artifact from a fixed overlay; confirm it on a device.
- [Consider] C-R09 · error 1440 light vs partial 1440 light · Retry at x937–995 y531–563 is outline, while partial's Retry at x938–994 y424–454 is solid · D-DEMO-22 rules on a failed load (partial), not a failed save (error), so this may be intended; the same label in two styles is worth a ruling.

Not covered: the default view (no `?state=`, the populated artboard) was not captured; hover and active on every control; focus on every control except Cancel in reset; the Compact rows "on" state; theme and sort changes applying live and surviving a reload; toast entry and exit and dialog opacity motion; reduced motion; measured contrast ratios; keyboard-only operation at 390 (C-DEMO-settings-8).
Verdict: PASS
