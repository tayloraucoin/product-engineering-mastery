---
id: DEMO-9
size: small
objective: "An evaluator opens a record, reads its fields and current terms, compares the current version with the one before in an inline diff, scans every version in its history, and moves on to edit or delete it."
slice_type: "A read surface with a URL-held view toggle and an off-kit diff; the risk is a diff read as colour alone, a disabled compare nobody can explain, or an unknown id that errors instead of saying not found."
non_negotiables:
  - 'One --container-3xl column: back (1440 breadcrumb "Records › <name>" in a nav named "Breadcrumb"; 390 back link), h1 name with the status badge, Edit then Delete in D-DEMO-21 order, the four fields, Terms, History.'
  - 'Terms has the toggle-group "Terms view" (Current / Compare); Compare sets ?view=compare with router.replace, and ?state=diff renders the same view; the compare uses DEMO-5''s Diff, version n against n-1, then the summary.'
  - "History lists every version newest first (D-DEMO-19); Halvorsen shows versions 4 to 1 with record-detail.md's words."
  - "The record's name always comes from the records index, so loading, error and partial still name it (D-DEMO-20); an unknown id renders not-found in the shell with a 200."
  - "Disabled Compare, Edit and Delete use aria-disabled and are described by the subtitle or the notice; saved shows the store's lastEvent (else Halvorsen at 52,000 USD), a toast and focus on the h1."
  - "Edit links to /demo/records/<id>/edit; Delete pushes ?dialog=delete onto history and is the ref focus returns to."
  - "Words are record-detail.md's Words verbatim at both widths."
devs_call: "The component split under [id]/_components/, the fields grid, and how the view param and the state key are combined."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/record-detail.md"
  - "D-DEMO-19"
  - "D-DEMO-20"
  - "D-DEMO-21"
  - "C-DEMO-record-detail-1"
  - "C-DEMO-record-detail-2"
  - "C-DEMO-record-detail-3"
  - "C-DEMO-record-detail-4"
  - "C-DEMO-record-detail-5"
  - "C-DEMO-record-detail-6"
  - "C-DEMO-record-detail-7"
  - "C-DEMO-record-detail-8"
truth_files: "none: the approved proposal ux/demo/record-detail.md reaches specs/web/ux/demo/record-detail.md through yarn truth:promote DEMO once its citing tickets close"
qa: Q2
reviewers:
  - assay
focus:
  - "The compare view: del and ins rows read correctly, and Compare disabled is always described (assay, Q2)"
operator_review: false
planned_paths:
  - "apps/web/app/demo/(shell)/records/[id]/page.tsx"
  - "apps/web/app/demo/(shell)/records/[id]/_components/**"
  - "apps/web/lib/demo/surfaces/record-detail.ts"
  - "apps/web/e2e/demo/record-detail.spec.ts"
depends_on:
  - DEMO-4
  - DEMO-5
  - DEMO-6
out_of_scope:
  - "The delete dialog and its mount on this page: DEMO-12. The edit form: DEMO-10."
  - "Word-level marks inside a clause (P-4): out of bounds in this epic."
criteria:
  - id: C1
    statement: 'Compare shows version 4 against 3 with "2 clauses changed, 1 added", sets ?view=compare, and Current returns to the document.'
    evidence: test
    command: "yarn web:e2e e2e/demo/record-detail.spec.ts"
  - id: C2
    statement: 'Diff rows are del and ins elements with "Removed:" and "Added:" in their accessible names and aria-hidden glyphs.'
    evidence: test
    command: "yarn web:e2e e2e/demo/record-detail.spec.ts"
  - id: C3
    statement: "On no-history and partial Compare is aria-disabled and described by the subtitle."
    evidence: test
    command: "yarn web:e2e e2e/demo/record-detail.spec.ts"
  - id: C4
    statement: "Halvorsen Freight's history lists Version 4, 3, 2, 1 in that order with their summaries."
    evidence: test
    command: "yarn web:e2e e2e/demo/record-detail.spec.ts"
  - id: C5
    statement: "On offline Edit and Delete are aria-disabled and described by the notice."
    evidence: test
    command: "yarn web:e2e e2e/demo/record-detail.spec.ts"
  - id: C6
    statement: "Edit opens the edit route, Delete sets ?dialog=delete as a new history entry, and an unknown id renders not-found with a 200."
    evidence: test
    command: "yarn web:e2e e2e/demo/record-detail.spec.ts"
  - id: C7
    statement: "Every record-detail key renders at 390, 834 and 1440, light and dark, reduced motion, matching its captures."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-009-record-detail/evidence/states.png"
  - id: C8
    statement: "With keyboard alone at 390 a person uses Compare, Current, Edit and Delete and cancels."
    evidence: manual
    reason: "A keyboard journey at phone width is judged by a person at Seen; cancel needs DEMO-12's dialog."
---

# Contract — DEMO-9 record-detail

## Build notes

- **Approach:** `[id]/page.tsx` (server) resolves the key, `?view=` and the id against the fixture index, and passes props to a client view that reads the store (a session-made id exists only there, so the client falls back to not-found when neither has it). `e2e/demo/record-detail.spec.ts` names tests by criterion id; its run output is the evidence for C1 to C6. At start, before `contract:init` freezes the criteria, re-point those criteria to `evidence: test` with `command: "yarn web:e2e e2e/demo/record-detail.spec.ts"` (Taylor, Tickets gate, 2026-10-08); the script exists by then (DEMO-6).
- **Decisions that apply:**
  - D-DEMO-15: "One state keeps the same content and words at every width; where the captures differ, the 1440 wording and the same fixture rows win. Width changes layout only."
  - D-DEMO-16: "The build fixes capture drift; the canvas stays locked: skeletons copy each width's final layout, static labels as text; rows grow with wrapped text; a disabled control dims its label and helper; a pending button keeps its width; dark spacing and scrim match light; the 390 foot link is in every state; raw widths become tokens."
  - D-DEMO-19: "History lists every version, newest first; the Halvorsen Freight fixture has four."
  - D-DEMO-20: "A record's name comes from the records index; only the body loads, so a loading or failed record can be named."
  - D-DEMO-21: "The primary is first in DOM and focus order; at 1440 the row is reversed and right-aligned (primary outermost), at 390 stacked on top."
- **Interfaces:** `/demo/records/<id>?view=compare&state=`; registry entry `record-detail` (keys `diff`, `no-history`, `empty`, `loading`, `error`, `not-found`, `partial`, `offline`, `saved`; sample path Halvorsen); a `dialog` slot DEMO-12 fills.
- **Per path:** `page.tsx` the server read; `_components/**` title row, fields, terms, history, notices; `surfaces/record-detail.ts`; the e2e spec.
- **Gotchas:**
  - Design: Paper `https://app.paper.design/file/01M4EMRAAHDKDE6S693E3N478D/p-1-0`, page `p-1-0`; captures `specs/web/epics/DEMO-records-demo/ux/demo/captures/record-detail/`. Fix drift in code, never on the canvas.
  - From `md` up the 1440 layout applies (834 takes it). Fixed clock: "3 days ago by Ana Okafor" comes from `DEMO_TODAY`. A designed `error` never throws. Root carries `data-demo-state`.
  - Leave one clear seam for DEMO-12 (a `dialog` prop or child the page renders when `?dialog=delete`), so its thread adds a mount, not a rewrite.
- **Model:** minimum Sonnet 5.5 at medium, recommended Opus 5.5 at medium. Choosing down tends to throw on an unknown id or render the diff with colour only, both of which the critic marks Blocking.
