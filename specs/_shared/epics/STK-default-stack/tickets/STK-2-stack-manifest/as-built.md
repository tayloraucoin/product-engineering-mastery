# As-built — STK-2

## Shipped against the contract

- C1: `tooling/check-stack.ts` fails when a present module's listed file or folder is missing, naming the module and the path (fixture `c1-present-file-missing`).
- C2: a module marked `"removed": true` fails on each leftover, and each message names it:
  - a listed path that still exists;
  - a variable in any `.env.example`, including commented-out lines and the `_LOCAL` and `_STAGING` forms;
  - a variable in any `turbo.json`'s `globalEnv`, `globalPassThroughEnv`, or a task's `env` or `passThroughEnv`;
  - a dependency in any `package.json` field.

  Four fixtures each hold one kind of leftover. A `clean` fixture passes, including names that merely look similar (`GONE_SECRETARY`, `gone-sdk-extra`).

- C3: `validateStack` in `tooling/lib/toolkit.ts` fails a locked module marked removed (fixture `c3-locked-removed`).
- C4: `validateStack` names each missing field among `files`, `env`, `dependencies`, `boundaries`, `locked` and `runbook`, and rejects unknown fields (fixture `c4-missing-field`, one module per field).
- C5: a non-null runbook path that does not exist fails, naming the path (fixture `c5-runbook-missing`). A locked module's runbook must be null; a module that is not locked must name one.
- C6: `yarn check-types:tooling` passes.
- C7: `check-stack` sits in `yarn verify` after `check-refs`; the full chain passes (recorded at batch close, 2026-10-03).

## Deviations

- **C7 first failed for two causes outside STK-2's code,** both gone by batch close: stale STK-1 proofs on the shared branch (PR-15 made `check-specs` warn on work in flight) and the evaluator-pass budget (PR-15 raised it to 10,000).
- **The scratch-repo harness writes each stack runbook** (`tooling/lib/scratch-repo.ts`, `tooling/check-refs.test.ts`, added to the planned paths at batch close). STK-9's `db` entry was the first with a non-null runbook, and `toolkit.json` validation then failed in every scratch-repo tooling test.
- **devs_call, settled:**
  - The fields are named as in the contract.
  - Removal is marked by an optional `"removed": true`; leaving it out means present.
  - Unknown fields are rejected, so a typo such as `"remove"` cannot pass silently.
- **Fixtures commit `env.example`, not `.env.example`.** The repo's settings deny reading `.env*` files, so the test copies each fixture to `$TMPDIR` and renames the file there.
- **`toolkit.json`:** `config` lists only `@pem/config` as a dependency, because its tooling dependencies are shared by the whole repo. `ui` lists `@pem/ui`, `class-variance-authority`, `clsx` and `tailwind-merge`.

## Ledger IDs

none

## Migrations

applied: n/a

## Test changes

none

## Not verified

- Tier 1 under PR-15: reviewed with its batch in `../../_batch-review-2026-10-03.md` (the epic folder), not in `results.json`.
- A wildcard turbo entry (`STRIPE_*`) is not matched against a removed variable.
- `boundaries` names are validated for shape, but not checked against `packages/config/eslint/boundaries.js`.
- A `yarn check-stack` run in the sandbox will fail loudly once STK-4 creates a real `.env.example`, because the settings deny reading it. The check reports the unread file; it never skips it.

## Model

claude-opus-5-5, Claude Code 2.1.232

## Next

Closed. Each module ticket adds its own `stack` entry; STK-20's dry run proves the removal path end to end.
