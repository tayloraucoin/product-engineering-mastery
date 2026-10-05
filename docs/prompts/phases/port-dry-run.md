---
title: P-E — The port dry-run and the README (Claude Code, fresh directory, Sonnet is enough)
description: Run in Claude Code in a fresh directory to clone the toolkit cold, time every README step, and write the port runbook.
layer: prompts
status: adopted
thread: P-E
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# P-E — The port dry-run and the README (Claude Code, fresh directory, Sonnet is enough)

> **Amendment (2026-10-03, STK-3; applies EN-10, record 0010).** The porting rule is now "duplicate, then remove". The port runbook this prompt asks for is `docs/runbooks/new-project/README.md`, and the README already points to it, so this run does not write a runbook into the README. Its dry-run of the guide is ticket STK-20; where the body says "what a product repo copies, what it generates, what it never copies", read "what a duplicate keeps, removes and clears". The body below is unchanged.

**Inject:** none — this is a procedure, not a judgment call; Plumb reviews the result. **Attach:** the toolkit repo URL.

Clone the toolkit into an empty directory and follow `README.md` as a stranger would, timing every step: install, run the docs app, run the demo, run the critic on the demo, run `gen-agents`, fill one template from the instructions alone. Stop at every step where the README was wrong, missing, or assumed something; log it. Fix the README (not the stranger) and repeat until a cold run completes without a stop. Then write the port runbook into the README: what a product repo copies (templates, skills, roles, `CLAUDE.md`), what it generates (its own design layer, its `_ext` roles), what it never copies (the demo, the research), and the timing log from the clean run.

Output: the README with the runbook and timings, and the list of fixes made. Not wanted: a README that explains the toolkit's philosophy — `docs/index.md` does that; the README gets you running.
