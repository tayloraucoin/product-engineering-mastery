# As-built — LAB-17

## Shipped against the contract

- C1, C10: `/experimental/<slug>/review` (`app/experimental/[slug]/review/`). Core v1 is data in `lib/sandbox/client/review-core.ts`: section ids, words, option ids. Answers store option ids, never labels. `evidence/review-sections.png` shows the order on a one-design page (Overall, Your comments, Blockers, Gaps, the targeted question, the config's questions, Next step). `evidence/review-states.png` shows all eleven `review-*` keys at 390, 834 and 1440, light and dark, under reduced motion, full page.
- C2: `commentsOpen` in `client/review-form.ts`. On a first send, until goal fit has an answer, the comments section holds only its heading and the locked line, with no comment text; in edit mode it is open.
- C3: `commentPlayback` and `editedPin` in `client/review-view.ts`. Each comment shows its number, design (several designs only), place and type, an editable text and a three-way triage. A text edit on blur saves the pin itself through LAB-12's one sender, under its id (checked live: `saveComment` under the same id). `mattersMostView`: with exactly one Must or Should, it is set and hidden.
- C4: `requiredGaps` returns the gaps in page order. The browser and the server use the same check. The summary takes focus and links to each field. The server answers `invalid` and names only field ids.
- C5: `sendReviewWith` (`lib/sandbox/review.ts`) checks size (answers at most 64 KB), shape, viewer, the config's questions and options, and every triage key against the viewer's own comments, then every required answer, then stores. Results are fixed and never echo input.
- C6, C11: `saveReviewVersion` and `readMyLatestVersion` (`packages/db/src/sandbox/review.ts`). They lock the reviewer row, then insert with `max + 1` in the statement itself `on conflict (id) do nothing`, then read back by id scoped to the reviewer. A unique violation of the reviewer's number is retried. Triage keys are checked again inside the transaction. Isolation cases exist for every viewer kind.
- C7: `sendReviewFlow` (`client/review-send.ts`) flushes LAB-12's queue first. The version goes only once the queue is empty. A pin left unsent shows review-send-failed; a pin refused as closed shows review-closed.
- C8: closed is decided before any read; the store stub is never called.
- C9: checked in the browser pane (fieldsets, legends, summary focus, error links, the disabled reason), then deferred: `evidence/C9-operator.md`.
- C12: `reviewPageView` sends the team to the experiment page unless a review key renders its fixture, and their send stores nothing. The gate and a closed experiment also go to the experiment's address.
- Walked live as a seeded reviewer on the local database: gate, review, a refused send (5 gaps, summary focused), answers, a reload restoring the draft, Send. Version 1 was stored with the triage and matters most, and the draft was cleared. Reopening showed edit mode ("Send changes", the lead's date in the reader's locale). A changed send stored version 2 and left version 1 unchanged.

## Deviations

- `registry.ts`: config `questions` take `kind` (`scale` | `choice` | `text`, default `text`), `options` (2–7, for scale and choice only) and `required` (default false). `targetedQuestion` becomes `{ text, labels }` with five labels. LAB-4 allowed this. A question with no kind is text, so `pricing-2026` and LAB-4's tests are unchanged.
- The answers' JSON shape: `{ overall?, blockers?: { none: true } | { text }, gaps?, targeted?, questions?: { [id]: value }, nextStep? }`. Config answers sit under `questions`, so no config id collides with a core id. The triage is `{ comments: { [id]: "must" | "should" | "fine" }, mattersMost }`. The server sets "matters most" itself when exactly one comment is Must or Should.
- The draft is `{ answers, triage, versionId? }`, with the form's own fields as `answers`, so unsent blocker text survives the "Nothing, I'd approve it" box. Any change drops `versionId`.
- Isolation cases are in `isolation.test.ts`, C6 and C11 in `test/sandbox/review.test.ts`, as planned. The web tests are in `lib/sandbox/review.test.ts`.
- The page reads the reviewer's comments and latest version on the server behind a static skeleton (review-loading), then merges the browser's queue over them after mount.
- [ASSUMPTION] The page's `h1` is the experiment's title; review.md names no heading.
- [ASSUMPTION] Each field error's wording, and "1 answer is missing", are not in review.md's Words (`REVIEW_ERRORS`). They are for assay to check.
- [ASSUMPTION] The config's extra questions take no section heading: each is a fieldset whose legend is the question.
- [ASSUMPTION] With no comments, the no-comments line shows at once. The locked line would promise comments that do not exist.
- [ASSUMPTION] An empty or over-2,000-character text edit is never saved; the pin keeps its text.
- [ASSUMPTION] On a successful send, the sent slot shows sent.md's heading ("Review sent", or "Changes sent" for a later send) and "Back to the designs", focused, until LAB-19.
- [ASSUMPTION] A failed server read of comments or the latest version falls to Next's error page; review.md designs no load-failure state.
- "Look at the design again" (one design) stores the question in sessionStorage, so focus returns there on the way back.

## Review (Q2, in the thread: assay, and mason on the focus line)

- assay, round 1: PASS, Should-fix 2. Both fixed, with the cheap yellows (75f0621):
  - Orange: the send-failed, offline and closed lines read at 14px; they now use the base size, weight 500.
  - Orange: a missing triage's summary link read "Comment 3"; it now names its group.
  - Yellow: "Can't judge yet" now sits a spacing step apart.
  - Yellow: the comments section now shows focus.
  - Yellow: leaving from the no-comments line now brings focus back.
  - Yellow: a matters-most excerpt now ends on a whole word.
  - Left as notes:
    - The textarea's 14px from 768px is `@pem/ui`'s own default.
    - review.md says both "goals listed above" and "the goals below", and asks for a "native radio group" where the spec names Base UI's `RadioGroup`; both lines need the spec owner.
- mason, round 1: FAIL. Red: a send refused because the comments changed in another tab (a pin added, or one deleted) was a silent dead end. Fixed in 5eace7c: on `invalid`, or a `not-saved` whose comments differ, the flow reloads the comments through `listMyComments`; the page plays back the server's set, keeps only triage that still applies, and asks for what is missing; otherwise it shows send-failed. Also fixed:
  - Yellow: a pin the queue still holds after a send reads "not sent".
  - Grey: a restored draft whose triage lost a comment mints a new version id.
  - Grey: targeted labels cap at 200 characters.
- mason, round 2: PASS, Should-fix 0. One grey: after a deletion elsewhere with the rest complete, the page shows send-failed and the retry succeeds.
- Re-proven and recaptured after the fixes.

## Not verified

- C9 with a screen reader (handed to the operator).
- Captures were taken against an uncommitted scratch copy whose `team.ts` returns a synthetic admin from a cookie, since this machine has no Supabase Auth. It also has a scratch-only one-design slug, `lab17-capture`, with a targeted question and one extra question of each kind. Headless Chrome was driven over the DevTools protocol, the method LAB-11 used.

## Next

- LAB-18 replaces Overall by its section id with goal fit per design, and adds the choice.
- LAB-19 fills the sent slot.
- LAB-21 reads the draft key and may read `readMyLatestVersion`'s `createdAt`.
