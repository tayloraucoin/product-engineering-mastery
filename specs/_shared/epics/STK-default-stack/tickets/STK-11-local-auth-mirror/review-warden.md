# Review — warden on STK-11

> Written by `yarn review:run warden STK-11`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: e7cc2fb8716af0f91ca85d99149fd2a7b79384c8741b334879d78bbd2fa04893
- as_built_sha256: 23d561c78f14fd8768da9c6493450b8230105897869de8c103967aba35247f24
- head: 3465bd77c5d7367af8d39de6d65d82dc74d95851
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T23:43:45Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-11`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-11 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Criteria

**C1 — PASS.** `evidence/test-db.txt` is a 15/15, 0-skipped run against the Mode A container named in its header (`auth.identities` absent, marker present). Each clause of the statement has a matching subtest, and the code backs them: the "id and email only" assertion is a real column check, not a spot check — it collects every non-null column of the written row and asserts exactly `["email","id"]` (`packages/db/test/local-auth-mirror.test.ts:112`). Email change upserts into both tables (`:160`). Zero rows with `auth.identities` created as `supabase_auth_admin` (`:198`) and with the marker dropped (`:210`), both inside rolled-back transactions, plus a third case proving a refusal leaves an existing email untouched (`:222`). The guard is inside the statement, so no caller can skip it (`packages/db/src/local-auth-mirror.ts:91`).

**C2 — PASS.** `evidence/C2.log`, exit 0, 114 tests. `applyLocalAuthMirror > refuses a non-loopback host before connecting` uses a socket-counting client and asserts `attempts() === 0` for two hosted URL shapes, then asserts a loopback URL does reach the socket (`packages/db/src/local-auth-mirror.test.ts:31`) — that pair is what makes "before connecting" provable rather than asserted. `seedLocalUsers > refuses a non-loopback auth URL before sending anything` covers hosted, unset and look-alike hosts; the refusal precedes the first `fetch` (`packages/db/scripts/local-users.ts:36`), and `redirect: "error"` keeps the key from following a hop off the machine (`:63`).

**C3 — PASS.** `evidence/C3.log`, exit 0, through format, `lint:docs`, `check-settings`, `test:hooks`, `check-refs`, `check-stack`, `check-migrations` ("none touch the auth schema"), `check-specs`, `check-test-weakening`, contrast, boundaries probes, lint, types, `check-client-bundle` ("18 server-only value(s), none in 27 browser-facing file(s)") and both builds. The `check-specs` lines are warnings, not failures. The staleness warning at `C3.log:24` names the *previous* warden PASS, which this run replaces.

**C4 — correctly deferred.** `--verdict deferred`, and the reason matches the contract's (`contract.md:66`): it needs STK-12's seam plus a human staging sign-in. `evidence/C4-operator.md` writes the check out in four steps. The database half is genuinely covered: `04_users_backfill.sql` restores a `public.users` row whose auth row the mirror now sees as unchanged (`packages/db/supabase/setup/04_users_backfill.sql:9`), proven by the reset subtest at `test/local-auth-mirror.test.ts:130`.

**C5 — correctly deferred.** Reason matches `contract.md:70`. The evidence file is honest that the criterion as worded cannot pass while Auth stays, and proposes a scope.

**Non-negotiables — all hold.** CLI `supabase 2.119.0` exact as a `@pem/db` devDependency (`packages/db/package.json:61`); `db:local` runs `db start` only (`scripts/local.ts:27`), `db:local:full` runs `start` (`scripts/local-full.ts:39`); the mirror reads no `process.env` and takes the client from its caller (`src/local-auth-mirror.ts:72`), with `scripts/env.ts` the package's only reader; `[db.migrations]` and `[db.seed]` both `enabled = false` (`supabase/config.toml:23`); the mode is the `_LOCAL` auth value with no mode variable (`scripts/env.ts:67`). `.env.example` and `turbo.json` carry the names with empty values and a comment marking the service-role key server-only; no secret appears in any evidence file.

## Findings

**Should-fix — the LAN exposure is documented but its acceptance is not recorded anywhere revisitable.** `as-built.md:30` states the CLI publishes 54322 on every interface with password `postgres`, that in Mode A that database holds mirrored staging emails, and that "accepting the remaining exposure is Taylor's call." The mitigations are real and I credit them: a runtime warning naming the exact Docker setting (`packages/db/scripts/local.ts:44`), tested binding detection (`scripts/supabase-cli.ts:68`), and operator-facing text in `docs/runbooks/new-project.md:127` and `docs/engineering/tech-stack.md:45`. What is missing is the acceptance itself. D-STK-6 was ratified on 2026-10-03, before this was discovered, and STK-9 had bound 127.0.0.1 — so this is a departure from what was ratified, still pending. A merged as-built is immutable, which makes it the wrong home for a risk that should carry an owner and a revisit trigger (the CLI gaining a bind setting). Record the acceptance where decisions live, with that trigger. Adversary: anyone on the developer's network; path: `0.0.0.0:54322` → `postgres/postgres` → mirrored staging emails; impact: disclosure of real users' addresses from a laptop on a café or office network. Not Blocking — the warning fires, the fix is one Docker setting, and the blast radius is a dev machine's staging data.

**Consider — C5's grep scope is unsettled, and the loose reading would pass the hazard the runbook names.** `evidence/C5-operator.md:7` proposes allowing `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as permitted hits. But `docs/runbooks/remove-supabase-database.md:55` is explicit that once `toolkit.json` has no `auth` entry those two must go, "A service-role key name with no reader invites a live key where nothing uses it." Settle the scope so the rehearsal distinguishes "auth stays, keep them" from "auth gone, orphaned secret name" rather than allowing both.

**Consider — the only-writer guard is scanned package-locally.** `packages/db/scripts/auth-writers.test.ts:36` scans `src`, `scripts`, `supabase`, `migrations` inside `@pem/db`. The guard does hold repo-wide, but only because `SDK_OWNERS` pins `postgres` to `db` and `lint:boundaries` enforces it — a reader of this test cannot see that. Widening the scan to the repo would make the non-negotiable self-evidencing instead of inferred from two files.

Three guards stand between this code and a hosted `auth.users` — loopback before connect, `auth.identities`, and the marker — and two of the three live inside the statement where no caller can skip them. The refusal paths are tested for *zero I/O*, not just for throwing, which is the distinction that matters. Deletion and retention of mirrored emails are named with a working wipe path. Nothing here is Blocking.

VERDICT: PASS
