---
title: P-C — The demo app and the skills (Claude Code, in the repo, Opus)
description: Run in Claude Code (Vesper, Plumb, Assay in sequence) to build the demo app, the filled example pair, the house skills and the critic CI.
layer: prompts
status: adopted
thread: P-C
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# P-C — The demo app and the skills (Claude Code, in the repo, Opus)

> **Amendments in force (docs/decisions/conflicts.md).** House skills are prefixed `tk-` (CF-18): `tk-ui-critic`, `tk-ui-diverge`, `tk-motion`, plus `tk-ui-code-lint`. Third-party skills sit flat in `.claude/skills/<name>/` with provenance in `.claude/skills/REGISTRY.md`; there is no `_adopted/` (CF-19). The critic's rubric is `docs/design/canon-rubric.md` (CF-20, amended by record 0009); it reads Laws of UX through `docs/references/index.md` (CF-15). The motion skill bundle is archived at `docs/research/courses/motion-skill-files/` (renamed 2026-10-02, PR-12; the landing pages this body cites as `index.md` are now `README.md`) (install it as `tk-motion`; restore `source_description`). Skill trigger tests live at `.claude/skills/<name>/tests/triggers.md` (CF-10). The filled example's design files inherit the canon by ID (checklist item 20).

**Inject:** Plumb for the demo's design layer; Assay as the evaluator persona for the critic; Vesper for the demo's screens. **Attach:** `00-shared-context`; the three role prompts; `docs/design/canon.md`, the templates, `workflow.md`, `skills.md`; the motion skill from Prompt 07 (`motion-skill.zip`); the Laws of UX index from 13; the Shift Nudge `sn-ui-checklist` SKILL.md; the Anthropic harness-design post. Repo open with Phase 2 committed.

This phase proves the toolkit. Three roles in sequence; keep their outputs separate.

The ask. (1) **Vesper — the demo app.** A small generic records product in `apps/web`: a dense table with sort and filter, a record detail with a diffable document view, a form with validation, a settings page, a destructive-action dialog, a three-beat onboarding. Every state in `states.template.md` reachable by URL parameter (`?state=empty|loading|error|partial|offline`), light and dark, reduced-motion honored. Stories for every component. Real copy in-register, no lorem. Spec each screen before building it, in the template's handoff form. (2) **Plumb — the filled example pair.** `apps/web/docs/design/*` — the demo's own `DESIGN.md`, tokens, components, anti-patterns, states, and six annotated refs — filled from the canon and the real codebase, so template and example sit side by side in the docs app. Plus `apps/web/specs/_example/brief.md`. (3) **Assay — the critic.** `/.claude/skills/ui-critic/`: trigger description, the Playwright procedure (390/834/1440, light/dark, reduced-motion, every `?state=`, focus visible) as a parameterized script, the rubric (Assay §3.3 spine + canon rubric lines + anti-patterns by name + Laws of UX loaded by task-type index), the review format, the round cap, the hands-off guard. Three pass and three fail calibration exemplars captured from the demo itself, annotated by rubric line. (4) `ui-diverge` (the three-directions procedure, one axis forced per direction, each as an isolated route) and `motion` (from 07, placed in the load order `skills.md` set). Adopted third-party skills into `_adopted/`, pinned, with their review notes. (5) **Run it.** Critic against every demo route; fix the findings by hand; run round two; show both reviews. Then run `ui-diverge` on one screen and show the three directions. (6) CI: a workflow that builds the demo, runs the critic, and fails on any Blocking finding; stores the screenshot set as an artifact.

Output: the demo running, the example pair, the skills, the calibration set, both reviews, the diverge output, the CI run green. Not wanted: a demo that only has happy paths, or a critic that passes a state it never captured.
