# Product Engineering Mastery

A universal product-engineering toolkit and the repo that proves it. No product lives here.

- **The practice** people and coding agents build by: roles, a design canon, templates, decisions, primer prompts.
- **A library** loaded on demand.
- **A demo app** that proves both.

Clone it and run it. A product starts as a duplicate of it, then removes what it does not use.

## Where to start

| You are                      | Open                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| A person                     | [`docs/README.md`](docs/README.md), organised by the question you arrive with      |
| Asking how the layers relate | [`docs/index.md`](docs/index.md), the map agents read                              |
| An AI agent                  | [`AGENTS.md`](AGENTS.md), the contract; `CLAUDE.md` imports it and `docs/index.md` |

This README only gets you running.

## Prerequisites

| Tool | Version | Set up                                 |
| ---- | ------- | -------------------------------------- |
| Node | 22      | `.nvmrc` (`nvm use`)                   |
| Yarn | 4.13.0  | `corepack enable`, then `yarn install` |

## Run it

```sh
yarn install
yarn doctor       # is this machine ready? names the fix for anything broken
yarn docs:dev     # the practice as a site, at http://localhost:3001
yarn web:dev      # the demo app, at http://localhost:3000
yarn verify       # everything CI runs
```

### On a phone

- `yarn web:dev:local` binds the demo app to every interface and prints its LAN URLs.
- Open one on a phone on the same Wi-Fi.
- `apps/web/next.config.ts` lists the same addresses in `allowedDevOrigins`, which Next.js 16 needs before it serves the client scripts to another origin.

### Contrast

- `yarn contrast-audit` checks the preset's token pairs, light and dark, against WCAG 2.2 AA: 4.5:1 for text, 3:1 for the focus ring.
- It runs in `yarn verify`.
- A failing pair is fixed in `packages/config/tailwind/preset.css` by changing the raw step's lightness.

### Deploy

`apps/web/vercel.json` builds the demo app on Vercel from the workspace.

- **You set:** the project's Root Directory to `apps/web`.
- **It installs** with Corepack and Yarn from the repo root.
- **It builds** through `turbo run build --filter=web`.

CI runs `yarn verify`, the same chain as a local run.

## The docs app

It reads the markdown in `docs/` directly.

- **Sidebar:** groups files by their `layer`.
- **Search** (press `/`): covers every file, including archived research.
- **Each page:** shows its frontmatter.

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

The rule is duplicate, then remove ([record 0010](docs/decisions/records/0010-starter-ships-default-stack.md)). A product repo:

1. Starts as a full duplicate of this one, default stack included.
2. Removes the modules it does not use.
3. Clears the toolkit's own content: the demo, `docs/research/`, `specs/`.

Follow [`docs/runbooks/new-project/README.md`](docs/runbooks/new-project/README.md); it ends on `yarn check-stack` and `yarn verify`.

**Status:** the guide is a draft until the dry-run ticket (STK-20) times it on a duplicate.
