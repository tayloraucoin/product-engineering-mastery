@AGENTS.md
@docs/index.md

## Claude Code only

- Path rules in `.claude/rules/` load on matching files: `ui.md` (UI files, the design layer), `ts.md`, `testing.md`, `next.md`, `turbo.md`, `docs.md`, `specs.md`, `deps.md`.
- Hooks registered in `.claude/settings.json` enforce the shell rules. A denial message is an instruction: do what it says, and never pursue the same outcome through another form of the command.
- Subagents in `.claude/agents/` are generated from `docs/roles/`, each in its own context; their listing says when to use each. Hand an evaluator (`assay`, `vigil`) the contract and the evidence, never your summary.
- House skills are `tk-*`. `tk-batch` builds named tickets start to finish and is yours to run from plain language, as are `tk-kickoff` and `tk-close`; `/tk-contract` and `/tk-prompt` are manual: a person types them. The design skills arrive in Phase 3; until then, run Recipe A from `docs/design/README.md` by hand, with the tools `docs/design/workflow.md` sanctions.
- Use plan mode before changing `docs/design/canon.md`, `docs/index.md`, a workspace-package boundary, or anything in `docs/decisions/`.
