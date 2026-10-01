# Product Engineering Mastery

Yarn 4 + Turborepo monorepo that is two things at once: the reference implementation of the house product-engineering conventions, and the starter a new product is cloned from. It carries the conventions of Synapse and Conscious Connections at their smallest size — two Next.js apps, two packages, no product.

**For AI agents:** [`AGENTS.md`](AGENTS.md) is the canonical instruction spine. (`CLAUDE.md` is a pointer to it.)

## Layout

| Path              | Role                                                                      |
| ----------------- | ------------------------------------------------------------------------- |
| `apps/web`        | The product app (`:3000`)                                                 |
| `apps/docs`       | Renders `AGENTS.md` and `docs/**/*.md` in the browser (`:3001`)           |
| `packages/config` | `@pem/config` — ESLint, Prettier, Tailwind tokens, tsconfig bases         |
| `packages/ui`     | `@pem/ui` — shared web components                                         |
| `docs/`           | The documentation, as markdown. Index: [`docs/README.md`](docs/README.md) |

## Prerequisites

- **Node 22** — `.nvmrc` (`nvm use`)
- **Yarn 4.13.0** — `corepack enable`, then `yarn install`

## Commands

```sh
yarn install
yarn dev          # both apps
yarn docs:dev     # read the docs at http://localhost:3001
yarn web:dev      # the product app at http://localhost:3000
yarn verify       # format · lint · boundaries · types · build — what CI runs
```

## Starting a new product from this repo

1. Copy the repo and rename it in the root `package.json`.
2. Replace the `@pem/` scope everywhere (`package.json` files, imports, `packages/config/eslint/boundaries.js`, `packages/config/prettier/index.js`).
3. Replace the token values in `packages/config/tailwind/preset.css`.
4. Record the fork as the first entry in `docs/decisions/TECHNICAL-DECISIONS.md`.
