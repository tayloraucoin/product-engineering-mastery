# Review — warden on STK-11

> Written by `yarn review:run warden STK-11`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: e7cc2fb8716af0f91ca85d99149fd2a7b79384c8741b334879d78bbd2fa04893
- as_built_sha256: 182380d23a6355cfe77c624a8bc2d8889b4c21e148af1e08a67ae1a526513998
- head: 0d2d5c73b3d64754ef6768e6f1d6ca9227c39c6f
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-05T00:45:04Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-11`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-11 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 capture: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/test-db.txt (sha256 02c1f301cde7)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/C2.log (sha256 4c5c6c93864b)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/C3.log (sha256 6c86e1a10563)
   - C4 manual: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/C4-operator.md (sha256 babd1f230390)
   - C5 manual: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/C5-operator.md (sha256 5b4554942813)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, docs/engineering/tech-stack.md, docs/runbooks/new-project.md, docs/runbooks/remove-supabase-auth.md, docs/runbooks/remove-supabase-database.md, package.json, packages/db/.env.example, packages/db/package.json, packages/db/scripts/auth-ddl.test.ts, packages/db/scripts/auth-ddl.ts, packages/db/scripts/auth-writers.test.ts, packages/db/scripts/check-migrations.ts, packages/db/scripts/database.ts, packages/db/scripts/env.ts, packages/db/scripts/local-auth-marker.ts, packages/db/scripts/local-full.ts, packages/db/scripts/local-image.ts, packages/db/scripts/local-users.test.ts, packages/db/scripts/local-users.ts, packages/db/scripts/local.ts, packages/db/scripts/migrate.ts, packages/db/scripts/reset-local-db.test.ts, packages/db/scripts/reset-local-db.ts, packages/db/scripts/seed-users.ts, packages/db/scripts/setup.ts, packages/db/scripts/supabase-cli.test.ts, packages/db/scripts/supabase-cli.ts, packages/db/src/local-auth-mirror.test.ts, packages/db/src/local-auth-mirror.ts, packages/db/src/loopback.test.ts, packages/db/src/loopback.ts, packages/db/supabase/.gitignore, packages/db/supabase/config.toml, packages/db/supabase/setup/04_users_backfill.sql, packages/db/test/local-auth-mirror.test.ts, packages/db/test/reset-local-db.test.ts, packages/db/test/rls.test.ts, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Criteria

**C1 — PASS.** `evidence/test-db.txt` shows 15 of 15, 0 skipped, against `supabase_db_pem` on the CLI image in Mode A (header names the image, `auth.identities` absent, marker present). The named cases are all there and match the code: `inserts id and email only` asserts the filled columns are exactly `["email","id"]` (`packages/db/test/local-auth-mirror.test.ts:112-118`); the email change upserts into both tables (`:160-170`); zero rows with `auth.identities` created as `supabase_auth_admin` (`:198-208`) and zero rows with the marker dropped (`:210-220`), each inside a rolled-back transaction, with the refusal leaving an existing email intact (`:222-239`). The guard is inside the statement (`packages/db/src/local-auth-mirror.ts:91-108`), so no caller can skip it, and both `to_regclass` arguments and the user values are bound parameters — a hostile email cannot reach the SQL.

**C2 — PASS, and proven rather than asserted.** `evidence/C2.log` exits 0 with 0 failures and 0 skips. The mirror's refusal is counted at the socket factory: zero connection attempts for two hosted URLs, and a loopback URL does reach the socket (`packages/db/src/local-auth-mirror.test.ts:31-53`), so "before connecting" is measured. `seedLocalUsers` refuses hosted, private-network (`10.0.0.5`), look-alike (`localhost.example.com`) and unset URLs with zero fetch calls (`packages/db/scripts/local-users.test.ts:19-38`). `assertLoopbackClient` filters every host in `sql.options.host`, so a multi-host failover string cannot smuggle one past (`packages/db/src/loopback.ts:33-43`).

**C3 — PASS.** `evidence/C3.log` exits 0 through the whole chain: format, `lint:docs`, `check-settings`, hooks, `check-refs`, `check-stack`, `check-migrations`, `check-specs`, contrast, 127 tooling tests, boundaries, lint, types, `check-client-bundle` (18 server-only values, none in 27 browser-facing files), build. Its only STK-11 lines are warnings about stale earlier reviews, which is what this re-review answers.

**C4 — not verified, correctly deferred.** `evidence/C4-operator.md` gives the reason (needs STK-12's seam and a staging sign-in) and the four steps. The database half is genuinely covered: the reset case is tested (`test/local-auth-mirror.test.ts:130-141`) and `supabase/setup/04_users_backfill.sql` restores the public row after a reset.

**C5 — not verified, correctly deferred,** and the as-built says plainly that the criterion as worded cannot come back empty while Auth stays, with a grep scope proposed for Taylor to settle (`evidence/C5-operator.md:7`).

Non-negotiables hold: CLI pinned exact at `2.119.0` (`packages/db/package.json:61`); `db:local` runs `db start`, `db:local:full` runs `start`; the mirror never reads `process.env` and is the only shipped writer to `auth.users` (repo-wide grep agrees); `[db.migrations]` and `[db.seed]` are `enabled = false` (`packages/db/supabase/config.toml:23-27`); no mode variable exists. My round-one findings are all fixed: `test/rls.test.ts:42,58` now asserts loopback before migrating and before runtime writes, `nonLoopbackBindings` flags a specific LAN address, the exposure is stated in `new-project.md:127` and `tech-stack.md:46`, and the database runbook handles the two kept variables (`remove-supabase-database.md:55`).

## Findings

**Should-fix — a `_LOCAL` auth URL may point at production, and nothing says so.** `packages/db/scripts/local.ts:46-51` warns only when the auth URL *is* loopback. Adversary: a developer asked to reproduce a production bug, or one who copies the wrong block from `.env.example`. Path: `NEXT_PUBLIC_SUPABASE_URL_LOCAL` = the production project → sign-in on production → STK-12's seam calls the mirror → production users' ids and emails land in a local database with password `postgres` that, by this ticket's own deviation, listens on every interface. Impact: real customers' email addresses on a laptop and on the LAN. The cheap control is already in reach: `packages/db/scripts/env.ts:67` reads the unsuffixed (production) value too, so comparing it to the `_LOCAL` value and warning costs one condition. Enforcement may belong in STK-12's seam; the warning belongs here. Not Blocking — every doc says to copy the `_STAGING` values, and no criterion promised this guard.

**Consider — the LAN exposure is accepted in an as-built, not recorded as a risk acceptance.** `as-built.md:30` ends "Accepting the remaining exposure is Taylor's call," and `docs/decisions/ledger.md` has no line for it, so there is no owner or revisit trigger on the record. A ledger line naming Taylor and "the CLI gains a bind-address setting, or the starter holds real user data" would make it revisitable. Related: the runtime signal is best-effort — `packages/db/scripts/supabase-cli.ts:79-92` returns `false` whenever `docker port` errors, so the one warning about LAN reachability can go quiet without anyone noticing. Advisory-only is the right call here (failing the start would stand in the doorway), but it is worth knowing the warning is not a guarantee.

**Consider — the auth-writer guard is narrower than the promise.** `packages/db/scripts/auth-writers.test.ts:36` scans only `src`, `scripts`, `supabase` and `migrations` inside `@pem/db`, while the non-negotiable is repo-wide. A future writer in `apps/web/lib/supabase/` or `packages/auth/` would pass. No such writer exists today (I grepped). Widening the scan to the repo, tests still exempt, puts the guard where the promise is.

**Consider — mirrored emails have no targeted deletion path.** `packages/db/scripts/reset-local-db.ts:7` keeps `auth.users` by design, and the only documented wipe is `yarn db:stop --no-backup` (`docs/runbooks/new-project.md:127`), which drops the whole local database. A developer who wants one mirrored person gone will keep the dataset instead and the row stays. One `delete from auth.users where id = …` line in that step makes the narrow deletion real; the FK cascade from `public.users` (`packages/db/src/schema/account/users.ts:19`) then takes the public row with it.

VERDICT: PASS
