---
id: STK-24
size: small
objective: "A signed-in user can sign out, which revokes the session on Supabase and clears its cookies."
slice_type: "Authentication; the risk is a session that outlives sign-out on a shared device."
non_negotiables:
  - "Sign-out is a POST (a Server Action or Route Handler), never a GET a link prefetch could fire."
  - "It calls signOut on the server client, so the refresh token is revoked on Supabase, and the session cookies are deleted."
  - "After sign-out, getAuthContext returns null on the next request."
devs_call: "Local sign-out (this device) or global (every device) as the default scope."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-7"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers: []
planned_paths:
  - "apps/web/app/auth/**"
  - "apps/web/lib/supabase/**"
  - "docs/runbooks/remove/supabase-auth.md"
depends_on:
  - STK-12
out_of_scope:
  - "Account settings, session lists, or device management."
criteria:
  - id: C1
    statement: "The sign-out action calls signOut on the server client and deletes every session cookie of the project."
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "A staging session signed out on localhost is refused by getUser on the next request."
    evidence: manual
    reason: "needs the hosted staging project"
---

# Contract — STK-24 auth-sign-out

## Notes

Drafted from STK-12's warden review: the module that owns sessions shipped with no revocation path, and no ticket in technical.md's order claimed one.
