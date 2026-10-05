# Review — mason on STK-11

> Written by `yarn review:run mason STK-11`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: e7cc2fb8716af0f91ca85d99149fd2a7b79384c8741b334879d78bbd2fa04893
- as_built_sha256: 182380d23a6355cfe77c624a8bc2d8889b4c21e148af1e08a67ae1a526513998
- head: 80949bdf935eaab58e8f5e1b57f8c39c4780ce3a
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-05T00:33:31Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason STK-11`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket STK-11 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

# Review — STK-11 local-auth-mirror (mason, tier 2)

**Verdict up top: PASS.** Three guards stand between this code and a real auth database, two of them inside the single statement where no caller can skip them, and I verified every non-negotiable against the code rather than the as-built. No Blocking finding. Two Should-fixes, neither in the mirror's logic.

## Criteria

**C1 — met.** `evidence/test-db.txt`: 15 of 15 pass, 0 skipped, against `public.ecr.aws/supabase/postgres:17.11.0.002` in Mode A. Each named behaviour maps to a real assertion in `packages/db/test/local-auth-mirror.test.ts`: the inserted row's non-null columns are exactly `["email","id"]` (line 116), an email change upserts into both tables (160-170), zero rows with `auth.identities` created as `supabase_auth_admin` (198-208), zero rows with the marker dropped (210-220), and a refusal leaves an existing email alone (222-239). Both refusals run under a raw `BEGIN` on a `max: 1` client (177-189) so the client keeps `options.host` and the mirror runs exactly as STK-12's seam will call it — that detail is what makes the refusal tests worth anything. Guards 2 and 3 are in the statement itself (`src/local-auth-mirror.ts:91-108`). The capture header's commit (56862d8, committed on top as 5cf888e) is declared in `as-built.md:51` and matches the code I read.

**C2 — met.** `yarn test` exit 0, 134 tests, 0 skipped. `src/local-auth-mirror.test.ts:31-41` counts socket-factory attempts: 0 for a direct hosted URL and a pooler URL, and >0 only on loopback (43-53), so the refusal provably precedes the connection rather than merely accompanying it. `scripts/local-users.test.ts:19-38` counts fetch calls: 0 for hosted, `10.0.0.5`, `localhost.example.com` and unset. `src/loopback.test.ts:21-34` covers the look-alikes. The check is fail-closed throughout — an unparseable URL or an unmatched form is non-loopback.

**C3 — met.** `yarn verify` exit 0 at head 5cf888e, `check-settings` and `check-migrations` included. `check-migrations: 1 migration(s) … none touch the auth schema` (C3.log:17) confirms no migration was added: the `packages/db/**` one-way door stayed shut, and the new SQL is setup SQL, hand-applied and reviewed as SQL. The warns inside the log are `check-specs` reporting state that predates this run's own record, plus the two stale reviewer records — non-strict, so exit 0 is right.

**C4 — deferred, correctly.** It needs STK-12's seam, which the contract puts out of scope, and a person signing in on staging. The database half is covered by C1 and the backfill test; `evidence/C4-operator.md` writes out the four steps. The headline objective is therefore not proven end to end, which the as-built states rather than papers over.

**C5 — deferred, and the criterion as worded cannot pass.** `C5-operator.md:7` and `as-built.md:62` both say so: the grep cannot come back empty while Auth stays, because `docs/runbooks/remove-supabase-database.md:55` deliberately keeps `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for the auth module. The builder proposed a scope and did not silently redefine the criterion — the right call. The wording still needs Taylor's ruling before it can ever be run.

## Non-negotiables — all seven verified in code

CLI `supabase` 2.119.0 exact as an `@pem/db` devDependency (`packages/db/package.json:61`); `db:local` runs `db start` only (`scripts/local.ts:27`), `db:local:full` runs `start` (`scripts/local-full.ts:40`). Repo-wide grep finds `insert into auth.users` in exactly one shipped file, `src/local-auth-mirror.ts:98` — every other hit is a test. The mirror reads no `process.env`; the package's only reader is `scripts/env.ts`, enforced by `packages/db/eslint.config.mjs:10-20`. `assertLoopbackClient` is the function's first statement (line 76). `seedLocalUsers` refuses before any fetch (`scripts/local-users.ts:36-40`). `config.toml:23-27` disables CLI migrations and seeds. The mode is the `_LOCAL` auth value, no mode variable (`scripts/env.ts:11-14`, `.env.example:22-30`).

Two declared assumptions resolved cleanly on inspection: the root `.env.example` append left each of the nine names exactly once, no duplication (`.env.example:61-72`); and `04_users_backfill.sql` is safe against null emails because `public.users.email` is nullable (`src/schema/account/users.ts:20`), which matters because that file also runs on hosted tiers.

## Findings

**Should-fix — stale tier-2 reviewer records.** `results.json:73-102`: vigil's PASS was recorded at head 3465bd7 and warden's at c19369c, with 7 and 11 planned-path files changed since (C3.log:19-20). `as-built.md:57` confirms the third round changed behaviour after those reads — the `db:local:full` network warning and the `docker port` failure path. A one-way-door ticket should not merge on records that predate the code it approves. Re-run both, one at a time; `yarn check-specs --strict` will block the merge until then.

**Should-fix — the loopback helpers have two public homes.** `src/local-auth-mirror.ts:25-31` re-exports `assertLoopbackClient`, `isLoopbackHost` and `isLoopbackUrl`, and its comment directs the auth seam to import them from that subpath, while `package.json:31-34` also exports `./loopback` and `docs/runbooks/remove-supabase-auth.md:27` keeps `./loopback` and deletes `./local-auth-mirror`. Removability holds today only because the runbook deletes the single importer. Any second importer that follows the comment breaks when Auth is removed. Point STK-12 and that comment at `@pem/db/loopback` and drop the re-export — one home for the logic, which is the whole reason vigil had it extracted.

**Consider — LAN exposure is a warning, not a property.** `scripts/supabase-cli.ts:79-101` warns, and `isPublishedBeyondLoopback` returns false when `docker port` cannot answer, so a probe failure means silence. The in-repo options are genuinely exhausted: the CLI publishes `-p 54322:5432` with no host setting and D-STK-6 ratified the CLI. It is documented at `new-project.md:127` and `tech-stack.md:46`, and `as-built.md:30` routes acceptance to Taylor. That routing is correct, and this is the one decision the ticket still owes a person: in Mode A that port holds real staging email addresses behind the password `postgres`.

**Consider — the mirror cannot heal a missing `public.users` row.** When `auth.users` already matches, the conflict clause does nothing and the call returns `"unchanged"` with `public.users` still empty (`test/local-auth-mirror.test.ts:137-138`). `db:local:reset` self-heals because it runs `applySetup` (`scripts/reset-local-db.ts:106`), which is what `04_users_backfill.sql` exists for; a hand-deleted public row stays missing until someone runs `yarn db:setup`. One line in the mirror's doc comment naming that recovery would spare STK-12's seam a confusing state.

**Consider — `scripts/auth-writers.test.ts:36` scans only `packages/db/{src,scripts,supabase,migrations}`** while the non-negotiable is phrased absolutely. The gap is narrower than it reads: `postgres` is pinned to `db` in `SDK_OWNERS`, so no other package can open a SQL client at all, and the boundaries probes in C3.log prove that lint fires. Worth widening the scan roots when the auth package lands, if it is cheap.

VERDICT: PASS
