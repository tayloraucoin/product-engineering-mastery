# Technical Decisions (append-only)

One entry per architectural choice that had real alternatives, written when the decision is made. Never edit or delete a prior entry; reversing one is a new entry that names it.

```
## YYYY-MM-DD · <scope> · <the decision, as a statement>
**Context (as it was then):** …
**Options weighed:** A … B … C …
**Decision:** …
**Consequences:** what this buys, what it costs, what it forecloses.
**Revisit trigger:** the condition under which this should be reopened.
```

## 2026-10-01 · repo · This repository is both the conventions reference and the product starter, named `product-engineering-mastery`

**Context (as it was then):** Synapse and Conscious Connections share one convention set, copied by hand between them. A third product would copy it again. The owner also wants to study the conventions in a browser.
**Options weighed:** A — a starter only (`product-engineering-starter`), cloned and discarded. B — a reference repository that is also the clone source (`product-engineering-mastery`). C — extract shared `@lighthouse/*` packages that every product depends on.
**Decision:** B. The repository's lasting value is as the smallest correct example of the conventions; cloning it is the second use. C is rejected for now for the same reason Synapse rejected it: brand and schema isolation are worth more than shared code at two or three products.
**Consequences:** Buys one place where the conventions live in their smallest working form. Costs keeping it current as the product repos learn things. Forecloses nothing.
**Revisit trigger:** a convention fix that has to be applied to three repos by hand.

## 2026-10-01 · repo · Packages use the `@pem/*` scope

**Context (as it was then):** The house pattern is a short product scope (`@syn`, `@cc`). `create-turbo` defaults to `@repo`.
**Options weighed:** A — `@pem` (product-engineering-mastery). B — `@starter`. C — `@repo`.
**Decision:** A. It follows the house pattern, so the repository reads like the products it seeds. A clone renames it with one find-and-replace (README, "Starting a new product").
**Consequences:** Buys consistency with the product repos. Costs one rename per clone, which every option except C would also cost, and C still gets renamed in practice.
**Revisit trigger:** none expected.

## 2026-10-01 · repo · The toolchain is pinned to the house set — TypeScript 5.9.2, Node 22, ESLint 9 — not `create-turbo`'s current TypeScript 7 / Node 24 / ESLint 10

**Context (as it was then):** The repository was written by hand from the Synapse layout instead of scaffolded. `create-turbo` currently generates TypeScript 7, Node ≥ 24, and ESLint 10. Synapse recorded the same choice on 2026-09-04 (its INF-1 decision): `typescript-eslint` 8.x supports `< 5.10`, and `drizzle-kit` and Storybook 8 are validated against 5.9.
**Options weighed:** A — the scaffold's versions. B — the house versions.
**Decision:** B. A starter that pins different versions than the products it seeds becomes a second source of truth for what compiles.
**Consequences:** Buys known-good tooling shared with the product repos. Costs TypeScript 7's compile speed, which does not matter at this size.
**Revisit trigger:** the product repos bump TypeScript; this repository follows in the same week.

## 2026-10-01 · repo · Docs stay as markdown in the root `docs/`; `apps/docs` is a renderer over them, not the `create-turbo` example app and not a content home

**Context (as it was then):** `create-turbo` ships an `apps/docs` Next.js app. Synapse and Conscious Connections deleted it and kept a root `docs/` markdown tree that agents read raw. The owner wants both: house docs conventions, and the docs readable in a browser.
**Options weighed:** A — keep `create-turbo`'s `apps/docs` and write docs as pages inside it. B — move the markdown into `apps/docs`. C — markdown stays in root `docs/`; `apps/docs` statically renders it, rewriting relative `.md` links to routes.
**Decision:** C. The markdown files stay readable in an editor, on GitHub, and by agents, with no app knowledge needed; the browser view is derived and has no content of its own. A puts content behind JSX; B ties a docs path to a deployable app, and every product tool that reads `docs/` would need to know the move.
**Consequences:** Buys one source of truth with a browsable view. Costs a small renderer (`apps/docs/lib/docs.ts`, `app/_components/markdown.tsx`) and one cross-package build input (`$TURBO_ROOT$/docs/**` in `apps/docs/turbo.json`), without which an edited doc would serve a stale cached build. Links to repo files outside `docs/` render inert rather than broken.
**Revisit trigger:** the docs need search, versioning, or MDX components — at which point a docs framework (Fumadocs, Nextra) replaces the renderer, reading the same files.

## 2026-10-01 · repo · Start with two packages — `@pem/config` and `@pem/ui` — and the boundaries lint wired from day one

**Context (as it was then):** Synapse has eleven packages; most exist for a database, auth, and an API this repository does not have. `create-turbo` ships `ui`, `eslint-config`, and `typescript-config`.
**Options weighed:** A — `config` + `ui`. B — `config` only. C — the full Synapse layer set as empty packages.
**Decision:** A. `config` follows the house pattern of folding ESLint, Prettier, Tailwind, and tsconfig into one package with subpath exports. `ui` is justified by placement law: both apps import `buttonVariants` and `cn`. C would be empty seams. The boundaries lint costs one file now and is the enforcement every later package is born under.
**Consequences:** Buys the full shape of the house monorepo at its smallest size. Costs nothing a later package will not need anyway.
**Revisit trigger:** a third module with two consumers that does not belong in `ui` — that is the next package.
