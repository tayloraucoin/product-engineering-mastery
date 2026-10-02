---
name: motion
description: Read only when installing tk-motion in Phase 3; the original skill description is kept as source_description.
source_description: Decide whether a UI element should move, and if so exactly how (duration, easing, spring, reduced-motion equivalent). Use when a task adds, changes, reviews, or removes an animation, transition, micro-interaction, hover/press/focus feedback, toast, drawer, sheet, popover, list reorder, loading state, or map camera move. Not for static layout, color, or copy work.
paths: components/**, app/**, src/**, styles/**
allowed-tools: Read Grep Glob
disallowed-tools: WebFetch
title: Motion skill bundle — SKILL.md (as delivered)
layer: research
status: archived
thread: "07"
role: Vesper
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
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
