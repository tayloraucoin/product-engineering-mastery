# Review — vigil on STK-11

> Written by `yarn review:run vigil STK-11`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: e7cc2fb8716af0f91ca85d99149fd2a7b79384c8741b334879d78bbd2fa04893
- as_built_sha256: 23d561c78f14fd8768da9c6493450b8230105897869de8c103967aba35247f24
- head: 3465bd77c5d7367af8d39de6d65d82dc74d95851
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T23:43:45Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-11`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-11 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Review — STK-11 local-auth-mirror (vigil, fresh context)

**Verdict: Pass with conditions.** No Blocking finding. Three Should-fixes, four Considers, and two criteria legitimately deferred to the operator.

Tools were Read/Grep/Glob only: I could not re-run a command or diff commits. Where that limits me I say so.

---

### Criteria

**C1 — met (verified in code + capture).** `evidence/test-db.txt` is TAP, 15 tests, `# skipped 0`, `# fail 0`. Each clause of the statement traces to an assertion: "id and email only" is `test/local-auth-mirror.test.ts:112-117` (non-null columns deep-equal `["email","id"]`); "upserting on email change" is `:160-170` (both `auth.users` and `public.users`); "zero rows when auth.identities exists" is `:198-208`, run as `supabase_auth_admin` inside a rolled-back transaction; "zero rows when the marker is absent" is `:210-220`; plus `:222-239` proving a refusal leaves an existing email alone. The guard lives inside the statement (`src/local-auth-mirror.ts:91-108`), so no caller can skip it, and a closed guard yields no row to the `written` CTE.

Corroboration for a pasted capture: the file's test inventory matches the tree exactly — 8 in `test/local-auth-mirror.test.ts`, 1 in `test/reset-local-db.test.ts`, 6 in `test/rls.test.ts` = 15. The header names commit `89bff07` while the run record stamps `2047e57` (explained in `as-built.md:51`); I cannot diff those two commits, so the inventory match is as far as code inspection takes this.

**C2 — met (verified in code + test log).** `C2.log` holds `applyLocalAuthMirror > refuses a non-loopback host before connecting` (`src/local-auth-mirror.test.ts:31-41` counts socket-factory attempts: 0 for two hosted URLs) and `seedLocalUsers > refuses a non-loopback auth URL before sending anything` (`scripts/local-users.test.ts:19-38` counts fetch calls: 0 for hosted, `10.0.0.5`, `localhost.example.com` and unset). The script path is real: `scripts/seed-users.ts:9-15` → `seedLocalUsers` → `isLoopbackUrl` before `new URL(...)` or any send. Caveat: the recorded run is a full turbo cache replay (`C2.log:13`, `:792` `FULL TURBO`) — a replay of an earlier pass at the same input hash, not a fresh execution.

**C3 — met.** `C3.log` exit 0; every failure-class check green (`check-stack`, `check-migrations`, `check-specs`, `check-test-weakening`, boundaries probes, contrast). The output is warnings-only — but two of those warnings are this ticket's own (see S3).

**C4 — not met, deferred.** `--verdict deferred`, reason sound (needs a person signing in on hosted staging). The database half is independently proven: `test/reset-local-db.test.ts:103-107` shows `04_users_backfill.sql` restoring the public row after a reset that keeps `auth.users`.

**C5 — not met, deferred.** `C5-operator.md:7` honestly states the criterion is unsatisfiable as worded while Auth stays, proposes a grep scope, and routes it to Taylor. Correct handling.

