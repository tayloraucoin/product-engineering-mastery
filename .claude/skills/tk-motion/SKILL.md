---
name: tk-motion
description: Decide whether UI should move and exactly how (token duration, easing, reduced-motion equivalent), or review motion M1 to M12. Use when a task adds, changes or removes an animation, transition, enter or exit, hover or press feedback, toast, dialog, drawer, sheet, popover or loading motion. Not for static layout, color or copy.
source_description: Decide whether a UI element should move, and if so exactly how (duration, easing, spring, reduced-motion equivalent). Use when a task adds, changes, reviews, or removes an animation, transition, micro-interaction, hover/press/focus feedback, toast, drawer, sheet, popover, list reorder, loading state, or map camera move. Not for static layout, color, or copy work.
paths: apps/*/app/**, apps/*/components/**, packages/ui/**, **/*.css
allowed-tools: Read Grep Glob
disallowed-tools: WebFetch
---

<!-- Provenance: house skill, installed 2026-10-08 (DEMO-15) from the thread-07 bundle docs/research/courses/motion-skill-files/ (Vesper, 2026-09-30; source work by Emil Kowalski, via Alembic's inventory). Retargeted to the house tokens in packages/config/tailwind/preset.css; product files and the map-camera rows cut; source_description kept above. Rulings: CF-30 (trigger), CF-23 (paths), C-P11, C-R12. -->

# Motion

This skill answers one question: **should this move, and if so, how?** Most of the time the answer is "no", or "yes, briefly and quietly". Motion carries information. It is never decoration.

Tokens are `packages/config/tailwind/preset.css` section 4, and canon C-P11 (`docs/design/canon.md`) overrides this skill. Code lint (`transition: all`, missing `prefers-reduced-motion`) belongs to `tk-ui-code-lint`. This skill owns the judgment.

## Before you start

1. Read `references/values.md`. Use only the tokens it lists and never type a raw duration or cubic-bezier.
2. For a named component (toast, drawer, tooltip, dialog), read its row in `references/catalog.md`.
3. When a rule's reason matters, read `references/law.md`. To review existing motion, read `references/review.md`.

## Pass 1: should it move?

Answer in order and stop at the first "no motion".

1. **Keyboard-initiated?** Use no motion (`--motion-duration-instant`): shortcuts, palette, arrow or j/k navigation, tab switching by key.
2. **How often will one user see it?** Hundreds of times a day: none. Tens: remove it or make it drastically shorter. Occasional: the standard treatment.
3. **Is it data the user is reading or acting on?** Numbers, table cells, diff text and AI claim text do not move for style. Mark a change with a static indicator.
4. **High-stress path?** Errors, destructive confirmations, failed uploads: opacity only, `--motion-duration-fast` or the dialog token, no shake, pulse, flash or bounce.
5. **Does it carry one of four jobs?** Feedback (input received), state change (opened, closed, appeared, removed), spatial relationship (where it came from or went), continuity (the same object changed). No job, no motion. "It looks nice" is not a job.

## Pass 2: how does it move?

1. **Properties:** `transform` and `opacity` only. Never width, height, top, left, margin or padding. Blur 2px at most (`--motion-blur-crossfade`); no `backdrop-filter` animation.
2. **Easing:** enter or exit `--motion-ease-out`; on screen and moving `--motion-ease-in-out`; hover color `--motion-ease-hover`; progress `linear`. Never `ease-in`, bounce or elastic.
3. **Duration:** pick the token by component class in `values.md`. Nothing user-initiated exceeds 300ms except `--motion-duration-sheet` after a drag. Exits run about 20% faster than entrances.
4. **Spring:** only when motion follows the pointer or must be interruptible mid-flight. Otherwise a duration and an easing.
5. **Origin:** popovers and menus scale from their trigger; only modals scale from center. Entrance scale starts at `--motion-scale-enter`, never 0.
6. **Interruptible:** anything reversible mid-flight (hover, toggle, open and close) uses CSS transitions, not keyframes.
7. **Stagger:** first render of fewer than 6 items, `--motion-stagger` apart, never on data rows.
8. **Reduced motion:** every animation declares its `prefers-reduced-motion: reduce` equivalent ("remove it" is not one). Keep opacity and color, drop translate and scale, keep every confirmation visible. Table in `values.md`.

## Library choice

CSS transitions first. `motion/react` only for springs, gestures, layout and `AnimatePresence` exits. Keep the shipped Sonner and Vaul defaults. No GSAP or other animation library (CF-32).

## Output

State added or changed motion as: `<element>: <job> · <token duration> · <token easing> · reduced: <equivalent>`. When something should not move, say so in one line with the Pass 1 step that stopped it. A review reports M1 to M12 as one line each (`references/review.md`).
