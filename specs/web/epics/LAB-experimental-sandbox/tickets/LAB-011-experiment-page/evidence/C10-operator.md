# LAB-11 C10 — keyboard alone and a screen reader (operator check)

Walked by the builder on 2026-10-07 in headless Chrome at 1440, as a synthetic
reviewer entered through the gate (a scratch copy on the local database):

1. Tab from just before the bar reaches, in order: the switcher (one stop,
   "Square design", pressed), "Comment", "Comments 0", "Finish review". Each
   stop matches `:focus-visible`.
2. On the switcher, ArrowRight moves focus to "Circle design" without
   selecting it; Space selects it (`aria-pressed="true"`), the Circle design
   mounts in place of Square, and the polite live region reads "Showing the
   Circle design."
3. The view log is sent after the next frame (key at 6672 ms, frame at
   6682 ms, request at 6698 ms), and the database holds one `load` and one
   `switch` for the reviewer.
4. The bar is a region named "Review tools", last in DOM order; `main` holds
   one `data-sandbox-design` root.

For a person, with VoiceOver (or NVDA) and keyboard alone, on a real
experiment:

- Tab into the bar and confirm the switcher is one stop and each item is read
  as "Circle design" / "Square design" with its pressed state.
- Switch with the arrow keys and Space; confirm "Showing the … design." is
  spoken once, and the page does not jump to the top.
- Reach Comment and Comments and operate each with Space or Enter, and
  Finish review (a link) with Enter; confirm the focus ring at every stop.
