# C2: the sign-in field's unfocused boundary at 3:1 in both themes

Checked by the agent on 2026-10-05 at e79d262, in the in-app browser, on `/auth/sign-in` served by `next dev` on the local tier with synthetic Supabase values (the `web-auth-synthetic` launch entry).

| Theme | Field border (computed) | Page (computed) | Ratio  |
| ----- | ----------------------- | --------------- | ------ |
| Light | `lab(58.82 0 0)`, 1px   | `lab(100 0 0)`  | 3.30:1 |
| Dark  | `lab(47.22 0 0)`, 1px   | `lab(2.75 0 0)` | 3.99:1 |

The input's class carries `border-input`. Ratios are worked from the computed L\* (neutral, so Y = ((L\*+16)/116)³ above L\* 8, L\*/903.3 below) and match `yarn contrast-audit`'s `--input on --background` lines. In both screenshots the empty field's outline is plainly visible at a glance; before this ticket it was `--border`, 1.26:1 light and 1.31:1 dark.

Hovered, the field fills with `--accent`; the boundary holds 3.02:1 light and 3.05:1 dark (the audit's new pair).
