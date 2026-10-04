# Review — warden on STK-11

> Written by `yarn review:run warden STK-11`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: efd2f37963742150cd7b8f01b4b37485de98411896332a3152159dab5e08ec04
- as_built_sha256: d7f32fbd5ae3d707719fa92474504b10eb789521753211db0c0deab2224a32c2
- head: c19369cb0d0de39268cbc0fb5f65e212e6f9acd2
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T23:30:07Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-11`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-11 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

I have what I need. Reviewed in order: contract, results, as-built, all five evidence files, the changed code, and D-STK-6 in `technical.md`.

---

# Warden review — STK-11 local-auth-mirror

## Criteria

**C1 — met.** `evidence/test-db.txt` shows 15 of 15 passing, 0 skipped, against the CLI image in Mode A. The capture's subtests map one-to-one onto the statement: `test/local-auth-mirror.test.ts:112-116` asserts the inserted row's only non-null columns are `email` and `id`; `:160-170` the email upsert into both tables; `:198-208` zero rows with `auth.identities` created as `supabase_auth_admin`; `:210-220` zero rows with the marker dropped. The code backs the capture rather than merely accompanying it — the guard is a CTE inside the INSERT (`src/local-auth-mirror.ts:91-108`), so a refusal is structurally incapable of writing. The capture header names `be5bdc5` while the run record stamps `d034a27`; the as-built explains the one-commit offset, and commit ancestry is not something I can settle with Read/Grep/Glob.

**C2 — met, and proven the right way.** Both refusals are shown to happen *before* egress, not merely to throw. `src/local-auth-mirror.test.ts:36-40` counts socket attempts through postgres.js's socket factory: zero for a hosted direct URL and a hosted pooler URL. `scripts/local-users.test.ts:19-38` counts fetch calls: zero for hosted, `10.0.0.5`, the look-alike `localhost.example.com`, and unset. `assertLoopbackClient` runs on line 76 of the mirror, ahead of the query on line 91.

**C3 — met as recorded** (exit 0, `C3.log`). Worth stating plainly: that same log carries `check-specs` warnings at lines 18-20 that C3, C4 and C5 were stale at the moment it ran, and its head is two commits behind current HEAD. The close-time `yarn verify` settles that; it is not a security matter.

**C4 — properly deferred, not proven.** `C4-operator.md` names why (needs STK-12's seam and a human staging sign-in), what is already proven, and the four steps to run. Correctly recorded `--verdict deferred`.

**C5 — properly deferred, with an honest unresolved edge.** `C5-operator.md` says outright that the criterion as worded cannot pass while Auth stays, and proposes a grep scope Taylor has not settled. Flagging that rather than quietly redefining the criterion is the right call; the wording needs Taylor.

**Non-negotiables — all seven hold.** CLI pinned exact (`packages/db/package.json:61`, no range); `db:local` starts the database only and `db:local:full` the stack; the mirror is the only writer to `auth.users` repo-wide (grep confirms; `scripts/auth-writers.test.ts` enforces it) and never reads `process.env` — the caller hands in the client; both guards live inside the statement; `assertLoopbackClient` precedes any query; `seedLocalUsers` refuses non-loopback before any fetch; `config.toml:23-27` disables CLI migrations and seeds; the mode is the `_LOCAL` auth value with no mode variable.

One structural control deserves naming because it was not asked for: `packages/db/scripts/env.ts` is the only reader of `SUPABASE_SERVICE_ROLE_KEY` in this package, and `packages/db/package.json:6-35` does not export `./scripts`. App code therefore *cannot* import the service-role reader. That is the control at the layer where it cannot be forgotten.

## Findings

**Should-fix — the LAN exposure is accepted in a file that is about to become immutable.** `as-built.md:30` is the only place the owner, rationale and residual appear. The path is complete: anyone on the developer's network scans tcp/54322, connects as `postgres`/`postgres` (`scripts/local-image.ts:26`), and reads `select email from auth.users`. The impact is the email address of every staging user who has signed in on that machine. I am not calling this Blocking: the binding belongs to the CLI that D-STK-6 ratified and has no setting; the control is at the strongest layer this ticket could reach (detect-and-warn at `scripts/local.ts:44-48`, tested at `scripts/supabase-cli.test.ts:7-15` including a specific LAN address); and it is documented where a porting developer reads it (`docs/runbooks/new-project.md:127`, `docs/engineering/tech-stack.md:41`). What is missing is the revisit trigger. Put one line beside D-STK-6 in `technical.md:19` or in the ledger: **the first product that ports this toolkit and whose staging holds real signups** — at which point Docker's `"ip": "127.0.0.1"` stops being advice in a warning and becomes a step in `new-project.md`. An acceptance recorded only in an as-built is one nobody reads again.

**Should-fix — mirrored staging emails have no stated wipe path, and the one command a developer reaches for preserves them.** `scripts/reset-local-db.ts:6` leaves the auth schema as it is, and `supabase/setup/04_users_backfill.sql` then restores the public rows — deliberately, because C4 depends on it (`as-built.md:34`). The consequence is that `yarn db:local:reset`, the obvious "start clean" command, specifically does not remove copied personal data. `yarn db:stop --no-backup` does, but it is named only as a way to drop the volume, never as the way to remove mirrored staging users. One sentence in `new-project.md` step 6 or in the mirror's header closes it. Documentation is the right layer here: the preservation itself is correct.

**Consider — `scripts/auth-writers.test.ts:36` guards only `packages/db`.** It scans `src`, `scripts`, `supabase`, `migrations` within the package. A SQL write to `auth.users` added in `apps/web` or `packages/auth` — exactly where the next one would plausibly go — would not trip it. Nothing is wrong today; a repo-wide grep finds no other writer.

**Consider — the ticket's most load-bearing file is outside its declared paths.** `contract.md:25-26` names `src/local-auth-mirror.ts` and its test by name, and `as-built.md:35` lists the paths added since, but neither names `src/loopback.ts` or `src/loopback.test.ts`, created by the vigil-driven refactor. Every guard in the ticket now depends on that file. The code is right — the auth runbook correctly keeps it (`remove-supabase-auth.md:24,27`) — but the record of what this ticket touched is incomplete, which matters for the one-way-door review `technical.md:40` assigns to me.

**Consider — `src/loopback.ts:19` accepts octets above 255,** so `127.999.1.1` reads as loopback. No reachable path: that string is not a routable address. One regex change if the file is touched again.

## Verdict

No Blocking findings. The two earlier Blocking issues are genuinely closed, not argued away: `test/rls.test.ts:48,58` now asserts loopback on both the migration and runtime clients before migrating or writing, and `auth-writers.test.ts` no longer depends on the mirror existing, so the guard survives the auth runbook deleting it. The three guards are independent and correctly layered, what the mirror writes is minimal (id and email, nothing else), credentials never reach a log (`src/connection.ts:25-33`), and the auth runbook tells the operator to rotate the service-role key if it was ever shared. C4 and C5 are not proven and are honestly marked deferred.

VERDICT: PASS
