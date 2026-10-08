---
id: WEB-19
size: small
objective: "An agent about to write a helper is told to look first and can: yarn exists <word> prints matching exports from packages and app lib folders with each module's header line, and the TypeScript path rule says to run it."
slice_type: "Repo tooling and one path-rule line; the risks are output too long for a thread and a rule line that busts the path-rule budget."
non_negotiables:
  - "Nothing generated or committed: the command reads source each run."
  - "At most 20 result lines; each names the import path and the module's first header-comment line."
  - "The rule line is one line in .claude/rules/ts.md; the non-UI path-rule share stays within 1,500 tokens (yarn budget)."
  - "Tests, stories and fixtures are skipped."
devs_call: "Matching rules (export name, file name, header text); output format."
cites:
  - "Recommendation"
truth_files: "none: tooling only; no living UX file covers the repo's scripts"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "tooling/exists.ts"
  - "tooling/exists.test.ts"
  - "package.json"
  - ".claude/rules/ts.md"
  - "docs/engineering/tooling.md"
  - "docs/decisions/changelog.md"
depends_on: []
out_of_scope:
  - "A ledger file loaded by any rule."
  - "Changes to codebase-conventions §4."
  - "The per-shape lint guards (each ships with its fix: WEB-14 to WEB-17)."
criteria:
  - id: C1
    statement: "yarn exists slug over a fixture tree prints the matching export with its import path and header line, skips tests and stories, and caps at 20 lines."
    evidence: test
    command: "yarn test:tooling --test-name-pattern WEB-19"
  - id: C2
    statement: "The token budget passes with the new rule line."
    evidence: check
    command: "yarn budget"
---

# Contract — WEB-19 helper-finder

## Build notes

- **Approach:** (audit: `specs/web/audits/2026-10-08-duplicated-logic.md`) a Node script in `tooling/` that walks `packages/*/src` and `apps/*/lib`, finds `export function|const|class` whose name, file or header matches the word, and prints `@pem/<pkg>/<subpath>` (resolved from the package's `exports`) or the app path, plus the header's first line. One line in ts.md: "Before writing a helper, run `yarn exists <word>`; extend what it finds."
- **Decisions that apply:** docs/index.md's budget table (non-UI path rules 1,500); "nothing lives in two places".
- **Interfaces:** `yarn exists <word>`.
- **Per path:** exists.ts and its test; package.json script; ts.md line; tooling.md entry; changelog line.
- **Gotchas:** `packages/ui` has 151 modules; rank exact name matches first so the cap does not hide them.
- **Model:** Sonnet 5.5 is enough: small script with a fixture test.
