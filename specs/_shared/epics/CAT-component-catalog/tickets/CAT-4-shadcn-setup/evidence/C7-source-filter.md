# CAT-4 C7 — the source filter narrows the workshop by source

Captured 2026-10-04 in the built-in browser against `yarn ui:storybook --ci` (Storybook 10.6.1, port 6006) on commit 27b204c, reading the sidebar's `data-item-id` entries (the pane was hidden, so no screenshot). Closes batch review S5: CAT-3's C6 could not show source narrowing while every story was custom.

## Seen

1. `?tags=source:shadcn`: the sidebar holds `primitives`, `primitives-control`, `primitives-control-button` and its 21 stories, from `--default` to `--disabled`; no composed, provider or catalog entry.
2. `?tags=source:custom`: the sidebar holds `composed`, `composed-control` (the theme toggle) and `catalog`, `catalog-control` (the copy button); no primitive.
3. The panel tabs on `Primitives / Control / Button / Destructive`: Controls, Actions, Interactions, Accessibility (0 violations, 7 passes), Provenance.

## Not seen

- The destructive label's contrast rendered in the browser; `yarn contrast-audit` measures it at 6.94:1 (light, at rest) after the CAT-2 fix.
