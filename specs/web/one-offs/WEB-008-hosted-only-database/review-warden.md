# Review — warden on WEB-8

> Written by `yarn review:run warden WEB-8`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ae471718320efd61fbd8a5fa22a0fcb35ef2557c24f67e201aaf1f5ea23f8fac
- as_built_sha256: b1925d143361964107e01ab4fc006fb503389de5be7d6b72019f58d22395c0da
- head: 73b59679b6c25d72b4a5f85706b9e833af46dc37
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-05T22:39:40Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden WEB-8`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket WEB-8 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/one-offs/WEB-008-hosted-only-database/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/one-offs/WEB-008-hosted-only-database/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/one-offs/WEB-008-hosted-only-database/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/one-offs/WEB-008-hosted-only-database/evidence/C1.log (sha256 8cad7d6fdf78)
   - C2 test: specs/web/one-offs/WEB-008-hosted-only-database/evidence/C2.log (sha256 8cad7d6fdf78)
   - C3 manual: specs/web/one-offs/WEB-008-hosted-only-database/evidence/C3-verify-no-docker.md (sha256 1affe061d2db)
   - C4 manual: specs/web/one-offs/WEB-008-hosted-only-database/evidence/C4-operator.md (sha256 deb3720931b4)
   - C5 check: specs/web/one-offs/WEB-008-hosted-only-database/evidence/C5.log (sha256 f242189e68b1)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, docs/decisions/changelog.md, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, docs/engineering/tooling.md, docs/runbooks/add/docker-local-database.md, docs/runbooks/new-project/README.md, docs/runbooks/remove/supabase-database.md, packages/db/.env.example, packages/db/package.json, packages/db/scripts/env.ts, packages/db/scripts/local-full.ts, packages/db/scripts/local.ts, packages/db/scripts/migrate.ts, packages/db/scripts/reset-local-db.test.ts, packages/db/scripts/reset-local-db.ts, packages/db/scripts/seed-users.ts, packages/db/scripts/setup.ts, packages/db/scripts/supabase-cli.ts, packages/db/scripts/test-db.ts, packages/db/scripts/tier-guard.test.ts, packages/db/test/local-auth-mirror.test.ts, packages/db/test/reset-local-db.test.ts, packages/db/test/rls.test.ts, packages/db/test/stripe-event-ledger.test.ts, specs/web/one-offs/WEB-008-hosted-only-database/as-built.md, specs/web/one-offs/WEB-008-hosted-only-database/contract.md, specs/web/one-offs/WEB-008-hosted-only-database/evidence/C3-verify-no-docker.md, specs/web/one-offs/WEB-008-hosted-only-database/evidence/C4-operator.md, specs/web/one-offs/WEB-008-hosted-only-database/results.json.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Read

Contract, `results.json`, as-built, all five evidence files, then the code: `packages/db/scripts/{env,supabase-cli,test-db,local,local-full,migrate,setup,seed-users,reset-local-db,local-users}.ts`, `tier-guard.test.ts`, both `reset-local-db.test.ts`, all four `packages/db/test/*.test.ts`, `packages/db/{package.json,drizzle.config.ts,.env.example}`, root `{package.json,.env.example}`, `packages/env/src/{pick,tier}.ts`, `packages/db/src/connection.ts`, `apps/web/env.ts`, `tooling/doctor.ts`, and the six changed docs.

## Criteria

**C1 — met.** `env.ts:58-71` refuses unset or whitespace-only `DATABASE_ENVIRONMENT` naming the variable, `packages/db/.env.example` and its staging default; nothing resolves at import, every resolver calls it on demand (`env.ts:74,98,107`), and the local address is returned only inside `if (tier === "local")` (`env.ts:77`). `tier-guard.test.ts:63-83` spawns all seven scripts with an empty environment and asserts exit 1, exactly one stderr line, the three required substrings, no `54322` in either stream, and under 5 s. Eight subtests pass in `C1.log:137-187`.

**C2 — met, and proved well.** `requireLocalTier` is the first statement of `preflight` (`supabase-cli.ts:58-59`), ahead of the `docker info` probe; `reset-local-db.ts:124-127` keeps its own refusal naming Docker and the recipe; `test-db.ts:22` guards before the spawn. Hosted refusals name `DATABASE_MIGRATION_URL_STAGING` (`env.ts:78-80`) and `pickTiered` (`pick.ts:41`) reads only `_STAGING` or the unsuffixed name — never `_LOCAL`. Two assertions do real work: `PATH: ""` (`tier-guard.test.ts:31`) plus `doesNotMatch(stderr, /Docker is not running/)` (:93) proves the Docker probe was never reached, and `doesNotMatch(stdout, /TAP version|# tests/)` (:94) proves no integration file loaded. Eight subtests pass in `C1.log:192-242`.

**C3 — met.** The committed excerpt pairs Docker's "Cannot connect" line with `yarn verify` exit 0, and the full log is correctly uncommitted. It is also structurally true: `@pem/db`'s `test` script globs only `src/**` and `scripts/**/*.test.ts` (`package.json:43`), `test-db.ts` does not match `*.test.ts`, so nothing in verify can reach Docker — and `tier-guard.test.ts` does match, so the guards are CI-protected, not proved once.

**C4 — not verified, correctly deferred.** No Docker daemon on the machine; recorded `--verdict deferred` with a runnable procedure whose expected first line matches `test-db.ts:24` verbatim. Stays an operator check.

**C5 — met.** Exit 0, 15 packages.

Non-negotiables hold, including "the local machinery kept whole": all four `test/*.test.ts` files still carry `requireTier()`, the local check and `assertLoopbackClient` (`rls.test.ts:33-44`, `local-auth-mirror.test.ts:59-68`, `reset-local-db.test.ts:27-36`, `stripe-event-ledger.test.ts:39-48`) — the right layer, since `assertPooler` returns early on the local tier. Every as-built deviation checks out: `doctor.ts:24` is `[3000, 3001]`, and `packages/db/README.md` / `AGENTS.md` genuinely do not exist. C1 and C2 share one log legitimately (one command, two criteria); their run head is older than the tip, and the commits between are spec-only by their messages — `check-specs --strict` is the gate for that, not me.

## Findings

**Should-fix — `docs/runbooks/new-project/README.md:194`.** The "Not available" row names `yarn db:stop` and `yarn db:seed-users` among commands that "each refuses in its first line, naming the add recipe, until the tier is local." Neither does. `db:stop` is a bare `supabase stop` with no guard at all (`packages/db/package.json:48`); `db:seed-users` refuses on a hosted tier only through the loopback auth-URL check (`local-users.ts:36-40`), whose line names `NEXT_PUBLIC_SUPABASE_URL_STAGING` and Mode A, never the recipe. Neither command can reach a hosted database or auth project, so this is not an exposure — but step 5 says this table is read aloud to the operator (`README.md:257`), so a new project is told a guard exists where none does. `tooling.md:1051-1061` gets `db:stop` right and claims no guard; align the guide with it, or drop the two commands from the row.

**Consider — `packages/db/scripts/env.ts:3`.** The rewritten docblock still says "drizzle.config.ts, the db:\* scripts and the integration tests import it"; `drizzle.config.ts:10-20` imports only `drizzle-kit` and reads no environment. STK-9's vigil review raised the same line and it survived a rewrite of this exact comment. On the environment seam it is the one stale comment that invites someone to add a second reader.

**Consider — `packages/env/src/pick.ts:41`.** On staging an unset `_STAGING` falls back to the unsuffixed production value, so a `packages/db/.env.local` holding `DATABASE_MIGRATION_URL` would let `db:migrate` apply migrations to production while its first line reads "staging". This is the logged D-STK-3/EN-08 grammar, documented in both example files, and the production tier is out of scope here; `describeUrl` does name the host in that first line (`migrate.ts:32`) and bash-guard asks first. Recorded for the operator's eye, not for this ticket.

**Consider — `packages/db/scripts/tier-guard.test.ts:46-54`.** As-built's "Not verified" honestly names `db:seed-users` on a hosted tier as untested. `seed-users.ts` is already in `EVERY_SCRIPT`; one case asserting the loopback refusal on staging would close the last untested refusal in this package.

Nothing silently reaches a local port, and nothing on a hosted tier reads a `_LOCAL` value. The one real finding is a doc promising a guard the code does not make, in the direction that cannot harm a hosted database.

VERDICT: PASS
