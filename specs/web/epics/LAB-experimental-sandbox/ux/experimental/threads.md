---
target: specs/web/ux/experimental/threads.md
status: approved
promoted:
---

# Threads (collaborate mode) — experimental — beat 2

> **Beat 2.** Built after beat 1 passes (S31). Specified now so the comment table carries a parent id from beat 1 (door 2) and the notice's collaborate line is fixed before any collaborate experiment runs (door 8).

## Job

In a `collaborate` experiment, every reviewer sees everyone's comments and can reply under any one of them, so a group converges in place without a call. Done: a reviewer has read the others' comments and answered the ones that matter to them. The closing review stays individual (S31).

## Layout and components

- **Notice step** (door 8, S12b): after a live code on a collaborate experiment, and before the page, a one-time step in the gate's column. Heading "Before you start"; body "In this review, the other reviewers can see your comments, your replies and your name."; button "Continue to the review". It is shown once per code. The gate itself never reveals the mode.
- **Everything in `pins.md`, `pin-list.md`, `review.md` and `team-layer.md` holds, except:**
- **Team view in collaborate mode:** a reviewer pin's popover gains the replies and the Reply field (the only control the team gets on a reviewer's pin). To the team, reply authors are named by the code's label and team replies by the team member's email; to reviewers, by display name and "From the team".
- **Pins:**
  - The reviewer's own pins stay filled and numbered. They are the only pins in their triage.
  - Other reviewers' pins are outlined and unnumbered.
  - Team notes are never shown (D-LAB-17).
- **Names:** each comment shows the display name set on its code, "Ana R." (D-LAB-16), never an email or the private label. Team replies show as "From the team", never a person's name or email (D-LAB-17).
- **Pin popover:**
  - the comment, then its replies, oldest first, each with name and time;
  - then a `Textarea` labelled "Reply", 2,000 characters max, with "Send reply".
  - **Threads are one level deep.** Replying to a reply adds to the same thread.
  - There is no resolve or status (pinned).
- **Who can do what:**
  - Everyone, team included, can reply. Team replies are visible to reviewers (D-LAB-17).
  - People edit and delete only their own comments and replies. Own replies carry "Edit" and "Delete" (named "Edit your reply", "Delete your reply"). A deleted reply shows the toast "Reply deleted. Undo". Deleting a comment with replies, or erasing its author, leaves "Comment removed" in its place, and the other people's replies stay.
- **Updates:** nothing updates live. Replies load with the page, and again when a pin is opened. No email is sent about replies.
- **The list** has groups by design, with "Yours" first in each, then the others by name. Each item shows its reply count: "3 replies".
- Replies are queued and retried with the same id, as pins are.

## States

| State          | Key                  | What shows                                   | What the person can do | Copy                                                                |
| -------------- | -------------------- | -------------------------------------------- | ---------------------- | ------------------------------------------------------------------- |
| empty          | `threads-empty`      | No comments from anyone                      | Comment                | "No comments yet. Turn on Comment and choose any part of the page." |
| no replies     | `threads-no-replies` | Popover with no replies                      | Reply                  | —                                                                   |
| loading        | `threads-loading`    | Popover replies area shows a static skeleton | Wait                   | —                                                                   |
| error          | `threads-error`      | Line in the popover                          | Retry                  | "Couldn't load replies. Retry"                                      |
| partial        | `threads-partial`    | A reply marked unsent                        | Retry                  | "Not sent yet"                                                      |
| offline        | `threads-offline`    | Reply queued                                 | Keep writing           | "Kept in this browser; it will send when you're back."              |
| success        | `threads-success`    | The reply is listed                          | —                      | —                                                                   |
| deleted parent | `threads-deleted`    | Placeholder with replies kept                | Reply                  | "Comment removed"                                                   |
| notice step    | `threads-notice`     | The one-time notice                          | Continue               | as Layout                                                           |

## Words

- The strings are above.
- The notice step's words are in Layout.
- `/admin` hint on the display name (in `../admin/access-codes.md`): "Other reviewers in this review see this name."

## Access

- **Pin names:** "Comment by Ana R., 2 replies, on Pricing table" for others; "Comment 3, yours, 2 replies, on Pricing table" for one's own. List actions on others' comments are named "Show Ana R.'s comment on page".
- **Replies** are a list inside the popover, each an article with the name and time.
- **On send**, announced politely: "Reply sent." Focus returns to the empty Reply field.

## Instrumentation

The reply record: id, parent id, author (code or user), text and time. Reply records are covered by erasure (S28).

## Criteria

| ID              | When                                                | Then                                                                                                          | Evidence |
| --------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| C-LAB-threads-1 | A collaborate experiment with two reviewers         | Each sees both reviewers' pins; only their own are numbered                                                   | test     |
| C-LAB-threads-2 | Any reviewer-visible name                           | It is the display name; no email or label appears                                                             | test     |
| C-LAB-threads-3 | A team note exists                                  | No reviewer can fetch it; a team reply is visible                                                             | test     |
| C-LAB-threads-4 | A reply to a reply                                  | It joins the same one-level thread                                                                            | test     |
| C-LAB-threads-5 | A reviewer is erased                                | Their comments and replies are hard-deleted; others' replies under their comment stay under "Comment removed" | test     |
| C-LAB-threads-9 | A live code on a collaborate experiment, first time | The notice step shows before the page; an unknown or private slug never shows it                              | test     |
| C-LAB-threads-6 | A private experiment                                | No reviewer can fetch another's pins or replies                                                               | test     |
| C-LAB-threads-7 | Keyboard alone with a screen reader                 | Read the replies, reply, edit and delete                                                                      | manual   |
| C-LAB-threads-8 | Each `?state=` key                                  | It renders at 390, 834 and 1440, light and dark                                                               | capture  |

## Decisions and open items

D-LAB-16, D-LAB-17. None open.
