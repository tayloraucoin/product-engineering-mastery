# Micro-interaction catalog

Each row gives: the job, the trigger conditions, the treatment in tokens, the exit, the reduced-motion equivalent, and provenance. Tokens are defined in `values.md`. When a row says "none", that is the designed answer, not an omission.

Tags: `[DIRECT]`, `[OBSERVED]`, `[INFERRED]`, `[CONVENTION]` (see values.md). `A#` and `WE:` refer to the Phase 1 inventory.

---

### Hover
- **Job:** feedback, telling the user this is interactive.
- **Treatment:** change color, background and border tokens only, over `--motion-duration-fast` with `--motion-ease-hover`. No scale and no lift, and no hover motion on table rows beyond the background token.
- **Gate:** wrap it in `@media (hover: hover) and (pointer: fine)` so touch devices never get sticky hover.
- **Reduced motion:** unchanged, because a color change is not motion.
- **Provenance:** ease for hover [DIRECT] A6. The hover media gate [OBSERVED] WE: hover gate. "No scale on product hover" [INFERRED]: his `scale(1.05)` hover demo is a marketing-style card, and density plus calm rule it out here.

### Press (`:active`)
- **Job:** feedback, confirming the input was received.
- **Treatment:** `scale(var(--motion-scale-press))` with `transform --motion-duration-press --motion-ease-out`, on buttons and on pressable cards or rows that open something. The transition starts on pointerdown, not click.
- **Exceptions:** none on icon-only buttons inside dense toolbars ([INFERRED]: scale on a 24px icon reads as jitter). None on keyboard activation (Enter or Space).
- **Reduced motion:** `:active` background token only.
- **Provenance:** [DIRECT] WE: button press 0.97 / 160ms ease-out; keyboard rule [DIRECT] A32.

### Focus (focus-visible)
- **Job:** state, showing where the user is.
- **Treatment:** the ring appears with no transition. Focus moving between elements is never animated.
- **Reduced motion:** identical.
- **Provenance:** [INFERRED] from A32 (keyboard actions never animate): focus is the keyboard user's cursor, and a lagging cursor is a broken cursor. The ring itself is [CONVENTION] Vercel Web Interface Guidelines via `ui-code-lint`: never `outline: none` without a replacement.

### Toggle / switch / checkbox
- **Job:** feedback plus state.
- **Treatment:** the thumb translates at `--motion-duration-base` with `--motion-ease-in-out`, using a CSS transition so it stays interruptible. The track color changes over the same duration. A checkbox check mark appears with no draw animation.
- **Keyboard (Space):** the same transition is allowed. [INFERRED] exception to A32: the thumb position is the state indicator, and the motion is under 200ms on a 20px element. This is not navigation.
- **Reduced motion:** the thumb jumps and the color crossfades at `--motion-duration-fast`.
- **Provenance:** ease-in-out for on-screen movement [DIRECT] A5. Interruptibility [DIRECT] A18. Check-mark decision [INFERRED].

### Expand / collapse (accordion, disclosure, table row detail)
- **Job:** spatial relationship, showing where the content came from.
- **Treatment:** use Motion `height: "auto"` layout animation or the Radix accordion CSS variable, over `--motion-duration-moderate` with `--motion-ease-out` on open. Exit takes ×0.8. Content opacity runs 0 to 1 alongside the height, and the chevron rotates over the same duration.
- **In data tables:** a row-detail expand is allowed on mouse click. Keyboard expand uses no motion.
- **Reduced motion:** height jumps and content fades at `--motion-duration-fast`.
- **Provenance:** coordinated opacity and height [DIRECT] A51. "Never animate height" (A46) applies to CSS `height` transitions; Motion's layout animation uses transforms [CONVENTION: Motion docs, layout animations]. The keyboard rule [DIRECT] A32.

