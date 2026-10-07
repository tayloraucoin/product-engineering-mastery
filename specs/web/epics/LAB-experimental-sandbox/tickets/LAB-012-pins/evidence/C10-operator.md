# LAB-12 C10 — keyboard alone and a screen reader (operator check)

Walked by the builder on 2026-10-07 in the in-app browser at 1024, as a
synthetic reviewer entered through the gate (a scratch copy on the local
database, slug `lab12-capture`):

1. "Comment" pressed: the polite region reads "Comment mode on. Choose any
   part of the page, or press Escape to stop."; each marked region becomes a
   Tab stop named "Comment on: Introduction", "Comment on: Plans", "Comment on:
   Comparison table", "Comment on: Questions" (role button).
2. Enter on "Comment on: Comparison table" opens the composer, reading "On:
   Comparison table", with focus on its first control (the type group).
3. Cmd+Enter in "Your comment" saves; focus returns to the new pin, named
   "Comment 2, on Comparison table" (offline: "…, not sent", and "Comment 2
   kept in this browser; it will send when you're back online.").
4. Escape in comment mode turns it off and reads "Comment mode off."; the Tab
   stops are removed and the regions' own names restored.
5. A pin's popover offers Edit and Delete; after Delete, focus moves to the
   region "Your comments on this design" and the toast "Comment 2 deleted."
   offers Undo. With access ended, Edit and Delete stay focusable, disabled,
   each described by "This page can't save comments any more."

For a person, with VoiceOver (or NVDA) and keyboard alone, on a real
experiment:

- Turn on Comment, Tab to a region, press Enter, choose a type with the arrow
  keys and Space, type, and save with the button and with Ctrl or Cmd+Enter;
  confirm "Comment N saved." is spoken once and focus lands on the pin.
- Tab to a pin, open it, read its type, text and time, Edit it, then Delete
  it; reach the Undo toast with F6 and undo it.
- Press Escape with text typed in the composer; confirm "Comment discarded."
  with Undo, and that a second Escape leaves comment mode.
