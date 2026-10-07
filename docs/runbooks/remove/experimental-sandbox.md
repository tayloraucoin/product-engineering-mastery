---
title: "Remove the experimental sandbox — a removal runbook"
description: "Follow from step 4 of new-project/README.md when the briefing drops the experimental sandbox; tag, delete, edit, migrate, prove it gone with a zero-hit grep and a 404, then hand the hosted steps to the operator."
layer: runbooks
status: draft
thread: "LAB-24"
role: Usher
date: 2026-10-07
last_reviewed: 2026-10-07
supersedes:
load_when:
---

# Remove the experimental sandbox

> **Module:** gated design reviews in the web app: experiments under `/experimental/<slug>`, the team's `/admin`, the data-access module `apps/web/lib/sandbox/`, seven service-only `sandbox_` tables, the `@pem/db/sandbox` subpath and the `web-sandbox` boundary (D-LAB-39, D-LAB-43). No package and no dependency of its own.
> **Built by:** the LAB epic (LAB-1 to LAB-23). The edit list below was read from the code, not from the contracts.
> **Run from:** step 4 of [`new-project/README.md`](../new-project/README.md), before auth and the database: the sandbox needs both, and email, which is locked.

Run it in six phases, in order: tag, delete, edit, migrate, verify, then the operator's steps. Phase 1 is a STOP gate: nothing is deleted until the restore point exists. Phase 6 is the operator's, and an agent stops before it.

## 1. Tag: the STOP gate

The restore point holds everything the removal takes. Which form it takes depends on whether the repo has a commit yet.

**A repo with commits** (a product repo dropping the sandbox later):

```bash
git status --short
git tag pre-sandbox-removal
```

**STOP** if `git status --short` prints anything, or the tag cannot be created. `git diff pre-sandbox-removal` shows what went, and `git checkout pre-sandbox-removal -- <path>` brings a file back.

**A new-project duplicate** (step 4, where nothing is committed until step 7): stage everything and record the staged tree.

```bash
git add -A
git write-tree
```

**STOP** if `git write-tree` fails. Note the tree id it prints in the thread. `git diff --cached <tree>` shows what went, and `git restore --source=<tree> --staged --worktree -- <path>` brings a file back. Stage again (`git add -A`) before every `git grep` below: it sees only tracked files. A staged file is deleted with `git rm -rf`.

Before deleting, record the 404 baseline if the app runs (`yarn web:dev`). `/experimental/pricing-2026` shows the gate, with its code field. `/admin/experiments` sends a signed-out visitor to `/auth/sign-in?next=/admin/experiments`, never to a 404. Take a screenshot of each. If the app cannot run yet, because a duplicate's environment is set in step 5, record the baseline as skipped. The after-check in phase 5 still applies.

## 2. Delete

### Files to delete

From the module's `files` list in `toolkit.json`:

- `apps/web/app/experimental/` (the one dynamic route, its review page, actions, components, and `_experiments/` with `pricing-2026` and the registry)
- `apps/web/app/admin/` (the shell, People, experiments and their reviewers, codes, results and data pages)
- `apps/web/lib/sandbox/` (`access.ts`, the cookie, codes, throttle, link token, team check, validators, `robots.ts`, `secret-check.ts`, and their tests)
- `packages/db/src/schema/sandbox/` (the seven tables)
- `packages/db/src/sandbox/` (the viewer-scoped queries behind `@pem/db/sandbox`)
- `packages/db/test/sandbox/` (the real-Postgres isolation tests)

And the product's living truth for them, once promoted: `specs/<app>/ux/experimental/` and `specs/<app>/ux/admin/`.

Then stop the dev server and delete `apps/web/.next`. The baseline run left route types there that still name the deleted pages, and `yarn check-types` fails on them until they go.

## 3. Edit

### Files to edit

