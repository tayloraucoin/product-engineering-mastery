# Review — mason on LAB-2

> Written by `yarn review:run mason LAB-2`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 2cf746037a766c9ff5d8edb22f9a96cff7720f20ef56b84089440be283822574
- as_built_sha256: 7e82bff2de387a35d5d60901544b4e7ecf79e82550c4f86c5adce263ea587642
- head: d1a5a03f3b9f1e5892e6b635215e958f9549c39c
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T18:53:10Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason LAB-2`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket LAB-2 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/evidence/C1.log (sha256 a45bf9f622de)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/evidence/C2.log (sha256 d34bc55b9473)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/evidence/C3.log (sha256 7abf6961fa87)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/evidence/C4.log (sha256 5ce8d146b158)
   - C5 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/evidence/C5.log (sha256 8f857f35c54a)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): apps/web/lib/sandbox/team-check.ts, apps/web/lib/sandbox/team.test.ts, apps/web/lib/sandbox/team.ts, packages/api/src/context.test.ts, packages/auth/src/context.test.ts, packages/db/src/rls.test.ts, packages/db/src/rls.ts, packages/db/test/rls.test.ts.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/technical/placement.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

# Review — LAB-2 developer-role (mason, fresh context)

**Verdict: PASS**, with two should-fixes. No blocking finding: the role constant is the only definition the runtime reads, both admin-only checks are untouched and proven to refuse a developer, and the team check denies by default at both the type and the runtime layer.

## Criterion by criterion

**C1 — met.** `APP_ROLES = ["user", "developer", "admin"]` (`packages/db/src/rls.ts:15`), in the order the contract's gotcha requires. `roleOf` (`packages/auth/src/context.ts:65-70`) is a membership test against that constant, unchanged, so the widening is the whole change. The test (`packages/auth/src/context.test.ts:78-98`) covers `developer`, `admin`, `user`, `{}`, `undefined`, and the unknowns `owner`, `Developer`, `DEVELOPER`, `" developer"`, `1`, `null` — case and whitespace variants matter here, and they are there. C1.log line 100, exit 0.

**C2 — met.** `adminProcedure` is still `ctx.user.role !== "admin"` (`packages/api/src/trpc.ts:60`), byte-for-byte the pre-LAB check. `packages/api/src/context.test.ts:138-148` proves the developer's role arrives as `developer` through `whoami` *and* that `everyone()` throws FORBIDDEN — proving the role reached the tier rather than being lost upstream is the right shape for this test. The admin half of the statement is carried by the pre-existing case at `:124-136`, in the same run. C2.log lines 51 and 45.

**C3 — met.** `assertRlsContext` validates by `APP_ROLES` membership (`packages/db/src/rls.ts:42-46`). `packages/db/src/rls.test.ts:15-26` accepts `developer` and still throws on `owner`, `Developer`, `service_role`, `""`. C3.log line 371.

**C4 — met.** `users` is the `ownerRowPolicies` table (`packages/db/src/schema/account/users.ts:28`), and that factory's only role read is `appUserIsAdmin`, an exact `= 'admin'` match (`packages/db/src/policies.ts:23`, unchanged). `packages/db/test/rls.test.ts:200-218` shows a bridged developer seeing only their own row while an admin sees both; `:220-241` adds the owner-private probe — a developer does not open another user's `notes` row, cleaned up in a `finally`. That second test is the one I would have asked for: it closes the case that `developer` leaks through an owner-private table as well as an owner-row one. C4.log lines 131 and 137. Ran on the local tier, as the criterion scopes it.

**C5 — met.** `teamMemberOf` (`apps/web/lib/sandbox/team-check.ts:32-36`) returns the triple for `developer` and `admin` and null for everything else, including a missing or empty email. The runtime guard is membership in `TEAM_ROLES` (`:19-26`), so an unexpected string is refused at runtime, not only at the type level — correct posture. `getTeamMemberWith` holds no state (`:39-43`), and the test at `apps/web/lib/sandbox/team.test.ts:41-56` proves the demotion case: the same person is a member on call one and null on call two. C5.log lines 574-599.

**Non-negotiables.** `TeamRole = Extract<AuthContext["role"], "developer" | "admin">` with `TEAM_ROLES … satisfies readonly TeamRole[]` (`team-check.ts:15-22`) does what the as-built claims: drop `developer` from `APP_ROLES` and `"developer"` is no longer assignable, so this file fails to compile. No policy twin was added, and `policies.ts:23` is unchanged. `team.ts:9` is `import "server-only"` with a static import of `getAuthContext` — React's per-request `cache` (`apps/web/lib/supabase/context.ts:29`), nothing cached beyond it, which is the R11 claim and it holds. Splitting the rule from the request binding is a deviation from the one-file non-negotiable, but it is the billing `handle.ts`/`ledger.ts` precedent, it is recorded in as-built, `team-check.ts` was added to `planned_paths`, and `placement.md:32` now names `team.ts` and `getTeamMember()`. Accepted.

**As-built accuracy note.** Its grep claim ("only `trpc.ts:60` and two unrelated chat-message checks in `packages/ai`") was true of LAB-2's committed scope; the working tree now also has `packages/db/src/sandbox/viewer.ts:52,60`, which is LAB-3's untracked in-flight file. Not LAB-2's to touch or re-prove. Evidence heads are all `9fae3c8`, the commit holding this code; the only later working-tree change is LAB-3's `packages/db/package.json`, which no LAB-2 criterion exercises.

## Findings

**Should-fix — a second role list that cannot name `developer`.** `packages/api/src/test-helpers.ts:27`: `supabaseUser(role: "user" | "admin" = "user")`. This is why the C2 test has to spread-override the fake (`packages/api/src/context.test.ts:143`) instead of writing `supabaseUser("developer")`. The non-negotiable is "no other file defines a role list", and this one is now silently incomplete — the next agent reaching for the helper will conclude a developer cannot be minted. Fix: add `type AuthContext` to the existing `@pem/auth/context` import at `test-helpers.ts:9-13` and make the parameter `role: AuthContext["role"] = "user"`; then `context.test.ts:139-145` becomes `supabaseUser("developer")`. No new dependency, and the helper then widens with `APP_ROLES` forever.

**Should-fix — the removal runbook would demote every developer.** `docs/runbooks/remove/supabase-database.md:45` still instructs the operator to inline `export const APP_ROLES = ["user", "admin"] as const;` when `@pem/db` goes. Follow that today and `roleOf` falls every developer back to `user` — the exact data-shaped failure D-LAB-35 was written to avoid, arriving through a procedure rather than a diff. LAB-24 covers the *sandbox's* removal runbook, not this one, so it belongs to the change that widened the constant. One-line fix: `["user", "developer", "admin"]`, with the existing note that `developer` leaves only when no feature reads it.

**Consider — non-null assertion where the neighbour asserts.** `packages/db/test/rls.test.ts:235,239` use `note!`; the test directly above it establishes the row with `assert.ok(note)` (`:149`). Matching that gives a named failure instead of a `TypeError` when the insert is the thing that broke.

VERDICT: PASS
