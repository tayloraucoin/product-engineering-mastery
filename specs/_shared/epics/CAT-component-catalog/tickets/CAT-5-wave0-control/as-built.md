# As-built — CAT-5

## Shipped against the contract

- C1: input, textarea, checkbox, radio group, switch, slider, select, native select, toggle, one-time code and tabs are in `primitives/control/`, each from `yarn shadcn add <name> --dry-run --view` (base-vega, shadcn 4.21.0), each with stories tagged `source:shadcn`, `verdict:kit`, `layer:primitive` and provenance; STATUS.md shows 15 of 92 entries done.
- C2: 66 new stories run their interactions and axe: typing, focus, invalid, disabled, checked, pressed, choosing from the select's list, the browser's own select, arrow keys between tabs, and one or two named slider thumbs.
- C3: no token-lint waiver: shadows on `shadow-resting`, `-raised` and `-overlay`, `ring-3`, `p-0.75`, the switch's sizes on spacing steps, the select's motion on `--motion-duration-fast`.
- C4: one folder per control, the two `cva()` calls in `toggle.variants.ts` and `tabs.variants.ts`, eleven `exports` entries, and the control README lists them.
- C5: contrast-audit gains `--input` on `--background` at 3:1 (WCAG 1.4.11); `--input` moved from neutral-200 to neutral-400 in light (3.30:1) and from neutral-800 to neutral-500 in dark (3.99:1). All 44 pairs pass.
- C6: the kit and both apps type-check.
- C7: `input-otp` 1.5.0 (2026-08-18) is pinned exactly, with its tech-stack row and in the `ui` module.

## Deviations

- **The age gate is set:** `.yarnrc.yml` has `npmMinimalAgeGate: 7d` (10080 minutes). A probe for lucide-react 1.52.0, released today, was quarantined and changed nothing.
- **`--input` was 1.26:1** on the background in light and 1.31:1 in dark, so a checkbox's, radio's or switch's boundary was nearly invisible. The audit treated borders as decorative; a control's boundary is not.
- **Mappings beyond the table:**
  - native select's `bg-[Canvas] text-[CanvasText]` on options became `bg-popover text-popover-foreground`;
  - the slider thumb's `bg-white` became `bg-background`;
  - inactive tab labels' `text-foreground/60` became `text-muted-foreground`, an audited pair;
  - input-otp's leftover `cn-input-otp` placeholder class and its inert `duration-1000` (tw-animate's caret blink runs 1.25s on its own) were removed.
- **The Slider gains a `getAriaLabel` prop**, passed to every thumb, so each range input is named; upstream had no way to name it.
- **Test harness:** Vitest inlines `input-otp` and `@floating-ui/*` beside `@base-ui/*` (the Next plugin's react alias), and the setup shims `document.elementFromPoint`, which jsdom lacks and input-otp probes. Paths added before the edits.
- **A radio item is named by its wrapping label** through Base UI's `aria-labelledby`; adding `aria-label` as well doubled the name, so the stories use the label alone.
- **Transitions left as upstream:** where Vega sets no duration (`transition-[color,box-shadow]` and the like), the controls keep Tailwind's default rather than gaining a motion token. Only the button, which has a hover state, was moved onto the hover tokens.

## Not verified

- The controls rendered in light and dark in the workshop; jsdom computes no colour, so the audit's pairs are the contrast evidence.
- The slider and the select's list under real pointer input; jsdom has no layout.

## Next

CAT-6 brings the wave-0 display components (label, badge, avatar, kbd, table, empty, bubble, marker, message, skeleton, progress, alert, spinner).
