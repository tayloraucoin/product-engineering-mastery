---
id: WEB-14
size: small
objective: "apps/web has one next/headers cookie-jar adapter for Supabase, used by the server client and by the gate's Sign out, so the next session-touching Server Action reuses it instead of writing a third."
slice_type: "Refactor on the auth path; the risk is a sign-out that stops deleting the session cookies, or a Server Component render that throws on a cookie write."
non_negotiables:
  - "signOutHere still revokes through @pem/auth's one signOut and still logs auth.sign_out_unrevoked on failure."
  - "proxy.ts and app/auth/sign-out/route.ts keep their own adapters: they write to a request or a response, not the jar."
  - "A write in a Server Component stays a no-op, never a throw."
  - "@pem/auth gains no next import."
devs_call: "The function's name and whether it takes the store or awaits cookies() itself."
cites:
  - "D4"
truth_files: "none: no behaviour changes; the gate's Sign out does the same thing"
qa: Q3
reviewers:
  - warden
focus:
  - "signOutHere: every session cookie is still deleted on sign-out (warden)"
operator_review: false
planned_paths:
  - "apps/web/lib/supabase/cookie-store.ts"
  - "apps/web/lib/supabase/cookie-store.test.ts"
  - "apps/web/lib/supabase/server.ts"
  - "apps/web/app/experimental/[slug]/actions.ts"
  - "apps/web/eslint.config.mjs"
depends_on: []
out_of_scope:
  - "The proxy's and the sign-out route's adapters."
  - "Moving any cookie code into @pem/auth."
criteria:
  - id: C1
    statement: "nextCookieStore over a fake jar passes getAll through and applies every write; over a read-only jar a write is swallowed, not thrown."
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "No file in apps/web outside lib/supabase/ builds a SessionCookieStore over next/headers cookies(); the lint names lib/supabase/cookie-store.ts."
    evidence: check
    command: "yarn workspace web lint"
---

# Contract — WEB-14 next-cookie-store

## Build notes

- **Approach:** (audit: `specs/web/audits/2026-10-08-duplicated-logic.md`) lift the adapter in `lib/supabase/server.ts:17-27` (with its read-only guard) into `lib/supabase/cookie-store.ts`; `createSupabaseServerClient` and `signOutHere` (`actions.ts:170`) both call it. Add a `no-restricted-syntax` guard whose message names the new home.
- **Decisions that apply:** D-STK-7 (the proxy is the one place the session is refreshed); D-STK-16 (`@supabase/*` belongs to `@pem/auth`).
- **Interfaces:** `nextCookieStore(): Promise<SessionCookieStore>` (or over a passed store; dev's call).
- **Per path:** cookie-store.ts holds the adapter; its test covers both jars; server.ts and actions.ts call it; eslint.config.mjs carries the guard.
- **Gotchas:** the jar adapter drops Supabase's cache headers; a Server Action cannot set response headers through `cookies()`, so that is unchanged, not a regression. `server-only` stays on the module.
- **Model:** minimum and recommended Opus 5.5 at medium (ledger PR-22); a smaller model tends to fold the proxy's adapter in too, which breaks the refresh.
