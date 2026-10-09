---
id: WEB-23
size: small
objective: "A dependent ticket starts once its predecessor is built (built_at), so the build pass, yarn status and yarn cost work as PR-21 says; yarn cost attributes a thread to the ticket its first prompt or title names, and a draft written in a thread does not take its calls."
slice_type: "A change to the start gate and to cost attribution in tooling; the risk is a gate that lets an unstarted or unbuilt predecessor through, or attribution that moves calls to the wrong ticket."
non_negotiables:
  - "A predecessor with no results.json, or with results and neither built_at nor every non-review criterion PASS, still refuses the start."
  - "PR-15 stays: a predecessor's reviews and as-built never hold the next ticket."
  - "No transcript text in any test fixture: synthetic records only."
  - "results.json is written only by tooling."
  - "No DEMO code changes; no DEMO ticket is hardened."
devs_call: "How a thread's seed ticket is read from its first prompt and title, and how a draft is told apart from work."
cites:
  - "PR-15"
  - "PR-21"
truth_files: "none: tooling only; no app behaviour changes"
qa: Q2
reviewers:
  - mason
focus:
  - "the start gate: a predecessor with no built_at still refuses exactly as before (mason)"
operator_review: false
planned_paths:
  - "tooling/contract.ts"
  - "tooling/cost.ts"
  - "tooling/contract-init.test.ts"
  - "tooling/cost.test.ts"
  - "docs/engineering/tooling.md"
  - "specs/web/one-offs/WEB-023-start-gate-reads-built/**"
depends_on: []
out_of_scope:
  - "The PR-15 rule that reviews and the as-built never hold the next ticket."
  - "Any DEMO code, and hardening any DEMO ticket."
  - "Editing any results.json by hand."
criteria:
  - id: C1
    statement: "contract:init starts a ticket whose predecessor has built_at and no recorded criteria, and still refuses one whose predecessor has neither built_at nor its criteria PASS, or has not started."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "yarn cost attributes a thread to the one ticket its first human prompt or session title names, from the thread's first call (synthetic transcript)."
    evidence: test
    command: "yarn test:tooling"
  - id: C3
    statement: "A contract:init --draft written inside a thread does not take that thread's later calls."
    evidence: test
    command: "yarn test:tooling"
  - id: C4
    statement: "DEMO-1 to DEMO-17 are started and marked built in dependency order, each with a cost block from yarn cost <id> --record; yarn status --epic DEMO shows 17 built."
    evidence: manual
    reason: "a one-time bookkeeping run through tooling; the yarn status --epic DEMO output is the evidence"
---

# Contract — WEB-23 start-gate-reads-built

## Build notes

- **Source:** `specs/_shared/reports/2026-10-08-third-token-and-speed-audit.md`, R1 and Y2, and its "How this was measured" cross-check.
- **Approach:** the gate in `init()` accepts a predecessor that has started and either has `built_at` or every non-review criterion PASS. `yarn cost` seeds each main thread's ticket from the one work-id its first human prompt names, else the one its last session title (`custom-title`) names, so attribution runs from the first call. A `contract:init … --draft` names nothing, and a ticket first drafted in a thread is not taken by that thread's later spec edits or commits; a real work command still is.
- **Decisions that apply:**
  - PR-15: "a dependency counts once built"; reviews and the as-built never hold the next ticket.
  - PR-21: "A ticket is built, seen, then hardened"; the build pass records no criteria.
  - R1 (audit): "Smallest fix: the gate accepts a predecessor with `built_at`."
- **Interfaces:** the `contract:init` refusal text for an unbuilt predecessor names `contract:built`; `yarn cost`'s attribution rule gains the seed and the draft rule.
- **Per path:**
  - `tooling/contract.ts`: the dependency gate.
  - `tooling/cost.ts`: seed from first prompt or title; drafts do not switch.
  - `tooling/contract-init.test.ts`, `tooling/cost.test.ts`: C1, C2, C3.
  - `docs/engineering/tooling.md`: the contract:init and cost entries.
- **Gotchas:** the gate must still refuse an unstarted predecessor; a prompt that names two tickets (as this ticket's does) seeds nothing; a subagent's first prompt is never a seed.
- **Model:** Opus 5.5 at medium; Sonnet 5.5 tends to loosen the gate to "any results.json" and miss the draft case.
