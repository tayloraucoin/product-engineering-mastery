---
id: WEB-8
size: medium
objective: "This repo's database runs hosted-only by default: a fresh copy of either example file points the scripts and the app at the staging tier, no db:* command or test silently reaches a local port, and the Docker database stays a one-line opt-in through the add recipe."
slice_type: "Defaults and guards in the database package and its docs; the risk is a script or test that still resolves an unset or hosted tier to the local address, or a doc that still calls the local database the default."
non_negotiables:
  - "An unset DATABASE_ENVIRONMENT never resolves to the local database in packages/db: every db:* script refuses with one line naming the variable and the example file's default."
  - "db:local, db:local:full, db:local:reset and test:db say in their first line that they need the Docker database, and exit before touching Docker or a URL when the tier is not local."
  - "db:migrate and db:setup on a hosted tier reach only the URL the tier's own variable names, or refuse naming it; a _LOCAL value is never read on a hosted tier."
  - "The local-database machinery (scripts, integration tests, the CLI config, the mirror) is kept whole: the add recipe switches it on by the tier alone."
  - "The thread reads and prints no env value; no production variable changes; no new dependency."
  - "yarn verify stays green with no Docker daemon."
devs_call: "The names of the shared tier guard, the test:db wrapper and the test file; the wording of each refusal."
cites:
  - "D-STK-3"
  - "D-STK-6"
  - "D-STK-18"
  - "EN-08"
  - "EN-13"
truth_files: "none: no user-facing behaviour changes; this is the database package's defaults, scripts and docs"
qa: Q3
reviewers:
  - warden
focus:
  - "every db:* command and every test either reaches the hosted tier the operator chose or refuses clearly; nothing silently reaches a local port (warden)"
operator_review: false
planned_paths:
  - ".env.example"
  - "packages/db/.env.example"
  - "packages/db/package.json"
  - "packages/db/scripts/env.ts"
  - "packages/db/scripts/supabase-cli.ts"
  - "packages/db/scripts/local.ts"
  - "packages/db/scripts/local-full.ts"
  - "packages/db/scripts/migrate.ts"
  - "packages/db/scripts/setup.ts"
  - "packages/db/scripts/seed-users.ts"
  - "packages/db/scripts/reset-local-db.ts"
  - "packages/db/scripts/reset-local-db.test.ts"
  - "packages/db/scripts/test-db.ts"
  - "packages/db/scripts/tier-guard.test.ts"
  - "packages/db/test/"
  - "docs/runbooks/new-project/README.md"
  - "docs/runbooks/add/docker-local-database.md"
  - "docs/runbooks/remove/supabase-database.md"
  - "docs/engineering/tech-stack.md"
  - "docs/engineering/codebase-conventions.md"
  - "docs/engineering/tooling.md"
  - "docs/decisions/changelog.md"
  - "specs/web/one-offs/WEB-008-hosted-only-database/"
depends_on: []
out_of_scope:
  - "Applying the pending migrations to staging (STK-9, STK-16): the operator has no staging project set up yet."
  - "The web app's own tier parsing (@pem/env parseTier, apps/web/env.ts): unset stays local for the app, as EN-08 says."
  - "Deleting or weakening the local-database machinery; the production tier; tooling/doctor.ts, which probes no database port today."
  - "Rewriting STK-11's C4 and C5 evidence files: they are merged records with recorded hashes (E-24), so the add recipe carries the note instead."
criteria:
  - id: C1
    statement: "With DATABASE_ENVIRONMENT unset, db:migrate, db:setup, db:local, db:local:reset and test:db exit 1 with one line naming the variable and the example file's default, and never resolve or print the local address."
    evidence: test
    command: "yarn workspace @pem/db test"
  - id: C2
    statement: "With DATABASE_ENVIRONMENT=staging: db:local, db:local:full, db:local:reset and test:db say in their first line that they need the Docker database and exit 1 before calling Docker; db:migrate and db:setup with only _LOCAL URLs set refuse naming the _STAGING variable and never print the local address."
    evidence: test
    command: "yarn workspace @pem/db test"
  - id: C3
    statement: "yarn verify exits 0 with no Docker daemon running."
    evidence: manual
    reason: "yarn verify is never a criterion; the batch-close run is recorded as evidence beside Docker's own 'cannot connect' line"
  - id: C4
    statement: "With DATABASE_ENVIRONMENT=local and the Docker database up, yarn test:db passes: the local path is unchanged."
    evidence: manual
    reason: "needs the Docker daemon, which neither the sandbox nor this machine has running; the operator runs it with the steps in the evidence file"
  - id: C5
    statement: "Types pass across the workspaces."
    evidence: check
    command: "yarn check-types"
  - id: review:warden
    statement: Warden reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run warden <id>
