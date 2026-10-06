---
id: LAB-26
size: small
objective: "A reviewer on a collaborate experiment reads, once per code, that others will see their comments and name, then reads everyone's pins and replies in place, replies, and finds their own first in the list."
slice_type: "Client surfaces over LAB-25's data, plus the collaborate notice (door 8); the risk is a page usable before the notice is acknowledged, words that weaken its promise, or a reply lost or doubled on retry."
non_negotiables:
  - "The notice step shows after a live code on a collaborate experiment while LAB-11's readReviewerDesigns returns lastDesign null (LAB-25's ruling), in the gate's column, before the page; the gate never reveals the mode."
  - "Door 8: the notice's heading, body and button are threads.md's Words verbatim, never shortened; nothing mounts under it, so no view, comment or reply is written before 'Continue to the review'."
  - "Replies go through LAB-25's actions only, are queued and retried with the same id through LAB-12's queue module, and nothing updates live: replies load with the page and again when a pin opens."
  - "Reviewers see display names and 'From the team', never an email or a label; the team face shows the code's label and the team member's email."
  - "Own pins stay filled and numbered and alone in triage; others' are outlined and unnumbered; team notes are never drawn for a reviewer."
  - "Own replies carry 'Edit your reply' and 'Delete your reply'; no one else's do; a removed root shows 'Comment removed' with its replies and the Reply field."
  - "threads.md's Words verbatim; every threads-* key registers in LAB-4's state.ts as team-only, on synthetic fixtures."
devs_call: "The component split under _components/threads/, how the popover lays out the thread, the reply queue's entry fields beyond those named, and the skeleton's shape."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/experimental/threads.md"
  - "D-LAB-16"
  - "D-LAB-17"
  - "C-LAB-threads-7"
  - "C-LAB-threads-8"
  - "C-LAB-threads-9"
truth_files: "none: the approved proposal ux/experimental/threads.md reaches specs/web/ux/experimental/threads.md through yarn truth:promote LAB once its citing tickets close"
qa: Q2
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "apps/web/app/experimental/[slug]/page.tsx"
  - "apps/web/app/experimental/[slug]/_components/threads/**"
  - "apps/web/app/experimental/[slug]/_components/pins/**"
  - "apps/web/app/experimental/[slug]/_components/pin-list/**"
  - "apps/web/app/experimental/[slug]/_components/team/**"
  - "apps/web/lib/sandbox/notice.ts"
  - "apps/web/lib/sandbox/notice.test.ts"
  - "apps/web/lib/sandbox/client/threads.ts"
  - "apps/web/lib/sandbox/client/threads.test.ts"
  - "apps/web/lib/sandbox/state.ts"
depends_on:
  - LAB-25
out_of_scope:
  - "Queries, actions, the scope helper and erasure: LAB-25. The display-name field: LAB-15. The closing review: LAB-17, unchanged (S31)."
  - "Live updates, reply emails, resolve or status: none, per threads.md."
criteria:
  - id: C1
    statement: "A reviewer with a live code on a collaborate experiment and no recorded view gets the notice step first; once a view is recorded it never shows; a private experiment, an unknown slug and the team never get it."
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "noticeDue holds only for a reviewer on a collaborate experiment who has not yet viewed it, and a source scan finds page.tsx's notice branch mounting no design, pin or bar component and calling no view, comment or reply action."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "A popover lists the comment, then its replies oldest first with name and time; a reply sent from a reply's thread joins the same thread; others' pins are outlined and unnumbered with names as the Access words."
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "A reply whose send fails is marked 'Not sent' and resent with the same id on load, on reconnect and on Retry; a sent reply announces 'Reply sent.' and returns focus to the empty Reply field."
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "Deleting one's own reply shows 'Reply deleted. Undo' and Undo restores it under the same id; a removed root reads 'Comment removed' with its replies and the Reply field."
    evidence: test
    command: "yarn workspace web test"
  - id: C6
    statement: "Each design group in the list shows 'Yours' first, then the others by name, each item with its reply count ('3 replies'), and others' actions named 'Show Ana R.'s comment on page'."
    evidence: test
    command: "yarn workspace web test"
  - id: C7
    statement: "On a collaborate experiment a team member's popover on a reviewer's pin adds the replies and the Reply field and nothing else, naming reviewers by label and team replies by email."
    evidence: test
    command: "yarn workspace web test"
  - id: C8
    statement: "With keyboard alone and a screen reader, the notice, reading replies, replying, editing and deleting all work, and 'Reply sent.' is announced."
    evidence: manual
    reason: "Needs a person with a screen reader; no runner exists. The builder checks the reply list's articles, focus return and live region, then defers it."
  - id: C9
    statement: "Every threads.md ?state= key renders at 390, 834 and 1440, light and dark."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-026-threads-ui/evidence/threads-states.png"
