# As-built — STK-11

## Shipped against the contract

- C1: `packages/db/src/local-auth-mirror.ts` exports `applyLocalAuthMirror(sql, { id, email })`. One statement upserts `auth.users (id, email)` and nothing else. Its own CTE opens only when `to_regclass('auth.identities') is null` and `to_regclass('local_auth_mirror.marker') is not null`; a closed guard selects no row, so zero rows are written. `test/local-auth-mirror.test.ts` (in `yarn test:db`) covers six cases: an insert whose only non-null columns are `id` and `email`, with `public.users` created by the trigger; the cache, then "unchanged"; an email change upserted into both tables; zero rows with `auth.identities` created as `supabase_auth_admin`; zero rows with the marker dropped; and a refusal leaving an existing email alone. Each refusal runs in a rolled-back transaction. A further test wipes a cached user's rows and sees them mirrored again once the cache entry expires. Capture: 15 of 15, none skipped (`evidence/test-db.txt`).
- C2: the mirror checks the client's hosts (`sql.options.host`) are loopback before its first query; `seedLocalUsers`, which `db:seed-users` runs, refuses a non-loopback or unset auth URL before any fetch. `src/local-auth-mirror.test.ts` counts socket attempts through postgres.js's socket factory: zero for two hosted URLs. `scripts/local-users.test.ts` counts fetch calls: zero for hosted, private-network, look-alike and unset URLs.
- C3: `yarn verify` passes in full, `check-settings` included, once Taylor applied STK-10's settings line (`evidence/C3.log`).
- Non-negotiables:
  - Supabase CLI `supabase` 2.119.0, pinned exact as an `@pem/db` devDependency (verified 2026-10-04).
  - `db:local` runs `supabase db start` with `SUPABASE_AUTH_ENABLED=false` for that run only, then creates the marker. `db:local:full` runs `supabase start`.
  - `config.toml` sets `[db.migrations]` and `[db.seed]` to `enabled = false`.
  - The mode is the `_LOCAL` value of `NEXT_PUBLIC_SUPABASE_URL`; there is no mode variable.
  - The mirror never reads `process.env`.
- devs_call: the marker is the table `local_auth_mirror.marker`, in its own schema outside `public` (Drizzle never sees it) with `public` usage revoked. Only `scripts/local-auth-marker.ts` creates it, and it refuses a database that already has `auth.identities`. The cache is a per-process `Map` from id to email and time. A repeat call with the same email within 60 s sends nothing ("cached"). After that the statement runs again, so a database wiped under a running dev server gets its users back within a minute. A refusal is never cached.
- Mode B, checked end to end on 2026-10-04 with the full stack up:
  - The mirror returned "refused" and wrote zero rows.
  - `db:seed-users` created both synthetic users with the `sb_secret_` key, then reported both as existing with the legacy JWT key; `public.users` held both.
  - It refused a hosted URL.
  - `db:local` then reported the database as owned by Auth and exited 1.
  - `db:stop --no-backup` and `db:local` returned it to Mode A.
