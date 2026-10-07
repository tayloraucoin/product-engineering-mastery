# As-built — LAB-11

## Shipped against the contract

- C1: `openingDesignWith` (`apps/web/lib/sandbox/experiment.ts`) draws and claims on a first visit, ignoring `?design=`; later visits honour a known `?design=`, else `last_design`, else `first_design`. Order is the first design, then the config's order. The primary is "Back to your review" for `?from=review`, "Edit your review" once sent, else "Finish review".
- C2: `claimFirstDesign` is `update … set first_design where … first_design is null returning`, then a read-back. Proven with a held transaction racing a second claim, and with 12 parallel claims.
- C3: `drawFirstDesign` takes `randomInt(designs.length)`; the default is `crypto.randomInt`. 1,000 seeded first visits land within 50% ± 5%.
- C4: `client/switcher.ts` plans a switch with no request, one switch log and the announcement. `clampScroll` keeps the scroll within the new page.
- C5: the team path touches no deps, and `recordViewWith` returns `not-counted` for the team, ended (closed) and gate results. Both are proven with throwing stubs.
- C6: `readReviewerDesigns`, `claimFirstDesign` and `recordViewEvent` in `packages/db/src/sandbox/experiment.ts` each have isolation cases for every viewer kind. Every case refuses the team, changes no other row, and rejects a crossed slug, reviewer id or access.
- C7–C9, C11: `evidence/exp-labels.png`, `exp-single.png`, `exp-bar-clearance.png` and `exp-states.png` (recaptured after the review), with every `exp-*` key at 390, 834 and 1440, light and dark, under reduced motion. At 390 and 1440, measured on the page, the last content and the pinned header both sit above the bar's top.
- R9, checked in the DOM: `main` holds one `data-sandbox-design` root at a time; the bar is the region "Review tools", last in DOM order.
- As a reviewer through the gate, the local database holds one `load` per page view (no Strict Mode double) and one `switch` per switch. `first_design` never changes; `last_design` follows.

## Deviations

- Captures were taken against an uncommitted scratch copy: `team.ts` returns a synthetic admin from a cookie, because this machine has no Supabase Auth. A scratch-only slug, `lab11-capture`, copies `pricing-2026`, because other threads' seeds and `test:db` runs cleared `pricing-2026`'s reviewers mid-capture. Headless Chrome was driven over the DevTools protocol, since the repo has no Playwright.
- `apps/web/app/experimental/_experiments/pricing-2026/square.tsx`, outside the planned paths, gained a sticky "Records workspace" header. C9 needs a design that pins a header to the top. The header carries no region marker: LAB-4's registry test allows markers only on sections.
- `apps/web/app/_components/floating-theme-toggle.tsx`, outside the planned paths, now hides while a design is mounted. Fixed top right, it covered the design's own header.
- The words, labels and fixtures live in `lib/sandbox/client/experiment-view.ts`, beside the planned `switcher.ts`, because the client bar needs them and `experiment.ts` imports `@pem/db`. The slot defaults are in `_components/experiment/bar-slots.tsx`.
- The switch log waits for the next frame, then a task, with a 250 ms fallback for a tab that draws no frames. React flushes a click's effects before paint, so a plain effect could send before the new design painted.
- [ASSUMPTION] The announcement reads "1 of your comments is on it.", "None of your comments are on it.", or the first sentence alone when no count is known (until LAB-12).
- [ASSUMPTION] In `exp-error` the Comments button reads "Comments" with no count; the Words give none.
- [ASSUMPTION] If the opening read or claim fails, the page renders uncounted, on a design drawn the same way, rather than an error page. Nothing is stored, so a later visit draws again.
- [ASSUMPTION] The team opens on the config's first design and honours `?design=`, with the same "Finish review" primary until LAB-14 swaps it for Results.
- `recordViewEvent` turns a foreign-key refusal (an access crossed or erased since the request began) into the fixed `REVIEWER_NOT_FOUND`, so Postgres's detail never escapes.
- Test changes: `lib/sandbox/gate.test.ts`'s source scan lists the action's log events, and now also expects `sandbox.view_failed`. Nothing was removed or loosened.

## Review (Q2, in the thread: assay, and mason on the focus line)

Both PASS, no black or red.

- **Assay, fixed:**
  - Orange: the selected design wore the primary's fill. It now uses the `selected` token, bold text and a check, so the bar has one primary.
  - Orange: focus was unproven in pixels. `evidence/exp-focus.png` now shows every bar stop, reached by Tab, at 390 and 1440, light and dark.
  - Orange: Retry is 44px wide.
  - Yellow: the switcher's padding matches the other controls.
  - Yellow: Comment and Comments share one outline.
  - Yellow: the status line's live region is always present.
  - Grey: C10's script says Enter for the Finish review link.
- **Assay, routed:**
  - Orange: below 768px, error, partial and success look alike, because the save status moves into the list. LAB-13 owns that list; re-check it there.
  - Grey: the page has no bottom padding before hydration.
  - Grey: Square's table is clipped at 390 (the design's own concern).
  - Rubric gap, for Plumb: C-R03 does not say whether a selected toggle in the accent counts as primary-styled.
- **Mason, fixed:**
  - Orange: a database outage showed every reviewer the config's first design. The fallback now draws at random.
  - Orange: C6 could not catch a `hasSent` leak. A case now removes one reviewer's version and asserts false for them and true for the rest.
  - Yellow: a crossed access now gets the fixed error, pinned by its matcher.
  - Grey: the stale "two fixed events" comment is gone.
- **Mason, drafted:** yellow, no bound on the view action: LAB-30 view-log-bounds.
- **Mason, noted:**
  - Grey: the claim relies on read committed, Supabase's default.
  - Grey: a full-render prefetch may claim before the reviewer looks, which does not bias the draw.
  - Grey: the component guarantees (one load, one switch, sent after the frame) were checked in headless Chrome and in the database, not by a unit test.

## Not verified

- C10, with a screen reader (deferred: `evidence/C10-operator.md`). Tab order, arrow keys, Space and the live region were checked in headless Chrome.
- The Comment toggle, Comments button and save status are fixtures here; their live data is LAB-12's and LAB-13's.

## Next

LAB-12 wires the Comment toggle, pins and save status into the bar's slots, then LAB-13 the list.
