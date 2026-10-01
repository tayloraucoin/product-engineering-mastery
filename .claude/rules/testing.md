---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/*.stories.tsx"
  - "**/playwright.config.*"
---

# Tests, stories and captures

- Tests assert behavior a user or caller can observe, never implementation details.
- One Storybook story per interactive state and per row of the product's `states.md`; the story name matches the state.
- Playwright captures run at 390, 834 and 1440 wide, light and dark, with reduced motion, for every `?state=` value. The critic scores only what was captured; an uncaptured state is UNVERIFIED (canon C-R01).
- Fixtures are seeded and realistic; never real customer data.
- Run tests and Playwright through `yarn` (`yarn playwright …`), never `npx`.
