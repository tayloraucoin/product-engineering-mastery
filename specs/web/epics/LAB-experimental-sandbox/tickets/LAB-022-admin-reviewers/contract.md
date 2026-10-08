---
id: LAB-22
size: small
objective: "The team sees where each reviewer of an experiment is, and opens one to read their latest answers, every earlier version with what changed, their comments and order log, with a way to erase them that carries no email."
slice_type: 'A team-only read of one person''s full record (door 4); the risk is a reviewer id from another slug opening a record, a "changed" marker on the wrong version, or an email leaking into a URL.'
non_negotiables:
  - "New queries live in packages/db/src/sandbox/reviewers.ts, take (db, viewer, input), refuse a reviewer viewer, scope every read by slug and reviewer id together, and each has its isolation case in packages/db/test/sandbox/."
  - 'Versions show newest first: the latest as "Version n of n" with its answers, each earlier one a collapsed disclosure with its answers and triage as they were then (S22); nothing is recomputed from current comments.'
  - 'An answer that differs from the version after it carries a static text marker "changed", never colour or motion (A-14); "Changed after choosing" shows where the stored flag is true (D-LAB-21).'
  - '"Erase this reviewer…" is a plain link to /admin/data?reviewer=<reviewer-id>; no email ever appears in a URL, and nothing on this surface deletes.'
  - 'Status is a word: "Not opened yet", "Looking" or "Sent · version n of m", with "Revoked" after it for a revoked code.'
  - "Both pages call requireTeamPage, then findExperiment; an unknown slug, or a reviewer id not on this slug, is notFound()."
  - "reviewer.md's Words verbatim; answers grouped as LAB-17's core v1 orders them, ratings shown as their labels."
devs_call: "The component split, the view-model shape, how time per design is derived from view events (one as-built line), and how a failed section becomes the partial state."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/admin/reviewer.md"
  - "D-LAB-6"
  - "D-LAB-21"
  - "D-LAB-27"
  - "C-LAB-reviewer-1"
  - "C-LAB-reviewer-2"
  - "C-LAB-reviewer-3"
  - "C-LAB-reviewer-4"
  - "C-LAB-reviewer-5"
truth_files: "none: the approved proposal ux/admin/reviewer.md reaches specs/web/ux/admin/reviewer.md through yarn truth:promote LAB once its citing tickets close"
qa: Q2
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "apps/web/app/admin/experiments/[slug]/reviewers/**"
  - "apps/web/lib/sandbox/admin/admin-reviewers*.ts"
  - "apps/web/lib/sandbox/client/team-layer*.ts"
  - "apps/web/lib/sandbox/shared/state.ts"
  - "packages/db/src/sandbox/reviewers.ts"
  - "packages/db/src/sandbox/index.ts"
  - "packages/db/test/sandbox/**"
depends_on:
  - LAB-10
  - LAB-14
  - LAB-15
  - LAB-17
out_of_scope:
  - "The Data page that lists each email and erases: LAB-16. The emails-used flags: LAB-15's emails-used.ts, reused."
  - "Codes, revoke and replace: LAB-15. Tallies across reviewers: LAB-23."
  - "Storing versions and the changed-after-choosing flag: LAB-17, LAB-18."
criteria:
  - id: C1
    statement: 'For a reviewer who sent 2 versions, the page shows "Version 2 of 2 · sent 6 October 2026, 14:32" with its answers, and version 1 collapsed under "Earlier versions" with its own triage.'
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: 'An answer that differs between versions 1 and 2 carries "changed" on version 1; an unchanged answer carries nothing.'
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: 'In the Reviewers list, one code used with two emails is flagged "2 emails used with this code", with its comment count, status word and last activity.'
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: '"Erase this reviewer…" links to /admin/data?reviewer=<reviewer-id>; the href and every other URL on the page hold no email, and rendering the page writes nothing.'
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "On the local database readReviewer returns every version newest first with its triage, the reviewer's comments and view events, and returns null for a reviewer id from another slug; each reviewers.ts function's isolation case passes for every viewer kind."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C6
    statement: 'A reviewer with no access shows "Not opened yet" and no sections; one with comments and no version shows "No review sent yet."; a revoked code reads "Revoked" after its status.'
    evidence: test
    command: "yarn workspace web test"
  - id: C7
    statement: "Every reviewer.md ?state= key renders at 390, 834 and 1440, light and dark."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-022-admin-reviewers/evidence/reviewer-states.png"
