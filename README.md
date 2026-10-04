# Product Engineering Mastery

A universal product-engineering toolkit: the practice that people and coding agents build by (roles, a design canon, templates, decisions, primer prompts), a library loaded on demand, and a demo app that proves both. No product lives here. Clone it and run it; a product starts as a duplicate of it, then removes what it does not use.

**Start here, as a person:** [`docs/README.md`](docs/README.md), organised by the question you arrive with. **How the layers relate:** [`docs/index.md`](docs/index.md), the map agents read. This README only gets you running.

**For AI agents:** [`AGENTS.md`](AGENTS.md) is the contract; `CLAUDE.md` imports it and `docs/index.md`.

## Prerequisites

- **Node 22** — `.nvmrc` (`nvm use`)
- **Yarn 4.13.0** — `corepack enable`, then `yarn install`

## Run it

```sh
yarn install
yarn doctor       # is this machine ready? names the fix for anything broken
yarn docs:dev     # the practice as a site, at http://localhost:3001
yarn web:dev      # the demo app, at http://localhost:3000
yarn verify       # everything CI runs
```

The docs app reads the markdown in `docs/` directly: the sidebar groups files by their `layer`, the search box (press `/`) covers every file including archived research, and each page shows its frontmatter.

## Layout

| Path              | What                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `docs/`           | The practice, as markdown. Start at [`docs/index.md`](docs/index.md).                         |
| `apps/web`        | The demo app; holds the filled example of every template (Phase 3).                           |
| `apps/docs`       | Renders `docs/` in the browser.                                                               |
| `packages/config` | `@pem/config` — ESLint (code, boundaries, tokens), Prettier, Tailwind tokens, tsconfig bases. |
| `packages/env`    | `@pem/env` — the pure per-tier environment picker (STK-4).                                    |
| `packages/db`     | `@pem/db` — Drizzle on Supabase: schema, policies, migrations, setup SQL (STK-9).             |
| `packages/ui`     | `@pem/ui` — shared components.                                                                |
| `tooling/`        | The checks `yarn verify` runs, the hooks in `.claude/settings.json`, and `yarn doctor`.       |
| `.claude/`        | Path rules, generated subagents (`agents/`, never edited by hand), skills.                    |

## Starting a product from this repo

Duplicate, then remove ([record 0010](docs/decisions/records/0010-starter-ships-default-stack.md)): a product repo starts as a full duplicate of this one, default stack included, then removes the modules it does not use and clears the toolkit's own content (the demo, `docs/research/`, `specs/`). Follow [`docs/runbooks/new-project.md`](docs/runbooks/new-project.md); it ends on `yarn check-stack` and `yarn verify`. The guide is a draft until the dry-run ticket (STK-20) times it on a duplicate.
