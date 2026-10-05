---
title: "Stage: UX spec"
description: "Open at an epic's UX level, to turn the brief into surface files a fresh thread could build without asking a question: every state, access, criteria with IDs, mirroring the living truth."
layer: workflows
status: draft
thread: P-J
role: Usher
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when: on request
---

# Stage: UX spec (epic level 3)

## 1. Lead and support

Lead: Vesper (`docs/roles/product-design/vesper-ux-ui-designer.md`). Support: Gloss (`gloss-content-designer.md`) for every word in the product; Threshold (`threshold-accessibility-auditor.md`) for the access section of each surface; Turner (`docs/roles/engineering/turner-design-engineer.md`) only when a primitive would have to change.

## 2. Venue

Claude Code, on `agent/<EPIC>`.

## 3. Loads

| File                                                                         | Reason                                        |
| ---------------------------------------------------------------------------- | --------------------------------------------- |
| `docs/design/canon.md`                                                       | The floor; A-01 to A-20 are banned by ID      |
| The product's design file (`apps/web/docs/design/DESIGN.md` in the demo)     | The brand's deltas on the floor               |
| At most three files through `docs/references/README.md`                      | The laws the surfaces lean on                 |
| `docs/design/templates/ux-overview.template.md` and `ux-surface.template.md` | What this stage writes                        |
| `docs/design/templates/states.template.md`, `components.template.md`         | The state matrix and the component vocabulary |
| `specs/<app>/ux/<area>/`                                                     | The truth each proposal mirrors               |
| The epic's `brief.md` and `research/*.md`                                    | The problem and the facts                     |
| A `docs/research/` file, labelled `[research: <why>]`                        | Only when nothing distilled covers it (A11)   |

**Interview protocol, where this stage interviews.** It overrides the role's default intake behaviour (at most one clarifying question). Ask every question the output needs, in numbered rounds; give each a recommended default so the answer can be "3: keep"; invent nothing silently; leave anything open under `[NEEDS DECISION]`, or `[NEEDS DECISION — BLOCKING]` when a ticket could not start without it.

## 4. Interview rounds

Every empty slot in the surface template is a question, taken surface by surface: the job of the surface; its entry and exit; each state (empty, loading, error, partial, offline, success, and the product's own); the words on it; the keyboard path and the announced names; the criteria, each with an ID (`C-<EPIC>-<surface>-<n>`); and any decision, logged as `D-<EPIC>-<n>` in the overview.

## 5. Writes

Under `specs/<app>/epics/<EPIC>-<slug>/ux/`, mirroring the truth paths: `<area>/overview.md` (frame, routes, decision log) and one `<area>/<surface>.md` per surface, at most 2,000 tokens each, split if bigger. Each file's frontmatter carries `target:` (its truth path), `status: draft`, and `promoted:` empty (A8).

## 6. Gate

You approve, and each file is set to `status: approved`. The detail test: a fresh thread could build any one surface file without asking a question. A `[NEEDS DECISION — BLOCKING]` left in a file stops every ticket that cites it (`contract:init` refuses, A6).

## 7. Handoff

Print the Technical prompt (from `stages/technical.md`) and say: open a new thread with it. Print only; save no prompt file. On the product-spec track this stage hands off to that track's Handoff stage instead.
