# As-built — MIG-7

## Shipped against the contract

- C1: `tooling/lib/assess/preconditions.ts` runs every rule in one pass and the CLI prints `FAIL <id>: <fix>` per failure; `tooling/migrate-assess-check.test.ts` builds one scratch repo per start failure, each with a bare `origin` so pushed and unpushed states are real: a dirty tree with an untracked file (`clean-tree`), a detached HEAD (`on-a-branch`), the protected branch checked out (`not-on-protected`), own commits beyond the fork point (`fork-point-clean`), no remote copy or a differing one (`protected-pushed`), an existing `toolkit.json` (`no-toolkit-json`), a tracked local settings file (`local-settings-untracked`), Node below 22.18 (`node-floor`, driven by `PEM_ASSESS_NODE_VERSION`); the clean repo on a fresh branch off a pushed protected branch exits 0.
- C2: a migration branch cut from a newer pushed branch while `--protected main` names a stale `main` fails `protected-holds-fork` with "set the protected branch to the branch work merges into"; the same repo passes with `--protected feature/workflow`.
- C3: several failures list in one run; `--json` carries them as `preconditions` with `ok: false` beside the whole data contract; a missing `--protected` is its own failure (`protected-named`); `--end` or `--protected` without `--check` is a usage error (exit 2).
- C4: `--check --end` skips `clean-tree`, `fork-point-clean` and `no-toolkit-json`, passes with commits on the migration branch and a dirty tree, and fails when the protected branch moved past the fork point ("moved during the day") or a local settings file is tracked.
- C5: `evidence/C5-node-floor.md`: the Node v22.18.0 release notes (2025-07-31) carry "Type stripping is enabled by default" and the commit "module: unflag --experimental-strip-types"; `NODE_FLOOR` is `22.18.0`; this machine ran v22.22.2.
- C6: tooling types pass.

## Deviations

- [ASSUMPTION] The remote copy is read at `refs/remotes/origin/<protected>`, never through `@{upstream}`, as the runbook's step 0 and MIG-10's note ask: two of the three repos push branches with no upstream configured. A branch behind, ahead of or diverged from its remote copy all fail `protected-pushed`.
- [ASSUMPTION] A stale protected branch is told from the migration branch's own commits by whether any remote-tracking branch contains HEAD: commits a remote branch holds were pushed before the run and belong to the branch work really merges into (`protected-holds-fork`); commits no remote holds are the migration branch's own (`fork-point-clean`). At the end, `protected-holds-fork` asks only that the protected tip is still behind HEAD.
- [ASSUMPTION] The start set has eleven rules, not seven: `on-a-branch`, `protected-named` and `protected-exists` guard the inputs the seven failures need, and a detached HEAD or a missing branch name is reported rather than crashing the others. The seven failures the contract names each have their scratch repo.
- [ASSUMPTION] The Node version is injected through `PEM_ASSESS_NODE_VERSION` for the tests; the predicate is exported and tested on its own.
- `--check` prints the preconditions alone in markdown; with `--json` the whole data contract is printed, signals included, since the runbook files one document.

## Not verified

- C5 is manual: the release-notes fact was read on the web on 2026-10-08 and filed; the predicate is under C1.
- Nothing has run against a real repo (settled). The runbook's status line still says the flags "land in MIG-7"; MIG-10's text drops that clause when the epic closes.

## Next

The runbook's steps 0 and 8 can now run as written; MIG-11's changelog bullet names MIG-6 and MIG-7 as built.
