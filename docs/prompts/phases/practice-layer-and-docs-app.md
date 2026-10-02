---
title: P-B — The practice layer and the docs app (Claude Code, in the repo, Opus)
description: Run in Claude Code (Plumb) to write the practice layer into the repo and wire the docs app.
layer: prompts
status: adopted
thread: P-B
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# P-B — The practice layer and the docs app (Claude Code, in the repo, Opus)

**Inject:** Plumb. **Attach:** `00-shared-context`; Plumb role prompt; the role-authoring guide; P-A's outputs (`ledger.md`, `conflicts.md`, `canon.md`, `index.md`, the stripped templates, the filing plan, the checklist); rulings 01 and 04; all role prompt files; the primer prompts bundle. The repo is open; the scaffold from Phase 0 is committed.

Plumb — you're in the toolkit repo. Read your role prompt, the shared context, and `docs/index.md` from the consolidation thread. The scaffold is committed; you're writing the practice into it.

The ask. (1) File everything per the filing plan: roles into `docs/roles/`, prompts into `docs/prompts/`, research into `docs/research/` with `status: archived`, decisions into `docs/decisions/`. Frontmatter per §2.7 on every file, `description` written as a trigger. (2) Write the templates: `docs/design/templates/*` with inline instructions and a pointer to the filled example that Phase 3 will create; `docs/product/*` from the stripped versions. Each template's instructions say who fills it (which role), when, and what the critic checks it against. (3) `docs/design/workflow.md` from ruling 01 and `docs/design/skills.md` from ruling 04 — product references generalized, the tool-per-loop table and the load order kept exact. (4) `tooling/gen-agents.ts`: reads `docs/roles/**`, emits `.claude/agents/<name>.md` with the subagent frontmatter (name, description as trigger, tools allowed — Assay gets no write tools) and the role body. Run it; commit the output; document that the agents directory is generated. (5) Root `CLAUDE.md` for real: precedence ladder, the load rules (always: index, DESIGN; on trigger: references by `load_when`; never: research), the slop tells by name, the vocabulary constraint, and the pointer to the skills. Nested `apps/web/CLAUDE.md` as the app-level example. (6) Wire the docs app: content path to `docs/`, sidebar grouped by `layer`, search working, frontmatter rendered. Exclude `research/` from the sidebar by default but keep it searchable. Run it and confirm every page renders.

Run your agent-readability test last: a fresh Claude Code session given only `CLAUDE.md` and a one-line brief should be able to say which files it would load and why. Output: the commit, the list of files written, the docs app running, the test result. Not wanted: templates that are really examples with the content left in, or a `CLAUDE.md` over a hundred lines.