### Tooltip
- **Job:** information on demand.
- **Treatment:** the first tooltip opens after the delay the component ships, then enters with opacity plus `scale(0.97)` over `--motion-duration-fast` and `--motion-ease-out`. Moving to an adjacent tooltip while one is open is instant, with no delay and no animation.
- **Reduced motion:** opacity only.
- **Provenance:** [DIRECT] A55; [OBSERVED] WE: tooltip 0.125s ease-out, `[data-instant]` 0ms.

### Dropdown / popover / select / context menu
- **Job:** state plus spatial relationship.
- **Treatment:** origin-aware. Set `transform-origin: var(--radix-*-content-transform-origin)`. Enter with opacity 0 to 1 plus `scale(0.95)` to 1 over `--motion-duration-base` with `--motion-ease-out`, and exit at ×0.8. Opened by keyboard or command, it appears with no motion.
- **Reduced motion:** opacity only.
- **Provenance:** [DIRECT] WE: origin-aware popover, A2, A22, A20 (180ms). The keyboard rule [DIRECT] A32.

### Dialog / modal
- **Job:** state, marking a mode change.
- **Treatment:** the overlay fades over `--motion-duration-moderate`. Content scales from center, `scale(0.95)` plus opacity, with `--motion-ease-out`, exiting at ×0.8. Destructive-confirm dialogs use opacity only (alarm test).
- **Reduced motion:** opacity only.
- **Provenance:** duration [DIRECT] A22, with the contradiction resolved in values.md. Center origin for modals [INFERRED]: a modal has no trigger-relative position that stays true. Destructive opacity-only [INFERRED], per Vesper's alarm test.

### Sheet (desktop side panel)
- **Job:** spatial relationship, bringing detail in from an edge.
- **Treatment:** translateX from the edge (100% to 0) over `--motion-duration-moderate` with `--motion-ease-drawer`; the overlay fades. It opens from the edge nearest the trigger. Keyboard-opened sheets appear with no slide.
- **Reduced motion:** opacity only.
- **Provenance:** easing [DIRECT] A10; duration per values.md.

### Drawer (touch bottom-sheet)
- **Job:** spatial relationship plus direct manipulation.
- **Treatment:** use the shadcn `Drawer` (Vaul) as shipped, with its 500ms and `--motion-ease-drawer`. Do not re-tune or wrap it in extra motion.
- **Reduced motion:** Vaul's behavior stays, and the drag still tracks the finger (see values.md).
- **Provenance:** [OBSERVED] WE: Vaul. "Use shipped defaults" [INFERRED], under Plumb's ruling to use existing components first.

### Toast
- **Job:** feedback after an async result.
- **Treatment:** use the shadcn `Sonner` as shipped: enter from the bottom edge, and stack at a 0.05 scale step. Content rules:
  - A success toast uses the action's own word ("Report exported").
  - An error toast does not auto-dismiss.
  - No toast is issued for keyboard-shortcut actions that already show their result in place.
- **Reduced motion:** Sonner disables its transitions under reduced motion (secondary, deepwiki index of `styles.css`). Verify this in Storybook.
- **Provenance:** [OBSERVED] WE: Sonner enter/stack/swipe; A30 (same direction in and out gives spatial consistency). Copy rule [CONVENTION] Plumb DESIGN.md. Error persistence [INFERRED].

### Dismiss (close button, Escape, swipe)
- **Job:** state.
- **Treatment:** a close button or overlay click runs the component's exit at ×0.8. Escape closes with no motion (keyboard). Swipe-to-dismiss follows the finger 1:1 and releases on velocity with `--motion-spring-default`.
- **Reduced motion:** opacity exit, and the swipe still tracks.
- **Provenance:** exit asymmetry [DIRECT] A27; keyboard [DIRECT] A32; swipe velocity [OBSERVED] WE: Sonner swipe (0.11 threshold, "trial and error"); spring on gestures [DIRECT] A15.

### List reorder (drag to reorder, sort)
- **Job:** continuity.
- **Treatment:**
  - Drag reorder: the dragged item tracks the pointer, and siblings shift with Motion `layout` on `--motion-spring-default`.
  - Sort by column header, filter, or pagination on a data table: **none**. Rows re-render in place, and the sort indicator changes.
