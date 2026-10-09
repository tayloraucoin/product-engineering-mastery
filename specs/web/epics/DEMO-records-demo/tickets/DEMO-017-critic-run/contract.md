---
id: DEMO-17
size: small
objective: "The critic runs against every demo surface, its findings are fixed by hand, a second round shows them gone, and the three diverge directions are shown, so Taylor can judge whether PEM v1 holds on a real product."
slice_type: "A run-and-fix pass across six built surfaces; the risk is fixing what the critic did not ask for, re-scoring from memory instead of fresh captures, or a second round that quietly passes a state it skipped."
non_negotiables:
  - "Round 1: yarn web:capture then /tk-ui-critic on each of the six surfaces, each in a fresh forked context; every review file is kept as evidence."
  - "Fixes address round-1 findings only, Blocking and Red first, each in the owning surface's files, and never edit the Paper canvas (D-DEMO-16)."
  - "Round 2 re-captures from scratch and re-runs the critic on every surface; no surface is carried over from round 1."
  - "No round-2 verdict is PASS while any key is UNVERIFIED; at most 3 rounds (canon-rubric)."
  - "Findings not fixed become drafted follow-ups in the close report, never silent fixes."
  - "DEMO-14's three records-table directions are shown beside the round reviews."
devs_call: "The fix order, how to batch fixes per surface, and whether a third round is worth running."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/overview.md"
  - "D-DEMO-15"
  - "D-DEMO-16"
truth_files: "none: fixes bring the build to the approved UX files, which do not change"
qa: Q2
reviewers:
  - vigil
focus:
  - "Round 2 against round 1: every Blocking finding is gone on fresh captures and no state is passed uncaptured (vigil, Q2)"
operator_review: false
planned_paths:
  - "apps/web/app/demo/**"
  - "apps/web/lib/demo/**"
depends_on:
  - DEMO-13
  - DEMO-14
  - DEMO-15
out_of_scope:
  - "Changing the critic, its calibration or the rubric: DEMO-13 or a practice amendment. CI: DEMO-16."
criteria:
  - id: C1
    statement: "Round 1 holds a review for each of the six surfaces, every key captured at 390, 834 and 1440, light and dark."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-017-critic-run/evidence/round-1.md"
  - id: C2
    statement: "Round 2, on fresh captures, has no Blocking finding and no UNVERIFIED key on any surface."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-017-critic-run/evidence/round-2.md"
  - id: C3
    statement: "Every round-1 finding is listed as fixed, with its file, or as a drafted follow-up with its reason."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-017-critic-run/evidence/findings.md"
  - id: C4
    statement: "The surfaces' unit tests still pass after the fixes."
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "The token lint passes after the fixes."
    evidence: check
    command: "yarn lint"
---

# Contract — DEMO-17 critic-run

## Build notes

- **Approach:** P-C part 5. Capture all, run the critic per surface (forked), collect findings into one table, fix by surface, re-capture, run round 2, write `findings.md`. Then link DEMO-14's directions. Re-run each touched surface's e2e spec after its fixes.
- **Decisions that apply:**
  - D-DEMO-15: "One state keeps the same content and words at every width; where the captures differ, the 1440 wording and the same fixture rows win. Width changes layout only."
  - D-DEMO-16: "The build fixes capture drift; the canvas stays locked: skeletons copy each width's final layout, static labels as text; rows grow with wrapped text; a disabled control dims its label and helper; a pending button keeps its width; dark spacing and scrim match light; the 390 foot link is in every state; raw widths become tokens."
  - R0 (technical.md, ratified by Taylor at the Tickets gate, 2026-10-08): if the build waves pass two hours, stop and ask whether parts 4 and 5 move to a follow-up epic. This ticket is part 5: check the clock before starting.
- **Interfaces:** none new.
- **Per path:** `app/demo/**` and `lib/demo/**`, fixes only where a finding points.
- **Gotchas:**
  - Design: Paper `https://app.paper.design/file/01M4EMRAAHDKDE6S693E3N478D/p-1-0`, page `p-1-0`; captures under `specs/web/epics/DEMO-records-demo/ux/demo/captures/`. A finding that disagrees with a locked capture is a coverage gap for `apps/web/docs/design/coverage-gaps.md`, not a canvas edit.
  - Another ticket's files are fixed here only for a critic finding; their proofs stay theirs (a commit to a shared file reopens nothing).
  - Captures are git-ignored; the evidence files quote the review text and name the capture paths.
- **Model:** minimum Sonnet 5.5 at medium, recommended Opus 5.5 at medium. Choosing down tends to fix from the round-1 text without re-capturing, so round 2 grades screens it never saw.
