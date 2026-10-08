---
id: MIG-15
size: small
objective: "When verify:fast passes, the stop gate's message to the person names the steps verify:fast did not run, so a stop never reads as fully checked when it was not."
slice_type: "A hook (tooling/hooks/stop-gate.ts); the risk is a green stop over lint and type steps that never ran, which MIG-1 names only in verify:fast's own output."
non_negotiables:
  - "On a pass, the systemMessage carries verify:fast's `not run:` lines, or their count and the first, within MESSAGE_LIMIT; the verdict and the context clause are never cut for them."
  - "The block path and the loop guard are unchanged; at starter, where nothing is not run, the message is unchanged."
devs_call: "Whole lines or a count, and where in the message they go."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/technical/overlay.md"
truth_files: "none: repo tooling; no living UX file changes"
qa: Q2
reviewers:
  - mason
focus: []
operator_review: false
planned_paths:
  - "tooling/hooks/stop-gate.ts"
  - "tooling/hooks/fixtures/stop-gate.json"
  - "tooling/overlay.test.ts"
  - "specs/_shared/epics/MIG-codebase-migration/technical/overlay.md"
depends_on:
  - MIG-1
out_of_scope:
  - "verify-fast.ts's own output (MIG-1)."
criteria:
  - id: C1
    statement: "A fixture case with verifyExit 0 and verifyOutput holding two not-run lines shows them in the systemMessage; the existing cases pass unchanged."
    evidence: check
    command: "yarn test:hooks"
  - id: C2
    statement: "On the single-app repo, the stop gate's own reply after a clean edit names the steps verify:fast did not run."
    evidence: test
    command: "yarn test:tooling"
  - id: C3
    statement: "A fixture case whose verifyOutput holds twenty not-run lines keeps the verdict and the context clause whole within MESSAGE_LIMIT; the not-run lines are what gets cut."
    evidence: check
    command: "yarn test:hooks"
---

# Contract — MIG-15 stop-gate-names-not-run

## Build notes

- **Approach:** from MIG-1's mason review (round 1 finding 3, repeated in round 2). On `verify.status === 0` the gate drops verify:fast's output. Pull the `^not run:` lines from it and add them to the pass message before the status line, trimming the status first, as `message()` already does. Overlay.md's `stop-gate.ts` row ("No change") gains this one change; amend it in the same commit.
- **Per path:** `tooling/hooks/stop-gate.ts`; one case in `tooling/hooks/fixtures/stop-gate.json`; tighten MIG-1's C3 case in `tooling/overlay.test.ts` to assert on the gate's reply.
