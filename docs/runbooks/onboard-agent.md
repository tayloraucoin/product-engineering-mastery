---
title: Onboard an agent — verify the context loads as documented
description: Follow when the team adopts a new model or a new agent tool, or after a harness change, to prove the always-on files, path rules, skills and subagents load exactly as docs/index.md says; not when a new developer joins.
layer: runbooks
status: adopted
thread: P-B
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-05
supersedes:
load_when:
---

# Onboard an agent

## When to use this

- **Run it** when the team adopts a new model or a new agent tool, or after a harness change: `AGENTS.md`, `CLAUDE.md`, `docs/index.md`, `.claude/rules/`, the hooks or settings in `.claude/settings.json`, the skills or the generated subagents. A port of the toolkit into a new product repo counts; a developer's own clone does not.
- **Not when a new developer joins.** The rules this runbook verifies are shared by everyone on the repo, tracked in git and loaded the same way for every person and every agent. A new developer reads `AGENTS.md` and `docs/index.md`; nothing here changes for them.
- **A developer's own preferences** (a model choice, an output style, extra permissions, personal hooks) belong in their untracked local settings (`settings.local.json` beside the shared `.claude/settings.json`, or `~/.claude/`), never in the shared files this runbook checks.

> **Who runs it:** whoever introduces the tool or model; Plumb reviews the result.
> **When:** a new agent tool, a model upgrade, a fresh clone or port of the toolkit, or any change to `AGENTS.md`, `CLAUDE.md`, `docs/index.md` or `.claude/rules/`.
> **Done means:** every check below passes, and the result is one line in `docs/decisions/changelog.md` (tool or model, date, pass or the failing step).

## 1. The mechanical checks

```sh
yarn lint:docs           # frontmatter schema and file names across docs/
yarn budget              # always-on and per-build token budgets from docs/index.md
yarn gen:agents --check  # .claude/agents/ matches docs/roles/
```

All three exit 0. A budget failure names the file and the cap; fix the file, never the cap, unless Plumb amends `docs/index.md`.

## 2. The always-on load

In a fresh Claude Code session at the repo root, run `/context` and confirm:

- `CLAUDE.md`, `AGENTS.md` and `docs/index.md` are loaded, and nothing from `docs/research/`, `docs/references/` or `docs/design/` is.
- The subagent listing shows exactly the roles with `subagent: true` (`yarn gen:agents` prints them).
- The skill listing shows no more than 12 model-invocable skills.

For a non-Claude tool (Cursor, Codex), confirm it reads `AGENTS.md` and that `AGENTS.md` alone tells it to read `docs/index.md` first.

## 3. Each path rule fires

Ask the session to read one file per rule, then check `/context` for the rule:

| Rule                       | Read this file                                | Expect                                                                       |
| -------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------- |
| `.claude/rules/ui.md`      | `apps/web/app/page.tsx`                       | `ui.md` loaded; the session names `docs/design/canon.md` as required reading |
| `.claude/rules/ts.md`      | `tooling/gen-agents.ts`                       | `ts.md` loaded                                                               |
| `.claude/rules/testing.md` | any `*.test.ts` or `*.spec.ts` file (Phase 3) | `testing.md` loaded                                                          |

Nested context: reading a file under `apps/web/` loads `apps/web/CLAUDE.md`.

## 4. Each skill triggers, and only on its task

From Phase 3: for every skill, run the five must-trigger and five must-not prompts in `.claude/skills/<name>/tests/triggers.md`. A model-invocable skill that fires on more than one must-not prompt becomes manual-only (`docs/design/skills.md`).

## 5. The agent-readability test

Give a fresh session only `CLAUDE.md` and a one-line brief (for example "add a bulk-archive action to the records table"). It must name the files it would load and why, in the order `docs/index.md` prescribes, without opening `docs/research/`. Record the brief and the answer.

## 6. The known-screen test (Phase 3 onward)

Build one known screen in the demo app from its package alone and run `tk-ui-critic`. Pass: zero Blocking findings and no off-system components. At every model upgrade, also re-run the critic calibration set and update the model-defaults section of the product's `anti-patterns.md`.
