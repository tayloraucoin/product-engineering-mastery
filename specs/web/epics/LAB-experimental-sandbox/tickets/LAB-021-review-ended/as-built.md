# As-built — LAB-21

## Shipped against the contract

- C1: `page.tsx`'s ended branch renders `Ended` (`_components/ended/`) from `endedPageWith` (`lib/sandbox/ended.ts`). The test builds LAB-5's `ended` through the real `resolveViewerWith` and checks that the only read is the reviewer's own `latestSentAt`. LAB-11's `recordViewWith` answers `not-counted` and writes nothing. A source scan shows the three ended files import no action and call no fetch, beacon or storage method directly.
- C2: a developer or admin on a closed slug gets the experiment, and a request without a live code gets the gate (closed, open and unknown slugs). A live reviewer on an open slug gets the experiment. None of them reaches `endedPageWith`'s read. The five ended keys are `team` in `state.ts` and read as absent for a reviewer or a guest.
- C3: `arriveEnded` reads the queue's `body` strings through LAB-12's `queueKey` and removes the queue on `pagehide` only. The test dispatches `pagehide` on an `EventTarget`; the other slug's and the other reviewer's queues are untouched. A malformed queue, or a storage that throws, gives no count and no error.
- C4: `takeDraft` removes the draft under LAB-17's `draftKey` on arrival. It returns true only when the draft was there and is now gone, so the line never claims a clear that failed.
- C5: `latestSentAt(db, viewer, {})` in `packages/db/src/sandbox/review.ts` selects only `created_at`, scoped by `reviewerScope`. The isolation cases cover every viewer kind: the team is refused, a crossed slug or reviewer reads null, input is refused and nothing is written. `test/sandbox/ended.test.ts` covers a reviewer who never sent (null) and the newest of two versions.
- C6: `evidence/ended-sent.png` is the real flow on the local Postgres: a seeded code on a scratch closed slug, a version dated 3 October, and two queued comments plus a draft written to this browser. It shows "sent on October 3" in the reader's locale (en-US headless Chrome), the draft line, the count and the opened list. `evidence/sent-flow.json` holds the storage before and after: on arrival the queue is kept and the draft is gone; after leaving, this slug's queue is gone and the other slug's is kept; on return only the sent line shows.
- C7: `evidence/ended-not-sent.png`: a second seeded code that never sent, entered through the real gate (`not-sent-flow.json`).
- C8: `evidence/ended-states.png`: the five keys at 390, 834 and 1440, light and dark, under reduced motion; the two keys with comments are shot closed and opened (42 shots; `states-shots.json` holds each shot's text and `aria-expanded`, false then true). `evidence/capture-ended.mjs` reproduces C6 to C8 (LAB-7's DevTools harness).

## Deviations

- **The latest-send read is new, not LAB-17's `readMyLatestVersion`.** That read also returns answers and triage, and the ended page needs the instant only. `latestSentAt` takes `(db, viewer, input)`, the isolation suite's viewer arity, rather than the contract's `(db, viewer)`.
- **`lib/sandbox/ended-data.ts`** is outside the planned paths. It binds `latestSentAt` to the database, because `app/` may not import `@pem/db/sandbox` and `ended.ts` is loaded by the client leaf. It follows `review-data.ts` and LAB-12's `comments-data.ts`.
- **Keys** are LAB-12's `queueKey` and LAB-17's `draftKey`, imported rather than restated. The values match the contract's.
- **Split:** the server `Ended` renders the column, mark, h1, not-sent line and footer. `EndedSentLine` (client) formats the date. `EndedBrowser` (client) holds the draft line, the count and the disclosure. The disclosure is `@pem/ui`'s `Collapsible`: Base UI's native `<button>` with `aria-expanded` and `aria-controls`, checked in the browser. Its trigger is an outline button 44px tall.
- [ASSUMPTION] Before hydration, the date reads in UTC and en-GB ("3 October"), so the line is never missing its date. After mount it uses the reader's locale and zone, as LAB-7's lock time does.
- [ASSUMPTION] "1 comment in this browser wasn't sent before it closed." The Words give only the plural.
- [ASSUMPTION] A queued entry whose body is empty or whitespace is skipped, as one without a body is.
- [ASSUMPTION] Fixtures: `ended-success` and `ended-partial` are sent (noon UTC, 3 October); `ended-empty`, `ended-draft` and `ended-draft-partial` are not sent. ended.md's "one of the above" leaves the choice open.
- In development, React runs the arrival effect twice, and the second run finds the draft already gone. The leaf keeps the draft line once a clear has happened.
- Captures came from a scratch worktree whose `team.ts` returns a synthetic admin for a cookie, with a scratch-only closed slug `lab21-capture`, as LAB-11 to LAB-17 did. The same non-sanctioned DevTools harness as LAB-7, so the pre-P-C capture rule's silence still applies.
- Proven in a clean detached worktree at c618ec7, because other threads' uncommitted files sit in this ticket's planned paths (`packages/db/src/sandbox/**`, `state.ts`).

## Review (Q2, in the thread: assay)

- Round 1: PASS. No black, red or orange findings.
- Yellow, fixed: the closed disclosure was not captured. C8 was recaptured with closed and opened rows and re-recorded.
- Yellow, accepted as declared: the pre-hydration UTC date (Deviations).
- Grey, kept: the extra gap above the count groups the unsent block; the draft-line merge is for React's double effect, not dead code; A-05 on a neutral rule beside a quoted list goes to the rubric's owner.

## Not verified

- A screen-reader pass over the disclosure: no criterion asks for it, and the ARIA wiring was read in the browser only.
- Mobile Safari's `pagehide` on a real device: only headless Chrome's navigation was exercised.

## Next

LAB-19's sent page links back to the experiment; after close, that link lands here. `yarn truth:promote LAB` promotes ended.md once LAB-21 closes.
