---
title: "0004 — Docs stay as markdown in the root `docs/`; `apps/docs` is a renderer over them, not the `create-turbo` example app and not a content home"
description: Read before moving any markdown out of root docs/, or changing how apps/docs reads it.
layer: decisions
status: ruling
thread: scaffold
role: Mason
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# 0004 — Docs stay as markdown in the root `docs/`; `apps/docs` is a renderer over them, not the `create-turbo` example app and not a content home

> Migrated from the scaffold's `TECHNICAL-DECISIONS.md` into the house record format (`conflicts.md` CF-06). Wording unchanged; sections renamed.

## Context and problem

`create-turbo` ships an `apps/docs` Next.js app. Synapse and Conscious Connections deleted it and kept a root `docs/` markdown tree that agents read raw. The owner wants both: house docs conventions, and the docs readable in a browser.

## Considered options

1. A — keep `create-turbo`'s `apps/docs` and write docs as pages inside it.
2. B — move the markdown into `apps/docs`.
3. C — markdown stays in root `docs/`; `apps/docs` statically renders it, rewriting relative `.md` links to routes.

## Decision

C. The markdown files stay readable in an editor, on GitHub, and by agents, with no app knowledge needed; the browser view is derived and has no content of its own. A puts content behind JSX; B ties a docs path to a deployable app, and every product tool that reads `docs/` would need to know the move.

## Consequences

Buys one source of truth with a browsable view. Costs a small renderer (`apps/docs/lib/docs.ts`, `app/_components/markdown.tsx`) and one cross-package build input (`$TURBO_ROOT$/docs/**` in `apps/docs/turbo.json`), without which an edited doc would serve a stale cached build. Links to repo files outside `docs/` render inert rather than broken.

## Revisit trigger

The docs need search, versioning, or MDX components — at which point a docs framework (Fumadocs, Nextra) replaces the renderer, reading the same files.
