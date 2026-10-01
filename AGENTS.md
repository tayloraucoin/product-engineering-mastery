# Product Engineering Mastery — Agent Instructions

**This file is the canonical instruction spine for every agent (Claude Code, Cursor, any other).** `CLAUDE.md` is a one-line `@AGENTS.md` pointer — shared guidance is edited **only here**.

## Start here

1. **What this is:** a Yarn 4 + Turborepo monorepo that is both the reference implementation of the house product-engineering conventions and the starter a new product is cloned from. Two Next.js apps (`apps/web`, `apps/docs`) and two `@pem/*` packages (`config`, `ui`). No product logic.
2. **Read before coding, in order:** this file → [`docs/architecture/codebase-conventions.md`](docs/architecture/codebase-conventions.md) → [`docs/architecture/tech-stack.md`](docs/architecture/tech-stack.md) → [`docs/decisions/TECHNICAL-DECISIONS.md`](docs/decisions/TECHNICAL-DECISIONS.md).
3. **Verify the way CI does:** `yarn verify` (format · lint · boundaries · types · build).
4. **State the exact file paths before implementing.** Placement is decided by one question — who imports this? — see conventions §1.

## Source precedence

When docs disagree, follow this order:

1. **Architecture & placement** → [`codebase-conventions.md`](docs/architecture/codebase-conventions.md). Stack and pins → [`tech-stack.md`](docs/architecture/tech-stack.md).
2. **Recorded decisions** → [`TECHNICAL-DECISIONS.md`](docs/decisions/TECHNICAL-DECISIONS.md). A later entry supersedes an earlier one and says so.
3. **Your judgment** fills every remaining silence — labeled as judgment, and recorded if it outlives the change.

## Hard guardrails

- **Never suppress a boundaries error.** If you need an upward or cross-app import, the boundary is wrong; refactor it or flag it.
- **`TECHNICAL-DECISIONS.md` is append-only** — never edit or delete prior entries.
- **No colour literals outside `packages/config/tailwind/preset.css`.** Components use token names.
- **Docs are markdown under `docs/`, read raw.** `apps/docs` renders them; it never owns content. Never put a doc inside `apps/docs`.
- **Do not scaffold empty seams.** A package, folder, or env module is created by its first real consumer, not in anticipation of one.

## Commands

Setup: Node **22** (`.nvmrc`), Yarn **4.13.0** (`corepack enable && yarn install`).

| Task                | Command                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| Verify (matches CI) | `yarn verify`                                                            |
| Dev servers         | `yarn dev` (all) · `yarn web:dev` (:3000) · `yarn docs:dev` (:3001)      |
| Per-task            | `yarn lint` · `yarn lint:boundaries` · `yarn check-types` · `yarn build` |
| Formatting          | `yarn format` (write) · `yarn format:check` (CI)                         |

Use **`yarn`**, never `npm` or `pnpm`.

## Monorepo map

| Path                                   | What                                                                                           |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [`apps/web/`](apps/web/)               | The product app. Empty home page — the product starts here.                                    |
| [`apps/docs/`](apps/docs/)             | Renders `AGENTS.md` and `docs/**/*.md` for reading in a browser.                               |
| [`packages/config/`](packages/config/) | `@pem/config` — ESLint (code quality + boundaries), Prettier, Tailwind tokens, tsconfig bases. |
| [`packages/ui/`](packages/ui/)         | `@pem/ui` — shared web components. Holds only what two or more apps import.                    |
| [`docs/`](docs/)                       | The documentation tree. Index: [`docs/README.md`](docs/README.md).                             |

## Import boundaries

Enforced by `yarn lint:boundaries` (root `eslint.config.mjs` + `packages/config/eslint/boundaries.js`). Layer order, low → high: `config` → `ui` → `apps`.

- **Apps → packages only.** No `apps/*` → `apps/*` imports. No package imports an app.
- **Workspace packages are referenced as `@pem/<name>`**, never by relative path across a package boundary.
- **Server Components are the default.** Client leaves: `"use client"` on line 1, in the route's `_components/`.

## Environment & tooling

- **TypeScript 5.9.2**, pinned exactly. Not TypeScript 7 — see `TECHNICAL-DECISIONS.md`.
- **Next.js 16 is not the Next.js you remember.** `middleware.ts` is now `proxy.ts`, `next/config` is gone, `params` and `cookies()`/`headers()` are async, and the caching defaults changed. Read the relevant guide under `node_modules/next/dist/docs/` before writing app code, and heed deprecation notices. Next's generator would write this warning into each app's `AGENTS.md`; it is disabled (`agentRules: false` in each `next.config.ts`) so the spine has one home.
- **Env:** no app reads environment variables yet. The first one creates that app's `env.ts`, which becomes the only `process.env` reader in the app (conventions §5).

## Keeping instructions in sync

- **This file is the only place shared agent guidance is written.** `CLAUDE.md` stays a one-line `@AGENTS.md` pointer.
- A new doc gets one line in [`docs/README.md`](docs/README.md); the docs app picks it up with no code change.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
