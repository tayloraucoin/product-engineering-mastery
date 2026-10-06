---
id: LAB-17
size: medium
objective: "A reviewer answers the closing review (core v1, held as data), triages their pins and sends a numbered version they can change until close; the team never sends one."
slice_type: "A long form plus guest writes (door 4); the risk is a version lost or doubled on retry, a repeated number, or triage naming pins the server never received."
non_negotiables:
  - "Core v1 is data in one module, review.md's wording and order verbatim; every version stores its core version (S20)."
  - "The server judges every send against core v1 and the config: an unknown id, a missing required answer, a triage key not the viewer's own comment on this slug, or answers over 64 KB are refused with fixed results that never echo input."
  - "The browser mints the version id; a retry under it gives one row and its first number; numbers are unique per reviewer; old versions never change."
  - "Send flushes LAB-12's queue first, each pin under its own id, and sends the version only once every pin is ok."
  - "Goal fit comes first: until it is answered on a first send, no comment text renders."
  - "The team is sent to /experimental/<slug> and never stores a version (S18); a closed experiment stores nothing and returns closed."
  - "New queries live in packages/db/src/sandbox/review.ts, take (db, viewer, input), refuse a team viewer and each has its isolation case; review-* keys register in LAB-4's state.ts as team-only, on synthetic fixtures."
devs_call: "The component split, the answers' JSON shape, the draft's value, and result fields beyond Interfaces."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/experimental/review.md"
  - "D-LAB-2"
  - "D-LAB-18"
  - "D-LAB-21"
  - "C-LAB-review-1"
  - "C-LAB-review-2"
  - "C-LAB-review-3"
  - "C-LAB-review-4"
  - "C-LAB-review-5"
  - "C-LAB-review-6"
  - "C-LAB-review-7"
  - "C-LAB-review-8"
  - "C-LAB-review-9"
  - "C-LAB-review-10"
truth_files: "none: the approved proposal ux/experimental/review.md reaches specs/web/ux/experimental/review.md through yarn truth:promote LAB once its citing tickets close"
qa: Q2
reviewers:
  - assay
  - mason
focus:
  - "queued pins send first; versions numbered per reviewer (mason)"
operator_review: false
planned_paths:
  - "apps/web/app/experimental/[slug]/review/**"
  - "apps/web/app/experimental/_experiments/registry.ts"
  - "apps/web/lib/sandbox/review*.ts"
  - "apps/web/lib/sandbox/client/review-*.ts"
  - "apps/web/lib/sandbox/state.ts"
  - "packages/db/src/sandbox/review.ts"
  - "packages/db/src/sandbox/index.ts"
  - "packages/db/test/sandbox/isolation.test.ts"
  - "packages/db/test/sandbox/review.test.ts"
depends_on:
  - LAB-12
out_of_scope:
  - "Each design's goal fit, the choice and its follow-ups: LAB-18. The sent view and the email result: LAB-19. The email: LAB-20."
  - "Clearing the draft and queue after close: LAB-21. Versions in /admin: LAB-23."
criteria:
  - id: C1
    statement: "A one-design review page renders Overall, Your comments, Blockers, Gaps, the config's questions and Next step in that order, in core v1's exact wording."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-017-review/evidence/review-sections.png"
  - id: C2
    statement: "On a first send, until goal fit has an answer ('Can't judge yet' counts), the comments section holds only its heading and 'Answer the question above to see your comments.', with no comment text; in edit mode it is open."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "3 pins are each played back with a three-way triage; a text edit saves that pin under its id; with exactly one Must or Should, matters most is set to it and hidden."
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "A send missing a required answer sends nothing and focuses a summary listing each gap in page order; the server refuses that payload as invalid, naming the ids."
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "A valid send stores one version with the answers, core version v1 and a triage for every own pin plus matters most; a foreign triage key or answers over 64 KB are refused with a fixed result."
    evidence: test
    command: "yarn workspace web test"
  - id: C6
    statement: "A second send stores version 2, keeps version 1 unchanged, and the latest read returns 2."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C7
    statement: "With pins queued, Send resends each under its id and sends the version only after every ok, triage keyed by those ids; a failed pin leaves the version unsent and shows review-send-failed."
    evidence: test
    command: "yarn workspace web test"
  - id: C8
    statement: "When the experiment closed before the send, the store stub, which throws when called, is never called and the result is closed, which renders review-closed."
    evidence: test
    command: "yarn workspace web test"
  - id: C9
    statement: "With keyboard alone and a screen reader the form is completable, and the legends, the summary and each field error are read."
    evidence: manual
    reason: "Needs a person with a screen reader. The builder checks fieldsets, summary focus and error links, then defers it."
  - id: C10
    statement: "Every review.md ?state= key renders at 390, 834 and 1440, light and dark."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-017-review/evidence/review-states.png"
  - id: C11
    statement: "The same version id sent twice gives one row and one number; two sends with different ids at once get 1 and 2; each review function's isolation case passes for every viewer kind."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C12
    statement: "A developer or admin opening the review page without a review ?state= key is sent to the experiment page; their send stores nothing."
    evidence: test
    command: "yarn workspace web test"
