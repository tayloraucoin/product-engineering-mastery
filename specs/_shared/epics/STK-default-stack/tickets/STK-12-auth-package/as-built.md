# As-built — STK-12

## Shipped against the contract

- C1: `packages/auth/src/context.ts`, `createAuthContextResolver`, returns `{ userId, email, role }` from `getUser()` and nothing else. `role` comes from `app_metadata.role` when it is `user` or `admin` (`APP_ROLES` from `@pem/db/rls`), and is `user` otherwise; `user_metadata` is never read. A `getUser()` error, a missing user or a throw makes the request anonymous (`null`). `context.test.ts` builds a real `@supabase/ssr` server client over a forged session cookie that claims an admin: `getSession()` returns that admin, the stubbed Auth server answers `/auth/v1/user` with 401, and the seam returns `null`. When the server returns the user, the seam takes the role from the server's answer, not from the cookie.
- C2: `updateSession` (`session.ts`) first deletes every cookie named `sb-<ref>-auth-token…` (chunks `.N`, `-code-verifier`, `-flows-code-verifier`, `-flow-<id>-code-verifier`) whose ref differs from the configured project's. Then it calls `getUser()` to refresh. Every write reaches the store as one growing batch, so `proxy.ts` rebuilds its response without dropping the purge. `session.test.ts` covers staging cookies on the local stack and the reverse, the project's own cookies kept, and an unrelated `sb-` cookie kept. Checked live on 2026-10-04 with a synthetic staging URL (`evidence/live-checks.md`): the `sb-127-*` cookies were deleted on the next request; the project's own cookie and `pem-probe` stayed. `config.test.ts` reads the storage key off a client built by the installed SDK and asserts it equals `authCookieStem(url)`, so an SDK bump that renames the cookie fails the suite instead of looping users through sign-out.
- C3: `boundaries.js` adds the `auth` element (`config`, `db`, `observability`) and `"@supabase/*": "auth"` in `SDK_OWNERS`. `tooling/boundaries.test.ts` gains six probes: `@supabase/*` refused in `db` and in `apps/web`; `@pem/auth` refused in `db` and `email`; allowed in `auth` and in the app.
- C4: `yarn verify` passes. `check-client-bundle` plants `SUPABASE_SERVICE_ROLE_KEY` and its `_LOCAL` and `_STAGING` forms, now read by `apps/web/env.ts`, and finds no sentinel. The bundle check cannot see a secret placed in a `NEXT_PUBLIC_` name, so env.ts also refuses one in `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `publicKeyProblem` (`config.ts`) rejects an `sb_secret_` key or a JWT whose `role` is `service_role`. It is tested in `config.test.ts`, and a build with `sb_secret_synthetic` there exits 1 naming the variable (`evidence/live-checks.md`). This answers warden's Blocking finding.
- Non-negotiables:
  - Factories: `server.ts`, `browser.ts`, `admin.ts` and `session.ts`. The admin client is built with `persistSession`, `autoRefreshToken` and `detectSessionInUrl` all false (`admin.test.ts`).
  - Refresh: only `apps/web/proxy.ts` calls `updateSession`.
  - Browser client: `apps/web/lib/supabase/client.ts` builds from `env.NEXT_PUBLIC_*`. In the browser those are the literals `process.env.NEXT_PUBLIC_SUPABASE_URL` and `…_PUBLISHABLE_KEY`, inlined from `next.config.ts`'s env block.
  - Client-safe subpaths: `./config`, `./browser` and `./redirect` import no server module, no built-in and no workspace package. `client-safe.test.ts` walks their imports and fails on any server subpath, and every export is classed as client-safe or server.
  - Server subpaths: `./server`, `./admin`, `./session` and `./context` each open with `import "server-only"`, so a client component that imports one fails the build. The package's tests run with `--conditions=react-server`, where that import is empty. `proxy.ts` runs with it (checked live).
- devs_call:
  - Cookie helper shape: `CookieStore = { getAll(): Cookie[]; setAll(cookies, headers) }`. `headers` carries Supabase's no-store headers, which `proxy.ts` sets on the response.
  - Redirect rules (`redirect.ts`): the origin is always env.ts's site URL, which is localhost outside a deployment. The request's Host header is never used. `next` must be a path starting with one `/`, with no backslash or control character; anything else becomes `/` (`redirect.test.ts`).
- App wiring:
  - `lib/supabase/context.ts`: `getAuthContext()`, wrapped in React `cache`.
  - `lib/supabase/local-mirror.ts`: the Mode A mirror. It runs only off a deployment, on the local tier, with a non-loopback auth URL, through `applyLocalAuthMirror(getDb(...).$client, user)`. A 23505 is logged and the request served.
  - `app/auth/callback/route.ts`: accepts a PKCE `code` or a `token_hash` plus `type`. On a tier with no project it sends the browser to the plain sign-in page, which says sign-in is not set up, rather than calling the link expired.
  - `app/auth/sign-in/`: one page with an email link. `?state=` takes `loading`, `sent`, `invalid`, `error` and `expired`. Without a project the page says sign-in is not set up. All six were checked in the browser on 2026-10-04 (`evidence/live-checks.md`).
- Versions: `@supabase/ssr` 0.12.7, `@supabase/supabase-js` 2.117.2 and `server-only` 0.0.1, pinned exact (verified 2026-10-04). Also in this ticket: the manifest's `auth` entry, both removal runbooks, the conventions row and the tech-stack rows. `server-only` is not in the manifest's `auth` dependencies, because `apps/docs` uses it too and `check-stack` would then fail a correct removal (vigil).

## Deviations

- **[ASSUMPTION] A new variable, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** (with its `_LOCAL` and `_STAGING` forms), in `.env.example`, `turbo.json`, env.ts and the manifest. The browser and server clients need a public key, and no variable carried one. It takes Supabase's `sb_publishable_` key or the legacy anon key. The name is easy to change until a product ships it.
- **[ASSUMPTION] Auth is optional per tier.** Without the URL and the publishable key, `supabaseConfig` is null. The proxy then passes requests through, `getAuthContext()` returns null, and the sign-in page says sign-in is not set up. That way CI and a fresh clone build without a Supabase project.
- **"Once per user per process" is keyed on id and email.** A user whose mirror settled is not mirrored again until restart or an email change. A refusal or a failure is retried on the next request, and concurrent first requests share one call. STK-11's 60 s cache stays underneath, but no longer restores a database wiped under a running dev server: that now needs a dev server restart.
- **`@pem/auth` imports `@pem/db`** for `APP_ROLES`, so `AuthContext.role` and the RLS bridge's role share one definition. `remove-supabase-database.md` gains "When auth stays", which inlines the roles when the database goes.
- **`apps/web/env.ts` now reads `DATABASE_URL`**, used only by the Mode A mirror. It is validated as a non-empty string, because check-client-bundle plants a sentinel; `@pem/db` validates the URL when it connects.
- **The proxy calls `getUser()`, not `getClaims()`.** That is one Auth round trip per page request, on top of the seam's. It keeps one rule, getUser everywhere, at a known latency cost. A product with asymmetric JWT keys can switch the proxy to `getClaims()`.
- **The sign-in page has no `empty`, `partial` or `offline` state.** A form with no data has none of them, so those values render the default form. Its own states are the five above. The `loading` state is real: a client leaf (`_components/send-link-button.tsx`) reads `useFormStatus`.
- **The email input is a native `<input>` in the route's `_components/email-field.tsx`.** `@pem/ui` has no input yet. A second consumer moves it to `@pem/ui`.
- **The sign-in form sends a link to any address.** Supabase's per-project email rate limit is the cap on abuse. `.env.example` and the C5 operator steps now name that setting, since custom SMTP raises the default (warden Should-fix).
- **Not done from the reviews:**
  - A log in `lib/supabase/server.ts`'s cookie-write catch: in a Server Component that catch runs on every render that would refresh, so a log there is noise. A Route Handler or Server Action can write cookies, so the catch never fires there.
  - Sign-out: drafted as STK-24 (warden Consider).
  - The browser client and the admin client still have no consumer, so their inlining path is proven by reading only (mason Consider).
- **C1 and C2 report 106 and 105 tests** for one `yarn test` at one head. C2 replayed turbo's cache with interleaved output, and the counter lost a line; no test was skipped (both logs show 0 skipped).
- **Paths added to `planned_paths`:** `apps/web/package.json`, `yarn.lock`, `tooling/boundaries.test.ts`, `docs/engineering/tech-stack.md`, `docs/engineering/codebase-conventions.md` and `docs/runbooks/remove-supabase-database.md`. `@pem/observability` was added to the app's dependencies and `transpilePackages`, since the sign-in action logs through it.

## Not verified

- C5 (manual, deferred to the operator): a real staging sign-in on localhost returning to localhost. It needs the hosted staging project, its redirect URL list, and an inbox. Steps: `evidence/C5-operator.md`. The redirect rules it rests on are unit-tested and were probed live against a synthetic project.
- Session refresh against a real expiring token. No test reaches a live Auth server.
- The Mode A mirror call from the seam has run only in unit tests with a stub mirror. The end-to-end path is STK-11's C4.

## Next

Taylor adds `http://localhost:3000/auth/callback` to the staging project's redirect URLs and runs C5 with STK-11's C4. STK-13 builds `validators` and `services`, which take the `AuthContext`.
