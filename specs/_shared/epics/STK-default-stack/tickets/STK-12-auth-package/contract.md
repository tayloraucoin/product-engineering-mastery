---
id: STK-12
size: small
objective: "@pem/auth gives every request one AuthContext, with session refresh in proxy.ts."
slice_type: "Authentication; the risk is authorization from an unverified session or a secret in a client bundle."
non_negotiables:
  - "Server, browser, admin and updateSession factories; the admin client never persists a session."
  - "Authorization reads getUser, never the unverified session."
  - "One request seam returns AuthContext and calls the mirror once per user per process."
  - "Session refresh happens only in apps/web/proxy.ts; cookies of another project ref are purged on tier switch."
  - "The browser client reads inlinable NEXT_PUBLIC_* literals only."
  - "Client-safe subpaths carry no server import."
devs_call: "Cookie helper shape and the callback route's redirect rules."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-7"
  - "D-STK-16"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers:
  - assay
  - mason
  - threshold
  - vigil
  - warden
planned_paths:
  - "packages/auth/**"
  - "apps/web/proxy.ts"
  - "apps/web/lib/supabase/**"
  - "apps/web/app/auth/**"
  - "apps/web/env.ts"
  - "apps/web/next.config.ts"
  - ".env.example"
  - "turbo.json"
  - "packages/config/eslint/boundaries.js"
  - "toolkit.json"
  - "docs/runbooks/remove/supabase-auth.md"
  - "docs/runbooks/remove/supabase-database.md"
  - "docs/engineering/tech-stack.md"
  - "apps/web/package.json"
  - "yarn.lock"
  - "tooling/boundaries.test.ts"
  - "docs/engineering/codebase-conventions.md"
depends_on:
  - STK-11
out_of_scope:
  - "Sign-in UI beyond one minimal page."
  - "OAuth providers; configured in the dashboard, declared in .env.example only."
criteria:
  - id: C1
    statement: "The request seam returns the user and role from getUser and refuses a session whose user cannot be fetched."
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "updateSession purges cookies for a different project ref."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "Boundaries pass with @supabase/* owned by auth."
    evidence: check
    command: "yarn lint:boundaries"
  - id: C4
    statement: "The full chain passes with the Supabase service-role key among the server-only variables check-client-bundle seeds, and no sentinel in a client chunk."
    evidence: check
    command: "yarn verify"
  - id: C5
    statement: "A staging sign-in on localhost redirects back to localhost."
    evidence: manual
    reason: "needs the hosted staging project"
  - id: review:assay
    statement: Assay reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run assay <id>
  - id: review:mason
    statement: Mason reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run mason <id>
  - id: review:threshold
    statement: Threshold reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run threshold <id>
  - id: review:vigil
    statement: Vigil reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run vigil <id>
  - id: review:warden
    statement: Warden reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run warden <id>
qa: Q3
---

# Contract — STK-12 auth-package

## Notes

Carry the factory shapes from the audited repos, re-scoped; the app-local browser client exists because Next cannot inline dynamic reads.
