---
title: Codebase conventions
description: Read before placing, naming or importing any code, adding a package, or reading an environment variable; the placement, naming and package-graph contract.
layer: engineering
status: adopted
thread: scaffold
role: Mason
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: ui-build, spec
---

# Codebase Conventions

The placement, naming, and package-graph contract. It is written as imperatives so an agent holding only this file and a ticket places code the same way a person would. Where the code and this document disagree, one of them is a defect — fix whichever is wrong, in the same change.

Distilled from the Synapse and Conscious Connections conventions and scaled down to what this repository actually contains. A product cloned from here grows this document as it grows packages; it does not import the larger versions wholesale.

## 0. The rules

1. **Placement is decided by one question: who imports this?** (§1)
2. **Apps import packages. Packages never import apps. Apps never import each other.** Enforced by `yarn lint:boundaries`. (§4)
3. **Never suppress a boundaries error.** An upward import means the boundary is wrong.
4. **Server Components by default.** A client component is a deliberate leaf with `"use client"` on line 1. (§6)
5. **Tokens by name.** No colour literal outside `packages/config/tailwind/preset.css`. (§6)
6. **One `env.ts` per app is the only `process.env` reader** — created by the first variable, not before. (§5)
7. **Docs are markdown under `docs/`.** The docs app renders them and owns none. (§7)
8. **Decisions with real alternatives get a ledger line, and a record when the reason needs more than a line.** Records are immutable. (§7)
9. **No empty seams.** A package, folder, or module is created by its first real consumer.
10. **Verify before calling it done:** `yarn verify`.

## 1. Placement: who imports this?

- **One consumer → co-locate** it next to that consumer. A component used by one route lives in that route's `_components/`; a helper used by one app lives in that app's `lib/`.
- **Two or more consumers → extract** to a package. A component both apps render goes to `@pem/ui`.
- **Moving later is a one-time cost; packaging early is a cost paid on every change.** When unsure, co-locate.

Worked example from this repo: `buttonVariants` is used by `apps/web` (the home page link) and `apps/docs` (the sidebar and the 404 page), so it lives in `@pem/ui`. The markdown renderer is used only by `apps/docs`, so it lives in `apps/docs/app/_components/markdown.tsx`.

## 2. Top-level structure

```
apps/         deployable Next.js apps — one folder per app
packages/     shared @pem/* workspaces
docs/         the practice and the documentation tree (markdown, source of truth)
tooling/      repo scripts run with Node's type stripping (lint:docs, budget, gen:agents, directory-map)
.claude/      path rules, generated subagents, skills
AGENTS.md     the agent contract; CLAUDE.md imports it and docs/index.md
turbo.json    task graph; per-app turbo.json files extend it ("extends": ["//"])
eslint.config.mjs   boundaries lint only — code-quality lint is per workspace
```

## 3. Apps

Both apps use the App Router and share one internal layout:

```
apps/<app>/
  app/                 routes only — page.tsx, layout.tsx, not-found.tsx, …
    _components/       components used by this app's routes (private folder, not a route)
  lib/                 non-component modules used only by this app
  next.config.ts       agentRules: false · transpilePackages · turbopack root
```

- **`apps/web`** — the demo app that proves the toolkit (`apps/web/AGENTS.md`); in a product cloned from here, the product.
- **`apps/docs`** — a reader for `AGENTS.md`, `docs/**/*.md` and the demo's filled examples. Every page is statically generated from those files at build time; the sidebar groups by the `layer` frontmatter field, `docs/research/` is searchable but not in the sidebar, and frontmatter renders above each page (record 0007). Relative `.md` links are rewritten to routes; links to other repo files render inert with the path in their title. Its `turbo.json` lists the content roots as build inputs, so editing a doc invalidates the cached build.
- **`tooling/`** — not a workspace. Scripts run directly on Node 22 (`node tooling/<script>.ts`), type-checked by `yarn check-types:tooling`. One consumer (the root scripts), so its shared module stays in `tooling/lib/`.

Route-level components that grow beyond one route move up to `app/_components/`; components needed by both apps move to `@pem/ui` (§1).

## 4. Packages and the import graph

