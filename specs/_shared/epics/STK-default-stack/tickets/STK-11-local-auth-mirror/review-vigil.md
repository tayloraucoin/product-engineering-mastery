# Review — vigil on STK-11

> Written by `yarn review:run vigil STK-11`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: e7cc2fb8716af0f91ca85d99149fd2a7b79384c8741b334879d78bbd2fa04893
- as_built_sha256: 182380d23a6355cfe77c624a8bc2d8889b4c21e148af1e08a67ae1a526513998
- head: a6eb6a733b32afa21ef5ff4c8c445e18412f09ae
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-05T00:39:29Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-11`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-11 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Review — STK-11 local-auth-mirror (vigil, fresh context)

**Verdict: Pass with conditions.** No Blocking findings. Two Should-fixes, both about records rather than code; C4 and C5 remain honestly unverified and operator-owned.

### Criterion by criterion

**C1 — mirror inserts id and email only, upserts on email change, zero rows when `auth.identities` exists or the marker is absent; none skipped. MET.**
`evidence/test-db.txt` is a TAP transcript against the CLI image (`supabase_db_pem`, `17.11.0.002`), Mode A named in its header: 15 tests, 15 pass, `# skipped 0`. The three statements in the criterion each map to a named test (`inserts id and email only…`, `upserts a changed email into auth.users and public.users`, `inserts zero rows when auth.identities exists`, `inserts zero rows when the marker is absent`). The code backs them: `packages/db/src/local-auth-mirror.ts:91-108` puts both guards inside the statement (`to_regclass('auth.identities') is null and to_regclass(marker) is not null`, consumed by `where guard.open`), so a refused call selects no row and writes nothing — not a caller-skippable precondition. `test/local-auth-mirror.test.ts:112-116` asserts the non-null column set is exactly `["email","id"]`, which is the real test of "id and email only"; the two refusal cases run in a rolled-back transaction, and the `auth.identities` case is created as `supabase_auth_admin` (`test/local-auth-mirror.test.ts:88-90`), not as a convenient stand-in.

**C2 — `applyLocalAuthMirror` and `db:seed-users` refuse a non-loopback target before connecting. MET.**
Both refusals are proven by counters, not by inspection. `src/local-auth-mirror.test.ts:31-41` drives two hosted URLs through a socket factory and asserts `attempts() === 0`, then `:43-53` asserts the loopback case does reach a connection — so the guard is shown to be in front of the socket, not merely present. `scripts/local-users.test.ts:19-38` asserts zero fetch calls for hosted, `10.0.0.5`, the `localhost.example.com` look-alike and `undefined`. Code agrees: `loopback.ts:33-43` throws on an empty host list and on any non-string or non-loopback entry; `local-users.ts:36-40` refuses before building the endpoint. `C2.log` shows all of these green at 134 tests, exit 0.

**C3 — types and the full chain pass. MET.** `C3.log` exit 0, with `check-settings`, `check-stack` (12 modules), `check-migrations`, `check-specs`, `check-test-weakening` ("no weakening against main") and both builds. The in-log warnings are the harness reporting the ticket mid-close at that moment, not failures.

**C4 — a fresh reset in Mode A ends with a signed-in staging user in local `public.users`. NOT VERIFIED (deferred, legitimately).** It needs a person to sign in on hosted staging; the contract's own `reason` says so, and `--verdict deferred` is the sanctioned record. What is proven in code is the database half: insert plus trigger (C1), and `supabase/setup/04_users_backfill.sql:9-11` with `test/reset-local-db.test.ts:103-107` asserting the public row is back after `resetLocalDatabase`. The end-to-end leg is unproven.

**C5 — removal rehearsal leaves the greps empty and verify green. NOT VERIFIED (deferred, legitimately), and unsatisfiable as worded.** The runbook content checks out against the code (`remove-supabase-auth.md:26-28` deletes exactly the mirror, marker, Mode B and seed files and keeps `loopback.ts` and `auth-writers.test.ts`; `remove-supabase-database.md:24,28,36,71` adds the CLI, the volume, the new scripts and the `db` probes). But `C5-operator.md:7` is right that the grep cannot come back empty while Auth stays. That is a contract-wording problem for Taylor, not a build defect.

