---
id: LAB-2
size: small
objective: "developer joins the application roles, so roleOf and the RLS bridge accept it and the app has one team check, while every existing admin check still refuses it."
slice_type: "Authorization topology (one-way door 1); the risk is a developer passing an admin-only check, or a role name that later needs a data change on every holder."
non_negotiables:
  - "APP_ROLES in packages/db/src/rls.ts becomes user, developer, admin; no other file defines a role list."
  - "appUserIsAdmin stays an exact 'admin' match, and the tRPC adminProcedure stays role === \"admin\"."
  - "No developer-or-admin policy twin in v1 (R3): no table would read it."
  - "roleOf returns developer for app_metadata.role developer, and still returns user for a missing or unknown value."
  - "No database constraint on role values: removal relies on unknown roles falling back to user."
  - "apps/web/lib/sandbox/team.ts is the one team check: developer or admin, read through getAuthContext() on each request, never cached beyond it."
devs_call: "Where the new cases sit among the existing role tests."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/technical/placement.md"
  - "D-LAB-35"
truth_files: "none: a role constant; no living UX file changes"
qa: Q3
reviewers:
  - mason
  - warden
focus:
  - "policies and the tRPC admin tier still refuse a developer (warden)"
operator_review: false
planned_paths:
  - "packages/db/src/rls.ts"
  - "packages/db/src/rls.test.ts"
  - "packages/db/test/rls.test.ts"
  - "packages/auth/src/context.test.ts"
  - "packages/api/src/context.test.ts"
  - "packages/api/src/test-helpers.ts"
  - "docs/runbooks/remove/supabase-database.md"
  - "apps/web/lib/sandbox/team.ts"
  - "apps/web/lib/sandbox/team-check.ts"
  - "apps/web/lib/sandbox/team.test.ts"
depends_on: []
out_of_scope:
  - "The People page and role writes, with the last-admin guard: LAB-9."
  - "resolveViewer, which calls getTeamMember first: LAB-5."
  - "The /admin gate and its 404: LAB-8."
  - "The first-admin script (db:grant-admin): LAB-9. Clearing the value on removal: LAB-24's runbook."
criteria:
  - id: C1
    statement: "roleOf returns developer for app_metadata.role developer, admin for admin, and user for a missing or unknown value."
    evidence: test
    command: "yarn workspace @pem/auth test"
  - id: C2
    statement: "adminProcedure refuses a developer with FORBIDDEN and admits an admin."
    evidence: test
    command: "yarn workspace @pem/api test"
  - id: C3
    statement: "assertRlsContext accepts developer and still refuses an unknown role."
    evidence: test
    command: "yarn workspace @pem/db test"
  - id: C4
    statement: "Through the bridge on the local database, a developer reads only their own rows under ownerRowPolicies, as a user does, while an admin still reads every row."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C5
    statement: "teamMemberOf returns the user id, email and role for a developer and for an admin, and null for a user and for no session."
    evidence: test
    command: "yarn workspace web test"
  - id: review:mason
    statement: Mason reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run mason <id>
  - id: review:warden
    statement: Warden reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run warden <id>
---

# Contract — LAB-2 developer-role

## Build notes

- **Approach:** one constant change in `packages/db/src/rls.ts:15`. `roleOf` (`packages/auth/src/context.ts:65-70`) and `assertRlsContext` (`rls.ts:37-48`) read `APP_ROLES`, so they accept the new value with no code change. Prove it, then prove that the two admin-only checks did not move. Then add the app's one team check: `teamMemberOf(context)` (pure) and `getTeamMember()` (`teamMemberOf(await getAuthContext())`, from `apps/web/lib/supabase/context.ts:29`). The `/admin` shell (LAB-8), `resolveViewer` (LAB-5) and every `/admin` action build their team `Viewer` from it.
- **Decisions that apply:**
  - D-LAB-35 (R3): "`developer` joins `APP_ROLES`. No policy twin in v1: no policy would read it (rule 9). People writes `app_metadata` via the service-role client, with the last-admin guard in the action."
  - S1 (brief): "A `developer` role is added beside `admin`. Both open every experiment and `/admin`. Only `admin` grants roles. The role is read from `app_metadata.role`, which only the service role can write."
  - placement.md: "Outside the sandbox a developer is a `user`: `appUserIsAdmin` is an exact `'admin'` match (`packages/db/src/policies.ts:23`), and the tRPC admin tier refuses anything but `admin` (`packages/api/src/trpc.ts:60`)."
  - R11: a role change applies on the person's next request, because `getUser()` reads the Auth database each call. Nothing here caches a role.
- **Interfaces:** `APP_ROLES` and `AppRole` gain `"developer"`. `type TeamMember = { userId: string; email: string; role: "developer" | "admin" }`; `teamMemberOf(context: AuthContext | null): TeamMember | null`; `getTeamMember(): Promise<TeamMember | null>`. It is its own type, not `Viewer` (LAB-3 builds that), so this ticket needs nothing from LAB-3.
- **Per path:**
  - `rls.ts`: the constant.
  - `rls.test.ts`: C3, beside the existing unit cases.
  - `test/rls.test.ts`: C4, beside the existing owner-row cases.
  - `auth/src/context.test.ts`: C1.
  - `api/src/context.test.ts`: C2, or a new `trpc.test.ts` in the same folder if that reads better.
  - `apps/web/lib/sandbox/team.ts`, `team.test.ts`: the team check and C5. `[ASSUMPTION: every team member signs in with an email; a member with none is null, since the record of actions needs one.]`
- **Gotchas:**
  - Keep the order user, developer, admin: People's select lists them so.
  - `packages/services/src/context.ts` carries `AppRole` into the service context. Grep for every `role ===` and `role !==` and confirm none grants more to a non-user.
  - Name each test after its criterion. C4 runs only on the local database.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model may add the twin "for completeness", which R3 rules out.
