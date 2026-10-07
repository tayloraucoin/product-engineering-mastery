---
id: LAB-16
size: medium
objective: "An admin deletes an experiment's reviewer data, the team erases one email everywhere it reached, and both read a record of every action that never names a reviewer."
slice_type: 'Hard deletion of personal data (S27, S28; one-way doors 2 and 4); the risk is an erasure that misses a copy in a label or "Emails used", takes the other email''s data with it, or a developer reaching the admin-only delete.'
non_negotiables:
  - "Each erasure runs in one transaction, by access, and writes one sandbox_actions row with counts only (data-contract.md, Erasure semantics)."
  - "deleteExperimentData refuses a developer inside the function, whatever the caller; the page and action also hold it to admins (D-LAB-26)."
  - "Erasing an email deletes only the accesses with that email, or a signed-in reviewer's accesses found by account email through apps/web/lib/supabase/admin.ts; the other email's data on the same code stays."
  - 'Labels and "Emails used" are scrubbed in code: a label equal to the email (ignoring case) becomes "Erased reviewer"; a reviewer left with no access is revoked and relabelled; a name label is cleared only when ticked (D-LAB-27).'
  - "The delete confirm field matches the slug exactly; the server checks it again."
  - "No URL, log or record row holds a reviewer's email: the reviewer view is /admin/data?reviewer=<reviewer-id>, and emails travel only in POST bodies (D-LAB-28)."
  - "New queries live in packages/db/src/sandbox/erasure.ts, take (db, viewer, input), refuse a reviewer viewer, and each has its isolation case in packages/db/test/sandbox/."
devs_call: "The component split, the action result names, the record's words for each action name, and how a failed count becomes the partial state."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/admin/data.md"
  - "D-LAB-3"
  - "D-LAB-26"
  - "D-LAB-27"
  - "D-LAB-28"
  - "C-LAB-data-1"
  - "C-LAB-data-2"
  - "C-LAB-data-3"
  - "C-LAB-data-4"
  - "C-LAB-data-5"
  - "C-LAB-data-6"
  - "C-LAB-data-7"
truth_files: "none: the approved proposal ux/admin/data.md reaches specs/web/ux/admin/data.md through yarn truth:promote LAB once its citing tickets close"
qa: Q3
reviewers:
  - assay
  - mason
  - warden
focus:
  - "erasure: one code, two emails, two slugs (warden)"
  - "the admin-only delete is refused inside the function (mason)"
operator_review: false
planned_paths:
  - "apps/web/app/admin/data/**"
  - "apps/web/app/admin/experiments/[slug]/data/**"
  - "apps/web/lib/sandbox/admin-data*.ts"
  - "apps/web/lib/sandbox/admin-nav.ts"
  - "apps/web/lib/sandbox/state.ts"
  - "packages/db/src/sandbox/erasure.ts"
  - "packages/db/src/sandbox/index.ts"
  - "packages/db/test/sandbox/**"
depends_on:
  - LAB-3
  - LAB-10
out_of_scope:
  - "The stale-data marker and the Delete data link: LAB-10. Making, replacing and revoking codes: LAB-15."
  - "Writing role-change rows: LAB-9. The erase link on a reviewer: LAB-22."
  - "A scheduled purge: out of bounds until D-LAB-24's trigger. Editing or deleting record rows: never."
criteria:
  - id: C1
    statement: "On the local database an admin's delete of pricing-2026 hard-deletes every code, access, view, comment, version and team note on it, leaves another slug's rows untouched, and writes one record row with the counts."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C2
    statement: "On the local database deleteExperimentData called with a developer viewer is refused and every row stays."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C3
    statement: 'The delete action refuses a developer with a database stub, which throws when called, never called; the Data tab''s view for a developer has the counts and "Only an admin can delete this data.", and no field or button.'
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: 'One code used with ana@example.com and ben@example.com, and ana on a second slug: erasing ana leaves no row, label or "Emails used" entry holding ana in any sandbox table on either slug, keeps ben''s views, comments and versions, and the record row holds counts only.'
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C5
    statement: 'A code used only by the erased email is revoked and labelled "Erased reviewer"; a name label is cleared only when its box is ticked, and is unchanged otherwise.'
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C6
    statement: 'A signed-in reviewer whose account email is erased loses every access with their user id, found through a stubbed admin lookup; an unknown email gives "Nothing is held for that email." and erases nothing.'
    evidence: test
    command: "yarn workspace web test"
  - id: C7
    statement: "After every action kind (delete, erase, and LAB-9's and LAB-15's when present), no sandbox_actions row contains a reviewer email or a code label."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C8
    statement: "The delete button stays disabled until the field equals the slug exactly (case and spaces count); the action refuses a mismatched confirm with nothing deleted."
    evidence: test
    command: "yarn workspace web test"
  - id: C9
    statement: "/admin/data?reviewer=<id> lists each email used with that code, with its own counts and button, and erases nothing on load; a reviewer id the team cannot see gives the no-match line; the nav's Data entry is a link."
    evidence: test
    command: "yarn workspace web test"
  - id: C10
    statement: "With keyboard alone and a screen reader: find, erase, delete and read the record."
    evidence: manual
    reason: "Needs a person with a screen reader; there is no end-to-end runner (technical.md). The builder walks it in the browser pane first, then hands it over with --verdict deferred."
  - id: C11
    statement: "Every data.md ?state= key renders at 390, 834 and 1440, light and dark."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/data-states.png"
  - id: review:assay
    statement: Assay reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run assay <id>
  - id: review:mason
    statement: Mason reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run mason <id>
  - id: review:warden
    statement: Warden reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run warden <id>
