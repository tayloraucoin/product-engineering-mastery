# Review — record-detail, round 1
Model: claude-opus-5-5
Read: docs/design/canon-rubric.md; docs/design/canon.md §2 (A-01 to A-20); apps/web/docs/design/DESIGN.md, tokens.md, components.md, anti-patterns.md, states.md; specs/web/epics/DEMO-records-demo/ux/demo/record-detail.md (no living specs/web/ux/ copy exists); specs/web/epics/DEMO-records-demo/brief.md; apps/web/lib/demo/surfaces/record-detail.ts; source for cited lines: apps/web/app/demo/_components/diff.tsx, apps/web/app/demo/(shell)/records/[id]/_components/terms-section.tsx, record-detail.tsx
Coverage: 54/54 files read; missing: none

Top 3
1. The Current/Compare toggle's selected segment is hard to tell from the unselected one: only a faint `bg-muted` fill, with the same border, weight and text colour. In `diff`, Compare is on but reads as idle (C-R10).
2. The `loading` skeleton does not copy the final layout. It has no toggle or subtitle, the history rows are single full-width bars, and the action-button widths are swapped (C-R10, states.md "Skeletons copy each width's final layout").
3. `saved` shows no toast in any of its 6 captures. The success signal the spec requires is not visible, so only the changed field values say the save happened (C-R10).

Lines
C-R01 PASS — every expected capture is present and every finding below cites a region or file:line
C-R02 1 issue — the error view has no focal action: Retry is outline although components.md makes it the solid primary
C-R03 PASS — one solid primary (Edit) per view; Delete stays the kit tint outside a dialog
C-R04 1 issue — diff clause text is about 14px (text-sm) where reading text must be at least 16px; 4 sizes or fewer per view
C-R05 2 issues — partial's Retry reads as disabled; not-found's outline button in light has almost no edge
C-R06 1 issue — history rows sit further apart than the gap between groups
C-R07 1 issue — partial stacks a divider directly on top of a bordered alert
C-R08 PASS — no colour, radius or shadow seen outside the token roles
C-R09 PASS — the diff is marked by glyph and strike, not colour alone; destructive colour marks loss only; nothing seen clearly below AA by eye (disabled controls exempt)
C-R10 4 issues — weak toggle selected state; loading skeleton differs from the final layout; saved toast not visible; empty/no-history content contradicts itself
C-R11 PASS — history dates right-aligned on a shared baseline; currency unit placed after the value
C-R12 NOT RUN (no tk-motion review filed) — the only filed review, DEMO-015 motion-review.md, covers delete-dialog
C-R13 PASS — no element without a stated job
C-R14 PASS — none of A-01 to A-20 seen (Geist is a chosen typeface per DESIGN.md, so not A-01; skeletons, not spinners)
C-R15 N/A — no references file loaded for this run
P-A01 PASS — each key keeps the same words and rows at 390, 834 and 1440; only layout changes (stacked actions, 2 × 2 fields, two-line history, back link)
Code lint: UNVERIFIED (tk-ui-code-lint not installed)

Findings
- [Should-fix] C-R10 · diff 1440 light and dark (same at 834 and 390; also offline, saved, no-history, partial with Current) · toggle (960,252)-(1104,288); terms-section.tsx:109 · The selected segment differs from the unselected one only by a faint `aria-pressed:bg-muted` fill, with the same border, weight and text colour, so in `diff` "Compare" reads as idle. The rule asks for the selected or active state to sit clearly above rest.
- [Should-fix] C-R10 · loading 1440/834/390 light and dark · Terms block (336,245)-(1104,445) and History (336,462)-(1104,594) at 1440 · The skeleton has no subtitle or toggle placeholder, though the spec says "toggle and history too". History is 4 full-width bars rather than the 3-part rows (version, summary, date right). The action skeletons are about 56px then 72px, while the final buttons are Delete about 63px then Edit about 45px. states.md asks skeletons to copy each width's final layout.
- [Should-fix] C-R10 · saved 1440/834/390 light and dark · whole viewport (0,0)-(1440,900) at 1440 · No toast is visible in any of the 6 captures, though the spec's saved row requires "a toast" ("Halvorsen Freight saved"). Only the changed Annual value (52,000 USD) and "Just now by you" show the save. The toast may have closed before capture; either way it is unseen.
- [Should-fix] C-R04 · diff 1440/834/390 light and dark · clause rows (336,325)-(1104,545) at 1440; diff.tsx:16 `text-sm` · Clause text is about 14px, while the same clauses render at about 16px in the Current view (offline-1440 (336,418)-(890,582)). Reading text must be at least 16px; the spec says "base size".
- [Should-fix] C-R05 · partial 1440/834/390 light and dark · Retry (379,396)-(437,428) at 1440; terms-section.tsx:125 · The outline Retry inside AlertDescription inherits the muted description colour. Its grey label on a grey edge looks disabled, next to the genuinely disabled Compare. An enabled control must look interactive.
- [Should-fix] C-R02 · error 1440/834/390 light and dark · Retry (379,195)-(437,227) at 1440; record-detail.tsx:123 `variant="outline"` · The error view has no focal action: Retry is an outline button the same weight as the link beside it. components.md (D-DEMO-22) makes Retry the solid primary.
- [Should-fix] C-R06 · diff 1440 light (same in partial, offline, saved; 390 worse) · History (336,615)-(1104,845) · Rows are about 53px apart, more than the gap from heading to first row (about 46px) and from the Terms summary to the History heading (about 45px). At 390 the history items are about 100px apart (diff-390 (16,995)-(374,1385)). Space between groups must be greater than space within a group.
- [Consider] C-R05 · not-found 1440/834/390 light · "Back to records" (657,271)-(783,305) at 1440 · In light the outline button's edge is barely visible, a faint shadow only, so it reads close to plain text. Dark shows a clear border.
- [Consider] C-R07 · partial 1440/834/390 light and dark · divider at y=312 and alert border from y=325, (336,312)-(1104,440) at 1440 · A rule and a bordered alert stack 13px apart, two separators where one would do.
- [Consider] C-R10 · empty 1440 light and dark (and 834, 390) · "Last change" (692,186)-(858,226) against History "No versions yet…" (336,528)-(697,544); no-history 1440 the same field against "Version 1 … 14 Mar 2025" (336,470)-(1103,490) · "3 days ago by Ana Okafor" contradicts a record with no versions, and a single version from 2025. The designed state should agree with itself.

Not covered: the default view without `?state=` (states.md lists "(none)", but the surface's keys capture no default view); hover, active and focus on Edit, Delete, the toggle, Retry and the links; keyboard reachability (C-DEMO-record-detail-8); the toast's timing and its focus move to the h1; motion and reduced motion; measured contrast ratios (removed-clause muted text, history summaries, dark Delete tint); the screen-reader "Removed:"/"Added:" labels.
Verdict: PASS

