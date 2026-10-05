---
id: STK-26
size: small
objective: "@pem/ai's spend log, rate window and chat gate close the four considers Warden left on STK-17."
slice_type: "AI hardening; the risk is a spend record that over-counts, a rate map that only grows, and a gate whose safety rests on an unwritten cookie setting."
non_negotiables:
  - "[ai] vendor is logged only for a call that passed every check before the model, so the spend record means what README.md says."
  - "The per-user rate window drops a user's entry once it is empty, so the map is bounded by users active in the window."
  - "With no key on a hosted tier the chat route answers 503 without naming the configuration, and its test name says what it asserts."
  - "packages/ai/README.md states that the 401 gate assumes a same-site session cookie, and that a route behind sameSite none needs an origin check."
devs_call: "Whether the unconfigured 503 also waits for a signed-in user before reading the body."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-12"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers:
  - warden
planned_paths:
  - "packages/ai/**"
depends_on:
  - STK-17
out_of_scope:
  - "Scrubbing a provider error's request body before the error reporter, which belongs to STK-18's reporter (APICallError.requestBodyValues holds the chat transcript)."
criteria:
  - id: C1
    statement: "Tests show an over-long input logs no [ai] vendor line, an emptied rate entry is removed, and the unconfigured 503 body names nothing about the configuration."
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "Types, lint, build and tests pass."
    evidence: check
    command: "yarn verify"
qa: Q2
---

# Contract — ai-hardening

## Notes

From the fourth Warden review of STK-17 (all Consider). The fifth, the transcript in APICallError reaching the reporter, is out of scope here; raise it on STK-18.
