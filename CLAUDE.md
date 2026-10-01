@AGENTS.md
@docs/index.md

## Claude Code only

- Path rules in `.claude/rules/` load on matching files: `ui.md` (UI files, the design layer), `ts.md`, `testing.md`.
- Subagents in `.claude/agents/` are generated from `docs/roles/`, each in its own context:
  - `assay` scores rendered UI against `docs/design/canon.md` §3, read-only. Hand it the package and the evidence, never the builder's summary.
  - `tally` defines events and metrics, plans rollouts, writes readouts (`docs/metrics/`).
  - `compass` decides whether and why to build; frames briefs (`docs/product/`).
  - `alembic` distills sources into traceable notes and adds nothing.
- House skills are `tk-*` and arrive in Phase 3; until then, run Recipe A from `docs/design/index.md` by hand, with the tools `docs/design/workflow.md` sanctions.
- Use plan mode before changing `docs/design/canon.md`, `docs/index.md`, a workspace-package boundary, or anything in `docs/decisions/`.
