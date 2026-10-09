---
id: DEMO-15
size: small
objective: "tk-motion is installed from the thread-07 bundle, retargeted to the house motion tokens, firing only on motion work, and its M1 to M12 review gives the critic its motion line."
slice_type: "Installing a model-invocable house skill; the risk is a trigger that fires on ordinary UI work, a body that cites values instead of tokens, or listing cost past the cap."
non_negotiables:
  - "Installed as .claude/skills/tk-motion/ from the thread-07 bundle named in docs/design/skills.md's tk-motion row, with a provenance header and source_description restored."
  - "Every duration and easing the body names is a house motion token from packages/config/tailwind/preset.css; no raw ms or cubic-bezier."
  - "Frontmatter: a narrow motion-noun description of at most 400 characters, paths per CF-23, allowed-tools Read Grep Glob, disallowed-tools WebFetch."
  - "Trigger test (CF-30): ten known tasks, five with motion and five without; if it fires on more than one of the five without, it becomes disable-model-invocation: true and the critic carries the motion line (C-R12)."
  - "The review reports M1 to M12 as one line each, so the critic can cite it as C-R12."
  - "The model-invocable listing stays at 12 or fewer, and REGISTRY.md's row is complete with measured cost."
devs_call: "Which bundle references are copied versus cut, the trigger wording within the cap, and the review's layout."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/overview.md"
  - "D-DEMO-16"
truth_files: "none: a skill changes no living UX file"
qa: Q2
reviewers:
  - vigil
focus: []
operator_review: false
planned_paths:
  - ".claude/skills/tk-motion/**"
  - ".claude/skills/REGISTRY.md"
depends_on:
  - DEMO-12
out_of_scope:
  - "Changing any surface's motion: DEMO-17 fixes findings. GSAP and motion libraries: rejected for product UI (CF-32)."
criteria:
  - id: C1
    statement: "tests/triggers.md holds the ten tasks with the observed result for each, and the invocation setting matches the CF-30 rule for that result."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-015-motion-skill/evidence/triggers.md"
  - id: C2
    statement: "Run on the delete dialog, the review gives one line for each of M1 to M12, each PASS, an issue with a region, or N/A."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-015-motion-skill/evidence/motion-review.md"
  - id: C3
    statement: "The listing and body costs fit the index budget with this skill counted."
    evidence: check
    command: "yarn budget"
---

# Contract — DEMO-15 motion-skill

## Build notes

- **Approach:** Follow `docs/design/skills.md`'s review procedure on the bundle its `tk-motion` row names (P-C's amendment block: install it as `tk-motion`, landing pages renamed `README.md`). Copy, retarget values to tokens, narrow the trigger, write the trigger test, run the review once on the delete dialog, then fill `REGISTRY.md`.
- **Decisions that apply:**
  - D-DEMO-15: "One state keeps the same content and words at every width; where the captures differ, the 1440 wording and the same fixture rows win. Width changes layout only."
  - D-DEMO-16: "The build fixes capture drift; the canvas stays locked: skeletons copy each width's final layout, static labels as text; rows grow with wrapped text; a disabled control dims its label and helper; a pending button keeps its width; dark spacing and scrim match light; the 390 foot link is in every state; raw widths become tokens."
  - skills.md: "`tk-motion`, auto-invoked on its narrow motion trigger (CF-30)"; the trigger test rule above; load order step 3.
  - delete-dialog.md Access: "Motion: opacity only, in at 250ms, out at 200ms (motion tokens); opened by keyboard or with reduced motion, it appears at once (C-P11)." C2's known answer.
- **Interfaces:** the skill's description (listing) and `tests/triggers.md`.
- **Per path:** `.claude/skills/tk-motion/**` the skill, its kept references and the trigger test; `REGISTRY.md` its row.
- **Gotchas:**
  - Reading the bundle is the one sanctioned read of an archived source in this epic (Taylor, Tickets gate, 2026-10-08: an A11 exception for the install source); read nothing else beside it.
  - `.claude/skills/` is sandbox-protected: each write prompts Taylor.
  - Model-invocable means it shows in every session's listing: measure the description, and say what it displaces.
- **Model:** minimum Sonnet 5.5 at medium, recommended Opus 5.5 at medium. Choosing down tends to keep the bundle's broad description, which then fires on every UI edit and costs every session.
