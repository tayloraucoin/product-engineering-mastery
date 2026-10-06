---
target: specs/web/ux/experimental/pins.md
status: approved
promoted:
---

# Pins — experimental

## Job

Point at a spot on a design and say what is wrong or right there, by tap, mouse or keyboard. Done: a numbered pin sits on that spot, tagged with its design, saved or queued. It is never lost.

## Layout and components

- **Comment mode** (the bar's "Comment" toggle):
  - With a mouse, the cursor becomes a crosshair and the hovered element gets the hover outline token.
  - A click or tap anywhere on the design opens the composer there. The design's own links and buttons do not act while comment mode is on.
  - **Escape leaves comment mode** (fixes K's gap). Comment mode turns off after each saved pin. There is no single-key shortcut (WCAG 2.1.4).
- **Keyboard placement** (D-LAB-12):
  - In comment mode, every marked region becomes a Tab stop named "Comment on: Pricing table", with a visible focus ring. So does every control the design already has.
  - Enter or Space opens the composer at the region's top-start corner, or at the centre of a control.
  - Every experiment marks its commentable regions with a stable id and a human name. The demo marks every section. Unmarked elements are still pinnable by pointer.
- **Anchor:** the element (marked id, then id, then a structural path) plus x and y as fractions of its box (S17, as in K `lib/review/anchor.ts:33-98`). It is looked up **inside the shown design's root only** (D-LAB-13).
- **Place name** ("On: …"), used in the composer, the pin's name, the list and the triage: the nearest marked region's name; else the element's own visible text, up to 40 characters in quotes (On: "Choose annual"); else "this part of the page".
- **Composer** (`Popover`), in order:
  - "On: Pricing table";
  - the optional type as a `ToggleGroup` (Problem, Question, Suggestion, Keep this), with nothing pre-selected (D-LAB-11);
  - `Textarea` with the visible label "Your comment" and the hint "Say what's wrong or what works here.", 2,000 characters max, with a counter from 1,800;
  - "Save comment" (primary in the popover) and "Cancel". Ctrl or Cmd+Enter saves. Escape with text typed closes it and shows the toast "Comment discarded. Undo".
- **Pin:**
  - A numbered circle in inverse neutral tokens: 28px to see, 44px to hit.
  - Numbers run per reviewer across the whole experiment, so comment 4 means one thing in the triage.
  - An unsent pin has a dashed outline, and "not sent" is in its name.
  - A pin is drawn only on its own design. Others are hidden but stay in the list and the count.
  - Positions re-lay on resize and after each design switch.
- **Selecting a pin** opens a popover with the type, the text, the time (locale short form, e.g. "5 Oct, 14:32"), "Edit" and "Delete". Edit swaps in the composer. Delete has no confirmation: it shows the toast "Comment 3 deleted. Undo".
- **Sending:**
  - The browser mints the id and queues the pin first, then sends it.
  - A failure stays queued and is retried with the same id: on load, on reconnect, and on Retry (S17; fixes K, whose load retry was claimed but missing).
  - The viewport size is stored with the pin (S26).
- **Closed or access ended** (`experiment.md` `exp-closed`, `exp-revoked`): Edit, Delete and Retry are disabled on every pin and list item, and the queue is held untouched (shown later on `ended.md`). Each disabled control's reason is tied to it: "This review has closed, so comments can't be changed." or "This page can't save comments any more." (S16)
- **Unresolvable pin:** if its anchor is not found on its own design, it is not drawn. The list shows it as "Not found on the page; the design may have changed since" (D-LAB-13).

## States

| State        | Key            | What shows                                                | What the person can do | Copy                                                           |
| ------------ | -------------- | --------------------------------------------------------- | ---------------------- | -------------------------------------------------------------- |
| empty        | `pins-empty`   | No pins                                                   | Turn on Comment        | —                                                              |
| comment mode | `comment-mode` | Crosshair; Tab stops                                      | Place, or Escape       | —                                                              |
| composing    | `composing`    | Composer open                                             | Write, type, save      | as Layout                                                      |
| loading      | `pins-loading` | Pin shows at once (optimistic); the button reads "Saving" | Wait                   | "Saving"                                                       |
| error        | `pins-error`   | Pin dashed; toast                                         | Retry later            | Toast: "Saved in this browser only. It will send when it can." |
| partial      | `pins-partial` | Some dashed                                               | Retry from the bar     | —                                                              |
| offline      | `pins-offline` | New pins dashed                                           | Keep commenting        | as error                                                       |
| success      | `pins-success` | Solid pin                                                 | Open it                | —                                                              |
| over limit   | `too-long`     | Counter in error; Save disabled                           | Shorten                | "2,140 of 2,000 characters"                                    |

## Words

The strings are above. The type labels are fixed: "Problem", "Question", "Suggestion", "Keep this".

## Access

- **Pins region:** pins sit in a region named "Your comments on this design", placed after `main` in DOM order and in number order. Each pin is a button named, for example, "Comment 3, Problem, on Pricing table", or "Comment 3, on Pricing table" with no type (plus "not sent" when it applies).
- **Popover focus:** opening a popover moves focus to its first control. Closing returns focus to the pin, or to the Tab stop it was placed from.
- **Announced politely:**
  - "Comment mode on. Choose any part of the page, or press Escape to stop."
  - "Comment mode off."
  - "Comment 4 saved."
  - Offline: "Comment 4 kept in this browser; it will send when you're back online." Server error: "Comment 4 kept in this browser; it will send when it can."
  - "2 comments sent."
- **Undo toasts** stay until dismissed or 8 seconds pass, pause while hovered or focused, and are reachable by keyboard.
- **Reduced motion:** pins and popovers appear with opacity only. They never animate under keyboard modality (A-15).

## Instrumentation

The pin record: id, design, anchor, fractions, viewport, type, text and time. The email and code are never sent in a client log.

## Criteria

| ID           | When                                                         | Then                                                                 | Evidence |
| ------------ | ------------------------------------------------------------ | -------------------------------------------------------------------- | -------- |
| C-LAB-pins-1 | A pin is placed by click, by tap, and by Enter on a Tab stop | Each opens the composer, and each saves with its design tag          | test     |
| C-LAB-pins-2 | Escape in comment mode                                       | Comment mode is off and announced                                    | test     |
| C-LAB-pins-3 | A send fails, then the page reloads                          | The pin is resent with the same id, and the server holds one row     | test     |
| C-LAB-pins-4 | The reviewer switches design                                 | Only the shown design's pins are drawn; the count is unchanged       | test     |
| C-LAB-pins-5 | Two designs share a marked id                                | Each pin resolves inside its own design only                         | test     |
| C-LAB-pins-6 | A pin's anchor is missing                                    | It is not drawn, and the list marks it not found                     | test     |
| C-LAB-pins-7 | A reviewer opens the page                                    | Only their own pins are returned and drawn (S18)                     | test     |
| C-LAB-pins-8 | Screen reader, keyboard alone                                | A pin can be placed, read, edited and deleted; saves are announced   | manual   |
| C-LAB-pins-9 | Each `?state=` key                                           | It renders at 390, 834 and 1440, light and dark, with reduced motion | capture  |

## Decisions and open items

D-LAB-11, D-LAB-12, D-LAB-13. None open.
