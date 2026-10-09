---
id: DEMO-12
size: small
objective: "An evaluator deletes a record from its detail page only after a confirm that names the record and what is lost, and a slow, failed or offline delete never loses or half-deletes it."
slice_type: "A destructive confirm over a URL-held dialog; the risk is a focus that escapes, a second press that deletes twice, Escape during the delete, or an error that leaves the record changed."
non_negotiables:
  - 'The dialog is ?dialog=delete on detail (D-DEMO-4) on DEMO-5''s confirm layout: role="alertdialog" labelled by the title and described by the body; opening pushes history, closing replaces.'
  - "Focus is trapped, starts on Cancel and returns to Delete on close; Escape and the scrim cancel, except while deleting."
  - "Delete record is solid destructive (P-2, D-DEMO-10), primary first in DOM and outermost at 1440 (D-DEMO-21); deleting holds both actions aria-disabled, keeps focus on the confirm, and ignores a second press."
  - "Delete record dispatches DEMO-1's delete and goes to /demo/records?state=deleted, whose toast names the record."
  - "With ?dialog=delete the state key moves to the dialog: deleting, error, partial and offline; detail behind renders populated, except partial, which renders detail's partial too (D-DEMO-18); error then Retry delete actually deletes."
  - 'Notices are an icon and a text line, never a bordered alert (D-DEMO-17); the error line is role="alert"; offline Delete record is aria-disabled and described by its line.'
  - 'The title names the record from the index (D-DEMO-20) and the body reads "all 4 versions" or "its only version"; words are delete-dialog.md''s Words verbatim.'
devs_call: "How the page passes the state key to the dialog, and the dialog's file split."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/delete-dialog.md"
  - "D-DEMO-4"
  - "D-DEMO-10"
  - "D-DEMO-16"
  - "D-DEMO-17"
  - "D-DEMO-18"
  - "D-DEMO-20"
  - "D-DEMO-21"
  - "C-DEMO-delete-dialog-1"
  - "C-DEMO-delete-dialog-2"
  - "C-DEMO-delete-dialog-3"
  - "C-DEMO-delete-dialog-4"
  - "C-DEMO-delete-dialog-5"
  - "C-DEMO-delete-dialog-6"
  - "C-DEMO-delete-dialog-7"
  - "C-DEMO-delete-dialog-8"
  - "C-DEMO-delete-dialog-9"
truth_files: "none: the approved proposal ux/demo/delete-dialog.md reaches specs/web/ux/demo/delete-dialog.md through yarn truth:promote DEMO once its citing tickets close"
qa: Q2
reviewers:
  - assay
focus:
  - "The deleting state: a second press, Escape and the scrim do nothing, and error leaves the record unchanged (assay, Q2)"
operator_review: false
planned_paths:
  - "apps/web/app/demo/(shell)/records/[id]/_components/delete-dialog.tsx"
  - "apps/web/app/demo/(shell)/records/[id]/page.tsx"
  - "apps/web/lib/demo/surfaces/delete-dialog.ts"
  - "apps/web/e2e/demo/delete-dialog.spec.ts"
depends_on:
  - DEMO-5
  - DEMO-6
  - DEMO-9
out_of_scope:
  - "The detail page itself: DEMO-9. The table's deleted state: DEMO-8. Undo: decided against (a dialog, not undo)."
