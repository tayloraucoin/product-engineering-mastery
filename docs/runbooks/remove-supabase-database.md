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
> **Built by:** STK-9. STK-10 adds its agent guardrails (D-STK-18) and STK-11 the local auth mirror (D-STK-6); each adds its own lines below when it lands.
> **Run from:** step 4 of [`new-project.md`](new-project.md).

**When both Supabase modules go.** Run [`remove-supabase-auth.md`](remove-supabase-auth.md) first, then this one: auth sits above the database in the package graph (D-STK-1). With both gone, nothing uses the Supabase project, so the vendor-side steps of both runbooks apply, and the database guardrails in `.claude/settings.json` (D-STK-18, STK-10) guard nothing. Removing the database while keeping auth: what auth loses is filled by STK-9 and STK-12.

## Files to delete

- `packages/db/`, the whole folder: schema, policies, the bridge, migrations, `supabase/setup/`, the scripts and the tests.

## Files to edit

- `package.json` (root): delete the `check-migrations`, `test:db`, `db:local`, `db:local:reset`, `db:generate`, `db:migrate` and `db:setup` scripts, and `yarn check-migrations &&` from `verify`.
- `toolkit.json`: set `migrationsDir` to `null`.
- `packages/config/eslint/boundaries.js`: see Boundaries entries.
- `docs/engineering/codebase-conventions.md` §4: the `@pem/db` row, and `postgres` and `drizzle-kit` in the SDK-owner paragraph.
- `docs/engineering/tech-stack.md`: the `drizzle-orm`, `drizzle-kit`, `postgres` row and the `supabase/postgres` image row.

## Variables

From `.env.example` and `turbo.json`'s `globalEnv`, each with its `_LOCAL` and `_STAGING` forms:

- `DATABASE_URL`
- `DATABASE_MIGRATION_URL`

Keep `DATABASE_ENVIRONMENT`: it is the tier switch every module reads (D-STK-3), not this module's.

## Dependencies

`@pem/db`, `drizzle-orm`, `drizzle-kit` and `postgres`. After deleting the folder, run `yarn install` so `yarn.lock` drops them; no other workspace lists them.

## Boundaries entries

In `packages/config/eslint/boundaries.js`: the `workspacePackage("db", "db")` line in `ELEMENTS`, the `db` entry in `PACKAGE_IMPORTS`, and the `postgres` and `drizzle-kit` entries in `SDK_OWNERS`. Remove `db` from the layer-order comment.

## Vendor-side steps

1. Stop and remove the local image: `docker rm -f pem-db-local`.
2. In the Supabase dashboard, for each tier's project, delete the tables `@pem/db` migrated (`public.users`, `public.notes` and any added since) and the `drizzle` schema holding the migration journal; or delete the project when auth goes too.
3. Drop the setup SQL's objects: the triggers `on_auth_user_created` and `on_auth_user_email_changed` on `auth.users`, and the functions `public.handle_new_auth_user`, `public.handle_auth_user_email_change` and `public.set_updated_at`.
4. Delete the `DATABASE_URL*` and `DATABASE_MIGRATION_URL*` values from the hosting provider's environment settings.

## Verify

1. In `toolkit.json`, set `"removed": true` on the `db` entry in `stack`.
2. `yarn check-stack` exits 0: no listed file, variable or dependency of the module is left.
3. `yarn verify` exits 0.
