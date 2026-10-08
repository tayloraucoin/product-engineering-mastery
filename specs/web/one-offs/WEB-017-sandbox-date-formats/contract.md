---
id: WEB-17
size: small
objective: "The sandbox's date, time and count formatters live in lib/sandbox/time.ts beside its one time zone, so a new admin table or reviewer screen imports a named formatter instead of writing an Intl call."
slice_type: "Refactor of display formatting, server and client; the risk is a hydration mismatch where a server-rendered date differs from the client's."
non_negotiables:
  - "Every rendered string is byte for byte what it is today, in each table and on the gate and ended pages."
  - "The hydration-safe pair keeps its rule: UTC and named before hydration, the reader's locale and zone after."
  - "time.ts stays pure, so client leaves may import it."
devs_call: "The formatters' names; whether the two client views' locale-parameter formatters fold in or stay."
cites:
  - "D3"
truth_files: "none: no rendered text changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/lib/sandbox/time.ts"
  - "apps/web/lib/sandbox/time.test.ts"
  - "apps/web/lib/sandbox/ended.ts"
  - "apps/web/lib/sandbox/admin-experiments.ts"
  - "apps/web/lib/sandbox/client/pin-list.ts"
  - "apps/web/lib/sandbox/client/pins-view.ts"
  - "apps/web/lib/sandbox/client/review-view.ts"
  - "apps/web/app/experimental/[slug]/_components/gate/gate-form.tsx"
  - "apps/web/app/admin/experiments/[slug]/codes/_components/codes-table.tsx"
  - "apps/web/app/admin/people/_components/people-table.tsx"
  - "apps/web/app/admin/data/_components/record-table.tsx"
  - "apps/web/eslint.config.mjs"
depends_on: []
out_of_scope:
  - "Changing any format, zone or locale (D-LAB-41 stands)."
  - "@pem/ui's calendar and chart formatting."
criteria:
  - id: C1
    statement: "Each named formatter gives the same string as the inline formatter it replaces, for a fixed instant in and out of British Summer Time, local and not local."
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "new Intl.DateTimeFormat or Intl.NumberFormat under apps/web/lib/sandbox or apps/web/app/admin outside time.ts fails lint, naming time.ts."
    evidence: check
    command: "yarn workspace web lint"
---

# Contract — WEB-17 sandbox-date-formats

## Build notes

- **Approach:** (audit: `specs/web/audits/2026-10-08-duplicated-logic.md`) add the formatters the audit lists (D3) to `lib/sandbox/time.ts`, de-duplicating the two identical `WHEN`s; each site imports its named one; a lint guard stops a new inline formatter.
- **Decisions that apply:** D-LAB-41 (the sandbox's one time zone is Europe/London; the gate's lock time and the ended date use the reader's locale and zone).
- **Interfaces:** named formatter functions exported from `lib/sandbox/time.ts`.
- **Per path:** time.ts gains them, its test pins the strings; every other path drops its inline formatter.
- **Gotchas:** module-level `Intl` instances are deliberate (built once); keep them module-level in time.ts.
- **Model:** Sonnet 5.5 is enough: a mechanical move pinned by string tests.
