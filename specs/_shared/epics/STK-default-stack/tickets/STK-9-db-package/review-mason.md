# Review — mason on STK-9

> Written by `yarn review:run mason STK-9`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 2602afb9282d250acfde0d5b3cb4778088144415470b8b3f1d1160e7837dcc61
- as_built_sha256: adc6bed7c4d5f506ca3ca10222758953db8e841191b4414e61b84f6896c368cd
- head: fa1d9389d50832e4c0ac6efa353c178cb40ec873
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T06:46:03Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason STK-9`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket STK-9 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 capture: specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/evidence/test-db.txt (sha256 bb309ddd4a15)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/evidence/C2.log (sha256 95ace23a7814)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/evidence/C3.log (sha256 c31a112b0edb)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/evidence/C4.log (sha256 80a4f5184a27)
   - C5 manual: specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/evidence/C5.md (sha256 8723c7d78d01)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/next.config.ts, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, docs/runbooks/remove-supabase-database.md, package.json, packages/config/eslint/boundaries.js, packages/db/drizzle.config.ts, packages/db/eslint.config.mjs, packages/db/migrations/0000_example_schema.sql, packages/db/migrations/meta/0000_snapshot.json, packages/db/migrations/meta/_journal.json, packages/db/package.json, packages/db/scripts/auth-ddl.test.ts, packages/db/scripts/auth-ddl.ts, packages/db/scripts/check-migrations.ts, packages/db/scripts/database.ts, packages/db/scripts/env.ts, packages/db/scripts/local-image.ts, packages/db/scripts/local.ts, packages/db/scripts/migrate.ts, packages/db/scripts/setup.ts, packages/db/src/client.ts, packages/db/src/connection.test.ts, packages/db/src/connection.ts, packages/db/src/policies.ts, packages/db/src/rls.test.ts, packages/db/src/rls.ts, packages/db/src/schema/account/users.ts, packages/db/src/schema/index.test.ts, packages/db/src/schema/index.ts, packages/db/src/schema/notes/notes.ts, packages/db/supabase/setup/01_functions.sql, packages/db/supabase/setup/02_auth_triggers.sql, packages/db/supabase/setup/03_public_tables.sql, packages/db/test/rls.test.ts, packages/db/tsconfig.json, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

Read in order: contract, results, as-built, all five evidence files, every changed file under `packages/db/**` plus the shared config and docs, and the cited surface (`technical.md`, D-STK-5/D-STK-6/D-STK-16).

## Criteria

**C1 — bridge settings and owner-private hiding, under `yarn test:db`, nothing skipped. Met.**
`evidence/test-db.txt` shows 6 tests, 6 pass, 0 skipped, 0 cancelled, against the pinned image. The named assertions are present: "sets app.user_id, app.user_role and the role for the transaction" and "hides another user's row and refuses writes to it". The code backs them — `packages/db/test/rls.test.ts:63-74` reads `current_user` back as `authenticated`, `:141-155` runs the hide-and-refuse loop including an `admin` role against an owner-private table, `:157-163` asserts `42501` on a forged owner, `:76-91` proves the pooled connection is clean afterwards (`pg_role: postgres`). The absent-image path is a throw in `before` (`:41-47`), not a skip, and `test:db` is a separate script (`packages/db/package.json:32`) that `turbo run test` never reaches, so `yarn test` excludes it as the non-negotiable requires.

**C2 — `check-migrations` fails on auth DDL, passes the generated set. Met.**
`C2.log` tests 1-4: 18 kinds of auth DDL caught, the foreign key and `auth.uid()` allowed, a synthetic auth trigger failed and numbered by statement, and the real `migrations/` set clean while still matching `REFERENCES "auth"."users"`. `scripts/auth-ddl.ts:50-57` strips the two allowed forms and then flags any remaining `auth.` name, so the allowance is a whitelist, not a hole. `yarn verify` carries it (`package.json:13`, after `check-stack`) and `C4.log:17` shows the live line.

**C3 — boundaries pass with `postgres` and `drizzle-kit` owned by db. Met.**
`C3.log` exit 0. `boundaries.js:51,58` add the `db` element and `db: ["config", "env"]`; `:63-66` set `SDK_OWNERS`; `:84-110` give the owner its override and ban the SDKs everywhere else by name. A repo-wide grep finds `postgres` and `drizzle-kit` imported only inside `packages/db` (including `drizzle.config.ts`, which the override's glob covers). Matches D-STK-16 exactly.

**C4 — types, build, full chain. Met.**
`C4.log` exit 0 end to end: format, docs lint, hooks, refs, `check-stack`, `check-migrations`, `check-specs`, test-weakening, contrast, 39 tooling tests, 27 package tests, budget, lint, check-types, `check-client-bundle` (9 server-only values, none browser-facing — exactly the three `EXAMPLE_API_KEY` plus the six `DATABASE_*` names, which is indirect proof the six landed in `.env.example`, a file I cannot read by permission rule), both builds.

**C5 — `db:generate` produces no auth objects. Met, as a reading.**
`evidence/C5.md`'s five questions check out against the artifacts: `migrations/0000_example_schema.sql:18` is the only `auth` mention and it is the foreign key; `meta/0000_snapshot.json:44` names `auth` only as `schemaTo`; `drizzle.config.ts:16-17` holds introspection to public and leaves Supabase's roles alone; `src/schema/index.ts:7-8` re-exports two tables and never `authUsers`, which `schema/index.test.ts:19-21` asserts. The journal has its one entry and the as-built keeps `applied: pending`.

Non-negotiables: exact pins (`package.json:41-42,47`) with their `tech-stack.md:39-40` rows; policies from three factories beside each table (`policies.ts`, `users.ts:28`, `notes.ts:27-30`); `prepare: false` on the transaction pooler and the session pooler for migrations (`client.ts:31-33`, `database.ts:27`, both unit-tested); setup SQL idempotent and name-ordered (`database.ts:39-43`, proven by the census test); `migrationsDir` set (`toolkit.json:21`). Nothing out of scope shipped — no mirror, no `config.toml`, no agent settings, no product schema, no image in CI.

## Findings

**Should-fix**

1. **The bridge law has no durable home.** "Every user-scoped query goes through the bridge; the singleton is a service client that bypasses every policy" lives only in `packages/db/src/client.ts:1-7`, `src/rls.ts:1-8` and the epic's `technical.md`. `docs/engineering/codebase-conventions.md` gained the `@pem/db` row (`:89`) and the SDK sentence (`:98`) but states no data-layer rule, and `new-project.md` has a ported repo clear `specs/`. Fix: one line in §4, and when `api` lands (STK-14) a `no-restricted-imports` entry pinning `@pem/db/client` to the api package and seeds — the mechanism `SDK_OWNERS` already provides. Today nothing imports `@pem/db`, so this is a rule about to be needed, not one already broken.

2. **The runtime role is unconstrained on hosted tiers.** `connection.ts:40-62` checks the port but not who connects; `client.ts:7` admits the singleton "connects as the database owner and bypasses every policy". If `DATABASE_URL` names the project owner on staging or production, RLS protects nothing that skips the bridge. A dedicated non-owner runtime role makes the policies the floor instead of a convention. The local image gives no alternative, so this is hosted-tier wiring: state it on the `DATABASE_URL` comment in `.env.example` and against D-STK-5 now, before staging exists (`as-built.md:25` already records that no hosted project has been touched).

**Consider**

3. `packages/db/package.json:19-26` — `./policies` and `./connection` are public subpaths with no consumer outside the package; schema files and scripts reach both by relative path. Package exports are a one-way door; trim them or name the intended consumer (rule 9).
4. `packages/db/test/rls.test.ts:32-51` — the only guard before migrating and writing `auth.users` is `tier !== "local"`. One assertion that the host is loopback would stop a misaimed `DATABASE_MIGRATION_URL_LOCAL` from being migrated.
5. `docs/engineering/codebase-conventions.md:120` — "each package's `scripts/env.ts` … validated with a schema" is not what shipped: `scripts/env.ts` validates by presence plus `assertPooler` at use, and `@pem/db` carries no zod. Reword, or the next package's env reader gets built to the wrong standard.
6. The db commands (`db:local`, `db:migrate`, `db:setup`, `test:db`, `check-migrations`, `package.json:45-50`) are absent from AGENTS.md's Commands table. With always-on at 3944/4000 (`C4.log:504`) that omission is defensible, so a `.claude/rules/` path rule on `packages/db/**` is the cheaper home — and the right place for finding 1's line too.
7. `apps/web/next.config.ts:27` — omitting `@pem/db` from `transpilePackages` is correct with no importer, but the first importer's build breaks on `.ts` source. Put it in STK-12/STK-14's Build notes so it is read, not rediscovered.
8. `packages/db/supabase/setup/03_public_tables.sql:20` — `relkind = 'r'` skips partitioned tables, so a partitioned table added later would miss the RLS-and-grant sweep. One character of scope.

Clean work on the part that matters most: the authorization guarantee sits in the database, the policies are deny-by-default and grant only to `authenticated`, and the proof is an integration test that fails rather than skips. The two Should-fix items are about keeping that guarantee true after this ticket, not about what it ships.

VERDICT: PASS
