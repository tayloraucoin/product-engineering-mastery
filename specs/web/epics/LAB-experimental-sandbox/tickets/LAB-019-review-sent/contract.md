---
id: LAB-19
size: small
objective: "After a stored send, the review page shows in place that the review arrived, where the confirmation went and how to change it, and says plainly when the email did not go."
slice_type: "A confirmation view driven by the send's result; the risk is claiming an email that never went, naming the wrong address, or treating a failed email as a failed review."
non_negotiables:
  - "Rendered in place at /experimental/<slug>/review from the send action's ok result only; a reload renders LAB-17's edit mode, never this view."
  - "Version 1 shows 'Review sent' and every later version 'Changes sent'; sent.md's Words verbatim; no answers, no version number and never the word 'version' (D-LAB-7)."
  - "The address is the access's recorded email (LAB-3's findAccessEmail) or, for a signed-in reviewer, the account email (S8); never form input, and it reaches the client only in this result."
  - "The send action takes an injected email result, sent or failed, after the version commits; failed or a throw shows sent-partial and never undoes or resends the version. LAB-20 swaps in the real send."
  - "On arrival focus is on the h1; 'Back to the designs' is primary and 'Change your answers' secondary; no motion and no celebration (A-13)."
  - "sent-* keys register in LAB-4's state.ts as team-only, on synthetic fixtures."
devs_call: "The component split, how 'Change your answers' returns to the form (state reset or navigation), and result field names beyond those in Interfaces."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/experimental/sent.md"
  - "D-LAB-7"
  - "D-LAB-19"
  - "C-LAB-sent-1"
  - "C-LAB-sent-2"
  - "C-LAB-sent-3"
  - "C-LAB-sent-4"
truth_files: "none: the approved proposal ux/experimental/sent.md reaches specs/web/ux/experimental/sent.md through yarn truth:promote LAB once its citing tickets close"
qa: Q2
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "apps/web/app/experimental/[slug]/review/actions.ts"
  - "apps/web/app/experimental/[slug]/review/_components/**"
  - "apps/web/lib/sandbox/review.ts"
  - "apps/web/lib/sandbox/review.test.ts"
  - "apps/web/lib/sandbox/client/sent.ts"
  - "apps/web/lib/sandbox/client/sent.test.ts"
  - "apps/web/lib/sandbox/state.ts"
depends_on:
  - LAB-17
out_of_scope:
  - "Storing versions, the form and edit mode: LAB-17."
  - "Building and sending the email: LAB-20, which binds sendConfirmation to this ticket's seam."
criteria:
  - id: C1
    statement: "A first send's ok result gives the heading 'Review sent', the body naming the recorded email (ana@example.com), and focus on the heading."
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "An ok result for version 2 or later gives 'Changes sent' and the changes body."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "When the injected email result is failed, or the email call throws, the version is stored once and the partial body shows, with no address in it."
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "Every sent.md ?state= key renders at 390, 834 and 1440, light and dark."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-019-review-sent/evidence/sent-states.png"
  - id: C5
    statement: "A signed-in reviewer's view names the account email; no view holds an answer, a version number or the word 'version'; with a stored version and no send result the page shows edit mode."
    evidence: test
    command: "yarn workspace web test"
---

# Contract — LAB-19 review-sent

## Build notes

- **Approach:**
  - `client/sent.ts` is pure: `sentView({ number, recipient, email })` returns `{ key, heading, body }`, with key `sent-success`, `sent-changes` or `sent-partial`; `sent-signed-in` is the success or changes view with the account email.
  - `lib/sandbox/review.ts`: `sendReviewWith`'s deps gain `recordedEmail(viewer)` and `confirm({ viewer, versionNumber, createdAt })`. After the store commits, the action resolves the recipient, awaits `confirm`, maps a throw to `failed`, and returns both on `ok`.
  - The form leaf swaps itself for the Sent view on `ok`, moves focus to the `h1`, and keeps the column and brand mark.
  - Prior art: LAB-11's deps seam in `lib/sandbox/experiment.ts`; `apps/web/lib/billing/webhook/handle.ts`.
- **Decisions that apply:**
  - D-LAB-7: "Reviewers call a variant a 'design'; 'version' means only a review send", because "One word, one meaning".
  - D-LAB-19: "The confirmation email carries no answers", because "The address is unverified (Warden)". The sent view repeats none either.
  - S8 (via sent.md): a signed-in reviewer's body "names the account email".
  - S22: "On sending, the reviewer gets an email through `@pem/email` confirming the send."
  - sent.md: "The email address shown is the one recorded for this browser's access."
- **Interfaces:**
  - `type ConfirmationEmailResult = "sent" | "failed"` (review.ts), the result LAB-20 maps its mailer to.
  - `sendReview`'s `ok` gains `recipient` and `email: ConfirmationEmailResult`.
  - `recordedEmailWith(deps, viewer)` (review.ts): `findAccessEmail`, or the account email when it is null. LAB-20's `confirmationRecipientWith` may reuse it.
  - `sentView` (client/sent.ts); four `sent-*` keys in `SANDBOX_STATE_KEYS`.
- **Per path:** `actions.ts`, binding the deps; `_components/`, the Sent view; `review.ts` and its test, C3 and C5's recipient; `client/sent.ts` and its test, C1, C2 and C5's view, named by criterion id; `state.ts`, four keys.
- **Gotchas:**
  - `[ASSUMPTION: until LAB-20 the bound confirm returns failed, so no page claims an email that was never sent; tests inject both.]`
  - Never await the email inside the version's transaction; a slow mailer must not hold the row.
  - The partial body replaces the whole email clause, address included.
  - The recipient is never logged and never put in a URL.
  - Fixtures are synthetic (`ana@example.com`). Web tests run only from `lib/**/*.test.ts`.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model shows "we've emailed" before the send resolves, or echoes the typed email from the form, and both mislead the reviewer.
