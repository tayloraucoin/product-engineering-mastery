---
id: WEB-10
size: small
objective: "The commit-msg hook reads the branch of a repo with no commits yet, so a product's first commit after the new-project guide's git init passes it."
slice_type: "Repo tooling; the risk is a hook that crashes on a fresh repo, or a branch read that changes for every other caller."
non_negotiables:
  - "On an unborn branch the hook reads the branch name and applies the work-id rule as on any branch."
  - "On a detached HEAD and on an ordinary branch the branch read is unchanged for every caller of getCurrentBranch."
  - "No hook is skipped or weakened: a message without a work-id on an agent branch still fails."
devs_call: "Where the branch read lives."
cites:
  - "A9"
truth_files: "none: no living UX file covers the repo's git hooks"
reviewers: []
planned_paths:
  - "tooling/lib/git.ts"
  - "tooling/git-hooks/commit-msg.ts"
  - "tooling/git-hooks.test.ts"
  - "specs/web/one-offs/WEB-010-commit-msg-unborn-branch/"
depends_on: []
out_of_scope:
  - "bash-guard's branch read, which already answers null on an unborn branch and so admits the commit."
criteria:
  - id: C1
    statement: "On a fresh git init with an agent branch and no commits, the commit-msg hook passes a message with a work-id and fails one without."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "The full chain passes."
    evidence: check
    command: "yarn verify"
qa: Q1
---

# Contract — WEB-10 commit-msg-unborn-branch

## Notes

Found by STK-20's second dry run (stop 11): the new-project guide runs `git init` and `git switch -c agent/<work-id>`, and the first commit's commit-msg hook ran `git rev-parse --abbrev-ref HEAD`, which fails on an unborn branch, so the hook threw.
