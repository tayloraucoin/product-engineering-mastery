---
epic: MIG
status: draft
---

# MIG — the overlay tier across tooling and hooks, and the record

> Detail for calls T3 and T9 (`../technical.md`). Mason, with Lorimer consulted, 2026-10-06. Every "today" below is verified by reading the cited script on 2026-10-06. Nothing here changes behaviour at the `starter` tier: this repo's fixtures and `yarn verify` are the regression guard.

## T3 One layout probe, read everywhere

New: `tooling/lib/layout.ts`. It imports node built-ins only, so the hooks can import it. It answers:

- `hasTurbo`: `turbo.json` exists, and which of `lint` and `check-types` it defines
- `workspaces`: from the root `package.json`, or `[]`
- `codeRoots`: each `toolkit.apps[*].path` plus each workspace folder; `"."` for a single app
- `hasSpecsRoot`
- `scripts`: the root `package.json` script names

Placement follows the consumer rule: eleven scripts and three hooks read it, so it lives in `tooling/lib/`. **Beat:** a check in each script (eleven copies of one probe), and a separate light copy of the tooling, which would be a second adoption mode and is excluded.

| Script or hook                                                                                      | Assumes today                                                                                                         | Under overlay                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verify-fast.ts` (run by `stop-gate.ts` at every stop)                                              | Turbo filters; code is `^(apps\|packages)/`; calls `check-types:tooling`, `lint:docs`, `check-settings`, `test:hooks` | Turbo step only when `hasTurbo` and the tasks exist. Otherwise ESLint on the changed files under `codeRoots` (when an ESLint config exists), plus the repo's type-check script once. Each toolkit step runs only when its script exists. A step it cannot run is named in the output and never silently passed. Without this, every stop blocks on TA (Risk 1) |
| `stop-gate.ts`                                                                                      | Nothing beyond `verify-fast`                                                                                          | No change; one fixture case on the single-app repo                                                                                                                                                                                                                                                                                                             |
| `session-start.ts`                                                                                  | `SPINE` includes `docs/index.md`                                                                                      | The spine is the three files that exist. Layer 1 writes all three; the probe covers a run stopped part-way                                                                                                                                                                                                                                                     |
| `bash-guard.ts`                                                                                     | `readLayout`; specs root for epic prefixes and as-built checks                                                        | Already works with no specs root (no epics: toolkit and app prefixes only). No change. Its registration moves by ruling (`layer-1.md`)                                                                                                                                                                                                                         |
| `results-gate.ts`                                                                                   | Specs root                                                                                                            | Does nothing when the root is absent. No change; one fixture                                                                                                                                                                                                                                                                                                   |
| `git-hooks/pre-commit.ts`, `commit-msg.ts`                                                          | `readLayout`                                                                                                          | No change. They reach only a clone that ran `yarn hooks:install` (`core.hooksPath` is local config), so they never reach a teammate who did not opt in                                                                                                                                                                                                         |
| `budget.ts`                                                                                         | Reads the caps from `docs/index.md`; three `apps/web/...` example files; nested `AGENTS.md` under app paths           | Example files from the probe, with absent ones skipped and named; nested files under `codeRoots`; caps unchanged                                                                                                                                                                                                                                               |
| `check-specs.ts`                                                                                    | Specs root; apps from `toolkit.json` plus `_shared`                                                                   | Works on an empty tree. One fixture with the migration epic and a drafted gap ticket                                                                                                                                                                                                                                                                           |
| `check-settings.ts`                                                                                 | Required denies include `git push`; hooks registered in the tracked file                                              | Overlay: the floor (`layer-1.md`) in the tracked file; hook registrations accepted from either file; `doctor` checks the local one. Starter: unchanged                                                                                                                                                                                                         |
| `check-refs.ts`                                                                                     | Walks `docs/`, `apps/`, `packages/`, `.claude/`, `.github/`                                                           | Overlay: only the manifest's copied and derived paths. Host docs are left alone, as `lint:docs` already does                                                                                                                                                                                                                                                   |
| `gen-agents.ts`                                                                                     | `docs/roles/**`                                                                                                       | Already skips a file whose frontmatter lacks `subagent: true` (verified, `build()`). One fixture with a host role file that has no frontmatter                                                                                                                                                                                                                 |
| `doctor.ts`                                                                                         | Ports 3000 and 3001                                                                                                   | Ports are a warning only. Adds the operator-settings check                                                                                                                                                                                                                                                                                                     |
| `contract.ts`, `status.ts`, `spec-init.ts`, `review-run.ts`, `truth-promote.ts`, `specs-archive.ts` | Specs root, `docs/roles`, `.claude/agents`                                                                            | Installed with what they read. Covered by one end-to-end case: `contract:init` then `status` in the fixture                                                                                                                                                                                                                                                    |
| `lint-frontmatter.ts`, `directory-map.ts`                                                           | —                                                                                                                     | Already skip under overlay (verified). Unchanged                                                                                                                                                                                                                                                                                                               |

**Starter only, not installed on day one:** `check-stack`, `check-catalog`, `check-ui-layout`, `contrast-audit`, `check-client-bundle`, `check-migrations` (in `@pem/db`), the token lint, the boundaries config. Each arrives with its layer 3 part.

### The proof here

`tooling/overlay.test.ts` builds a single-app scratch repo with `tooling/lib/scratch-repo.ts`:

- no `workspaces` and no `turbo.json`
- the app at the root
- `toolkit.json` at tier `overlay` with `apps.web.path` `"."`
- a `prettier --write` format script
- no CI and no specs root

It runs every installed script and hook as a subprocess, with and without the specs root:

- `verify:fast` passes on a clean edit and fails on a type error;
- the stop gate never blocks on a missing Turbo;
- `check-settings` passes the floor-only file;
- `check-reviewers` fails a zero-match row;
- `budget` passes.

It runs in `yarn test:tooling` and so in `yarn verify`. A monorepo without Turbo is not a separate fixture. The probe's branches are unit-tested in `tooling/lib/layout.test.ts`.

**QA flag, once.** The ticket edits `tooling/hooks/session-start.ts` (a Warden row in `toolkit.json`) and `check-settings.ts` (agent permissions, a Q3 trigger in `AGENTS.md`), so it is a Q3 path. Recommended: Q3, with Warden and Mason. Confirmed at the Tickets gate.

## T9 Records and plan mode

- **Record 0012, "Adoption tiers".** Recommended. It records:
  - `starter`, `overlay` and `overlay-local` as the only adoption modes;
  - that overlay leaves host docs alone;
  - the tracked floor and the operator's local layer;
  - the probe as the one home for layout facts beyond `toolkit.json`;
  - its exit: a repo leaves overlay for starter only when layer 3 is done.

  The engineering-layer report proposed it as "record 0010, proposed" (verified: `docs/research/engineering/engineering-layer-report.md`); 0010 was later used for the default stack (verified: `docs/decisions/records/`), so this one takes the next free number. It is hard to undo once product repos carry the tier, so it is a record, not a ledger line. **Plan mode is required (CLAUDE.md); its ticket writes it, this thread does not.**

- **Ledger lines.** Reviewer rows take `imports`; `check-reviewers` fails a zero-match row under overlay. Changelog: one entry at the epic's close.
- **Workspace-package boundary.** None changes. `tooling/` is not a workspace (verified: root `package.json` `workspaces` is `apps/*`, `packages/*`), and nothing in `apps/` or `packages/` is touched.
- **Other plan-mode files.** `docs/index.md` and `docs/design/canon.md` are not changed: the new track and runbook join the two README tables only.
