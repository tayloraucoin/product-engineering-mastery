# Review — mason on LAB-2

> Written by `yarn review:run mason LAB-2`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 9fdec9ae509103537b19b5ae088e36ffa47182cdd255ce60ea6de2f7e4e35c31
- as_built_sha256: 32720d96f6521339624d1f4b4bc1beca540638b29e7c2a65ba39f649a086e3c7
- head: 366e8e62bd01662cee15699335e5e839bb3f10f8
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T18:46:03Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason LAB-2`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket LAB-2 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/evidence/C1.log (sha256 cca58e371044)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/evidence/C2.log (sha256 344970fb4192)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/evidence/C3.log (sha256 7000b844dada)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/evidence/C4.log (sha256 ddb987f631f1)
   - C5 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/evidence/C5.log (sha256 1daf118916c7)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): apps/web/lib/sandbox/team.test.ts, apps/web/lib/sandbox/team.ts, packages/api/src/context.test.ts, packages/auth/src/context.test.ts, packages/db/src/rls.test.ts, packages/db/src/rls.ts, packages/db/test/rls.test.ts.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/technical/placement.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## LAB-2 review — mason, fresh context

Read: contract, `results.json`, as-built, the five evidence logs, the seven changed files, and the cited surface (`technical/placement.md`). All five test logs are `exit: 0` at head `4c7c7a4`, each naming its criterion's test.

### Criteria

**C1 — met.** `APP_ROLES` is `["user", "developer", "admin"]` in that order (`packages/db/src/rls.ts:15`), and `roleOf` reads it rather than a literal list (`packages/auth/src/context.ts:65-70`), so no second definition exists. The named test (`packages/auth/src/context.test.ts:78-98`) covers developer, admin, explicit user, `{}`, `undefined`, and the near-misses `owner`, `Developer`, `DEVELOPER`, `" developer"`, `1`, `null` — all falling back to `user`. C1.log line 100 shows it passing, and the pre-existing case at line 94 still proves `user_metadata` is never read for the role.

**C2 — met.** `adminProcedure` is untouched and still `ctx.user.role !== "admin"` (`packages/api/src/trpc.ts:60`). The test (`packages/api/src/context.test.ts:138-148`) does the thing that matters: it first asserts `whoami` reports `developer`, so the role genuinely arrived as developer rather than degrading to `user`, then asserts `FORBIDDEN`. C2.log line 51. The "admits an admin" half is carried by the adjacent pre-existing case (C2.log line 45), in the same log — acceptable, and the as-built says so.

**C3 — met.** `assertRlsContext` validates against `APP_ROLES` by membership (`rls.ts:42-46`), so widening the constant was the whole change. The test (`packages/db/src/rls.test.ts:15-26`) accepts `developer` and still throws on `owner`, `Developer`, `service_role` and `""`. C3.log line 371.

**C4 — met, and it proves more than it had to.** `packages/db/test/rls.test.ts:200-229` runs through `createRlsClient` on the local database: a developer sees only their own `users` row, an admin sees both, and the added `notes` probe shows `developer` does not open an owner-private table either. C4.log line 131. This is the criterion that actually defends door 1, and it is the right shape — it reads the policy behaviour, not the constant. `appUserIsAdmin` is unchanged (`packages/db/src/policies.ts:23`), confirmed against the applied SQL (`packages/db/migrations/0000_example_schema.sql:21`), and no migration was added — correct, since role values carry no enum or check constraint anywhere in the snapshots.

**C5 — met for `teamMemberOf`.** `apps/web/lib/sandbox/team.ts:28-36` is pure, fails closed on a missing or empty email, and exact-matches the role. Four tests (C5.log lines 575-593) cover developer, admin, user, no session, null email, empty email, and `owner`. `getTeamMember` itself has no runtime test — the criterion names only `teamMemberOf`, and `tsc` resolves the dynamic specifier so a wrong path would fail `check-types`, so I accept it as contracted.

**Non-negotiables and out of scope.** All six non-negotiables hold. I independently reproduced the as-built's grep: `role ===`/`role !==` appears only at `trpc.ts:60`, two unrelated chat-message checks in `packages/ai/src/cases/chat.ts`, and in `tooling/` — nothing grants a non-user more than before. `packages/services/src/context.ts:15,23` only passes `AppRole` through to the bridge. No policy twin, no role constraint, nothing from LAB-5/8/9 leaked in. R11 holds as claimed: `getAuthContext` is React `cache` over `getUser()` (`apps/web/lib/supabase/context.ts:29`), and `team.ts` holds no state. `apps/web/lib/sandbox/state.ts:30-40` takes a `viewerKind` and does not duplicate the role check, so team.ts is still the one team check.

### Findings

**Should-fix — `apps/web/lib/sandbox/team.ts:39-42`: a server-bound function in a module that does not declare itself server-only.** Every other server-bound module in `apps/web/lib` opens with `import "server-only"` (`billing/stripe.ts:9`, `billing/webhook/ledger.ts:8`, `email.ts:8`, `supabase/server.ts:8`, `supabase/context.ts:11`, `supabase/admin.ts:8`, `trpc/context.ts:8`). `team.ts` has no such marker, and the one import that would supply it is deferred to call time (`:41`), so the file's server-only status now rests on the bundler tracing a lazy chunk rather than on a declaration. `yarn check-client-bundle` does not cover this: it plants env-value sentinels (`tooling/check-client-bundle.ts:16-24`), not module reachability. The builder's stated reason is factual — `../supabase/context` starts with `import "server-only"`, which throws under `node --test` — but the repo already has the answer to exactly this problem: split the pure logic from the bound seam, as `billing/webhook/handle.ts` is split from `webhook/ledger.ts`. Keep `teamMemberOf` in `team.ts` (client-safe, tested under node) and move `getTeamMember` to its own module with `import "server-only"` on line 1 and a static import. My concern is the entropy as much as the risk: this is the app's one team check, LAB-5 and LAB-8 both build on it, and "use a dynamic import to dodge `server-only` in tests" is a pattern the next ten slices will copy.

**Should-fix — `specs/web/epics/LAB-experimental-sandbox/technical/placement.md:32`: the cited surface is now stale.** It still reads "The team check is a TypeScript test of the role inside `access.ts`". The contract's non-negotiable (line 12) moved it to `apps/web/lib/sandbox/team.ts`, and that is what shipped. The contract outranks the surface, so the code is right — but LAB-5 builds `access.ts` and will read this line, so it should name `team.ts` and `getTeamMember()`. One-line fix in the epic's technical surface.

**Consider — `apps/web/lib/sandbox/team.ts:15,19-22`: `TeamRole` is not derived from `AppRole`.** `TEAM_ROLES` is typed `readonly string[]`, so `includes(context.role)` accepts any string and a rename in `rls.ts:15` would silently stop matching with no type error. The drift fails closed (a renamed role would be denied team access, never granted it), which is why this is not higher. Deriving it — `Exclude<AppRole, "user">`, or `satisfies readonly AppRole[]` on a tuple typed to keep the literals — would make a rename a compile error.

**Consider — `packages/db/test/rls.test.ts:200-229`: C4's third assertion block mixes concerns.** The `notes` probe is a second, unrelated proof (owner-private vs `ownerRowPolicies`) inside a test named for the latter, and its cleanup at `:228` is not in a `finally`. Harmless today — the suite's teardown deletes the `auth.users` rows and both foreign keys cascade — but the extra proof reads better as its own test.

Nothing blocking. The authorization topology is unchanged where it had to be, and C4 proves that at the database rather than asserting it in prose.

VERDICT: PASS
