# As-built — MIG-7

## Shipped against the contract

- C1: `tooling/lib/assess/preconditions.ts` runs every rule in one pass and the CLI prints `FAIL <id>: <fix>` per failure; `tooling/migrate-assess-check.test.ts` builds one scratch repo per start failure, each with a bare `origin` so pushed and unpushed states are real: a dirty tree with an untracked file (`clean-tree`), a detached HEAD (`on-a-branch`), the protected branch checked out (`not-on-protected`), own commits beyond the fork point (`fork-point-clean`), no remote copy or a differing one (`protected-pushed`), an existing `toolkit.json` (`no-toolkit-json`), a tracked local settings file (`local-settings-untracked`), Node below 22.18 (`node-floor`, driven by `PEM_ASSESS_NODE_VERSION`); the clean repo on a fresh branch off a pushed protected branch exits 0.
- C2: a migration branch cut from a newer pushed branch while `--protected main` names a stale `main` fails `protected-holds-fork` with "set the protected branch to the branch work merges into"; the same repo passes with `--protected feature/workflow`. A branch behind the protected tip fails the same rule with the reset fix; a branch cut from `origin/main` over a stale local `main` fails `protected-pushed` alone.
- C3: several failures list in one run; `--json` carries them as `preconditions` with `ok: false` beside the whole data contract; a missing `--protected` is its own failure (`protected-named`); `--end` or `--protected` without `--check` is a usage error (exit 2).
- C4: `--check --end` skips `clean-tree`, `fork-point-clean` and `no-toolkit-json`, passes with commits on the migration branch and a dirty tree, and fails when the protected branch moved past the fork point ("moved during the day") or a local settings file is tracked.
- C5: `evidence/C5-node-floor.md`: the Node v22.18.0 release notes (2025-07-31) carry "Type stripping is enabled by default" and the commit "module: unflag --experimental-strip-types"; `NODE_FLOOR` is `22.18.0`; this machine ran v22.22.2.
- C6: tooling types pass.

## Deviations

- [ASSUMPTION] The remote copy is read at `refs/remotes/origin/<protected>`, never through `@{upstream}`, as the runbook's step 0 and MIG-10's note ask: two of the three repos push branches with no upstream configured. A branch behind, ahead of or diverged from its remote copy all fail `protected-pushed`.
- [ASSUMPTION] A stale protected branch is told from the migration branch's own commits by whether any remote-tracking branch contains HEAD: commits a remote branch holds were pushed before the run and belong to the branch work really merges into (`protected-holds-fork`); commits no remote holds are the migration branch's own (`fork-point-clean`). At the end, `protected-holds-fork` asks only that the protected tip is still behind HEAD.
- [ASSUMPTION] The start set has eleven rules, not seven: `on-a-branch`, `protected-named` and `protected-exists` guard the inputs the seven failures need, and a detached HEAD or a missing branch name is reported rather than crashing the others. The seven failures the contract names each have their scratch repo.
- [ASSUMPTION] The Node version is injected through `PEM_ASSESS_NODE_VERSION` for the tests; the predicate is exported and tested on its own. Node itself enforces the floor first: below 22.18 an unflagged `node tooling/migrate-assess.ts` fails to load before any rule runs, so the rule fires only under `--experimental-strip-types` on 22.6 to 22.17 or through the override.
- Review round 1 (Vigil, Q2, FAIL on one red): a migration branch strictly behind the protected tip passed the start check (the merge base was HEAD, not the tip); now `protected-holds-fork` fails it with its own fix, a reset to the protected tip, since "set the protected branch" is the wrong instruction there. Orange fixed: every fixture pushes without an upstream, so a rewrite around `@{upstream}` fails the suite. Yellows fixed: `--protected` resolves `refs/heads/<name>` only, so `origin/main` is named as no local branch; the own-commits heuristic ignores `origin/<current branch>` (a migration branch pushed on an earlier attempt still owns its commits) and a HEAD held by `origin/<protected>` leaves the message to `protected-pushed` alone; the clean-pass test snapshots the tree, `.git` included, before and after. Greys noted: `no-toolkit-json` reads the index (a gitignored copy passes; an untracked one fails `clean-tree`); dependent rules are not emitted when `protected-exists` fails; the C5 date is UTC (2026-10-08T00:xx) against the harness's local 2026-10-07.
- Review round 2 (Vigil, Q2, PASS): every round-1 finding met in code and on real git state; no stale or behind state exits 0. Its yellows and greys are drafted as MIG-19 (precondition-messages): the diverged case (own commits and a moved protected branch) names the rename fix where a fresh branch is the fix; `no-toolkit-json` is emitted under `--end` when `--protected` is missing; the fix strings' counts resolve a tag of the same name; "1 commits".
- The contract's Build notes list `rev-parse --abbrev-ref <protected>@{upstream}` as a mechanism; the code reads `refs/remotes/origin/<protected>` instead, as the runbook's step 0 and MIG-10 rule, and never an upstream.
- `--check` prints the preconditions alone in markdown; with `--json` the whole data contract is printed, signals included, since the runbook files one document.

## Not verified

- C5 is manual: the release-notes fact was read on the web on 2026-10-08 and filed; the predicate is under C1.
- Nothing has run against a real repo (settled). The runbook's status line still says the flags "land in MIG-7"; MIG-10's text drops that clause when the epic closes.

## Next

The runbook's steps 0 and 8 can now run as written; MIG-11's changelog bullet names MIG-6 and MIG-7 as built.
