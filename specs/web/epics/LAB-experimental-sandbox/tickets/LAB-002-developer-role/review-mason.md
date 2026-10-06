# Review — mason on LAB-2

> Written by `yarn review:run mason LAB-2`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 17a4b8ed2ac2c283eb1b06770dd0b2e82baa9e654e09d2177b5bdd88bc070303
- as_built_sha256: 7c9de44c7b7b862b9b9c8d754633891c3eac3a1ab56bb17a0725c73fbe8c80bb
- head: cbe33b58a2e5290342efccbf8dff03f4045e72a8
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T19:25:59Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason LAB-2`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket LAB-2 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/evidence/C1.log (sha256 75025922fa42)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/evidence/C2.log (sha256 f714e7404ef3)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/evidence/C3.log (sha256 4aca35a2ecb1)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/evidence/C4.log (sha256 ea067a69f30e)
   - C5 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/evidence/C5.log (sha256 c065ccf80c29)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): apps/web/lib/sandbox/team-check.ts, apps/web/lib/sandbox/team.test.ts, apps/web/lib/sandbox/team.ts, docs/runbooks/remove/supabase-database.md, packages/api/src/context.test.ts, packages/api/src/test-helpers.ts, packages/auth/src/context.test.ts, packages/db/src/rls.test.ts, packages/db/src/rls.ts, packages/db/test/rls.test.ts.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/technical/placement.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Criteria

**C1 — met.** `APP_ROLES` is `["user", "developer", "admin"]` (`packages/db/src/rls.ts:15`) and `roleOf` reads it rather than a literal (`packages/auth/src/context.ts:65-70`), so the new value is accepted with no code change, as the contract's approach claimed. `packages/auth/src/context.test.ts:78-98` covers `developer`, `admin`, `user`, `{}`, `undefined`, and six near-misses (`owner`, `Developer`, `DEVELOPER`, `" developer"`, `1`, `null`) — the case and whitespace variants are the ones that matter, since `includes` is exact. `evidence/C1.log:100` `ok 16`, exit 0, 36/36.

**C2 — met.** `adminProcedure` is untouched at `packages/api/src/trpc.ts:60` (`ctx.user.role !== "admin"`). `packages/api/src/context.test.ts:138-145` proves both halves: `whoami` shows the role arriving as `developer` (so the fake is genuinely a developer, not a silently-coerced user), then `everyone()` throws `FORBIDDEN`. The pre-existing case at `:124-136` still shows an admin served. `supabaseUser` now types its parameter as `AuthContext["role"]` (`packages/api/src/test-helpers.ts:28`), so the fake follows `APP_ROLES` instead of drifting from it. `evidence/C2.log:51`, exit 0, 14/14.

**C3 — met.** `packages/db/src/rls.test.ts:15-26` accepts `developer` and rejects `owner`, `Developer`, `service_role` and `""` against `/role must be one of/` (`rls.ts:42-46`). `evidence/C3.log:371`, exit 0, 65/65.

**C4 — met.** `packages/db/test/rls.test.ts:200-218` runs through `createRlsClient` on the local database: a developer sees only their own `users` row, an admin sees both. That is the right table for the criterion — `users` is `ownerRowPolicies` (`packages/db/src/schema/account/users.ts:28`), and the policy's admin clause is the exact `= 'admin'` (`packages/db/src/policies.ts:23`, emitted as such in `packages/db/migrations/0000_example_schema.sql:21`), which is the mechanical reason a developer gets no widening. The second test (`:220-242`) adds the owner-private probe, asserts the insert before relying on it (`:230`) and cleans up in a `finally`. The suite's `before` hook refuses a non-local tier (`:34-40`) and throws rather than skips when the database is unreachable (`:46-52`), so this proof cannot pass by being skipped. `evidence/C4.log:131,137`, exit 0, 60/60.

**C5 — met.** `teamMemberOf` (`apps/web/lib/sandbox/team-check.ts:32-36`) returns the triple for a team role with an email and null otherwise. `apps/web/lib/sandbox/team.test.ts` covers developer and admin, `user`, a null context, a null email, an empty email, and a role string outside `AppRole`; `:41-56` proves `getTeamMemberWith` re-reads on each call and asserts `calls === 2`, which is what makes the no-caching claim a test rather than an assertion. R11 holds at the binding: `getTeamMember` (`team.ts:17-19`) is a plain call into `getAuthContext`, which is React `cache` per request (`apps/web/lib/supabase/context.ts:29`), with no module-level memo above it. `evidence/C5.log:574-603`, exit 0, 75/75.

## Non-negotiables

All six hold. `APP_ROLES` is defined in one file, in the required order; a grep for role lists and for `role ===`/`role !==` across `apps/` and `packages/` finds no second application-role list. `TEAM_ROLES` (`team-check.ts:19-22`) is not one: `satisfies readonly TeamRole[]` over `Extract<AuthContext["role"], "developer" | "admin">` (`:15`) breaks the build if a role leaves `APP_ROLES`, and it is fail-closed the other way too — a role *added* to `APP_ROLES` is not a team member until someone writes it here. That is the right direction for the one-way door this ticket opens. `appUserIsAdmin` and `adminProcedure` are unchanged and exact; no developer-or-admin twin exists in any migration; no database constraint on role values was added (there is no role column to constrain — the value lives in `app_metadata`, so removal does fall back through `roleOf`).

The two-file split is a declared deviation (`as-built.md:13-17`) with `team-check.ts` added to `planned_paths` and `placement.md:32` corrected to name `team.ts`. The split is right, not merely excused: `server-only` in `apps/web/lib/supabase/context.ts:11` would otherwise put the rule out of reach of `node --test`, and the fix follows the billing precedent (`handle.ts`/`ledger.ts`) rather than inventing a pattern. The mixed import extensions in `team.ts:11-12` match that precedent exactly (`ledger.ts:19-20`). `team-check.ts` carries no `server-only`, which is correct — it is pure and needs an `AuthContext` to say anything, and a client has none.

The runbook fix is the substantive one in this round: `docs/runbooks/remove/supabase-database.md:45` now carries all three roles with the reason stated, where before, followed literally, it would have demoted every developer on removal.

## Findings

**Should-fix — `results.json:85-98`:** `review:warden` is recorded at head `d1a5a03` against `contract_sha256: 2cf7460…` and `as_built_sha256: 7e82bff…`. Both have since changed — the as-built itself documents fixes made *after* that review (`as-built.md:18-22`, commit `1f28e40`). Under the Q3 rule that `results.json` is the ledger, that PASS is stale and warden needs a re-run before a merge; `yarn check-specs --strict` should catch it. No code defect behind it — I checked warden's focus myself and both the policy admin clause and the tRPC admin tier still refuse a developer.

**Consider — `packages/db/src/sandbox/viewer.ts:32`:** `TeamViewer.role` is a hand-written `"developer" | "admin"` with no compile tie to `APP_ROLES`, unlike `team-check.ts:15`. Two definitions of the same set, one of which cannot fail loudly. No authorization gap: `requireTeam` (`:49-59`) and `requireAdmin` (`:61-65`) only narrow. This is LAB-3's file, not LAB-2's to change — a line for LAB-3 or LAB-14.

**Consider — `docs/runbooks/remove/supabase-database.md:45`:** the three-role literal is correct today and nothing checks it against `rls.ts:15`. The parenthetical ("keep every role the application still grants") is the real guard, and it is the right guard, but a fourth role would reintroduce exactly the bug this edit fixed. A one-line test asserting the runbook's list matches `APP_ROLES` would make it mechanical instead of remembered.

**Consider — `as-built.md:25`:** the grep claim ("finds only `trpc.ts:60` and two unrelated chat-message role checks") no longer holds at this head — `packages/db/src/sandbox/viewer.ts:52` and `:63` also match, because LAB-3 landed after the claim was written. The substance is still true: nothing grants a non-admin admin power. Only the enumeration is stale.

VERDICT: PASS
