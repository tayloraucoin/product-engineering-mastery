---
id: STK-27
size: small
objective: "check-client-bundle proves a production Sentry DSN set in .env.local never reaches a local or staging bundle."
slice_type: "Observability isolation; the risk is local errors labelled production landing in the production project if Next's define ordering changes."
non_negotiables:
  - "The check plants a sentinel as NEXT_PUBLIC_SENTRY_DSN on a local-tier build and fails when it appears in any browser-facing file."
  - "It runs in yarn verify, beside the server-only sentinel scan, with no network."
  - "It names the reason in its failure message: env.ts collapses the DSN to the tier's own (STK-18)."
devs_call: "Whether the staging tier is built too, or the local build alone pins the ordering."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-4"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers: []
planned_paths:
  - "tooling/check-client-bundle.ts"
  - "tooling/check-client-bundle.test.ts"
depends_on:
  - STK-18
out_of_scope:
  - "Any change to env.ts's DSN resolution."
criteria:
  - id: C1
    statement: "A local-tier build with a planted NEXT_PUBLIC_SENTRY_DSN carries no trace of it in any browser-facing file, and the check fails when one does."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "The full chain passes."
    evidence: check
    command: "yarn verify"
qa: Q1
---

# Contract — dsn-bundle-pin

## Notes

From the sixth Warden review of STK-18 (Consider): `apps/web/env.ts` passes `sentryDsn ?? ""` in `nextConfigEnv` so Next cannot inline a production DSN from `.env.local` into a local bundle. That holds only because `next.config.ts`'s `env` block is applied after Next's own `NEXT_PUBLIC_*` inlining; nothing pins it. `check-client-bundle --scan <dir> --sentinel NAME=value` already has the mechanism.
