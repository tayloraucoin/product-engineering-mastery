---
id: LAB-13
size: small
objective: "A reviewer opens 'Your comments' from the bar and sees every comment they left, grouped by design, jumps to any one on the page, edits or deletes it, and resends what is stuck."
slice_type: "A client sheet and drawer over LAB-12's data, with no new query; the risk is focus lost on open, close, Show on page or delete, or Retry reporting as sent a comment that did not send."
non_negotiables:
  - "A Sheet from the right at 768px and up, a bottom Drawer below, titled 'Your comments': a dialog with focus on the title at open, trapped, closed by Escape, focus back to the Comments button."
  - "One group per design in switcher order, headed glyph plus name, items in number order; no heading for a single design; a comment on any design is listed (D-LAB-13)."
  - "Show on page switches design when needed through LAB-11's switch, closes the list, scrolls the pin into view and opens its popover with focus inside; hidden for a not-found pin."
  - "Retry resends every queued comment through LAB-12's queue under the same ids; the unsent line counts only what is still queued, in a polite live region."
  - "No new query and no new action: the list reads LAB-12's loaded comments and queue; Edit and Delete reuse LAB-12's composer, delete and Undo toast."
  - "After a delete focus moves to the next item, or the title when none is left; closed or revoked disables Edit, Delete and Retry as pins.md says."
  - "pin-list.md's Words verbatim; every list-* key registers in LAB-4's state.ts as team-only, on synthetic fixtures."
devs_call: "The component split under _components/pin-list/, the text clamp, and how the sheet or drawer is chosen at open."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/experimental/pin-list.md"
  - "D-LAB-13"
  - "C-LAB-list-1"
  - "C-LAB-list-2"
  - "C-LAB-list-3"
  - "C-LAB-list-4"
  - "C-LAB-list-5"
  - "C-LAB-list-6"
  - "C-LAB-list-7"
truth_files: "none: the approved proposal ux/experimental/pin-list.md reaches specs/web/ux/experimental/pin-list.md through yarn truth:promote LAB once its citing tickets close"
qa: Q2
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "apps/web/app/experimental/[slug]/_components/pin-list/**"
  - "apps/web/app/experimental/[slug]/_components/experiment/review-bar.tsx"
  - "apps/web/lib/sandbox/client/pin-list.ts"
  - "apps/web/lib/sandbox/client/pin-list.test.ts"
  - "apps/web/lib/sandbox/state.ts"
depends_on:
  - LAB-12
out_of_scope:
  - "The queue, its load and reconnect retries, the composer and delete: LAB-12. The team's list, grouped by reviewer: LAB-14."
  - "Any query, action or table change."
criteria:
  - id: C1
    statement: "With pins on two designs the list groups them by design in switcher order, each headed glyph plus name, numbered."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-013-pin-list/evidence/list-grouped.png"
  - id: C2
    statement: "showOnPagePlan, for a pin on the other design, switches to it, closes the list and targets that pin's popover for focus; a not-found pin offers no Show on page."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "With two comments queued, Retry online sends both under their original ids, clears the unsent line and announces '2 comments sent.'"
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "With two queued and one send failing, Retry leaves '1 not sent yet.', that item marked 'Not sent', and announces only the one sent."
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "focusAfterDelete targets the next item, or to the title when none is left, and the count reads '1 comment' or 'N comments'."
    evidence: test
    command: "yarn workspace web test"
  - id: C6
    statement: "With no comments the empty line and 'Start commenting' show, with no group headings."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-013-pin-list/evidence/list-empty.png"
  - id: C7
    statement: "A not-found pin's item reads 'Not found on the page; the design may have changed since' and has no Show on page."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-013-pin-list/evidence/list-detached.png"
  - id: C8
    statement: "With keyboard alone and a screen reader, open, read, edit, delete and close all work, and focus returns as specified."
    evidence: manual
    reason: "Needs a person with a screen reader; no runner exists. The builder checks the focus path and dialog wiring, then defers it."
  - id: C9
    statement: "Every pin-list.md ?state= key renders at 390 (drawer), 834 and 1440 (sheet), light and dark."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-013-pin-list/evidence/list-states.png"
---

# Contract — LAB-13 pin-list

## Build notes

- **Approach:**
  - `lib/sandbox/client/pin-list.ts` holds the pure parts: `groupComments(comments, designOrder)`, `showOnPagePlan(comment, shown)` (switch, close, then focus the pin), `retryOutcome(before, after)` (the unsent line and the announcement) and `focusAfterDelete(items, id)`. It imports nothing from `@pem/db`, `next/headers` or `env.ts`.
  - `_components/pin-list/` is a `"use client"` leaf using `@pem/ui`'s `Sheet`, `Drawer`, `Item`, `Skeleton` and `Button`, fed by LAB-12's comments and queue state.
  - `review-bar.tsx` wires the Comments button: its count covers every design, and below 768px the save status moves into the list.
  - "Start commenting" closes the list and turns on LAB-12's comment mode.
  - Prior art: LAB-12's pin popover and composer, reused; `packages/ui/src/primitives/layout/{sheet,drawer}`.
- **Decisions that apply:**
  - D-LAB-13: "a pin is drawn only on its own design; anchors resolve inside the shown design's root; an unresolved pin stays in the list".
  - pin-list.md: "**Retry** resends every queued comment with the same ids. It also runs on load and on reconnect (`pins.md`)."
  - pins.md, closed or access ended: "Edit, Delete and Retry are disabled on every pin and list item, and the queue is held untouched".
  - R9 (D-LAB-40): "the switcher mounts only the shown one", so Show on page waits for the new design to paint and LAB-12's pins to re-lay before opening the popover.
- **Interfaces:** `groupComments`, `showOnPagePlan`, `retryOutcome`, `focusAfterDelete` (pin-list.ts); `PinList` (`_components/pin-list/`). It reads LAB-12's queue key `sandbox:pin-queue:<slug>:<reviewerId>` only through LAB-12's queue module, never directly.
- **Per path:** `_components/pin-list/`, the sheet, drawer, groups and items; `review-bar.tsx`, the Comments button; `pin-list.ts` and its test, C2 to C5 named by criterion id; `state.ts`, the eight list keys.
- **Gotchas:**
  - Choose Sheet or Drawer when the list opens (`matchMedia('(min-width: 768px)')`), not at render, so server and client HTML agree while it is closed.
  - Show on page goes through LAB-11's switch, so the switch is logged and announced like any other.
  - Retry's announcement counts only the ok results. `[ASSUMPTION: one sent reads "1 comment sent."; the Words give only the plural.]`
  - The skeleton is static, with no shimmer (A-14). Opened by keyboard, the list appears at once; otherwise opacity only (A-15).
  - Web tests run only from `lib/**/*.test.ts`. Fixtures are synthetic.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model drops focus to the body after a delete or Show on page, which strands keyboard users.
