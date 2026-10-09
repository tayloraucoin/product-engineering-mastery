---
id: DEMO-11
size: small
objective: "An evaluator sets theme, compact rows and the table's default sort, each applied at once and remembered, replays onboarding, and resets the demo data behind a confirm."
slice_type: "Instant-apply preferences over a cookie plus one destructive confirm; the risk is a preference that applies but is not remembered, two theme controls that disagree, or a reset that touches settings."
non_negotiables:
  - 'Three sections named by their h2 (Display, Records, Demo) divided by separator; no Save button: each control applies on change, keeps focus, and a toast (role="status") names it.'
  - 'Theme is a toggle-group named "Theme" (System, Light, Dark) on the kit''s useTheme, the same state as the shell''s toggle; Compact rows is a switch described by its helper; Default sort a radio-group in a fieldset with legend "Default sort".'
  - "Compact rows and Default sort write DEMO-1's prefs cookie; Reset demo data never touches prefs or theme."
  - 'Reset demo data opens the reset confirm on DEMO-5''s layout with settings.md''s words (D-DEMO-13); Reset data dispatches reset and toasts "Demo data reset"; closing returns focus to the trigger; ?state=reset opens it.'
  - "offline keeps Theme and Replay working and disables Compact rows, Default sort and Reset, rows dimmed whole and described by the notice; error shows the previous sort with Retry; partial replaces the Records group with an alert (D-DEMO-23)."
  - "Replay onboarding opens /demo/welcome at beat 1."
  - "Words are settings.md's Words verbatim at both widths."
devs_call: "The section components, how a toast is raised per control, and how the error and partial keys stage their first render."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/settings.md"
  - "D-DEMO-3"
  - "D-DEMO-13"
  - "D-DEMO-23"
  - "C-DEMO-settings-1"
  - "C-DEMO-settings-2"
  - "C-DEMO-settings-3"
  - "C-DEMO-settings-4"
  - "C-DEMO-settings-5"
  - "C-DEMO-settings-6"
  - "C-DEMO-settings-7"
  - "C-DEMO-settings-8"
truth_files: "none: the approved proposal ux/demo/settings.md reaches specs/web/ux/demo/settings.md through yarn truth:promote DEMO once its citing tickets close"
qa: Q2
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "apps/web/app/demo/(shell)/settings/page.tsx"
  - "apps/web/app/demo/(shell)/settings/_components/**"
  - "apps/web/lib/demo/surfaces/settings.ts"
  - "apps/web/e2e/demo/settings.spec.ts"
depends_on:
  - DEMO-4
  - DEMO-5
  - DEMO-6
out_of_scope:
  - "The table reading Compact rows and the default sort: DEMO-8. The welcome itself: DEMO-7."
criteria:
  - id: C1
    statement: "Changing Theme, Compact rows or Default sort applies at once, a toast names it, and the value survives a reload."
    evidence: test
    command: "yarn web:e2e e2e/demo/settings.spec.ts"
  - id: C2
    statement: "With Default sort set to renewal date, /demo/records opens sorted by renewal date, soonest first."
    evidence: test
    command: "yarn web:e2e e2e/demo/settings.spec.ts"
  - id: C3
    statement: "Replay onboarding opens /demo/welcome at beat 1."
    evidence: test
    command: "yarn web:e2e e2e/demo/settings.spec.ts"
  - id: C4
    statement: "After an edit and a delete, Reset demo data then Reset data brings back 40 records with their fixture values, prefs unchanged; Cancel changes nothing."
    evidence: test
    command: "yarn web:e2e e2e/demo/settings.spec.ts"
  - id: C5
    statement: "On offline Theme and Replay work and the other three are disabled and described by the notice."
    evidence: test
    command: "yarn web:e2e e2e/demo/settings.spec.ts"
  - id: C6
    statement: "On error Default sort shows the previous value and Retry saves the change."
    evidence: test
    command: "yarn web:e2e e2e/demo/settings.spec.ts"
  - id: C7
    statement: "Every settings key renders at 390, 834 and 1440, light and dark, reduced motion, matching its captures, with reset judged against the delete-dialog confirm frame."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-011-settings/evidence/states.png"
  - id: C8
    statement: "With keyboard alone at 390 a person changes each control and resets the data."
    evidence: manual
    reason: "A keyboard journey at phone width is judged by a person at Seen."
---

# Contract — DEMO-11 settings

## Build notes

- **Approach:** `settings/page.tsx` (server) reads the key and the prefs cookie and passes them to a client view. `e2e/demo/settings.spec.ts` names tests by criterion id; its run output is the evidence for C1 to C6. At start, before `contract:init` freezes the criteria, re-point those criteria to `evidence: test` with `command: "yarn web:e2e e2e/demo/settings.spec.ts"` (Taylor, Tickets gate, 2026-10-08); the script exists by then (DEMO-6).
- **Decisions that apply:**
  - D-DEMO-3: "Onboarding completion is remembered client-side; no account."
  - D-DEMO-7: "Writes are fixture-local and reset on reload (keeps tickets below Q3)."
  - D-DEMO-13: "Settings "Reset demo data" confirm is key `reset`, built from the delete-dialog confirm artboards with its own words; first captured at build. Taylor."
  - D-DEMO-15: "One state keeps the same content and words at every width; where the captures differ, the 1440 wording and the same fixture rows win. Width changes layout only."
  - D-DEMO-16: "The build fixes capture drift; the canvas stays locked: skeletons copy each width's final layout, static labels as text; rows grow with wrapped text; a disabled control dims its label and helper; a pending button keeps its width; dark spacing and scrim match light; the 390 foot link is in every state; raw widths become tokens."
  - D-DEMO-23: "Settings `empty` holds (the canvas draws defaults with a note); offline words name everything that still works."
  - D-DEMO-28 (technical.md): prefs in one first-party cookie the client writes; theme stays with `next-themes`.
- **Interfaces:** `/demo/settings?state=`; registry entry `settings` (keys `saved`, `empty`, `loading`, `error`, `partial`, `offline`, `reset`).
- **Per path:** `page.tsx` the server read; `_components/**` the three groups and the reset confirm wiring; `surfaces/settings.ts`; the e2e spec.
- **Gotchas:**
  - Design: Paper `https://app.paper.design/file/01M4EMRAAHDKDE6S693E3N478D/p-1-0`, page `p-1-0`; captures `specs/web/epics/DEMO-records-demo/ux/demo/captures/settings/`; `reset` has no artboard and is first captured here, against `captures/delete-dialog/confirm-*`. Fix drift in code, never on the canvas.
  - From `md` up the 1440 layout applies (834 takes it). No `Date.now()` or random values in render. A designed `error` never throws. Root carries `data-demo-state`.
  - Theme's toast reads "Dark is on." from the chosen value; System reads its own line, so keep the words table-driven.
  - C2 and C4 end on DEMO-8's table; if it is not built when you prove, record them once it is.
- **Model:** minimum Sonnet 5.5 at medium, recommended Opus 5.5 at medium. Choosing down tends to keep a second theme state beside `next-themes`, so the shell toggle and this group disagree.
