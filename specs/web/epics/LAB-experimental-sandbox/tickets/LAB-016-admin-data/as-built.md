# As-built — LAB-16

## Shipped against the contract

- C1, C2, C4, C5, C7: `packages/db/src/sandbox/erasure.ts`, every function `(db, viewer, input)` and team only, refusing a reviewer viewer before any query:
  - `countExperimentData(db, team, { slug })` returns `{ reviewers, codes, views, comments, reviews, versions, teamNotes }`. Each count is its own query, and a failed one is null: that is the tab's partial state. `codes` and `reviewers` are both the slug's reviewer rows, since one code is one reviewer (D-LAB-6). `comments` excludes team notes, which are counted apart. `reviews` is reviewers with at least one version.
  - `deleteExperimentData(db, admin, { slug })` calls `requireAdmin` before anything else (D-LAB-26). In one transaction it locks the slug's reviewer rows, then deletes by slug the views, every comment (team notes included), the versions, the accesses and the reviewers, each with `returning`, so the counts are exact. One `data-deleted` row holds `{ reviewers, accesses, viewEvents, comments, reviewVersions, teamNotes }`.
  - `findErasure(db, team, { email, userIds })` returns `{ experiments, comments, versions, views, nameLabels }` or null.
  - `findReviewerEmails(db, team, { reviewerId })` returns `{ slug, emails, accounts }` or null. `emails` is each typed email with its own comments, versions and views; `accounts` is each signed-in user id with the same counts.
  - `eraseEmail(db, team, { email, userIds, clearLabels })` works by access, in one transaction. It locks and deletes the accesses with that email or user ids, and with them their views, comments, replies and versions. Then each reviewer it reached that has no access left is revoked and relabelled "Erased reviewer". Then every label and display name equal to the email, ignoring case and spaces, becomes "Erased reviewer". Then the ticked name labels among the reviewers it touched are cleared. One `reviewer-erased` row, with no slug, holds `{ accesses, viewEvents, comments, reviewVersions, labelsScrubbed, reviewersRevoked }`. It returns null, writing nothing, when the email holds nothing.
  - `listActions(db, team, { page })` returns `{ rows, page, total }`, newest first, 50 to a page.
  - Isolation cases are in `test/sandbox/erasure-cases.ts`, spread into the suite's REGISTRY with one line. They run every write on a slug of their own and check the world's rows and the record's size are unchanged after each case. `test/sandbox/erasure.test.ts` holds C1, C2, C4, C5, C7 and the database half of C6. C4's sweep reads every `sandbox_` table from `information_schema`, each row as text.
- C3, C6, C8, C9: `apps/web/lib/sandbox/admin-data.ts` (pure) holds `deleteExperimentDataWith`, `findReviewerWith`, `eraseReviewerWith`, `loadDataTabWith`, `loadReviewerWith` and `loadRecordWith(deps, member, …)`.
  - The deps are the registry, the account lookups and the store.
  - Delete refuses anyone but an admin before reading the registry. It refuses a confirm that is not the slug exactly before touching the store.
  - Find and erase normalise the email from the POST body. They look up the account ids again on every call, before the store's transaction, and never take them from the client.
  - `admin-data-data.ts` (`server-only`) binds them. It finds accounts by email through `listAuthPeople` (people-data.ts, which pages `listUsers` through `lib/supabase/admin.ts`). An account's email for the reviewer view comes from `getUserById`.
  - `admin-data-view.ts` (client-safe) holds the words, the view models, `confirmMatches`, the record's words and the eighteen `data-*` fixtures.
