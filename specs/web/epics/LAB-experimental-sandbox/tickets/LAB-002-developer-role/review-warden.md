# Review — warden on LAB-2

> Written by `yarn review:run warden LAB-2`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 17a4b8ed2ac2c283eb1b06770dd0b2e82baa9e654e09d2177b5bdd88bc070303
- as_built_sha256: 7c9de44c7b7b862b9b9c8d754633891c3eac3a1ab56bb17a0725c73fbe8c80bb
- head: 1da0d7dc0a32fd7ee48d0b14b1293d506934b238
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T19:31:11Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden LAB-2`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket LAB-2 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

I have what I need. Here is the review.

---

# Review — LAB-2 developer-role (warden)

## Criteria

**C1 — `roleOf` returns developer / admin / user.** **Met.** `packages/auth/src/context.ts:65-70` whitelists against `APP_ROLES` and falls back to `"user"`. The test (`packages/auth/src/context.test.ts:78-98`) probes the adversarial neighbours an insider would try: `"owner"`, `"Developer"`, `"DEVELOPER"`, `" developer"`, `1`, `null`, `{}`, `undefined` — all `user`. The pre-existing case at `:65-76` still proves `user_metadata` is never read, so a user cannot self-promote. C1.log line 100 passes, exit 0.

**C2 — `adminProcedure` refuses a developer, admits an admin.** **Met.** `packages/api/src/trpc.ts:60` is unchanged `ctx.user.role !== "admin"`. The refusal is `packages/api/src/context.test.ts:138-145` (C2.log line 51); the admission is the pre-existing case at `:124-136` (C2.log line 45), which still runs against the widened `supabaseUser` (`test-helpers.ts:28`). Both halves covered, across two tests.

**C3 — `assertRlsContext` accepts developer, refuses an unknown role.** **Met.** `packages/db/src/rls.ts:42-46` tests membership in `APP_ROLES`; `rls.test.ts:15-26` accepts `developer` and rejects `owner`, `Developer`, `service_role` and `""`. C3.log line 371.

**C4 — a developer reads only their own rows; an admin reads every row.** **Met, and proven live.** `packages/db/test/rls.test.ts:200-218` on the local database: as `developer` the bridge returns only Bob's row; as `admin`, both. The second case at `:220-242` confirms a developer does not open another user's owner-private `notes` row, and cleans up in a `finally`. This is the right proof shape — the policy text (`policies.ts:23`, `coalesce(current_setting('app.user_role', true), '') = 'admin'`) is an exact match, and the migration confirms it is the only policy that reads the role at all (`migrations/0000_example_schema.sql:21`). C4.log lines 131, 137.

**C5 — `teamMemberOf` for developer, admin, user, no session.** **Met.** `apps/web/lib/sandbox/team-check.ts:32-36`, tested at `team.test.ts:8-56`. The revocation case at `:41-56` is the one that matters: `getTeamMemberWith` reads the context afresh on each call, so an admin demoted between two requests is null on the second. With `getAuthContext` being React's per-request `cache` over `getUser()` (`apps/web/lib/supabase/context.ts:29`), R11 holds — a role change applies on the next request, with no cached grant to outlive it. C5.log lines 575-599.

## Non-negotiables

All six hold, checked against the code rather than the as-built:

- `APP_ROLES = ["user", "developer", "admin"]` (`packages/db/src/rls.ts:15`), and it is the only role list left in the tree — the former two-role literal in `docs/runbooks/remove/supabase-database.md:45` now carries all three with the reason, and the only surviving `["user", "admin"]` strings are the changelog narrating that fix and the pre-build `_preflight.md`.
- `appUserIsAdmin` is an exact `'admin'` match (`policies.ts:23`); `adminProcedure` is `role !== "admin"` (`trpc.ts:60`).
- No developer-or-admin policy twin: nothing under `packages/db/src` reads `developer` outside the test files.
- No database constraint on role values: no `check` on role in any migration, so an unknown value falls back to `user` through `roleOf` and removal forces no data change.
- `team.ts` is the one team check, read through `getAuthContext()` per request, cached nowhere beyond it.

The two-file split (`team-check.ts` pure, `team.ts` seam) is a declared deviation with the `handle.ts`/`ledger.ts` precedent followed exactly — `ledger.ts:8` carries `server-only`, `handle.ts` does not, matching `team.ts:9` and `team-check.ts`. `TeamRole = Extract<AuthContext["role"], "developer" | "admin">` with `TEAM_ROLES … satisfies readonly TeamRole[]` (`team-check.ts:15,19-22`) is fail-closed in both directions: dropping a role from `APP_ROLES` breaks the build here, and adding one does not silently make it a team member.

## My focus: does a developer gain anything outside the sandbox?

No. Every consumer of `APP_ROLES` was walked: `roleOf` (accepts it, intended), `assertRlsContext` (accepts it, so `app.user_role` is set to `developer`), `packages/services/src/context.ts:21-30` (passes the role straight to `createRlsClient`, no branch), and the tRPC admin tier (refuses it). At the database the role reaches exactly one policy predicate, an exact `'admin'` comparison, so a developer is a user there — asserted live, not inferred. The role string reaches SQL only as a bound parameter after the whitelist (`rls.ts:57-58`); the Postgres role is the file constant, never input (`:33,61`). Writes to `app_metadata.role` remain the service role's alone, and LAB-9 owns them.

## Findings

**Consider — `apps/web/lib/sandbox/team-check.ts:1-11`:** the authorization *rule* now lives in a file with no `server-only`, so a client component can import `teamMemberOf` directly rather than through `team.ts:14`. This is not a bypass — the file holds no secret, the `AuthContext` import is type-only and erased, and a client has no way to obtain a genuine context — but it puts the team rule within reach of view logic, which is where authorization decisions go to stop being enforced. When LAB-8 lands the gate, either add `team-check.ts` to the client-bundle check that already guards `apps/web/lib/supabase/admin.ts:5`, or have the `web-sandbox` boundaries element forbid a client file importing it. Enforcement stays server-side either way; this is about keeping the one import path the documented one.

**Consider — `specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/as-built.md:25`:** the recorded grep says `role ===`/`role !==` "finds only `trpc.ts:60` and two unrelated chat-message role checks in `packages/ai`." At the branch tip `packages/db/src/sandbox/viewer.ts:52` and `:63` also match. Both narrow rather than grant (`requireTeam` admits only developer-or-admin; `requireAdmin` admits only admin), so the substance of the claim — nothing grants more to a non-user — still holds, and the file is LAB-3's. But a security claim in an as-built gets cited later as "we checked," and this enumeration no longer matches the tree. Worth one clause noting the LAB-3 matches and why they are narrowing.

**Consider — `apps/web/lib/sandbox/team-check.ts:33`:** a team member with no email is null, which is the right fail-closed default and is proven (`team.test.ts:25-28`), but it means an admin whose email is absent sees `/admin` as a 404 with nothing to tell them why. The as-built already routes the prevention to LAB-9 (refuse granting a role to an emailless account) and the runbook's first-admin script is the recovery path, so this is recorded and owned — noted here only so the friction cost is on the record beside the control.

Mason's two Considers — `TeamViewer.role` at `viewer.ts:32` having no compile tie to `APP_ROLES`, and the runbook's three-role literal not being mechanically checked — are LAB-3's and LAB-24's respectively, already routed, and I am not refiling them.

## Evidence integrity

Each log's header records `exit: 0` at head `829bc70`, matching every run record in `results.json`, and the `evidence_sha256` values there match the five hashes supplied to this run. I cannot recompute the digests with the tools I have; what I can confirm is that every criterion's named test appears in its log, passing, with no skips, no `.only` and no `todo` in any of the five runs. The LAB-2 fixes recorded in the as-built (`supabaseUser`'s widened signature, the runbook's role list) were committed in `1f28e40`, which precedes the proof head, so the proofs cover the shipped code; the only later commits touch LAB-1's files and the decisions changelog.

No Blocking findings. The one-way door this ticket opens — a role name every holder would need a data change to rename — is opened with the policy twin deliberately withheld, no database constraint to force that data change, and a runbook line that stops the removal path from silently demoting every developer. That is the shape I want a role addition to have.

VERDICT: PASS
