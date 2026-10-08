# Synthetic transcripts for `yarn cost`

Every record is synthetic. `tooling/cost.test.ts` copies `repo/` to `<config>/projects/<slug>/`, `worktree/` to `<slug>--claude-worktrees-w1/` and `other-project/` to a folder whose name does not start with the slug. Two sessions (`s2` resumes `s1` and copies its first three messages) and one reviewer subagent; `m2` and `m3` are each written as two records of one message id. No `case.json`, so `check-specs` does not read this folder as a specs case.