---

# Contract — LAB-16 admin-data

## Build notes

- **Approach:**
  - `packages/db/src/sandbox/erasure.ts`: `countExperimentData`, `deleteExperimentData` (LAB-3's `requireAdmin` first), `findErasure`, `findReviewerEmails`, `eraseEmail`, `listActions`. Register each in LAB-3's isolation registry.
  - `lib/sandbox/admin-data.ts` (pure): view models for the tab and the page, the confirm check, the toast and record words. `admin-data-data.ts` (`server-only`) binds the db, `requireTeamAction({ adminOnly })` for delete and `requireTeamAction()` for erase, and `createSupabaseAdminClient()` for account lookups. Model the seam on `apps/web/lib/billing/webhook/handle.ts`.
  - `experiments/[slug]/data/`: counts and the admin delete under LAB-10's layout. `admin/data/`: Erase a reviewer, the `?reviewer=` view and the record table, paginated at 50, newest first. Flip Data to `ready: true` in `admin-nav.ts`.
- **Decisions that apply:**
  - D-LAB-3: "The record of actions (S12c) is a read-only list on the nav-level Data page."
  - D-LAB-26: "Only an admin deletes an experiment's data, open or closed. Developers see the counts, not the button. Erasing a reviewer stays open to developers. Amends S3."
  - D-LAB-27: "Erasing an email also removes it from code labels and 'Emails used'. A code used only by that email is revoked and relabelled 'Erased reviewer'."
  - D-LAB-28: "The record of actions never names a reviewer or an email."
  - data-contract.md: "Why by access, not by reviewer: a code used with two emails keeps the other email's data"; "a name label is cleared only when ticked"; `sandbox_actions` has "No reviewer column of any kind".
  - R6 (D-LAB-38): "the reviewer erase page is `/admin/data?reviewer=<reviewer-id>`".
  - S28 (brief): erasure is a hard delete, not anonymised. S12c: every deletion leaves a record of who acted and when.
- **Interfaces:**
  - `countExperimentData(db, team, { slug })` and `deleteExperimentData(db, admin, { slug })` return `{ reviewers, codes, views, comments, reviews, versions, teamNotes }`.
  - `findErasure(db, team, { email, userIds })` returns `{ experiments, comments, versions, views, nameLabels: { reviewerId, slug, label }[] }` or null; `findReviewerEmails(db, team, { reviewerId })` returns each email with its counts, plus user-id accesses.
  - `eraseEmail(db, team, { email, userIds, clearLabels })` returns the counts. `listActions(db, team, { page })`.
  - Actions `deleteExperimentData(slug, prev, formData)`, `findReviewer(prev, formData)`, `eraseReviewer(prev, formData)`.
  - Record names `data_deleted`, `reviewer_erased`; words for LAB-9's role names and LAB-15's `code_made`, `code_replaced`, `code_revoked`.
- **Per path:**
  - `admin/data/**`, `experiments/[slug]/data/**`: pages, `actions.ts`, `_components/` (field, `AlertDialog`, checkbox list, record table).
  - `admin-data*.ts`: cores, binding, C3, C6, C8, C9. `admin-nav.ts`: Data ready.
  - `state.ts`: every `data-tab-*` and `data-page-*` key as `team`, on synthetic fixtures.
  - `packages/db`: the functions, their export, isolation cases, C1, C2, C4, C5, C7.
- **Gotchas:**
  - Look up the account by email before the transaction (it is a network call) and pass `userIds` in. `[ASSUMPTION: the installed auth-js has no lookup by email; page through listUsers and match the trimmed, lower-cased email. Verify against the installed version.]`
  - The email comes from the form, never the query string; `findReviewer` keeps it in the action's state.
  - Build C4's sweep from `information_schema` over every `sandbox_` table, matching each row as text, so a table added later is swept too.
  - Delete the experiment's team notes by slug; they have no reviewer to cascade from.
  - Erase replies: LAB-25's beat-2 replies cascade from their access; never add a tombstone.
  - Record words for an action name this ticket does not know render the name as is `[ASSUMPTION]`.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model deletes by reviewer, taking the second email's data, or checks the role only in the page.
