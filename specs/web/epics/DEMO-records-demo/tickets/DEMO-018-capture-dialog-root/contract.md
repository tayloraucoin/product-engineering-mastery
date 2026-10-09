---
size: small
objective: "yarn web:capture --surface delete-dialog renders every key: the render check reads the dialog's own data-demo-state, not the detail page's root behind it."
slice_type: "A test-harness fix; the risk is a check loosened until it passes a key that did not render."
non_negotiables:
  - "The check stays strict: a key whose own surface root does not carry data-demo-state equal to the key still fails, naming surface and key (DEMO-6)."
  - "No per-surface special case in capture.capture.ts beyond what DemoSurface declares; if a surface needs a root selector, DemoSurface gains it and every surface states its own."
devs_call: "Whether the root is found by a DemoSurface field or a dialog-first rule, and the test fixture."
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
  - DEMO-6
  - DEMO-12
out_of_scope:
  - "Capturing the default view (no ?state=): its own follow-up if wanted."
criteria:
  - id: C1
    statement: "yarn web:capture --surface delete-dialog passes all 24 captures (4 keys, 3 widths, 2 themes)."
    evidence: capture
    path: "evidence/capture-delete-dialog.txt"
  - id: C2
    statement: "A delete-dialog key whose dialog root carries the wrong data-demo-state still fails the run, naming surface and key."
    evidence: test
    command: "yarn workspace web test"
id: DEMO-18
---

# Contract — capture reads the dialog's own root

## Build notes

- **Found by:** DEMO-13, 2026-10-08. On a production build at `69332ec`, `yarn web:capture --surface delete-dialog` failed 18 of 24: `delete-dialog ?state=deleting: root data-demo-state is "default", not "deleting"` (and `error`, `offline`). `capture.capture.ts` reads `page.locator("[data-demo-state]").first()`, which is record detail's page root (`default`); the dialog's own root (`confirm-dialog.tsx`, `data-demo-state={demoState}`) comes second. `partial` passed only because detail also has a `partial` key.
- **Blocks:** DEMO-16 (the CI job) and DEMO-17 (the full critic run) on this surface.
