# As-built — STK-25

## Shipped against the contract

- C1: `yarn contrast-audit` passes `--input on --background` at 3.30:1 light and 3.99:1 dark. A new pair, `--input on --accent` (the field's hover fill), passes at 3.02:1 and 3.05:1; the audit's tests count 59 pairs.
- C2: on `/auth/sign-in` the field's computed border is 3.30:1 light and 3.99:1 dark against the page (`evidence/C2-rendered.md`).
- NN3: `email-field.tsx` draws `border-input`; no raw value.

## Deviations

- [ASSUMPTION] The devs_call: the token is `--input`, shadcn's name for a control's boundary, at `--neutral-400` light and `--neutral-500` dark. CAT-5 (b6a1d67) had already added it to `preset.css` and to the audit after this ticket was drafted, so NN1 and NN2 were met before the build; `preset.css` is unchanged here. `--border` stays the decorative hairline.
- `tooling/contrast-audit.ts` gains the hovered pair; the hover fill would otherwise be an unaudited surface under the boundary.

## Not verified

- C2 (manual): checked by the agent in the in-app browser, from the computed border and page colours and a screenshot per theme (`evidence/C2-rendered.md`), not by a person's eyes on a real display.

## Next

Nothing waits on this ticket; P-C's captures will take over C2's check when they land.
