---
id: LAB-12
size: medium
objective: "A reviewer pins a comment to any spot on the shown design by click, tap or keyboard, edits or deletes it with Undo, and never loses one: unsent pins wait in the browser and resend under the same id."
slice_type: "Client interaction plus guest writes (door 4); the risk is a pin lost or doubled on retry, resolved on the wrong design, or one reviewer's id touching another's row."
non_negotiables:
  - "The anchor is the marked region, then id, then a structural path, plus x and y fractions of its box, built and resolved only inside the shown design's root; an unresolved pin is not drawn and stays listed (D-LAB-13)."
  - "The browser mints the id and queues the pin before sending; the queue is retried with the same id on load, on reconnect and on Retry, and an entry leaves it only on the server's ok or before its delete is sent."
  - "One row per id: a new pin inserts with on conflict do nothing; an edit updates only the viewer's own row; an id held by another reviewer is never changed or revealed."
  - "Limits as data-contract.md: body at most 2,000 characters, anchor at most 2 KB, at most 500 comments per reviewer per experiment ([PROPOSED], built as written); fixed errors that never echo input."
  - "Comment mode: Escape leaves it, a save ends it, no single-key shortcut, the design's own links and buttons do not act; marked regions and the design's controls become named Tab stops (D-LAB-12)."
  - "Closed or revoked: Edit, Delete and Retry are disabled with their reason tied to each, and the queue is held untouched for LAB-21."
  - "New queries live in packages/db/src/sandbox/comments.ts, take (db, viewer, input), refuse a team viewer, and each has its isolation case in packages/db/test/sandbox/."
devs_call: "The component split, composer placement, re-lay on resize, the action result type, and queue entry fields beyond those named in Interfaces."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/experimental/pins.md"
  - "D-LAB-11"
  - "D-LAB-12"
  - "D-LAB-13"
  - "C-LAB-pins-1"
  - "C-LAB-pins-2"
  - "C-LAB-pins-3"
  - "C-LAB-pins-4"
  - "C-LAB-pins-5"
  - "C-LAB-pins-6"
  - "C-LAB-pins-7"
  - "C-LAB-pins-8"
  - "C-LAB-pins-9"
truth_files: "none: the approved proposal ux/experimental/pins.md reaches specs/web/ux/experimental/pins.md through yarn truth:promote LAB once its citing tickets close"
qa: Q2
reviewers:
  - assay
  - mason
focus:
  - "the queue: same id on every retry, one row on the server (mason)"
operator_review: false
planned_paths:
  - "apps/web/app/experimental/[slug]/_components/pins/**"
  - "apps/web/app/experimental/[slug]/_components/experiment/review-bar.tsx"
  - "apps/web/app/experimental/[slug]/actions.ts"
  - "apps/web/lib/sandbox/comments.ts"
  - "apps/web/lib/sandbox/comments.test.ts"
  - "apps/web/lib/sandbox/client/**"
  - "apps/web/lib/sandbox/validators.ts"
  - "apps/web/lib/sandbox/state.ts"
  - "packages/db/src/sandbox/comments.ts"
  - "packages/db/src/sandbox/index.ts"
  - "packages/db/test/sandbox/isolation.test.ts"
  - "packages/db/test/sandbox/comments.test.ts"
depends_on:
  - LAB-11
out_of_scope:
  - "The list, its Retry button and Show on page: LAB-13. Team notes and the team's pins: LAB-14. Replies: LAB-25, LAB-26."
  - "Showing and clearing the queue after close: LAB-21. Pins in the review's triage: LAB-17."
criteria:
  - id: C1
    statement: "A click on an element and Enter on a marked region's Tab stop each open the composer with its place name and an anchor (marked id, else id, else path, fractions in 0 to 1) and save with the shown design's id; Enter on a design control anchors at its centre."
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "Escape in comment mode turns it off and announces 'Comment mode off.'; a save also turns it off."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "A pin whose send fails stays queued with its id and body and is resent with the same id on load, on reconnect and on Retry; a delete drops its entry before the request is sent."
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "The same comment id saved twice gives one row; an edit under it updates that row; a delete then Undo restores it under the same id; the same id sent by another reviewer changes nothing and gets the fixed not-saved result."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C5
    statement: "After a switch only the shown design's pins are drawn, and the count across designs is unchanged."
    evidence: test
    command: "yarn workspace web test"
  - id: C6
    statement: "Two designs sharing a marked id each resolve their own pin inside their own root only; a pin whose anchor is missing is not drawn and is marked not found."
    evidence: test
    command: "yarn workspace web test"
  - id: C7
    statement: "A reviewer's load returns only their own pins on this slug, never team notes, and each comments function's isolation case passes for every viewer kind."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C8
    statement: "A reviewer's 501st comment on an experiment and a 2,001-character body are refused with fixed results; deleting one comment lets the next in."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C9
    statement: "A send answered closed or revoked shows the exp-closed or exp-revoked line, disables Edit, Delete and Retry with the reason tied to each, and leaves the queue as it was."
    evidence: test
    command: "yarn workspace web test"
  - id: C10
    statement: "With a screen reader and keyboard alone a pin can be placed, read, edited and deleted, and saves are announced."
    evidence: manual
    reason: "Needs a person with a screen reader; no runner exists. The builder checks Tab stops, focus return and live regions, then defers it."
  - id: C11
    statement: "Every pins.md ?state= key renders at 390, 834 and 1440, light and dark, with reduced motion."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-012-pins/evidence/pins-states.png"
