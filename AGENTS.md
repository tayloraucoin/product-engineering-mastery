# Product Engineering Mastery — agent contract

The canonical instructions for every agent (Claude Code, Cursor, Codex). `CLAUDE.md` is a shim that imports this file and `docs/index.md`. Shared guidance is written only here.

## Start here

1. **What this is:** a universal product-engineering toolkit and the repo that proves it. The practice (roles, design canon, templates, decisions, prompts) lives in `docs/`; `apps/web` is the demo app that holds every template's filled example and is the critic's target; `apps/docs` renders `docs/` in a browser. No product lives here.
2. **Current phase:** Phase 2 (the practice layer) is done; Phase 3 ([`demo-app-and-skills.md`](docs/prompts/phases/demo-app-and-skills.md)) builds the demo's records app, the filled examples and the `tk-*` skills. Until it lands, `apps/web` is a single page, `.claude/skills/` holds no skills, and `docs/index.md`'s skill row describes the target, not the present.
3. **Read [`docs/index.md`](docs/index.md) first, every session.** It is the map: the layers, the precedence ladder, what loads always, by path, by trigger and never, and the token budget.
4. **Before any UI work, read [`docs/design/canon.md`](docs/design/canon.md)** and the product's design layer: `DESIGN.md`, `tokens.md`, `components.md`, `anti-patterns.md`, `states.md`, `coverage-gaps.md` (in the demo: `apps/web/docs/design/`). In Claude Code, `.claude/rules/ui.md` also fires on UI files.
5. **Feature work starts from a brief and a package** (`specs/<feature>/brief.md` and `package.md`, from the `docs/product/` templates; not to be confused with a workspace package). A one-line request for a feature gets a package first, or an explicit waiver from the person asking. Filled copies never go in `docs/`: in the demo they live in `apps/web/specs/<feature>/`, and filled layer files in `apps/web/docs/<layer>/`.
6. **State the exact file paths before implementing.** Placement is decided by one question, who imports this ([`docs/engineering/codebase-conventions.md`](docs/engineering/codebase-conventions.md) §1).
7. **Verify the way CI does:** `yarn verify`. There is no test suite yet; Phase 3 adds Playwright captures.

## Commands

| Task                | Command                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Verify (matches CI) | `yarn verify`                                                                            |
| Dev servers         | `yarn web:dev` (:3000) · `yarn docs:dev` (:3001) · `yarn dev` (both)                     |
| Docs checks         | `yarn lint:docs` (frontmatter, names) · `yarn budget` (token budget)                     |
| Generated files     | `yarn gen:agents` (`.claude/agents/`) · `yarn directory-map` (`docs/_generated/`)        |
| Code checks         | `yarn lint` · `yarn lint:boundaries` · `yarn check-types` · `yarn build` · `yarn format` |

Node 22, Yarn 4.13.0 (`corepack enable && yarn install`). Use `yarn`, never `npm` or `pnpm`.

## UI vocabulary (the constraint)

- **Only components from `@pem/ui`** (and a product's own primitives once ruled in its `components.md`).
- **Only tokens** from `packages/config/tailwind/preset.css`: no raw color, spacing, radius, shadow, font or duration values. Enforced by `@pem/config/eslint/tokens`.
- **The slop tells are banned by ID** — canon §2, A-01 to A-20. They are named once, there (CF-02); cite the ID in prompts and reviews.
- Every reachable state is designed and reachable by `?state=` (canon C-P08).

## Docs rules

- Every file under `docs/` carries the §2.7 frontmatter; `description` is written as a trigger. `yarn lint:docs` enforces it.
- Names are ASCII kebab-case per [record 0006](docs/decisions/records/0006-file-naming-and-filing.md). Filed thread outputs keep their bodies byte for byte.
- **Never load `docs/research/`** — archived reports, read only to trace a ruling.
- Templates (`*.template.md`) are blank by design. Their filled examples live in `apps/web` (Phase 3); never fill a template inside `docs/`.
- To change the practice: amend the file, add a ledger line or [`changelog.md`](docs/decisions/changelog.md) entry, and a [record](docs/decisions/records/) only when the reason needs more than one line. Nothing lives in two places.

## Roles, subagents, skills

- **Roles:** `docs/roles/<department>/<name>-<title>.md`. Inject one per thread. Department seat maps are each folder's `README.md`.
- **Subagents:** `.claude/agents/` is **generated** by `yarn gen:agents` from roles whose frontmatter says `subagent: true` ([record 0008](docs/decisions/records/0008-subagents-are-generated-opt-in.md)). Never edit it by hand; CI fails on drift.
- **Skills:** `.claude/skills/<name>/`; house skills are prefixed `tk-`. Rulings and load order: [`docs/design/skills.md`](docs/design/skills.md). Provenance: `.claude/skills/REGISTRY.md`.

## Engineering boundaries

- **Apps import packages; packages never import apps; apps never import each other.** Enforced by `yarn lint:boundaries` (`packages/config/eslint/boundaries.js`). Never suppress a boundaries error; an upward import means the boundary is wrong.
- Workspace packages are imported as `@pem/<name>`, never by relative path.
- Server Components by default; a client leaf has `"use client"` on line 1, in the route's `_components/`.
- No app reads environment variables yet; the first one creates that app's `env.ts`, the only `process.env` reader.

## Tooling notes

- **TypeScript 5.9.2**, pinned exactly; not TypeScript 7 ([record 0003](docs/decisions/records/0003-toolchain-pinned-to-house-set.md)).
- **Next.js 16 is not the Next.js you remember.** `middleware.ts` is `proxy.ts`, `next/config` is gone, `params`, `cookies()` and `headers()` are async, caching defaults changed. Read `node_modules/next/dist/docs/` before writing app code. Next's generator is off (`agentRules: false`) so this file has one home.
- **Turborepo 2.x may differ from your training data.** Read the installed package's bundled docs (`node -p "require.resolve('turbo/package.json')"` from a workspace) before changing `turbo.json` or task commands. Turbo's managed block is off (`agentGuidance: false`) for the same reason.

## Keeping instructions in sync

- This file stays at or under 100 lines; `CLAUDE.md` at or under 20; `docs/index.md` at or under 80 (`yarn budget` fails otherwise).
- `CLAUDE.md` holds only imports and Claude-only lines. App-level files (`apps/web/AGENTS.md`) add only app-local rules and never restate this one.
