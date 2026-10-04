# C5 — a staging sign-in on localhost redirects back to localhost

Handed to the operator: it needs the hosted staging Supabase project and a real inbox.

## What the agent checked (2026-10-04, Next 16.3.8, @supabase/ssr 0.12.7)

- With a synthetic staging URL and key on the local tier, `GET /auth/callback` with no code, a bad code and a `token_hash` each answered 307 to `http://localhost:3000/auth/sign-in?state=expired`; `next=//evil.example.test` did not leave localhost.
- The sign-in form, posted to an unreachable project, landed on `?state=error`; the address appeared in neither the URL nor the log.
- `afterSignInUrl` and `callbackUrl` are unit-tested (`packages/auth/src/redirect.test.ts`).

## Steps for the operator

1. In the staging project's dashboard, Authentication, URL Configuration: add `http://localhost:3000/auth/callback` to the redirect URLs. Email sign-in (magic link) stays on. Under Authentication, Rate Limits, confirm the email-sending limit is set: the sign-in form sends to any address it is given, so that limit is what caps abuse, and wiring custom SMTP raises it.
2. In `apps/web/.env.local`: `DATABASE_ENVIRONMENT=local`; `NEXT_PUBLIC_SUPABASE_URL_LOCAL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_LOCAL` set to the staging values (Mode A).
3. Start the local database and the app, then open `http://localhost:3000/auth/sign-in?next=/`.
4. Enter an inbox you control and press "Email me a sign-in link". The page shows "Check your email for a sign-in link."
5. Open the link in the same browser.

## What should be seen

- The link passes through the staging project and lands on `http://localhost:3000/auth/callback?code=…`, then on `http://localhost:3000/`, never on the staging site URL.
- DevTools shows a `sb-<staging ref>-auth-token` cookie for localhost.
- With the local database up, the user's row appears in the local `public.users` (STK-11's C4 shares this step).
