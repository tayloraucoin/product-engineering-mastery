---
paths:
  - "**/package.json"
  - ".yarnrc.yml"
---

# Dependencies

- Before adding or bumping a dependency, add or update its row in `docs/engineering/tech-stack.md`: owner, expiry condition, ruling. No row, no dependency.
- Pin exactly. TypeScript is 5.9.2, not 7 (record 0003). One vendor per category.
- Use `yarn add`; the age gate (`.yarnrc.yml`) waits out the first days of a release, and that wait is never skipped.
