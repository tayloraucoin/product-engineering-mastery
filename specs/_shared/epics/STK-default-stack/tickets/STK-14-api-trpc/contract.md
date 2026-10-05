---
id: STK-14
size: small
objective: "@pem/api on tRPC, transport only, on by default and removable by runbook."
slice_type: "API transport; the risk is logic leaking into procedures or a removal that breaks the build."
non_negotiables:
  - "tRPC 11 pinned exact; @trpc/tanstack-react-query, not the classic client."
  - "Every procedure body is one service call; public, protected and admin tiers; one error mapper."
  - "Context resolves a cookie session and a bearer token to the same ctx.user."
  - "hooks never imports api; query hooks live in @pem/api/react."
  - "Webhooks, AI streaming, cron and auth callbacks stay Route Handlers."
  - "remove-api.md lists every file, variable and dependency; the manifest entry matches."
devs_call: "Router file layout and the provider's placement in the layout."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-8"
  - "D-STK-16"
  - "D-STK-13"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers: []
planned_paths:
  - "packages/api/**"
  - "apps/web/app/api/trpc/**"
  - "apps/web/lib/trpc/**"
  - "apps/web/app/layout.tsx"
  - "apps/web/package.json"
  - "packages/config/eslint/boundaries.js"
  - "toolkit.json"
  - "docs/runbooks/remove-api.md"
  - "docs/engineering/tech-stack.md"
  - "docs/engineering/codebase-conventions.md"
  - "apps/web/lib/supabase/context.ts"
  - "apps/web/next.config.ts"
  - "tooling/boundaries.test.ts"
  - "yarn.lock"
depends_on:
  - STK-13
out_of_scope:
  - "Subscriptions and streaming over tRPC."
  - "A React Native client."
criteria:
  - id: C1
    statement: "A cookie session and a bearer token resolve to the same ctx.user; a protected procedure refuses an anonymous caller and an admin procedure a non-admin."
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "Domain errors map to NOT_FOUND, FORBIDDEN, CONFLICT and BAD_REQUEST."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "The boundaries matrix declares no edge from hooks to api, and lint passes."
    evidence: check
    command: "yarn lint:boundaries"
  - id: C4
    statement: "Build passes with the route and provider mounted."
    evidence: check
    command: "yarn verify"
  - id: C5
    statement: "Following remove-api.md on a scratch copy leaves grep for trpc empty and verify green."
    evidence: manual
    reason: "a removal rehearsal on a copy is done by a person"
tier: 1
---

# Contract — STK-14 api-trpc

## Notes

Verify tRPC and adapter versions on the day and date them in the as-built.
