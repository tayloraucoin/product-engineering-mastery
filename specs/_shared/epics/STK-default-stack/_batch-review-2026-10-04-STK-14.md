# Batch review — STK-14, 2026-10-04

Vigil subagent, fresh context, handed the contract, results, as-built, evidence and the changed-file list. Its reply, as returned:

## STK-14 batch review (tier 1), by Vigil

**Verdict: Pass with conditions.** The code meets every non-negotiable and I found no Blocking defect in STK-14's own lines. Two conditions before close: C4 must be re-proven, and C5 must be recorded honestly.

### How I checked it

I wrote the checklist from the contract and from D-STK-8, D-STK-13 and D-STK-16 before reading any code. Then I traced each item in the source. I did not run any command; everything below comes from reading the code and the recorded evidence.

Confirmed in code:

- **Pinning (NN1):** `packages/api/package.json:26-31` pins `@trpc/server`, `@trpc/client` and `@trpc/tanstack-react-query` exactly at 11.19.0. There is no `@trpc/react-query`.
- **Procedures and tiers (NN2):**
  - Each body in `routers/notes.ts:16-24` is one service call.
  - `trpc.ts:46-66` has the public, protected and admin tiers.
  - `errors.ts:27` is the only mapper, and `trpc.ts:37-44` applies it once, on the base procedure.
- **Same user by cookie or bearer (NN3, C1):** both `fromCookies` and `fromBearer` go through the one `createAuthContextResolver` (`apps/web/lib/supabase/context.ts:24,38-49`). The bearer path checks the token with Supabase through `getUser(token)`; it does not just decode it.
- **No hooks-to-api edge (NN4, C3):** `FORBIDDEN_EDGES` (`boundaries.js:117-121`) throws if any row gives `hooks` an edge to `api`. `@trpc/*` is owned by `api` (`boundaries.js:132`), and the probes at `tooling/boundaries.test.ts:112-131` and 236-242 cover it.
- **Other routes stay Route Handlers (NN5):** the Stripe webhook, `api/ai/chat` and `auth/callback` are separate routes, and none of them goes through the tRPC route.
- **Removal list (NN6):** `toolkit.json:325-339` matches `remove-api.md` on files, env (none), dependencies and boundaries. The runbook's edit list covers all 23 files under `apps`, `packages` and `tooling` that mention trpc, tanstack, superjson or `@pem/api`.
- **Error mapping (C2):**
  - The mapping and status tests (`errors.test.ts`) cover the HTTP 404, 403, 409 and 400 responses, the latter with `data.fields`.
  - A fault's message is replaced in production.

### Blocking

None.

### Should-fix

1. **C5 is recorded PASS, but the criterion wasn't met and the contract says a person does it.** (`results.json:55-66`)
   - The criterion reads "leaves grep for trpc empty and verify green". `evidence/C5.md:24-25,29` itself says `check-specs` and `check-client-bundle` still exit 1, so verify was not green.
   - The contract's reason is "done by a person", and `.claude/rules/specs.md` says such a criterion is recorded `--verdict deferred` and listed under Operator checks.
   - **What goes wrong:** `_status.md` shows STK-14 fully proven, so nobody re-runs the removal once STK-9 and STK-16 are fixed. A product that later runs `remove-api.md` is the first to find out whether verify really ends green.
   - **Fix:** re-record C5 as deferred, with the agent's rehearsal attached as supporting evidence. Owner: the builder.

2. **The documented client pattern needs a dependency the app doesn't have and the stack doc forbids.**
   - `packages/api/src/react.tsx:9-10` tells callers to write `useQuery(trpc.notes.list.queryOptions())`. But `@pem/api/react` does not re-export `useQuery` or `useMutation`.
   - `apps/web/package.json` does not list `@tanstack/react-query`, and `docs/engineering/tech-stack.md:58` rules it "`@pem/api` only".
   - **What goes wrong:** the Phase 3 notes page adds `import { useQuery } from "@tanstack/react-query"` in `apps/web`. It works only because the node-modules linker hoists the package, so the import is undeclared, and it breaks the tech-stack ruling.
   - **Fix, either of:**
     - re-export the query hooks from `@pem/api/react`, which matches NN4's "query hooks live in `@pem/api/react`";
     - or add `apps/web` as a consumer in tech-stack.md and in `apps/web/package.json`, and in the runbook's edit list.
   - Owner: the builder.

