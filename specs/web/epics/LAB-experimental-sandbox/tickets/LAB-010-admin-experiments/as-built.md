# As-built — LAB-10

## Shipped against the contract

- C5: `listExperimentStats(db, viewer, { slugs })` in `packages/db/src/sandbox/experiments.ts` is team-only.
  - It returns `{ slug, codes, sent, lastActivityAt, reviewersHoldingData }` for each asked slug, in order, with zeros and a null date for a slug with no rows.
  - It runs one grouped query per table, each limited to the asked slugs.
  - Last activity is the latest of a reviewer's view (`at`), comment (`created_at`, reviewer rows only) and send (`created_at`). Team notes never count.
  - A malformed or overlong slug list is refused with a fixed message.
  - Its isolation cases cover:
    - every reviewer is refused;
    - for the team, exact keys, the counts per slug, last activity against an independent SQL query, a later team note ignored, and no label, email, code or comment body in the answer.
- C1–C4, C6, C7: `apps/web/lib/sandbox/admin-experiments.ts` (pure) holds the list's rules.
  - `experimentRows` gives rows, order, marker and header line. Open experiments come first, by latest activity with none last; closed ones follow, latest close first.
  - `experimentHeader` and `resolveExperimentHeader` give the experiment's title, status, marker and tabs.
  - `daysSinceClose` counts London calendar dates through `todayIn`.
  - `admin-experiments-data.ts` (`server-only`) binds the registry and the database. A failed count read becomes `null`: the page's partial state.
- Routes:
  - `experiments/page.tsx` replaces LAB-8's placeholder.
  - `[slug]/layout.tsx` awaits `params`, calls `requireTeamPage` with its own path, then resolves the slug. An unregistered slug calls `notFound()` before any read.
  - `[slug]/page.tsx` is Results' placeholder, naming LAB-23.
  - The tabs are links, each with `aria-current` on its own route.
- C8: walked by keyboard in the browser pane; handed to the operator (`evidence/C8-operator.md`).
- C9: `evidence/expts-states.png`, every `expts-*` key plus one experiment's header, at 390, 834 and 1440, light and dark. Taken against a scratch copy whose `team.ts` returns a synthetic admin, because this machine has no Supabase Auth. That copy has no database, so its real page shows the partial state.

## Deviations

- [ASSUMPTION] The table is `@pem/ui/table` with its own sort, not the composed `data-table`. `data-table` has no caption and always shows a pager ("Page 1 of 1"). experiments.md asks for the caption "Experiments", `aria-sort` on sortable headers, and nothing else.
- [ASSUMPTION] Closed experiments sort latest close first. A column sort is the person's choice: Title A to Z, Status, Last activity newest first.
- [ASSUMPTION] Singular and same-day forms, as the contract proposed: "1 closed experiment still holds reviewers' data.", "1 code", "1 reviewer", "closed 1 day ago", "closed today". Last activity reads "today", "1 day ago", "N days ago", with the exact London time in `title` and in screen-reader text.
- [ASSUMPTION] `reviewersHoldingData` counts reviewer rows on the slug, as the contract's assumption says. Today it equals `codes`; LAB-16's delete removes them all.
- A comment's activity time is its server `created_at`, not the browser's `client_created_at`, which a client could set.
- The `expts-*` fixtures are synthetic slugs dated relative to now, so "closed 34 days ago" holds on any day.
- The list loads behind a Suspense boundary whose fallback is the same static skeleton `expts-loading` shows. A `loading.tsx` would also have covered the `[slug]` pages.
- Three keys beyond experiments.md's table: `expts-header-stale`, `expts-header-developer` and `expts-header-partial`. They make the header's forms reachable. A layout gets no search params, so the header's client leaf reads them.

## Review (Q2, assay, in the thread)

PASS, with one red and four oranges.

- Red, fixed: a closed experiment whose counts failed showed no marker under its heading, so it looked as if it held nothing. `ExperimentHeader.partial` now shows "Some counts didn't load. Reload to try again." in the marker's place. experiments.md has no row for this state; promotion should add one.
- Orange, fixed: the header's stale and developer forms could not be reached or captured (the three keys above, now in C9). The designed skeleton showed only by key (the Suspense fallback). The skeleton pulsed (`animate-none`).
- Orange, not taken: the exact date shows on hover only, not on focus. experiments.md asks for "hover and focus" but also makes the title the row's only Tab stop; the exact time is in screen-reader text. That conflict is the spec owner's.
- Cut list taken: one scroll box, and the offline and partial notices at one weight. Left: "—" means both "nothing held" and "count failed" (the partial line explains it); Data held sits far right at 390; rows take the primitive's hover.

## Not verified

- C8 by a person (deferred).
- Counts from a real database in the browser. The function is proven on the local database (C5) but not rendered against it.

## Next

LAB-15, LAB-16, LAB-22 and LAB-23 fill the tabs. LAB-16's Data tab is where "Delete data" lands.
