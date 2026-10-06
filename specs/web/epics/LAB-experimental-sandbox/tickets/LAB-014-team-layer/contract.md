---
id: LAB-14
size: small
objective: "A signed-in developer or admin opens an experiment and sees every reviewer's pins in place, filters them by reviewer, and leaves team notes that no reviewer and no tally ever sees."
slice_type: "A team face over LAB-12 and LAB-13 plus team writes (door 4); the risk is a team note reaching a reviewer read or a tally, or the team changing a reviewer's words."
non_negotiables:
  - "The team viewer comes only from getTeamMember (LAB-2, apps/web/lib/sandbox/team.ts) through LAB-5's resolveViewer, on each request; every new team function refuses a reviewer viewer."
  - "A team note is a sandbox_comments row with team_user_id and no reviewer_id, access_id or kind; its T-number is shared across the team per experiment and fixed by the server."
  - "No reviewer read and no reviewer comment count in @pem/db/sandbox returns or counts a team note."
  - "A team member edits and deletes only their own notes; no control and no function lets the team edit or delete a reviewer's comment (erasure in /admin is the only removal)."
  - "Team notes can be added and edited after close (D-LAB-15); team visits, switches and filters write no view (D-LAB-14)."
  - "New queries live in packages/db/src/sandbox/team.ts, take (db, viewer, input), and each has its isolation case in packages/db/test/sandbox/."
  - "team-layer.md's Words verbatim; the page has no primary; every team-* key registers in LAB-4's state.ts as team-only, on synthetic fixtures."
devs_call: "The component split under _components/team/, the filter's state shape, the deps seam, and the action result type."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/experimental/team-layer.md"
  - "D-LAB-14"
  - "D-LAB-15"
  - "C-LAB-team-1"
  - "C-LAB-team-2"
  - "C-LAB-team-3"
  - "C-LAB-team-4"
  - "C-LAB-team-5"
  - "C-LAB-team-6"
  - "C-LAB-team-7"
truth_files: "none: the approved proposal ux/experimental/team-layer.md reaches specs/web/ux/experimental/team-layer.md through yarn truth:promote LAB once its citing tickets close"
qa: Q2
reviewers:
  - assay
  - mason
focus:
  - "team notes reach no reviewer read and no tally (mason)"
operator_review: false
planned_paths:
  - "apps/web/app/experimental/[slug]/page.tsx"
  - "apps/web/app/experimental/[slug]/actions.ts"
  - "apps/web/app/experimental/[slug]/_components/team/**"
  - "apps/web/app/experimental/[slug]/_components/experiment/review-bar.tsx"
  - "apps/web/lib/sandbox/team-layer.ts"
  - "apps/web/lib/sandbox/team-layer.test.ts"
  - "apps/web/lib/sandbox/client/team-layer.ts"
  - "apps/web/lib/sandbox/client/team-layer.test.ts"
  - "apps/web/lib/sandbox/state.ts"
  - "packages/db/src/sandbox/team.ts"
  - "packages/db/src/sandbox/index.ts"
  - "packages/db/test/sandbox/isolation.test.ts"
  - "packages/db/test/sandbox/team.test.ts"
depends_on:
  - LAB-13
out_of_scope:
  - "Reviewer pins, the composer and the queue: LAB-12. The reviewer's list: LAB-13. The Results tab: LAB-23. Access codes: LAB-15. Erasure: LAB-16."
  - "Replies and the team's reply field in collaborate mode: LAB-25, LAB-26."
criteria:
  - id: C1
    statement: "A developer and an admin each opening an open experiment see every reviewer's pins for the shown design, open on the config's first design, and get a plain 'Results' link to /admin/experiments/<slug> in place of Finish review."
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "Set to one reviewer, the filter draws and lists only their pins, the bar reads 'Comments 4', and 'Showing 4 comments from Ana Ruiz on this design.' is announced; each filter-empty line matches the Words."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "A saved team note is stored with team_user_id and no reviewer or access id; notes by two team members on one slug are T1 and T2, and a retry under the same id gives one row."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C4
    statement: "With team notes on the slug, every reviewer-viewer read and reviewer comment count in @pem/db/sandbox returns and counts none of them, and each team function refuses a reviewer viewer."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C5
    statement: "A team member's popover on a reviewer's pin reads 'Ana Ruiz · comment 3 · Problem' with the text and time and has no Edit or Delete control; their own note's popover has both."
    evidence: test
    command: "yarn workspace web test"
  - id: C6
    statement: "A team save or delete naming a reviewer comment's id, or another team member's note, changes nothing and gets the fixed not-saved result."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C7
    statement: "On a closed experiment the team loads every pin, sees 'Closed' in the bar, and adds and edits a note; a reviewer's save on it gets the closed result."
    evidence: test
    command: "yarn workspace web test"
  - id: C8
    statement: "Loading, switching and filtering as a developer calls no view write: the database stub, which throws when called, is never called."
    evidence: test
    command: "yarn workspace web test"
  - id: C9
    statement: "Every team-layer.md ?state= key renders at 390, 834 and 1440, light and dark."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-014-team-layer/evidence/team-states.png"