---

# Contract — LAB-22 admin-reviewers

## Build notes

- **Approach:**
  - `packages/db/src/sandbox/reviewers.ts`, team-only: `listReviewers(db, team, { slug })` and `readReviewer(db, team, { slug, reviewerId })`. Register both in LAB-3's isolation registry.
  - `lib/sandbox/admin/admin-reviewers.ts` (pure): `reviewerRows(rows)` and `reviewerView(record, config)` give status words, flags (LAB-15's `emailsUsedFlags`), latest and earlier versions with "changed" markers, comments grouped by design, the order log and the erase href. `admin-reviewers-data.ts` (`server-only`) binds the db, LAB-8's `requireTeamPage` and `createSupabaseAdminClient()` for a signed-in reviewer's account email. Model the seam on `apps/web/lib/billing/webhook/handle.ts`.
  - `reviewers/page.tsx` (the list) and `reviewers/[reviewerId]/page.tsx` (one reviewer) under LAB-10's layout. Earlier versions use `@pem/ui`'s `Collapsible`. Answers render from LAB-17's `client/review-core.ts`, never a copy of its wording.
- **Decisions that apply:**
  - D-LAB-6 (experimental/overview.md): "The reviewer is the code: one code is one person on any device; each typed email is recorded."
  - D-LAB-21 (experimental/overview.md): "A rating changed after choosing is allowed and marked", because "Choice-supportive memory, logged".
  - D-LAB-27: "Erasing an email also removes it from code labels and 'Emails used'. A code used only by that email is revoked and relabelled 'Erased reviewer'."
  - D-LAB-14 (experimental/overview.md): "Team visits are not counted in views or the order log."
  - D-LAB-29: "'version' means only a review send ('version 2 of 3')."
  - R6 (D-LAB-38): "the reviewer erase page is `/admin/data?reviewer=<reviewer-id>`"; overview.md's route: "`…/reviewers/<reviewer-id>` (never the code itself)".
  - S22 (brief): "Each send is kept as a numbered version, which records the pin triage as it was then."
- **Interfaces:**
  - `listReviewers` returns `{ reviewerId, label, emailsUsed, userIds, comments, versions, lastActivityAt, revoked, opened }[]`.
  - `readReviewer` returns `{ label, emailsUsed, userIds, revoked, versions: { number, createdAt, answers, triage }[], comments, viewEvents }` or null.
  - "See on the page" links to `/experimental/<slug>?reviewer=<reviewer-id>` `[PROPOSED: LAB-14's filter takes its first value from ?reviewer=, read in client/team-layer.ts; an id the slug does not hold is ignored]`.
- **Per path:**
  - `reviewers/**`: both pages and `_components/` (list on the composed `data-table`, sections, version disclosures).
  - `admin-reviewers*.ts`: core, binding, C1 to C4, C6.
  - `client/team-layer*.ts`: the `?reviewer=` initial filter and its test.
  - `state.ts`: the ten `reviewer-*` keys as `team`, on synthetic fixtures (Ana Ruiz, `pricing-2026`).
  - `packages/db`: the two functions, their export, isolation cases, C5.
- **Gotchas:**
  - "changed" compares each answer with the same answer id in the next newer version, so the latest never carries it.
  - Last activity counts reviewer views, comments and sends only; team notes never.
  - A label of "Erased reviewer" with nothing held renders `reviewer-erased`.
  - Format sent times in the reader's locale, as the edit lead does in LAB-17.
  - `emails-used.ts` is LAB-15's and `client/team-layer.ts` is LAB-14's; both land in wave 3, before this ticket starts (pre-flight fix, 2026-10-06). The changed-after-choosing flag is LAB-18's; render it only when present.
  - `params` is a promise in Next 16: await it before the guard.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model reads a reviewer by id alone, or marks the newer version instead of the older.
