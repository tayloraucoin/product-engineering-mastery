# tk-motion trigger test (CF-30) — DEMO-15 C1

Method: a fresh-context subagent (Haiku) saw only the model-invocable listing (`tk-motion` description, plus `shadcn`, `tk-prompt`, `tk-batch`) and chose skills for ten tasks, from descriptions alone. This tests description matching, not the live harness; re-run in a fresh session if the description changes.

| # | Task | Motion? | tk-motion fired | Right? |
|---|------|---------|-----------------|--------|
| 1 | Fade in and out on the settings dialog | yes | yes | yes |
| 2 | Toast slide-in with reduced-motion fallback | yes | yes | yes |
| 3 | Review the delete dialog's transitions against motion rules | yes | yes | yes |
| 4 | Fix janky sidebar drawer easing | yes | yes | yes |
| 5 | Skeleton with shimmer on the records table | yes | yes | yes |
| 6 | Reorder table columns | no | no | yes |
| 7 | Fix typo in empty-state copy | no | no | yes |
| 8 | Primary button background to a token | no | no | yes |
| 9 | aria-label on icon-only close button | no | no | yes |
| 10 | Sortable amount header, right-aligned numbers | no | no | yes |

Result: fired on 5 of 5 motion tasks and 0 of 5 non-motion tasks. CF-30 threshold is more than 1 of 5, so the skill stays model-invocable (no `disable-model-invocation`).
