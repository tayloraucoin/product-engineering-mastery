---
id: LAB-20
size: small
objective: "Every review send emails the reviewer one confirmation through @pem/email, carrying only the approved words and a link back to the gate that fills the email and never grants access."
slice_type: "Transactional email to an unverified address (door 7); the risk is a message that hands a stranger answers, a title, a code or an email in a URL, or a failed send that loses the review."
non_negotiables:
  - "send-confirmation.ts sends one message per send through mailer from apps/web/lib/email.ts, on @pem/email's default template as is (Taylor, 2026-10-05); the locked package is not changed."
  - "The message holds the Words as amended in Build notes and nothing else: no answer, no experiment title, no design name, no code."
  - "The link is LAB-5's linkUrl(slug, accessId): its origin is env.ts's site URL, never the request host, and its only query is ?r=."
  - "The recipient is the access's recorded email, or the account email for a signed-in reviewer (S8); never form input, never logged."
  - "Version 1 gets the first-send subject and line; every later version gets the changes ones."
  - "The time is the version's created_at in the Europe/London constant from apps/web/lib/sandbox/shared/time.ts (LAB-4), with the zone named (R10)."
  - "A thrown or withheld send never undoes the saved version: the action returns LAB-19's failed email result, so sent.md shows sent-partial."
devs_call: "The pure builder's name and signature, the test fakes, and where in the review action the send is awaited, as long as it runs after the version commits."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/experimental/confirmation-email.md"
  - "D-LAB-19"
  - "D-LAB-20"
  - "C-LAB-email-1"
  - "C-LAB-email-2"
  - "C-LAB-email-3"
  - "C-LAB-email-4"
  - "C-LAB-email-5"
truth_files: "none: the approved proposal ux/experimental/confirmation-email.md reaches specs/web/ux/experimental/confirmation-email.md through yarn truth:promote LAB, reconciled there with the template ruling"
qa: Q2
reviewers:
  - warden
focus:
  - "nothing in the mail beyond the approved wording (warden)"
operator_review: false
planned_paths:
  - "apps/web/app/experimental/[slug]/review/send-confirmation.ts"
  - "apps/web/app/experimental/[slug]/review/actions.ts"
  - "apps/web/lib/sandbox/review/confirmation.ts"
  - "apps/web/lib/sandbox/review/confirmation.test.ts"
depends_on:
  - LAB-5
  - LAB-19
out_of_scope:
  - "Saving versions: LAB-17. The sent page and its sent-partial state: LAB-19."
  - "Prefilling the gate from ?r=: LAB-7. The token and linkUrl: LAB-5."
  - "Any change to @pem/email, a Resend dashboard template, open or click tracking (S29)."
  - "Sending from a hosted tier: local logs the message; a staging send is the operator's step."
criteria:
  - id: C1
    statement: "A first send gives one message to the recorded address with the subject 'Your design review was received'; a signed-in reviewer's goes to the account email."
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "A send of version 2 or later gives one message with the subject 'Your changes were received' and the changes line."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "Built from a review with synthetic answers, title, code and design names, the subject, HTML and text contain none of them; the only links are the gate link, the support mailto and the brand home, and no URL holds the reviewer's email or a code."
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "The message's link opened without a cookie gives the gate with the email filled and the code still required; a tampered token gives the blank gate."
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "2026-10-05T13:32Z reads '5 October 2026 at 14:32 BST' and 2026-12-01T09:10Z reads '1 December 2026 at 09:10 GMT', whatever the process's zone."
    evidence: test
    command: "yarn workspace web test"
  - id: C6
    statement: "When the mailer throws or returns withheld, the version stays saved and the action returns the failed email result, with no address, link or body in any log."
    evidence: test
    command: "yarn workspace web test"
  - id: C7
    statement: "The rendered plain text and HTML, first send and changes, match the Words as amended."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-020-confirmation-email/evidence/email-render.png"
---

# Contract — LAB-20 confirmation-email

## Build notes

- **Approach:**
  - `lib/sandbox/review/confirmation.ts` is pure.
    - `confirmationEmail({ kind, receivedAt, link })` returns `@pem/email`'s `DefaultEmail`.
    - `formatReceivedAt(instant)` formats the time.
    - `confirmationRecipientWith(deps, viewer)` returns LAB-3's `findAccessEmail`, or the account email when that is null.
  - `send-confirmation.ts` is a thin wrapper: recipient, `linkUrl`, `mailer.send`, mapped to LAB-19's result.
  - The review action (LAB-17, LAB-19) swaps its injected email result for `sendConfirmation`.
  - Prior art: the `sendWelcome` example in `packages/email/README.md`. `renderDefaultEmail` (`packages/email/src/default-template.ts`) renders C3 and C7 in the test.
- **Words as amended** (Taylor, 2026-10-05: the template as is):
  - Subject: "Your design review was received", or "Your changes were received".
  - Heading: "Review received", or "Changes received".
  - Paragraphs, in order:
    - "Thanks for your review. We received it on 5 October 2026 at 14:32 BST.", or "Thanks. We received your changes on 6 October 2026 at 09:10 BST."
    - "You can change your answers until the review closes; the team reads your latest."
    - "If you didn't send a design review, you can ignore this email."
    - "You'll need your access code."
  - Action: "Open the review".
  - The template's footer (support address, brand home link) stands in for "Questions? Email hello@example.com". The brand name stands in for the mark.
- **Decisions that apply:**
  - D-LAB-19: "The confirmation email carries no answers", because "The address is unverified (Warden)".
  - D-LAB-20: "The email carries no experiment title", because "Titles can be confidential".
  - R6 (D-LAB-38): "The email link is `/experimental/<slug>?r=<token>`: a signed access id that fills the email and never grants access. Slugs are named as if they will leak."
  - R10 (D-LAB-41): "`Europe/London`, named in the email, one constant."
  - S22: the link "is a convenience, not a key: it opens the experiment with the email filled in, and the code is still required."
- **Interfaces:** `confirmationEmail`, `formatReceivedAt` and `confirmationRecipientWith` (confirmation.ts); `sendConfirmation({ viewer, versionNumber, createdAt })` (send-confirmation.ts), returning LAB-19's email result type.
- **Per path:**
  - `send-confirmation.ts`: the wrapper.
  - `actions.ts`: the wiring only.
  - `confirmation.ts` and its test: C1 to C6, named by criterion id. C4 runs LAB-7's `gateView` with LAB-5's `readLinkEmail` on a stub.
- **Gotchas:**
  - `yarn workspace web test` runs only `lib/**/*.test.ts`, and `send-confirmation.ts` imports `server-only` through `lib/email.ts`. Keep the logic in `lib/sandbox`.
  - The mailer returns `logged` on local: count it as sent. `withheld` and a throw are failures.
  - The `findAccessEmail` lookup is gate.ts's, reached only from `lib/sandbox`; no new query.
  - `[ASSUMPTION: the zone is named as Intl's en-GB short name after the time ("14:32 BST"); R10 needs the zone named, and the Words' example omits it.]`
  - Send after the version's transaction commits, never inside it.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model adds the title "for context" or the answers "as a receipt", which is exactly the leak.
