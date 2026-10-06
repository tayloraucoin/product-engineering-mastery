# Review — warden on LAB-2

> Written by `yarn review:run warden LAB-2`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 2cf746037a766c9ff5d8edb22f9a96cff7720f20ef56b84089440be283822574
- as_built_sha256: 7e82bff2de387a35d5d60901544b4e7ecf79e82550c4f86c5adce263ea587642
- head: d1a5a03f3b9f1e5892e6b635215e958f9549c39c
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T18:57:08Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden LAB-2`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket LAB-2 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

I have what I need. Both admin-only checks verified unchanged at source, the SQL verified independently, and the downstream escalation path checked against LAB-9's contract.

---

# Review — LAB-2 developer-role (warden, fresh context)

**Verdict: PASS**, with two should-fixes carried forward. No blocking finding. The ticket adds an insider role and proves, on real Postgres and through the real auth resolver, that the role buys nothing outside the sandbox: both admin-only checks are byte-for-byte unchanged and each is shown refusing a developer.

## Criterion by criterion

**C1 — met.** `APP_ROLES = ["user", "developer", "admin"]` (`packages/db/src/rls.ts:15`), in the order the contract's gotcha requires. `roleOf` (`packages/auth/src/context.ts:65-70`) is a membership test against that constant, unchanged, so the widening is the whole change. The test (`packages/auth/src/context.test.ts:78-98`) covers `developer`, `admin`, `user`, `{}`, `undefined`, and the unknowns `owner`, `Developer`, `DEVELOPER`, `" developer"`, `1`, `null` — the case and whitespace variants are the ones that matter for a whitelist, and they are there. The adjacent pre-existing case (`:65-76`) is the one I care about most: `user_metadata` is never read, so a user cannot mint themselves a `developer`. C1.log line 100, exit 0, 36/36.

**C2 — met, and tested the right way round.** `adminProcedure` is still `ctx.user.role !== "admin"` (`packages/api/src/trpc.ts:60`). `packages/api/src/context.test.ts:138-148` builds the developer through the real `createAuthContextResolver` (`test-helpers.ts:57-65`), so the role passes through `roleOf` rather than being injected, then asserts both halves: `whoami` returns `developer` **and** `everyone()` throws FORBIDDEN. Proving the role arrived before proving it was refused is what makes this a real test rather than one that would pass if the role were silently lost upstream. The admin half is carried by `:124-136` in the same run. C2.log lines 45 and 51.

**C3 — met.** `assertRlsContext` (`packages/db/src/rls.ts:38-48`) accepts `developer` and still throws on `owner`, `Developer`, `service_role`, `""` (`rls.test.ts:15-26`). Secondary, and worth stating: even an accepted role string cannot change what the connection may do — the role goes to `set_config` as a bound parameter (`rls.ts:58`) and the Postgres role is the `BRIDGE_PG_ROLE` constant (`rls.ts:33,61`), never input. C3.log line 371.

**C4 — met, on the local database.** `users` is an `ownerRowPolicies` table, and that factory's only role read is `appUserIsAdmin`, an exact `= 'admin'` match (`packages/db/src/policies.ts:23`, unchanged). `packages/db/test/rls.test.ts:200-218` shows a bridged developer seeing only their own row while an admin sees both; `:220-241` adds the owner-private probe, cleaned up in a `finally`. C4.log lines 131 and 137, 32/32, local tier.

I checked the database side independently rather than taking the factory's word: the only read of `app.user_role` in any migration or setup SQL is that one exact match (`packages/db/migrations/0000_example_schema.sql:21`), and no policy keys a write on role at all. So a developer is structurally a `user` in Postgres — not by a test's grace but because no SQL distinguishes them. No role enum or CHECK constraint exists either, which is the non-negotiable and is what lets removal rely on the `roleOf` fallback.

**C5 — met.** `teamMemberOf` (`apps/web/lib/sandbox/team-check.ts:32-36`) returns the triple for `developer` and `admin`, null for a user, no session, a null email and an empty email. The guard is a runtime `TEAM_ROLES.includes` (`:19-26`) that narrows the type rather than asserting it, so an unexpected string is refused at runtime and not only by the compiler — correct posture for a check that will gate `/admin`. All four null cases return the same bare `null`, so the check leaks no existence signal about who is on the team. `getTeamMemberWith` holds no state (`:39-43`) and `team.test.ts:41-56` proves the demotion: the same person is a member on call one and null on call two.

R11 holds, and more strongly than the as-built claims. `team.ts:9` is `import "server-only"` over a static import of `getAuthContext`, React's per-request `cache` (`apps/web/lib/supabase/context.ts:29`). The deeper proof is C1's forged-cookie pair (`auth/context.test.ts:110-155`): the cookie claims `admin`, Supabase's answer has no role, and the seam says `user`. The role comes from the Auth server's current record, not from token claims, so a demoted developer cannot ride out a stale session. That is the revocation test, and it passes. C5.log lines 574-599.

## Non-negotiables and the escalation path

All seven hold. The two-file split is a declared deviation with the billing `handle.ts`/`ledger.ts` precedent, recorded in as-built, with `team-check.ts` added to `planned_paths` and `placement.md:32` updated to name `team.ts`. `TEAM_ROLES` is bound to `APP_ROLES` by `satisfies readonly TeamRole[]` (`team-check.ts:22`), and the binding is fail-closed in the direction that matters: a role added to `APP_ROLES` is not a team member until someone says so.

The insider question this ticket raises is whether a developer can promote themselves. Today they reach nothing — `apps/web/app/admin/` does not exist, so the grant is latent. Downstream it is closed by contract, not by hope: LAB-9's non-negotiables put `requireTeamAction({ adminOnly: true })` first in `changeRole`, refuse a developer inside `withRoleChangeLock`, and its C3 is "a developer, a user and a code holder calling `changeRole` are refused with nothing written." I checked that rather than assume it. No finding; the route exists and is tested where it belongs.

## Findings

**Should-fix — `docs/runbooks/remove/supabase-database.md:45` would demote every developer.** The runbook still tells the operator to inline `export const APP_ROLES = ["user", "admin"] as const;` when `@pem/db` goes. Follow it and `roleOf` falls every developer back to `user`. This is the second definition of the role list the non-negotiable forbids, and widening the constant is what made it wrong. It fails closed — lost access, not gained — and `db:grant-admin` recovers an admin, which is why it is not Blocking. Fix is one line: `["user", "developer", "admin"]`. Mason filed this at `d1a5a03`; it is still open, with no as-built entry.

**Should-fix — `packages/api/src/test-helpers.ts:27`: a role list that cannot name a developer.** `supabaseUser(role: "user" | "admin" = "user")` is why the C2 test must spread-override the fake (`context.test.ts:143`). My concern is narrower than the duplication: the spread keeps the role flowing through `roleOf` today, but the next author who cannot mint a developer from the helper is likelier to set a role straight into `sources({ user })` and skip the resolver — at which point an admin-tier test proves nothing about how roles are actually derived. Widen the parameter to `AuthContext["role"]` so the helper tracks `APP_ROLES`. Also mason's, also open.

**Consider — `apps/web/lib/sandbox/team-check.ts:1-12` is importable from a client component.** Omitting `server-only` is deliberate and causes no leak: the only import is `import type { AuthContext }`, erased at compile, and the file holds no secret, so `yarn check-client-bundle` has nothing to catch. The boundaries graph lets all of `app-web` import `web-sandbox` (`packages/config/eslint/boundaries.js:321-324`), so nothing stops a future client leaf importing `teamMemberOf` and gating UI on a client-supplied context — a team check in view logic. When LAB-5 or LAB-8 lands the first consumer, keep the gate on `team.ts` and consider a restricted-import rule holding `team-check.ts` to `lib/sandbox/**` and its test.

**Consider — `packages/db/test/rls.test.ts:235,239` use `note!`** where the neighbouring case establishes the row with `assert.ok(note)` (`:147`). A named failure beats a `TypeError` when the insert is the thing that broke. Mason's finding; I agree, hygiene only.

## Ledger note

Evidence for C1–C5 is all at head `9fae3c8`, the commit holding this code; the later working-tree changes are LAB-3's, which no LAB-2 criterion exercises. The existing `review:warden` row in `results.json` is at head `366e8e6` with a `contract_sha256` and `as_built_sha256` that no longer match the tree — it predates the two-file split and reviewed seven files, not eight. This run supersedes it.

VERDICT: PASS
