---
title: "Remove Supabase Auth — a removal runbook"
description: "Follow from step 4 of new-project/README.md when the briefing drops Supabase Auth; delete, edit and unlist what the module added, then prove it gone with yarn check-stack."
layer: runbooks
status: draft
thread: "STK-3"
role: Usher
date: 2026-10-03
last_reviewed: 2026-10-05
supersedes:
load_when:
---

# Remove Supabase Auth

> **Module:** the auth package (D-STK-7: server, browser, admin and session-refresh factories, the request seam that returns the auth context, refresh in the proxy), the one owner of the `@supabase/*` SDKs (D-STK-16).
> **Built by:** STK-12 builds it; STK-11 builds the local auth mirror it calls (D-STK-6). The lists below are the module's `auth` entry in `toolkit.json`'s `stack` block, and what reads it.
> **Run from:** step 4 of [`new-project/README.md`](../new-project/README.md).

**When both Supabase modules go.** Run this runbook first, then [`supabase-database.md`](supabase-database.md): auth sits above the database in the package graph (D-STK-1). With both gone, nothing uses the Supabase project, so the vendor-side steps of both runbooks apply, and the database guardrails in `.claude/settings.json` (D-STK-18, STK-10) guard nothing. Every policy beside a table reads `app.user_id`, which the RLS bridge sets from the `AuthContext` this module returns; with auth gone, a product that keeps the database sets that context from its own identity source, or queries only as a service.

## The local auth mirror (STK-11)

The mirror lives in the database package (D-STK-6), so removing auth leaves it behind with nothing to call it. When the database stays and auth goes, delete it as below. The loopback checks in `packages/db/src/loopback.ts` stay: the local reset, the integration tests and `db:local` use them.

- Delete from `packages/db/`: `src/local-auth-mirror.ts` and `src/local-auth-mirror.test.ts`, `test/local-auth-mirror.test.ts`, `scripts/local-auth-marker.ts`, `scripts/local-full.ts`, `scripts/local-users.ts`, `scripts/local-users.test.ts` and `scripts/seed-users.ts`.
- `packages/db/package.json`: the `./local-auth-mirror` export (keep `./loopback`), and the `db:local:full` and `db:seed-users` scripts; the same two in the root `package.json`.
- `packages/db/scripts/local.ts`: the marker step (`markLocalAuthMirror` and its client) and the auth-URL warning; `supabase db start` and the network warning stay. `scripts/auth-writers.test.ts` stays: with the mirror gone, it requires that no shipped file writes to `auth.users`. `scripts/env.ts`: the `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` reads, `authSettings` and `authUrlName`.
- `packages/db/scripts/setup-local.ts`: the `markLocalAuthMirror` import and step, and the header's clause about marking a mirror target. `scripts/tier-guard.test.ts`: `local-full.ts` and `seed-users.ts` from its script lists, and the `seed-users.ts` test.
- `packages/db/supabase/config.toml`: set `[auth] enabled = false` and delete the other `[auth]` lines.
- From `.env.example` and `turbo.json`'s `globalEnv`, with their `_LOCAL` and `_STAGING` forms: `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. From `packages/db/.env.example`: `NEXT_PUBLIC_SUPABASE_URL_LOCAL`, `SUPABASE_SERVICE_ROLE_KEY_LOCAL` and their comment block.

When the database goes too, its runbook deletes the whole `packages/db/` folder, mirror included; only the variables above are this runbook's.

## Files to delete

- `packages/auth/`, the whole folder: the factories, `updateSession` and `signOut`, the request seam, the redirect rules and their tests.
- `apps/web/proxy.ts`: it does nothing but refresh the session.
- `apps/web/lib/supabase/`: the config, the browser, server and admin clients, the seam and the Mode A mirror wiring.
- `apps/web/app/auth/`: the callback route, the sign-in page and the sign-out route. Delete any form that posts to `/auth/sign-out` with it.

## Files to edit

