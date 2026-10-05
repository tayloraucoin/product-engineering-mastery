# As-built — STK-14

## Shipped against the contract

- C1: `packages/api/src/context.ts` gives a request one `ctx.user`.
  - A `Bearer` header goes to `fromBearer`; without one (no header, or another scheme such as HTTP Basic) the cookie session goes to `fromCookies`.
  - In the app both run through the one resolver in `apps/web/lib/supabase/context.ts`; `getBearerAuthContext` calls `getUser(token)` on a cookieless client.
  - `src/trpc.ts` has three tiers: public; protected (UNAUTHORIZED without a user, and it adds `ctx.service`); admin (FORBIDDEN unless the role is admin).
  - `context.test.ts`, 7 tests, all on the real `@pem/auth` resolver:
    - a cookie session and a bearer token for one user resolve to an equal `ctx.user`;
    - a refused token is anonymous even beside a good cookie;
    - an empty Bearer token is anonymous beside a good cookie;
    - a Basic header leaves the cookie session to decide;
    - the tier refusals.
- C2: `src/errors.ts` is the one mapper. NotFound, Forbidden, Conflict and Invalid map to NOT_FOUND, FORBIDDEN, CONFLICT and BAD_REQUEST, run by the base procedure's middleware on the service's thrown cause.
  - `errors.test.ts`, 6 tests: the mapper; in-process through procedures; over HTTP through `handleApiRequest` and the real notes router, giving 404 for a row RLS withholds, 403 for `42501`, 409 for `23505`, 400 for a blank body with `data.fields.body`, and 500 for a fault, whose message and stack are not in the response body.
- C3: `boundaries.js` adds the `api` element and row (`config`, `observability`, `validators`, `auth`, `services`), `"@trpc/*": "api"` in `SDK_OWNERS`, and `FORBIDDEN_EDGES`. That last one throws at load if any row ever gives `hooks` an edge to `api`. `tooling/boundaries.test.ts` gains 6 probes: `@trpc/*` in the app is refused; services, auth and ui may not import api; api's own imports and the app's import of `@pem/api/server` pass.
- C4: `/api/trpc/[trpc]/route.ts` mounts `handleApiRequest`, and `ApiProvider` wraps the root layout's body inside `ThemeProvider`. `yarn build`, `check-types` and `lint:boundaries` pass at `41b60f5`; the full `yarn verify` runs at batch close.
- C5: deferred to a person (`evidence/C5.md`, listed under Operator checks). The agent's own rehearsal on a copy of HEAD is attached as support: the tRPC grep is empty, `check-stack` and `check-refs` pass, and no step fails that the removal touches.
- Non-negotiables:
  - tRPC 11.19.0 (`@trpc/server`, `client`, `tanstack-react-query`), with `@tanstack/react-query` 5.104.0 and `superjson` 2.2.6. All exact, verified on the registry 2026-10-04, all older than the 7-day age gate.
  - Each procedure body is one service call (`routers/notes.ts`).
  - Query hooks live only at `@pem/api/react`, which re-exports TanStack Query's hooks, so an app never declares `@tanstack/react-query`.
  - Webhooks, AI streaming, cron and auth callbacks stay Route Handlers.
  - The manifest has an `api` entry (not locked, `remove-api.md`).
- devs_call:
  - Routers: `src/routers/<domain>.ts`, merged in `src/root.ts`.
  - `src/trpc.ts` holds the instance and tiers, `src/server.ts` (`@pem/api/server`) the HTTP handler and `createApiCaller` for Server Components, and `src/react.tsx` the client.
  - The provider sits inside `ThemeProvider` and around the header and page, so every page can query.

## Deviations

- **[ASSUMPTION] `@trpc/*` is owned by api, not only `@trpc/server`** (D-STK-16 names the server package). The app reaches the client through `@pem/api/react`, so a stray `@trpc/client` import elsewhere is refused too. `@tanstack/react-query` has no owner: a future `@pem/hooks` may take a query client.
- **[ASSUMPTION] A Bearer header decides alone.** A refused or empty token never falls back to the cookie session, so a caller always gets the identity it sent. Another scheme is not the API's, so the cookie decides; a staging site behind HTTP Basic otherwise signed every user out (batch review, Consider 4).
- **[ASSUMPTION] superjson is the wire transformer**, so `createdAt` and `updatedAt` arrive as `Date`, as `noteOutput` declares (STK-13's open point).
- **A fault's message is replaced and its stack dropped**, in every environment, ("Something went wrong on our side. Try again.") and the cause is logged as `api.fault`. Domain errors keep their messages, and `data.fields` carries the failed fields from `Invalid` or the procedure's own zod parse.
- **Procedures parse input with the validator schemas too**, for the client's types. The service parses again, so the service stays the guarantee for any other transport.
- **Paths added to the plan:** `codebase-conventions.md` (its `@pem/api` row is now built), `lib/supabase/context.ts` (the bearer lookup shares the cookie resolver), `next.config.ts` (`transpilePackages`), `tooling/boundaries.test.ts`. `yarn.lock` was planned and then dropped: this ticket's lock entries arrived in other threads' commits, and every thread's install churns it.
- **`@tanstack/react-query` 5.104.1 was first pinned and moved to 5.104.0**: 5.104.1 was under the 7-day age gate and broke `yarn install` for the other threads.
- **The rehearsal found a gap in the runbook**: after the removal, `check-refs` named the deleted paths. `remove-api.md` Verify now parks them in `refs-pending.json`. The other removal runbooks likely share the gap; STK-20's dry-run covers them.
- **From the batch review (`../../_batch-review-2026-10-04-STK-14.md`):**
  - C5 is re-recorded as deferred (Should-fix 1).
  - `@pem/api/react` re-exports `useQuery`, `useMutation`, `useSuspenseQuery`, `useInfiniteQuery` and `useQueryClient` (Should-fix 2).
  - A fault's `data.stack` is dropped (Consider 3).
  - A non-Bearer header falls back to the cookie (Consider 4).
  - `API_ENDPOINT` lives in `src/endpoint.ts`, shared by the server and the provider, whose comment says server rendering reads through `createApiCaller` (Consider 5).
  - The review's Supabase-outage conversation belongs to `@pem/auth`, not this ticket.
- **Shared-checkout incidents:** another thread's commits swept in `tech-stack.md` and `yarn.lock` with this ticket's lines in them, and a stale rewrite of `toolkit.json` left a second `api` entry (removed, `41b60f5`). This ticket's `3ceeb8e` swept up STK-16's staged files, which STK-16 notes in its own as-built.

## Not verified

- C5 (manual, deferred): a person rehearses `remove-api.md` on a copy once STK-9 and STK-16 are green, since on the agent's copy `check-specs` and `check-client-bundle` still failed on their work.
- No browser call goes through `ApiProvider` yet. No page queries the API, so the client half is proven by types and the build only.

## Test changes

- `context.test.ts`: "a scheme other than Bearer, or an empty token, is anonymous" becomes two tests. An empty Bearer token stays anonymous, now beside a good cookie. A Basic header now leaves the cookie session to decide, the behaviour changed by Consider 4. No assertion was dropped: the Basic case asserts the opposite outcome on purpose.
- `errors.test.ts`: the fault test also asserts no `data.stack`, and no SQL in the whole response body.

## Next

The demo's first page that lists notes (Phase 3) calls `useTRPC().notes.list` through `ApiProvider` and proves the client half in a browser.