- Routes:
  - `experiments/[slug]/data/`: a page (Suspense over the counts), `loading.tsx`, `actions.ts` and `_components/data-tab.tsx`. The delete action opens with `requireTeamAction({ adminOnly: true })` and revalidates the experiment's layout, so the header's stale-data line reads again. After a delete, focus moves to the counts line.
  - `admin/data/`: a page, `loading.tsx`, `actions.ts` (`findReviewer`, `eraseReviewer`), `_components/erase-section.tsx` and `record-table.tsx`. The email travels only in POST bodies. The found result lives in component state, and `?reviewer=` takes an id. After an erase, the emptied field takes focus.
  - `admin-nav.ts`: Data is `ready: true`.
  - `state.ts`: every `data-tab-*` and `data-page-*` key, as `team`.
- C10: walked by keyboard in the browser pane against the local database; handed to the operator (`evidence/C10-operator.md`).
- C11: `evidence/data-states.png`, every `data-*` key at 390, 834 and 1440, light and dark, with reduced motion. Taken against a scratch copy whose `team.ts` returns a synthetic member (admin, or developer by a cookie), because this machine has no Supabase Auth. The copy is never committed.

## Deviations

- Record names are `data-deleted` and `reviewer-erased`, exported as `ERASURE_ACTIONS`. `recordAction` accepts kebab-case only, so the contract's `data_deleted` cannot be written. The record's words cover these two names, LAB-15's `code-made`, `code-replaced` and `code-revoked`, and LAB-9's `role-change`. An unknown name reads as itself.
- `ERASED_LABEL` and `ACTIONS_PAGE_SIZE` are exported beside the functions, each with its support case.
- [ASSUMPTION] A role-change row holds no role until LAB-28, so it reads "Changed the role of ben@example.com".
- [ASSUMPTION] Erasure rulings the contract leaves open:
  - A code whose label is the email but that no one used is revoked as well as relabelled: it was made for that email, and no one else's data rides on it.
  - A display name equal to the email is scrubbed like a label, so C4's sweep finds the email nowhere.
  - The name labels offered with a checkbox are only those on a code that keeps another email. A code left with no access is relabelled anyway. A label that reads as another email address is not offered: it names someone else.
- [ASSUMPTION] A delete that finds nothing writes no record row. An erasure's row has no slug, since it spans experiments.
- [ASSUMPTION] On the reviewer view, each email's "Erase everything from …" button first finds that email everywhere. The full counts and the labels then show, and the `AlertDialog` follows. The view's own counts are that code's alone, and the erasure reaches every experiment.
- [ASSUMPTION] Words the UX file leaves open:
  - "The button turns on when the text matches exactly." (the confirm field's hint, tied to the button);
  - "The text didn't match the experiment's name. Nothing was deleted." (the server's mismatch);
  - "Enter the reviewer's email address.";
  - "This code hasn't been used with any email.";
  - "This erases 14 comments, 3 review versions and 41 views across 2 experiments. This can't be undone." (the dialog);
  - "On this code: …" (each reviewer-view entry);
  - "Deleted team notes on …" for a delete that held only team notes.
- [ASSUMPTION] The partial line shows "—" in place of each failed count, inside the holds sentence.
- [ASSUMPTION] Verified on the installed auth-js 2.117.2: there is no lookup by email, so accounts are matched by paging `listUsers` on the trimmed, lower-cased email.
- `admin-routes.test.ts` holds `{ adminOnly: true }` for `people/` actions only. It is LAB-8's file, outside this ticket's paths, so `admin-data.test.ts` pins the delete action's `{ adminOnly: true }` instead. A follow-up is drafted to widen the scan.

## Not verified

- C10 by a person with a screen reader (deferred).
- The account lookup against real Supabase Auth: this machine has none. C6 runs on a stubbed lookup, and the database half erases by user id.
- C3, C6, C8 and C9 run `yarn workspace web test`, which exits 1 on two tests that LAB-11's commit `9b9f6c1` broke and LAB-11 owns: `gate.test.ts` C2's source scan, and `registry.test.ts` C4. This ticket's own `admin-data.test.ts` passes 17 of 17.

## Next

LAB-22's "Erase this reviewer…" link is `/admin/data?reviewer=<reviewer-id>`. LAB-28's role words replace "Changed the role of …" in `recordWords`.
