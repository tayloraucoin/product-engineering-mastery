# Skill registry

Every skill in `.claude/skills/`, house or third-party, with its provenance and measured cost. A skill is not installed until its row is complete. The procedure that fills a row is the review checklist in [`docs/design/skills.md`](../../docs/design/skills.md); the cap is 12 model-invocable skills, descriptions of at most 400 characters (`docs/index.md`).

Read by people, never loaded by agents.

| Name | Kind | Source (URL) | Pinned SHA | Reviewed (date, reviewer) | Invocation | `/context` cost (listing / body) | Trigger tests | Displaces | Owner |
| ---- | ---- | ------------ | ---------- | ------------------------- | ---------- | -------------------------------- | ------------- | --------- | ----- |

No skills are installed yet. Phase 3 (prompt P-C) installs `tk-ui-critic`, `tk-ui-diverge`, `tk-motion`, `tk-ui-code-lint` and `shadcn`.
