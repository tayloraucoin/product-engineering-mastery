---
id: LAB-25
size: small
objective: "In a collaborate experiment each reviewer reads every reviewer's comments and replies by display name and replies under any one, while team notes stay unreachable and erasure leaves others' replies under 'Comment removed'."
slice_type: "Widening guest reads and adding reply writes, with no migration (doors 2, 4 and 6); the risk is collaborate mode leaking a team note, an email or a label, or a private review reading another reviewer's rows."
non_negotiables:
  - "Collaborate widening lives only in LAB-3's one reviewer-scope helper (packages/db/src/sandbox/viewer.ts): the slug's reviewer comments and team replies, never a team note; private stays the viewer's own rows."
  - "The mode is read in apps/web/lib/sandbox from LAB-4's findExperiment(viewer.slug), never from the request; Viewer stays as data-contract.md types it."
  - "A reviewer-facing row names others by display_name and team replies as from the team; it never holds an email, a label, a user id, another reviewer's id, access id or number."
  - "parent_id has no foreign key; a reply always points at its root and copies the root's design and anchor; a reply under a team note, or in private mode, is refused."
  - "Erasure hard-deletes the erased access's comments and replies by cascade; others' replies survive and read under a removed root ('Comment removed', C-LAB-threads-5)."
  - "Beat 2 adds no migration: nothing under packages/db/migrations/ or packages/db/src/schema/ changes."
  - "New queries live in packages/db/src/sandbox/threads.ts, take (db, viewer, input), and each has its isolation case in packages/db/test/sandbox/, run in both modes."
devs_call: "The read's row shape beyond what Interfaces names, how replies are batched per root, the deps seam, and the action result type."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/experimental/threads.md"
  - "D-LAB-16"
  - "D-LAB-17"
  - "C-LAB-threads-1"
  - "C-LAB-threads-2"
  - "C-LAB-threads-3"
  - "C-LAB-threads-4"
  - "C-LAB-threads-5"
  - "C-LAB-threads-6"
truth_files: "none: the approved proposal ux/experimental/threads.md reaches specs/web/ux/experimental/threads.md through yarn truth:promote LAB once its citing tickets close"
qa: Q3
reviewers:
  - mason
  - warden
focus:
  - "collaborate mode never widens reads to team notes (warden)"
operator_review: false
planned_paths:
  - "packages/db/src/sandbox/viewer.ts"
  - "packages/db/src/sandbox/threads.ts"
  - "packages/db/src/sandbox/comments.ts"
  - "packages/db/src/sandbox/team.ts"
  - "packages/db/src/sandbox/index.ts"
  - "packages/db/test/sandbox/isolation.test.ts"
  - "packages/db/test/sandbox/threads.test.ts"
  - "apps/web/lib/sandbox/threads.ts"
  - "apps/web/lib/sandbox/threads.test.ts"
  - "apps/web/app/experimental/[slug]/actions.ts"
depends_on:
  - LAB-24
out_of_scope:
  - "The notice step, pins, popover, reply field, queue and list: LAB-26. The display-name field in /admin: LAB-15. The erase action itself: LAB-16."
  - "Live updates, reply emails, resolve or status: none, per threads.md."
criteria:
  - id: C1
    statement: "On a collaborate slug with reviewers A and B, each one's thread read returns both reviewers' comments; only the reader's own carry a number."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C2
    statement: "Every reviewer-facing read names others by display name and team replies as from the team; the serialised payload holds no synthetic email, label, user id, or other reviewer's or access's id."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C3
    statement: "In collaborate mode a team note is in no reviewer read and a reply under it is refused, while a team reply under a reviewer comment is returned to reviewers as from the team."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C4
    statement: "A reply to a reply is stored with parent_id equal to the root and the root's design and anchor; the same reply id sent twice gives one row."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C5
    statement: "After LAB-16's erasure of A's email, A's comments and replies are gone; B's reply under A's comment remains and reads under a removed root with that design and anchor; a new reply to that removed root is stored under it."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C6
    statement: "On a private slug no reviewer's read, comment or reply, returns another reviewer's rows, and a reply is refused with no write."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C7
    statement: "The thread actions take the mode from the registry by slug: with a private config the database is called with private whatever the request holds."
    evidence: test
    command: "yarn workspace web test"
  - id: C8
    statement: "In collaborate mode the team's read returns each reply with the reviewer's label or the team member's email, and a reviewer's own comment list still holds only their roots."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: review:mason
    statement: Mason reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run mason <id>
  - id: review:warden
    statement: Warden reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run warden <id>
