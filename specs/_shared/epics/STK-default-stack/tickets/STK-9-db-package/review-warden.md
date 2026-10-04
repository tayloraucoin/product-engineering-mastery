# Review — warden on STK-9

> Written by `yarn review:run warden STK-9`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 2602afb9282d250acfde0d5b3cb4778088144415470b8b3f1d1160e7837dcc61
- as_built_sha256: e18ddc8962f9f4ff68390f8b8f21cf126c4eb28868162b0d0b37af4d91f75a0d
- head: 57a2057cc2745ed56843ec6be133a86aa328cd88
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T05:56:05Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-9`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-9 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

# Warden review — STK-9 db-package

Reviewed in fresh context from the contract, `results.json`, the as-built and the files. All five evidence hashes in my brief match the hashes recorded in `results.json`, so the evidence I read is the evidence recorded.

## Criteria

**C1 — met.** `evidence/test-db.txt` shows 3 suites, 6 tests, `# skipped 0`, `# fail 0`. Reading the capture against the source rather than the builder's summary: `packages/db/test/rls.test.ts:63-74` asserts exactly the three facts the criterion names (`app.user_id`, `app.user_role`, `current_user = authenticated`) inside the transaction, and `:76-91` asserts all three are gone on the pooled connection afterwards (`pg_role: postgres`, both settings null) — the leak that matters on a shared pool. Owner-private denial is proven twice over at `:122-170`: a peer and a peer carrying the `admin` application role both read `[]` and update `[]`, a forged-owner insert is rejected with `42501`, and the row is confirmed unchanged on the bypassing client. An absent image throws in `before` naming `yarn db:local` (`:40-47`); there is no skip path.

**C2 — met.** `scripts/auth-ddl.test.ts:38-42` catches 18 kinds of DDL and write against `auth`; `:50-61` fails a synthetic trigger on `auth.users` and pins the statement number; `:63-73` passes the generated set while asserting it still does reference `auth.users`, so the test cannot pass by the migration having lost its foreign key. `C2.log` shows 13/13 in `@pem/db`, none skipped, and `package.json:13` puts `yarn check-migrations` in `verify` with `migrationsDir` set at `toolkit.json:21`.

**C3 — met.** `packages/config/eslint/boundaries.js:63-66` pins `postgres` and `drizzle-kit` to `db`; `:192` bans them repo-wide and `:205` re-permits them inside `packages/db` only. `C3.log` exits 0.

**C4 — met.** `C4.log` exits 0 with `check-migrations` (`:17`), `check-stack` (`:16`) and `check-client-bundle` reporting 9 server-only values and none of them in 25 browser-facing files (`:488`) — the database URLs are planted from `turbo.json` even though `.env.example` lacks them, so there is no secret-leak gap behind the declared deviation.

**C5 — met**, verified independently of `C5.md`. `migrations/0000_example_schema.sql` creates and alters only unqualified public names, enables RLS on both tables (`:8`, `:17`), and names `auth` exactly once, as the foreign key at `:18`. `meta/0000_snapshot.json:44` carries `auth` only as `schemaTo`. `src/schema/index.ts` re-exports two files and no Supabase schema; `src/schema/index.test.ts:19-21` asserts `authUsers` is absent from the barrel.

The non-negotiables hold: versions pinned exact (`packages/db/package.json:41-47`, `docs/engineering/tech-stack.md:39-40`), policies beside columns from the factories (`users.ts:28`, `notes.ts:27-30`), poolers enforced by port with credentials never in a message (`connection.ts:40-62`, `connection.test.ts:35-41`), setup SQL idempotent and name-ordered with idempotency proven by census (`test/rls.test.ts:103-118`), `yarn test` excluding `test/**` (`package.json:31-32`), and `scripts/env.ts` the only `process.env` reader, enforced by lint (`eslint.config.mjs:14-22`). Deletion is real rather than asserted: `users.ts:19` and `notes.ts:18` cascade from `auth.users` down.

## Findings

### Should-fix

**1. Nothing structurally keeps a user-scoped query off the bypassing singleton.** `packages/db/src/client.ts:5` states the design plainly — the singleton connects as the database owner and bypasses every policy — and `test/rls.test.ts:165-169` demonstrates it reading another user's row. The non-negotiable that the singleton is "used only by the API context and seeds" is today a convention with no enforcement, while `packages/db/package.json:7-10` exports `@pem/db/client` to any future consumer on equal footing with `@pem/db/rls`. The adversary is not an attacker but the next ticket: one `getDb` call in a request path leaks every user's notes to any authenticated requester, and no check in the repo would notice. I am not proposing you drop the bypass seam — D-STK-5 wants it for service queries, and forcing RLS or a non-owner runtime role would break it. The proportionate control is the one the repo already has rails for: restrict the `@pem/db/client` specifier by `no-restricted-imports` to an allowlist of elements (`api`, `services`) the way `SDK_OWNERS` already restricts `postgres`, leaving `@pem/db/rls` open. Cheapest now, before the first importer; it must not be later than STK-12 or STK-14, which the as-built names as the first to add `transpilePackages`.

