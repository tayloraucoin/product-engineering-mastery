# As-built — LAB-2

## Shipped against the contract

- C1: `APP_ROLES` in `packages/db/src/rls.ts` is now `user, developer, admin`, in that order. `roleOf` reads it unchanged. `packages/auth/src/context.test.ts` shows `developer` returned as developer and `admin` as admin, while a missing `app_metadata`, a missing role, and the unknowns `owner`, `Developer`, `DEVELOPER`, ` developer`, `1` and `null` all return user.
- C2: `adminProcedure` (`packages/api/src/trpc.ts:60`, unchanged, still `role !== "admin"`) refuses a developer with FORBIDDEN, while `whoami` shows the developer's role arriving as `developer`. The existing case still proves an admin is served.
- C3: `assertRlsContext` accepts `developer`, and refuses `owner`, `Developer`, `service_role` and the empty string.
- C4: on the local database through the bridge, a developer reads only their own `users` row, as a user does, while an admin reads both. A second test shows a developer does not open another user's owner-private `notes` row, which is written through the bridge and removed in a `finally`.
- C5: `teamMemberOf(context)` gives a developer or an admin `{ userId, email, role }`. A user, no session, a member with no email, or an unexpected role string gets null. `getTeamMemberWith(getContext)` reads the context afresh on every call: an admin demoted between two calls is null on the second.

## Deviations

- **Two files, not one** (after the first reviews: mason and warden, both PASS, each with this as a should-fix):
  - `apps/web/lib/sandbox/team-check.ts` holds the rule: `teamMemberOf`, `getTeamMemberWith`, `TeamMember`, and `TeamRole = Extract<AuthContext["role"], "developer" | "admin">`, so dropping a role from `APP_ROLES` fails to compile here.
  - `team.ts` opens with `import "server-only"` and binds the rule to the request: `getTeamMember = () => getTeamMemberWith(getAuthContext)`, a static import. It re-exports the rule, so callers import from `team.ts`.
  - This follows the billing webhook's `handle.ts` and `ledger.ts`. It replaced a call-time dynamic import that the first build used to keep `server-only` out of the node tests.
  - `team-check.ts` was added to the contract's planned paths.
- **After the second reviews (both PASS):**
  - `supabaseUser` in `packages/api/src/test-helpers.ts` takes `AuthContext["role"]`, so it follows `APP_ROLES`, and C2 mints the developer with `supabaseUser("developer")`.
  - `docs/runbooks/remove/supabase-database.md` inlined the old two-role list for when `@pem/db` goes. Followed, it would have sent every developer back to `user`. It now lists all three roles and says why.
  - The owner-private probe asserts its insert before using it.
  - Both files were added to the contract's planned paths.
- `technical/placement.md` now names `team.ts` and `getTeamMember()` as the team check, which `access.ts` calls first. It used to say the check sat inside `access.ts`; mason found the line stale.
- `[ASSUMPTION]` (from the contract) A team member with no email is null, because the record of actions names its actor by email. An empty email counts as none.
- `appUserIsAdmin` (`packages/db/src/policies.ts:23`) is unchanged, an exact `'admin'` match. No developer policy twin was added (R3), and no database constraint on role values. A grep for `role ===` and `role !==` across `apps/` and `packages/` finds only `trpc.ts:60` and two unrelated chat-message role checks in `packages/ai`. `packages/services/src/context.ts` only passes the role on to the bridge.

## Not verified

- `review:mason` and `review:warden` are manual criteria, recorded by `yarn review:run`.
- No criterion covers R11 (a role change applies on the next request). It holds because `getAuthContext` is React's per-request `cache` over `getUser()`, and nothing here caches beyond that.

## Next

LAB-9 should refuse to grant a role to an account with no email: `teamMemberOf` returns null for one, so that admin would see `/admin` as a 404 (warden). LAB-3 builds the `Viewer` type and `@pem/db/sandbox`. LAB-5 and LAB-8 build their team viewer from `getTeamMember()`.