### Findings

**Should-fix — `evidence/C4-operator.md:5` states a precondition that no longer holds.** It says the check needs STK-12's request seam and that "Neither exists in this thread." The seam exists on this branch: `apps/web/lib/supabase/local-mirror.ts:51-55` calls `applyLocalAuthMirror`, and STK-12 has an as-built. Only the staging sign-in is outstanding. As written, the note parks the ticket's only end-to-end proof behind work that already landed. Owner: builder (update the note; the deferral itself stands).

**Should-fix — warden's recorded PASS is stale, in warden's own domain.** `C3.log:20` names eleven files changed after it, and the as-built's third round (`as-built.md:57`) added the network warning to `db:local:full` — the exact exposure concern warden first failed the ticket on. `check-specs --strict` will block the merge; re-record before it, not after. Owner: operator.

**Consider — C5's statement should be amended or ruled on before the rehearsal is run** (`C5-operator.md:7`). Running an operator check against a statement everyone agrees is unsatisfiable produces a record no one can read later. Either settle the grep scope in the contract or note the allowed hits in the criterion.

**Consider — `scripts/local-image.ts:25` hardcodes `LOCAL_PORT = 54322` while the project id is read from `supabase/config.toml:19`.** A product that changes `[db] port` gets a 120 s "did not accept connections" timeout from `waitForDatabase` with no hint why. Read the port the same way, or say in `new-project.md:72` that the port lives in two places.

**Consider — `scripts/supabase-cli.ts:86-91` returns `false` when `docker port` throws**, so the exposure warning silently does not print where that call fails. The fail-open is deliberate and right (it must not fail a started database), but silence reads as "loopback only". One line — "could not check the binding" — keeps the user from mistaking it for safety.

**Consider — `packages/db/.env.example:29-30` lists only the `_LOCAL` auth forms** while `scripts/env.ts:30-37` reads all three forms of both variables; the as-built's "lists exactly the variables they read" is a shade stronger than the file. The omission is the safer default — worth one comment saying it is deliberate.

### Conversations

The accepted LAN exposure is the one thing here that touches a real person's data: in Mode A the local database holds mirrored **staging** emails, reachable from the network with password `postgres` (`as-built.md:30`). It is warned at runtime, documented in `new-project.md:127` and `tech-stack.md:46`, and named as Taylor's call. I am not re-litigating it; I am keeping it visible, because the mitigation lives in Docker's daemon settings, which no check can see. If a laptop ever runs this on conference wifi, the wipe path (`db:stop --no-backup`) is the thing to remember, and it is only in the runbook.

The re-created-staging-user case (`local-auth-mirror.ts:66-70`, `local-mirror.ts:56-64`) ends with a dev whose user silently stops mirroring and one `auth.mirror_email_taken` warning. The log line names the fix, which is the right call for a dev-only surface — worth knowing it exists before someone spends an hour on it.

### Runtime checklist (ordered by risk)

1. C4: with STK-12 in place — `yarn db:local`, `yarn db:local:reset`, sign in on hosted staging through localhost, then confirm the row in `public.users` on 127.0.0.1:54322. Record id and date in `C4-operator.md`.
2. Settle C5's grep scope, then run the removal rehearsal on a scratch copy and record both exits.
3. Re-record warden, then `yarn check-specs --strict` before merge.
4. Confirm the exposure warning fires on your machine (`yarn db:local`), and decide the Docker `"ip": "127.0.0.1"` question on the record.

Assumptions: `[ASSUMPTION: the precedence ladder is docs/index.md as given; technical.md D-STK-6 is the governing surface.]` `[ASSUMPTION: C1's capture is read as a sanctioned shell transcript — testing.md's "capture is UNVERIFIED until P-C" is scoped to Playwright `?state=` UI captures, not to command output.]` I could not run anything; every "met" above rests on the committed evidence plus the code path that produces it, and C4/C5 are reported as not verified.

VERDICT: PASS
