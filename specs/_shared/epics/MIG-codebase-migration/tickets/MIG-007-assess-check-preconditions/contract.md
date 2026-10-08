---
id: MIG-7
size: small
objective: "yarn migrate:assess <target> --check --protected <branch> exits 1 with each failed precondition and its fix before a run writes anything, and again before the last commit, so a stale protected branch or a dirty tree stops the day at minute one."
slice_type: "Git-state checks in a read-only command; the risk is a check that passes a stale base (Risk 3) or an unpushed branch (Risk 8), or that reads the protected branch from origin/HEAD."
non_negotiables:
  - "The start set fails, each with a one-line fix, when: the tree is not clean (untracked included); HEAD is detached or on the protected branch; the current branch has commits beyond its fork point from the protected branch; the protected branch has no remote copy or differs from it; the protected branch does not hold the fork point (its tip is not the current branch's merge base); toolkit.json exists or .claude/settings.local.json is tracked; Node is below 22.18."
  - "The protected branch is given with --protected and never read from origin/HEAD or the repo's default branch."
  - "--check --end runs before the last commit: it skips the clean-tree, ahead-of-fork and toolkit.json rules and still fails on a detached HEAD, the protected branch moved or unpushed, a tracked local settings file, or Node below 22.18."
  - "Every failure is reported in one run, not the first only; the exit code is 1 when any fails and 0 otherwise; --json includes preconditions { id, ok, fix }."
  - "The Node 22.18 floor is verified against the Node release notes and dated in the as-built, with the Node version this machine ran."
  - "Node built-ins only, as MIG-5 rules; the check writes nothing."
devs_call: "Precondition ids and fix wording, how the Node version is injected for the test (an environment override or an exported predicate), and how the end set is selected."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/technical.md"
  - "T4"
truth_files: "none: repo tooling; no living UX file changes"
qa: Q2
reviewers:
  - vigil
focus: []
operator_review: false
planned_paths:
  - "tooling/migrate-assess.ts"
  - "tooling/lib/assess/**"
  - "tooling/migrate-assess-check.test.ts"
depends_on:
  - MIG-5
out_of_scope:
  - "Creating or naming the migration branch, committing, or pushing: the operator and the runbook (MIG-8)."
  - "Commit 1's contents (toolkit.json, devDependencies, yarn.lock): the runbook."
  - "The push deny in the operator's settings: MIG-2 and the runbook."
  - "Scoring: MIG-5 and MIG-6."
criteria:
  - id: C1
    statement: "Seven scratch repos, one per start failure, each make --check exit 1 naming only that failure and its fix; the clean repo, on a fresh branch off a pushed protected branch, exits 0."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "A repo whose protected branch is stale (the current branch forks from a newer pushed branch) fails the fork-point rule and the fix says to set the protected branch to the branch work merges into."
    evidence: test
    command: "yarn test:tooling"
  - id: C3
    statement: "A repo with several failures at once lists every one in a single run, and --json carries them as preconditions with ok false."
    evidence: test
    command: "yarn test:tooling"
  - id: C4
    statement: "--check --end on a repo with commits on the migration branch and a dirty tree exits 0, and exits 1 when the protected branch has moved past the fork point or a local settings file is tracked."
    evidence: test
    command: "yarn test:tooling"
  - id: C5
    statement: "The Node floor: a version below 22.18.0 fails with a fix naming 22.18, and the floor is cited to the Node release that enabled type stripping by default, with the date checked."
    evidence: manual
    reason: "the release-notes fact is read on the web, not computed; the version predicate itself is under C1"
  - id: C6
    statement: "Tooling types pass."
    evidence: check
    command: "yarn check-types:tooling"
---

# Contract — MIG-0 assess-check-preconditions

## Build notes

- **Approach:** a `preconditions` module in `tooling/lib/assess/` with one function per rule, each returning `{ id, ok, fix }`, run by the CLI when `--check` is present (`--end` selects the end subset). Git facts come from `git` subprocesses in the target: `status --porcelain --untracked-files=all`, `symbolic-ref -q HEAD`, `rev-parse --abbrev-ref <protected>@{upstream}`, `rev-parse <protected>` against its upstream, `merge-base HEAD <protected>`, `rev-list --count <merge-base>..HEAD`, `ls-files --error-unmatch .claude/settings.local.json`. Tests build each case in `$TMPDIR` with a bare `origin` repository so pushed and unpushed states are real: `git init --bare`, `git remote add origin`, `git push -u`.
- **Decisions that apply:**
  - T4: "`migrate:assess --check` fails on a dirty tree, a detached or protected branch, a migration branch already ahead of its fork point, an unpushed base, a `protectedBranch` that does not hold the fork point, an existing `toolkit.json`, or Node below 22.18." Beat: "`protectedBranch` read from `origin/HEAD`." If wrong: "A stale diff base; the check is cheap to tighten."
  - assess.md, T4: "It runs before any write, and again before the last commit." Rule 5: "`protectedBranch` (asked, never read from `origin/HEAD`) does not hold the branch's fork point. That fails Risk 3's case, where synapse's `main` was stale." Rule 7: "Node is below 22.18. [secondary: type stripping runs `.ts` unflagged from Node 22.18.0. Verify at the ticket, dated; this machine runs 22.22.2.]"
  - brief.md, settled: "the target is committed and pushed before the run, and the procedure checks for it"; "One migration branch the operator creates and names before the run."
- **Interfaces:** `--check`, `--end` and `--protected <branch>` on `yarn migrate:assess`; `preconditions` in the JSON.
- **Per path:**
  - `tooling/migrate-assess.ts`: the flags; the report is skipped when `--check` runs alone.
  - `tooling/lib/assess/**`: the preconditions module.
  - `tooling/migrate-assess-check.test.ts`: C1 to C4, test names starting with the criterion id.
- **Gotchas:**
  - "Holds the fork point" means the protected tip equals `merge-base HEAD <protected>`. With a stale `main` behind `feature/workflow` the merge base is an old commit on `main`, so a naive ancestor test would pass; compare tips.
  - At the start the migration branch is fresh, so HEAD equals the protected tip; the ahead-of-fork rule is `rev-list --count` of 0.
  - `--protected` missing is itself a failure with the fix "name the branch work merges into"; the runbook's interview asks it.
  - The Node predicate compares `process.versions.node` as three numbers; make it injectable so C1 can test the floor without another Node.
  - Node built-ins only; C5 of MIG-5 pins the whole folder.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model tends to read `origin/HEAD` for the base, which is the beaten option.
