# As-built — LAB-25

## Shipped against the contract

- The scope: `reviewerScope(viewer, columns, { mode })` in `packages/db/src/sandbox/viewer.ts`. Private, the default, is the viewer's own rows on their slug. Collaborate is `slug = viewer.slug and (reviewer_id is not null or parent_id is not null)`. It needs a `parentId` column and refuses any other mode (`SCOPE_MODE_INVALID`). Every write still calls it with no mode. The collaborate predicate is `threadRowsOn(slug, columns)`, its one home, which the team's thread read uses too. Because that predicate no longer names the viewer, the collaborate scope also requires the viewer's access to belong to their reviewer on that slug (an `exists` over `sandbox_accesses` and `sandbox_reviewers`), as a write's lock does. A crossed slug, reviewer or access reads nothing (Warden, round 1). The unit test `packages/db/src/sandbox/viewer.test.ts` pins both SQL shapes and both refusals: an unknown mode, and collaborate asked of a table with no `parentId`.
- C1 to C6, C8: `packages/db/src/sandbox/threads.ts` holds `listThread`, `listReplies`, `saveReply` and `deleteReply`, each `(db, viewer, input)`.
  - A reviewer reads through the scope. The team reads the slug's reviewer comments with every reply, and its input names the slug. A reviewer's input never may.
  - Rows to a reviewer: author is `self`, `{ reviewer: displayName | null }` or `team`, and `number` appears on their own roots only. Rows to the team: author is `self`, `{ reviewer: label }` or `{ team: email }`.
  - A reply whose root is gone reads under `{ id, design, anchor, createdAt, removed: true, replies }`, placed and timed by the oldest surviving reply, so roots sort oldest first, removed ones among them. A reply whose parent still exists outside the read (a team note) is dropped, as defence in depth: saves already refuse one.
  - `saveReply` resolves the root in its transaction. A reply's parent gives its root. An id matching no row is a removed root, placed from a surviving reply. A team note, another slug, an unknown id, private mode or an id equal to the root is `not-saved`, with nothing written. The id is minted in the browser: insert on conflict do nothing, then the author's own reply's body updated. A reviewer's reply counts toward the 500, behind the reviewer-row lock saveComment takes.
  - `deleteReply` hard-deletes the author's own reply only (`parent_id is not null`).
  - Tests: `test/sandbox/threads.test.ts` holds C1 to C6 and C8 on a slug of their own, with Ana R. and Ben O. C5 erases through LAB-16's `eraseEmail`. `test/sandbox/threads-cases.ts` holds the isolation cases, every viewer kind in both modes, spread into the suite's REGISTRY.
- Roots only: LAB-12's `listMyComments` and its `saveComment` edit, and LAB-17's triage check in `review.ts`, gain `parent_id is null`. A reviewer's list, triage and the pin types stay roots (threads.md).
- C7: `apps/web/lib/sandbox/threads.ts` (pure seam) holds `listThreadWith`, `listRepliesWith`, `saveReplyWith` and `deleteReplyWith`. The mode is `findExperiment(viewer.slug).mode`, or the route's slug for the team. `threads-data.ts` binds it to the database. `app/experimental/[slug]/actions.ts` adds `listThread`, `listReplies`, `saveReply` and `deleteReply`. `lib/sandbox/threads.test.ts` proves that a private config reaches the database as private while the resolved request carries a collaborate one, and that an input naming a mode, a slug or a design is refused before any call.

## Deviations

- LAB-14 is not built, so the team's thread read is `listThread` with a team viewer, in `threads.ts`. The planned `packages/db/src/sandbox/team.ts` was not created. LAB-14's `listTeamComments` should reuse this read, or gain replies the same way. The team face is in the read already (C8).
- The isolation cases live in `test/sandbox/threads-cases.ts`, as LAB-15's and LAB-16's do, and the binding lives in `lib/sandbox/threads-data.ts`, as `comments-data.ts` does. The reply schemas went into `lib/sandbox/validators.ts`, the actions' schema file. `packages/db/src/sandbox/review.ts` (LAB-17's triage check) gained `parent_id is null`, and `packages/db/src/sandbox/viewer.test.ts` gained the scope's unit test. None of these paths was planned. `test/sandbox/erasure-fixtures.ts` is reused as LAB-16 left it (its `seedCode` already took a display name); this ticket did not change it.
- `deleteReply`'s input is `{ id }` for the team too: it is scoped by the author's user id, so it needs no slug.
- A reply stores `number` 0, `kind` null and its root's viewport. The column is not null; nothing reads a reply's number.
- A team-facing author is `{ reviewer: label | null }`, as the reviewer face allows a null display name. Labels are required, so null is unreachable today.
- [ASSUMPTION] Team replies have no cap. The 500 is per reviewer, and the team is signed in and trusted.
- [ASSUMPTION] A closed experiment returns `closed` to a reviewer's thread calls, as LAB-12's pins do. The team is served open or closed (the contract's assumption on replies after close).
- [ASSUMPTION] Others' roots go to a reviewer without `viewportW` and `viewportH`. The anchor's fractions place a pin, and LAB-26 can ask for the viewport if it needs it.
- Contract assumptions kept as written: replies count toward the 500; a mode never changes once a slug holds data; the team may reply after close.
- To start, LAB-24's C2 (`yarn lint:docs`) had to pass. It was red only on `docs/research/ui-patterns/working-dashboards.md`, which had been dropped in 110cd6e without frontmatter. That file was filed by record 0006 (`f0fb82d`: frontmatter prepended, body byte-identical, a manifest line, a landing page), and LAB-24's C2 was run again, as the start gate directs.

- Follow-up LAB-32 (`threads-hardening`, drafted) takes Warden's Consider findings: the two races, a ceiling on the thread read, and a team-note delete that takes its replies, so no team reply can ever rebuild as "Comment removed" for a reviewer. It depends on LAB-14. The admin counts that now count replies as comments (LAB-16, LAB-10) are named there for their own tickets.

## Not verified

- No manual criterion. Concurrency is not proven (LAB-32): two saves of one reply id at once, and an erasure racing a reply. The insert conflicts, and the access foreign key refuses a reply from an access erased since the request began (`REVIEWER_NOT_FOUND`). No test drives either race.

## Next

LAB-26 builds the notice, pins, popover, list and team parts on these actions once LAB-13 and LAB-14 are built.