---

# Contract — LAB-12 pins

## Build notes

- **Approach:**
  - Pure modules in `lib/sandbox/client/` (no `@pem/db`, `next/headers` or `env.ts`): `anchor.ts` (build and resolve, against a narrow node interface so tests use plain fakes), `place-name.ts`, `comment-mode.ts` (a reducer returning the next state and its announcement) and `queue.ts` (storage injected).
  - `lib/sandbox/comments.ts` binds the actions to `@pem/db/sandbox` through a deps seam, as LAB-11's `experiment.ts`.
  - `actions.ts` adds `listMyComments`, `saveComment` and `deleteComment`: validate, `resolveViewer`, one call, a fixed result (`ok`, `closed`, `revoked`, `limit`, `not-saved`).
  - Comments load after mount (`exp-loading`); queued entries override server rows with the same id.
  - Prior art, never copied (brief.md, Prior art): K `lib/review/anchor.ts:33-98`, the marked-id, id, nth-of-type anchor with fractions; K `review-context.tsx:105-183`, numbered pins and a same-id retry queue whose load retry was missing; T `server/services/review.ts:80-175`, idempotent insert through the client id.
- **Decisions that apply:**
  - D-LAB-11: "Optional pin type: Problem, Question, Suggestion, Keep this".
  - D-LAB-12: "Keyboard placement: comment mode makes marked regions and the design's controls Tab stops".
  - D-LAB-13: "a pin is drawn only on its own design; anchors resolve inside the shown design's root; an unresolved pin stays in the list".
  - S17: "a comment that fails to send is queued and retried with the same id. Each comment is tagged with the variant it was placed on."
  - data-contract.md: "A reviewer's 'Delete' removes the row, and Undo re-inserts it under the same id. The queue drops an item before its delete is sent, so a late retry cannot bring it back."
- **Interfaces:**
  - The queue, read by LAB-17 and LAB-21: localStorage `sandbox:pin-queue:<slug>:<reviewerId>`, a JSON array of `{ id, number, design, kind, body, anchor, viewportW, viewportH, clientCreatedAt }`, `body` as last typed. This keeps LAB-21's assumed key and fields.
  - `Anchor`: `{ region } | { id } | { path }`, plus `x` and `y`. Markers are LAB-4's `data-sandbox-region` and `data-sandbox-name`; the root is LAB-11's `data-sandbox-design`.
  - `@pem/db/sandbox`: `listMyComments(db, viewer)`, `saveComment(db, viewer, input)`, `deleteComment(db, viewer, { id })`.
- **Per path:** `_components/pins/`, the layer, composer, pin and popover leaves; `review-bar.tsx`, the Comment toggle and save status wired; tests named by criterion id; `state.ts`, the nine pins.md keys.
- **Gotchas:**
  - Send one request at a time per id: a delete waits for an in-flight save, or the save lands after it and revives the row.
  - `saveComment` is insert on conflict do nothing, then an update scoped by id, reviewer and slug, in one transaction. Count the 500 inside that transaction.
  - `[ASSUMPTION: the browser numbers a pin max(loaded, queued) + 1 and the server keeps it; two devices at once may repeat a number, which triage tolerates since it keys by id.]`
  - `[ASSUMPTION: a delete is sent, never queued; if it fails the pin returns in place with the toast "Comment 3 wasn't deleted. Try again.", copy pins.md lacks, for assay to check.]`
  - A pin at the cap stays queued like a failed send; no new copy.
  - Swallow the design's clicks in the capture phase on its root only, never the bar.
  - Web tests run only from `lib/**/*.test.ts`; `test:db` only on the local database. Fixtures are synthetic.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model mints the id on the server or drops the queue entry before the ok, and both lose or double pins.
