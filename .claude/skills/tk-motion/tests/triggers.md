# tk-motion trigger tests

Re-run whenever this description or any other model-invocable description changes. The threshold is CF-30's: a skill that fires wrongly on more than 1 of 5 must-not tasks loses model invocation.

Method, 2026-10-08: one fresh-context subagent on `claude-opus-5-5` was given the full model-invocable listing as `yarn budget` counts it: the skills `tk-prompt`, `tk-batch` and `tk-motion` and the subagents `alembic`, `assay`, `compass`, `tally` and `vigil`, with their descriptions as committed. It saw no skill body and was given the ten tasks shuffled and unlabelled. For each task it named every entry it would load. This tests matching on descriptions alone, not the live harness. Musts 1, 2 and 4 probe the toast, press-feedback and drawer wording that this description dropped. The previous run, on Haiku with the longer description, is DEMO-15's `evidence/triggers.md`.

## Must invoke

| #   | Task                                                                      | Loaded    |
| --- | ------------------------------------------------------------------------- | --------- |
| 1   | The toast slides in too fast; fix it and give it a reduced-motion version | tk-motion |
| 2   | Add press feedback to the primary button                                  | tk-motion |
| 3   | Add a fade and scale enter to the settings dialog                         | tk-motion |
| 4   | The sidebar drawer's easing feels janky; fix it                           | tk-motion |
| 5   | Review the delete dialog's transitions against the motion rules           | tk-motion |

## Must not

| #   | Task                                                         | Loaded   |
| --- | ------------------------------------------------------------ | -------- |
| 1   | Fix the typo in the records table's empty-state copy         | none     |
| 2   | Build DEMO-21                                                | tk-batch |
| 3   | Score the records table against the rubric from its captures | assay    |
| 4   | Change the primary button's background to a token            | none     |
| 5   | Make the amount column sortable, with right-aligned numbers  | none     |

Result: 5 of 5 fired and 0 of 5 wrongly. The skill stays model-invocable.