- `packages/db/src/schema/index.ts`: delete the seven `./sandbox/*.ts` re-exports (`reviewers`, `accesses`, `view-events`, `comments`, `review-versions`, `actions`, `gate-attempts`).
- `packages/db/src/schema/index.test.ts`: delete LAB-1's tests, from `const dialect = new PgDialect();` to the end of the file, and the `PgDialect` and `authenticatedRole` imports they alone use.
- `packages/db/package.json`: delete the `./sandbox` export.
- `apps/web/env.ts`: delete the `sandboxSecretProblem` import, the three `SANDBOX_SECRET*` raw reads, the `SANDBOX_SECRET` schema entry with its comment, and its `pickTiered` line.
- `apps/web/next.config.ts`: delete the `SANDBOX_NOINDEX_HEADERS` import and the `headers()` function with its comment. Keep `headers()` if the product has added its own headers there.
- `apps/web/app/_components/floating-theme-toggle.tsx`: delete the two `[body:has([data-admin-shell])_&]:hidden` and `[body:has([data-sandbox-design])_&]:hidden` classes, and the comment's sentences on the `/admin` shell and an experiment's design. The component stays: the root layout uses it.
- `tooling/boundaries.test.ts`: delete LAB-3's block, from the comment `// LAB-3 (its C5)` through the `SANDBOX_ALLOWED` loop.
- `packages/db/scripts/grant-admin.ts`: in the header comment, drop every sentence that names People, its role-change lock, the last-admin race or this runbook. The script stays (below).
- `docs/engineering/tech-stack.md`: in the `lucide-react` row, drop `apps/web` when the dependency goes (below).
- Leftover comments: the sandbox's paragraph in `boundaries.js`'s header (below). Also every sentence in `apps/web/env.ts` and `apps/web/next.config.ts` naming D-LAB or the experimental sandbox, which goes with the lines above.

**Kept, and so named:** LAB-8's `mobileBreakpoint` option in `packages/ui/src/hooks/use-mobile.ts` and `sidebar/sidebar.tsx` (with its story), which is backward-compatible. LAB-8's `FloatingThemeToggle` in `apps/web/app/layout.tsx`, which stays as the root toggle. LAB-2's `supabaseUser(role: AuthContext["role"])` in `packages/api/src/test-helpers.ts`, which takes whatever roles remain.

### Variables

`SANDBOX_SECRET`, with its `_LOCAL` and `_STAGING` forms: delete the "Experimental sandbox" block from `.env.example` and the three names from `turbo.json`'s `globalEnv`. Each developer deletes them from `apps/web/.env.local` too. Every host's copy is the operator's (phase 6).

### Dependencies

None of its own. `lucide-react` in `apps/web/package.json` came with the admin shell (LAB-8); delete it when this prints nothing, then `yarn install`. It stays in `@pem/ui` and `@pem/catalog`.

```bash
git grep -l lucide-react -- apps/web ':!apps/web/package.json'
```

### Boundaries entries

In `packages/config/eslint/boundaries.js`, both sandbox elements go, `web-sandbox` and `db-sandbox` (D-LAB-34):

- the header comment's `web-sandbox` paragraph;
- the `web-sandbox` and `db-sandbox` objects in `ELEMENTS`;
- `"db-sandbox"` from the `db` row of `PACKAGE_IMPORTS`, and the `"db-sandbox"` row itself;
- `"db-sandbox"` from `TRANSPORT_FREE` and from `NOT_FOR_APPS`, and the `web-sandbox` clause from the comment above `NOT_FOR_APPS`;
- `SANDBOX_ROUTE_FILES`, `sandboxRouteOverrides()` and its spread in the exported config;
- in `buildDependencyRules`, the two `web-sandbox` rules and their comment, and `"web-sandbox"` from the packages' `disallow`, which goes back to `APP_TYPES`.

### Roles

`developer` sits in `APP_ROLES` (`packages/db/src/rls.ts`) for the sandbox's team check. It leaves only when no other feature reads it. This decides:

