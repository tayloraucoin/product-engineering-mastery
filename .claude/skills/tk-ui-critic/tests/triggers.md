# tk-ui-critic — trigger tests

The skill is manual only (`disable-model-invocation: true`, `docs/design/skills.md` trigger table): a person's slash command must invoke it, and no plain-language request may. Observed 2026-10-08 on Claude Code (desktop, Code tab), model `claude-opus-5-5`.

## Must invoke (typed by a person)

| #   | Prompt                                  | Observed                                                                  |
| --- | --------------------------------------- | ------------------------------------------------------------------------- |
| 1   | `/tk-ui-critic records-table`           | Not yet observed: only a person can type a slash command. Operator check. |
| 2   | `/tk-ui-critic settings --round 2`      | Not yet observed: operator check.                                         |
| 3   | `/tk-ui-critic record-form`             | Not yet observed: operator check.                                         |
| 4   | `/tk-ui-critic onboarding --round 3`    | Not yet observed: operator check.                                         |
| 5   | `/tk-ui-critic record-detail --round 4` | Not yet observed: operator check; expected to invoke and refuse round 4.  |

The harness discovers the skill: the agent's own `Skill` call for `tk-ui-critic` was refused by name ("cannot be used with Skill tool due to disable-model-invocation"), not reported unknown.

## Must not invoke (plain language)

| #   | Prompt                                         | Observed                                                                                           |
| --- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 6   | "Review the records table design."             | Not invoked: the skill is out of the model-invocable listing, and a model `Skill` call is refused. |
| 7   | "Does the settings page look right to you?"    | Not invoked: as 6.                                                                                 |
| 8   | "Critique this screen against the canon."      | Not invoked: as 6.                                                                                 |
| 9   | "Check the delete dialog for slop tells."      | Not invoked: as 6.                                                                                 |
| 10  | "Build DEMO-17 and fix what the critic finds." | Not invoked: as 6; the build thread runs `tk-batch`.                                               |

Evidence for 6 to 10: the refused `Skill` call above, and `yarn budget`, whose model-invocable count is 3 (`tk-batch`, `tk-prompt`, `tk-motion`) with `tk-ui-critic` installed, so it is not among them.