- Docs:
  - The manifest's `db` entry lists `supabase`.
  - Both removal runbooks: the database one adds the CLI, the volume and the new scripts; the auth one adds where the mirror goes.
  - `new-project.md`: step 2, item 5, renames `project_id`; step 6, item 4, explains the two modes, the network exposure and how to wipe mirrored emails.
  - `tech-stack.md`: the CLI row, and the image row now pinned by the CLI.
  - `.env.example` and `turbo.json`: `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in all three tier forms.

## Deviations

- **The CLI database listens on every interface, not 127.0.0.1.** STK-9's `docker run` published `127.0.0.1:54322`. The CLI 2.119.0 publishes `-p 54322:5432` with no host address (`docker-create-args.ts`, read 2026-10-04) and has no setting to change it, so the local database, password `postgres`, can be reached from the LAN. In Mode A it holds mirrored staging emails. D-STK-6 chose the CLI. `db:local` checks the binding with `docker port` and warns, naming Docker's `"ip": "127.0.0.1"` daemon setting. Accepting the remaining exposure is Taylor's call.
- **`db:local` turns Auth off through the CLI's environment, not in `config.toml`.** In CLI 2.119.0, `db start` runs Auth's `gotrue migrate` job on a fresh volume whenever `[auth] enabled` is true, which creates `auth.identities` and would keep the mirror shut for good. Checked 2026-10-04 on a scratch project: without the override `auth.identities` was present; with `SUPABASE_AUTH_ENABLED=false` it was absent. One `config.toml` keeps Auth on for Mode B.
- **The local image moves from `supabase/postgres:17.11.0.003` to the CLI's `public.ecr.aws/supabase/postgres:17.11.0.002`.** Container `supabase_db_<project_id>`, port 54322, password `postgres`, as before. `db:local` refuses while STK-9's `pem-db-local` container runs and names `docker rm -f pem-db-local`. On this machine that container was stopped, not removed.
- **`db:local:full` stops a lone Mode A database first** (data kept). Otherwise `supabase start` sees the database running, reports success and starts nothing (observed 2026-10-04).
- **Added `supabase/setup/04_users_backfill.sql`** (path added to `planned_paths`). It inserts a `public.users` row for every `auth.users` row that lacks one. STK-10's `db:local:reset` empties `public` but keeps `auth.users`. The mirror then finds the auth row unchanged and the insert trigger never fires again, so C4 would fail after a reset. The backfill also covers hosted users created before setup first ran. STK-10 changed its reset test to expect the row back (commit 8071179).
- **Other paths added to `planned_paths`:** `src/local-auth-mirror.test.ts`, `test/**`, `docs/engineering/tech-stack.md`, `yarn.lock`.
- **`test:db` runs its files one at a time** (`--test-concurrency=1`): three files now migrate the same database.
- **The local project id is read from `config.toml`** (`scripts/local-image.ts`), so it is written once.
- **[ASSUMPTION] `.env.example` was appended to without being read.** Reading it was declined in this session. Before the append, `check-client-bundle --plan` showed no `SUPABASE_SERVICE_ROLE_KEY`. After it, the plan showed no drift from `turbo.json`, and the commit diff is exactly the 15 appended lines. Whether `NEXT_PUBLIC_SUPABASE_URL` was already present could not be checked: the plan omits public names.
- **`db:seed-users` refuses redirects** (`redirect: "error"`), so a loopback URL cannot forward the key off the machine.
- **[ASSUMPTION] `db:seed-users` sends `Authorization: Bearer` only for a JWT-shaped key**, and `apikey` always. Both key styles worked against local Auth (GoTrue v2.197.0) on 2026-10-04.
- **A known gap, out of scope:** a staging user deleted and re-created with the same email gets a new id. The local `auth.users` has a unique index on `email`, so the mirror's insert then fails with a unique violation until the old row is deleted. Replaying staging deletions is out of scope.
- **Warden's first review (FAIL) and the fixes:**
  - `test/rls.test.ts` now asserts a loopback client before migrating or writing to `auth.users`, as its sibling tests do.
  - The network warning flags any binding that isn't loopback, a specific LAN address included (`nonLoopbackBindings`, tested).
  - The exposure is now stated in `new-project.md` step 6 and in the `tech-stack.md` image row.
  - The database runbook says to delete the two Supabase variables when there is no `auth` entry.
  - `scripts/auth-writers.test.ts` fails if any shipped file other than the mirror writes to `auth.users`.
  - The mirror documents the unique violation it throws for a re-created staging user.
- **`packages/db/.env.example` added** (Taylor's request; path added to `planned_paths`). The db scripts run from `packages/db` and load `packages/db/.env.local`, not the root one. The file lists exactly the variables they read.
- **C4 and C5 are deferred to the operator** (`--verdict deferred`). Each check is written out in `evidence/C4-operator.md` and `evidence/C5-operator.md`.
- **The capture header names the commit of the code it ran on.** The capture file is committed on top of that commit, so the run record stamps the next commit.
- **Vigil's second review (FAIL) and the fixes:**
  - The loopback checks moved from the mirror to `src/loopback.ts` (exported as `@pem/db/loopback`), so the auth runbook's removal of the mirror leaves a building tree. Every importer inside `@pem/db` uses the new module, including STK-10's `scripts/reset-local-db.ts` and its test: an import line only.
  - The mirror re-exports the checks for STK-12's `apps/web/lib/supabase/local-mirror.ts`, which is removed with Auth.
  - `test/rls.test.ts` also checks its runtime client is loopback.
  - The database runbook now names the `db` probes in `tooling/boundaries.test.ts`.

## Not verified

- C4 (manual): needs STK-12's request seam, which calls the mirror, and a person signing in on staging after `yarn db:local:reset`. Mode A's database half is covered by C1 and the backfill test.
- C5 (manual): the removal rehearsal on a scratch copy, by a person. As worded, the grep cannot come back empty while Auth stays. The database runbook keeps the two Supabase auth variables, and docs name Supabase. Grep scope to settle: code only (`git grep -il 'drizzle\|supabase' -- ':!docs' ':!specs'`), excluding the variables the runbook keeps on purpose. Until STK-12 lands, the auth runbook covers only the mirror.
- The mirror has run only against the CLI image, never against a hosted project. There its guard would find `auth.identities` and refuse, but no test points it at one; the loopback check stops it first.

- A vigil pre-review ran on 2026-10-04 before the recorded reviews could start; the recorded reviews need C3 to C5 first. It found nothing Blocking. Its Should-fixes on the cache, the network warning and redirects are fixed above; C3 and C5 are noted here.

## Next

STK-12 calls `applyLocalAuthMirror(db.$client, user)` from its request seam on the local tier when the auth URL is not loopback, and adds `@pem/db` to `transpilePackages` with the first importer.

## Test changes

- `scripts/auth-writers.test.ts` no longer asserts that `src/local-auth-mirror.ts` exists. It now asserts that no shipped file other than the mirror writes to `auth.users`, so the guard still holds after the auth runbook deletes the mirror (vigil Blocking, 2026-10-04).
- The `isLoopbackHost` and `isLoopbackUrl` tests moved, unchanged, from `src/local-auth-mirror.test.ts` to `src/loopback.test.ts`.
