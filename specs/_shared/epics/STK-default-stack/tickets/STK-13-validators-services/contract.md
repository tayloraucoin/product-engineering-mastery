---
id: STK-13
size: small
objective: "Zod schemas shared by forms and procedures, and a transport-free service layer."
slice_type: "Business logic placement; the risk is logic welded to a transport."
non_negotiables:
  - "Precondition: Taylor answers routed call 3 (technical.md) before this ticket starts; declined, this contract and STK-21's services path are re-drafted."
  - "Drafted on the recommended answer: @pem/services is its own package below api; it imports no next/*, @trpc/* or react."
  - "Services take ctx with user, role and the RLS-scoped db, and validated input."
  - "Typed domain errors (NotFound, Forbidden, Conflict, Invalid) from one module."
  - "@pem/validators defines each shape once; services never redefine it."
  - "One example domain with create, read and list, used by STK-14 and STK-16."
devs_call: "Service function naming and the ctx type's exact fields."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-8"
  - "D-STK-1"
  - "D-STK-16"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers: []
planned_paths:
  - "packages/validators/**"
  - "packages/services/**"
  - "packages/config/eslint/boundaries.js"
  - "toolkit.json"
  - "docs/engineering/codebase-conventions.md"
  - "docs/engineering/tech-stack.md"
  - "tooling/boundaries.test.ts"
  - "yarn.lock"
depends_on:
  - STK-12
out_of_scope:
  - "Any transport: tRPC, Server Actions or route handlers."
  - "A second domain."
criteria:
  - id: C1
    statement: "Against a fake ctx, the example service throws NotFound when the scoped db withholds a row and Forbidden when a policy rejects a write; the policy itself is STK-9 C1's proof."
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "Invalid input fails at the validator with the field named."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "The boundaries matrix declares no edge from services to next, trpc or react, and lint passes."
    evidence: check
    command: "yarn lint:boundaries"
  - id: C4
    statement: "Types and build pass."
    evidence: check
    command: "yarn verify"
tier: 1
---

# Contract — STK-13 validators-services

## Notes

Routed call 3 is Taylor's to answer, not this ticket's; the as-built cites the answer it was built under.