```bash
git grep -n -E "[\"'`]developer[\"'`]" -- apps packages tooling ':!packages/db/migrations'
```

- **Only `packages/db/src/rls.ts` and LAB-2's tests print:** remove it. `APP_ROLES` goes back to `["user", "admin"]`. Delete LAB-2's tests: "C2: an admin procedure refuses a developer" (`packages/api/src/context.test.ts`), "C3: the bridge accepts developer" (`packages/db/src/rls.test.ts`), the two "C4: a developer …" tests (`packages/db/test/rls.test.ts`), and in "C1: roleOf returns developer …" (`packages/auth/src/context.test.ts`) make the `developer` line expect `user`, which proves the fallback below, and rename the test. Drop `"developer"` from the `APP_ROLES` line quoted in [`supabase-database.md`](supabase-database.md).
- **Anything else prints:** keep it, and say so in the set-up record.

Either way no data change is forced. An account still holding `developer` in `app_metadata` reads as `user` through `roleOf`, which maps any unknown role to `user`. Clearing the value is the operator's (phase 6).

`admin` predates the sandbox, so LAB-9's first-admin script stays. With `/admin/people` gone, it is how the product grants admin:

```bash
yarn workspace @pem/db db:grant-admin <email>
```

## 4. Migrate

> **Warning: the record goes with the tables.** The drop deletes every row of the seven tables: reviewers and their access codes, views, comments, review versions, gate attempts, and `sandbox_actions`, the record of who did what in `/admin`. Nothing keeps a copy. Export first wherever the data matters.

If a local database exists (a new-project duplicate has none until step 5, so skip to the generate), export each table to CSV while it still exists, on each tier that holds data. Use the tier's migration URL from the database package's .env.local (`DATABASE_MIGRATION_URL_LOCAL` on the local tier). The files hold reviewers' labels and comments, which are personal data: keep them where the product keeps such files, and delete them when they are no longer needed.

```bash
psql "<the tier's migration URL>" -c "\copy sandbox_actions to 'sandbox_actions.csv' csv header"
```

Repeat for `sandbox_reviewers`, `sandbox_accesses`, `sandbox_view_events`, `sandbox_comments`, `sandbox_review_versions` and `sandbox_gate_attempts`. A hosted project's export is the operator's (phase 6).

Then, after the schema edit in phase 3:

```bash
yarn db:generate
```

It writes a new migration that drops the seven `sandbox_` tables and nothing else. Read it before going on: seven `DROP TABLE` statements, with any policy and constraint drops that belong to them, and no other table touched. Never edit or delete `0003_sandbox_schema.sql` or any applied migration, nor 0003's snapshot or journal entry; the generate appends its own entry to `_journal.json`. Apply it on the local tier with `yarn db:migrate` when a local database exists; a hosted tier is the operator's.

## 5. Verify

1. In `toolkit.json`, set `"removed": true` on the `experimental-sandbox` entry in `stack`. This is the recipe's last section of its own work (new-project step 4); phase 6 is handed over.
2. `yarn check-stack` exits 0. It proves the listed files, the variable and the (empty) dependency list are gone. It does not read the shared files edited in phase 3: the next three steps prove those.
3. The zero-hit grep prints nothing:

   ```bash
   git grep -n -E 'sandbox_|SANDBOX_|-sandbox|/sandbox([^.a-z\]|\.[^a-z]|\.?$)|sandbox[A-Z]|data-admin-shell|D-LAB-|[Ee]xperimental sandbox|apps/web/app/(experimental|admin)|href=.{0,2}/(experimental|admin)|pricing-2026' -- apps packages tooling ':!packages/db/migrations' ':!tooling/refs-pending.json'
   ```

   It skips the applied migrations, which keep their history, and `tooling/refs-pending.json`, which names the deleted paths on purpose (step 6). It never searches for a bare `admin`, since `adminProcedure` and the admin role predate the sandbox, nor a bare `sandbox`, which the agent harness's own settings use.

4. `yarn check-types` and `yarn lint:boundaries` exit 0.
5. Read back what no grep sees: `lucide-react` is gone from `apps/web/package.json` and the tech-stack row (when it went), the `floating-theme-toggle.tsx` comment, the `grant-admin.ts` header, the `APP_ROLES` line quoted in `supabase-database.md`, and `.env.local`.
6. The 404 check, after: with `yarn web:dev` running, `/experimental/pricing-2026` and `/admin/experiments` both return the app's 404 page. Take a screenshot of each, beside the phase-1 pair.
7. `yarn check-refs` names the deleted paths this runbook and other kept docs still list. Add each to `tooling/refs-pending.json`, keyed exactly as printed: `"<deleted path>": "removed by docs/runbooks/remove/experimental-sandbox.md"`.
8. `yarn verify` exits 0. Its test-weakening check fails on the deleted LAB tests unless the commit says why: give it a `Test-changes: LAB's tests go with the experimental sandbox (docs/runbooks/remove/experimental-sandbox.md)` trailer.

Delete the tag once the change is committed and the operator's steps are done: `git tag -d pre-sandbox-removal`.

## 6. The operator's steps

An agent stops here and hands these over by name.

### Vendor-side steps

1. **Export, then migrate each hosted tier.** Export the seven tables from each hosted project as in phase 4. Then apply the new migration there, staging before production. It drops the tables for good.
2. **Delete the variables.** Remove `SANDBOX_SECRET` from every host's environment, for every tier.
3. **Clear `developer`, if it left `APP_ROLES`.** For each account holding it, set `app_metadata.role` to `user` (or remove the key) through the Supabase Auth admin API (`PUT /auth/v1/admin/users/<id>` with the service-role key), the API `db:grant-admin` uses. Nothing breaks if this waits: such an account already reads as `user`.
4. **Outside links.** Any links already sent to reviewers now land on the 404 page. Tell anyone mid-review.

### Retention and erasure

Once the tables are dropped, the database holds no reviewer data, so an erasure request concerns only the exports and whatever the product kept of them. Every `admin` grant, and the rest of `app_metadata`, stays with the account and follows the auth module's own erasure.
