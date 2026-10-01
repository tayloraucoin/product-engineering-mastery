---
title: "P-F — Agent context architecture"
description: Commission after Phase 3 and before the port dry-run, to settle multi-tool loading, the budget method and toolkit vendoring.
layer: prompts
status: draft
thread: P-F
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# P-F — Agent context architecture

> **Stub — commission before running.** Renumbered from the Toolkit Map's primer 15 (`docs/research/14-toolkit-map-plumb.md`, Appendix) per `conflicts.md` CF-29, with product names generalized. Sharpen the ask against the repo as it stands when you commission it.

**When:** after Phase 3, before Phase 5 (multi-tool parity matters at port). **Model:** deepest available. **Inject:** Plumb captains; engineering (Mason) consulted. **Attach:** `00-shared-context`, the Plumb and Mason role prompts, `AGENTS.md`, `CLAUDE.md`, `docs/index.md`, `.claude/rules/`, `tooling/budget.ts`.

**Decision served.** The final shape of `AGENTS.md`, the `CLAUDE.md` shim, `.claude/rules/`, nested files and the budget CI, plus how a product repo vendors the toolkit.

**Ask.**

1. How teams that publish nested `AGENTS.md` or `CLAUDE.md` files split root from package files: at least 3 teams, dated repo links, line counts.
2. The exact load behavior of Claude Code, Cursor and Codex, from their docs, dated: a tool × file × when matrix.
3. A token-counting method for CI that is closer than `tooling/budget.ts`'s character estimate.
4. Vendoring versus plugin versus submodule for the toolkit, judged on provenance, contractor access and shadowing.
5. Amendments to `docs/runbooks/onboard-agent.md` that prove each tool loaded what `docs/index.md` predicts.

**Evidence rules.** Vendor docs and public repos are primary and dated; aggregator guides are leads only. Label verified, secondary or judgment. Mark what is not found.

**Done criteria.** A fresh session in each tool loads exactly what `docs/index.md` predicts, confirmed with `/context` or the equivalent; the budget CI fails a deliberately oversized file.

**Not wanted.** "Best AGENTS.md templates" listicles; any file that loads always-on without a deletion-test justification.
