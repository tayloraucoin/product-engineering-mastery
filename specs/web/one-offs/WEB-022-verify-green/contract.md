---
id: WEB-22
size: small
objective: "Four of the reds `yarn verify` hit on feature/conventions-setup turn green at their cause, so hardening and CI start from a known state."
slice_type: "Repo hygiene across tooling, test fixtures and spec folders; the risk is greening a check by weakening it instead of fixing what it caught."
non_negotiables:
  - "No test, check or rule is weakened: a fixture or list follows the code it describes."
  - "No DEMO behaviour changes; no research-shelf file is edited."
  - "MIG's as-builts, the budget rows and docs-readability.md's frontmatter are named, not touched."
devs_call: "How each cause is fixed, provided the check itself stays as strict."
cites:
  - "R2"
truth_files: "none: no behaviour changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "tooling/refs-pending.json"
  - "tooling/check-refs.ts"
  - "tooling/contrast-audit.test.ts"
  - "apps/web/e2e/capture.capture.ts"
  - "apps/web/playwright.config.ts"
  - "specs/**/.claude/"
depends_on: []
out_of_scope:
  - "MIG-2, 8, 9, 10 and 11's as-builts (another thread reconciles them)."
  - "The four budget rows over cap (another thread's)."
  - "the docs-readability intake file's missing frontmatter (the operator's)."
criteria:
  - id: C1
    statement: "check-refs resolves every reference: no pending entry that has landed, and a `yarn workspace` command is read as Yarn's built-in."
    evidence: check
    command: "yarn check-refs"
  - id: C2
    statement: "check-specs reports no stray .claude/ folder under specs/; its only remaining problems are MIG's as-builts."
    evidence: check
    command: "yarn check-specs"
  - id: C3
    statement: "The contrast-audit tests pass against a fixture that sets every audited token, counting the 63 pairs the audit checks."
    evidence: test
    command: "yarn test:tooling"
  - id: C4
    statement: "The repo-root ESLint run passes with no eslint-disable for a rule the boundaries config does not load."
    evidence: check
    command: "yarn lint:boundaries"
---

# Contract — WEB-22 verify-green

## Build notes

- **Approach:** one fix per red, at its cause (audit: `specs/_shared/reports/2026-10-08-third-token-and-speed-audit.md`, §i and R2). check-refs: drop the eleven pending entries that have landed (DEMO-3's design layer, P-C's skills), and add `workspace` to the checker's Yarn built-ins, beside `run` and `add`. check-specs: remove the empty `.claude/.cc-writes` folders under `specs/`. test:tooling: DEMO-2 (`90fc7b2`) added `--destructive-foreground` and four audit pairs; the test's synthetic preset gains the token in both themes and its counts read 63, as STK-25 did in `e79d262`. lint:boundaries: drop DEMO-6's two file-level disables, as DEMO-8 did in `2a429ca`; the env reads are test-run switches no turbo task hashes.
- **Decisions that apply:** none beyond the audit's recommendation 2.
- **Interfaces:** none.
- **Per path:** `refs-pending.json` loses eleven landed entries; `check-refs.ts` gains `workspace` in `BUILTIN_SCRIPTS`; `contrast-audit.test.ts` fixture and two counts; the two DEMO-6 files lose line 1.
- **Gotchas:** the `.claude/.cc-writes` folders are written by the agent harness when it writes into a folder [ASSUMPTION: inferred from their name and their shared 13:43 timestamp]; they may come back.
- **Model:** Opus 5.5; a smaller model tends to green the contrast tests by loosening the regexes.