- `apps/web/env.ts`: the `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SERVICE_ROLE_KEY` reads in `raw` (each with its `_LOCAL` and `_STAGING` forms), `supabaseUrl` and `supabasePublishableKey`, their `server`, `client` and `runtimeEnv` entries, the two `nextConfigEnv` entries, and the `publicKeyProblem` import from `@pem/auth/config` with the check that calls it. The `DATABASE_URL` reads and entries serve only the mirror: delete them too unless another app file reads `env.DATABASE_URL`.
- `apps/web/next.config.ts`: `@pem/auth` in `transpilePackages`, and `@pem/db` unless the app still imports it.
- `apps/web/package.json`: `@pem/auth`; `server-only` unless another file in the app imports it; `@pem/db` unless the app still imports it.
- `packages/config/eslint/boundaries.js` and `tooling/boundaries.test.ts`: see Boundaries entries.
- `docs/engineering/tech-stack.md`: the `@supabase/ssr`, `@supabase/supabase-js` row. In the `server-only` row, `@pem/auth`'s server subpaths and `apps/web/lib/supabase` give way to `apps/web`'s server modules: `apps/web/lib/email.ts` and `apps/web/lib/trpc/context.ts` still import it.
- `docs/engineering/codebase-conventions.md` §4: the `@pem/auth` row, `auth` in the layer order and in the `@pem/api` row's imports, and `@supabase/*` in the SDK owners sentence.

**When the API layer stays.** `@pem/api` takes its identity type from `@pem/auth/context`, so it breaks with the folder. The dry run (STK-20) kept the API this way:

- `packages/api/src/context.ts`: define `AuthContext` here (`userId`, `email`, and `role` typed as `ServiceContext["role"]`), and export it from `packages/api/src/server.ts` beside `ApiContextSources`.
- `packages/api/src/test-helpers.ts`: the fakes vouch for the user directly, with a local `AuthUser` type, instead of through `createAuthContextResolver`.
- `packages/api/package.json`: `@pem/auth`. In `packages/config/eslint/boundaries.js`, `auth` from `api`'s entry in `PACKAGE_IMPORTS`.
- `apps/web/lib/trpc/context.ts`: drop the `../supabase/context` import; `fromCookies` and `fromBearer` answer `null`. Every API request is then anonymous, and a protected procedure refuses, until a new identity source replaces the two.
- `packages/services/src/context.ts`: its comment names `@pem/auth/context`; point it at `@pem/api/server`.

**When AI stays.** `apps/web/app/api/ai/chat/route.ts` asks `lib/supabase/context` who is signed in. Drop that import and pass `currentUserId: async () => null`. The local fixtures still answer anyone; with a key set, every chat answers 401 until a new identity source names the user, since a live model answers only a user.

## Variables

From `.env.example` and `turbo.json`'s `globalEnv`, each with its `_LOCAL` and `_STAGING` forms, and the comment block above them:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The first and last are also the database package's for `db:seed-users`; "The local auth mirror" above removes that reader.

## Dependencies

`@pem/auth`, `@supabase/ssr` and `@supabase/supabase-js`. After deleting the folders, run `yarn install` so `yarn.lock` drops them. `server-only` is not the module's: `apps/docs` uses it too, so only `apps/web`'s entry goes, and only when nothing there imports it.

## Boundaries entries

In `packages/config/eslint/boundaries.js`: the `workspacePackage("auth", "auth")` line in `ELEMENTS`, the `auth` entry in `PACKAGE_IMPORTS`, and the `"@supabase/*"` entry in `SDK_OWNERS`. Remove `auth` from the layer-order comment. In `tooling/boundaries.test.ts`, delete the probes that name `@supabase/*` or `@pem/auth`, or that sit in `packages/auth/`. Where an allowed probe lists `@pem/auth` among other imports, drop that one import.

## Vendor-side steps

1. In the Supabase dashboard, for each tier's project: under Authentication, delete the redirect URLs this app added (`http://localhost:3000/auth/callback` and each deployed `/auth/callback`) and turn off the sign-in providers. Delete the project instead when the database goes too.
2. Delete the `NEXT_PUBLIC_SUPABASE_*` and `SUPABASE_SERVICE_ROLE_KEY*` values from the hosting provider's environment settings, and rotate the service-role key if it was ever shared.

## Verify

1. In `toolkit.json`, set `"removed": true` on the `auth` entry of the `stack` block.
2. `yarn check-stack` exits 0: no listed file, variable or dependency of the module is left.
3. `yarn verify` exits 0.
