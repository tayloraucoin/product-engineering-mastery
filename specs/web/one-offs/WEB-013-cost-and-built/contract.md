---
id: WEB-13
size: medium
objective: "Every ticket's cost is on record in its folder at close (yarn cost), and a ticket whose code is in but unproven reads as built rather than open (yarn contract:built), so the hardening stage has its instrument and its status word."
slice_type: "Repo tooling over a folder outside the repo; the risks are a count that double-counts a response, transcript text leaking into output or results.json, and a results.json rewrite that drops a field another writer set."
non_negotiables:
  - "One API call is one message id: records sharing a message id, in one file or across a resumed session's copies, count once."
  - "No transcript text is printed, stored or returned: only usage numbers, timestamps, ids, tool names, and work-id matches taken from tool inputs in memory."
  - "Every count printed names its rule; the attribution and the weights are labelled estimates."
  - "Only tooling writes results.json; the cost block and built_at survive every other writer's rewrite (contract:run, record, add, qa, review:run)."
  - "contract:run on a built ticket proceeds exactly as today."
  - "The hooks' behaviour and what review:run writes are unchanged."
devs_call: "The output line's wording, the classifier's command patterns, where helpers live inside tooling/cost.ts."
cites:
  - "R4"
  - "R9"
  - "Y3"
truth_files: "none: tooling only; no living UX file covers the repo's scripts"
qa: Q2
reviewers:
  - vigil
focus:
  - "the counting rule: once per message id, and no transcript text ever read into the thread or printed (vigil)"
operator_review: false
planned_paths:
  - "tooling/cost.ts"
  - "tooling/cost.test.ts"
  - "tooling/status.ts"
  - "tooling/contract.ts"
  - "tooling/contract-run.test.ts"
  - "tooling/lib/specs.ts"
  - "docs/engineering/schemas/results.schema.json"
  - "tooling/fixtures/specs/"
  - "package.json"
  - "docs/engineering/tooling.md"
  - ".claude/rules/specs.md"
  - ".claude/skills/tk-batch/SKILL.md"
  - "docs/decisions/changelog.md"
  - "specs/web/one-offs/WEB-013-cost-and-built/"
depends_on: []
out_of_scope:
  - "A dashboard, a per-call log file, or any stored per-call data."
  - "Changing what review:run records, or any hook's behaviour."
  - "The hardening stage file and tk-batch's harden verb (R9's prose)."
criteria:
  - id: C1
    statement: "yarn cost <id> and --epic over a synthetic transcript folder (two sessions, one resumed copy, one reviewer subagent) count each message id once, weight at 1, 1.25, 0.1, 5, attribute by the last ticket named in a work command in the thread, classify by first tool into the eight categories, and print one line naming its rules and no transcript text."
    evidence: test
    command: "yarn test:tooling --test-name-pattern WEB-13"
  - id: C2
    statement: "yarn cost <id> --record writes a cost block into results.json that the schema accepts and later contract:run and record keep; yarn status <id> prints it."
    evidence: test
    command: "yarn test:tooling --test-name-pattern WEB-13"
  - id: C3
    statement: "yarn contract:built <id> records built_at; yarn status, _status.md and the brief line show the ticket as built until a criterion is recorded after it, and contract:run on a built ticket proceeds as today."
    evidence: test
    command: "yarn test:tooling --test-name-pattern WEB-13"
  - id: C4
    statement: "The specs fixtures for a cost block and a built ticket in the brief line behave, and the tooling types pass."
    evidence: check
    command: "yarn check-types:tooling"
---

# Contract — WEB-13 cost-and-built

## Build notes

- **Approach:** `tooling/cost.ts` finds `~/.claude/projects/<slug>*/` (slug: every non-alphanumeric of the repo path as `-`, as Claude Code names it; `PEM_COST_TRANSCRIPTS` points the tests at a fixture folder), reads every `*.jsonl` below it line by line, keeps per assistant record only message id, session id, sidechain flag, timestamp, usage and the first tool's name plus a work-id match or a path class from its input, and drops the rest in memory. Messages are grouped by id across all files (once per message id), walked per thread in time order for attribution, classified by first tool, and summed. `--record` writes the block through `formatResults`.
- **Decisions that apply:** the second audit (`specs/_shared/reports/2026-10-07-second-token-and-speed-audit.md`, not a UX surface, so cited by ID only)'s "How this was measured" (attribution by segment; activity by first tool), the first report's weights (input 1, cache write 1.25, cache read 0.1, output 5; an estimate of cost, not the meter), R4 (the cost block at close; tk-batch's Cost line reads it), R9 (`status` gains "built" for a ticket whose code is in and whose criteria are unrecorded).
- **Interfaces:** `yarn cost <id> [--record]`, `yarn cost --epic <EPIC>`, `yarn contract:built <id>`; `results.json` gains optional `built_at` and `cost`; `ItemState.stage` gains `"built"`.
- **Per path:** `cost.ts` the script; `cost.test.ts` its tests and the built-stage tests; `lib/specs.ts` the types, `formatResults` carrying the new keys, the built stage, `formatTicketCost`; `status.ts` prints the cost block; `contract.ts` the `built` subcommand; the schema learns both keys; fixtures `pass-cost-block`, `pass-built-in-brief`, and `cost-transcripts/` (no `case.json`, so check-specs skips it).
- **Gotchas:** a resumed session copies earlier records into its new file, so dedupe globally, not per file; a subagent's records carry its parent's session id; `formatResults` rebuilds the object, so a key it does not name is lost on the next run; the folder sits outside the repo, so the real run is unsandboxed.
- **Model:** Opus 5.5 at medium; choosing down risks a count that is never run against the fixture.