---

# Contract — LAB-17 review

## Build notes

- **Approach:**
  - `page.tsx` calls `resolveViewer(slug)`. Team: redirect to `/experimental/<slug>`, unless a registered review-route `?state=` key renders its fixture. Not found: `notFound()`. Gate or ended: the same redirect `[ASSUMPTION: the review route has no gate of its own]`. Reviewer: the config, `listMyComments` (LAB-12) and `readMyLatestVersion` go to the form leaf.
  - `client/review-core.ts`: core v1 as data (`coreVersion: "v1"`, section ids, questions, copy). `client/review-form.ts`, pure: the answers schema from core plus config, `requiredGaps` in page order, comment visibility, matters-most default, the draft over an injected `Storage`.
  - `lib/sandbox/review.ts`: `sendReviewWith(deps, slug, input)` (size, parse, `resolveViewer`, own-comment check, store), bound in `actions.ts` as LAB-11's `experiment.ts` is.
  - Send: flush the queue with LAB-12's `client/queue.ts` (never a second sender), then `sendReview`; on ok clear the draft and fill a `sent` slot (a plain line until LAB-19).
  - Prior art, never copied: K `lib/review/types.ts:105-135` and `build-answers.ts:18-134` (form as data, checked on the server); T `app/api/review/_lib/http.ts:12-66` (64 KB cap, fixed errors).
- **Decisions that apply:**
  - D-LAB-2: "The closing review is its own page; each design question has 'Look at ◆ again'".
  - D-LAB-18: "With several designs, goal fit per design replaces the overall question"; D-LAB-21: "A rating changed after choosing is allowed and marked". LAB-18 builds both; keep Overall replaceable by section id.
  - R2 (D-LAB-34): "Isolation is proven by tests." R6 (D-LAB-38): "Ratify every UX route as written."
  - S18: "The team cannot submit the closing form." S20: "the wording is then versioned." S22: "Each send is kept as a numbered version, which records the pin triage as it was then."
  - data-contract.md: "`triage` (jsonb, keyed by comment id, with 'matters most')"; "answers at most 64 KB".
- **Interfaces:**
  - `sendReview(slug, { versionId, answers, triage })` returns `ok` (`number`, `createdAt`; LAB-19 adds email fields), `invalid` (`missing`), `closed` or `not-saved`.
  - The draft: localStorage `sandbox:review-draft:<slug>:<reviewerId>`, LAB-21's key kept, JSON `{ answers, triage, versionId? }`, removed on ok.
  - `@pem/db/sandbox`: `saveReviewVersion(db, viewer, { id, coreVersion, answers, triage })` returns `{ number, createdAt }`; `readMyLatestVersion(db, viewer)` returns `{ number, createdAt, answers, triage }` or null (LAB-21 may read its `createdAt`).
  - Config `questions` become `{ id, text, kind: "scale" | "choice" | "text", options?, required? }[]`, `targetedQuestion?` `{ text, labels }` (five), with an as-built line (LAB-4 allows it).
  - "Look at the design again": LAB-11's `?design=<id>&from=review`.
- **Per path:** `page.tsx`, `_components/`: page and form leaf; `actions.ts`: `sendReview`; `registry.ts`: question shapes; tests named by criterion id; `state.ts`: eleven review keys.
- **Gotchas:**
  - Mint the version id on Send and reuse it while the answers are unchanged; an edit after a failed send mints a new one, so a lost ok never swallows it.
  - Number in one statement: `insert … select coalesce(max(number), 0) + 1 … on conflict (id) do nothing returning`, read back by id when nothing returns, and retry on a unique violation of the reviewer's number.
  - Triage is checked against the viewer's stored comments, so a queued pin fails: flush first.
  - Text edits and Delete are LAB-12's `saveComment` and `deleteComment`; drop a deleted id's triage from the draft.
  - `[ASSUMPTION: on load a draft wins over the latest version (review-partial); it is the newest unsent work.]`
  - review.md's `[ASSUMPTION]`, checked at 79eba01: `@pem/ui`'s `questionnaire.tsx` pages one item at a time (Previous, Next, Progress), so it is not used.
  - Storage can throw: wrap it. The edit lead's date uses the reader's locale.
  - Web tests run only from `lib/**/*.test.ts`; `test:db` only locally. Fixtures are synthetic.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model trusts the client's checks or numbers by read-then-insert, and Results misread the version.
