# As-built — LAB-9

## Shipped against the contract

- C1–C3: `changeRoleWith(deps, actor, input)` in `apps/web/lib/sandbox/people.ts` (pure).
  - It refuses a non-admin actor and malformed input before touching anything.
  - Then, inside the lock, it:
    - reads the person from the Auth API;
    - counts admins from the Auth API when an admin is being demoted, refusing the last one (`last-admin`);
    - records one `role-change` row naming the person's lower-cased email;
    - writes the whole `app_metadata` back with the new `role`, so other keys survive whether or not GoTrue merges.
  - Results are `changed`, `last-admin`, `refused` or `failed`, each with people.md's words. A thrown write rolls back the record row.
  - `people-data.ts` (`server-only`) binds it as `changeRoleAs` to `createSupabaseAdminClient`, `withRoleChangeLock` and `recordAction`.
  - `app/admin/people/actions.ts` `changeRole` opens with `requireTeamAction({ adminOnly: true })` and returns its refusal (LAB-8's C6 scan holds that shape).
  - People is `ready: true` in `admin-nav.ts`, and `/admin/people` is admin-only by flag and by path.
- C4: `withRoleChangeLock(db, viewer, fn)` in `packages/db/src/sandbox/roles.ts` is admin-only and runs `fn` in one transaction after `pg_advisory_xact_lock(hashtext('pem.sandbox.role-change'))`.
  - `test/sandbox/roles.test.ts` runs two admins demoting themselves at once: under the lock one is refused and one admin is left. The same race without the lock leaves none.
  - The isolation registry has its five viewer cases; the admin case reads `pg_locks` to show the lock is held.
- C5: `yarn workspace @pem/db db:grant-admin <email>` (`packages/db/scripts/grant-admin.ts`) works over `fetch` against the Auth admin API, in `local-users.ts`'s shape.
  - It lists users by page, refuses an unknown email with a fixed message, and leaves an admin untouched.
  - Every request uses `redirect: "error"`, and no message carries the key.
- C6: `evidence/people-confirm.png`, five changes (to admin, to developer, two removals, your own demotion with another admin), at 390, 834 and 1440, light and dark.
- C7: walked by keyboard in the browser pane; handed to the operator (`evidence/C7-operator.md`).
- C8: `evidence/people-states.png`, every `people-*` key. Both captures used a scratch copy whose `team.ts` returns a synthetic admin, because this machine has no Supabase Auth. The copy is never committed.

## Deviations

- [ASSUMPTION] The table is `@pem/ui/table`, not the composed `data-table`. `data-table` has no caption, names its own filter "Filter by …", and words its empty rows in its own copy. people.md asks for "Find by email", the caption "People" and its own lines. The 50-row pager is the page's own.
- [ASSUMPTION] Every account is listed through the Auth API, 1,000 a page, up to 50 pages, then filtered on the client. A failed page fails the list, never a partial count.
- [ASSUMPTION] Singular count: "1 person matches."
- [ASSUMPTION] The dialog's title repeats its button ("Make admin"); people.md gives only the question and the button.
- The record names who changed and whose role changed, not the new role. `recordAction` accepts only `role-change` with a `targetEmail`, and counts only from a closed list. Drafted as LAB-28.
- [ASSUMPTION] Inside the lock the order is read, count, record, then write, not the contract's "write, record". A thrown write then rolls the record back (`people.test.ts`), and the remaining window is the commit itself.
- A change to the role a person already holds returns `changed` and writes nothing.
- Strings people.md does not give, for `yarn truth:promote LAB` to fold into people.md: the dialog title (it repeats its button), the pager ("Page N of M", "Previous", "Next") and "1 person matches.". Promotion also replaces people.md's timing line and its open assumption with R11's line, which mason confirmed as the named reviewer.
- Self-demotion: the page goes to `/admin/experiments` after the toast, and the guards give the 404 there when no role is left.
- On this machine the action returns the fixed failure (no Auth API, no database); the success toast is proven by the tests only.

## Reviews (Q3)

- Mason: PASS, with two should-fixes, both fixed:
  - The `?state=` fixtures used the real viewer's id and email as "(you)", so confirming a change on that row would have changed the real account. `peopleStateView(state)` now takes no identity and uses `PEOPLE_FIXTURE_VIEWER`, a synthetic id. A test checks every key's "(you)" row.
  - The action name had two homes. `@pem/db/sandbox` now exports `ROLE_CHANGE_ACTION`, with its isolation-registry case, and `people-data.ts` imports it.
  - The skeleton is static (`animate-none`), as people.md says. The primitive's pulse default is for the canon owner.
- Warden: PASS, six "Consider" items, acted on in the same batch:
  - `people.ts` no longer imports `APP_ROLES` at runtime, so the client table keeps `@pem/db/rls` out of the browser. `PEOPLE_ROLES` is an exhaustive `Record<AppRole, …>`, so a new role fails to compile there.
  - `grant-admin.ts` now says why it may write outside the lock (it only grants) and that a script which removes a role must take it.
  - Left as written:
    - A failed commit after a successful Auth write can change a role with no record. The record row is written first and the window is the commit itself, so LAB-16 should read the record as possibly under-counting, never over-counting.
    - A no-op change returns `changed`. The page never sends one.
    - No announcement while the table loads; for the operator's C7 pass.

## Not verified

- C7 with a screen reader (deferred).
- A real role change against Supabase Auth, and `db:grant-admin` against a real project: no Auth server here; LAB-24's runbook carries the hosted step.

## Next

LAB-16 reads the `role-change` rows on Data; LAB-24's runbook calls `db:grant-admin`.
