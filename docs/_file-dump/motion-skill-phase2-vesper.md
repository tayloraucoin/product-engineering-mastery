# Motion skill: Phase 2 (Vesper), addressed to Plumb for adoption

Built from the Phase 1 inventory (Alembic, Emil Kowalski's public work, read 2026-09-30) and Plumb's skills ruling (September 2026). Every rule below carries a provenance tag:
- `[DIRECT]`: Kowalski says it. `A#` is an atom and `WE:` a worked example from the Phase 1 inventory.
- `[INFERRED]`: my reasoning, stated inline.
- `[CONVENTION]`: imported from outside his work, with the source named.

## Summary

- **Most of the skill is sourced.** The skill is a `motion` folder with a short SKILL.md and six reference files. About two-thirds of its rules are `[DIRECT]`. The public material fully covers easing, duration, frequency, keyboard behavior, performance and reduced motion. The gaps (hierarchy, orchestration, loading, map motion, data-dense UI) are filled with labeled inference.
- **Its most important output is "don't".** Keyboard-initiated actions, data values, high-stress paths, and anything seen hundreds of times a day do not animate. For DealReady that covers most of the product.
- **Product application:**
  - DealReady spends its motion in one place: the path from claim to source.
  - Fybr spends it on camera orientation and nowhere else, and gives the map the frame budget.
- **The course:** join the 2027 waitlist. What only the course sells is calibrated judgment (A/B training, the walkthroughs, the orchestration module). A skill cannot encode that, and it is the polish loop where prompting is weakest.
- **For Plumb:**
  - Adopt the skill as a house skill with a narrow automatic trigger. This amends the manual-only row in the ruling; I'd keep the trigger automatic because the "don't animate" gate has to fire when an agent reaches for motion unprompted.
  - Close the GSAP deferral as rejected for both products.
  - Replace the secondary-sourced motion line in DESIGN.md.

## Convergence tests

| Test | Result | What was cut or flagged |
|---|---|---|
| State (reduced motion designed, not removed) | Pass | Every catalog row has a reduced equivalent, confirmations stay, and drag tracking stays. Open item: Sonner's reduced-motion behavior is secondary (deepwiki index); verify in Storybook |
| Alarm (nothing escalates an activated user on a high-stress path) | Pass after cuts | Cut: the "rare delight" tier, any spring bounce, shake on error, shimmer skeletons, hover scale on cards, flash-highlight on changed values (replaced by a persistent static marker) |
| Buildability (an agent can apply each rule without asking) | Pass with 3 assumptions | Rewritten: "match duration to distance" now has thresholds, "pace them through the experience" is absorbed into L1/L19, and conflicting scale values are pinned to 0.95. Assumptions: the shadcn/Radix stack, a MapLibre/Mapbox-style camera API, and an input-modality helper that is described but not yet written. Two values need human or data validation: the pointer spring (polish loop) and the loading thresholds (Tally) |

---

## 1. The motion law (tagged)

The canonical copy is `motion/references/law.md`, reproduced here.


### 1.1 When to animate

**L1. Motion must do one of four jobs, or it does not exist.**
- The jobs:
  - **Feedback:** the input landed.
  - **State change:** something opened, closed, appeared or left.
  - **Spatial relationship:** where it came from or went.
  - **Continuity:** the same object changed, and the eye tracks it.
- Provenance: [DIRECT] A36 ("'It looks cool' is not on this list") and A52 (animations "enrich the information on the page"). The four-job taxonomy is [INFERRED]; it is the prompt's framing, and each job maps to one of his demos:
  - feedback: button press;
  - state: dropdown and toast;
  - spatial: Sonner's same-direction path (A30);
  - continuity: shared layout, tabs.

**L2. Frequency decides before taste.**
- Seen hundreds of times a day: no motion. Tens of times a day: remove or drastically reduce. Occasional: the standard treatment.
- Provenance: [DIRECT] A53, A56, A31.
- House cut: the "rare, can add delight" tier is removed (see Cuts).

**L3. Keyboard-initiated actions never animate.**
- Provenance: [DIRECT] A32.
- Scope [INFERRED], so it can be applied without a question:
  - It covers shortcuts, the command palette, arrow and j/k navigation, Escape, Tab focus movement, and Enter-submitted forms.
  - It does not cover the toggle-thumb position, which is state indication under 200ms (catalog.md).
- Implementation: track the last input modality (`pointerdown` vs `keydown`) on `document.documentElement.dataset.input`, and gate the transitions on it.

**L4. Data the user is reading or acting on does not move for style.**
- Numbers do not count up. Rows do not animate on sort, filter or pagination. Diffs do not animate in. Live values do not tween. Changes are marked with a persistent static indicator.
- Provenance: [DIRECT] A34 ("in a banking app for example, no animation would be better"), A35.
- The static-indicator substitute is [INFERRED]: trust UI needs the change to be findable after the fact, and a 300ms flash is gone before the reviewer looks.

**L5. High-stress paths approach stillness.**
- On errors, destructive confirmations, failed uploads, blocking diligence states and field-measurement failures: opacity only, `--motion-duration-fast`, and no shake, pulse, flash, bounce, or attention motion.
- Provenance: [INFERRED] from Vesper's alarm test, with support from [DIRECT] A37 ("Animations can make people feel sick or get distracted").

**L6. Motion is never used to seek attention.**
- No idle loops, pulsing badges, nudging arrows, or "look here" shakes.
- Provenance: [INFERRED]. [CONVENTION] Plumb's anti-patterns.md (manufactured urgency) and the frontend-design line "extra animation contributes to the feeling that the design is AI-generated" (Plumb ruling, [4]).

**L7. Marketing surfaces are a different budget.**
- The 300ms ceiling and "no delight" rules apply to product surfaces. A marketing page may run longer, illustrative motion.
- Provenance: [DIRECT] A21, A25 ("unless it's illustrative").
- House: marketing motion is out of scope for this skill [INFERRED]; route it to Vitrine.

### 1.2 How to animate

**L8. Easing by situation.**
- Entering or exiting: ease-out. Already on screen and moving: ease-in-out. Hover: `ease`. Constant or progress motion: linear. Never ease-in.
- Custom curves over CSS keywords.
- Provenance: [DIRECT] A2, A3, A4, A5, A6, A7, A9, A11. Values in values.md.

**L9. Durations by class, ceiling 300ms.**
- Micro: 100–150ms. Tooltip, dropdown: 150–250ms. Dialog, sheet: 200–300ms. User-initiated UI never exceeds 300ms.
- Provenance: [DIRECT] A19, A22, A26.
- Contradiction: A23 says 200–500ms for modals. The house resolution is in values.md [INFERRED].

**L10. Bigger and farther means longer, within the class.**
- Provenance: [DIRECT] A24.
- Thresholds [INFERRED]: travel over 50% of the viewport uses the class maximum; travel under 16px uses the class minimum.

**L11. Exits run about 20% faster than entrances.**
- Provenance: [DIRECT] A27.
- Where the user is deciding, be slow; where the system is responding, be fast. [DIRECT] A28, A29.

**L12. Springs only for pointer-following, gestures, and interruptible motion. Durations everywhere else.**
- Provenance: [DIRECT] A13, A14, A15, A18.
- Bounce is 0 in product UI: [INFERRED] from A17 ("Avoid bounce in most UI contexts"), made absolute by the alarm test.

**L13. Scale from the trigger, and never from zero.**
- Popovers use the trigger origin. Modals use the center. The entrance starts at scale 0.95 with opacity 0.
- Provenance: [DIRECT] WE: origin-aware popover (7 Tips #5; Good vs Great). Entry scale [DIRECT] "0.9+" and 0.95 across his sources (contradiction noted in values.md). Modal center [INFERRED].

**L14. Transform and opacity only.**
- `clip-path` for reveals. No layout properties. Blur is 2px at most on product surfaces. In Motion, animate a full `transform` string rather than the `x`, `y`, `scale` shorthands, which his skill says are not hardware-accelerated.
- Provenance: [DIRECT] A40, A41, A44, A46, A47.
- The 2px blur ceiling [INFERRED]: field devices and glare, and the glassmorphism ban in anti-patterns.md.

**L15. CSS first, JavaScript when needed.**
- CSS transitions and WAAPI for most work, especially under load. Motion for springs, gestures, layout and presence.
- Provenance: [DIRECT] A41, A42 (the Vercel dashboard dropped frames with shared layout; they fixed it with CSS).

**L16. Anything reversible is interruptible.**
- Use transitions, not keyframes, for open/close, hover and toggle.
- Provenance: [DIRECT] A18. The keyframes-vs-transitions mechanism is [CONVENTION]: CSS transitions retarget from their current value; keyframe animations restart.

**L17. Stagger is decorative, so it is rare and short.**
- First render only, fewer than 6 items, 40ms, 200ms total or less. Never on data rows. Never blocks input.
- Provenance: [DIRECT] A48, A49. Caps [INFERRED] from L4 and L2.

**L18. Coordinate paired properties.**
- When height and content both change, opacity rides along with height. Two moving things share a duration and an easing unless one is deliberately the leader.
- Provenance: [DIRECT] A51. "Shared unless deliberately led" is [INFERRED]; orchestration is behind the wall (A50, [NOT IN SOURCE]).

**L19. Motion follows hierarchy; it does not create it.**
- The primary object of a transition gets the longest, most spatial motion. Secondary elements (overlay, sibling content) get opacity only, at the same or a shorter duration. Nothing secondary moves more than the primary.
- Provenance: [INFERRED]. His public work does not tie motion to hierarchy ([NOT IN SOURCE], Phase 1 cluster 9). The rule is the buildable form of Plumb's "spend boldness in one place".

**L20. Match the motion to the product's mood.**
- A professional dashboard should be "crisp and fast".
- Provenance: [DIRECT] A63. Applied per product in product-*.md.

### 1.3 Reduced motion

**L21. Reduced motion is a designed equivalent, not a removal.**
- Fewer and gentler: keep opacity and color, drop translate, scale, camera flight and stagger. Every confirmation stays visible. Direct manipulation (drag tracking) stays.
- Provenance: [DIRECT] A39, A38. The drag exception is [INFERRED]: tracking the finger is the interaction itself, not an animation of it.
- Every animation in a PR declares its reduced equivalent (SKILL.md output line). The equivalents table is in values.md.

**L22. Honor the OS setting, and do not add an in-app toggle unless asked.**
- Provenance: [CONVENTION] Vercel Web Interface Guidelines ("Honor `prefers-reduced-motion`", via Plumb's ruling). "No in-app toggle by default" is [INFERRED] scope control.

### 1.4 The micro-interaction catalog

See catalog.md: hover, press, focus, toggle, expand, tooltip, dropdown, dialog, sheet, drawer, toast, dismiss, list reorder, loading, success, error, tabs, hold-to-confirm. Map camera is in product-fybr.md.

---

### Cuts (failed a convergence test)

| Cut rule | Source | Test failed | Why |
|---|---|---|---|
| "Rare actions can add delight" | A56 | Alarm test, plus Vesper's "delight as a goal" anti-pattern | Neither product has an action rare enough; onboarding completion in DealReady is a trust moment, not a celebration |
| Spring bounce 0.1–0.3 "when used" | A17, WE: spring config (bounce 0.2) | Alarm test | Any overshoot on a diligence screen reads as playful at best and unstable at worst. Bounce is 0 |
| Hover `scale(1.05)` on cards | WE: hover gate demo | Drift and calm tests | A marketing-card reflex; in a dense table it causes reflow-like jitter |
| Hold-to-delete as a general destructive pattern | WE: Hold to delete | State test (keyboard) | Keyboard users cannot hold. Kept for touch only |
| "Match duration to distance" as stated | A24 | Buildability test | Unanswerable without thresholds. Replaced by L10 with numbers |
| "Pace them through the experience" | A52 | Buildability test | Not applicable without a question. Absorbed into L1 and L19 |
| His 0.5 entry scale (Clerk toast) | WE: CSS Transforms | Buildability (conflicts with his own 0.9+ rule) | [OBSERVED] in one demo, not a recommendation |
| Shimmer on skeletons | none (convention) | Alarm and calm tests on dense tables | Motion that seeks attention during waiting |

---

## 2. The skill files

Save these under `/.claude/skills/motion/` (or `plumb-motion/`, per section 5). The zip contains the same folder.

### `motion/SKILL.md`

````markdown
---
name: motion
description: Decide whether a UI element should move, and if so exactly how (duration, easing, spring, reduced-motion equivalent). Use when a task adds, changes, reviews, or removes an animation, transition, micro-interaction, hover/press/focus feedback, toast, drawer, sheet, popover, list reorder, loading state, or map camera move. Not for static layout, color, or copy work.
paths: components/**, app/**, src/**, styles/**
allowed-tools: Read Grep Glob
disallowed-tools: WebFetch
---

# Motion

This skill answers one question: **should this move, and if so, how?** Most of the time the answer is "no", or "yes, briefly and quietly". Motion in these products carries information. It is never decoration.

Tokens and component law live in `/docs/design/DESIGN.md` (motion section) and `/docs/design/tokens.md`, and they override this skill. Code-level lint (`transition: all`, missing `prefers-reduced-motion`) belongs to `ui-code-lint`. This skill owns the judgment.

## Before you start

1. Read `references/values.md`. Use only the tokens it lists and never type a raw duration or cubic-bezier.
2. Read the product file for this repo: `references/product-dealready.md` or `references/product-fybr.md`.
3. For a named component (toast, drawer, tooltip, and so on), read its row in `references/catalog.md`.
4. When a rule's reason matters to your decision, read `references/law.md`. It holds every rule with its provenance tag.

## Pass 1: should it move?

Answer these in order and stop at the first "no motion".

1. **Is the action keyboard-initiated?** If so, use no motion (`--motion-duration-instant`). This covers shortcuts, command palette, arrow or j/k navigation, and tab switching by key.
2. **How often will one user see it?** Hundreds of times a day means no motion. Tens of times a day means remove it or make it drastically shorter. Occasional use gets the standard treatment.
3. **Is it data the user is reading or acting on?** Numbers, table cells, diff text, measurement values and AI claim text do not move for style. Mark a change with a static indicator, not an animation.
4. **Is the user on a high-stress path?** That includes errors, destructive confirmations, failed uploads, and deadline or diligence-blocking states. Motion approaches stillness there: opacity only, `--motion-duration-fast`, and no shake, pulse, flash or bounce.
5. **Does the motion carry one of these four jobs?** If it carries none, it does not move.
   - **Feedback:** confirms the input was received (press, toggle, submit).
   - **State change:** something opened, closed, appeared, or was removed.
   - **Spatial relationship:** where the new thing came from, or where the old thing went.
   - **Continuity:** the same object changed size or position, and the eye should track it.

"It looks nice", "it feels premium", and "to draw attention" are not jobs.

## Pass 2: how does it move?

1. **Properties:** `transform` and `opacity` only. Never animate `width`, `height`, `top`, `left`, `margin` or `padding`. For reveals, use `clip-path` or a Motion layout animation. Blur is 2px at most on product surfaces, and there is no `backdrop-filter` animation.
2. **Easing:**
   - Entering or exiting: `--motion-ease-out`.
   - Already on screen and moving or morphing: `--motion-ease-in-out`.
   - Hover color or background: `--motion-ease-hover` (CSS `ease`).
   - Progress and hold-to-confirm: `linear`.
   - Never `ease-in`, and never bounce or elastic.
3. **Duration:** pick by the component class in `values.md`. Larger and farther travel gets longer, within the class range. Exits run about 20% faster than entrances. Nothing user-initiated exceeds 300ms, except a touch sheet that follows a drag.
4. **Spring vs duration:** use a spring only when the motion follows the pointer or a gesture (drag, swipe, pointer-tracking) or must be interruptible mid-flight. Everything else uses a duration and an easing. Springs use `--motion-spring-default` (bounce 0).
5. **Origin:** popovers, dropdowns and menus scale from their trigger (`transform-origin` from the Radix CSS variable). Only modals scale from center. Entrance scale starts at 0.95, never 0.
6. **Interruptibility:** anything the user can reverse mid-flight (hover, toggle, open/close) must reverse from its current position. Use CSS transitions or Motion, not keyframes, for these.
7. **Stagger:** only on first render of fewer than 6 items. Use 40ms between items and never on data rows. Stagger never blocks interaction.
8. **Reduced motion:** every animation declares its `prefers-reduced-motion: reduce` equivalent, and "remove it" is not an equivalent. Keep opacity and color changes, drop translate, scale and camera flights, and keep every confirmation visible. The table is in `values.md`.

## Library choice

- CSS transitions come first: hover, press, focus, tooltip, popover, dialog.
- Motion (`motion/react`) is for springs, gestures, layout and shared-element transitions, and `AnimatePresence` exits.
- Use the Sonner and Vaul defaults that ship with the shadcn `Toast` and `Drawer`. Do not re-tune them.
- Do not add GSAP or any other animation library. A new library needs a PR justification.

## Output

When you add or change motion, state it in the PR or response in this form:

`<element>: <job> · <token duration> · <token easing> · reduced: <equivalent>`

When you decide something should not move, say so in one line with the Pass 1 step that stopped it. For the review rubric, see `references/review.md`.
````

### `motion/references/values.md`

````markdown
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
````

### `motion/references/catalog.md`

````markdown
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
````

### `motion/references/law.md`

````markdown
# The motion law

Each rule is tagged by provenance:
- `[DIRECT]`: Emil Kowalski states it. The atom is cited: `A#` is from the Phase 1 inventory (Alembic, read 2026-09-30), and `WE:` is from its worked-examples table.
- `[INFERRED]`: Vesper's craft reasoning, stated inline.
- `[CONVENTION]`: widely held practice imported from outside his work, with its source named.

Rules that failed the convergence tests (state, alarm, buildability) were cut. They are listed at the end with the reason.

---

## 1. When to animate

**L1. Motion must do one of four jobs, or it does not exist.**
- The jobs:
  - **Feedback:** the input landed.
  - **State change:** something opened, closed, appeared or left.
  - **Spatial relationship:** where it came from or went.
  - **Continuity:** the same object changed, and the eye tracks it.
- Provenance: [DIRECT] A36 ("'It looks cool' is not on this list") and A52 (animations "enrich the information on the page"). The four-job taxonomy is [INFERRED]; it is the prompt's framing, and each job maps to one of his demos:
  - feedback: button press;
  - state: dropdown and toast;
  - spatial: Sonner's same-direction path (A30);
  - continuity: shared layout, tabs.

**L2. Frequency decides before taste.**
- Seen hundreds of times a day: no motion. Tens of times a day: remove or drastically reduce. Occasional: the standard treatment.
- Provenance: [DIRECT] A53, A56, A31.
- House cut: the "rare, can add delight" tier is removed (see Cuts).

**L3. Keyboard-initiated actions never animate.**
- Provenance: [DIRECT] A32.
- Scope [INFERRED], so it can be applied without a question:
  - It covers shortcuts, the command palette, arrow and j/k navigation, Escape, Tab focus movement, and Enter-submitted forms.
  - It does not cover the toggle-thumb position, which is state indication under 200ms (catalog.md).
- Implementation: track the last input modality (`pointerdown` vs `keydown`) on `document.documentElement.dataset.input`, and gate the transitions on it.

**L4. Data the user is reading or acting on does not move for style.**
- Numbers do not count up. Rows do not animate on sort, filter or pagination. Diffs do not animate in. Live values do not tween. Changes are marked with a persistent static indicator.
- Provenance: [DIRECT] A34 ("in a banking app for example, no animation would be better"), A35.
- The static-indicator substitute is [INFERRED]: trust UI needs the change to be findable after the fact, and a 300ms flash is gone before the reviewer looks.

**L5. High-stress paths approach stillness.**
- On errors, destructive confirmations, failed uploads, blocking diligence states and field-measurement failures: opacity only, `--motion-duration-fast`, and no shake, pulse, flash, bounce, or attention motion.
- Provenance: [INFERRED] from Vesper's alarm test, with support from [DIRECT] A37 ("Animations can make people feel sick or get distracted").

**L6. Motion is never used to seek attention.**
- No idle loops, pulsing badges, nudging arrows, or "look here" shakes.
- Provenance: [INFERRED]. [CONVENTION] Plumb's anti-patterns.md (manufactured urgency) and the frontend-design line "extra animation contributes to the feeling that the design is AI-generated" (Plumb ruling, [4]).

**L7. Marketing surfaces are a different budget.**
- The 300ms ceiling and "no delight" rules apply to product surfaces. A marketing page may run longer, illustrative motion.
- Provenance: [DIRECT] A21, A25 ("unless it's illustrative").
- House: marketing motion is out of scope for this skill [INFERRED]; route it to Vitrine.

## 2. How to animate

**L8. Easing by situation.**
- Entering or exiting: ease-out. Already on screen and moving: ease-in-out. Hover: `ease`. Constant or progress motion: linear. Never ease-in.
- Custom curves over CSS keywords.
- Provenance: [DIRECT] A2, A3, A4, A5, A6, A7, A9, A11. Values in values.md.

**L9. Durations by class, ceiling 300ms.**
- Micro: 100–150ms. Tooltip, dropdown: 150–250ms. Dialog, sheet: 200–300ms. User-initiated UI never exceeds 300ms.
- Provenance: [DIRECT] A19, A22, A26.
- Contradiction: A23 says 200–500ms for modals. The house resolution is in values.md [INFERRED].

**L10. Bigger and farther means longer, within the class.**
- Provenance: [DIRECT] A24.
- Thresholds [INFERRED]: travel over 50% of the viewport uses the class maximum; travel under 16px uses the class minimum.

**L11. Exits run about 20% faster than entrances.**
- Provenance: [DIRECT] A27.
- Where the user is deciding, be slow; where the system is responding, be fast. [DIRECT] A28, A29.

**L12. Springs only for pointer-following, gestures, and interruptible motion. Durations everywhere else.**
- Provenance: [DIRECT] A13, A14, A15, A18.
- Bounce is 0 in product UI: [INFERRED] from A17 ("Avoid bounce in most UI contexts"), made absolute by the alarm test.

**L13. Scale from the trigger, and never from zero.**
- Popovers use the trigger origin. Modals use the center. The entrance starts at scale 0.95 with opacity 0.
- Provenance: [DIRECT] WE: origin-aware popover (7 Tips #5; Good vs Great). Entry scale [DIRECT] "0.9+" and 0.95 across his sources (contradiction noted in values.md). Modal center [INFERRED].

**L14. Transform and opacity only.**
- `clip-path` for reveals. No layout properties. Blur is 2px at most on product surfaces. In Motion, animate a full `transform` string rather than the `x`, `y`, `scale` shorthands, which his skill says are not hardware-accelerated.
- Provenance: [DIRECT] A40, A41, A44, A46, A47.
- The 2px blur ceiling [INFERRED]: field devices and glare, and the glassmorphism ban in anti-patterns.md.

**L15. CSS first, JavaScript when needed.**
- CSS transitions and WAAPI for most work, especially under load. Motion for springs, gestures, layout and presence.
- Provenance: [DIRECT] A41, A42 (the Vercel dashboard dropped frames with shared layout; they fixed it with CSS).

**L16. Anything reversible is interruptible.**
- Use transitions, not keyframes, for open/close, hover and toggle.
- Provenance: [DIRECT] A18. The keyframes-vs-transitions mechanism is [CONVENTION]: CSS transitions retarget from their current value; keyframe animations restart.

**L17. Stagger is decorative, so it is rare and short.**
- First render only, fewer than 6 items, 40ms, 200ms total or less. Never on data rows. Never blocks input.
- Provenance: [DIRECT] A48, A49. Caps [INFERRED] from L4 and L2.

**L18. Coordinate paired properties.**
- When height and content both change, opacity rides along with height. Two moving things share a duration and an easing unless one is deliberately the leader.
- Provenance: [DIRECT] A51. "Shared unless deliberately led" is [INFERRED]; orchestration is behind the wall (A50, [NOT IN SOURCE]).

**L19. Motion follows hierarchy; it does not create it.**
- The primary object of a transition gets the longest, most spatial motion. Secondary elements (overlay, sibling content) get opacity only, at the same or a shorter duration. Nothing secondary moves more than the primary.
- Provenance: [INFERRED]. His public work does not tie motion to hierarchy ([NOT IN SOURCE], Phase 1 cluster 9). The rule is the buildable form of Plumb's "spend boldness in one place".

**L20. Match the motion to the product's mood.**
- A professional dashboard should be "crisp and fast".
- Provenance: [DIRECT] A63. Applied per product in product-*.md.

## 3. Reduced motion

**L21. Reduced motion is a designed equivalent, not a removal.**
- Fewer and gentler: keep opacity and color, drop translate, scale, camera flight and stagger. Every confirmation stays visible. Direct manipulation (drag tracking) stays.
- Provenance: [DIRECT] A39, A38. The drag exception is [INFERRED]: tracking the finger is the interaction itself, not an animation of it.
- Every animation in a PR declares its reduced equivalent (SKILL.md output line). The equivalents table is in values.md.

**L22. Honor the OS setting, and do not add an in-app toggle unless asked.**
- Provenance: [CONVENTION] Vercel Web Interface Guidelines ("Honor `prefers-reduced-motion`", via Plumb's ruling). "No in-app toggle by default" is [INFERRED] scope control.

## 4. The micro-interaction catalog

See catalog.md: hover, press, focus, toggle, expand, tooltip, dropdown, dialog, sheet, drawer, toast, dismiss, list reorder, loading, success, error, tabs, hold-to-confirm. Map camera is in product-fybr.md.

---

## Cuts (failed a convergence test)

| Cut rule | Source | Test failed | Why |
|---|---|---|---|
| "Rare actions can add delight" | A56 | Alarm test, plus Vesper's "delight as a goal" anti-pattern | Neither product has an action rare enough; onboarding completion in DealReady is a trust moment, not a celebration |
| Spring bounce 0.1–0.3 "when used" | A17, WE: spring config (bounce 0.2) | Alarm test | Any overshoot on a diligence screen reads as playful at best and unstable at worst. Bounce is 0 |
| Hover `scale(1.05)` on cards | WE: hover gate demo | Drift and calm tests | A marketing-card reflex; in a dense table it causes reflow-like jitter |
| Hold-to-delete as a general destructive pattern | WE: Hold to delete | State test (keyboard) | Keyboard users cannot hold. Kept for touch only |
| "Match duration to distance" as stated | A24 | Buildability test | Unanswerable without thresholds. Replaced by L10 with numbers |
| "Pace them through the experience" | A52 | Buildability test | Not applicable without a question. Absorbed into L1 and L19 |
| His 0.5 entry scale (Clerk toast) | WE: CSS Transforms | Buildability (conflicts with his own 0.9+ rule) | [OBSERVED] in one demo, not a recommendation |
| Shimmer on skeletons | none (convention) | Alarm and calm tests on dense tables | Motion that seeks attention during waiting |
````

### `motion/references/product-dealready.md`

````markdown
# Motion in DealReady (trust UI)

**State budget:** the user is a reviewer doing diligence. They are often under deadline and sometimes reading material that changes a deal. The UI is calm, dense and keyboard-first. Motion budget: minimal. "A professional dashboard should be crisp and fast" ([DIRECT] A63).

[ASSUMPTION: DealReady is a React/Next.js app using shadcn (`@/components/ui`) with Radix primitives, per Plumb's ruling. The command palette and j/k row navigation exist or are planned.]

## The three decisions that matter most

### 1. Keyboard-driven work never animates
- **Treatment:**
  - Track the input modality on `<html data-input="keyboard|pointer">`.
  - Under `keyboard`, every transition in this list is `0ms`: command palette, row focus and selection (j/k, arrows), tab switching, sheet and dialog open/close by shortcut, Escape dismiss, Enter submit.
  - Pointer-initiated versions of the same actions use the catalog treatments.
- **Reason:** [DIRECT] A32. A reviewer stepping through 200 claims with j/k sees every transition hundreds of times (A53, A56). Any latency there reads as the tool being slower than the reviewer.

### 2. Evidence does not move; changes are marked, not animated
- **Treatment:**
  - Never animate these: table rows on sort, filter or pagination; numbers (no count-up); AI claim text as it streams (append in place); diff hunks; confidence scores; provenance chips.
  - When a value changes after load (for example, a re-run analysis), show a persistent static "changed" marker (token-colored dot plus a timestamp on hover) until the reviewer acknowledges it. Do not use a flash or a highlight fade.
  - Tables use `tabular-nums`.
- **Reason:** [DIRECT] A34, A35. The persistent marker is [INFERRED]: in trust UI the change has to be auditable after the fact, and a 300ms highlight is invisible to anyone who looked away. That would make motion a way to hide change rather than show it. This passes the trust test because one treatment is reused everywhere a value changes.

### 3. Motion is spent in one place: the path from claim to source
- **Treatment:**
  - Clicking a provenance chip on an AI claim opens the source in a right side sheet: translateX 100% to 0, `--motion-duration-moderate` (250ms), `--motion-ease-drawer`, exit 200ms.
  - The cited passage in the source is already highlighted when the sheet lands. Do not scroll-animate to it; the sheet opens scrolled to the passage.
  - The chip that opened it keeps a selected state while the sheet is open.
  - Under keyboard or reduced motion, the sheet appears with a 125ms opacity fade only.
- **Reason:** this is the product's signature interaction ([CONVENTION] Plumb DESIGN.md, "spend boldness in one place"; provenance chip named there as DealReady's one distinctive element). Spatial continuity (the source comes from the side, the claim stays in place) tells the reviewer that the document is beside the claim, not replacing it ([DIRECT] A30 on the spatial consistency of an in/out path; applied here [INFERRED]). Pre-scrolling instead of animating the scroll is [INFERRED] from L4.

## Everything else in DealReady
- **Hover:** background token only, `--motion-duration-fast`. No row lift.
- **Press:** 0.97 scale on primary buttons only. None on table rows or toolbar icons.
- **Loading:** static skeleton, no shimmer; content crossfade at 125ms.
- **Toasts:** Sonner defaults, and no toast for keyboard-shortcut actions that show their result in place.
- **Destructive:** a confirm dialog (opacity only) or an undo window. No hold-to-confirm.
- **Success:** a past-tense label swap in place. No celebration on report generation or deal close.
````

### `motion/references/product-fybr.md`

````markdown
# Motion in Fybr (spatial UI, field conditions)

**State budget:** there are two users in two states.
- The novice on the self-serve path may be outdoors: glare, gloves, one hand, a tablet or phone, patchy connection.
- The surveyor is at a desk, checking numbers.

The map is the product. Motion's main job here is keeping the user oriented in space. It is never decoration, and it never costs frames on large datasets.

[ASSUMPTION: the map uses MapLibre GL JS or Mapbox GL JS, whose camera API is `jumpTo` / `easeTo` / `flyTo` with an `essential` option. If Fybr uses another engine (OpenLayers, deck.gl, Cesium), map the same rules onto its equivalent calls and flag the difference in the PR.]

## The three decisions that matter most

### 1. The camera moves only when the user asked it to, and never too far or too long
- **Treatment:**
  - **User-initiated camera changes** (search result, "zoom to stockpile", selecting a site in a list):
    - Under about 2 screen-widths of travel at the current zoom: `easeTo({ duration: 300 })` with the engine's default easing.
    - Farther: `flyTo` with `maxDuration: 1200` (the engine jumps instead when the computed flight would exceed that) and `essential: false`, so reduced-motion users get a jump.
  - **User pans and zooms** (drag, pinch, wheel): direct manipulation, handled by the engine. Do not add inertia beyond the engine default.
  - **Data refresh, new measurement results, or background sync:** **never** move the camera. Show new features in place.
  - **Reduced motion:** `jumpTo` plus a 125ms opacity dip on the map container, so the jump still reads as a relocation.
- **Reason:**
  - The camera is the user's spatial anchor. Moving it without being asked destroys orientation, which is the one thing a spatial UI cannot lose ([INFERRED]).
  - `flyTo` is the only case where motion over 300ms is justified: long-distance flight is continuity across a large distance ([DIRECT] A24, bigger distance means longer), and the 1200ms cap is [INFERRED] so a field user is never kept waiting.
  - `maxDuration` behavior and the `essential: false` reduced-motion behavior are [CONVENTION] (MapLibre/Mapbox GL JS camera options; verify against the installed engine version's docs before shipping). His public work does not cover map motion ([NOT IN SOURCE], Phase 1 notes).

### 2. Measurement feedback is instant, and results settle quietly
- **Treatment:**
  - **Placing a vertex, tapping a stockpile, or starting a measurement:**
    - The visual acknowledgement appears on `pointerdown` with **0ms**: the vertex dot appears, the polygon edge updates, and a 44px or larger touch target highlights.
    - No press scale on map features.
  - **Live readouts while drawing** (area, perimeter): update every frame with no tween, in `tabular-nums`. Units are always co-present with the value, in the same element, never fading in separately.
  - **The computed result** (volume, tonnage, confidence): appears with a 125ms opacity fade. Value, unit and confidence render as one unit, so the number is never visible without its confidence. Recomputations replace in place with the static "changed" treatment, never a count-up.
- **Reason:**
  - With gloves, tactile certainty is gone, so the screen has to confirm the touch immediately. Any delay invites a double-tap and a stray vertex ([INFERRED]).
  - Live values that tween lie about intermediate numbers ([DIRECT] A34, A35).
  - Co-presence of the unit and confidence is a Fybr product rule ([CONVENTION] Plumb ruling, ui-code-lint house addition); here it means they never animate separately.

### 3. The frame budget belongs to the map, so chrome motion is cheap or absent
- **Treatment:**
  - Only `transform` and `opacity` in UI chrome over the map. No blur, no `backdrop-filter` (glassmorphism is also banned under glare), no box-shadow transitions.
  - Layer panels and legends: expand and collapse at 250ms, no stagger on layer lists.
  - Mobile bottom sheets (measurement detail, stockpile info): the shadcn `Drawer` (Vaul) as shipped. The map stays interactive above the sheet's snap point.
  - Toggling map layers on or off: the layer's opacity fades over 150ms with the engine's paint transition. Never animate feature geometry.
  - Deleting a stockpile or measurement on touch: hold-to-confirm (`--motion-duration-hold`, 1.5s linear fill), with an undo toast after. On desktop: a confirm dialog or undo.
- **Reason:**
  - Large point clouds and dense feature layers already saturate low-power tablets, and any chrome animation that forces paint or layout competes with the map for frames ([DIRECT] A40, A41, A47).
  - Hold-to-confirm prevents the gloved accidental tap from destroying field work. That is exactly its job in his source (A28: "Pressing should be slow to allow the user to confirm their choice"). The 1.5s value is [INFERRED].

## Everything else in Fybr
- **Hover:** desktop only (the `(hover: hover)` gate). Map feature hover is a paint-property change, not a DOM transition.
- **Loading tiles and datasets:** the engine's own tile fade. For uploads, a determinate linear progress bar with a plain-language stage label.
- **Errors in the field:** opacity fade-in, no shake. Errors persist until dismissed, since the user may be looking away at the stockpile.
- **Reduced motion:** as per values.md, plus the camera rule above.
````

### `motion/references/review.md`

````markdown
# Motion review: rubric line for Assay (ui-critic)

Assay calls this as one rubric line: **"Motion"**. Evidence rules follow ui-critic's convention: every finding cites a screenshot or recording region or a `file:line`, and anything that cannot be observed statically (timing, easing) is checked in code and marked UNVERIFIED-IN-RENDER if not recorded.

## Checks (each is PASS / N issues / N/A)

| # | Check | How to verify | Severity if it fails |
|---|---|---|---|
| M1 | Every animation has a job (feedback, state, spatial, continuity) | Read the PR's motion lines (SKILL.md output format); flag any animation with no line | Should-fix |
| M2 | Nothing animates on keyboard-initiated actions | Grep for transitions not gated on `[data-input="keyboard"]` in palette, row navigation, tabs, and dialogs opened by shortcut; run Playwright keyboard traversal with trace | Blocking (DealReady), Should-fix (Fybr) |
| M3 | Data does not move: no count-up, no row animation on sort/filter, no tweened live values | Grep for `animate` or `transition` on table rows and number components; watch a sort in a recording | Blocking |
| M4 | High-stress paths are still: no shake, pulse, flash, bounce, or scale on error or destructive UI | Grep for `shake`, `pulse`, `bounce`, `animate-ping`, and keyframes on error components; screenshot the error state | Blocking |
| M5 | Only tokens: no raw `ms`, `cubic-bezier`, or spring numbers outside tokens | Grep `\d+ms`, `cubic-bezier\(`, `stiffness`, `bounce:` in `.tsx`/`.css`, excluding the tokens file | Should-fix |
| M6 | No `ease-in`; no bounce or elastic; no spring with `bounce` above 0 | Grep `ease-in[^-]`, `bounce: 0\.[1-9]`, `elastic` | Should-fix |
| M7 | Transform and opacity only; blur 2px or less; no `backdrop-filter` or layout-property transitions | Grep `transition.*(width|height|top|left|margin|padding)`, `backdrop-filter`, `blur\((?:[3-9]|\d{2,})px` | Should-fix (Blocking over the Fybr map) |
| M8 | Durations: 300ms or less for UI (except the Vaul sheet and capped `flyTo`); exits at about ×0.8 of enters | Read the tokens used against values.md | Should-fix |
| M9 | Popovers and menus scale from their trigger; entrance scale is 0.95, not 0 | Grep `transform-origin` on popover content; `scale(0)` | Consider |
| M10 | Reduced motion is designed: each animation has an equivalent, confirmations stay, drag still tracks | Emulate `prefers-reduced-motion: reduce` in Playwright; screenshot every state in states.md | Blocking if a confirmation disappears; otherwise Should-fix |
| M11 | Fybr only: the camera never moves without user input; `flyTo` has `maxDuration` and `essential: false` | Grep `flyTo|easeTo` call sites and trace their callers to user events | Blocking |
| M12 | Frequency: no motion on anything used tens or hundreds of times a day beyond the catalog treatment | Judgment against catalog.md; name the action and the estimated frequency | Consider |

## Output line for the ui-critic report

`Motion: PASS | N issues (M# list) | N/A`, followed by findings in `file:line`, severity-ranked, no more than 5 lines.
````


---

## 3. The product application

The full treatments are in `references/product-dealready.md` and `references/product-fybr.md` (section 2). These are the decisions in brief.

**DealReady (trust UI: calm, dense, keyboard-first)**
1. **Keyboard work never animates.** Row navigation, the palette, tabs, and shortcut-opened panels all run at 0ms under an input-modality flag. A reviewer stepping through 200 claims pays any transition hundreds of times. [DIRECT] A32, A53.
2. **Evidence does not move; changes are marked.**
   - There is no count-up, no sort animation, and no tweened scores.
   - A changed value gets a persistent static marker until the reviewer acknowledges it, never a flash.
   - A flash is gone before an auditor looks, so it would hide the change rather than show it. [DIRECT] A34, A35. The marker is [INFERRED].
3. **Motion is spent in one place: claim to source.**
   - The provenance chip opens the source in a side sheet (250ms, drawer curve), pre-scrolled to the cited passage.
   - The document arriving beside the claim is the product's promise, shown spatially. [CONVENTION] Plumb "spend boldness in one place"; [INFERRED] application.

**Fybr (spatial UI: map-first, field conditions)**
1. **The camera moves only when the user asked.**
   - Short hops use `easeTo` at 300ms. Long jumps use `flyTo` with a 1200ms ceiling. Reduced motion gets `jumpTo`.
   - Data refresh never moves the camera, because orientation is the one thing a map cannot lose. [CONVENTION] map-engine camera API; [INFERRED] rules; [NOT IN SOURCE] in his work.
2. **Measurement feedback is instant, and results settle quietly.**
   - A vertex is acknowledged on pointerdown at 0ms, because gloves remove tactile certainty.
   - Live readouts are untweened and in tabular numerals.
   - The value, unit and confidence fade in together as one unit (125ms). [DIRECT] A35; [INFERRED] the rest.
3. **The map owns the frame budget.**
   - Chrome uses transform and opacity only: no blur, no backdrop-filter, no stagger on layer lists.
   - Mobile sheets use Vaul as shipped.
   - Hold-to-confirm is used for touch deletes, so a gloved mis-tap can't destroy field work. [DIRECT] A28, A40, A47; [INFERRED] the 1.5s hold.

---

## 4. What the course still buys

**What the skill already has, from public sources:** the rules and the numbers. Easing, duration classes, exit asymmetry, frequency, keyboard behavior, springs, performance, reduced motion and stagger are all stated publicly, most of them more than once (Phase 1, clusters 1 to 8, 10 and 11).

**What only the paid lessons would add (from the wall inventory):**

| Behind the wall | What it would change in this skill | Weight |
|---|---|---|
| "Train your judgement": 25+ side-by-side A/B exercises with breakdowns | Calibrates the eye for the polish loop, the one place prompting is bad. His own thesis: "AI can write animation code. What it can't do is know what feels right" (A64) | High. This is the reason to buy |
| Module 4 "Good vs Great": orchestration, accessibility, performance | Would confirm or replace L18 and L19, which are currently [INFERRED] because orchestration and hierarchy are thin publicly | Medium |
| 15 walkthrough lessons (Family drawer, Dynamic Island springs, navigation menu, SVG) | Implementation craft for gesture and spring work. Relevant to Fybr's drawers; marginal for DealReady | Medium for Fybr |
| 50+ exercise solutions | Practice with answers | Medium |
| The course's 15-skill pack ("a lot more nuanced" than the free ones) | Material to compare against and mine from; it would go through Plumb's review procedure, not be installed. License [NOT IN SOURCE] | Low to medium |
| 12 of 18 custom easings | Marginal: the house needs three curves, not eighteen | Low |
| Map motion, data-dense trust UI, field conditions | **Probably not covered.** Nothing in the public curriculum names them. Treat this as unverified, because lesson bodies are [NOT IN SOURCE] | n/a |

**Recommendation:** join the 2027 waitlist now; it is free and reversible. Price is [NOT IN SOURCE] in Phase 1, so make the purchase decision when enrollment opens, against one criterion: if Assay's Motion line is passing but your own recordings still "feel off" to you, the gap is judgment, and that is what the course sells.

**Before 2027, at no cost:**
- Work through the public "Train Your Judgement" post (11 pairs). Name your answer before you read his.
- Adopt two of his stated practices: record your motion and review it the next day (A61), and slow recordings down to inspect them.

---

## 5. Adoption note to Plumb

**Placement and load order.** The skill fits the ruling's layering:

1. `CLAUDE.md`. Add one line: "Motion decisions: see /docs/design/DESIGN.md#motion; the `motion` skill applies them."
2. `/docs/design/` layer: DESIGN.md (motion section, replaced below) and tokens.md (the token table from `values.md`, added verbatim).
3. `shadcn`, which is auto, for component work. `motion`, also auto, with a narrow trigger (below).
4. Manual-only skills on demand: `ui-diverge`, `ui-critic` (forked), `ui-code-lint`.

**Amendment to the ruling's "Motion work (future)" row. [PROPOSED — needs sign-off]**
- The ruling set `/motion` as manual-only. I recommend model-invocable, for these reasons:
  - The skill's most valuable output is the no: keyboard, data, high-stress path, frequency. An agent reaching for a transition unprompted is the moment it has to fire, and a manual skill never fires then.
  - The cost is controlled. The description names motion nouns only, `paths` scopes it to component, app and style directories, the body is short, and the references load on demand. `allowed-tools` is read-only and `disallowed-tools: WebFetch`.
- **Cost of being wrong:** trigger hijacking on non-motion UI work. **Test:** run 10 known tasks (5 with motion, 5 without). If it fires on more than 1 of the 5 without, flip to `disable-model-invocation: true` and have `ui-critic` invoke `review.md` instead.
- **Naming:** rename the folder and `name` to `plumb-motion`, per the ruling's anti-shadowing prefix.

**Relationship to the other skills:**
- **frontend-design:** stays rejected; nothing to reconcile. If a plugin copy appears, turn it off with `skillOverrides`. Its one motion line, "extra animation contributes to the feeling that the design is AI-generated", is consistent with L6.
- **ui-critic:** reads `motion/references/review.md` as its "Motion" rubric line (M1 to M12). The motion skill never critiques its own output, which keeps generation and critique separate.
- **ui-code-lint (Vercel):** owns the code lint for `prefers-reduced-motion`, `transition: all`, and transform/opacity only. Motion's M5 to M7 overlap with it. ui-critic should cite the ui-code-lint finding rather than report the same issue twice.
- **GSAP skills:** close the deferral as **rejected for DealReady and Fybr**. CSS plus `motion/react` covers every row of the catalog. GSAP's "recommend GSAP" trigger text also conflicts with "no new library without PR justification". Reopen only for marketing-site timeline or scroll work (Vitrine).
- **emilkowalski/skills (`emil-design-eng`, 233,965 installs per the ruling, secondary):** do not install. Its triggers overlap this skill, and its defaults conflict with house choices (200–500ms modals, bounce 0.2). Its `review-animations/STANDARDS.md` may be vendored read-only, as source material with a provenance header, after a license check. It is not loaded by agents.

**DESIGN.md motion section: replace the current mined line.** The ruling's current entry ("100–150 ms for feedback and 150–300 ms for state changes...") is secondary, via impeccable's animate reference. Replace it with:

> **Motion.** Motion carries information or does not exist: feedback, state change, spatial relationship, continuity.
> - Keyboard-initiated actions, data values, and anything used hundreds of times a day do not animate.
> - High-stress paths use opacity only.
> - Properties: transform and opacity only. Easing: ease-out for enter and exit, ease-in-out for on-screen movement, never ease-in, never bounce.
> - Durations come from motion tokens and stay at 300ms or less. Exits run at about 80% of the entrance.
> - Reduced motion keeps opacity and every confirmation, and drops movement.
> - Counter-example: a number counting up in a diligence table.
> - Values and provenance: tokens.md. Procedure: the `motion` skill.

**Add to anti-patterns.md:** shake on error; count-up numbers; shimmer skeletons on data tables; camera moves on data refresh; animated keyboard navigation; hover scale on cards and rows.

**Assumptions carried (repeat for sign-off):**
- DealReady and Fybr both use shadcn on Radix with `motion/react` available.
- Fybr's map engine exposes a MapLibre/Mapbox-style camera API.
- An input-modality helper (`data-input` on `<html>`) will be written. It does not exist yet.
- Toast and Drawer are the shadcn Sonner and Vaul wrappers, used at their shipped defaults.