---

# Contract — LAB-14 team-layer

## Build notes

- **Approach:**
  - `page.tsx`'s team branch (LAB-11) loads `listTeamComments` after mount, as LAB-12 loads a reviewer's, and renders `_components/team/`: the bar's start ("Team view", "Closed"), the `Select` filter, pins, popover and the "Comments" list.
  - Pure parts in `lib/sandbox/client/team-layer.ts`: `filterOptions(comments)`, `visiblePins(comments, filter, design)`, `groupTeamList(comments, designOrder)`, `pinName(comment)`, `filterAnnouncement(...)`, `filterEmptyLine(...)`. No `@pem/db`, `next/headers` or `env.ts`.
  - `lib/sandbox/team-layer.ts` binds the actions to `@pem/db/sandbox` through a deps seam, as LAB-12's `comments.ts`. `actions.ts` adds `listTeamComments`, `saveTeamNote`, `deleteTeamNote`: validate, `resolveViewer`, refuse anything but `team`, one call, a fixed result. No closed check for the team.
  - The composer, pin, popover and list items reuse LAB-12's and LAB-13's leaves, with no type control and no reviewer actions on others' pins.
  - Prior art: LAB-12's `packages/db/src/sandbox/comments.ts` (insert on conflict do nothing, then a scoped update); LAB-13's `pin-list.ts` grouping.
- **Decisions that apply:**
  - D-LAB-14: "Team visits are not counted in views or the order log", because "Team checks never skew tallies".
  - D-LAB-15: "Team notes can be added after close", because "Synthesis happens after the window".
  - D-LAB-13 (overview.md): "a pin is drawn only on its own design; anchors resolve inside the shown design's root; an unresolved pin stays in the list".
  - R2 (D-LAB-34): "Every sandbox table is service-only. `@pem/db/sandbox` functions take `(db, viewer, input)` ... Isolation is proven by tests."
  - R6 (D-LAB-38): "`/admin/experiments/<slug>` is Results".
  - data-contract.md: "A team function refuses a reviewer viewer." `sandbox_view_events` is "Never written for the team (D-LAB-14)".
- **Interfaces:**
  - `@pem/db/sandbox`: `listTeamComments(db, teamViewer, { slug })` returns every comment and note on the slug with the reviewer's `label` or the note author's email; `saveTeamNote(db, teamViewer, { id, slug, number, design, body, anchor, viewportW, viewportH, clientCreatedAt })` returns `{ number }`; `deleteTeamNote(db, teamViewer, { id })`.
  - Team queue: LAB-12's queue module under `sandbox:pin-queue:<slug>:team:<userId>`.
- **Per path:** `_components/team/`, the team leaves; `review-bar.tsx`, the label, filter and Results slots; `team-layer.ts` and `client/team-layer.ts` with tests, C1, C2, C5, C7, C8 named by criterion id; `team.ts` and its tests, C3, C4, C6, with cases in the isolation registry; `state.ts`, the eight `team-*` keys.
- **Gotchas:**
  - T-numbers: in the insert's transaction, under `pg_advisory_xact_lock` on the slug, keep the client's provisional number if no team note on the slug holds it, else take max + 1, and return it; the browser swaps in the returned number. So Undo keeps its number and two members never share one.
  - `saveTeamNote` is insert on conflict do nothing, then an update scoped by id and `team_user_id`. A reviewer comment's id hits the conflict and matches no update: not-saved, never a leak.
  - Every reviewer read and count (LAB-12's list and its 500 cap, LAB-11's, LAB-17's triage and LAB-23's tallies) keeps `reviewer_id is not null`; only LAB-25 widens it, to team replies, never notes. Add C4's case to the registry so a later function without it fails.
  - The author email joins `public.users` on `team_user_id`. `[ASSUMPTION: every team member has an email, as LAB-2 assumes.]`
  - "All reviewers" can repeat numbers; each pin's name says whose it is.
  - Web tests run only from `lib/**/*.test.ts`; `test:db` only on the local database. Fixtures are synthetic (`ana@example.com`, `taylor@example.com`).
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model adds a convenient "all comments on the slug" read that reviewers reuse, which is exactly the team-note leak.
