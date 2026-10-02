# Skill registry

Every skill in `.claude/skills/`, house or third-party, with its provenance and measured cost. A skill is not installed until its row is complete. The procedure that fills a row is the review checklist in [`docs/design/skills.md`](../../docs/design/skills.md); the cap is 12 model-invocable skills, descriptions of at most 400 characters (`docs/index.md`).

Read by people, never loaded by agents.

| Name        | Kind          | Source (URL)                                               | Pinned SHA   | Reviewed (date, reviewer) | Invocation                                                  | `/context` cost (listing / body)                                                                                        | Trigger tests                    | Displaces                   | Owner |
| ----------- | ------------- | ---------------------------------------------------------- | ------------ | ------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------- | ----- |
| `tk-prompt` | house, manual | `docs/workflows/prompt-builder.md` (the body is a pointer) | n/a, in-repo | 2026-10-02, Lorimer       | `/tk-prompt <brain dump>`; `disable-model-invocation: true` | listing 0 by the docs' table (V4; measured with `/context` in J7) / body about 90 tokens, plus the builder when invoked | n/a: manual, never model-invoked | pasting the builder by hand | Usher |

Phase 3 (prompt P-C) installs `tk-ui-critic`, `tk-ui-diverge`, `tk-motion`, `tk-ui-code-lint` and `shadcn`; J7 installs `tk-contract`, `tk-kickoff` and `tk-close`.
