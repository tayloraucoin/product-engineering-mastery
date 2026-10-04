# Review — mason on STK-11

> Written by `yarn review:run mason STK-11`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: e7cc2fb8716af0f91ca85d99149fd2a7b79384c8741b334879d78bbd2fa04893
- as_built_sha256: 23d561c78f14fd8768da9c6493450b8230105897869de8c103967aba35247f24
- head: 3465bd77c5d7367af8d39de6d65d82dc74d95851
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T23:43:45Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason STK-11`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket STK-11 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 capture: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/test-db.txt (sha256 9839db2cc5d8)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/C2.log (sha256 82c098df32eb)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/C3.log (sha256 d6901c66f2fa)
   - C4 manual: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/C4-operator.md (sha256 babd1f230390)
   - C5 manual: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/C5-operator.md (sha256 5b4554942813)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, docs/engineering/tech-stack.md, docs/runbooks/new-project.md, docs/runbooks/remove-supabase-auth.md, docs/runbooks/remove-supabase-database.md, package.json, packages/db/.env.example, packages/db/package.json, packages/db/scripts/auth-ddl.test.ts, packages/db/scripts/auth-ddl.ts, packages/db/scripts/auth-writers.test.ts, packages/db/scripts/check-migrations.ts, packages/db/scripts/database.ts, packages/db/scripts/env.ts, packages/db/scripts/local-auth-marker.ts, packages/db/scripts/local-full.ts, packages/db/scripts/local-image.ts, packages/db/scripts/local-users.test.ts, packages/db/scripts/local-users.ts, packages/db/scripts/local.ts, packages/db/scripts/migrate.ts, packages/db/scripts/reset-local-db.test.ts, packages/db/scripts/reset-local-db.ts, packages/db/scripts/seed-users.ts, packages/db/scripts/setup.ts, packages/db/scripts/supabase-cli.test.ts, packages/db/scripts/supabase-cli.ts, packages/db/src/local-auth-mirror.test.ts, packages/db/src/local-auth-mirror.ts, packages/db/src/loopback.test.ts, packages/db/src/loopback.ts, packages/db/supabase/.gitignore, packages/db/supabase/config.toml, packages/db/supabase/setup/04_users_backfill.sql, packages/db/test/local-auth-mirror.test.ts, packages/db/test/reset-local-db.test.ts, packages/db/test/rls.test.ts, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Review — STK-11 local-auth-mirror (mason, tier 2)

**Verdict: PASS.** No Blocking findings. The one-way-door surface here — a writer into a local `auth.users` that holds real staging emails — is guarded at the right layer: two of the three guards live inside the INSERT, where no caller can skip them. I read every file on the irreversible paths in full.

### Criteria

**C1 (capture) — met.** `evidence/test-db.txt` is 15/15, `skipped 0`, against `supabase_db_pem` / `public.ecr.aws/supabase/postgres:17.11.0.002` in Mode A. The statement's four demands are each a real assertion, not a test name: `packages/db/test/local-auth-mirror.test.ts:112-118` filters the returned row to its non-null columns and asserts exactly `["email", "id"]`; `:160-170` proves the email upsert in both tables; `:198-220` proves zero rows with `auth.identities` present (created as `supabase_auth_admin`) and with the marker dropped, each inside a rolled-back transaction and each re-checked after rollback; `:222-239` proves a refusal leaves an existing email alone. The capture header names code at `89bff07` while the run record stamps `2047e57` — inherent to committing a capture on top of the code it describes, and disclosed at `as-built.md:51`.

**C2 (test) — met.** Exit 0, 114 tests. Both halves prove *before connecting*, not merely refusal: `packages/db/src/local-auth-mirror.test.ts:8-23` counts attempts through postgres.js's socket factory and asserts `0` for a hosted direct URL and a pooler URL, with `:43-53` showing the counter does fire on loopback (so the guard, not a broken client, is what stopped it); `packages/db/scripts/local-users.test.ts:19-38` asserts zero fetch calls for hosted, private-network (`10.0.0.5`), look-alike (`localhost.example.com`) and unset URLs.

**C3 (check) — met.** `yarn verify` exit 0 across format, `lint:docs`, hooks, `check-refs`, `check-stack`, `check-migrations`, boundary probes, lint, types, `check-client-bundle` and both builds (`evidence/C3.log:1-5`, `1500-1641`). The warn lines in it are non-fatal `check-specs` output about other tickets — and about this one; see Should-fix 2.

**C4 (manual) — not verified, correctly deferred.** It needs STK-12's seam and a person signing in on staging; nothing in this ticket calls the mirror, so no assumption would make it checkable here. The steps are written out in `evidence/C4-operator.md:9-14`.

**C5 (manual) — not verified, correctly deferred.** `evidence/C5-operator.md:7` states plainly that the criterion as worded cannot pass while Auth stays, and proposes a grep scope rather than quietly reinterpreting it. That is the right handling of a defective criterion.

### Non-negotiables — all seven hold

CLI `supabase` 2.119.0 exact (`packages/db/package.json:61`), `db:local` → `db start` (`scripts/local.ts:27`), `db:local:full` → `start` (`scripts/local-full.ts:39`); the mirror imports only a `postgres` type and `./loopback` and reads no `process.env` (`src/local-auth-mirror.ts:21-23`); the guard CTE (`:91-108`) opens only when `to_regclass('auth.identities') is null and to_regclass('local_auth_mirror.marker') is not null`; `assertLoopbackClient(sql)` precedes the first query (`:76`); `seedLocalUsers` refuses before any send (`scripts/local-users.ts:36-45`); `[db.migrations]` and `[db.seed]` are `enabled = false` (`supabase/config.toml:23-27`); the mode is the `_LOCAL` auth value with no mode variable (`scripts/env.ts:11-14`, `turbo.json:21-29`). Placement is right too — `src/loopback.ts` was extracted at its second consumer and exported as its own subpath, so `remove-supabase-auth.md:24-28` can delete the mirror and its export and still leave a building tree; I verified every importer uses the new module, including STK-10's `scripts/reset-local-db.ts:18`.

### Findings

**Should-fix — the LAN exposure has no decision record.** `specs/_shared/epics/STK-default-stack/technical.md:19` still describes D-STK-6 as the CLI choice, with nothing about the binding change it brought: STK-9 published `127.0.0.1:54322`, the CLI publishes on every interface with password `postgres`, and in Mode A that database holds mirrored staging emails. The acceptance currently lives only in `as-built.md:30`, `docs/runbooks/new-project.md:127` and `docs/engineering/tech-stack.md:45`. Per `docs/decisions/ledger.md:43` an STK trade's home is a `D-STK-n` line. Once Taylor accepts, amend D-STK-6 with a revisit trigger (the CLI gaining a bind-address setting). Not Blocking: disclosed in three live docs, detected at runtime with the exact remedy (`scripts/local.ts:44-48`), and routed to the owner rather than decided by the builder.

**Should-fix — two of three reviews are not valid at this head.** `review:vigil` is FAIL at `aa49bd5` (`results.json:73-87`) and `review:warden`'s PASS went stale after `tech-stack.md`, `new-project.md`, `package.json` and four more changed (`evidence/C3.log:24`). The code shows vigil's Blocking item fixed — `packages/db/src/loopback.ts:1-6` and the rewritten guard at `packages/db/scripts/auth-writers.test.ts:35-46` — so both are re-runs, not rework. Tier 2 does not merge on this state.

**Consider — `localhost` is trusted by name.** `packages/db/src/loopback.ts:12-21` accepts the literal `localhost`, which `/etc/hosts` can repoint off-machine. The two in-statement guards stand behind it, so this is depth rather than a hole; one line in the doc comment would settle it for the next reader.

**Consider — the auth-writers guard is narrower than the promise it enforces.** `packages/db/scripts/auth-writers.test.ts:36` walks only `src`, `scripts`, `supabase` and `migrations` inside `@pem/db`, while the non-negotiable is repo-wide. Today nothing else writes there (the only outside mentions are comments at `packages/auth/src/context.ts:16` and `apps/web/lib/supabase/local-mirror.ts:5`), but an app holding its own `postgres` client would not be caught. Widening the walk to `apps/` and `packages/` makes the mechanism match the rule.

**Consider — settle C5's grep scope into the criterion, not the evidence file.** `evidence/C5-operator.md:7` carries the correction; the person running the rehearsal should be grading against a statement that can pass.

VERDICT: PASS
