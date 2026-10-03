---
title: Motion skill bundle — Motion values
description: Read only when installing tk-motion in Phase 3.
layer: research
status: archived
thread: "07"
role: Vesper
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# Motion values: the only numbers agents may use

> Provenance header. The source is Emil Kowalski's public work as inventoried by Alembic, Phase 1, read 2026-09-30. `A#` refers to that inventory's atom table, and `WE:` to its worked-examples table.
>
> Tags:
> - `[DIRECT]`: he states it as a recommendation.
> - `[OBSERVED]`: the value appears in one of his demos or sources but is not stated as a recommendation.
> - `[INFERRED]`: Vesper's choice, with the reason given.
> - `[CONVENTION]`: imported from outside his work, with the source named.
>
> If `/docs/design/tokens.md` defines these tokens, tokens.md wins. Otherwise, add them there verbatim.

## Easing tokens

| Token | Value | Use for | Provenance |
|---|---|---|---|
| `--motion-ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Anything entering or exiting: popovers, dialogs, toasts, tooltips, dropdowns | [DIRECT] A2 (enter/exit uses ease-out), A10 (named curve) |
| `--motion-ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Elements already on screen that move or morph: tab indicator, segmented control thumb, reorder | [DIRECT] A5, A7, A10 |
| `--motion-ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Sheets and drawers sliding from an edge | [DIRECT] A10; [OBSERVED] WE: Vaul, which he credits to Ionic |
| `--motion-ease-hover` | `ease` (CSS keyword) | Hover color, background and border changes | [DIRECT] A6, A11 |
| `linear` | `linear` | Progress bars, hold-to-confirm fill, spinners, constant motion | [DIRECT] A7; [OBSERVED] WE: Hold to delete |
| (banned) | `ease-in`, bounce, elastic | Never | [DIRECT] A3, A9. Bounce and elastic: [CONVENTION] Plumb's anti-patterns.md |

## Duration tokens

| Token | Value | Use for | Provenance |
|---|---|---|---|
| `--motion-duration-instant` | `0ms` | Keyboard-initiated actions, and anything seen hundreds of times a day | [DIRECT] A31, A32, A56 |
| `--motion-duration-fast` | `125ms` | Tooltip enter, focus ring, hover background, error-message fade | [DIRECT] A22 (micro-interactions 100 to 150ms); [OBSERVED] WE: tooltip 0.125s |
| `--motion-duration-press` | `160ms` | Button and row press scale | [DIRECT] WE: button press, 160ms ease-out, stated as a recommendation |
| `--motion-duration-base` | `180ms` | Dropdown, popover, select, context menu, toggle thumb | [DIRECT] range A22 (150 to 250ms); value [INFERRED] from his 180ms-vs-400ms example (A20) |
| `--motion-duration-moderate` | `250ms` | Dialog, desktop side sheet, command-palette open (when mouse-initiated), expand/collapse | [DIRECT] A22 (modals and drawers 200 to 300ms); [INFERRED] midpoint. See the contradiction note below |
| `--motion-duration-sheet` | `500ms` | Touch bottom-sheet (Vaul `Drawer`) settling after a drag | [OBSERVED] WE: Vaul `transform 0.5s`. Use the Vaul default; do not re-tune |
| `--motion-duration-hold` | `1500ms` | Hold-to-confirm fill (destructive actions, touch only) | [OBSERVED] WE: Hold to delete uses 2s linear. [INFERRED] shortened to 1.5s because a field user wearing gloves is holding a tablet one-handed |
| (ceiling) | 300ms | No user-initiated UI animation exceeds this, except `--motion-duration-sheet` | [DIRECT] A19, A21 |

**Exit rule:** exit duration is the entrance duration × 0.8, rounded to the nearest 10ms. For example, a 250ms dialog enter means a 200ms exit, and a 180ms popover enter means a 140ms exit. Provenance: [DIRECT] A27 ("~20% faster").

**Distance rule:** within a token's range, travel over 50% of the viewport uses the upper bound of the class range, and travel under 16px uses the lower bound. Provenance: [DIRECT] A24; the thresholds are [INFERRED], so the rule can be applied without asking.

**Contradiction note (modals and drawers):** his blog says 200 to 300ms (A22), and his GitHub skill says 200 to 500ms (A23). Neither page is dated, and Vaul ships 500ms. The house resolution [INFERRED]: pointer and keyboard surfaces use 250ms, and only touch sheets that follow a drag use 500ms. Reason: DealReady's calm, dense UI is punished by long overlays, while a drag sheet needs time to settle from the finger's velocity.

## Transform values

| Token | Value | Use for | Provenance |
|---|---|---|---|
| `--motion-scale-press` | `0.97` | `:active` on buttons and pressable rows | [DIRECT] WE: button press |
| `--motion-scale-enter` | `0.95` | Starting scale for popovers and dialogs (with opacity 0) | [DIRECT] Agents with Taste, 0.95. His range: 0.9+ (7 Tips), 0.9 to 0.97 (STANDARDS). Never 0 |
| `--motion-translate-enter` | `8px` | Starting offset for a list item or toast entering from its edge | [OBSERVED] WE: stagger demo `translateY(8px)` |
| `--motion-blur-crossfade` | `2px` | The only allowed blur, used to mask a crossfade between two states | [OBSERVED] WE: blur crossfade. Ceiling [DIRECT] "under 20px"; house ceiling [INFERRED] 2px (field devices, Safari cost A47) |
| `--motion-stagger` | `40ms` | Per-item delay on the first render of fewer than 6 items | [DIRECT] range 30 to 80ms (A48); value [INFERRED] lower-middle, total 200ms or less |

## Spring tokens (Motion `motion/react`)

| Token | Value | Use for | Provenance |
|---|---|---|---|
| `--motion-spring-default` | `{ type: "spring", duration: 0.35, bounce: 0 }` | Drag release, swipe-dismiss, layout/shared-element moves, interruptible toggles | Form [DIRECT] A16 (Apple-style `duration` + `bounce` recommended). Bounce 0 [INFERRED] from A17 ("Avoid bounce in most UI contexts") plus the trust-UI alarm test. Duration 0.35 [INFERRED] so it lands inside the 300ms perceptual ceiling with a settle tail |
| `--motion-spring-pointer` | `{ stiffness: 300, damping: 30 }` via `useSpring` | Values that track the pointer (rare; e.g. a Fybr map scrubber) | [OBSERVED] WE: his mouse spring uses `{stiffness:100, damping:10}`, which is too loose for product UI. Values [INFERRED]: critically damped-ish, no overshoot. Validate by eye |

## Reduced-motion equivalents (`prefers-reduced-motion: reduce`)

The rule is fewer and gentler, not zero. [DIRECT] A39.

| Full motion | Reduced equivalent | Provenance |
|---|---|---|
| Scale + opacity entrance (popover, dialog) | Opacity only, same duration | [DIRECT] A38, A39 |
| Slide-in (toast, sheet, drawer) | Opacity only, or appear in place for a sheet on first open; the drag gesture still tracks the finger | [DIRECT] A38 (closedX 0); drag exception [INFERRED], because gesture tracking is direct manipulation, not decoration |
| Press scale 0.97 | Background-token change on `:active`, no scale | [INFERRED]: keeps the feedback job |
| Stagger | All items fade together | [INFERRED] |
| Layout / shared-element move | Crossfade at `--motion-duration-fast` | [INFERRED] |
| Map `flyTo` camera flight | `jumpTo`, plus a 125ms opacity dip on the map container | [CONVENTION] MapLibre/Mapbox GL JS camera options respect reduced motion unless `essential: true`; the dip is [INFERRED] so the jump still reads as a location change |
| Spinner rotation | Keep it: loading is information. Or swap for a static "Loading..." label with a `Skeleton` | [INFERRED]; `Skeleton` per Plumb's anti-patterns.md |
| Success confirmation | Must remain visible (text or icon state), never removed | [DIRECT] A39; [CONVENTION] Plumb DESIGN.md motion line |
