# Review — records-table, round 1
Model: claude-opus-5-5
Read: docs/design/canon-rubric.md; docs/design/canon.md §2 (A-01 to A-20); apps/web/docs/design/DESIGN.md, tokens.md, components.md, anti-patterns.md, states.md; specs/web/epics/DEMO-records-demo/ux/demo/records-table.md (no living specs/web/ux/demo copy exists); specs/web/epics/DEMO-records-demo/brief.md; apps/web/lib/demo/surfaces/records-table.ts; apps/web/app/demo/(shell)/records/_components/table/records-toolbar.tsx (lines 50-75)
Coverage: 42/42 files read; missing: none

Top 3
1. Give the vendor search a visible label. Right now the placeholder "Filter by vendor" is the only visible label, and it disappears once someone types (on no-results only "Zephyr" is left). The status and owner selects have the same problem: their visible text is the current value ("Terminated"), not the field's name. This is Blocking under C-R05 and A-16.
2. Fix the table header at 834: "Annual value (USD)" runs into "Renews", so both labels and the unit are unreadable. This shows on every 834 key that has a table header, in light and dark.
3. Make loading show the same number of skeleton rows at every width. It shows 14 rows at 834 and 1440 but 6 at 390, which breaks P-A01's rule that a key keeps the same rows at every width.

Lines
C-R01 PASS — every finding cites a key, width, theme and region or file:line.
C-R02 PASS — desaturated, the h1 and the table or list are the focus at every width; secondary text recedes; at 390 it becomes a list rather than a shrunk table.
C-R03 PASS — at most one solid action per view (New record, or Retry on error with New record outline); no destructive primary on this surface.
C-R04 1 issue — at most 4 sizes are seen, but reading text (subtitle, alert bodies, empty-state body) looks about 14px by eye, under the 16px floor.
C-R05 2 issues — the search input and the two filter selects have no visible label.
C-R06 1 issue — at 834 the Annual value and Renews header cells overlap.
C-R07 PASS — one radius family; the alerts are single bordered surfaces with no nested cards; the toast's shadow is its own level.
C-R08 PASS — no color, radius or shadow seen in the pixels falls outside the neutral token set; the one hue is destructive.
C-R09 PASS — status is word plus shape (dot, triangle, dashed circle, cross), never color alone; destructive is used only for Terminated and the error; no text looks clearly below AA by eye.
C-R10 1 issue — every states.md key except the default view is captured and designed. In the deleted state the toast covers data rows.
C-R11 1 issue — values are tabular and right-aligned, but at 834 the "(USD)" unit in the header is covered by "Renews".
C-R12 NOT RUN — no tk-motion review filed for records-table (the only M1–M12 review on file, DEMO-015 motion-review.md, covers the delete dialog).
C-R13 PASS — every element seen has a job.
C-R14 1 issue — A-16 (placeholder as label) on the vendor search.
C-R15 N/A — no references file was loaded for this run.
P-A01 1 issue — loading's skeleton row count differs by width (14 rows against 6).
Code lint: UNVERIFIED (tk-ui-code-lint not installed)

Findings
- [Blocking] C-R05 · all keys with a toolbar (no-results, loading, partial, offline, deleted) 390/834/1440 light and dark · search input, 1440 box about (144,172)-(424,208), 390 about (16,219)-(374,255); records-toolbar.tsx:62-63 · The only visible name is placeholder="Filter by vendor"; aria-label alone is not a visible label, and on no-results the field shows just "Zephyr" with nothing saying what it filters. C-R05 asks for a visible label on every input, and the spec's wording does not lower that.
- [Blocking] C-R05 · same keys, all widths and themes · status and owner selects, 1440 about (432,172)-(736,208), 390 about (16,263)-(374,298) · The visible text is the current value ("All statuses", "Terminated", "All owners"); "Status" and "Owner" exist only as aria-label. C-R05 asks for a visible label. The 390 Sort select has one ("Sort"), which shows the fix.
- [Should-fix] C-R14 / A-16 · same as the first finding · search input · Placeholder used as the label, so it disappears on input. The alternative is a visible label above or beside the field.
- [Should-fix] C-R06 · loading, partial, offline, deleted 834 light and dark · table header row, about (557,335)-(710,355) (y≈252 on loading and deleted) · "Annual value (USD)" and "Renews" overlap into an unreadable "Annual value (U$D)ews"; the header text needs space between columns, and the column widths at md need to hold their labels.
- [Should-fix] C-R11 · same captures and region · The unit "(USD)" in the value header is covered by the next column's label, so it is no longer in a readable place.
- [Should-fix] P-A01 · loading 390 against 834/1440, light and dark · list area at 390 about (16,360)-(374,775): 6 skeleton rows; 1440 table about (144,272)-(1296,790): 14 rows · Under D-P01 a key keeps the same rows at every width (layout may change); skeleton rows should number the same, with 1440's count winning.
- [Should-fix] C-R04 · partial, offline, error, empty, no-results at all widths and both themes · subtitle "Vendor contracts, synthetic demo data" about (144,130)-(392,146) at 1440; alert bodies about (187,270)-(840,285); empty and no-results body text · By eye these read at about 14px. This is reading text, not tabular text, and the rubric asks for ≥16px. Needs a measured check.
- [Consider] C-R10 · deleted 390 light and dark · toast about (16,800)-(374,890) covers the Delmar Uniforms row (vendor and Terminated badge); at 834 about (435,806)-(818,884) it covers the Halvorsen and Harbour status and value cells; at 1440 about (1041,806)-(1423,884) it covers their values · The toast confirmation hides live data rows; consider placing it where it covers no data, or over the shell's margin.
- [Consider] C-R10 · loading 390/834/1440 light and dark · New record button, 1440 about (1180,105)-(1295,139) · The search and selects render disabled, but New record keeps its full enabled styling. The spec says "Controls disabled with their labels"; the rubric's state check asks that every state shows what can be done.

Not covered: the default view without ?state= (populated, 40 rows; no capture is expected for it); hover, focus and active on sort headers, rows, the search, the selects and the buttons (whether focus is visible cannot be judged from stills); whether the sorted header's chevron shows on hover and focus; motion, including whether skeletons shimmer (A-14) and whether sort and filter re-render in place; reduced motion; contrast ratios measured rather than judged by eye (dark Terminated badge text, dark destructive alert text, muted Owner and Renews cells); keyboard flow at 390 (C-DEMO-records-table-9); the toast's role and timing.
Reason: two Blocking C-R05 findings. The vendor search and the status and owner selects have no visible label at any width or theme.
Verdict: FAIL

