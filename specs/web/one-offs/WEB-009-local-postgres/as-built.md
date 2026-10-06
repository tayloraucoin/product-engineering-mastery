# As-built — WEB-9

## Shipped against the contract

- C1: `scripts/setup-local.ts` refuses an unset tier (through `requireTier`), a hosted tier, and a local URL that is not this machine, each in one line before any connection; `requireLocalTier(command, needs)` lets `test:db` and `db:local:reset` name both ways to get a local database while `db:local` and `db:local:full` keep naming Docker. Tests in `scripts/tier-guard.test.ts` spawn each script with a minimal environment and an empty PATH.
- C2: `yarn db:setup:local` on this machine's Postgres.app (15.19) created `pem_local`, applied `supabase/local-shim.sql`, the two migrations, the four setup files and the mirror marker; a rerun reported `database exists` and changed nothing (`evidence/C2-setup-local.md`).
- C3: `yarn test:db` against that database: 21 tests, 0 failures, across the four integration files (`evidence/C3-test-db.md`).
- C4: the bash guard asks for `yarn db:setup:local` (the existing `db:setup` rule) and for the script run by path (`setup-local` added to the file regex); two fixtures pin it.
- C5: types pass.
- The defaults and docs: both example files set `DATABASE_ENVIRONMENT=local` with `_LOCAL` URLs at `postgresql://127.0.0.1:5432/pem_local` (no user or password: the client takes the Mac user, which Postgres.app and Homebrew make a superuser). Round D and step 5 of the new-project guide offer own Postgres (the default), hosted only, or Docker; the add recipe now swaps Docker's address in; the remove runbook, the conventions, the tooling reference and the changelog describe it.

## Deviations

- The example default moved from `staging` (WEB-8, the same day) to `local`, on Taylor's ruling in the thread: no Docker in the starter, Docker only as the add recipe, Supabase later. The changelog records the ruling under the Docker entry; no ledger line, since EN-08's "default `local`" is restored rather than changed.
- The shim creates `supabase_auth_admin`, NOLOGIN, owning the auth schema as on Supabase; the mirror's integration test switches to it with `set local role` inside its rolled-back transaction instead of opening a second connection (it did on Docker's image; the review asked for the switch, and the Docker path works the same way, since the test's connection is a superuser there too).
- After the Q2 review (Warden, in the thread): `db:setup:local` refuses a database Supabase Auth owns (`auth.identities` exists) before the shim touches it, and refuses an unset `DATABASE_MIGRATION_URL_LOCAL` by name instead of falling back to Docker's address; the remove runbook names all four roles. After those fixes `yarn db:setup:local` was rerun on `pem_local` (a no-op but the role change) and `yarn test:db` passed again, 21 of 21; `pg_roles` shows none of the four shim roles can log in.
- The RLS test "leaves nothing behind" hard-coded Docker's `postgres` user; it now reads the connection's own role first and also asserts it is not the bridge's role. Not a weakening: one assertion added, none removed.
- `[ASSUMPTION]` The shim's `auth.users` carries `id`, `email`, `created_at` and `updated_at` (nullable, no default, as Supabase's are); the triggers, the mirror and the tests use only `id` and `email`.
- The operator's own `packages/db/.env.local` still names Docker's address in its `_LOCAL` URLs (the thread never read the file; the first `db:setup:local` aimed at port 54322 and was refused by the server). The proofs passed the own-Postgres URL in the shell environment, which Node lets override the env file; the closing report tells the operator the two lines to change.
- `contract:init` flagged eleven critical paths at Q2; the ticket stayed at Q2 as the operator's pace asked, with one fresh-context review in the thread.

## Not verified

- C2 and C3 are manual by the template's rule; their runs are the evidence files.
- A Homebrew Postgres (as opposed to Postgres.app) and a server that requires passwords on loopback: neither was tried; the example URL assumes trust authentication for the Mac user.
- Sign-in on the local tier with no Supabase project: out of scope; the app serves every request signed out.
- The new-project guide's own-Postgres path has not been run cold on a duplicate (STK-20).

## Next

Operator: set the two `_LOCAL` URLs in `packages/db/.env.local` (and in `apps/web/.env.local` when it exists) to `postgresql://127.0.0.1:5432/pem_local`; then `yarn test:db` runs with no shell overrides.
