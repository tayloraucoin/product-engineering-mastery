---
title: Postmortem (template) — blameless, with the AI-incident fields
description: Fill after any incident that reached a user, including an AI surface showing an unsupported claim or a wrong source; contributing causes, never culprits.
layer: runbooks
status: adopted
thread: "14"
role: Tally
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# Postmortem — [FILL: incident], [FILL: YYYY-MM-DD]

> **Who fills:** the person who led the response drafts; everyone involved reviews; the owner of the binding promise that broke signs off.
> **When:** within five working days of resolution.
> **Lives at:** `docs/postmortems/YYYY-MM-DD-<slug>.md` in the product repo. Delete this instruction block when you fill it.
> **What the critic checks:** nothing. Its outputs do: every "lesson" below that changes a rule becomes an amendment to the design layer, a rubric line, an eval case or a decision record, and is linked here.
> **Blameless:** identify the contributing causes without indicting any individual (Google SRE, ch. 15).

## Summary

`[FILL: what happened, to whom, for how long, in three sentences]`

## Impact

- **Users affected:** `[FILL: count and denominator]`
- **What they saw:** `[FILL]`
- **Binding promise broken:** `[FILL: the product promise, or "none"]`

## AI-incident fields (fill when an AI surface was involved)

| Field                            | Value                                             |
| -------------------------------- | ------------------------------------------------- |
| The claim shown                  | `[FILL: opaque ID, never the content]`            |
| Supported by its source?         | `[FILL: yes / no / partially]`                    |
| Source shown was the right span? | `[FILL]`                                          |
| Model and prompt version         | `[FILL]`                                          |
| Would an eval have caught it?    | `[FILL: which failure mode, or a new one to add]` |

## Timeline

| Time     | Event    |
| -------- | -------- |
| `[FILL]` | `[FILL]` |

## Contributing causes

- `[FILL]`

## What went well

- `[FILL]`

## Lessons and actions

| Action   | Becomes (amendment, rubric line, eval case, record) | Owner    | Due      |
| -------- | --------------------------------------------------- | -------- | -------- |
| `[FILL]` | `[FILL: link]`                                      | `[FILL]` | `[FILL]` |
