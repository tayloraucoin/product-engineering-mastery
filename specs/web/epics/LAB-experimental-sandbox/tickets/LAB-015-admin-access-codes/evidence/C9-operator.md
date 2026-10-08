# LAB-15 C9 — keyboard alone and a screen reader (operator check)

Re-walked on 2026-10-07 at eff9425 against `?state=codes-success`, keyboard only: "Make a code" opens with focus in "Label"; Tab through Display name to "Make code", Enter: the shown-once dialog opens with focus on "Copy code"; Escape returns focus to "Make a code"; a row's "Actions for ben@example.com" opens Replace code and Revoke code, and Revoke code opens its confirmation with focus on "Cancel". "Code copied." could not be heard here: the pane refuses the clipboard, so the person checks it.

Walked by the builder on 2026-10-07 in the browser pane at 1440, against
`/admin/experiments/pricing-2026/codes` on the local database, with a
synthetic admin (a scratch copy of `team.ts`; this machine has no Supabase
Auth). Keyboard only; focus read from `document.activeElement` at each step:

1. "Make a code", Enter: the dialog opens with focus in "Label". Enter on an
   empty form: "Enter who this code is for." under the field, focus back in it.
2. A label, Enter: the same dialog steps to the code. Focus is on "Copy code";
   the field is named "Access code for Ana Ruiz"; the link is env's site URL
   plus `/experimental/pricing-2026`, with no `?r=`.
3. "Copy code", Enter: the button reads "Copied" for two seconds and the
   polite live region says "Code copied." (the pane's clipboard is stubbed).
4. Escape: the dialog closes, focus returns to "Make a code", the list shows
   the new row, and no code pattern is left anywhere in the document.
5. A row's "Actions for Ana Ruiz", Enter, ArrowDown, Enter on "Revoke code":
   the alert dialog names Ana Ruiz and the consequence, focus on Cancel; Tab,
   Enter: toast "Code revoked", the row reads "Revoked", focus back on its
   menu button.
6. The same menu, Enter on "Replace code": "Give Ana Ruiz a new code? …",
   focus on Cancel; Tab, Enter: the new code shown once, focus on "Copy code";
   Done returns focus to the row's menu button and the row reads "Live".

The record rows those four actions wrote hold `code-made`, `code-made`,
`code-revoked`, `code-replaced`, each with the slug only.

For a person, with a real team session and a screen reader (VoiceOver):

- Make a code with the keyboard alone; confirm the dialog's title, the label's
  hint and the empty-label error are read.
- On the code step, confirm "Access code for <label>" is read for the field
  and "Code copied." is announced after "Copy code".
- Revoke one code and replace one from their row menus ("Actions for
  <label>"); confirm each question is read in full and focus returns to the
  row's menu button after.
