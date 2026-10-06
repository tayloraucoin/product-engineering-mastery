---
target: specs/web/ux/experimental/ended.md
status: approved
promoted:
---

# Review has ended — experimental

## Job

Tell a reviewer who returns after close that the review is over, and that what they sent was received. Without this page they would conclude their review was lost or the link is broken (S12b). Done: they leave knowing nothing is expected of them.

## Layout and components

- The gate's column and brand mark. A heading, one or two lines of body, and an optional `Collapsible` holding unsent comments. There is no primary action.
- **Shown only:**
  - after a live code is entered on a closed experiment, including arrivals from the confirmation email (S16);
  - on the next page load after an open experiment closes, for someone already in.
- **Never shown** to someone without a live code, who sees the plain gate (S12b), or to the team, who still view (S16).

## States

| State | Key | What shows | What the person can do | Copy |
| --- | --- | --- | --- | --- |
| sent | `ended-success` | Heading, sent line, contact | Leave | "The team has your review, sent on 3 October. Nothing more can be added now." |
| not sent | `ended-empty` | Heading, not-sent line, contact | Leave | "The team is no longer taking feedback on this one. Any comments you left before it closed have been kept." |
| unsent pins | `ended-partial` | One of the above, plus the count and a collapsible list of the unsent comments' text, read-only and selectable | Read or select the text | "2 comments in this browser weren't sent before it closed." Toggle: "Show them" / "Hide them" |
| loading | `ended-loading` | N/A: rendered on the server, with no client fetch | — | — |
| error | `ended-error` | N/A: if the server fails, the app's error page shows | — | — |
| draft cleared | `ended-draft` | Base line, plus the draft line | Leave | as below |
| draft and comments | `ended-draft-partial` | Base line, draft line, comment count and list | Read | as below |
| offline | `ended-offline` | N/A: the page needs no request after load | — | — |

**An unsent review draft** in this browser is cleared on arrival. Whenever one existed, the line "Answers you hadn't sent couldn't be added, and have been cleared from this browser." shows under the sent or not-sent line, with or without the comments list (key `ended-draft`; both together: `ended-draft-partial`).

**Unsent comments.** This browser's queued comments for this experiment are listed in the `ended-partial` state. They are cleared from the browser when the reviewer leaves the page (D-LAB-8). Nothing is sent.

## Words

- Heading: "This review has ended"
- The sent or not-sent line, from States. The date is the latest send's date, in the reviewer's locale.
- Footer: "Questions? Email hello@example.com" (`@pem/brand` `contact.email`).

## Access

- The heading is the page `h1`. The disclosure is a native button with `aria-expanded`, named "Show them" or "Hide them".
- The unsent text is a list of plain paragraphs, with no inputs.
- No motion.

## Instrumentation

None. Opening this page records no view.

## Criteria

| ID | When | Then | Evidence |
| --- | --- | --- | --- |
| C-LAB-ended-1 | A live code is entered for a closed experiment | This page shows, not the gate's error | test |
| C-LAB-ended-2 | A reviewer with a sent review reaches this page | The sent line shows the latest send's date | capture |
| C-LAB-ended-3 | A reviewer who never sent reaches this page | The not-sent line shows | capture |
| C-LAB-ended-4 | The browser holds 2 queued comments for this experiment | The count and their text show; after leaving, the queue for this experiment is empty | test |
| C-LAB-ended-5 | A team member opens a closed experiment | The experiment shows, never this page | test |
| C-LAB-ended-6 | No live code is held | This page is unreachable; the gate shows | test |
| C-LAB-ended-7 | Each `?state=` key in States | It renders at 390, 834 and 1440, light and dark | capture |

## Decisions and open items

D-LAB-8. None open.
