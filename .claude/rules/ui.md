---
paths:
  - "apps/*/app/**"
  - "apps/*/src/**"
  - "packages/ui/**"
  - "**/*.tsx"
---

# UI files

Before writing or reviewing UI, read, in order:

1. `docs/design/canon.md` — the universal floor (principles and the A-01–A-20 tells). The critic's rubric is `canon-rubric.md`; builders don't load it.
2. The product's design layer. In this repo that is `apps/web/docs/design/` (Phase 3); in a product repo, `docs/design/`.
3. The package for the feature (`specs/<feature>/package.md`), if one exists.

Then work only in the vocabulary in `AGENTS.md`: `@pem/ui` components, tokens, every state reachable by `?state=`. Motion follows canon C-P11. Need a reference? Go through `docs/references/index.md`, at most three files.

`apps/docs` is the toolkit's reader, not a product surface: it uses the tokens and `@pem/ui`, and the canon's product rules (states matrix, one primary action) do not bind it.
