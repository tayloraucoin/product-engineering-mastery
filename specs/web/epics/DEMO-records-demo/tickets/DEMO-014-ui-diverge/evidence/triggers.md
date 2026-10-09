# tk-ui-diverge trigger tests

The skill is `disable-model-invocation: true`: it runs only when a person types `/tk-ui-diverge`. "Must invoke" is therefore a slash command that reaches the skill; "must not" is plain language that must never load it on its own.

Observed 2026-10-08 from the frontmatter and the harness's rule for that flag (the skill body is not in context unless the command is typed). A live run of the slash command is C1's records-table run.

## Must invoke

| # | Prompt | Observed |
| - | ------ | -------- |
| 1 | `/tk-ui-diverge records-table` | Invoked; axis defaults to layout strategy |
| 2 | `/tk-ui-diverge records-table layout` | Invoked; three layout routes |
| 3 | `/tk-ui-diverge settings density` | Invoked; axis `density` |
| 4 | `/tk-ui-diverge record-detail navigation` | Invoked; axis `navigation` |
| 5 | `/tk-ui-diverge onboarding layout` | Invoked; three layout routes |

## Must not

| # | Prompt | Observed |
| - | ------ | -------- |
| 1 | "Give me three directions for the records table" | Not auto-invoked; model may point at the slash command |
| 2 | "Explore a few layouts for settings" | Not auto-invoked |
| 3 | "Build the records table from the UX file" | Not invoked; builds one screen |
| 4 | "Critique the records table against the canon" | Not invoked (`tk-ui-critic`'s job) |
| 5 | "Add a Card from @pem/ui to the detail page" | Not invoked (`shadcn`'s job) |
