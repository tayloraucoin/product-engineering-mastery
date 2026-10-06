# LAB-8 C7 — keyboard alone at 390 (operator check)

Walked by the builder on 2026-10-06 in the browser pane at 390×844, against
the shell with a synthetic team member (a scratch copy of `team.ts`; this
machine has no Supabase Auth, so no real sign-in exists):

1. Tab from the top: the first stop is "Skip to content" (the root layout's
   floating theme toggle now steps aside under /admin). Enter moves to `main`.
2. Tab: "Open menu" (aria-expanded false). Enter opens the sheet; focus moves
   into it, on the "Admin" link.
3. Tab to "Experiments" (aria-current="page"); Enter navigates and the sheet
   closes.
4. Reopen with "Open menu", press Escape: the sheet closes and focus returns
   to "Open menu".

For a person, with a real developer or admin session, at 390 wide:

- Do steps 1 to 4 with the keyboard alone and confirm the focus ring is
  visible at each stop, and that focus lands on "Open menu" after Escape.
- With reduced motion on, confirm the sheet opens and closes without sliding.
