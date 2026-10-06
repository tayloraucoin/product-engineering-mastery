# As-built — STK-24

## Shipped against the contract

- NN1: `apps/web/app/auth/sign-out/route.ts` exports `POST` only; Next answers a GET with 405. A form posts to `/auth/sign-out`.
- NN2, C1: `signOut` in `packages/auth/src/session.ts`, beside `updateSession`, calls `signOut` on the server client (`POST /auth/v1/logout?scope=local`), then deletes every Supabase session cookie the request carries that Supabase did not delete itself. It clears them even when Supabase fails or throws, and reports the failure's code. Tested in `session.test.ts`.
- NN3: the 303 carries the deletions, so the next request has no session cookie and `getAuthContext` returns null.
- The removal runbook (`remove/supabase-auth.md`) lists the route and `signOut`.

## Deviations

- [ASSUMPTION] The devs_call: local scope, this browser only. A shared device signed out does not sign the user out of their phone; global sign-out is a one-word option (`scope: "global"`) for an account-security page later.
- `signOut` lives in `@pem/auth`, not `apps/web/lib/supabase/`, because the package owns the session and the SDK (D-STK-7, D-STK-16), and its tests drive the real client against a fake Auth server. `session.ts` and `session.test.ts` were added to `planned_paths`.
- From Warden's review in the thread: a POST whose `Origin` is neither this request's origin nor the site URL's is refused with 403 (a same-site neighbour could otherwise force a sign-out); the callback's no-store redirect moved to `app/auth/redirect-no-store.ts` and both routes use it; Supabase's own cookie deletions are kept as written, so attributes such as a Domain are not replaced.
- Residual, accepted: when revocation fails (an Auth outage), the browser's cookies still go but the refresh token stays valid on Supabase until it expires; an access token already copied stays valid until its `exp` (an hour by default) wherever only its signature is checked. Both are logged or inherent to Supabase.

## Not verified

- C2 (manual, deferred): needs the hosted staging project. Steps in `evidence/C2-operator.md`, including replaying the old access token to prove the revocation itself.

## Next

Taylor runs C2 once the staging project exists. No page shows a sign-out control yet; the first signed-in surface adds the form.
