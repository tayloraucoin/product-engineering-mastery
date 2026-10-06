---
target: specs/web/ux/experimental/sent.md
status: approved
promoted:
---

# Review sent — experimental

## Job

Confirm the review arrived, say what happens to it, and show how to change it. Done: the reviewer believes it is received and that nothing more is needed.

## Layout and components

- The review page's column and brand mark. A heading, one paragraph, and two `Button`s. "Back to the designs" is primary; "Change your answers" is secondary.
- Shown at the review page's address, in place, after a successful send. A reload shows the review in edit mode.
- No answers are repeated here and no version number is shown. "Version" is the team's word (D-LAB-7).

## States

| State                          | Key              | What shows                                                               | What the person can do | Copy                                                                                                                                                                                                     |
| ------------------------------ | ---------------- | ------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| success                        | `sent-success`   | First send                                                               | Back, or change        | Heading: "Review sent". Body: "The team has it, and we've emailed a confirmation to ana@example.com. You can change your answers until the review closes; the team reads your latest."                   |
| changes                        | `sent-changes`   | A later send                                                             | Back, or change        | Heading: "Changes sent". Body: "The team has your changes, and we've emailed a confirmation to ana@example.com. You can keep changing your answers until the review closes; the team reads your latest." |
| signed in                      | `sent-signed-in` | Send under an account (S8)                                               | As above               | The body names the account email                                                                                                                                                                         |
| email failed                   | `sent-partial`   | Send stored; the email did not go                                        | As above               | The email clause is replaced: "The team has it. We couldn't send the confirmation email, but your review is saved. You can change your answers until the review closes; the team reads your latest."     |
| empty, loading, error, offline | N/A              | This page renders only after a stored send. Failures stay on `review.md` | —                      | —                                                                                                                                                                                                        |

## Words

The strings are above. The email address shown is the one recorded for this browser's access.

## Access

- On arrival, focus is on the `h1`, so a screen reader reads "Review sent" first.
- The two buttons are named as shown.
- No motion and no celebration (A-13).

## Instrumentation

None beyond the version record in `review.md`.

## Criteria

| ID           | When                                   | Then                                                                 | Evidence |
| ------------ | -------------------------------------- | -------------------------------------------------------------------- | -------- |
| C-LAB-sent-1 | A first send succeeds                  | "Review sent" shows with the recorded email; focus is on the heading | test     |
| C-LAB-sent-2 | A later send succeeds                  | "Changes sent" shows                                                 | test     |
| C-LAB-sent-3 | The send is stored but the email fails | The partial line shows, and the version is stored                    | test     |
| C-LAB-sent-4 | Each `?state=` key                     | It renders at 390, 834 and 1440, light and dark                      | capture  |

## Decisions and open items

D-LAB-7, D-LAB-19. None open.
