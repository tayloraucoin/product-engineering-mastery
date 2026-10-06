# As-built — LAB-2

## Shipped against the contract

- C1: `APP_ROLES` in `packages/db/src/rls.ts` is now `user, developer, admin`, in that order. `roleOf` reads it unchanged. `packages/auth/src/context.test.ts` shows `developer` returned as developer and `admin` as admin, while a missing `app_metadata`, a missing role, and the unknowns `owner`, `Developer`, `DEVELOPER`, ` developer`, `1` and `null` all return user.
- C2: `adminProcedure` (`packages/api/src/trpc.ts:60`, unchanged, still `role !== "admin"`) refuses a developer with FORBIDDEN, while `whoami` shows the developer's role arriving as `developer`. The existing case still proves an admin is served.
- C3: `assertRlsContext` accepts `developer`, and refuses `owner`, `Developer`, `service_role` and the empty string.
- C4: on the local database through the bridge, a developer reads only their own `users` row, as a user does, and no other user's `notes`, while an admin reads both `users` rows.
- C5: `apps/web/lib/sandbox/team.ts` has `teamMemberOf(context)`, which is pure, and `getTeamMember()`, which is `teamMemberOf(await getAuthContext())`. A developer or an admin gets `{ userId, email, role }`. A user, no session, a member with no email, or an unexpected role string gets null.

## Deviations

- `getTeamMember` imports `../supabase/context` dynamically, on call, because that seam starts with `import "server-only"`, which throws under `node --test`. The static import would have kept `teamMemberOf`'s test from loading. Next bundles the dynamic import as server code just the same.
- `[ASSUMPTION]` (from the contract) A team member with no email is null, because the record of actions names its actor by email. An empty email counts as none.
- `appUserIsAdmin` (`packages/db/src/policies.ts:23`) is unchanged, an exact `'admin'` match. No developer policy twin was added (R3), and no database constraint on role values. A grep for `role ===` and `role !==` across `apps/` and `packages/` finds only `trpc.ts:60` and two unrelated chat-message role checks in `packages/ai`. `packages/services/src/context.ts` only passes the role on to the bridge.

## Not verified

- `review:mason` and `review:warden` are manual criteria, recorded by `yarn review:run`.
- No criterion covers R11 (a role change applies on the next request). It holds because `getAuthContext` is React's per-request `cache` over `getUser()`, and nothing here caches beyond that.

## Next

LAB-3 builds the `Viewer` type and `@pem/db/sandbox`. LAB-5 and LAB-8 build their team viewer from `getTeamMember()`.
