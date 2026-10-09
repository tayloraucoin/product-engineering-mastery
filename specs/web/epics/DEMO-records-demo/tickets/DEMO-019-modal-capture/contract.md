---
size: small
objective: "A capture of a key with a modal open shows what a person sees: the viewport under the scrim, never a full-page strip of undimmed content below a fixed overlay."
slice_type: "A capture-harness fix; the risk is clipping a non-modal key's content, or a check loose enough to pass a modal key that never opened."
non_negotiables:
  - "Only keys whose surface declares the modal open (a DemoSurface field, stated per surface) capture at viewport size; every other key stays fullPage."
  - "A modal key whose dialog is not open at capture time still fails, naming surface and key."
devs_call: "The DemoSurface field's name and shape, and whether the page behind also gets a real scroll lock (html scrolls today while body is overflow hidden)."
cites:
  - "specs/web/epics/DEMO-records-demo/tickets/DEMO-006-capture-harness/contract.md"
truth_files: "none: test tooling changes no living UX file"
qa: Q1
reviewers: []
operator_review: false
planned_paths:
  - "apps/web/e2e/capture.capture.ts"
  - "apps/web/e2e/lib/capture.ts"
  - "apps/web/e2e/lib/capture.test.ts"
  - "apps/web/lib/demo/surfaces/**"
depends_on:
  - DEMO-18
out_of_scope:
  - "The scrim itself or the kit's alert-dialog."
criteria:
  - id: C1
    statement: "record-form dirty, settings reset and every delete-dialog key capture at 390 × 900 with the scrim over the whole image, light and dark."
    evidence: capture
    path: "evidence/modal-captures.md"
  - id: C2
    statement: "A modal key whose dialog is closed fails the run, naming surface and key; non-modal keys stay fullPage."
    evidence: test
    command: "yarn workspace web test"
id: DEMO-19
---

# Contract — capture a modal key at viewport size

## Build notes

- **Found by:** DEMO-17 round 1, 2026-10-08. `capture.capture.ts` takes every key `fullPage: true`. At 390 a page under a modal is 1248px tall; the fixed scrim covers only the first 900px, so the strip below renders undimmed. The critic scored that as C-R03 Blocking on record-form `dirty` (a solid Save beside the solid destructive confirm) and C-R02 on delete-dialog `partial`. In a browser the fixed scrim covers the viewport at every scroll position (checked: the page scrolls 348px under the dialog, scrim still over it), so the capture shows something no person sees. Locking `html` overflow does not change the fullPage height (still 1248), so the fix is the harness, not the app.
- **Blocks:** DEMO-17's round 2 on record-form (C-R03) and delete-dialog's 390 captures.
