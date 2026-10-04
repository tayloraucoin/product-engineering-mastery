---
id: STK-15
size: small
objective: "@pem/email sends through Resend with one well-made default template."
slice_type: "Transactional email; the risk is a brand value or address hard-coded, or a send on a local tier."
non_negotiables:
  - "resend owned by email in the boundaries lint."
  - "Local tier never sends; it logs the rendered message."
  - "From, reply-to and brand strings come from @pem/brand and env, never literals."
  - "One default HTML template in code; Resend dashboard templates are referenced by id in env."
  - "Email is a locked module: the manifest marks it locked and no removal runbook exists."
devs_call: "Template rendering approach (plain string or a small renderer)."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-12"
  - "D-STK-16"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers:
  - mason
  - vigil
  - warden
planned_paths:
  - "packages/email/**"
  - "packages/config/eslint/boundaries.js"
  - "toolkit.json"
  - ".env.example"
  - "turbo.json"
  - "apps/web/env.ts"
  - "docs/engineering/tech-stack.md"
  - "docs/engineering/codebase-conventions.md"
  - "apps/web/lib/email.ts"
  - "apps/web/package.json"
  - "apps/web/next.config.ts"
  - "apps/web/tsconfig.json"
  - "yarn.lock"
depends_on:
  - STK-4
  - STK-5
  - STK-7
out_of_scope:
  - "Supabase auth email customisation; a dashboard step in the guide."
  - "Marketing or bulk email."
criteria:
  - id: C1
    statement: "A send on the local tier logs and does not call the vendor."
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "The default template renders the brand name, from and reply-to from @pem/brand with no literal."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "Boundaries pass with resend owned by email."
    evidence: check
    command: "yarn lint:boundaries"
  - id: C4
    statement: "Types and build pass."
    evidence: check
    command: "yarn verify"
  - id: review:mason
    statement: Mason reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run mason <id>
  - id: review:vigil
    statement: Vigil reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run vigil <id>
  - id: review:warden
    statement: Warden reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run warden <id>
tier: 2
---

# Contract — STK-15 email-package

## Notes

Keep it small: one send function, one template, one example call from a service.