---

# Contract — LAB-25 threads-data

## Build notes

- **Approach:**
  - `reviewerScope(viewer, { mode })` (LAB-3) is the one place a reviewer read is scoped. Private: `reviewer_id = viewer.reviewerId and slug = viewer.slug`. Collaborate: `slug = viewer.slug and (reviewer_id is not null or parent_id is not null)`. A team row with a parent is a team reply; one without is a team note.
  - `threads.ts` adds the reads and reply writes. LAB-12's `listMyComments` gains `parent_id is null`, so triage and the 500 cap's list stay roots (threads.md: own pins "are the only pins in their triage"). LAB-14's `listTeamComments` gains replies.
  - `lib/sandbox/threads.ts` binds them through a deps seam, reading `findExperiment(viewer.slug).mode`. `actions.ts` adds `listThread`, `listReplies`, `saveReply` and `deleteReply`: validate, `resolveViewer`, one call, a fixed result.
  - Prior art: LAB-12's `comments.ts` (insert on conflict do nothing, then a scoped update); LAB-3's isolation registry.
- **Decisions that apply:**
  - D-LAB-16: "Beat 2 shows a display name set on the code, never the email", because "Names without leaking addresses".
  - D-LAB-17: "Beat 2: team replies are visible to reviewers; team notes are not", because "Collaboration without exposing synthesis".
  - R2 (D-LAB-34): "Isolation is proven by tests. Residual risk accepted on the record: isolation rests on one module, not RLS."
  - R4 (D-LAB-36): "variant tag and `parent_id` on comments from beat 1; hard delete; ... erasure by access row".
  - R5 (D-LAB-37): "each gate entry records its email or user id per device, and every row carries both".
  - data-contract.md: "`parent_id` has no foreign key, a reply always points at its root (one level), and a reply copies its root's `design` and `anchor`. Erasing or deleting a root hard-deletes it, and the surviving replies still know where to draw 'Comment removed' (C-LAB-threads-5). Beat 2 adds no migration." And: "In beat 2's collaborate mode it widens reads to the slug's reviewer comments, never team notes."
- **Interfaces:**
  - `listThread(db, viewer, { mode })`: roots with replies oldest first. Each row has `id`, `design`, `anchor`, `kind`, `body`, `createdAt`, `author` (`self`, `{ reviewer: displayName | null }` or `team`), `number` on own rows only, and `removed: true` for a root rebuilt from its replies.
  - `listReplies(db, viewer, { rootId, mode })`, for a pin opened.
  - `saveReply(db, viewer, { id, parentId, body, clientCreatedAt, mode })`, insert or own edit; `deleteReply(db, viewer, { id })`, own only. Results: `ok`, `not-saved`, `limit`.
- **Per path:** `viewer.ts`, the widened scope; `threads.ts`, the four functions; `comments.ts`, roots only; `team.ts`, replies in the team read; tests C1 to C6 and C8 in `threads.test.ts` with registry cases, C7 in `lib/sandbox/threads.test.ts`, named by criterion id.
- **Notice state (ruled here, built in LAB-26; judgment, Mason):** "shown once per code" needs no stored flag. As LAB-11 is written, only its `recordViewEvent` sets `last_design`, and only once the page has mounted, so the notice is due while `readReviewerDesigns` returns `lastDesign` null. No migration and no call to Taylor.
- **Gotchas:**
  - Resolve the root in the save's transaction: a parent with a `parent_id` gives that root. A parent id matching no row is a removed root: copy design and anchor from a surviving reply under it, or return not-saved.
  - A reviewer reply carries `reviewer_id` and `access_id`, so erasure's cascade takes it; a team reply carries `team_user_id` and survives.
  - `[ASSUMPTION: replies count toward the 500 per reviewer, as LAB-12 counts rows.]`
  - `[ASSUMPTION: an experiment's mode never changes once its slug holds data, as the slug never does; a private review turned collaborate would show comments written under the private notice.]`
  - `[ASSUMPTION: the team may reply after close, as D-LAB-15 lets it add notes.]`
  - `test:db` runs only on the local database. Fixtures are synthetic (`ana@example.com`, label "Ana Ruiz", display name "Ana R.").
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model widens with `slug = viewer.slug` alone, which hands every reviewer the team's notes.
