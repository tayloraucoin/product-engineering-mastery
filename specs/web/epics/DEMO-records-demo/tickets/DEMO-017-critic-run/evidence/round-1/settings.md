# Review — settings, round 1
Model: claude-opus-5-5
Read: docs/design/canon-rubric.md; docs/design/canon.md §2 (## 2. to ## Changelog); apps/web/docs/design/DESIGN.md; apps/web/docs/design/tokens.md; apps/web/docs/design/components.md; apps/web/docs/design/anti-patterns.md; apps/web/docs/design/states.md; specs/web/epics/DEMO-records-demo/ux/demo/settings.md (no living specs/web/ux/demo/ copy exists); specs/web/epics/DEMO-records-demo/brief.md; apps/web/lib/demo/surfaces/settings.ts
Coverage: 42/42 files read; missing: none

Top 3
1. The `saved` state shows no confirmation. No toast appears in any of its six captures, so the screen looks the same as the default apart from the radio, and the person cannot see that the change took (C-R10).
2. The `partial` failed load uses a neutral info alert with an outline Retry. components.md asks for a destructive alert with a solid primary Retry (C-R10).
3. The selected segment of the Theme toggle-group is marked only by a faint fill, so it is hard to tell which option is on (C-R09). The loading skeletons at 390 also do not copy the 390 layout (C-R10).

Lines
C-R01 PASS — every finding below cites a key, width, theme and a region or file:line.
C-R02 PASS — in greyscale the h1 and the h2 groups lead and helper text recedes; at 390 the layout puts controls first rather than shrinking the 1440 view (full-width buttons, stacked theme group).
C-R03 PASS — no primary-styled action on the page; the only solid destructive action is "Reset data", inside its own confirm.
C-R04 PASS — four sizes seen (h1 ~20, dialog title ~18, h2 ~16, body and helper ~14).
C-R05 PASS — every control has a visible label (Theme, Compact rows, Default sort legend, row labels); action labels name the outcome ("Retry", "Reset data").
C-R06 PASS — space between groups (separator plus ~40px) is greater than space within a group (~20–28px); no off-scale gap seen.
C-R07 PASS — one separator between groups; alerts are single surfaces, not nested; no stray shadows.
C-R08 PASS — no color, radius or shadow seen that falls outside the token set (neutral palette, the destructive hue only for loss).
C-R09 1 issue — the selected segment of the Theme toggle-group is marked by a low-contrast fill alone.
C-R10 3 issues — `saved` shows no confirmation; the `partial` load failure breaks components.md; the 390 loading skeletons do not match the 390 layout. Focus is visible on Cancel in `reset`.
C-R11 N/A — no numeric data on this surface.
C-R12 NOT RUN (no tk-motion review filed)
C-R13 1 issue — two theme controls on every capture, with different option orders and different selected styles.
C-R14 PASS — no tell from A-01 to A-20 seen. Geist is the declared, reasoned choice (DESIGN.md "Type"), so it is not A-01. Loading uses skeletons, not a spinner (A-18 avoided). No accent stripes, gradients or glass.
C-R15 N/A — no references file was loaded for this run.
P-A01 PASS — each key keeps the same words and rows at 390, 834 and 1440. Only the layout changes: "Back to PEM" moves to the foot at 390, the theme group and buttons stack, and the dialog buttons stack.
Code lint: UNVERIFIED (tk-ui-code-lint not installed)

Findings
- [Blocking] C-R10 · saved 390/834/1440 light and dark · whole viewport, including the bottom-right and bottom-centre toast areas (1440: ~1040–1440 × 700–900; 390: full page) · No toast shows anywhere. The only visible difference from the defaults is the "Renewal date, soonest first" radio (1440 ~432,461). The surface's States row (settings.md:66) defines `saved` as "the toast confirms", so this state's reason to exist is never rendered. The rule asks that every state be designed and captured.
- [Should-fix] C-R10 · partial 390/834/1440 light and dark · Records group alert (1440 ~432–1008 × 405–473; 390 ~16–374 × 488–556) · The alert is neutral, with an info icon and foreground text, and "Retry" is outline. components.md:10 rules "Retry after a failed load: destructive `alert`; Retry is the solid primary". The `error` key on the same screen does use a destructive alert, so one meaning (it did not work) gets two treatments.
- [Should-fix] C-R10 · loading 390 light and dark · Demo group skeletons (~16–176 × 749–785 and ~16–160 × 853–889) and the Theme skeleton (~16–224 × 291–327) · The skeletons are fixed-width blocks of 144–208px. The final 390 layout has full-width 358px buttons and a ~166px toggle group. At 1440 and 834 the radio skeletons also sit ~12px lower, which pushes the Demo group down from y≈573 to y≈585. states.md:18 asks that skeletons copy each width's final layout.
- [Should-fix] C-R09 · saved/empty/error/partial/offline 390/834/1440 light and dark · settings Theme toggle-group (1440 ~842–1008 × 206–242; 390 ~16–182 × 291–327) · The active segment ("Light" in light, "Dark" in dark) differs from its neighbours only by a faint grey fill, with no weight, dot or border change. By eye it is below 3:1 against the unselected segments. The shell's theme toggle marks the same choice with a dot plus a fill. Selection should not rest on a near-invisible tone; needs a measured check of that region.
- [Consider] C-R13 · every key, 390/834/1440 light and dark · shell header theme toggle (1440 ~1156–1408 × 8–48) and settings Theme row (1440 ~842–1008 × 206–242) · Two controls for one setting sit on one screen. The header reads "Light, Dark, System" with a dot marker; the page reads "System, Light, Dark" with a fill marker. The spec asks for both controls (settings.md "Same state as the shell's theme-toggle"). At minimum the order and the selected style should match.
- [Consider] C-R06 · offline 390 light and dark · offline alert body text (~59–310 × 236–292) · The description wraps at about 250px inside a 358px alert, leaving ~60px of unused right gutter ("Theme / and Replay onboarding"). The text measure looks narrower than the alert's content box.

Not covered: the default view (no `?state=`, the `populated` key in settings.md) is not in the capture set. Also not covered: hover, active and pressed states on the toggle-group, switch, radios and buttons; keyboard focus on any page control other than Cancel in `reset`; the toast's own appearance and timing, including whether it exists and was missed by capture timing; dialog open and close motion and reduced motion; skeleton shimmer; measured contrast ratios (the toggle-group selected fill, the dimmed disabled rows in `offline`, the destructive text on the dark alert); compact-row behaviour in the table; theme persistence across reload.
Reason: one Blocking finding. The `saved` state never shows its confirming toast in any of its six captures (C-R10).
Verdict: FAIL

