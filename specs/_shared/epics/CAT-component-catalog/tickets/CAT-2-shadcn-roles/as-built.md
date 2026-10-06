# As-built — CAT-2

## Shipped against the contract

- C1: the preset gains card, popover, secondary, destructive, input, sidebar (eight) and chart-1 to chart-5 roles, light and dark, with raw steps `neutral-300`, `-600`, `-700`, `red-400` and `red-600`; contrast-audit audits 38 pairs (20 new: card, popover, secondary, destructive, sidebar text and muted text on card and popover), all AA in both themes.
- C2: `preset-tokens.test.ts` proves every Vega role is bridged and set in both themes, the radius steps sm to 4xl and the four elevation levels exist, and the tk-motion tokens carry their values verbatim. `token-lint.test.ts` proves one rejection per rule (12), eight passing class sets of variant selectors and structural arbitrary values, single reporting inside `cn()`, and the inline-style rule.
- C3: the token lint is one ESLint rule, `pem-tokens/no-raw-values`, judging the utility after each class's last top-level `:`; apps/web and @pem/ui lint clean.
- C4: every existing story passes axe and its interactions on the new preset (114 tests).

## Deviations

- **The OG image's file-level waiver** named the old rule (`no-restricted-syntax`); it now names `pem-tokens/no-raw-values`. Path added to the contract before the edit.
- `[ASSUMPTION]` shadcn's dark theme uses alpha borders and inputs (`oklch(1 0 0 / 10%)`); they became the solid `neutral-800` step, because the audit reads no alpha and the visual difference on `neutral-950` is under one lightness step. Dark `sidebar-primary` follows `primary` rather than shadcn's blue, keeping every placeholder neutral.
- `[ASSUMPTION]` Radius steps above lg are additive on `--radius` (xl +6px, 2xl +10px, 3xl +16px, 4xl +24px), so they stay ordered whatever the brand radius.
- Elevation values are written in `oklch()` (the house colour function), not Tailwind's `rgb()`.

## Not verified

- How the new roles look side by side in the workshop; the first components that use them arrive in CAT-5.

## Next

CAT-3 builds the shelf, the source tags and the check-off.
