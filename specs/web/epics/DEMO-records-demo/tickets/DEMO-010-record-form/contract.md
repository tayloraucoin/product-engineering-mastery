---
id: DEMO-10
size: small
objective: "An evaluator creates or edits a record in a validated form that never loses input, saves once however often Save is pressed, and is asked before leaving with unsaved changes."
slice_type: "A form with validation, a pending save and a leave guard; the risk is lost input, a double save, an error a screen reader never reaches, or a guard that misses one way out."
non_negotiables:
  - "Kit field with label for every control; Vendor name, Owner and Annual value (whole, 0 or more) required; Renewal date (composed date-picker, an IsoDate string) and Terms (one clause per line) optional; new defaults Status Draft."
  - 'Validation runs on submit first, then live on a field once it has erred; a failed submit moves focus to the summary (role="alert", tabindex="-1") whose named fields link to their controls; errors are aria-describedby with aria-invalid; no shake (A-13).'
  - "Submitting: the form is aria-busy, fields read-only and dimmed, Cancel disabled, Save aria-disabled with spinner at its own width, and a second press does nothing."
  - "Leaving with changes in-app (Cancel, back link, nav) opens the dirty dialog on DEMO-5's confirm layout: focus starts on Keep editing, Escape keeps editing, Discard change is solid destructive; reload and close use beforeunload."
  - "A valid save dispatches DEMO-1's create or update and opens the detail with ?state=saved; changed terms add a version, unchanged terms do not."
  - 'partial disables Owner and Status ("Not loaded") and Save; offline keeps fields editable and disables Save; both describe Save by the notice.'
  - "The h1 names the record from the index (D-DEMO-20); words are record-form.md's Words verbatim at both widths."
devs_call: "The form's component split, whether validation runs through a schema or plain functions in record-input.ts, and how the leave guard hooks client navigation."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/record-form.md"
  - "D-DEMO-7"
  - "D-DEMO-10"
  - "D-DEMO-20"
  - "D-DEMO-21"
  - "C-DEMO-record-form-1"
  - "C-DEMO-record-form-2"
  - "C-DEMO-record-form-3"
  - "C-DEMO-record-form-4"
  - "C-DEMO-record-form-5"
  - "C-DEMO-record-form-6"
  - "C-DEMO-record-form-7"
  - "C-DEMO-record-form-8"
truth_files: "none: the approved proposal ux/demo/record-form.md reaches specs/web/ux/demo/record-form.md through yarn truth:promote DEMO once its citing tickets close"
qa: Q2
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "apps/web/app/demo/(shell)/records/new/page.tsx"
  - "apps/web/app/demo/(shell)/records/[id]/edit/page.tsx"
  - "apps/web/app/demo/(shell)/records/_components/form/**"
  - "apps/web/app/demo/(shell)/records/_lib/record-input.ts"
  - "apps/web/app/demo/(shell)/records/_lib/record-input.test.ts"
  - "apps/web/lib/demo/surfaces/record-form.ts"
  - "apps/web/e2e/demo/record-form.spec.ts"
depends_on:
  - DEMO-4
  - DEMO-5
  - DEMO-6
out_of_scope:
  - "The detail page that shows saved: DEMO-9. Real persistence and offline detection: out of bounds (D-DEMO-7)."
