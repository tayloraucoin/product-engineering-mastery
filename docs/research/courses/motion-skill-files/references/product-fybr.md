---
title: Motion skill bundle — Motion in Fybr (product-bound)
description: Product-bound; no universal target. Read only when porting the motion skill into that product's repo.
layer: research
status: archived
thread: "07"
role: Vesper
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
---
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
