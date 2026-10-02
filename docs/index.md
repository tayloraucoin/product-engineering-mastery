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

| Layer         | Where                                      | What it is                                                                                                              | Loads                                                     |
| ------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Agent context | `AGENTS.md`, `CLAUDE.md`, `.claude/rules/` | What every agent is told: commands, boundaries, the work loop, path rules | always / by path |
| Workflows     | `docs/workflows/`                          | How work moves, for people: one-offs, epics, stages, gates, the prompt builder | on request; people start here |
| Decisions     | `docs/decisions/`                          | Why the rules are what they are: `ledger.md` (index), `records/`, `conflicts.md`, `changelog.md` | grep on demand |
| Roles         | `docs/roles/<department>/`                 | Who does the work: one prompt per seat; `.claude/agents/` is generated from them | injected, or as a subagent |
| Design        | `docs/design/`                             | What UI is built and judged by: Recipe A (`README.md`), `workflow.md`, `skills.md`, `canon.md`, `canon-rubric.md`, `templates/` | by path on UI files |
| Engineering   | `docs/engineering/`                        | What code is placed and shipped by: conventions, the stack, harness templates; checks in `tooling/` | on request; checks always |
| Product       | `docs/product/`                            | How work is framed: cycle-charter, brief, package, glossary templates | when shaping |
| Measurement   | `docs/measurement/`                        | How a change is proven: `metrics/` (events, definitions, readout, experiment), `evals/` (surface, failure modes, judge) | when instrumenting; evals for an AI surface |
| Runbooks      | `docs/runbooks/`                           | Procedures a person follows: onboard-agent, variant testing, release, postmortem | on request |
| References    | `docs/references/`                         | The distilled library: `README.md` router; laws-of-ux, canons, practitioners, books; `_meta/` | by router, at most 3 files |
| Skills        | `.claude/skills/`                          | Procedures an agent runs: `tk-ui-critic`, `tk-ui-diverge`, `tk-motion`, `tk-ui-code-lint`, `shadcn`; `REGISTRY.md` | listing always; body on trigger |
| Prompts       | `docs/prompts/`                            | What you paste into a thread: shared context, phase primers, threads to commission | injected by you |
| Research      | `docs/research/`                           | The bookshelf: thread outputs, byte for byte, by topic | never (A11: one labelled file in a Frame, Research or UX prompt) |
| Demo          | `apps/web/`                                | The filled example of every template; the critic's target | when working in the demo |

Every file, one line each: [`_generated/directory-map.md`](_generated/directory-map.md), generated from frontmatter by `yarn directory-map`; for people, not loaded by agents.

## Precedence (highest first)

1. **Enforced checks.** Lint, types, tests, the critic gate in CI.
2. **The session's explicit instruction.** The agent names any rule the instruction breaks.
3. **The design layer.** `canon.md` is the floor. The product's DESIGN, tokens, components, states and anti-patterns may tighten it, never loosen it.
4. **Accepted decisions** in `docs/decisions/`.
5. **The brief, the UX spec and the contract.** They may request an exception; they never grant one. Stage files (`docs/workflows/stages/`) sit at rung 2 with the session's instruction: their interview mode governs behaviour, never law.
6. **References.**
7. **Role judgment.** It fills silences, labeled as judgment.

## What loads when

- **Always** (≤4,000 tokens): `AGENTS.md` (≤100 lines), `CLAUDE.md` (shim, ≤20 lines), this file (≤80 lines), the skill and subagent listings (≤12 model-invocable skills, descriptions ≤400 characters), and SessionStart hook output (≤150).
- **By path:**
  - `.claude/rules/ui.md` on UI files loads `canon.md` and the product design layer; `ts.md`, `testing.md`, `next.md`, `turbo.md`, `docs.md`, `specs.md` and `deps.md` load on their globs.
  - Nested `AGENTS.md` files load in `apps/` and `packages/`.
- **By trigger:** `tk-motion` on motion work; `shadcn` on component work; references through `docs/references/README.md`, at most 3 files per task.
- **On request:** roles, templates (when filling one), runbooks, decisions (grep the ledger), prompts, workflows.
- **Never:** `docs/research/` (A11: a Frame, Research or UX prompt may attach one file as `[research: <why>]` when nothing distilled covers it; never a build thread); `docs/references/_meta/` outside a library batch; `PROVENANCE.md` outside a disputed finding; `docs/_generated/`; every `README.md` under `docs/` except the references router and `docs/workflows/README.md`.

## Budget per build

This table is the CI contract read by `tooling/budget.ts`.

| Build                   | Loads                                                                                                 | Cap (tokens) |
| ----------------------- | ----------------------------------------------------------------------------------------------------- | ------------ |
| UI build                | always 4,000 + design layer 5,000 + brief and package 2,000 + references 1,500 + one skill body 2,500 | 15,000       |
| Non-UI build            | always 4,000 + path rules and nested `AGENTS.md` 1,500 + contract and cited spec 3,500                | 9,000        |
| Critic pass (forked)    | `canon-rubric.md` and canon §2 + the cited surface file + ≤3 exemplars (screenshots excluded)         | 6,000        |
| Evaluator pass (forked) | evaluator body 3,000 + contract and cited spec 3,500 + evidence index 500 (never the builder's summary) | 7,000        |

A product's own design layer gets about 1,700 of the 5,000; `canon.md` takes the rest. A product `DESIGN.md` holds deltas, never restatements.

## Changing the practice

- Amend the file.
- Add a ledger line and a `changelog.md` entry. Add a record in `records/` only if the reason needs more than one line.
- Nothing lives in two places.
- Prune monthly, using the deletion test on every always-on line. Re-run the critic calibration and the trigger tests at every model upgrade.
