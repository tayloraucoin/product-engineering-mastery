---
id: WEB-9
size: small
objective: "The starter's local tier is a Postgres on the developer's own machine, with no Docker and no Supabase project: a fresh copy of either example file names it, one command prepares it, and the database tests run against it."
slice_type: "A local-only setup script, a SQL shim for what Supabase's image provides, and the defaults and docs that make own-Postgres the local tier; the risk is the shim reaching a hosted database, or the script connecting before it has refused a wrong tier or host."
non_negotiables:
  - "db:setup:local refuses an unset or hosted tier, and a URL that is not this machine, in one line before any connection."
  - "The shim creates only what Supabase's image provides (roles anon, authenticated, service_role; the auth schema and auth.users) and never auth.identities; it is applied by db:setup:local alone, never by db:setup or a migration."
  - "The migrations, the setup SQL and the policies are unchanged: the own-Postgres path applies the same files Docker's and a hosted tier do."
  - "The Docker path (db:local, db:local:full, the add recipe) and the hosted path keep working; only the _LOCAL defaults and the docs move."
  - "The thread reads and prints no env value; no production variable changes; no new dependency."
devs_call: "The shim's file name and the script's wording; the local database's name (pem_local)."
cites:
  - "D-STK-3"
  - "D-STK-5"
  - "D-STK-6"
  - "D-STK-18"
truth_files: "none: no user-facing behaviour changes; this is the database package's local tier"
qa: Q2
reviewers: []
focus: []
operator_review: false
planned_paths:
  - ".env.example"
  - "package.json"
  - "packages/db/.env.example"
  - "packages/db/package.json"
  - "packages/db/supabase/local-shim.sql"
  - "packages/db/scripts/setup-local.ts"
  - "packages/db/scripts/env.ts"
  - "packages/db/scripts/supabase-cli.ts"
  - "packages/db/scripts/test-db.ts"
  - "packages/db/scripts/reset-local-db.ts"
  - "packages/db/scripts/tier-guard.test.ts"
  - "tooling/hooks/bash-guard.ts"
  - "tooling/hooks/fixtures/bash-guard.json"
  - "docs/runbooks/new-project/README.md"
  - "docs/runbooks/add/docker-local-database.md"
  - "docs/runbooks/remove/supabase-database.md"
  - "docs/engineering/codebase-conventions.md"
  - "docs/engineering/tooling.md"
  - "docs/decisions/changelog.md"
  - "specs/web/one-offs/WEB-009-local-postgres/"
depends_on: []
out_of_scope:
  - "Sign-in on the local tier without a Supabase project: the shim gives the database an auth.users table, not an auth server; users are inserted by SQL or mirrored from a hosted project later."
  - "Seeding users into the own-Postgres auth.users (db:seed-users stays Mode B only)."
  - "Applying migrations to a hosted tier; the production tier."
criteria:
  - id: C1
    statement: "db:setup:local with an unset tier, a hosted tier, or a local URL that is not this machine exits 1 with one line naming the problem, before connecting; test:db and db:local:reset on a hosted tier say in their first line that they need a local database."
    evidence: test
    command: "yarn workspace @pem/db test"
  - id: C2
    statement: "On this machine's own Postgres (Postgres.app, 127.0.0.1:5432), yarn db:setup:local creates pem_local, applies the shim, the two migrations, the four setup files and the mirror marker, and a second run changes nothing."
    evidence: manual
    reason: "a run against the operator's own Postgres; its output is the evidence"
  - id: C3
    statement: "yarn test:db passes against that database: row-level security, the local auth mirror, the reset and the Stripe event ledger."
    evidence: manual
    reason: "a run against the operator's own Postgres; its output is the evidence"
  - id: C4
    statement: "The bash guard asks before yarn db:setup:local and before the script run by path."
    evidence: check
    command: "yarn test:hooks"
  - id: C5
    statement: "Types pass across the workspaces."
    evidence: check
    command: "yarn check-types"
---

# Contract — WEB-9 local-postgres

## Build notes

- **Approach:** the local tier means a Postgres the developer already has (Postgres.app or Homebrew, listening on 127.0.0.1:5432, the Mac user as superuser, no password). `packages/db/supabase/local-shim.sql` adds what Supabase's own image provides and a plain Postgres lacks: the three client roles the policies and grants name, membership for the connecting user (the RLS bridge runs `set local role authenticated`), and `auth.users` with `id` and `email`, which the `public.users` foreign key, the setup triggers and the mirror use. `scripts/setup-local.ts` (`yarn db:setup:local`) refuses an unset or hosted tier and a non-loopback URL, creates the database through the server's `postgres` maintenance database when missing, applies the shim, the migrations, the setup SQL and the mirror marker, and ends on "next: yarn test:db". The example files default to `local` with `_LOCAL` URLs at `postgresql://127.0.0.1:5432/pem_local` (no user: the client takes the Mac user). `requireLocalTier` gains a `needs` argument so `test:db` and `db:local:reset` name both ways to get a local database while `db:local` and `db:local:full` keep naming Docker.
- **Decisions that apply:** D-STK-3 (one tier switch, `_LOCAL` suffix); D-STK-5 (Supabase owns the auth schema: the shim is applied only on a loopback database on the local tier, never by `db:setup` or a migration, so `check-migrations` stays clean); D-STK-6 (the mirror's guard: `auth.identities` is never created, so the marker opens the mirror); D-STK-18 (the script changes a database, so bash-guard and the permissions ask: `db:setup:local` matches the existing `*db:setup*` rule and the path form is added to the guard's file regex). Taylor's ruling of 2026-10-05: no Docker in the starter; Docker is the add recipe; Supabase comes later.
- **Interfaces:** `yarn db:setup:local`; `ensureDatabase(url)` and `databaseName(url)` in `setup-local.ts`; `requireLocalTier(command, needs)`.
- **Per path:**
  - `packages/db/supabase/local-shim.sql`: the roles, the grant, the auth schema and table.
  - `packages/db/scripts/setup-local.ts`: the script.
  - `packages/db/scripts/env.ts`, `supabase-cli.ts`, `test-db.ts`, `reset-local-db.ts`: wording and the `needs` argument.
  - `packages/db/scripts/tier-guard.test.ts`: C1.
  - `packages/db/package.json`, `package.json`: the script entries.
  - `tooling/hooks/bash-guard.ts`, `tooling/hooks/fixtures/bash-guard.json`: C4.
  - `.env.example`, `packages/db/.env.example`: the local default.
  - The docs: round D and step 5 of the guide, the add recipe, the remove runbook, the conventions, the tooling reference, the changelog.
- **Gotchas:** the shim must run before the migrations (the first migration's foreign key targets `auth.users`). `GRANT role TO current_user` is written through `format('%I', current_user)` inside a DO block. Postgres 15's public schema still grants USAGE to PUBLIC, so the explicit grant is belt and braces. The integration tests delete the rows they insert in `auth.users`, so a developer's database is left as it was.
- **Model:** Fable 5.1; a smaller model puts the shim into `db:setup`, where it would run on a hosted project.
