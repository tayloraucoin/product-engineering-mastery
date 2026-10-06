# Review — vigil on STK-9

> Written by `yarn review:run vigil STK-9`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 2602afb9282d250acfde0d5b3cb4778088144415470b8b3f1d1160e7837dcc61
- as_built_sha256: e18ddc8962f9f4ff68390f8b8f21cf126c4eb28868162b0d0b37af4d91f75a0d
- head: 57a2057cc2745ed56843ec6be133a86aa328cd88
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T05:48:43Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-9`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-9 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 capture: specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/evidence/test-db.txt (sha256 8ac0f56cbfd4)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/evidence/C2.log (sha256 a3b3689ad6be)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/evidence/C3.log (sha256 25c43df43991)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/evidence/C4.log (sha256 76ff6867fda7)
   - C5 manual: specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/evidence/C5.md (sha256 8723c7d78d01)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/next.config.ts, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, docs/runbooks/remove-supabase-database.md, package.json, packages/config/eslint/boundaries.js, packages/db/drizzle.config.ts, packages/db/eslint.config.mjs, packages/db/migrations/0000_example_schema.sql, packages/db/migrations/meta/0000_snapshot.json, packages/db/migrations/meta/_journal.json, packages/db/package.json, packages/db/scripts/auth-ddl.test.ts, packages/db/scripts/auth-ddl.ts, packages/db/scripts/check-migrations.ts, packages/db/scripts/database.ts, packages/db/scripts/env.ts, packages/db/scripts/local-image.ts, packages/db/scripts/local.ts, packages/db/scripts/migrate.ts, packages/db/scripts/setup.ts, packages/db/src/client.ts, packages/db/src/connection.test.ts, packages/db/src/connection.ts, packages/db/src/policies.ts, packages/db/src/rls.test.ts, packages/db/src/rls.ts, packages/db/src/schema/account/users.ts, packages/db/src/schema/index.test.ts, packages/db/src/schema/index.ts, packages/db/src/schema/notes/notes.ts, packages/db/supabase/setup/01_functions.sql, packages/db/supabase/setup/02_auth_triggers.sql, packages/db/supabase/setup/03_public_tables.sql, packages/db/test/rls.test.ts, packages/db/tsconfig.json, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

# Review — vigil on STK-9

## Verdict

**Pass with conditions** — every criterion is met by evidence I could trace to code, and the privacy proof the slice exists for (the bridge sets the three settings; an owner-private row is invisible and unwritable to another user, admin included) was executed, not asserted. Eight items to fix, none of them a breach: the gaps are in what was *proven*, not in what was built. No Blocking finding.

## Criteria

**C1 — met.** `evidence/test-db.txt` is a genuine `node --test` TAP run: 3 suites, 6 tests, `pass 6 / fail 0 / skipped 0`, no `todo`. The suite and test names match `packages/db/test/rls.test.ts` one for one (2+2+2), so the log belongs to this file and nothing was trimmed. The contract's two named proofs are there — `test/rls.test.ts:63-74` asserts `app.user_id`, `app.user_role` and `current_user = authenticated` inside the transaction, and `:122-170` proves bob, *and bob with role `admin`*, see `[]` and update `[]` on alice's note, that a forged `ownerId` insert raises `42501`, and that the row is byte-unchanged afterwards. Two seats I did not ask for are also walked: `:76-91` proves the pooled connection comes back clean (`pg_role: "postgres"`, both settings null), and `:117` asserts `tables_without_rls = 0`. The "never skips" half of the non-negotiable is written (`:42-47` throws naming `yarn db:local`) but not *shown* — see Should-fix 3.

**C2 — met.** `scripts/auth-ddl.test.ts:38-48` pins eighteen shapes of auth DDL and writes as caught, and four near-misses as allowed, including `"public"."author"."x"` and the word `authentication`; I re-derived both regex paths and agree. `:50-61` fails a synthetic `create trigger … on auth.users` and numbers it statement 2 with comments stripped; `:63-73` scans the real `MIGRATIONS_DIR`, asserts no findings *and* asserts the FK to `auth.users` is present, so the pass is not vacuous. `C2.log` is exit 0, 27 tests (14 env + 13 db), zero skipped. The CLI's passing half ran in `C4.log:17`; its failing half did not — Should-fix 6.

**C3 — met.** `boundaries.js:63-66` owns `postgres` and `drizzle-kit` to `db` per D-STK-16; `ownerOverrides()` (`:98-110`) re-grants them to `packages/db/**/*.{ts,…}` only and `restrictedImports(null)` (`:192`) bans them elsewhere with the owner named. `C3.log` exit 0. `PACKAGE_IMPORTS.db = ["config","env"]` matches D-STK-1's graph.

**C4 — met at the head it was recorded against.** `C4.log` is exit 0 through format, docs, hooks, refs, stack, migrations, specs, tests, budget, lint, boundaries, types, client-bundle and both builds. `package.json:13` runs `yarn check-migrations` after `check-stack` and `toolkit.json:21` sets `migrationsDir` — the sixth non-negotiable holds. Two warnings are carried knowingly (`C4.log:18-22` close-time staleness, `:487` `.env.example`). See Should-fix 2 and 8.

**C5 — met, and the reading is accurate.** I checked `evidence/C5.md` against the artifacts rather than taking it: `evidence/db-generate.txt:22-45` matches `migrations/0000_example_schema.sql` line for line; `auth` appears exactly once in the SQL (`:18`, the FK) and once in `meta/0000_snapshot.json:44` (`schemaTo`); RLS is enabled on both tables in the migration itself (`:8,17`), so the deny exists before `db:setup` ever runs; `_journal.json` holds one entry whose tag matches the file; no policy calls `auth.uid()`. `authUsers` is imported at `src/schema/account/users.ts:10` and absent from `src/schema/index.ts`, asserted at `schema/index.test.ts:19-21`.

**Non-negotiables.** Pins exact and rowed (`packages/db/package.json:41-49`, `tech-stack.md:39-40`, resolved in `yarn.lock:2429,2443,5271`). Policies beside columns from the three factories (`users.ts:28`, `notes.ts:27-30`). Transaction pooler with `prepare: false` (`client.ts:31-34`); session pooler for migrations, enforced not just documented (`connection.ts:40-62`, tested at `connection.test.ts:11-26`, and credentials never reach a message, `:35-41`). Setup SQL idempotent and applied in name order (`database.ts:39-54`), proven by the trigger/policy census at `test/rls.test.ts:103-118`. `yarn test` excludes the integration file (`package.json:31` vs `:32`). The deny-by-default chain is sound on both layers: `03_public_tables.sql:22-27` strips Supabase's default grants from `anon` and the policies name only `authenticated`, while an unset `app.user_id` collapses to `NULL` and matches no row (`policies.ts:20`).

## Findings

**Blocking** — none.

**Should-fix**

1. `as-built.md:5` ("**Not captured yet**") and `:24` say the integration run was never captured; `results.json:5-15` records C1 PASS at head `534a7d1` with `evidence/test-db.txt`. The human-readable record currently denies the ticket's only privacy proof. The as-built is pre-merge and still editable — correct it before merge, or a later reader audits this slice believing the policies were never exercised. Owner: builder.
2. `.env.example` is a planned path and holds none of the six `DATABASE_*` names, against `docs/engineering/codebase-conventions.md:122`. `C4.log:487` is the machine proof; `turbo.json:15-20` and `toolkit.json:207` carry them. The disclosure at `as-built.md:18` is honest — `.claude/settings.json:30-31` does deny `Read(**/.env.*)`, so no agent can do this — but `docs/runbooks/remove-supabase-database.md:36` already tells a future reader to find these variables "From `.env.example`", and that sentence is false today. Owner: Taylor.
3. The "fails, never skips" guarantee is unverified. `test/rls.test.ts:42-47` is the whole mechanism, and the capture was necessarily taken with the image up, so nobody has seen the absent-image path produce a non-zero exit rather than a silent zero-test run. A skipped privacy proof reads exactly like a passing one — this one needs ten seconds of runtime proof. Owner: builder/Taylor.
4. The `anon` seat is never walked. `policies.ts:4-5` promises "anon has no policy, so RLS denies it every row" and `03_public_tables.sql:23` revokes its grants, but every seat in `test/rls.test.ts` is `authenticated` or the owner. On a hosted Supabase project the data API makes `anon` a reachable caller, and `as-built.md:26` records that the setup SQL has never run against a hosted project at all. Two layers of design, zero execution. Owner: builder.
5. `yarn check-migrations`' failing exit is proven only at library level. `auth-ddl.test.ts:50-61` exercises `scanMigrationsDir`; nothing exercises `scripts/check-migrations.ts:36-44`. If `process.exitCode = 1` (`:44`) were ever lost, `yarn test` and `yarn verify` both stay green while the one mechanized guard over Supabase's auth schema stops guarding. Owner: builder.
6. `test:db`'s destructive writes are gated on a variable, not on a host. `test/rls.test.ts:33-37` refuses a non-`local` tier, then `:49-51` runs migrations and inserts into `auth.users`, and `:58` deletes from it — against whatever `DATABASE_MIGRATION_URL_LOCAL` names. A developer who points that variable at a hosted database while `DATABASE_ENVIRONMENT=local` gets migrations and auth writes on it. Assert the host is loopback (`local-image.ts:12`) before the first write. Owner: builder.
7. Proof freshness is unconfirmed from files alone. C2, C3 and C4 are recorded at `40cac46` (`results.json:24,36,48`), C1 at `534a7d1` (`:12`), `review-mason.md:7` at `57a2057` — so the full chain was last proven two commits behind the head under review, and `C4.log:20-21` shows this exact staleness mechanism firing earlier on `packages/db/scripts/local.ts`. I have Read/Grep/Glob only; treat my PASS as covering the files, not the freshness. Owner: Taylor, at merge.
8. `scripts/env.ts:7` says "drizzle.config.ts, the db:\* scripts and the integration tests import it". `drizzle.config.ts:10-20` imports only `drizzle-kit` and reads no environment. A stale comment on the environment seam is the one place a stale comment misleads a future reader into adding a reader. Owner: builder.

**Consider**

9. `policies.ts:88-97` — `serviceOnlyPolicies` ships with no table using it and no test denying anyone through it. It is the factory the next author will reach for on the most sensitive table; give it one integration assertion when it gets its first table.
10. `migrations/0000_example_schema.sql:21` — `users_select_owner_or_admin` is the only policy that crosses users, and the suite proves `admin` is *denied* on notes while never pinning what `admin` may read on `users`. One assertion that admin reads another user's row (and still cannot update or delete it) would make that widening deliberate and regression-proof.
11. `evidence/test-db.txt:1` — unlike `C3.log` and `C4.log`, the capture carries no `command:`/`head:` header, so the file itself cannot be tied to a commit; only `results.json` binds it. Future `capture` criteria would be stronger with the same four-line header.

## Conversations

**Who gets to say `admin`?** `rls.ts:38-48` can only check that the role is in the enum; `policies.ts:23` then trusts `app.user_role` whole, and on `users` that opens cross-user reads of every email. Nothing inside `@pem/db` can constrain the caller — the constraint has to live in whatever builds `RlsContext`. Should STK-12's contract carry an explicit non-negotiable that the role is derived from the verified session server-side and never read from a request body, header or cookie? That seems cheaper to settle now, while there is exactly one future caller, than after two.

**The singleton is a policy bypass with a public subpath.** `client.ts:1-7` is candid that `getDb` connects as the owner and bypasses every policy, and `package.json:7-10` exports it as `@pem/db/client`. Today that is vacuously safe — no app imports it, and `apps/web/next.config.ts:19` correctly omits `@pem/db`. The question for the first consumer ticket: does the convention get a mechanism (a lint rule, or a service seam that is the only importer), or does it stay a comment? The failure mode is quiet and total, which is the kind I would rather not leave to memory.

**"Migrated but not set up" has no detector.** `local.ts:89` ends with the right next step, and `setup.ts:1-3` says to run it after migrate, which is good. But a developer who runs only `yarn db:migrate` gets tables with RLS on, no mirror trigger and no `updated_at` trigger, and the first symptom is a sign-in that produces no `public.users` row — a confusing failure a long way from its cause. Worth a one-line check (or a combined script) at the STK-11 boundary, or is the runbook enough?

## Runtime checklist

Ordered by risk; none of these is provable from the files.

1. **Stop Docker, run `yarn test:db`.** Expect a non-zero exit, a message naming `yarn db:local`, and zero skipped tests. (Should-fix 3 — the non-negotiable.)
2. **Walk the `anon` seat** against the local image: connect as `anon` and confirm `select` on `public.users` and `public.notes` returns no rows or is refused, before and after `db:setup`. (Should-fix 4.)
3. **Prove the gate fails.** Drop a scratch migration containing `create trigger t after insert on auth.users …`, run `yarn check-migrations`, confirm exit 1 naming the file and statement number, then delete it. (Should-fix 5.)
4. **Apply `db:migrate` then `db:setup` to a hosted staging project** — never done per `as-built.md:26` — re-run `db:setup` to confirm idempotency off the local image, and check the project's data API surface for `public.users`/`public.notes` as `anon`.
5. **Add the six `DATABASE_*` names to `.env.example`** with comments and re-run `yarn verify` until `check-client-bundle`'s warning at `C4.log:487` is gone. (Should-fix 2.)
6. **Re-run `yarn status STK-9` and `yarn check-specs --strict` at the merge head**, and re-record C2/C3/C4 if any `packages/db/**`, `toolkit.json`, `package.json` or `turbo.json` path moved after `40cac46`. (Should-fix 7.)
7. **Amend `as-built.md:5` and `:24`** to match `results.json` on C1 before merge. (Should-fix 1.)

## Assumptions

- `[ASSUMPTION]` `evidence/test-db.txt` was produced by `yarn test:db` on Taylor's machine after the as-built was written (consistent with `C4.log:22`, the later head on C1's record, and the "Next" line at `as-built.md:36`). I verified the log's internal consistency with the test file; I cannot verify provenance from files.
- `[ASSUMPTION]` the commits between `40cac46` and the current head touched only `specs/**` (evidence, results, the mason review). If any touched a planned path, Should-fix 7 escalates and C2–C4 must be re-recorded before merge.
- `[ASSUMPTION]` `supabase/postgres:17.11.0.003` carries a usable `auth.users`; the passing capture is my only evidence, and I treated it as sufficient.
- Instrumentation is out of scope for this slice — no events, payloads or analytics surfaces are in play. Noted so the silence is not mistaken for a pass.

VERDICT: PASS
