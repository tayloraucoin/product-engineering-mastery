---
target: specs/web/ux/experimental/pin-list.md
status: approved
promoted:
---

# Pin list — experimental

## Job

See every comment you left, on every design, in one place. Jump to any one, fix or remove it, and send what is stuck. For keyboard and screen-reader users it is the first way into pins. Done: the reviewer knows what they said and that it is saved.

## Layout and components

- Opened from the bar's "Comments 5". It is a `Sheet` from the right at 768px and wider, and a bottom `Drawer` below 768px. Title: "Your comments".
- At the top, when some are unsent: a line and a Retry button. Below 768px the bar's save status also shows here.
- **Groups:** one per design, in switcher order, each headed with the glyph and name ("● Circle design", 2 comments). Within a group, comments are in number order. A single-design experiment has no group heading.
- **Each item** is an `Item` showing:
  - the number, the type (if set) and the place ("On: Pricing table");
  - the text, clamped to three lines with "Show all" / "Show less" (named "Show all of comment 3");
  - "Not sent", or "Not found on the page; the design may have changed since";
  - actions: "Show on page", "Edit", "Delete".
- **"Show on page"** switches design if needed, closes the list, scrolls the pin into view, and opens its popover with focus inside. It is hidden for a not-found pin.
- **"Edit"** turns the item's text into the composer in place. "Delete" behaves as on the pin: toast "Comment 3 deleted. Undo".
- **Retry** resends every queued comment with the same ids. It also runs on load and on reconnect (`pins.md`).

## States

| State      | Key             | What shows                                                                          | What the person can do                                  | Copy                                                                                           |
| ---------- | --------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| empty      | `list-empty`    | One line and one button; no group headings                                          | Start commenting (closes the list and turns Comment on) | "No comments yet. Turn on Comment and choose any part of the page." Button: "Start commenting" |
| loading    | `list-loading`  | Skeleton rows, three per group, the final layout's shape (static, no shimmer: A-14) | Wait                                                    | —                                                                                              |
| error      | `list-error`    | Error line; queued comments still listed                                            | Retry                                                   | "Couldn't load your comments. Retry"                                                           |
| partial    | `list-partial`  | Unsent line at the top; items marked                                                | Retry                                                   | "2 not sent yet." Button: "Retry"                                                              |
| offline    | `list-offline`  | Offline line; Retry disabled                                                        | Reconnect                                               | "You're offline. These will send when you're back."                                            |
| success    | `list-success`  | Full list                                                                           | All actions                                             | —                                                                                              |
| not found  | `list-detached` | Item marked; no "Show on page"                                                      | Edit, delete                                            | "Not found on the page; the design may have changed since"                                     |
| retry done | `list-retried`  | Unsent line gone; announced                                                         | —                                                       | "2 comments sent."                                                                             |

## Words

The strings are above. The count in the title region reads "5 comments" or "1 comment".

## Access

- **The sheet or drawer:**
  - a dialog named "Your comments", with focus moved to the title on open, focus trapped, Escape closing it, and focus returning to the "Comments" button;
  - each design group is a `section` with a heading;
  - each item is a list item, and its actions are named with the number ("Show comment 3 on page", "Edit comment 3", "Delete comment 3").
- After "Show on page", focus lands inside the opened pin popover (`pins.md`).
- After a delete, focus moves to the next item, or to the title if none is left.
- The unsent line is in a polite live region.
- **Reduced motion:** the sheet and drawer fade with opacity only. Opened by keyboard, they appear at once (A-15).

## Instrumentation

None beyond `pins.md`.

## Criteria

| ID           | When                                                | Then                                                                     | Evidence |
| ------------ | --------------------------------------------------- | ------------------------------------------------------------------------ | -------- |
| C-LAB-list-1 | A reviewer has pins on two designs                  | The list groups them by design in switcher order, numbered               | capture  |
| C-LAB-list-2 | "Show on page" on a pin from the other design       | The design switches, the list closes, and focus is in that pin's popover | test     |
| C-LAB-list-3 | Two comments are queued and Retry is pressed online | Both send with their original ids; the line clears and announces         | test     |
| C-LAB-list-4 | No comments                                         | The empty line and "Start commenting" show; no group headings            | capture  |
| C-LAB-list-5 | A not-found pin                                     | The item is marked and has no "Show on page"                             | capture  |
| C-LAB-list-6 | Keyboard alone with a screen reader                 | Open, read, edit, delete and close all work; focus returns as specified  | manual   |
| C-LAB-list-7 | Each `?state=` key                                  | It renders at 390, 834 and 1440, light and dark                          | capture  |

## Decisions and open items

D-LAB-13. None open.