criteria:
  - id: C1
    statement: 'record-input.ts rejects each missing required field with its words, accepts 0 and refuses -1 and 1.5, and builds "2 fields need a change before saving", "Vendor name and Annual value." and "You changed 2 fields."'
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "Save on an empty new form focuses the summary, shows three field errors, and keeps everything typed."
    evidence: test
    command: "yarn web:e2e e2e/demo/record-form.spec.ts"
  - id: C3
    statement: "Correcting an erred field clears its error without another submit."
    evidence: test
    command: "yarn web:e2e e2e/demo/record-form.spec.ts"
  - id: C4
    statement: "Pressing Save twice quickly makes one save."
    evidence: test
    command: "yarn web:e2e e2e/demo/record-form.spec.ts"
  - id: C5
    statement: "A valid save opens the record's detail with ?state=saved; changed terms add a version and unchanged terms do not."
    evidence: test
    command: "yarn web:e2e e2e/demo/record-form.spec.ts"
  - id: C6
    statement: "Leaving with changes opens the dialog with focus on Keep editing; Keep editing returns to the form and Discard change leaves."
    evidence: test
    command: "yarn web:e2e e2e/demo/record-form.spec.ts"
  - id: C7
    statement: "On partial and offline Save is disabled and described by the notice, and offline input stays editable."
    evidence: test
    command: "yarn web:e2e e2e/demo/record-form.spec.ts"
  - id: C8
    statement: "Every record-form key renders at 390, 834 and 1440, light and dark, reduced motion, matching its captures."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-010-record-form/evidence/states.png"
  - id: C9
    statement: "With keyboard alone at 390 a person fills the form, fixes an error and saves."
    evidence: manual
    reason: "A keyboard journey at phone width is judged by a person at Seen."
---

# Contract — DEMO-10 record-form

## Build notes

- **Approach:** `new/page.tsx` and `[id]/edit/page.tsx` (server) resolve the key and id and render one client form. Pure rules and built words live in `_lib/record-input.ts`. Writes resolve on the next tick, so the pending UI renders. `e2e/demo/record-form.spec.ts` names tests by criterion id; its run output is the evidence for C2 to C7. At start, before `contract:init` freezes the criteria, re-point those criteria to `evidence: test` with `command: "yarn web:e2e e2e/demo/record-form.spec.ts"` (Taylor, Tickets gate, 2026-10-08); the script exists by then (DEMO-6).
- **Decisions that apply:**
  - D-DEMO-7: "Writes are fixture-local and reset on reload (keeps tickets below Q3)."
  - D-DEMO-10: "A live dialog's destructive confirm is solid (P-2); page triggers keep the tint."
  - D-DEMO-15: "One state keeps the same content and words at every width; where the captures differ, the 1440 wording and the same fixture rows win. Width changes layout only."
  - D-DEMO-16: "The build fixes capture drift; the canvas stays locked: skeletons copy each width's final layout, static labels as text; rows grow with wrapped text; a disabled control dims its label and helper; a pending button keeps its width; dark spacing and scrim match light; the 390 foot link is in every state; raw widths become tokens."
  - D-DEMO-20: "A record's name comes from the records index; only the body loads, so a loading or failed record can be named."
  - D-DEMO-21: "The primary is first in DOM and focus order; at 1440 the row is reversed and right-aligned (primary outermost), at 390 stacked on top."
- **Interfaces:** `/demo/records/new`, `/demo/records/<id>/edit`, each `?state=`; `validateRecordInput`, `summaryWords`, `dirtyWords`; registry entry `record-form` (keys `invalid`, `submitting`, `empty`, `loading`, `error`, `partial`, `offline`, `dirty`; edit sample path Halvorsen).
- **Per path:** both pages; `_components/form/**` fields, summary, actions, dirty dialog; `record-input.ts` and its test (C1); `surfaces/record-form.ts`; the e2e spec.
- **Gotchas:**
  - Design: Paper `https://app.paper.design/file/01M4EMRAAHDKDE6S693E3N478D/p-1-0`, page `p-1-0`; captures `specs/web/epics/DEMO-records-demo/ux/demo/captures/record-form/`. Fix drift in code, never on the canvas.
  - From `md` up the 1440 layout applies (834 takes it). No `Date.now()` or random values in render; a new record's id comes from the store at save time, never from render. A designed `error` never throws. Root carries `data-demo-state`.
  - Annual value has no placeholder (D-DEMO-25: the canvas's muted "0" read as a value). Terms are saved as trimmed lines, empty lines dropped.
  - C5's journey ends on DEMO-9's page; if it is not built when you prove, record C5 once it is.
- **Model:** minimum Sonnet 5.5 at medium, recommended Opus 5.5 at medium. Choosing down tends to validate live from the first keystroke, guard only the Cancel button, or let a quick second press save twice.
