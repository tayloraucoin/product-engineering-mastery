---
title: "Convention log — postmortem findings that point at a convention"
description: "Append a row when a postmortem finding suggests changing a convention, rule or check; read before changing a convention, to see what the incidents proposed and what Taylor decided."
layer: runbooks
status: adopted
thread: "PEM"
role: Millwright
date: 2026-10-05
last_reviewed: 2026-10-05
supersedes:
load_when:
---

# Convention log

The working ledger Taylor reviews when changing conventions. One row per postmortem finding that suggests changing a convention. Append only: never edit or delete a row except to fill its Decision.

- **Date:** the postmortem's date.
- **Finding:** one sentence, linked to the postmortem it came from.
- **Points at:** the rule or check, by path and ID (`.claude/rules/ts.md`, a reviewer glob in `toolkit.json`, canon A-07, `tooling/check-specs.ts`).
- **Proposed change:** what to amend, in one sentence.
- **Decision:** `open` until Taylor rules; then `accepted` with the ledger ID and changelog date that made the change, or `declined` with the reason.

| Date | Finding | Points at | Proposed change | Decision |
| ---- | ------- | --------- | --------------- | -------- |
