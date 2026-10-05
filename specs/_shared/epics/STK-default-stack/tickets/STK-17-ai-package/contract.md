---
id: STK-17
size: small
objective: "@pem/ai with the AI SDK and Anthropic, pre-configured for the standard cases, removable by runbook."
slice_type: "AI integration; the risk is a key in a client bundle or prompts scattered through apps."
non_negotiables:
  - "ai and @ai-sdk/* owned by ai; only services and the streaming route import it."
  - "Default model ids are constants in one file with the date they were chosen."
  - "Three standard cases wired: a structured extraction with a Zod schema, a streamed chat route, and a one-shot generate; each with an eval fixture."
  - "Prompts live in packages/ai/src/prompts with a version string."
  - "Local tier can run with a recorded fixture when no key is set."
  - "remove-ai.md and the manifest entry are complete."
devs_call: "Which eval runner and how fixtures are recorded."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-12"
  - "D-STK-16"
  - "D-STK-13"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers:
  - mason
  - vigil
  - warden
planned_paths:
  - "packages/ai/**"
  - "apps/web/app/api/ai/ai.ts"
  - "apps/web/app/api/ai/chat/route.ts"
  - "apps/web/next.config.ts"
  - "apps/web/package.json"
  - "yarn.lock"
  - "tooling/boundaries.test.ts"
  - "docs/engineering/codebase-conventions.md"
  - "packages/config/eslint/workspace-resolver.cjs"
  - "apps/web/env.ts"
  - ".env.example"
  - "turbo.json"
  - "packages/config/eslint/boundaries.js"
  - "toolkit.json"
  - "docs/runbooks/remove-ai.md"
  - "docs/engineering/tech-stack.md"
depends_on:
  - STK-13
out_of_scope:
  - "Langfuse or any LLM observability vendor."
  - "Agent loops and tool use beyond one example."
criteria:
  - id: C1
    statement: "Each of the three standard cases returns its expected shape from its recorded fixture; extraction's is Zod-validated."
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "A missing key on the local tier falls back to the fixture and never calls the vendor."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "The boundaries matrix declares no edge to ai from ui or from any apps/web file outside app/api/ai, and lint passes with the streaming route."
    evidence: check
    command: "yarn lint:boundaries"
  - id: C4
    statement: "Types and build pass with the streaming route mounted."
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
  - id: C5
    statement: "Before a key reaches a hosted tier: a monthly spend limit is set on each tier's Anthropic key, the account's data retention and training settings are checked against the privacy notice, and yarn workspace @pem/ai record has replaced the synthetic fixtures with recordings that pass their evals."
    evidence: manual
    reason: needs Taylor's Anthropic account and a staging key
tier: 2
---

# Contract — STK-17 ai-package

## Notes

Load the claude-api reference skill before pinning model ids; date every version.
