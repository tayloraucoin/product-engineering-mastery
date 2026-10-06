# Review — warden on LAB-2

> Written by `yarn review:run warden LAB-2`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 9fdec9ae509103537b19b5ae088e36ffa47182cdd255ce60ea6de2f7e4e35c31
- as_built_sha256: 32720d96f6521339624d1f4b4bc1beca540638b29e7c2a65ba39f649a086e3c7
- head: 366e8e62bd01662cee15699335e5e839bb3f10f8
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T18:46:03Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden LAB-2`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket LAB-2 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

Read in order: contract, results, as-built, all five evidence logs, the seven changed files, and placement.md. Checked the as-built's claims against the code rather than taking them.

## Criteria

**C1 — met.** `roleOf` (`packages/auth/src/context.ts:65-70`) membership-tests `APP_ROLES`, so the constant change at `packages/db/src/rls.ts:15` carries it. The new case (`packages/auth/src/context.test.ts:78-98`) covers `developer`, `admin`, `user`, `{}`, `undefined`, and the near-misses `owner`, `Developer`, `DEVELOPER`, `" developer"`, `1`, `null`. The case and whitespace cases are the ones that matter to me: `app_metadata` is service-written, so a grant script that writes `"Developer"` fails closed to `user` rather than half-granting. `C1.log` ok 16, exit 0, 0 failures, 0 skips.

**C2 — met.** `packages/api/src/trpc.ts:60` is still `ctx.user.role !== "admin"`, unchanged. The new case (`packages/api/src/context.test.ts:138-148`) first shows the role arriving as `developer` through `whoami` — so the context genuinely carried `developer` and wasn't silently downgraded to `user`, which is what would make a FORBIDDEN assertion vacuous — then asserts FORBIDDEN. The "admits an admin" half of the statement rests on the pre-existing case at `:124-136`, which ran in the same log (ok 7); the as-built says so plainly rather than claiming new coverage.

**C3 — met.** `assertRlsContext` (`packages/db/src/rls.ts:38-48`) membership-tests `APP_ROLES`; `packages/db/src/rls.test.ts:15-26` accepts `developer` and refuses `owner`, `Developer`, `service_role`, `""`. `service_role` is the case worth having: even so, the bridge passes the role as a bound parameter and the Postgres role is the hard-coded `BRIDGE_PG_ROLE` constant (`rls.ts:58-61`), so an accepted role string could not switch the connection's privileges regardless.

**C4 — met, and it is the criterion that actually proves containment.** On real Postgres (`packages/db/test/rls.test.ts:200-229`): a `developer` under `ownerRowPolicies` reads only their own `users` row, an `admin` reads both, and a `developer` reads none of another user's `notes` under `ownerPrivatePolicies`. That holds because `appUserIsAdmin` (`packages/db/src/policies.ts:23`) is an exact `= 'admin'`, as shipped in `packages/db/migrations/0000_example_schema.sql:21`. I grepped every reader of `app.user_role` across the repo: `policies.ts:23` and the bridge's own setter are the only ones. So `developer` carries exactly no database privilege.

**C5 — met as stated.** `teamMemberOf` is proven for developer, admin, user, null context, null and empty email, and an unexpected role string (`apps/web/lib/sandbox/team.test.ts`). The runtime `TEAM_ROLES.includes` check precedes the `as TeamRole` cast, so the cast is narrowed, not asserted. `getTeamMember` itself is exercised by nothing — see finding 1.

**Non-negotiables.** All six hold: order `user, developer, admin`; both admin checks exact and untouched; no policy twin (`ownerRowPolicies` reads only `appUserIsAdmin`); `roleOf` falls back to `user`; no role constraint in any migration — the sole role literal in SQL is the admin match above; `team.ts` reads `getAuthContext()` per call with no module-scope memo, so R11 holds. Every evidence log carries head `4c7c7a4`, this ticket's own commit, with `tests:` headers reconciling to `pass + suites` in each TAP summary.

## Findings

**Should-fix — `apps/web/lib/sandbox/team.ts:41`: the server-only seam is reached by a call-time dynamic import.** Path: a future client leaf imports `getTeamMember`; because `team.ts` declares no `server-only` itself and the seam is pulled in lazily, whether the build refuses that depends on the bundler following a deferred chunk into the client layer, not on a declared boundary. The house pattern for exactly this problem already exists — pure core with injected dependencies (`apps/web/lib/billing/webhook/handle.ts`) plus a separate binding file that declares the seam (`ledger.ts:8`, `handlers/index.ts:15`). Impact is bounded, which is why this is not Blocking: `team.ts` holds no secret, and `supabase/context.ts:11`, `supabase/server.ts:8` and `supabase/local-mirror.ts:12` each declare `server-only`, so three guards would have to fail for anything to reach a browser. Fix: inject `getAuthContext` and move `getTeamMember` into a file with `import "server-only"` on line 1. Related: `getTeamMember` has no test and no caller, so the single line binding the team check to the request has never executed — type-checking covers the specifier, nothing covers the wiring.

**Consider — `apps/web/lib/sandbox/team.ts:15`: `TeamRole` is not constrained to `AppRole`.** The removal runbook contemplates dropping `developer` from `APP_ROLES` (`placement.md:56`). If that happens, `team.ts` still compiles and still lists `developer`, because the `as TeamRole` cast at `:34` stays legal while `admin` overlaps. The effect is fail-closed — no holder matches — so there is no escalation, only a silent dead branch. `type TeamRole = Extract<AppRole, "developer" | "admin">` turns that removal into a type error.

**Consider — `apps/web/lib/sandbox/team.ts:30`: the no-email null is right but unsignalled.** Returning null for a member with no email is correctly fail-closed. It is also indistinguishable from "not a team member", and LAB-8's gate is a 404 by design, so a legitimate admin on an email-less account loses `/admin` with no way to self-diagnose. Not this ticket's to fix; route to LAB-9, where the role grant should refuse an account with no email so the state cannot arise.

**Consider — `packages/db/test/rls.test.ts:220-228`: the `notes` probe row is inserted outside the bridge and cleaned up at the end of the test body.** An assertion failure between the two leaves the row in the shared local database for the rest of the run. The adjacent pre-existing case (`:143`) inserts through the bridge instead. Test hygiene, no security effect.

No Blocking findings. The focus item I was given — policies and the tRPC admin tier still refuse a developer — is proven in both places, in code and on real Postgres.

VERDICT: PASS
