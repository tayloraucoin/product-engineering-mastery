---
target: specs/web/ux/experimental/experiment.md
status: approved
promoted:
---

# Experiment page and review bar — experimental

## Job

Look at each design, switch between them freely, turn on commenting, and go and finish the review. Done: every design has been seen and the reviewer has moved on to the closing review. Pins are specified in `pins.md`, the list in `pin-list.md`, and the team's additions in `team-layer.md`.

## Layout and components

- The design fills the page in its own styling. The **review bar** is fixed to the bottom of the viewport (D-LAB-9) and styled in the app's tokens, never the design's, so it reads as chrome. The page gets bottom padding equal to the bar's measured height.
- Bar, left to right:
  1. **Design switcher:** `ToggleGroup`, single select, one item per design, glyph plus name: "● Circle", "■ Square", "▲ Triangle", "◆ Diamond". At most four. The shape is set per design in the config, fixed for every reviewer (D-LAB-10). Ordered with the reviewer's first design first. Hidden when the experiment has one design.
  2. **"Comment":** `Toggle` (`aria-pressed`), described in `pins.md`.
  3. **"Comments 5":** a `Button` that opens the list. The count covers every design.
  4. **Save status:** plain muted text. Empty at rest (nothing pending and nothing just sent).
  5. **Primary:** "Finish review", which links to the review page. It reads "Edit your review" once sent, and "Back to your review" when the page was opened from a review's "Look at ◆ again" link.
- **On a phone (below 768px):** the switcher takes its own full-width row above Comment, Comments and the primary. Save status moves into the list. The `exp-offline`, `exp-closed` and `exp-revoked` lines show as a full-width line above the bar at every width.
- **First design:** chosen at random per reviewer on the first visit and fixed (S15). Later visits open on the last design viewed. The address names no design on a first visit. The "Look at ◆ again" link may name one, and that is honoured only after the first visit.
- **Switching:** instant, with no animation (C-P11, A-14). Scroll position is kept, clamped to the new page's length. Pins re-lay after the new design paints (D-LAB-13).

## States

| State | Key | What shows | What the person can do | Copy |
| --- | --- | --- | --- | --- |
| empty | `exp-empty` | No comments yet | Switch, comment, finish | Count: "Comments 0" |
| loading | `exp-loading` | The design renders; the comments button reads "Loading comments" and is disabled | Switch, comment (queued) | "Loading comments" |
| error | `exp-error` | Status: an error line with Retry | Retry; commenting still queues | "Couldn't load your comments. Retry" |
| partial | `exp-partial` | Status shows the unsent count | Retry | "2 not sent yet · Retry" |
| offline | `exp-offline` | Status line | Keep commenting | "Offline. New comments stay in this browser and send when you're back." |
| success | `exp-success` | Status after a send | — | "Saved" |
| single | `exp-single` | No switcher | Comment, finish | — |
| returning | `exp-returning` | Primary reads "Back to your review" | Return | "Back to your review" |
| sent | `exp-sent` | Primary reads "Edit your review" | Edit | "Edit your review" |
| closed mid-session | `exp-closed` | Status line replaces the save status; placing is disabled | Reload | "This review has closed, so new comments can't be sent. Reload to see what was kept." |
| access ended | `exp-revoked` | Status line; placing is disabled | Reload | "This page can't save comments any more. Reload the page." |

There is no page skeleton: the design is rendered on the server. `exp-revoked` stays neutral (S12b).

## Words

The strings are in Layout and States. Design names are always glyph plus name, never a colour alone (C-P05).

## Access

- **Landmarks:** the design is `main`. The bar is a `region` named "Review tools" and comes last in DOM order. The pins region comes before it (`pins.md`).
- **Switcher:** arrow keys move between designs and Space or Enter selects, with roving tabindex. Each item is named "Circle design" and so on, with `aria-pressed` state.
- **On switch, announced politely:** "Showing the Square design. 2 of your comments are on it."
- The status text sits in a polite live region and announces changes once.
- Focus is visible on every bar control. Targets are 44px. No motion under reduced motion or otherwise.

## Instrumentation

These are the sandbox's own records (S15; no analytics, which are pinned): a view per page load, the first design, every switch with a timestamp (giving the toggle count and the time on each design), and the last design before the preference. The team is not recorded (D-LAB-14). The email and code are never in a URL or a client log.

## Criteria

| ID | When | Then | Evidence |
| --- | --- | --- | --- |
| C-LAB-exp-1 | A reviewer opens a 2-design experiment for the first time | The first design is drawn at random, stored, and shown again on reload | test |
| C-LAB-exp-2 | The same experiment is opened by many reviewers | The draw is uniform: over 1,000 simulated first visits, each of 2 designs is first 50% ± 5% | test |
| C-LAB-exp-3 | The reviewer switches design | The swap is instant, the scroll is kept (clamped), and the switch is logged | test |
| C-LAB-exp-4 | Any design label renders | It shows a glyph and a shape name; no A/B, no 1/2 | capture |
| C-LAB-exp-5 | A single-design experiment | No switcher renders | capture |
| C-LAB-exp-6 | The design has its own sticky header | The bar never covers it, and the page's last content clears the bar | capture |
| C-LAB-exp-7 | Keyboard alone | Switcher, Comment, Comments and Finish are reachable and operable; switching is announced | manual |
| C-LAB-exp-8 | A team member views the page | No view or switch is recorded | test |
| C-LAB-exp-9 | Each `?state=` key | It renders at 390, 834 and 1440, light and dark | capture |

## Decisions and open items

D-LAB-9, D-LAB-10, D-LAB-13, D-LAB-14. Routed to Technical: whether the hidden design stays mounted or is swapped (the scoped anchor lookup works either way).