criteria:
  - id: C1
    statement: "Delete on detail sets ?dialog=delete, focus is on Cancel, and Tab stays inside the dialog."
    evidence: test
    command: "yarn web:e2e e2e/demo/delete-dialog.spec.ts"
  - id: C2
    statement: "Cancel, Escape or the scrim closes it, the record is unchanged, and focus is on Delete."
    evidence: test
    command: "yarn web:e2e e2e/demo/delete-dialog.spec.ts"
  - id: C3
    statement: "Delete record opens /demo/records?state=deleted and the toast names the record."
    evidence: test
    command: "yarn web:e2e e2e/demo/delete-dialog.spec.ts"
  - id: C4
    statement: "On deleting a second press and Escape do nothing."
    evidence: test
    command: "yarn web:e2e e2e/demo/delete-dialog.spec.ts"
  - id: C5
    statement: "On offline Delete record is disabled and described by its line, and Cancel closes."
    evidence: test
    command: "yarn web:e2e e2e/demo/delete-dialog.spec.ts"
  - id: C6
    statement: "On error the record is unchanged, and Retry delete deletes it."
    evidence: test
    command: "yarn web:e2e e2e/demo/delete-dialog.spec.ts"
  - id: C7
    statement: 'The confirm for Halvorsen Freight reads "Delete Halvorsen Freight?" and its body says "all 4 versions".'
    evidence: test
    command: "yarn web:e2e e2e/demo/delete-dialog.spec.ts"
  - id: C8
    statement: "Every delete-dialog key renders at 390, 834 and 1440, light and dark, reduced motion, matching its captures."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-012-delete-dialog/evidence/states.png"
  - id: C9
    statement: "With keyboard alone at 390 a person opens the dialog, cancels, reopens and deletes."
    evidence: manual
    reason: "A keyboard journey at phone width is judged by a person at Seen."
---

# Contract — DEMO-12 delete-dialog

## Build notes

- **Approach:** `delete-dialog.tsx` composes DEMO-5's `ConfirmDialog` with this surface's words and the store's delete. Mount it through the seam DEMO-9 left in `[id]/page.tsx`; that one mount is this ticket's only edit there. `e2e/demo/delete-dialog.spec.ts` names tests by criterion id; its run output is the evidence for C1 to C7. At start, before `contract:init` freezes the criteria, re-point those criteria to `evidence: test` with `command: "yarn web:e2e e2e/demo/delete-dialog.spec.ts"` (Taylor, Tickets gate, 2026-10-08); the script exists by then (DEMO-6).
- **Decisions that apply:**
  - D-DEMO-4: "The delete dialog is `?dialog=delete` on detail. (C-P08)"
  - D-DEMO-10: "A live dialog's destructive confirm is solid (P-2); page triggers keep the tint."
  - D-DEMO-15: "One state keeps the same content and words at every width; where the captures differ, the 1440 wording and the same fixture rows win. Width changes layout only."
  - D-DEMO-16: "The build fixes capture drift; the canvas stays locked: skeletons copy each width's final layout, static labels as text; rows grow with wrapped text; a disabled control dims its label and helper; a pending button keeps its width; dark spacing and scrim match light; the 390 foot link is in every state; raw widths become tokens."
  - D-DEMO-17: "A notice inside a dialog is an icon and a text line, never a bordered alert. (A-10)"
  - D-DEMO-18: "Delete-dialog `partial` sits over detail `partial` (terms not loaded), and its words say so."
  - D-DEMO-20: "A record's name comes from the records index; only the body loads, so a loading or failed record can be named."
  - D-DEMO-21: "The primary is first in DOM and focus order; at 1440 the row is reversed and right-aligned (primary outermost), at 390 stacked on top."
- **Interfaces:** `/demo/records/<id>?dialog=delete&state=`; registry entry `delete-dialog` (keys `deleting`, `error`, `partial`, `offline`; no `empty` or `loading`; sample path Halvorsen with `?dialog=delete`).
- **Per path:** `delete-dialog.tsx`; `[id]/page.tsx` the mount; `surfaces/delete-dialog.ts`; the e2e spec.
- **Gotchas:**
  - Design: Paper `https://app.paper.design/file/01M4EMRAAHDKDE6S693E3N478D/p-1-0`, page `p-1-0`; captures `specs/web/epics/DEMO-records-demo/ux/demo/captures/delete-dialog/`. Fix drift in code, never on the canvas.
  - From `md` up the 1440 layout applies (834 takes it). A designed `error` never throws. The dialog root carries `data-demo-state`.
  - A forced key sets the first render only: after `error`, Retry delete runs the real delete and replaces the URL without `state`.
  - Motion: opacity only, 250ms in, 200ms out on motion tokens; instant on keyboard open or reduced motion.
- **Model:** minimum Sonnet 5.5 at medium, recommended Opus 5.5 at medium. Choosing down tends to let Escape close a pending delete, or to delete before the pending state renders, so `deleting` is never seen.
