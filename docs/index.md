---
title: The practice — map
description: "Read first in every session. The map of the practice: what each layer holds, which wins when two disagree, what loads always versus on trigger, and the context budget per build."
layer: decisions
status: ruling
thread: P-A
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: always
---

# The practice

The rules people and agents build by, a library loaded on demand, and a demo app (`apps/web`) that proves both. No product lives here. A product repo copies what it needs, following `docs/runbooks/onboard-agent.md` and the port runbook in `README.md`.

## Layers

| Layer         | Where                                      | Holds                                                                                    | Loads                            |
| ------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------- | -------------------------------- |
| Agent context | `AGENTS.md`, `CLAUDE.md`, `.claude/rules/` | Commands, boundaries, path rules                                                         | always / by path                 |
| Decisions     | `docs/decisions/`                          | `ledger.md` (index), `records/`, `conflicts.md`, `changelog.md`                          | grep on demand                   |
| Roles         | `docs/roles/<department>/`                 | Role prompts; `.claude/agents/` is generated from them                                   | injected, or as a subagent       |
| Design        | `docs/design/`                             | Loops and Recipe A (`index.md`), `workflow.md`, `skills.md`, `canon.md`, `templates/`    | by path on UI files              |
| Product       | `docs/product/`                            | Cycle-charter, brief, package, glossary templates                                        | when shaping                     |
| Metrics       | `docs/metrics/`                            | Events, definitions, readout, experiment templates                                       | when instrumenting               |
| Evals         | `docs/evals/`                              | Surface, failure-mode, judge templates                                                   | when a product has an AI surface |
| Runbooks      | `docs/runbooks/`                           | Onboard-agent, variant testing, release, postmortem                                      | on request                       |
| References    | `docs/references/`                         | `index.md` router; laws-of-ux, canons, practitioners, books; `_meta/` procedures         | by router, at most 3 files       |
| Skills        | `.claude/skills/`                          | `tk-ui-critic`, `tk-ui-diverge`, `tk-motion`, `tk-ui-code-lint`, `shadcn`; `REGISTRY.md` | listing always; body on trigger  |
| Prompts       | `docs/prompts/`                            | Shared context and primer prompts                                                        | injected by you                  |
| Research      | `docs/research/`                           | Archived thread outputs                                                                  | never                            |
| Demo          | `apps/web/`                                | The filled example of every template; the critic's target                                | when working in the demo         |

## Precedence (highest first)

1. **Enforced checks.** Lint, types, tests, the critic gate in CI.
2. **The session's explicit instruction.** The agent names any rule the instruction breaks.
3. **The design layer.** `canon.md` is the floor. The product's DESIGN, tokens, components, states and anti-patterns may tighten it, never loosen it.
4. **Accepted decisions** in `docs/decisions/`.
5. **The brief and package.** They may request an exception; they never grant one.
6. **References.**
7. **Role judgment.** It fills silences, labeled as judgment.

## What loads when

- **Always** (≤4,000 tokens): `AGENTS.md` (≤100 lines), `CLAUDE.md` (shim, ≤20 lines), this file (≤80 lines), the skill listing (≤12 model-invocable skills, descriptions ≤400 characters).
- **By path:**
  - `.claude/rules/ui.md` on UI files loads `canon.md` and the product design layer.
  - `ts.md` and `testing.md` load on their files.
  - Nested `AGENTS.md` files load in `apps/` and `packages/`.
- **By trigger:**
  - `tk-motion` on motion work; `shadcn` on component work.
  - References through `docs/references/index.md`, at most 3 files per task.
- **On request:** roles, templates (when filling one), runbooks, decisions (grep the ledger), prompts.
- **Never:** `docs/research/`; `docs/references/_meta/` outside a library batch; `PROVENANCE.md` outside a disputed finding; `docs/_generated/`.

## Budget per build

This table is the CI contract read by `tooling/budget.ts`.

| Build                | Loads                                                                                                 | Cap (tokens)       |
| -------------------- | ----------------------------------------------------------------------------------------------------- | ------------------ |
| UI build             | always 4,000 + design layer 5,000 + brief and package 2,000 + references 1,500 + one skill body 2,500 | 15,000             |
| Non-UI build         | always 4,000 + `ts`/`testing` rules and nested `AGENTS.md` 1,500 + brief and package 1,500            | 7,000              |
| Critic pass (forked) | canon §3 and §2 + brief and package + ≤3 exemplars (screenshots excluded)                             | 6,000              |
| Library batch        | a general thread: role, `_meta` procedure, sources                                                    | not in repo budget |

A product's own design layer gets about 1,700 of the 5,000; `canon.md` takes the rest. A product `DESIGN.md` holds deltas, never restatements.

## Changing the practice

- Amend the file.
- Add a ledger line and a `changelog.md` entry. Add a record in `records/` only if the reason needs more than one line.
- Nothing lives in two places.
- Prune monthly, using the deletion test on every always-on line. Re-run the critic calibration and the trigger tests at every model upgrade.