### Consider

3. **In dev and in the test run, a fault's message still reaches the client.** (`packages/api/src/trpc.ts:19-30`)
   - The formatter replaces `message`, but keeps `shape.data.stack`. tRPC adds the stack whenever `NODE_ENV !== "production"`, and the stack starts with the original text (for example `relation "notes" does not exist`).
   - The test at `errors.test.ts:143-151` checks only `message`. It runs without `NODE_ENV=production`, so the response it receives carries the same text in `data.stack`, and the test still passes.
   - Production is safe. But "whose message is not sent" is true there only.
   - **Fix:** drop `stack` when the code is `INTERNAL_SERVER_ERROR`, and have the test assert on the whole serialized body.

4. **A non-Bearer `Authorization` header signs out a cookie user.** (`packages/api/src/context.ts:48-53`)
   - Today any such header makes the request anonymous and the cookie is not read.
   - **What goes wrong:** on a staging site behind HTTP Basic auth, the browser adds `Authorization: Basic …` to every same-origin `fetch`. Every protected call then returns UNAUTHORIZED ("Sign in to do this.") to a user who is signed in.
   - The as-built logs this as a deliberate choice. A safe narrowing: fall back to the cookie only when the scheme isn't Bearer, and keep "a refused Bearer token never falls back".

5. **`ApiProvider` defaults to a relative URL.** (`packages/api/src/react.tsx:47`)
   - **What goes wrong:** a client component that calls `useSuspenseQuery` fetches during SSR, and `httpBatchLink` cannot fetch a relative URL on the server. The render fails.
   - The usual remedy is a `getBaseUrl()`, or a note that SSR prefetch goes through `createApiCaller` only.
   - Separately, the default repeats `API_ENDPOINT` (`server.ts:26`). Moving the constant into a small module both files can import would stop the two from drifting.

### Not a finding on STK-14's code, but holds the close

- **C4 is FAIL** (`results.json:43-53`, `evidence/C4.log`). `yarn verify` at `50fd186` stopped at format check on four CAT-9 files under `packages/ui/src/primitives/feedback/`, so build never ran in that recorded run. The as-built's build pass dates from `41b60f5`. C4 has to be re-proven green at batch close.

### Conversations (product experience; not defects)

- **Supabase Auth outage.** During an outage, `createAuthContextResolver` (`packages/auth/src/context.ts:100-104`) returns null when `getUser` throws. A signed-in user calling any protected procedure is then told "Sign in to do this.", when the real cause is on our side. Should an unreachable Auth service surface as a 503-style "We can't check your session right now", rather than as an anonymous user? The owner is the auth module from STK-13, not this ticket.

### Runtime checklist (a person, in order of risk)

1. Against local Supabase, call `/api/trpc/notes.list` with `curl` and a real access token (`Authorization: Bearer <jwt>`). Then call it from the browser with the same user's cookie session. Expect the same rows both times.
2. Send a forged Bearer token together with a valid session cookie. Expect a 401, not the cookie user's data.
3. Sign in as a user without the admin role and call an admin procedure (once one exists). Expect a 403.
4. In Phase 3, run the first `useTRPC().notes.list` through `ApiProvider` in a browser, light and dark. Confirm it hydrates without a second fetch inside 30 seconds.
5. Rehearse `remove-api.md` again on a copy once STK-9 and STK-16 are green, and confirm `yarn verify` exits 0.

**Verdict: Pass with conditions.** No Blocking issues. To close, re-prove C4 green, re-record C5 as deferred, and settle how the app imports `useQuery`.
