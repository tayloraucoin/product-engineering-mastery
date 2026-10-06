---
target: specs/web/ux/experimental/confirmation-email.md
status: approved
promoted:
---

# Confirmation email — experimental

## Job

Confirm a send reached the team, and give the reviewer a way back to change it. The way back is a convenience, not a key (S22). Done: the reviewer has a record and a link. Someone who receives it by mistake learns almost nothing.

## Layout and components

- Sent through `@pem/email` on every send, the first and each change (S22), as plain text plus HTML with the brand mark.
- One button-styled link. Nothing else is linked except the contact address.
- **Carries no answers** (D-LAB-19) and **no experiment title** (D-LAB-20). The address is unverified (S7), so a typo must not deliver a client's review or project name to a stranger (Warden).
- **The link** opens the experiment's gate with the email filled in, and the code is still required. It carries neither the email nor the code in its URL (S22, door 7). How the email is filled is Mason's call at Technical.
- Arriving after the experiment closes, a live code leads to `ended.md` (S16).

## States

| State                                            | Key               | What shows                                                                               | What the person can do | Copy                                                                                                                      |
| ------------------------------------------------ | ----------------- | ---------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| first send                                       | `email-first`     | The confirmation                                                                         | Open the review        | as Words                                                                                                                  |
| changes                                          | `email-changes`   | The subject and first line change                                                        | Open the review        | as Words                                                                                                                  |
| signed in                                        | `email-signed-in` | Sent to the account email                                                                | Open the review        | Same. The link opens the gate's signed-in face, which asks for the code only (unless this browser's access is still live) |
| empty, loading, error, partial, offline, success | N/A               | An email has no interactive states. A failed send is shown on `sent.md` (`sent-partial`) | —                      | —                                                                                                                         |

## Words

- **Subject:** "Your design review was received". For a later send: "Your changes were received".
- **HTML heading:** "Review received", or "Changes received".
- **Body:**
  - "Thanks for your review. We received it on 5 October 2026 at 14:32." For a later send the line is "Thanks. We received your changes on 6 October 2026 at 09:10."
  - "You can change your answers until the review closes; the team reads your latest."
  - Button: "Open the review". Below it: "You'll need your access code."
  - "If you didn't send a design review, you can ignore this email."
  - "Questions? Email hello@example.com"
- The time is shown in the server's configured time zone, with the zone named. `[ASSUMPTION: Europe/London; Mason sets it at Technical.]`
- The sender name is the brand name from `@pem/brand`.

## Access

- Plain text is always included.
- The HTML uses real headings and a link with the text "Open the review", never "click here".
- Body text contrast passes 4.5:1. Nothing depends on images loading. The mark has alt text that is the brand name.

## Instrumentation

None. No open tracking or click tracking: it would widen the notice (S29).

## Criteria

| ID            | When                                   | Then                                                                              | Evidence |
| ------------- | -------------------------------------- | --------------------------------------------------------------------------------- | -------- |
| C-LAB-email-1 | A review is sent                       | One email goes to the recorded address with the first-send subject                | test     |
| C-LAB-email-2 | A change is sent                       | One email goes with the changes subject                                           | test     |
| C-LAB-email-3 | Any confirmation email                 | It contains no answer text, no experiment title, no code, and no email in any URL | test     |
| C-LAB-email-4 | The link is opened without a live code | The gate shows and asks for the code                                              | test     |
| C-LAB-email-5 | Rendered plain text and HTML           | They match the Words exactly                                                      | capture  |

## Decisions and open items

D-LAB-19, D-LAB-20. Routed to Technical: how the email field is filled (door 7); the time zone.
