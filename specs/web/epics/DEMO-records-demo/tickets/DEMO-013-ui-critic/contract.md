---
id: DEMO-13
size: small
objective: "tk-ui-critic scores a rendered surface from its own captures against canon-rubric.md, fails what the rubric fails, passes what it passes, and can never pass a state it did not capture or edit what it scores."
slice_type: "A house skill and its calibration; the risk is a critic that passes on an incomplete capture set, drifts from the rubric, or edits the code it judges."
non_negotiables:
  - "Procedure only: the rubric is docs/design/canon-rubric.md with canon §2 (CF-20, record 0009) plus the product's design layer; at most 3 calibration exemplars in context."
  - "Frontmatter: context: fork, disable-model-invocation: true, allowed-tools Read Grep Glob and Bash(yarn web:capture *), disallowed-tools Edit Write WebFetch; no hook and no settings change (R5)."
  - "Its input is yarn web:capture's set for the named surface (every DEMO_SURFACES key, 390, 834, 1440, light, dark, reduced motion) plus the brief and package; never a builder's summary."
  - "A key with no capture is UNVERIFIED and the round verdict cannot be PASS; a finding without a region or file:line is withdrawn (C-R01)."
  - "Output as the rubric's procedure sets it: top 3, each line PASS / N issues / N/A / UNVERIFIED, findings with rule IDs and severity, a round verdict line a script can read; at most 3 rounds."
  - "Calibration: three pass and three fail exemplars from the demo, each annotated by rubric line, kept under the skill's calibration/; a fail exemplar plants one defect in a throwaway build, never in shipped code."
  - "The model it was calibrated on is pinned in SKILL.md, and REGISTRY.md's row is complete."
devs_call: "The SKILL.md wording within its limits, which states become exemplars, the planted defects, and the review file's exact layout."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/overview.md"
  - "D-DEMO-15"
  - "D-DEMO-16"
  - "P-5"
truth_files: "none: a skill changes no living UX file"
qa: Q2
reviewers:
  - vigil
focus:
  - "The calibration: it fails all three fail exemplars and passes all three pass exemplars, and it can never pass a state it did not capture (vigil, Q2)"
operator_review: false
planned_paths:
  - ".claude/skills/tk-ui-critic/**"
  - ".claude/skills/REGISTRY.md"
depends_on:
  - DEMO-6
  - DEMO-7
  - DEMO-8
  - DEMO-9
  - DEMO-10
  - DEMO-11
  - DEMO-12
out_of_scope:
  - "The CI job and its verdict parser: DEMO-16. The full run and its fixes: DEMO-17."
  - "tk-ui-code-lint and shadcn: not in this epic; the critic notes the code-lint line as UNVERIFIED until it exists."
criteria:
  - id: C1
    statement: "Each of the three fail exemplars gets a FAIL verdict with a Blocking finding on the rubric line its defect was planted against."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-013-ui-critic/evidence/calibration-fail.md"
  - id: C2
    statement: "Each of the three pass exemplars gets a PASS verdict with no Blocking finding."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-013-ui-critic/evidence/calibration-pass.md"
  - id: C3
    statement: "A pass exemplar's set with one capture removed marks that state UNVERIFIED and its verdict is not PASS."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-013-ui-critic/evidence/missing-capture.md"
  - id: C4
    statement: "After a full run on the records table, git status shows no change outside apps/web/.captures/ and the review output."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-013-ui-critic/evidence/hands-off.txt"
  - id: C5
    statement: "tests/triggers.md holds five prompts that must invoke it and five that must not, each with its observed result."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-013-ui-critic/evidence/triggers.md"
  - id: C6
    statement: "The skill listing and body costs fit the index budget."
    evidence: check
    command: "yarn budget"
---

# Contract — DEMO-13 ui-critic

## Build notes

- **Approach:** Write `SKILL.md` (procedure, input, output, round cap, hands-off line), `tests/triggers.md`, and `calibration/` (six annotated exemplars). Capture with `yarn web:capture --surface <id>`; read the PNGs; score line by line; write the review. Then run C1 to C4 in a fresh context each, never this thread's.
- **Decisions that apply:**
  - D-DEMO-15: "One state keeps the same content and words at every width; where the captures differ, the 1440 wording and the same fixture rows win. Width changes layout only."
  - D-DEMO-16: "The build fixes capture drift; the canvas stays locked: skeletons copy each width's final layout, static labels as text; rows grow with wrapped text; a disabled control dims its label and helper; a pending button keeps its width; dark spacing and scrim match light; the 390 foot link is in every state; raw widths become tokens."
  - P-5: "A rubric line: one state keeps the same content and words across breakpoints (D-DEMO-15)." Ruled by Taylor at the Tickets gate, 2026-10-08: the line lives in `apps/web/docs/design/` (a product may tighten), not in `canon-rubric.md`; the critic applies it.
  - R4 and R5 (technical.md, ratified by Taylor at the Tickets gate, 2026-10-08): the model is the one calibrated on, pinned in the skill; the hands-off guard is `allowed-tools`, not a hook.
- **The Shift Nudge checklist, distilled (A11).** Lines the rubric does not already state, each scored under the existing line named, never as a new line: an interactive element that does not look interactive (C-R05); near-identical greys beyond the token set (C-R09); pure black or white surfaces in dark that are not tokens (C-R09); more than one radius or icon style per screen (C-R07); inputs whose default, hover, focus, disabled and error look alike, or required and optional fields that cannot be told apart (C-R10, C-R05); a 390 view that only shrinks the 1440 one instead of prioritising (C-R02); and, from screenshots alone, name the states, interactions and responsive behaviour that cannot be confirmed (C-R01).
- **Interfaces:** `/tk-ui-critic <surface>`; the review file `apps/web/.captures/<surface>/review-round-<n>.md` with a `Verdict: PASS | FAIL` line DEMO-16 parses.
- **Per path:** `.claude/skills/tk-ui-critic/**` the skill, triggers and calibration; `REGISTRY.md` its row.
- **Gotchas:**
  - `.claude/skills/` is sandbox-protected: each write prompts Taylor. Plan for the prompts; never route around them.
  - `skills.md`'s trigger row says Bash is limited to `yarn playwright`; the harness script is `yarn web:capture` (placement.md), so allow that.
  - Calibration exemplars are images; keep them small and out of the skill body's loaded text.
- **Model:** minimum Sonnet 5.5 at medium, recommended Opus 5.5 at medium. Choosing down tends to write a critic that grades the screenshots it has and stays silent on the ones it lacks, which is the one failure this ticket exists to prevent.