**Non-negotiables — all seven hold.** CLI `supabase 2.119.0` exact (`packages/db/package.json:61`); `db:local` → `db start` only, `db:local:full` → `start` (`:42-43`); the mirror never reads `process.env` (grep confirms `scripts/env.ts` is the package's only reader, lint-enforced at `eslint.config.mjs:20`); guards inside the INSERT; loopback refusal; `db:seed-users` refusal; `[db.migrations]`/`[db.seed]` disabled (`config.toml:23-27`); no mode variable anywhere in the repo (grep for `*_MODE` returns nothing).

---

### Findings

**Should-fix — Mode B keeps Mode A's data but drops the exposure warning.** `packages/db/scripts/local-full.ts:39-47` runs `supabase start` and then warns only about the auth URL. `local.ts:44-48` is where `isPublishedBeyondLoopback` fires. Yet `local-full.ts:27-38` deliberately keeps the Mode A volume ("its data is kept"), so a developer who ran Mode A first carries mirrored staging emails into Mode B — on a port published on every interface, password `postgres`, with no warning printed, and now with Auth and the API exposed beside it. The accepted risk is Taylor's (as-built.md:30); the mitigation warden asked for should cover both lanes equally. Owner: builder.

**Should-fix — an unguarded `docker port` can crash a successful `db:local`.** `packages/db/scripts/supabase-cli.ts:82` calls `execFileSync("docker", ["port", …])` with no try/catch, and `local.ts:44` calls it after the database is up and the marker written. `docker port` exits non-zero when the mapping or container name is not found, so the process would die with a stack trace and never print the `ready … next: yarn db:migrate && yarn db:setup` line at `local.ts:57-61` — a working Mode A that reads as broken. A probe whose only product is a warning should fail soft. Owner: builder.

**Should-fix — the tier-2 review gate is not currently satisfied.** `evidence/C3.log:24` records `review:warden`'s PASS as stale: seven of this ticket's paths changed after it (`docs/engineering/tech-stack.md`, `docs/runbooks/new-project.md`, `package.json` and 4 more), and `C3.log:25` records `review:mason` as never run (`results.json:68-72`). `packages/db/**` is a one-way door whose ratification names mason and warden. Neither is a code defect, and neither is mine to fix — but the as-built's "Not verified" section does not mention it, and merging on the recorded PASS would ship a door with a security review that predates seven changed paths. Owner: whoever closes the batch.

**Consider — the auth.users writer guard is package-scoped.** `packages/db/scripts/auth-writers.test.ts:36` scans only `src`, `scripts`, `supabase`, `migrations` of `@pem/db`. A write from `apps/web` or `packages/auth` would not be caught; the real backstop is that `authUsers` is never exported from the schema (asserted, `C3.log`-adjacent in `src/schema/index.test.ts`). The rewritten test also no longer asserts that the mirror itself still holds the write, so a refactor that moved the INSERT out would pass silently.

**Consider — the local port is written twice.** `scripts/local-image.ts:25` hardcodes `LOCAL_PORT = 54322` while `supabase/config.toml:19` sets the same number; the deviation log says the project id was centralised "so it is written once", and the port is the one value that did not follow. Changing `[db] port` would leave the scripts pointing at the old port.

**Consider — `C4-operator.md:5` is now inaccurate.** It says the request seam "does not exist in this thread", but `apps/web/lib/supabase/local-mirror.ts:16` is on the branch and imports `applyLocalAuthMirror`. The live reason for deferral is just the staging sign-in by a person; the note should say that so the operator does not wait on STK-12.

**Consider — one runtime claim carries no evidence.** `as-built.md:15-20` reports a Mode B end-to-end walk (both key styles against GoTrue, `db:local` reporting auth-owned and exiting 1, `db:stop --no-backup` returning to Mode A) in prose, with no capture and no criterion requiring it, and it is not listed under "Not verified". Volunteered assurance should still be labelled unverified, or it reads like proof.

---

### Conversations (not defects)

The 60-second cache window is worth one sentence to whoever writes STK-12's error path. `src/local-auth-mirror.ts:53` keeps a per-process entry for a minute, and a developer who runs `db:stop --no-backup` then `db:local` under a live dev server is signed in with no `public.users` row for up to 60 s, so anything with a foreign key to it fails. The mirror's comment treats this as intended, and the cache was explicitly the dev's call — I only ask that the seam log it as a known transient rather than a 500 with no explanation.

The LAN exposure is on the record and reads as genuinely Taylor's to accept: the CLI publishes `54322` on every interface with password `postgres`, and in Mode A that database holds real staging emails. Warning, tech-stack row and `new-project.md:127` all name it. I am not filing it as a defect — D-STK-6 chose the CLI and warden passed it — but it is an accept-the-risk decision that should be made explicitly rather than inherited.

C5's wording needs settling before anyone spends an afternoon on the rehearsal: as written it cannot pass. `C5-operator.md:7` proposes the scope; it needs a yes or a different grep.

---

### Runtime checklist (by risk)

1. Re-run `yarn review:run warden STK-11`, then `yarn review:run mason STK-11`; both are required by the tier before merge.
2. Settle C5's grep scope, then run the removal rehearsal on a scratch copy and record the grep output plus both exits in `C5-operator.md`.
3. With STK-12's seam up: `yarn db:local`, `yarn db:local:reset`, sign in on hosted staging, then confirm the row in local `public.users` and record it in `C4-operator.md`.
4. From a live Mode A with mirrored users, run `yarn db:local:full` and confirm whether an exposure warning appears (S1 says it will not).
5. On a machine where `docker port supabase_db_<id> 5432` fails, confirm `yarn db:local` still reaches its ready line (S2).

VERDICT: PASS