---

# Contract — WEB-8 hosted-only-database

## Build notes

- **Approach:** three moves. (1) The defaults: both example files set `DATABASE_ENVIRONMENT=staging` with one comment line saying this repo runs no local database by default and the add recipe adds one; the `_LOCAL` URLs stay filled with the CLI's default loopback address, which is only read on the local tier, so the add recipe is one line and step 5 of the new-project guide becomes "nothing to do". (2) The guards: `packages/db/scripts/env.ts` stops exporting an eagerly parsed `tier`; `requireTier()` refuses an unset or empty value naming the variable and the example file's default, and the URL resolvers and auth settings call it, so importing a script never throws. `supabase-cli.ts` gains `requireLocalTier(command)`, called first by `preflight`, so `db:local` and `db:local:full` print the Docker line before any `docker` call; `db:local:reset` keeps its own refusal, now naming Docker and the add recipe; a new `scripts/test-db.ts` wraps `node --test` for `test:db` with the same first line. (3) The docs: the new-project guide (round D, step 5, the desk walk), the add recipe, the remove runbook, the tech stack, the conventions and the tooling reference describe hosted-only as the default and point at the add recipe; one bullet under the existing Docker ruling in the changelog.
- **Decisions that apply:** D-STK-3 / EN-08: one tier switch, `_LOCAL` / `_STAGING` suffixes, `scripts/env.ts` the package's only reader; "default local" stays true for the apps and is no longer true for the database scripts. D-STK-6: the two local modes stay, selected by the `_LOCAL` auth values. D-STK-18: agents never reset or drop a database; the ask rules on `db:migrate`, `db:setup`, `db:seed-users` and `db:local:reset` are untouched. EN-13: the local port warning stays. The Docker ruling (changelog 2026-10-05): a new project runs hosted-only unless the operator asks for Docker; this ticket makes the starter carry the same default.
- **Interfaces:** `requireTier(): Tier` and `requireLocalTier(command)` replace the `tier` export; `migrationUrl()`, `runtimeUrl()`, `authSettings()`, `authUrlName()` unchanged in shape; `yarn test:db` runs `scripts/test-db.ts`.
- **Per path:**
  - `.env.example`, `packages/db/.env.example`: the default and its comment; "unset means local" lines rewritten.
  - `packages/db/scripts/env.ts`: `requireTier`, lazy everywhere.
  - `packages/db/scripts/supabase-cli.ts`: `requireLocalTier`, first in `preflight`.
  - `packages/db/scripts/local.ts`, `local-full.ts`, `migrate.ts`, `setup.ts`, `seed-users.ts`, `reset-local-db.ts`, `packages/db/test/*.test.ts`: call `requireTier()` instead of importing `tier`; refusals name Docker and the add recipe.
  - `packages/db/scripts/test-db.ts`, `packages/db/package.json`: the `test:db` wrapper.
  - `packages/db/scripts/tier-guard.test.ts`: C1 and C2, by spawning each script with a minimal env, as `reset-local-db.test.ts` does.
  - The docs listed above; `specs/web/one-offs/WEB-008-hosted-only-database/`: the ticket.
- **Gotchas:** `supabase-cli.test.ts` and `reset-local-db.test.ts` import modules that import `env.ts`, so nothing in `env.ts` may throw at module load. The spawn tests pass no `.env.local`: they call `node <script>` directly, not the yarn script. `tooling/doctor.ts` probes ports 3000 and 3001 only; there is no local-port expectation to remove. STK-11's deferred evidence files carry recorded hashes and their `results.json` is merged, so they cannot be rewritten without tripping `check-specs`.
- **Model:** Fable 5.1; a smaller model flips the example files and leaves the eager `tier` export, which breaks `yarn test` at import.
