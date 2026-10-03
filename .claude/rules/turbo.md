---
paths:
  - "**/turbo.json"
---

# Turborepo 2.x

It may differ from your training data: read the installed docs (`node -p "require.resolve('turbo/package.json')"`, then its `docs/`) before changing `turbo.json` or a task command. Strict mode hides every environment variable a task does not declare; `TMPDIR` is passed through for the sandbox. The managed agent block is off (`agentGuidance: false`).