- **Reduced motion:** the drag still tracks, and siblings crossfade.
- **Provenance:** springs for gestures and interruptibility [DIRECT] A15, A18. Data re-sort no-motion [DIRECT] A34, A35 (data that is read does not move for style); the application to sort is [INFERRED].

### Loading
- **Job:** state, telling the user the system is working and where the content will be.
- **Treatment:** use the shadcn `Skeleton`, matching the final layout, for content loads. Show nothing for the first 200ms, then show the skeleton. Once it has shown, keep it for at least 400ms before swapping to content. The content swap is an opacity crossfade at `--motion-duration-fast`.
  - A spinner is only for in-button async (with the button width locked) and for indeterminate background work. It rotates linearly.
  - No shimmer sweep on DealReady tables.
- **Reduced motion:** a static skeleton and a static spinner, or a text label.
- **Provenance:**
  - Skeleton over spinner [CONVENTION] Plumb anti-patterns.md, from the shadcn skill.
  - The 200/400ms flash-avoidance thresholds are [INFERRED]. His public work does not cover loading ([NOT IN SOURCE], Phase 1 notes). The reasoning: a skeleton that flashes for 50ms reads as a glitch, while one that lingers reads as work. Validate with Tally on real latency.
  - No shimmer [INFERRED], per the alarm and calm tests.

### Success
- **Job:** feedback, confirming the thing happened and saying where it went.
- **Treatment:** change state in place. The button label changes to the past tense of its verb for 1.5s ("Export" becomes "Exported"), with an opacity crossfade at `--motion-duration-fast`, or a toast if the result lives elsewhere. No confetti, check-mark draw, pulse or scale pop.
- **Reduced motion:** the same label change without the crossfade. The confirmation remains.
- **Provenance:** [INFERRED], per Vesper's anti-patterns (confetti, "delight as a goal") and A54 (delight turns irritating with repetition). The "rare delight" tier (A56) is **cut** for these products, since no DealReady or Fybr action is rare enough to spend it on without failing the calm test.

### Error / validation
- **Job:** state, saying what failed and where.
- **Treatment:** the inline message fades in at `--motion-duration-fast`. No shake, red flash, or pulse. Focus moves to the first invalid field with no scroll animation if it was keyboard-submitted, and with `scroll-behavior: smooth` otherwise.
- **Reduced motion:** the message appears, and scrolling is instant.
- **Provenance:** [INFERRED], per the Vesper alarm test. The shake is the canonical "escalates an activated user" motion. Smooth scroll gated on input modality [INFERRED] from A32.

### Tabs / segmented control indicator
- **Job:** continuity.
- **Treatment:** the indicator slides with `--motion-ease-in-out` over `--motion-duration-base`, using `clip-path` inset or `transform`. Panel content swaps with no transition. Switching tabs by keyboard moves the indicator instantly.
- **Reduced motion:** the indicator jumps.
- **Provenance:** ease-in-out [DIRECT] A5; clip-path tabs [OBSERVED] WE: tabs clip; keyboard [DIRECT] A32. No panel-content motion [INFERRED] (frequency, A53).

### Hold-to-confirm (destructive, touch)
- **Job:** safety, giving the user time to confirm a choice they are deliberately holding.
- **Treatment:** a `clip-path` fill, linear, over `--motion-duration-hold`. On release before completion, it snaps back at 200ms `--motion-ease-out`. Touch surfaces only. On pointer or keyboard surfaces, use a confirm dialog or an undo window instead.
- **Reduced motion:** a static progress bar counting down (linear motion is information here, so it stays).
- **Provenance:** [OBSERVED] WE: Hold to delete; [DIRECT] A28 (slow press, snappy release). Touch-only scoping [INFERRED]: keyboard users cannot hold, and DealReady is keyboard-first.

### Map camera (Fybr)
- See `product-fybr.md`. Camera motion is not a generic micro-interaction.
