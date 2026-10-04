# Review — mason on STK-9

> Written by `yarn review:run mason STK-9`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 2602afb9282d250acfde0d5b3cb4778088144415470b8b3f1d1160e7837dcc61
- as_built_sha256: e18ddc8962f9f4ff68390f8b8f21cf126c4eb28868162b0d0b37af4d91f75a0d
- head: 57a2057cc2745ed56843ec6be133a86aa328cd88
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T05:43:34Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason STK-9`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket STK-9 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Verdict

**PASS** — the one-way door (schema shape, policy topology, migration set) is sound and proven by execution, not assertion. Four Should-fix items, none of them a boundary, authorization or safety breach.

## Criteria

**C1 — met.** `evidence/test-db.txt` shows 6 tests, 3 suites, `pass 6 / fail 0 / skipped 0`. The named proofs are there: `sets app.user_id, app.user_role and the role for the transaction` and `hides another user's row and refuses writes to it`. The code behind them is stronger than the criterion asks — `test/rls.test.ts:76-91` proves nothing leaks onto the pooled connection after the transaction (`pg_role: "postgres"`, both settings null), `:141-155` proves an `admin` role does not open an owner-private table, `:157-163` proves a forged `ownerId` insert fails with `42501`, and `:117` asserts `tables_without_rls = 0`. The absent-image path throws in `before` naming `yarn db:local` (`test/rls.test.ts:43-47`), so it fails rather than skips, and `tier !== "local"` is refused outright (`:33-37`).

**C2 — met.** `auth-ddl.test.ts:38-48` pins 18 kinds of auth DDL and writes as caught and four near-misses as allowed (including `"public"."author"."x"` and the word `authentication`); `:50-61` fails a synthetic auth trigger and numbers it statement 2; `:63-73` scans the real `MIGRATIONS_DIR`, asserts no findings, and asserts the FK to `auth.users` is genuinely present, so the pass is not vacuous. `C2.log:111-132` records all four green. The CLI itself ran green in `C4.log:17`.

**C3 — met.** `boundaries.js:63-66` owns `postgres` and `drizzle-kit` to `db`; `ownerOverrides()` (`:98-110`) re-grants them to `packages/db` files only, and `restrictedImports(null)` (`:192`) bans them everywhere else with the owner named. `C3.log` is exit 0, clean. Verified independently: no `from "postgres"` or `drizzle-orm` import exists outside `packages/db`.

**C4 — met.** `C4.log` exit 0 through format, lint, types, both builds and the full chain. `package.json:13` puts `yarn check-migrations` after `check-stack`, satisfying the sixth non-negotiable; `toolkit.json:21` sets `migrationsDir`.

**C5 — met, and the reading is accurate.** I checked every row of `evidence/C5.md` against the artifacts: `migrations/0000_example_schema.sql:18` is the single `auth` reference (the FK), every other `CREATE`/`ALTER` targets an unqualified public name, RLS is enabled on both tables (`:8,17`), the eight policies read `current_setting('app.user_id'/'app.user_role')` and never `auth.uid()`, `meta/0000_snapshot.json:44` names `auth` only as `schemaTo`, and `_journal.json` holds exactly one entry whose tag matches the file. `authUsers` is imported at `src/schema/account/users.ts:10` and absent from `src/schema/index.ts`, asserted by `schema/index.test.ts:19-21`.

Non-negotiables all hold: pins exact (`packages/db/package.json:41-49`, row at `tech-stack.md:39`), `src/schema/<domain>/<table>.ts` with policies from the three factories beside the columns (`users.ts:28`, `notes.ts:27-30`), bridge in `src/rls.ts`, transaction pooler with `prepare: false` (`client.ts:31-34`) and session pooler for migrations enforced by `assertPooler` (`connection.ts:40-62`), setup SQL idempotent and applied in name order (`database.ts:39-54`, proven by the census test).

## Findings

**Should-fix**

1. `as-built.md:5` and `:24` state C1 was not captured ("Not captured yet", "the integration run is written but not captured"). `results.json:5-15` records C1 PASS at head `534a7d1` with `evidence/test-db.txt`. The as-built is not yet merged, so it is still editable, and right now the human-readable record says the privacy proof never ran while the authoritative record says it did. Correct the as-built before merge.
2. `.env.example` is a planned path and was not written. `turbo.json:15-20` and `toolkit.json:207` carry the six `DATABASE_*` names; `C4.log:487` is machine proof that `.env.example` carries none of them. The disclosure at `as-built.md:18` is the right call given the `.env*` read denial, but `docs/runbooks/remove-supabase-database.md:36` already tells a future reader to find these variables "From `.env.example` and `turbo.json`'s `globalEnv`" — that line is false until Taylor adds them.
3. Proof freshness is unconfirmed. C2, C3 and C4 were recorded at `40cac46e` (`results.json:24,36,48`); C1 was recorded later at `534a7d1` (`:12`), and two commits land after `40cac46e`. If that later work touched any `packages/db/**` path, those three PASSes are stale — `C4.log:20-21` shows this exact mechanism firing earlier on `packages/db/scripts/local.ts`. I have Read/Grep/Glob only and cannot run `yarn status STK-9`; confirm freshness (and `check-specs --strict`) before merge rather than taking my PASS as covering it.
4. `packages/db/scripts/env.ts:7` says "drizzle.config.ts, the db:\* scripts and the integration tests import it". `drizzle.config.ts:10` imports only `drizzle-kit` — it has no `dbCredentials` and reads no environment. Stale comment on the environment seam, which is the one file where a wrong comment matters most.

**Consider**

5. `scripts/check-migrations.ts:36-44` — the CLI's failure path is never exercised end to end; only `scanMigrationsDir` is (`auth-ddl.test.ts:50-61`). Dropping `process.exitCode = 1` would leave `yarn test` and `yarn verify` green while the gate stopped gating.
6. `src/rls.ts:20-23` with `src/policies.ts:23` — `app.user_role` is trusted whole, and `admin` opens cross-user read on `users` (`0000_example_schema.sql:21`). `assertRlsContext` can only check the role is in the enum; nothing inside `@pem/db` can constrain who asserts `admin`. STK-12's contract should require the role be derived server-side from the session and never from client input.
7. `packages/db/package.json:19-26` — `./policies` and `./connection` are exported with no planned consumer outside the package, which widens the public API shape ahead of need (D-STK-2's rule 9). Narrow or justify when the first consumer lands.
8. `src/client.ts:38-50` — "the singleton db is used only by the API context and seeds" currently has no mechanism, only a doc comment. Vacuously true today (no app imports `@pem/db`; `apps/web/next.config.ts:19` correctly omits it). The first consumer ticket should carry the lint or the service seam that makes it enforced rather than remembered.

VERDICT: PASS