---

# Contract — LAB-26 threads-ui

## Build notes

- **Approach:**
  - `lib/sandbox/notice.ts`: `noticeDue({ viewerKind, mode, lastDesign })`, true only for a reviewer on a collaborate experiment with `lastDesign` null. `page.tsx`'s experiment branch wraps the server-rendered page in `_components/threads/notice.tsx`, a `"use client"` leaf in LAB-7's gate column that renders its children only after Continue. LAB-11 logs the load on mount, so the next visit skips the step.
  - Pure parts in `lib/sandbox/client/threads.ts`: `pinView(row, viewer)` (filled and numbered, or outlined), `pinName`, `threadOf(root, replies)`, `groupWithYoursFirst(rows, designOrder)`, `replyCountLabel(n)`. No `@pem/db`, `next/headers` or `env.ts`.
  - LAB-12's popover gains the thread and a `Textarea` "Reply" (2,000 characters, "Send reply"); LAB-13's list and LAB-14's team popover gain their beat 2 parts. In private mode none of it renders.
  - Prior art: LAB-12's queue and popover, LAB-13's `pin-list.ts`, LAB-7's `_components/gate/` column.
- **Decisions that apply:**
  - D-LAB-16: "Beat 2 shows a display name set on the code, never the email", because "Names without leaking addresses".
  - D-LAB-17: "Beat 2: team replies are visible to reviewers; team notes are not", because "Collaboration without exposing synthesis".
  - Door 8 (technical.md): the notice's words are a promise; "Once reviewers have read what is stored and how to be erased, narrowing either breaks a promise already given" (brief, one-way door 8).
  - gate.md: "The gate never shows the experiment's mode. A collaborate experiment adds its own notice step after a live code (`threads.md`), so the gate stays one face (S12b)."
  - LAB-25's ruling: "the notice is due while `readReviewerDesigns` returns `lastDesign` null. No migration and no call to Taylor."
  - S31 (brief): "the closing form stays individual".
- **Interfaces:** `noticeDue` (notice.ts); the pure functions above (client/threads.ts); reply queue `sandbox:reply-queue:<slug>:<reviewerId>` (team: `:team:<userId>`), entries `{ id, parentId, body, clientCreatedAt }`, through LAB-12's queue module; LAB-25's `listThread`, `listReplies`, `saveReply`, `deleteReply`.
- **Per path:** `page.tsx`, the notice branch; `_components/threads/`, the notice, thread and reply leaves; `pins/`, `pin-list/` and `team/`, their beat 2 parts; tests C1 and C2 in `notice.test.ts`, C3 to C7 in `client/threads.test.ts`, named by criterion id; `state.ts`, the nine `threads-*` keys.
- **Gotchas:**
  - Never call the view action from the notice: the step's only exit is Continue, and a tab closed on it shows it again, as intended.
  - A failed load log leaves `lastDesign` null, so the notice shows once more. That errs towards telling; never "fix" it with a cookie, which would make it per device.
  - The skeleton is static, with no shimmer (A-14).
  - Send one request at a time per reply id, as LAB-12 does for pins.
  - `[ASSUMPTION: after Continue, focus moves to main's start; the Words say nothing, for assay.]`
  - `[ASSUMPTION: a reviewer with no display name reads "A reviewer", never the label; copy threads.md lacks, for assay.]`
  - Web tests run only from `lib/**/*.test.ts`. Fixtures are synthetic ("Ana R.", `taylor@example.com`).
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model mounts the page behind the notice as a dismissable overlay, so views and pins are written before the promise is read.
