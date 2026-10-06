# Skill registry

Every skill in `.claude/skills/`, house or third-party, with its provenance and measured cost. A skill is not installed until its row is complete. The procedure that fills a row is the review checklist in [`docs/design/skills.md`](../../docs/design/skills.md); the cap is 12 model-invocable skills, descriptions of at most 400 characters (`docs/index.md`).

Read by people, never loaded by agents. House skills are prefixed `tk-`, short for toolkit. Body cost is characters / 4, the budget's estimator; listing cost is the description's characters / 4.

| Name        | Kind                                        | Source (URL)                                               | Pinned SHA   | Reviewed (date, reviewer)     | Invocation                                                                | Cost (listing / body)                                    | Trigger tests   | Displaces                                       | Owner   |
| ----------- | ------------------------------------------- | ---------------------------------------------------------- | ------------ | ----------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------- | --------------- | ----------------------------------------------- | ------- |
| `tk-prompt` | house, model-invocable (2026-10-05, PR-19)  | `docs/workflows/prompt-builder.md` (the body is a pointer) | n/a, in-repo | 2026-10-05, Lorimer and Usher | plain language (work described with no ticket or prompt), or `/tk-prompt` | listing about 95 / body about 100, plus the builder file | not yet written | pasting the builder by hand                     | Usher   |
| `tk-batch`  | house, model-invocable (2026-10-03, Taylor) | `.claude/skills/tk-batch/SKILL.md` (PR-15, PR-19)          | n/a, in-repo | 2026-10-05, Lorimer           | plain language ("build STK-5 and STK-7")                                  | listing about 90 / body about 950                        | not yet written | a kickoff prompt and a typed command per ticket | Lorimer |

Retired 2026-10-05 (PR-19): `tk-kickoff`, `tk-close` and `tk-contract`. Plain language to `tk-batch` covers starting and closing a ticket, and the Tickets stage and `yarn contract:init` cover drafting one.

The design skills (`tk-ui-critic`, `tk-ui-diverge`, `tk-motion`, `tk-ui-code-lint`, `shadcn`) are not installed yet. Every `tk-*` skill is a convenience: the `yarn` scripts and the checks carry the rules whether or not a skill is used.
