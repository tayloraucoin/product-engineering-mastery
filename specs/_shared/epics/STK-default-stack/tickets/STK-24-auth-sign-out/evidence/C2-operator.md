# C2: a staging session signed out on localhost is refused by getUser on the next request

Handed to the operator: it needs the hosted staging Supabase project, which does not exist yet (2026-10-05).

## What the agent checked (2026-10-05, @supabase/ssr 0.12.7, auth-js 2.117.2, Next 16.3.8)

- `signOut` sends `POST /auth/v1/logout?scope=local` with the session and deletes every session cookie, chunks and code verifier included, even when Supabase fails or throws (`packages/auth/src/session.test.ts`).
- On `next dev` (local tier, synthetic Supabase values): `GET /auth/sign-out` answers 405; a same-origin `POST` answers 303 to `/auth/sign-in` and the browser's `sb-…-auth-token` cookies are gone, an unrelated cookie kept; a `POST` with `Origin: http://evil.example` answers 403.

## Steps for the operator

1. With the staging project set up (`DATABASE_ENVIRONMENT=staging` and its Supabase URL and publishable key in `apps/web/.env.local`), run `yarn web:dev` and sign in at `http://localhost:3000/auth/sign-in` with a magic link.
2. In the browser's dev tools, copy the `access_token` out of the `sb-<ref>-auth-token` cookie (decode the `base64-` value).
3. Post the sign-out from the console on the same page: `await fetch("/auth/sign-out", { method: "POST" })`.
4. Reload any page: the request is anonymous (no `sb-` cookie is sent).
5. Prove the revocation, not only the missing cookie: call Supabase Auth with the copied token, `curl -H "apikey: <publishable key>" -H "Authorization: Bearer <access_token>" https://<ref>.supabase.co/auth/v1/user`. It must answer 401 or 403 (the session row is gone), not the user.

## What should be seen

- Step 4: the page renders as signed out.
- Step 5: an error status, not the user's JSON. Record it with the date.
