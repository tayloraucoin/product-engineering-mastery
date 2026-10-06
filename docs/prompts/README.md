---
title: "Prompts — what you paste into a thread"
description: "Open when you are about to start a thread by hand and need the text to paste: the shared briefing, a research prompt whose trigger has fired, or the archived prompts that built this repo."
layer: prompts
status: adopted
thread:
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-05
supersedes:
load_when:
---

# Prompts

**What this is.** Text a person pastes into a new thread, Claude Code or a general Claude chat, so the thread starts with the right role, attachments, question and done criteria. Nothing here loads by itself.

**Not here.** Everyday work (a fix, a feature, an epic) does not start from this folder. The prompt builder, [`docs/workflows/prompt-builder.md`](../workflows/prompt-builder.md) or `/tk-prompt`, writes those prompts for each stage.

## What each part holds

| Part | What it is | When you open it |
| --- | --- | --- |
| [`shared-context.md`](shared-context.md) | The standing briefing every prompt here assumes: who is captaining, the three loops, Recipe A, where things live, the roles on call, and the evidence rules. | Attach it to every thread you start from this folder, beside the role prompt the prompt names. Fill the captain line once per person. |
| [`research/`](research/README.md) | Research prompts that can be run again. Each asks one question the toolkit needs answered, names the role that answers it, and says what moment makes it worth running. | When its trigger fires (table below), and again when its last answer has gone stale. |
| [`archive/`](archive/README.md) | The one-time prompts that built this repo, phase by phase, and the record of the investigation threads before them. | Only to trace why something is the way it is. Never to start new work. |

## When to run a research prompt, and when to run it again

Run a research prompt the first time its trigger fires. Run it again when the answer it produced stops fitting, which happens in three ways:

- **A different product.** The toolkit is copied into a project the first answer did not cover: its first AI feature, its first instrumented feature, a brand to bring in.
- **A changed landscape.** A tool, model or vendor the answer relied on has changed: a model upgrade, a new flag or analytics tool, a new agent harness.
- **A revisit trigger.** The decision record the answer fed names a condition for looking again, and that condition has happened.

Each run is a new thread. Its output is filed as a new file under `docs/research/<topic>/`, and the earlier output stays as it was, because a filed output is never edited in place ([record 0006](../decisions/records/0006-file-naming-and-filing.md)). Each prompt is a stub until its first run, and is filled out then; after that, edit it only to bring its trigger or attachments up to date.

| Prompt | The question it answers | Role | Run it when |
| --- | --- | --- | --- |
| [P-F](research/agent-context-architecture.md) | How context loads across agent tools, how the token budget is measured, how the toolkit is vendored into a product | Plumb | After Phase 3, before the port dry-run |
| [P-G](research/measurement-layer.md) | How the metrics templates become an enforced event taxonomy with versioned definitions | Tally | A product instruments its first feature |
| [P-H](research/product-operating-artifacts.md) | Which product operating files (charter, roadmap pins, positioning, opportunity tree, discovery ledger) a product needs | Compass | A product needs those as files rather than inside role prompts |
| [P-I](research/ai-evals.md) | How an AI feature's failure modes, judges and release gate are built for real | Tally | A product ships an AI feature that makes claims to users |
| [P-K](research/branding-insertion.md) | Where a company's brand (primitives, fonts, assets, marketing voice) enters the toolkit | Plumb; Turner builds | Phase 3's first surface exists |
| [P-L](research/cold-trial.md) | How long a stranger takes from clone to a first merged change, and where they stumble | Usher; a person runs the trial | The stage files and the prompt builder have landed (J14) |

All six are drafts and none has run yet; each file names its role, attachments and done criteria.

## The archive, and a duplicated project

[`archive/`](archive/README.md) is this repo's own history: the phase prompts (P-A to P-E, and P-J, the engineering layer) were written to build the toolkit once, in order, and are kept byte for byte so a ruling can be traced to the prompt that asked for it. A project made by duplicating this repo deletes `archive/` on day one; its prompts describe building this toolkit, not that product. It keeps `shared-context.md` and `research/`.

## The letters

Every prompt is lettered in the order it was commissioned, P-A to P-L. The id in frontmatter is `P-X`; the work-id on its branch and in commit messages is `PX`, so `PJ` is Primer J, the engineering layer.

## Conventions in every prompt

- The role reads its role prompt and the shared context before the task. Where a role prompt and an attached document disagree on fact, the document wins.
- Evidence is labelled verified, secondary or judgment; prices and availability are dated; a gap is marked not found, never filled.
- A two-phase thread runs Alembic first (distil, add nothing) and a craft role second (reason to a best answer, labelling every inference `[DIRECT]`, `[INFERRED]` or `[UNKNOWN]`).
- Reviews of course or book material are done by the craft role and addressed to Plumb, who owns what enters the canon.
- Every prompt follows the rulings in `docs/decisions/conflicts.md`.

<!-- Generated by `yarn directory-map` from each file's frontmatter. Everything below this line is rewritten; edit above it. -->

## In this folder

| File | What it is for |
| --- | --- |
| [`shared-context.md`](shared-context.md) | Attach to every primer-prompt thread as the standing briefing; fill the captain socket once per person. |
| [`archive/`](archive/README.md) | Open only to trace a ruling back to the prompt that asked for it: the one-time phase prompts that built this repo, and the investigation threads before them. A duplicated project deletes this folder. |
| [`research/`](research/README.md) | Open when a trigger fires, or an earlier answer has gone stale, to run a research thread again: agent context, measurement, product operating files, AI evals, branding, the cold trial. |
