# Review — mason on STK-11

> Written by `yarn review:run mason STK-11`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: efd2f37963742150cd7b8f01b4b37485de98411896332a3152159dab5e08ec04
- as_built_sha256: d7f32fbd5ae3d707719fa92474504b10eb789521753211db0c0deab2224a32c2
- head: c19369cb0d0de39268cbc0fb5f65e212e6f9acd2
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T23:30:07Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason STK-11`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket STK-11 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 capture: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/test-db.txt (sha256 4068f2af91d8)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/C2.log (sha256 60265fe5e5d4)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/C3.log (sha256 c2dce1b9693f)
   - C4 manual: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/C4-operator.md (sha256 babd1f230390)
   - C5 manual: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/C5-operator.md (sha256 5b4554942813)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, docs/engineering/tech-stack.md, docs/runbooks/new-project.md, docs/runbooks/remove-supabase-auth.md, docs/runbooks/remove-supabase-database.md, package.json, packages/db/.env.example, packages/db/package.json, packages/db/scripts/auth-ddl.test.ts, packages/db/scripts/auth-ddl.ts, packages/db/scripts/auth-writers.test.ts, packages/db/scripts/check-migrations.ts, packages/db/scripts/database.ts, packages/db/scripts/env.ts, packages/db/scripts/local-auth-marker.ts, packages/db/scripts/local-full.ts, packages/db/scripts/local-image.ts, packages/db/scripts/local-users.test.ts, packages/db/scripts/local-users.ts, packages/db/scripts/local.ts, packages/db/scripts/migrate.ts, packages/db/scripts/reset-local-db.test.ts, packages/db/scripts/reset-local-db.ts, packages/db/scripts/seed-users.ts, packages/db/scripts/setup.ts, packages/db/scripts/supabase-cli.test.ts, packages/db/scripts/supabase-cli.ts, packages/db/src/local-auth-mirror.test.ts, packages/db/src/local-auth-mirror.ts, packages/db/supabase/.gitignore, packages/db/supabase/config.toml, packages/db/supabase/setup/04_users_backfill.sql, packages/db/test/local-auth-mirror.test.ts, packages/db/test/reset-local-db.test.ts, packages/db/test/rls.test.ts, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Verdict up top

PASS. No Blocking findings. One-way-door path (`packages/db/**`, D-STK-5/D-STK-6 ratification, per technical.md:40) got a full read: placement, the guard topology, the data model and the removal path all hold. Three Should-fixes, none architectural.

## Criteria

**C1 — met.** `evidence/test-db.txt:134-139` is 15/15, 0 skipped, header naming Mode A (identities absent, marker present) and the CLI image. Each clause of the statement maps to a named subtest I verified in code: id-and-email-only is asserted by filtering non-null columns off `to_jsonb(u)` (`test/local-auth-mirror.test.ts:112-116`), not by naming two columns — the stronger form; email upsert at `:160-170`; zero rows with `auth.identities` created as `supabase_auth_admin` at `:198-208`; zero rows with the marker dropped at `:210-220`; both refusals inside a rolled-back transaction (`:179-189`) and re-asserted absent after rollback.

**C2 — met, and proven in the right order.** `src/local-auth-mirror.test.ts:31-41` counts socket attempts through postgres.js's socket factory: 0 for a direct hosted host and a pooler host. `:43-53` then shows a loopback URL *does* reach connect — that pair is what proves the check precedes the connection rather than merely existing. `scripts/local-users.test.ts:19-38` refuses hosted, private-network (`10.0.0.5`), look-alike (`localhost.example.com`) and unset before any fetch, with `calls.length === 0`.

**C3 — met.** `evidence/C3.log:2` exit 0 at `d034a27`, carrying `check-stack`, `check-migrations`, the boundaries probes (`:89-100`) and `check-test-weakening` (`:27`). The staleness warnings at `:18-20` are inside the artifact of the run that re-recorded C3 to C5, so they describe the prior record, not this one; SessionStart reports only the three reviews outstanding.

**C4 — correctly deferred.** Matches the contract's own reason (contract.md:64) and genuinely needs STK-12's seam. The database half is already proven: insert plus trigger (C1 subtest 1) and restore-after-reset (`04_users_backfill.sql`, C1 subtests 3 and "the setup SQL"). `evidence/C4-operator.md:9-14` is a four-step check a person can run unaided.

**C5 — deferred, with a wording defect.** See Should-fix 2.

**Non-negotiables — all seven hold, six of them mechanically.** CLI exact at `packages/db/package.json:61`; `db:local` database-only (`scripts/local.ts:27`) vs `db:local:full` (`package.json:43`); sole writer enforced by `scripts/auth-writers.test.ts:35`; no `process.env` enforced by `packages/db/eslint.config.mjs:10-20`, with `scripts/env.ts` the single reader; the guard inside the statement at `src/local-auth-mirror.ts:91-108`, where the `insert … select from guard where guard.open` shape means no caller can skip it; `config.toml:23-27` disables CLI migrations and seeds; and a repo-wide grep for a mode variable returns nothing.

The `loopback.ts` extraction is the right call and I would have asked for it: seven importers (mirror, marker, reset, `local.ts`, `local-full.ts`, `local-users.ts`, three test files), and `docs/runbooks/remove-supabase-auth.md:24,27` keeps the `./loopback` export when the mirror is deleted — the removal path builds. `test/rls.test.ts:43,58` now asserts both the migration client and the runtime `db.$client`.

## Findings

**Should-fix — `packages/db/src/loopback.ts` and `loopback.test.ts` are not in `planned_paths`** (contract.md:25-26 lists only the mirror's two files under `src/`; `src/**` is not globbed). The as-built registered every other addition (as-built.md:35,49) but not these, though it declares the move itself (as-built.md:53). Staleness is computed over planned paths, so a future edit to the file that now holds the only pre-connection guard would leave C1 to C3 reading fresh. Add both paths with `yarn contract:add`-style registration before close.

**Should-fix — C5 cannot pass as worded, and the rehearsal belongs to epic ticket 20.** `evidence/C5-operator.md:7` says the grep scope is "proposed and not yet settled"; `docs/runbooks/remove-supabase-database.md:55` deliberately keeps `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` while auth stays, so "grep empty" is false by design. technical.md:56 already assigns "Removal dry-run on a duplicate" to ticket 20. Either settle the scope to the proposed `git grep -il 'drizzle\|supabase' -- ':!docs' ':!specs'` with those two variables named as allowed hits, or move C5 to ticket 20. Honestly disclosed in both the evidence and as-built.md:61, which is why it is not Blocking.

**Should-fix — `review:vigil` and `review:warden` are recorded FAIL** (results.json:73-101) while as-built.md:42-48,52-56 claims their findings fixed. I verified each claimed fix is in the tree (the loopback module and its seven importers, `test/rls.test.ts:43,58`, `auth-writers.test.ts:35-46`, `nonLoopbackBindings` at `supabase-cli.ts:68-75` with tests, the exposure in `new-project.md:127` and `tech-stack.md:41`, the variable guidance at `remove-supabase-database.md:55`). The fixes are real; the records are not. Both need re-running — my PASS does not close the ticket.

**Consider — widen the sole-writer scan past `packages/db`.** `scripts/auth-writers.test.ts:36` walks `src`, `scripts`, `supabase`, `migrations` inside the package only, while the non-negotiable is repo-wide. Today the gap is closed by composition (`postgres` is pinned to `db` in `SDK_OWNERS`, with boundaries probes at `C3.log:89-100`), so a raw SQL write elsewhere could not compile — but that is an inference, and a repo-wide scan would make it a property.

**Consider — as-built.md:25 says `new-project.md` "step 2 renames `project_id`"; it is step 5** (`docs/runbooks/new-project.md:72`). The as-built is immutable once merged, so the wrong number misdirects.

## The one call for Taylor

The LAN exposure (as-built.md:30): CLI 2.119.0 publishes 54322 on every interface with password `postgres`, and in Mode A that database holds mirrored staging emails. The repo cannot close this mechanically — the CLI has no setting, and making `db:local` refuse rather than warn would stop the database starting on a default Docker install. Detect, warn with the exact daemon fix (`scripts/local.ts:44-48`), document at both places a developer reads, escalate the residue is the correct handling, and the escalation is the operator's to accept.

VERDICT: PASS
