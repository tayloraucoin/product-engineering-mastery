---
id: DEMO-7
size: small
objective: "A first-time visitor to /demo walks three beats that show what a record holds, what compare marks and that delete asks first, then lands on the records, and is never shown the welcome again unless they replay it."
slice_type: "A full-bleed stepped surface with URL-held beats and a remembered flag; the risk is a focus that does not follow the beat, a focusable illustration, or a skip that forgets."
non_negotiables:
  - 'Full-bleed with no demo shell: a 56px bar with "Records demo" (not a link) and ghost "Skip to records", hidden on beat-3, empty and error (D-DEMO-12).'
  - 'Beats are ?state=beat-1|beat-2|beat-3 changed with router.replace; on load and every beat change focus moves to the h1 (tabindex="-1").'
  - "The illustration is built from real primitives, aria-hidden and inert with no focusable descendant; beat-2 uses DEMO-5's Diff, beat-3 a mini alert-dialog in the kit tint (D-DEMO-11)."
  - "Skip, Go to records and New record write onboarded: true through DEMO-1's prefs writer before navigating."
  - "Every key in onboarding.md's States table registers in lib/demo/surfaces/onboarding.ts and renders from the server page's props with data-demo-state on the root."
  - 'Words are onboarding.md''s Words verbatim; "Step n of 3" is the progress''s text and the bar is aria-hidden.'
  - "A beat change fades on opacity at most 200ms on a motion token, instant under reduced motion."
devs_call: "The component split under welcome/_components/, the illustration's inner composition within the captures, and how the fade is keyed."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/onboarding.md"
  - "D-DEMO-3"
  - "D-DEMO-11"
  - "D-DEMO-12"
  - "D-DEMO-16"
  - "D-DEMO-21"
  - "C-DEMO-onboarding-1"
  - "C-DEMO-onboarding-2"
  - "C-DEMO-onboarding-3"
  - "C-DEMO-onboarding-4"
  - "C-DEMO-onboarding-5"
  - "C-DEMO-onboarding-6"
  - "C-DEMO-onboarding-7"
  - "C-DEMO-onboarding-8"
truth_files: "none: the approved proposal ux/demo/onboarding.md reaches specs/web/ux/demo/onboarding.md through yarn truth:promote DEMO once its citing tickets close"
qa: Q2
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "apps/web/app/demo/welcome/**"
  - "apps/web/lib/demo/surfaces/onboarding.ts"
  - "apps/web/e2e/demo/onboarding.spec.ts"
depends_on:
  - DEMO-4
  - DEMO-5
  - DEMO-6
out_of_scope:
  - "The /demo redirect itself: DEMO-4 builds it; this ticket proves it (C1)."
  - "Replay from settings: DEMO-11."
criteria:
  - id: C1
    statement: "On a first visit /demo goes to /demo/welcome; after Skip or finishing, /demo goes to /demo/records."
    evidence: test
    command: "yarn web:e2e e2e/demo/onboarding.spec.ts"
  - id: C2
    statement: "Next on beats 1 and 2 shows the next beat, its h1 has focus, and history length is unchanged."
    evidence: test
    command: "yarn web:e2e e2e/demo/onboarding.spec.ts"
  - id: C3
    statement: "Skip, or Go to records, opens /demo/records and a later /demo skips the welcome."
    evidence: test
    command: "yarn web:e2e e2e/demo/onboarding.spec.ts"
  - id: C4
    statement: "Skip shows on beat-1, beat-2, loading, partial and offline and is absent on beat-3, empty and error."
    evidence: test
    command: "yarn web:e2e e2e/demo/onboarding.spec.ts"
  - id: C5
    statement: "On every beat the illustration is aria-hidden and has no focusable descendant."
    evidence: test
    command: "yarn web:e2e e2e/demo/onboarding.spec.ts"
  - id: C6
    statement: "New record on empty opens /demo/records/new."
    evidence: test
    command: "yarn web:e2e e2e/demo/onboarding.spec.ts"
  - id: C7
    statement: "Every onboarding key renders at 390, 834 and 1440, light and dark, reduced motion, matching its captures."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-007-onboarding/evidence/states.png"
  - id: C8
    statement: "With keyboard alone at 390 a person goes from beat 1 to the records with visible focus throughout."
    evidence: manual
    reason: "Focus visibility along a whole journey is judged by a person at Seen."
---

# Contract — DEMO-7 onboarding

## Build notes

- **Approach:** `welcome/page.tsx` (server) resolves the key with `readDemoState` and passes it to a client view; the beat column, progress, illustration slot and actions follow `onboarding.md` Layout. `e2e/demo/onboarding.spec.ts` names each test by criterion id; its run output is the evidence for C1 to C6. At start, before `contract:init` freezes the criteria, re-point those criteria to `evidence: test` with `command: "yarn web:e2e e2e/demo/onboarding.spec.ts"` (Taylor, Tickets gate, 2026-10-08); the script exists by then (DEMO-6).
- **Decisions that apply:**
  - D-DEMO-3: "Onboarding completion is remembered client-side; no account."
  - D-DEMO-11: "Onboarding's illustrated dialog is inert and keeps the tint. (C-R02)"
  - D-DEMO-12: "Onboarding skip is hidden wherever the primary already goes to records (beat-3, empty, error). Canvas over intent; Taylor."
  - D-DEMO-15: "One state keeps the same content and words at every width; where the captures differ, the 1440 wording and the same fixture rows win. Width changes layout only."
  - D-DEMO-16: "The build fixes capture drift; the canvas stays locked: skeletons copy each width's final layout, static labels as text; rows grow with wrapped text; a disabled control dims its label and helper; a pending button keeps its width; dark spacing and scrim match light; the 390 foot link is in every state; raw widths become tokens."
  - D-DEMO-21: "The primary is first in DOM and focus order; at 1440 the row is reversed and right-aligned (primary outermost), at 390 stacked on top."
- **Interfaces:** route `/demo/welcome?state=<key>`; registry entry `onboarding`.
- **Per path:** `welcome/page.tsx` and `welcome/_components/**`; `surfaces/onboarding.ts` the keys; the e2e spec.
- **Gotchas:**
  - Design: Paper `https://app.paper.design/file/01M4EMRAAHDKDE6S693E3N478D/p-1-0`, page `p-1-0`; captures `specs/web/epics/DEMO-records-demo/ux/demo/captures/onboarding/`. Fix drift in code, never on the canvas.
  - From `md` up the 1440 layout applies (834 takes it). Fixed clock, explicit locales, no `Date.now()` or random values in render. A designed `error` never throws.
  - Beat-1 is the default with no key; an unknown key renders beat-1.
  - The inert dialog's Cancel and Delete must not take focus: `inert` on the slot, not `tabindex` on each.
- **Model:** minimum Sonnet 5.5 at medium, recommended Opus 5.5 at medium. Choosing down tends to push each beat onto history, so the back button walks the beats instead of leaving.
