# Review — records-table, round 2
Model: claude-opus-5-5
Read: docs/design/canon-rubric.md; docs/design/canon.md §2 (A-01 to A-20); apps/web/docs/design/DESIGN.md, tokens.md, components.md, anti-patterns.md, states.md; specs/web/epics/DEMO-records-demo/ux/demo/records-table.md (no living specs/web/ux/demo/ copy exists); specs/web/epics/DEMO-records-demo/brief.md; apps/web/lib/demo/surfaces/records-table.ts
Coverage: 42/42 files read; missing: none

Top 3
1. At 834 the table header runs "Annual value (USD)" into "Renews" with about 4px between them, and the header's right edge overshoots the figures in its column (every key with a table or skeleton: loading, partial, offline, deleted).
2. At 834 the loading skeleton's longest Vendor bars (rows 3 and 10) run right up to the Owner bars with no gutter, so the skeleton does not copy the final 834 layout's column spacing.
3. Polish: several radii on one screen (pill badges, ~6px controls, ~10px notice and toast), and the ~14px body copy in notices and empties sits below the 16px reading size.

Lines
C-R01 PASS — every finding below cites a key, width, theme and pixel region
C-R02 PASS — desaturated, New record and the table or list are the focal path at each width; 390 reflows to a two-line list and is not a shrunk 1440
C-R03 PASS — one solid action per view: New record, or Retry on error with New record outline; Clear filters is secondary; no destructive primary
C-R04 1 issue — at most 4 sizes per view (h1 ~20, empty heading ~18, body ~14, badge ~12; the 390 input ~16 replaces one); notice and empty body copy reads ~14px
C-R05 1 issue — every input has a visible label (Filter by vendor, Status, Owner, Sort); verbs are outcomes; the light outline New record on error has little edge
C-R06 2 issues — 834 header collision; 834 skeleton bars without a gutter
C-R07 1 issue — no nested cards; the notices use full borders, not stripes; more than one radius on a screen
C-R08 PASS — no color, radius or shadow seen that matches no token; neutral palette with --destructive only for loss
C-R09 PASS — Terminated uses a cross plus a tint, not color alone; error copy is destructive on a neutral surface; no decorative accent; contrast by eye looks AA in both themes
C-R10 1 issue — every states.md key for this surface is captured and the empties are designed; in loading the search field looks the same as enabled while the selects are dimmed
C-R11 1 issue — figures are tabular and right-aligned, with the unit in the header; at 834 the header's right edge does not line up with the figures
C-R12 NOT RUN (no tk-motion review filed)
C-R13 PASS — no element without a job; the toast names the deleted record and gives the reset note
C-R14 PASS — loading uses a skeleton, not a spinner (A-18); notices use an icon and text, not a stripe (A-05); Geist is chosen in DESIGN.md (not A-01); no urgency or fabricated behavior
C-R15 N/A — no references file loaded for this run
P-A01 PASS — each key keeps the same words and rows at 390, 834 and 1440; the 390 one-line row is the change D-DEMO-15 allows; the 40 or 39 rows and the three "Not loaded" owners match across widths
Code lint: UNVERIFIED (tk-ui-code-lint not installed)

Findings
- [Should-fix] C-R06 · partial, offline, deleted, loading 834 light and dark · table header row, about x 520–710, y 270–285 (partial/offline y ~370) · "Annual value (USD)" ends ~650 and "Renews" starts ~654, about 4px apart, so the two headers read as one phrase; space between columns must be greater than space within a label.
- [Should-fix] C-R06 · loading 834 light and dark · Vendor skeleton bars, rows 3 and 10, x 40–236, y ~390 and ~650 · the bars end where the Owner bars start (x ~236) with no gutter, unlike the 1440 skeleton and the final 834 rows; the skeleton should keep the column gap.
- [Should-fix] C-R11 · partial, offline, deleted, loading 834 light and dark · Annual value column, header ~x 526–650 vs figures right edge ~637 · the header's right edge sits ~13px past the right-aligned figures, so header and column do not share the right edge (at 1440 both end at ~1057).
- [Should-fix] C-R04 · empty, no-results, error, partial, offline 1440 light (same at all widths and themes) · empty description (x 597–843, y 275–315), no-results line (x 558–882, y 362–378), notice body (x 187–836, y 295–311) · reading copy is ~14px by eye; the rubric asks for reading text of at least 16px.
- [Should-fix] C-R07 · partial 1440 light · status badges (pill, e.g. x 728–797, y 400–418), select and input (~6px, x 144–736, y 198–234), "Some owners did not load" notice (~10px, x 144–1296, y 258–326) · three radii on one screen; the rule asks for one radius per screen.
- [Consider] C-R10 · loading 1440 light and dark (also 834 and 390) · toolbar, x 144–736, y 198–234 · the Status and Owner selects show muted text as disabled while the search field looks the same as its enabled state in partial; the spec asks for every control to be disabled with its label, so the disabled look should match across all three.
- [Consider] C-R05 · error 1440 light (same at 834 and 390 light) · New record, x 1180–1295, y 105–139 · the outline button shows almost no border on white, only a faint shadow, so it barely reads as a control next to the solid Retry; in dark the border is clear.

Not covered: the default view without ?state= (not in the surface's capture keys); hover, focus and active on sort headers, rows, selects and buttons; focus visibility and focus moving to the h1 on deleted or to search after Clear filters; motion and reduced motion (sort and filter re-rendering in place, the toast entering, whether the skeletons shimmer); measured contrast ratios; the toast's place in the viewport (the full-page captures show it over the Glenrock and Halvorsen rows at 1440 and 834 and over Delmar at 390); keyboard-only use at 390 (C-DEMO-records-table-9).
Verdict: PASS
