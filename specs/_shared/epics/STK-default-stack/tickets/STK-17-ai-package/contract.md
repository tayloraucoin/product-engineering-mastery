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
reviewers: []
planned_paths:
  - "packages/ai/**"
  - "apps/web/app/api/ai/**"
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
    statement: "Structured extraction returns the Zod-validated shape from a recorded fixture."
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "A missing key on the local tier falls back to the fixture and never calls the vendor."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "Boundaries fail on an ai import from apps or ui."
    evidence: check
    command: "yarn lint:boundaries"
  - id: C4
    statement: "Types and build pass with the streaming route mounted."
    evidence: check
    command: "yarn verify"
---

# Contract — STK-0 ai-package

## Notes

Load the claude-api reference skill before pinning model ids; date every version.
