# As-built — CAT-7

## Shipped against the contract

- C1: card, separator, aspect-ratio, scroll-area, resizable, collapsible, accordion and drawer are in `primitives/layout/`, each from `--view` (base-vega, shadcn 4.21.0), storied with `source:shadcn`, `verdict:kit`, `layer:primitive` and provenance.
- C2: their stories pass interactions and axe with the kit's others.
- C3: no token-lint waiver. The lint now allows a zero and judges inline style only when the value is a literal (`tooling/token-lint.test.ts`).
- C4: one folder per component, an `exports` entry each, and the layout README lists them.
- C5: the audit gained the CS-14 pairs: foreground on `--hover`, the selected pair and, after the batch review (B1), muted-foreground on `--hover` and on `--selected`. Every pair passes.
- C6: the kit, the catalog and both apps type-check.
- C7: `react-resizable-panels` 4.14.0 is pinned, with its tech-stack row, in the ui module.

## Deviations

- **Taylor's three calls (CS-14 to CS-16) landed here**, with ledger lines and a changelog entry:
  - `--hover`, `--selected` and `--selected-foreground` replace the 5% colour mixes in Button's secondary and Bubble's secondary and muted variants, and the table's selected row;
  - indeterminate progress is a static, dimmed full bar;
  - the skeleton keeps its pulse.
- **The accordion does not animate its height.** Upstream tweens it from a measured variable; reduced or not, the content simply appears.
- **The drawer's scrim** is `bg-background/70`, not black, and its durations use the motion tokens; lengths are on the spacing scale.

## Batch review fixes

- **B1:** muted-foreground failed on `--hover` and `--selected` (3.93:1 light, 3.15:1 dark). It moved to two new raw steps, `--neutral-550` (oklch 0.49) in light and `--neutral-350` (oklch 0.76) in dark: 4.97:1 and 4.84:1 on hover and selected, and 6.26:1 and 9.22:1 on the page.
- **B2:** no backdrop blur on the drawer's scrim (A-12). The token lint now rejects blur and a bare `shadow`.
- **S1:** the drawer's slide is off under reduced motion.

## Not verified

- Light and dark in the workshop. jsdom computes no colour, so contrast rests on the audit.
- The resizable handle's drag. jsdom has no layout, so the story asserts the separator's role and value.

## Next

CAT-8: overlays and navigation.