**2. `RlsContext.role` has no stated provenance, and `admin` unlocks cross-user reads.** `src/rls.ts:19` says only that "the auth layer builds it from the session", and `:51-52` validates membership in `APP_ROLES` and nothing more. `src/policies.ts:23` and `:66` then let that self-declared role read every user's account row, email included. Supabase's `user_metadata` is writable by the user it describes; an auth layer that reads `role` from there — the classic mistake, and the one this comment invites — hands any user admin reads. There is no `role` column in the schema to serve as a database-side source of truth. Constrain it here, where the bridge's contract is defined: state in `rls.ts` that `role` must come from a server-trusted source (a database column or `app_metadata`), never a client-influenceable claim, and carry that into the STK-12 contract.

**3. `users_insert_denied` and `users_delete_denied` promise more than they enforce.** `src/policies.ts:74-83` creates them as PERMISSIVE. Permissive policies are OR'd, so these deny only by being the sole policy for their command — they are equivalent to writing no policy at all. The moment a product adds its own permissive INSERT on `users`, the policy named `insert_denied` stops denying anything, silently. Make them `as: "restrictive"`, or rename them so the name does not carry a guarantee the semantics will not keep. This factory is the template every product copies, which is why the naming matters more here than in product code.

**4. `check-migrations` misses a `search_path` redirect.** `scripts/auth-ddl.ts:22` requires the literal keyword `schema` before `auth`, and `:37` requires a qualified `auth.<name>`. A two-statement migration — `set search_path = auth;` then `create trigger t after insert on users …` — matches neither and passes the check, having attached a trigger to `auth.users`. drizzle-kit never emits `SET search_path`, so this is not an accident path; it is the hand-written-SQL path, and the non-negotiable names this check as the control. Flag any statement that sets `search_path` inside a migration, and add the case to `auth-ddl.test.ts:10-29`.

**5. The as-built now contradicts the recorded evidence on C1.** `as-built.md:5` says "**Not captured yet:** Docker was not running in this thread", `:24` repeats it under Not verified, and `:36` assigns the capture to Taylor. All three are false as of the recording at `534a7d1`: the capture exists, passed 6 of 6, and is hashed into `results.json`. The as-built is immutable once merged, so merging it as written leaves the permanent record saying the privacy proof was never run — the one claim in this ticket I would least want a future reader to doubt. Correct those three lines before merge. The `.env.example` deviation at `:18` is declared, owner-assigned and consistent with my own denial reading that file, and `C4.log:487` shows the repo warning about it by name; that one needs no change beyond Taylor doing it.

### Consider

- `src/schema/account/users.ts:20` stores `email`, a second copy of personal data that already lives in `auth.users` and that `ownerRowPolicies` exposes to the `admin` role. `notes.ts:3-4` tells a product to replace the table; `users.ts` carries no equivalent note that the column is optional. One line inviting a product to drop it is minimization at the cheapest possible moment.
- `src/policies.ts:88` ships `serviceOnlyPolicies` with no table using it and no integration coverage. The two proven factories are proven well; this third one is an untested control that reads as tested.
- `src/rls.ts:61` sets the role with `set local role`, which is reversible inside the same transaction. Nothing user-controlled reaches raw SQL today, so there is no path; worth a line in the file's comment so a future `sql.raw` author knows the bridge is not a privilege wall.
- `docs/runbooks/remove-supabase-database.md:54` deletes tables and the `drizzle` schema but names no backup or PITR window. Harmless at `new-project.md` step 4, where no data exists; worth a sentence for the case where someone runs it against a project that has been live.
- C2 through C5 were recorded at `40cac46`, before the `C1` capture commit. The work loop's single `yarn verify` at batch close covers this; I cannot resolve freshness with Read, Grep and Glob alone, so I am noting rather than asserting it.

No finding here is Blocking. The non-negotiables are met, the privacy proof is real and ran against the image, the auth schema is untouched and checked, deletion cascades from the auth user down, no secret reaches a client bundle or a log, and the two structural gaps I care most about — the bypassing singleton and the provenance of `admin` — are reachable only through a consumer that does not exist yet, which is precisely why now is the cheap moment to close them.

VERDICT: PASS
