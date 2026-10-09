---
id: DEMO-14
size: small
objective: "tk-ui-diverge builds exactly three directions for one screen that differ on one named axis, each as an isolated route on tokens and @pem/ui only, so a person can compare real renders before converging."
slice_type: "A manual-only house skill; the risk is directions that differ on everything, invent off-system values, or leak into the shipped nav."
non_negotiables:
  - "Exactly three directions, one axis forced per direction (layout strategy by default), every other choice held to the current screen."
  - "Only tokens and @pem/ui; the token lint passes on every direction; no new palette, face or radius."
  - "Each direction is an isolated route at app/demo/diverge/<feature>/<direction>/, outside the demo's nav, capturable by yarn web:capture, and named so a run can delete or keep it."
  - "The layout step reads docs/references/README.md and at most 3 files it routes to (CF-31)."
  - "Frontmatter: disable-model-invocation: true, the minimum allowed-tools, disallowed-tools WebFetch; REGISTRY.md's row is complete."
devs_call: "How a direction is named, the axis list beyond layout, and the SKILL.md wording."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/overview.md"
  - "D-DEMO-8"
  - "D-DEMO-15"
truth_files: "none: a skill changes no living UX file"
qa: Q2
reviewers:
  - vigil
focus: []
operator_review: false
planned_paths:
  - ".claude/skills/tk-ui-diverge/**"
  - ".claude/skills/REGISTRY.md"
  - "apps/web/app/demo/diverge/**"
depends_on:
  - DEMO-3
  - DEMO-6
  - DEMO-8
out_of_scope:
  - "Choosing a direction and converging: the operator's, then shadcn and components.md. Showing the output in the run: DEMO-17."
criteria:
  - id: C1
    statement: "Run on the records table with the layout axis, it produces three routes that differ only in layout strategy and each renders at 390 and 1440, light and dark."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-014-ui-diverge/evidence/directions.png"
  - id: C2
    statement: "The token lint passes on the three directions."
    evidence: check
    command: "yarn lint"
  - id: C3
    statement: "tests/triggers.md holds five prompts that must invoke it and five that must not, each with its observed result."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-014-ui-diverge/evidence/triggers.md"
  - id: C4
    statement: "The skill listing and body costs fit the index budget."
    evidence: check
    command: "yarn budget"
---

# Contract — DEMO-14 ui-diverge

## Build notes

- **Approach:** Write `SKILL.md` from the `tk-ui-diverge` rows of `docs/design/skills.md` (the ruling and the trigger design), `tests/triggers.md`, then run it once on the records table with the layout axis as C1's proof. Keep the three routes for DEMO-17 to show.
- **Decisions that apply:**
  - D-DEMO-8: "Direction A: top bar, one centred column, inline diff, history below. Taylor." (the locked direction the three variants diverge from)
  - D-DEMO-15: "One state keeps the same content and words at every width; where the captures differ, the 1440 wording and the same fixture rows win. Width changes layout only."
  - skills.md trigger text: "Build exactly three Storybook stories or routes for `specs/<feature>/package.md` that differ on one named axis (layout strategy by default), using only tokens and `@pem/ui`. Manual only."
- **Interfaces:** `/tk-ui-diverge <feature> <axis>`; three routes named by direction.
- **Per path:** `.claude/skills/tk-ui-diverge/**` the skill and triggers; `REGISTRY.md` its row; `app/demo/diverge/**` the three records-table directions C1 writes (demo-only code, so under `app/demo/`, D-DEMO-26).
- **Gotchas:**
  - `.claude/skills/` is sandbox-protected: each write prompts Taylor. Plan for the prompts.
  - The demo's surfaces read `?state=`; a direction renders populated only unless the axis is about a state.
  - Keep the body short: it stays in context once invoked.
- **Model:** minimum Sonnet 5.5 at medium, recommended Opus 5.5 at medium. Choosing down tends to vary colour, type and layout together, so the three directions compare nothing.
