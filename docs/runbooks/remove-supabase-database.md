---
title: "Remove the Supabase database — a removal runbook"
description: "Follow from step 4 of new-project.md when the briefing drops Supabase database; delete, edit and unlist what the module added, then prove it gone with yarn check-stack."
layer: runbooks
status: draft
thread: "STK-3"
role: Usher
date: 2026-10-03
last_reviewed: 2026-10-03
supersedes:
load_when:
---

# Remove the Supabase database

> **Module:** the database package (D-STK-5: Drizzle on Supabase, schema, policies, migrations and setup SQL), the one owner of `postgres` and `drizzle-kit` (D-STK-16).
> **Built by:** STK-9; STK-10 adds its agent guardrails (D-STK-18); STK-11 adds the local auth mirror and the Supabase CLI that runs the local database (D-STK-6).
> **Run from:** step 4 of [`new-project.md`](new-project.md).

**When both Supabase modules go.** Run [`remove-supabase-auth.md`](remove-supabase-auth.md) first, then this one: auth sits above the database in the package graph (D-STK-1). With both gone, nothing uses the Supabase project, so the vendor-side steps of both runbooks apply, and the database guardrails in `.claude/settings.json` (D-STK-18, STK-10) guard nothing. Removing the database while keeping auth: follow "When auth stays" below as well.

## Before deleting anything

Stop the local database and drop its volume while the CLI is still installed: `yarn db:stop --no-backup`. With the CLI already gone, `docker rm -f supabase_db_<project_id>` and `docker volume rm supabase_db_<project_id>` do the same, with `project_id` from `packages/db/supabase/config.toml`.

## Files to delete

- `packages/db/`, the whole folder: schema, policies, the bridge, migrations, `supabase/setup/`, the CLI's `supabase/config.toml`, the local auth mirror (`src/local-auth-mirror.ts`), the scripts and the tests.

## Files to edit

- `package.json` (root): delete the `check-migrations`, `test:db`, `db:local`, `db:local:full`, `db:local:reset`, `db:stop`, `db:generate`, `db:migrate`, `db:setup` and `db:seed-users` scripts, and `yarn check-migrations &&` from `verify`.
- `toolkit.json`: set `migrationsDir` to `null`.
- `packages/config/eslint/boundaries.js`: see Boundaries entries.
- `docs/engineering/codebase-conventions.md` §4: the `@pem/db` row, and `postgres` and `drizzle-kit` in the SDK-owner paragraph.
- `docs/engineering/tech-stack.md`: the `drizzle-orm`, `drizzle-kit`, `postgres` row, the `supabase` CLI row and the `supabase/postgres` image row.
- `apps/web/env.ts`: the three `DATABASE_URL` reads in `raw`, the `DATABASE_URL` entries in `server` and `runtimeEnv`.
- `apps/web/next.config.ts`: `@pem/db` in `transpilePackages`. `apps/web/package.json`: the `@pem/db` dependency.

## When auth stays

The auth module (STK-12) reaches the database twice: Mode A's local mirror, and the application roles its `AuthContext` carries.

- Delete `apps/web/lib/supabase/local-mirror.ts`. In `apps/web/lib/supabase/context.ts`, delete its import and call `createAuthContextResolver()` with no `mirror`.
- `packages/auth/src/context.ts`: replace the `@pem/db/rls` import with the roles themselves, `export const APP_ROLES = ["user", "admin"] as const;` and `export type AppRole = (typeof APP_ROLES)[number];`. Delete `@pem/db` from `packages/auth/package.json` and `db` from the `auth` row of `PACKAGE_IMPORTS`.
- `packages/auth/src/client-safe.test.ts`: the last test's `@pem/db/rls` assertion goes with the import.

## Variables

From `.env.example` and `turbo.json`'s `globalEnv`, each with its `_LOCAL` and `_STAGING` forms:

- `DATABASE_URL`
- `DATABASE_MIGRATION_URL`

Keep `DATABASE_ENVIRONMENT`: it is the tier switch every module reads (D-STK-3), not this module's. Keep `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` while Supabase Auth stays: STK-11 declared them for `db:seed-users`, but they are the auth module's, and its runbook removes them. When `toolkit.json`'s `stack` block has no `auth` entry, nothing else reads them: delete both, with their `_LOCAL` and `_STAGING` forms and their comment block, from `.env.example` and `turbo.json`'s `globalEnv`. A service-role key name with no reader invites a live key where nothing uses it.

## Dependencies

`@pem/db`, `drizzle-orm`, `drizzle-kit`, `postgres` and `supabase` (the CLI). After deleting the folder, run `yarn install` so `yarn.lock` drops them; no other workspace lists them.

## Boundaries entries

In `packages/config/eslint/boundaries.js`: the `workspacePackage("db", "db")` line in `ELEMENTS`, the `db` entry in `PACKAGE_IMPORTS`, and the `postgres` and `drizzle-kit` entries in `SDK_OWNERS`. Remove `db` from the layer-order comment.

## Vendor-side steps

1. The local database went in "Before deleting anything". A machine that still has STK-9's pre-CLI container removes it too: `docker rm -f pem-db-local`.
2. In the Supabase dashboard, for each tier's project, delete the tables `@pem/db` migrated (`public.users`, `public.notes` and any added since) and the `drizzle` schema holding the migration journal; or delete the project when auth goes too.
3. Drop the setup SQL's objects, on hosted tiers only (the local database went with its volume, and with it the mirror's `local_auth_mirror` marker schema): the triggers `on_auth_user_created` and `on_auth_user_email_changed` on `auth.users`, and the functions `public.handle_new_auth_user`, `public.handle_auth_user_email_change` and `public.set_updated_at`.
4. Delete the `DATABASE_URL*` and `DATABASE_MIGRATION_URL*` values from the hosting provider's environment settings.

## Verify

1. In `toolkit.json`, set `"removed": true` on the `db` entry in `stack`.
2. `yarn check-stack` exits 0: no listed file, variable or dependency of the module is left.
3. `yarn verify` exits 0.
