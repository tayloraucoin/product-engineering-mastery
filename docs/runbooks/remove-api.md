---
title: "Remove the API layer — a removal runbook"
description: "Follow from step 4 of new-project.md when the briefing drops API (tRPC); delete, edit and unlist what the module added, then prove it gone with yarn check-stack."
layer: runbooks
status: draft
thread: "STK-3"
role: Usher
date: 2026-10-03
last_reviewed: 2026-10-04
supersedes:
load_when:
---

# Remove the API layer

> **Module:** the API package (D-STK-8: tRPC 11, transport only, each procedure one call into the services), the one owner of `@trpc/*` (D-STK-16). Route Handlers for webhooks, AI streaming, cron and auth callbacks call services directly and are not part of it. D-STK-8 names the product this runbook is for: one simple Next.js app.
> **Built by:** STK-14. The lists below are the module's `api` entry in `toolkit.json`'s `stack` block, and what reads it.
> **Run from:** step 4 of [`new-project.md`](new-project.md).

**What takes its place.** The services stay. A Server Component or Server Action calls a service itself: `getAuthContext()` (`apps/web/lib/supabase/context.ts`) for the user, `createServiceContext` (`@pem/services/context`) over `getDb` for the context, then the service, catching the domain errors in `@pem/services/errors` where it shows them.

## Files to delete

- `packages/api/`, the whole folder: the procedure tiers, the context, the error mapper, the routers, `@pem/api/react` and their tests.
- `apps/web/app/api/trpc/`: the one route.
- `apps/web/lib/trpc/`: the context sources the route hands the package.

## Files to edit

- `apps/web/app/layout.tsx`: the `ApiProvider` import and the `<ApiProvider>` element around the header and `{children}`.
- `apps/web/lib/supabase/context.ts`: `getBearerAuthContext`, the `createServerAuthClient` import, and the bearer sentence in the header comment. Keep it if a Route Handler of your own reads bearer tokens.
- `apps/web/next.config.ts`: `@pem/api` in `transpilePackages`; `@pem/services` and `@pem/validators` too, unless the app now imports them.
- `apps/web/package.json`: `@pem/api`; `@pem/services` unless the app now imports it.
- `packages/config/eslint/boundaries.js` and `tooling/boundaries.test.ts`: see Boundaries entries.
- `packages/services/src/errors.ts` and `src/notes/notes.ts`: the header comments name tRPC as a transport; name the transports you keep.
- `packages/observability/src/redact.ts`: the comment on `input` names a tRPC procedure; say "a request body's". `src/logger.test.ts`: the `/api/trpc/notes.get?input=` probe becomes `/api/notes?input=`, with its expected line the same.
- `packages/hooks/README.md`: the sentence that a hook never imports `@pem/api`.
- `docs/engineering/tech-stack.md`: the `@trpc/*` row and the `@tanstack/react-query`, `superjson` row. `docs/engineering/codebase-conventions.md` §4: the `@pem/api` row.

## Variables

None. The module reads no environment: the route hands it the app's sources, built from `env.ts`.

## Dependencies

`@pem/api`, `@trpc/server`, `@trpc/client`, `@trpc/tanstack-react-query`, `@tanstack/react-query` and `superjson`, all of them in `packages/api/package.json`. After deleting the folder and the app's entry, run `yarn install` so `yarn.lock` drops them.

## Boundaries entries

In `packages/config/eslint/boundaries.js`: the `workspacePackage("api", "api")` line in `ELEMENTS`, the `api` entry in `PACKAGE_IMPORTS`, the `"@trpc/*"` entry in `SDK_OWNERS`, and `FORBIDDEN_EDGES` with the loop under it. In the `TRANSPORT_FREE` comment and `TRANSPORTS`, drop `@trpc/*` and the tRPC wording, and end the transport message at "the app". Remove `api` from the layer-order comment. In `tooling/boundaries.test.ts`, delete the probes that name `@trpc/*` or `@pem/api`, the STK-13 `@trpc/server` probe included.

## Vendor-side steps

None: tRPC is a library, with no account, key or dashboard.

## Verify

1. In `toolkit.json`, set `"removed": true` on the `api` entry of the `stack` block.
2. `yarn check-stack` exits 0: no listed file, variable or dependency of the module is left.
3. `git grep -il trpc -- apps packages tooling` prints nothing.
4. `yarn verify` exits 0.
