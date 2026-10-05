---
title: Postmortem (template) — blameless, with the AI-incident fields
description: Fill after any incident that reached a user, a bad merge, or an agent that went wrong, including an AI surface showing an unsupported claim or a wrong source; traces the tickets that touched the failing code; contributing causes, never culprits.
layer: runbooks
status: adopted
thread: "14"
role: Tally
date: 2026-10-01
last_reviewed: 2026-10-05
supersedes:
load_when:
---

# Postmortem — [FILL: incident], [FILL: YYYY-MM-DD]

> **Who fills:** the person who led the response drafts; everyone involved reviews; the owner of the binding promise that broke signs off.
> **When:** within five working days of resolution.
> **Lives at:** `docs/postmortems/YYYY-MM-DD-<slug>.md` in the product repo. Delete this instruction block when you fill it.
> **What the critic checks:** nothing. Its outputs do: every "lesson" below that changes a rule becomes an amendment to the design layer, a rubric line, an eval case or a decision record, and is linked here.
> **Which parts to fill:** `docs/runbooks/postmortem/README.md` names them per case. A finding that suggests changing a convention is also a row in `docs/runbooks/postmortem/convention-log.md`.
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

## Trace

Which spec tickets touched the failing code, and what each one's criteria and review missed.

1. **Name the failing paths:** the files where the fault lives or the fix lands.
2. **Find the commits:** `git log --format='%h %ad %s' --date=short -- <paths>`. A commit subject starts with its ticket ID (`STK-16: …`); a `PEM:` commit was commissioned directly and has no ticket, which is itself a finding when the fault is in it.
3. **Open each ticket's folder** under `specs/` (`git ls-files specs | grep '/<ID>-'`): `contract.md` for the criteria and planned paths, `results.json` for what was proven at which commit, `review-<role>.md` for what each reviewer read, `as-built.md` for what shipped.
4. **Say what each missed, and why:** no criterion covered the case; a criterion did, but its evidence could not see it (a check where a test was needed, a fixture that did not hold the case); the failing file was outside the planned paths; no reviewer's glob in `toolkit.json` matched it, or the tier skipped review; the proof was stale or deferred at close; the case was ruled out of scope.

| Ticket   | Commits  | What its criteria and review covered | What they missed | Why      |
| -------- | -------- | ------------------------------------ | ---------------- | -------- |
| `[FILL]` | `[FILL]` | `[FILL]`                             | `[FILL]`         | `[FILL]` |

A "why" that points at a convention (a tier rule, a reviewer glob, a template, a check) becomes a row in `docs/runbooks/postmortem/convention-log.md`.

## Contributing causes

- `[FILL]`

## What went well

- `[FILL]`

## Lessons and actions

| Action   | Becomes (ticket, amendment, rubric line, eval case, record, convention-log row) | Owner    | Due      |
| -------- | ------------------------------------------------------------------------------- | -------- | -------- |
| `[FILL]` | `[FILL: link]`                                                                  | `[FILL]` | `[FILL]` |
