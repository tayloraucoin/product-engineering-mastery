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
- C7: `check-stack` sits in `yarn verify` after `check-refs`. The full chain **fails**, for two reasons outside this ticket (Deviations). Every other step passes.

## Deviations

- **C7 is FAIL, from two causes outside STK-2's code:**
  - **check-specs:** this branch is stacked on STK-1, which is closed but not merged into `main`. STK-1's recorded PASSes therefore read as stale here. Taylor ruled on 2026-10-03 not to wait for merges, so this stays until STK-1 merges.
  - **budget:** the evaluator pass is 7,075 of 7,000 tokens. `contract:init` added three review criteria, taking this contract from 654 to 810 tokens. On top of `technical.md` (1,980) and vigil's body (4,285), that crosses the cap. Taylor owns raising the cap in `docs/index.md`.
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

- review:mason, review:vigil and review:warden have not run.
- A wildcard turbo entry (`STRIPE_*`) is not matched against a removed variable.
- `boundaries` names are validated for shape, but not checked against `packages/config/eslint/boundaries.js`.
- A `yarn check-stack` run in the sandbox will fail loudly once STK-4 creates a real `.env.example`, because the settings deny reading it. The check reports the unread file; it never skips it.

## Model

claude-opus-5-5, Claude Code 2.1.232

## Next

Merge STK-1 and raise the evaluator-pass cap. Then rerun `yarn contract:run STK-2 C7`, and run `/tk-close STK-2` for the three reviews. The next build prompt is `prompts/07-build-STK-3.md`.