| Package       | Role                                                                                                       | May import     |
| ------------- | ---------------------------------------------------------------------------------------------------------- | -------------- |
| `@pem/config` | ESLint (code quality + boundaries), Prettier, Tailwind tokens, tsconfig bases — exposed as subpath exports | nothing        |
| `@pem/ui`     | Shared web components                                                                                      | `config`       |
| `apps/*`      | Deployable apps                                                                                            | `config`, `ui` |

Layer order, low → high: `config` → `ui` → `apps`. Every edge not in this table is disallowed by default in `packages/config/eslint/boundaries.js`.

**Packages ship TypeScript source.** No build step: each package's `exports` points at `src/`, and each app compiles them through `transpilePackages` in `next.config.ts`.

**Subpath exports, not barrels.** `@pem/ui` exposes one entry per component (`@pem/ui/button`, `@pem/ui/cn`). A new component adds its own `exports` entry.

**Adding a package** (only when §1 says so):

1. Create `packages/<name>/` with `package.json` (`"name": "@pem/<name>"`), `tsconfig.json` extending a `@pem/config` base, and `eslint.config.mjs`.
2. Add it to `ELEMENTS` and `PACKAGE_IMPORTS` in `packages/config/eslint/boundaries.js`, and to the importing apps' `transpilePackages`.
3. Add a row to the table above, a ledger line, and a record in `docs/decisions/records/` (the package boundary is a one-way door).

## 5. Environment variables

No app reads an environment variable yet. When the first one arrives:

- That app gets an `env.ts` at its root — the **only** module in the app that reads `process.env`, validated with a schema. Everything else imports `env`.
- Client code reads only `NEXT_PUBLIC_*` names. Secrets never reach a browser bundle.
- The variable is listed in `turbo.json` (`globalEnv` or the task's `env`) so it is part of the cache key, and in a root `.env.example`.

## 6. Components and styling

- **Server Components are the default.** A client component is a leaf: `"use client"` on line 1, as small as the interactivity it owns. Example: `apps/docs/app/_components/docs-nav.tsx` is client-side only because it reads the current path; the sidebar that builds its tree stays a Server Component.
- **Tokens by name.** Colours, radii, and other design values are custom properties in `packages/config/tailwind/preset.css`, exposed as Tailwind utilities (`bg-background`, `text-muted-foreground`). Raw values anywhere else are a defect.
- **Variants with `cva`, merging with `cn`.** A component that has visual variants exports its `cva` definition alongside it (`buttonVariants`) so a link can wear the style without becoming a button.
- **Each app's `app/globals.css`** imports, in order: `tailwindcss`, `@pem/config/tailwind/preset.css`, `@pem/ui/styles/globals.css` (which registers `@pem/ui` as a Tailwind source).

## 7. Docs and decisions

- **Markdown under `docs/` is the source of truth.** One folder per layer (`decisions/`, `design/`, `engineering/`, …), each file carrying the frontmatter `yarn lint:docs` enforces. The map is [`docs/index.md`](../index.md); there is no `docs/README.md` (CF-05).
- **Names** follow [record 0006](../decisions/records/0006-file-naming-and-filing.md): ASCII kebab-case, `index.md` for folder landings.
- **Links are relative paths to `.md` files.** They must work raw; the docs app adapts to them, never the reverse.
- **Decisions** (CF-06): one line in [`ledger.md`](../decisions/ledger.md); a [record](../decisions/records/) from [`decision.template.md`](../decisions/decision.template.md) when the reason needs more than a line, immutable once accepted, reversed only by a new record that names it in `supersedes`; amendments to files in [`changelog.md`](../decisions/changelog.md).

## 8. Naming

| Kind               | Convention                                                                  | Example                                   |
| ------------------ | --------------------------------------------------------------------------- | ----------------------------------------- |
| Files and folders  | kebab-case                                                                  | `docs-nav.tsx`, `codebase-conventions.md` |
| Components         | PascalCase, named export                                                    | `export function NavLink`                 |
| Default exports    | Only where Next requires them (`page`, `layout`, `not-found`, config files) | `export default function DocPage`         |
| Functions          | verb-first camelCase                                                        | `getAllDocs`, `resolveDocLink`            |
| Workspace packages | `@pem/<name>`                                                               | `@pem/ui`                                 |

A name that needs a comment to explain it is the wrong name. No catch-all modules (`helpers`, `misc`, `utils.ts` at an app root).
