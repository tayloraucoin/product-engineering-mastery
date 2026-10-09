# Review — record-detail, round 2
Model: claude-opus-5-5
Read: .claude/skills/tk-ui-critic/SKILL.md; docs/design/canon-rubric.md; docs/design/canon.md §2 (## 2. to ## Changelog); apps/web/docs/design/DESIGN.md, tokens.md, components.md, anti-patterns.md, states.md; apps/web/lib/demo/surfaces/record-detail.ts; specs/web/epics/DEMO-records-demo/ux/demo/record-detail.md (no living specs/web/ux/ copy exists); specs/web/epics/DEMO-records-demo/brief.md
Coverage: 54/54 files read; missing: none

Top 3
1. The loading skeleton does not copy the final layout. It has no toggle block, its separators sit in different places, and the history bars are full-width lines at about half the final row pitch (states.md: "Skeletons copy each width's final layout").
2. The error view at 390 drops the record name. The back link reads only "Records", while 1440 names "Halvorsen Freight" in the breadcrumb (D-P01: width changes layout, never words; 1440 wins).
3. The empty view uses 5 type sizes, and its explanatory copy is about 14px reading text.

Lines
C-R01 PASS — all 54 expected captures present and read; every finding below cites a region
C-R02 PASS — one focal point per view (h1 and Edit, or the diff in compare); 390 reorders and widens Edit rather than shrinking 1440
C-R03 PASS — one solid primary per view (Edit; Retry alone in error); Delete stays the tint outside its dialog
C-R04 2 issues — empty uses 5 sizes; empty and not-found body copy at about 14px, by eye
C-R05 1 issue — not-found "Back to records" outline button in light barely reads as a button
C-R06 1 issue — history rows at 1440 sit as far apart as the Fields and Terms sections do
C-R07 1 issue — 3 radii on one screen, and an alert border directly under a separator (partial); notices differ in icon use (Consider)
C-R08 PASS — no colour, radius or shadow seen that matches no token in tokens.md or the preset roles
C-R09 PASS — the one hue marks loss only; the diff uses glyph and strike, not colour alone; no text clearly below AA by eye
C-R10 2 issues — loading skeleton is not the final layout; the selected toggle item is marked only by a faint fill
C-R11 PASS — "48,000 USD" / "52,000 USD" put the unit after the value; history dates are right-aligned on a shared baseline
C-R12 NOT RUN (no tk-motion review filed)
C-R13 PASS — no element without a stated job; the diff summary, badge and history each carry information
C-R14 PASS — no A-01 to A-20 tell seen (Geist is declared and reasoned in DESIGN.md, so it is not A-01); P-A02 holds: whole clauses marked by glyph and strike
C-R15 N/A — no references file loaded for this run
P-A01 1 issue — error at 390 loses the record name that 1440 shows
Code lint: UNVERIFIED (tk-ui-code-lint not installed)

Findings
- [Should-fix] C-R10 · loading 1440 light and dark · Terms block (336–1104, 244–420) and History block (336–1104, 462–594) · The skeleton has a separator above the Terms title (y≈244), where the loaded view puts one below the subtitle (y≈312). It has no block where the Current/Compare toggle sits (960–1104, 252–288). History is four full-width bars at about 28px pitch, where the final view has three-column rows at about 53px pitch (y 699–858 in diff-1440). states.md and the spec's loading row ask for every block at final size, toggle and history too.
- [Should-fix] C-R10 · loading 390 light and dark · Terms block (16–374, 423–600) and History block (16–374, 640–772) · No toggle block under the subtitle (final: 16–160, 499–535). History is four single bars, where the final view has two-to-three-line items at about 100px pitch. The skeleton should copy the 390 final layout.
- [Should-fix] C-R10 · diff 1440 light (also no-history, saved and offline at every width) · toggle group (960–1104, 252–288) · The selected item ("Compare" in diff, "Current" elsewhere) differs from its neighbour only by a faint muted fill, with the same weight and the same border. A selected state should sit clearly above rest.
- [Should-fix] P-A01 · error 390 light and dark · back link (16–90, 115–135) · Only "Records" shows, and "Halvorsen Freight" appears nowhere on the page. error-1440 names it in the breadcrumb (336–535, 80–100, D-DEMO-20). D-P01 says width never changes words, and the 1440 wording wins.
- [Should-fix] C-R04 · empty 1440 light and dark · whole view · 5 type sizes, by eye: h1 about 24px (336–537, 128–156); "No terms yet" about 18px (668–772, 340–360); "Terms" and "History" about 16px; labels and body about 14px; the "Active" badge about 12px. The cap is 4.
- [Should-fix] C-R04 · empty 1440 light (also not-found 1440 at 567–873, 210–252) · empty description (596–845, 375–415) · A two-line explanatory paragraph set at about 14px, by eye. Reading text should be at least 16px.
- [Should-fix] C-R05 · not-found 1440 light (same at 834 and 390 light) · "Back to records" (658–782, 271–305) · The outline button's border and shadow are nearly invisible on white, so it reads as plain text. The dark capture (657–783, 270–306) shows a clear border. An interactive element must look interactive.
- [Should-fix] C-R06 · diff 1440 light (same in partial, offline and saved) · History list (336–1104, 690–870) against Fields to Terms (336–1104, 226–256) · The gap between history rows is about 35px, the same as or more than the gap between the Fields block and the Terms section (about 30px). Space between groups should be greater than space within.
- [Should-fix] C-R07 · partial 1440 light and dark · badge (550–619, 132–151), buttons and toggle (985–1103, 125–159; 960–1104, 252–288), alert (336–1104, 325–440) · 3 radii on one screen: pill, about 6px and about 10px. The alert's border also sits about 13px under the Terms separator (y≈312), doubling the line where space would do.
- [Consider] C-R07 · offline 1440 light · notice (336–1104, 253–319) · The offline alert has no icon, while the partial (352–368, 340–356) and error alerts carry a warning icon. One notice pattern would read as one system.

Not covered: the default view without `?state=` (populated, current terms); hover, active and focus-visible on Edit, Delete, the toggle, breadcrumb and links; keyboard order (C-DEMO-record-detail-8); dialog and toast motion and reduced motion; the toast's timing and its overlap of content in the full-page 390 capture; measured contrast for the dark Delete tint label, the muted removed-clause text and the disabled Edit and Delete; aria wiring (del/ins, aria-disabled descriptions).
Verdict: PASS
