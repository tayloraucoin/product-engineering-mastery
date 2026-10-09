---
id: DEMO-16
size: small
objective: "Every pull request that touches the demo, the kit, the tokens or the critic builds the demo, runs tk-ui-critic, stores the screenshot set, and fails on any Blocking finding or a missing key."
slice_type: "A CI workflow that carries a credential and a verdict parser; the risk is a job that skips instead of failing, a secret reachable from a fork, or a verdict misread as a pass."
non_negotiables:
  - "A separate .github/workflows/critic.yml; ci.yml stays free of the key, and yarn verify needs none (R4)."
  - "Triggered on pull_request only, never pull_request_target, path-filtered to apps/web/**, packages/ui/**, packages/config/tailwind/** and .claude/skills/tk-ui-critic/**."
  - "A missing ANTHROPIC_API_KEY fails the job with a message naming the secret; it never skips."
  - "The job runs yarn web:capture and the critic as the skill defines them, with the model pinned in the skill; it never reimplements either."
  - "tooling/critic-verdict.ts reads the review files and exits non-zero on any FAIL verdict, any Blocking finding, any UNVERIFIED key, or no review at all."
  - "The capture set and the reviews upload as a workflow artifact on every run, pass or fail."
devs_call: "How Claude Code is invoked headless in the job, caching, concurrency, and the artifact's retention."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/overview.md"
  - "D-DEMO-16"
truth_files: "none: CI changes no living UX file"
qa: Q2
reviewers:
  - vigil
focus:
  - "The fail paths: a missing secret, a Blocking finding, an UNVERIFIED key and an empty review each fail the job, never skip it (vigil, Q2)"
operator_review: false
planned_paths:
  - ".github/workflows/critic.yml"
  - "tooling/critic-verdict.ts"
  - "tooling/critic-verdict.test.ts"
  - "package.json"
depends_on:
  - DEMO-13
out_of_scope:
  - "Adding the repository secret: Taylor's alone (C5). The critic's procedure: DEMO-13."
criteria:
  - id: C1
    statement: "The verdict parser exits zero only for a set with every review PASS, no Blocking finding and no UNVERIFIED key, and non-zero for each of the other cases and for an empty set."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "On a pull request touching apps/web, critic.yml builds, captures, reviews, uploads the artifact and passes."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-016-critic-ci/evidence/ci-pass.txt"
  - id: C3
    statement: "A pull request carrying one planted Blocking defect fails the job and still uploads the artifact."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-016-critic-ci/evidence/ci-fail.txt"
  - id: C4
    statement: "With the secret absent the job fails and names ANTHROPIC_API_KEY."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-016-critic-ci/evidence/ci-no-key.txt"
  - id: C5
    statement: "The ANTHROPIC_API_KEY repository secret exists."
    evidence: manual
    reason: "Only Taylor can add a repository secret; the builder never sees or handles it."
---

# Contract — DEMO-16 critic-ci

## Build notes

- **Approach:** A workflow with one job: install, build `apps/web`, install Chromium, `yarn web:capture`, run the critic headless over every surface, then `node tooling/critic-verdict.ts` on the reviews. Upload `apps/web/.captures/` as the artifact with `if: always()`. The parser is pure and tested by `yarn test:tooling`.
- **Decisions that apply:**
  - D-DEMO-16: "The build fixes capture drift; the canvas stays locked: skeletons copy each width's final layout, static labels as text; rows grow with wrapped text; a disabled control dims its label and helper; a pending button keeps its width; dark spacing and scrim match light; the 390 foot link is in every state; raw widths become tokens."
  - R4 (technical.md, ratified by Taylor at the Tickets gate, 2026-10-08): "A separate `.github/workflows/critic.yml`, keeping `ci.yml` free of the key. It runs on `pull_request` only, never `pull_request_target`, path-filtered … It needs an `ANTHROPIC_API_KEY` repo secret, which only you can add. A missing key fails the job, never skips it. The model is the one the critic was calibrated on, pinned in the skill."
  - Brief pass list 6: "Critic CI builds the demo, runs the critic, fails on any Blocking finding and stores the screenshot set."
- **Interfaces:** `node tooling/critic-verdict.ts <dir>`; the workflow `critic`.
- **Per path:** `critic.yml`; `critic-verdict.ts` and its test (named by criterion); `package.json` only if a script is needed.
- **Gotchas:**
  - C2 to C4 need real PR runs on GitHub: push and open PRs only with Taylor's word, as the involvement says; C4 runs before the secret is added, C2 and C3 after.
  - Fork PRs never receive secrets under `pull_request`; that is the guard, not a bug.
  - Never echo the key; never pass it on a command line.
- **Model:** minimum Sonnet 5.5 at medium, recommended Opus 5.5 at medium. Choosing down tends to add `continue-on-error` or an `if: secrets…` skip, so a missing key reads green.
