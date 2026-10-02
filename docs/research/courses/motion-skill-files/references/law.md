---
title: Motion skill bundle — The motion law
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
