# Documentation index

One line per document. A new document gets a line here in the same change that adds it.

## How the docs work

The markdown files in this folder are the source of truth. Agents read them raw, GitHub renders them, and [`apps/docs`](../apps/docs/) renders them for reading in a browser (`yarn docs:dev`, then http://localhost:3001). The docs app owns no content: add a `.md` file here and it appears in the sidebar, grouped by folder.

Write links as relative paths to the `.md` file (`[conventions](architecture/codebase-conventions.md)`). They work in an editor, on GitHub, and in the docs app, which rewrites them to routes.

## Start

| Document                    | What                                                            |
| --------------------------- | --------------------------------------------------------------- |
| [`AGENTS.md`](../AGENTS.md) | The agent instruction spine — precedence, guardrails, commands. |

## Architecture

| Document                                                          | What                                                              |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| [`codebase-conventions.md`](architecture/codebase-conventions.md) | Placement, package graph, naming, app conventions — the contract. |
| [`tech-stack.md`](architecture/tech-stack.md)                     | The stack, the pinned versions, and what is deliberately absent.  |

## Decisions

| Document                                                     | What                                                                    |
| ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| [`TECHNICAL-DECISIONS.md`](decisions/TECHNICAL-DECISIONS.md) | Append-only record of architectural choices that had real alternatives. |
