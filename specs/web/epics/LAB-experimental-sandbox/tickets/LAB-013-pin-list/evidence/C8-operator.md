# LAB-13 C8 — keyboard alone and a screen reader (operator check)

Walked by the builder on 2026-10-07 in the in-app browser, as the team on the
`?state=list-*` fixtures of `pricing-2026` (a scratch copy whose team check
reads a synthetic cookie; nothing sent):

1. Enter on "Comments 4" opens the Sheet at once (no transition under
   keyboard modality); focus is on the title "Your comments", the dialog is
   named by it, and the count "4 comments" sits under it.
2. Groups are sections headed "● Circle design, 3 comments" and
   "■ Square design, 1 comment"; each comment is a list item; its actions are
   named "Show comment 3 on page", "Edit comment 3", "Delete comment 3".
3. Delete on comment 2 moves focus to comment 4's item (the next); the toast
   "Comment 2 deleted." shows inside the list, and its Undo takes focus and
   restores the comment.
4. Edit on comment 1 puts the composer in the item with focus in "Your
   comment" at the end of the text; Escape closes the composer only and
   focus returns to "Edit comment 1"; Ctrl+Enter saves, "Comment 1 saved."
   is in the polite region, and focus returns to "Edit comment 1".
5. Show on page on comment 3 (Square, Circle shown) closes the list,
   switches to Square, and opens comment 3's popover with focus on its Edit.
6. Retry on `list-partial` clears "2 not sent yet." and the list's polite
   region reads "2 comments sent."; Tab then Escape closes the list and focus
   returns to "Comments 4".

For a person, with VoiceOver (or NVDA) and keyboard alone, on a real
experiment with comments on two designs:

- Open the list from the bar; confirm the title is spoken first and that
  Tab never leaves the list while it is open.
- Read a group heading and an item; expand a long comment with "Show all of
  comment N".
- Edit and save one comment; delete one and undo it from the toast; delete
  the last one and confirm focus lands on the title.
- Show on page a comment on the other design; confirm the switch is
  announced and focus is inside the opened pin's popover.
- Go offline with an unsent comment: the offline line shows and Retry is
  disabled; back online, Retry and hear "1 comment sent.".
- Close with Escape; focus returns to the Comments button.
