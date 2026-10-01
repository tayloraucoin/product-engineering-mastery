---
title: 0008 — Subagents are generated from roles that opt in, with tools set in the role's frontmatter
description: Read before making a role available as a Claude Code subagent, changing a subagent's tools, or editing anything in .claude/agents/.
layer: decisions
status: ruling
thread: P-B
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# 0008 — Subagents are generated from roles that opt in

Implements `conflicts.md` CF-20 and PL §2.3.

## Context and problem

`tooling/gen-agents.ts` turns role prompts into `.claude/agents/<name>.md`. The repo holds 28 role prompts across six departments. Every subagent's description is listed to the model, so each one costs context in every session (`docs/index.md` caps always-on at 4,000 tokens). Some roles must not write: the critic "never writes or edits code" (Assay §1). Claude Code's subagent `tools` field takes bare tool names only; permission specifiers such as `Bash(yarn playwright *)` work only in `disallowedTools` (code.claude.com/docs/en/sub-agents, read 2026-10-01).

## Considered options

1. Generate an agent for every role under `docs/roles/`.
2. Generate only for roles whose frontmatter says `subagent: true`, with tools from `subagent_tools` (and `subagent_disallowed_tools`), inheriting all tools when absent.
3. Hand-write thin wrappers.

## Decision

Chosen: option 2, because the role file stays the single source (CF-20), and the listing cost is paid only for roles that run in an isolated context. The opt-in set is the plan's and the Toolkit Map's: Assay, Alembic, Tally, Compass (PL §2.3; R14 SK-28).

- **Assay:** `tools: Read, Grep, Glob`. No write or edit tool, and no Bash yet. Bash arrives with `tk-ui-critic` in Phase 3, scoped by `disallowedTools` or a PreToolUse hook to the screenshot procedure. Until then Assay scores evidence it is handed and reads the code it cites.
- **Alembic, Tally, Compass:** inherit, because their deliverables are files.
- Output is never edited by hand. `yarn gen:agents` writes it; `yarn gen:agents --check` fails CI when it drifts.

## Consequences

- **Buys:** one source per role, a listing cost proportional to use, and a critic that cannot change what it judges.
- **Costs:** a role becomes a subagent only by an edit to its frontmatter. The four roles' generic universal bodies are what the subagent receives, with no product extension until a product repo adds one.
- **Forecloses:** hand-tuned agent prompts in this repo.

## Revisit trigger

A fifth role is asked to run as a subagent, or Phase 3's critic procedure needs a tool the policy above does not allow.
