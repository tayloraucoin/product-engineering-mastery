# Product Engineering Mastery — agent contract

The canonical instructions for every agent (Claude Code, Cursor, Codex). `CLAUDE.md` is a shim that imports this file and `docs/index.md`. Shared guidance is written only here.

## Start here

1. **What this is:** a universal product-engineering toolkit and the repo that proves it. The practice (roles, design canon, templates, decisions, workflows, prompts) lives in `docs/`; `apps/web` is the demo app that holds every template's filled example and is the critic's target; `apps/docs` renders `docs/` in a browser. No product lives here.
2. **Current phase:** PJ, the engineering layer (`docs/prompts/phases/engineering-layer.md`), on `agent/PJ`; Phase 3 (`demo-app-and-skills.md`) then builds the demo through the work loop. Until then `apps/web` is a single page.
3. **Read [`docs/index.md`](docs/index.md) first, every session.** It is the map: the layers, the precedence ladder, what loads always, by path, by trigger and never, and the token budget.
4. **Before any UI work, read [`docs/design/canon.md`](docs/design/canon.md)** and the product's design layer: `DESIGN.md`, `tokens.md`, `components.md`, `anti-patterns.md`, `states.md`, `coverage-gaps.md` (in the demo: `apps/web/docs/design/`). In Claude Code, `.claude/rules/ui.md` also fires on UI files.
5. **State the exact file paths before implementing.** Placement is decided by one question, who imports this ([`docs/engineering/codebase-conventions.md`](docs/engineering/codebase-conventions.md) §1).
6. **Verify the way CI does:** `yarn verify`.

## Work loop

- **Every change is a ticket with a contract**, started by `yarn contract:init`: testable criteria, each with an evidence type; the planned paths; the one UX surface it cites; Build notes that say what to build. The default ticket is under half a day.
- **Asked to build tickets, take them to closed yourself** (`tk-batch`; no slash command needed): start, build, prove, fix and re-prove, as-built, review by tier, one `yarn verify`, a report of six lines at most. You run every command, re-prove any stale proof and decide what is reversible. Taylor gets only what a person alone can do (PR-16): a choice that cannot be undone, money, growing scope, a credential, a protected file, the merge. Never hand Taylor a `yarn` command.
- **The tier sets the QA** (PR-15): 0 docs, checks only; 1 code, one review per batch; 2 a one-way door, pre-flight and reviewers on the ticket.
- **One-off or epic is decided by the routing rule in [`docs/workflows/README.md`](docs/workflows/README.md), never by size:** more than one ticket, a new surface, no living UX file, or an unsettled problem makes an epic.
- **Done is `results.json` plus `as-built.md`, never a claim in chat.** Only `yarn contract:run`, `contract:record`, `contract:tier` and `review:run` write results. Taylor reads a tier 2 ticket's `review-<role>.md` before merge.
- **`specs/<app>/ux/` is the living truth** of how the app works now. An epic proposes changes in its own `ux/`; shipping promotes them.
- **Built as of 2026-10-02:** the contract loop and `status` (J5); the Stop check and the SessionStart line (J6); `/tk-contract`, `tk-kickoff`, `tk-close`, `tk-batch` and `vigil` (J7, PR-15). **Lands later:** `yarn pr:body` (J8), the map's other skills (P-C). Delete this line at J8.

## Commands

| Task                | Command                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Verify (matches CI) | `yarn verify`                                                                            |
| Dev servers         | `yarn web:dev` (:3000) · `yarn docs:dev` (:3001) · `yarn dev` (both)                     |
| Docs checks         | `yarn lint:docs` (frontmatter, names) · `yarn budget` (token budget)                     |
| Generated files     | `yarn gen:agents` (`.claude/agents/`) · `yarn directory-map` (`docs/_generated/`)        |
| Code checks         | `yarn lint` · `yarn lint:boundaries` · `yarn check-types` · `yarn build` · `yarn format` |

Node 22, Yarn 4.13.0 (`corepack enable && yarn install`).

## UI vocabulary (the constraint)

- **Only components from `@pem/ui`** (and a product's own primitives once ruled in its `components.md`).
- **Only tokens** from `packages/config/tailwind/preset.css`: no raw color, spacing, radius, shadow, font or duration values. Enforced by `@pem/config/eslint/tokens`.
- **The slop tells are banned by ID** — canon §2, A-01 to A-20. They are named once, there (CF-02); cite the ID in prompts and reviews.
- Every reachable state is designed and reachable by `?state=` (canon C-P08).

## Roles, subagents, skills

- **Roles:** `docs/roles/<department>/<name>-<title>.md`. Inject one per thread. Department seat maps are each folder's `README.md`.
- **Subagents:** `.claude/agents/` is **generated** by `yarn gen:agents` from roles whose frontmatter says `subagent: true` ([record 0008](docs/decisions/records/0008-subagents-are-generated-opt-in.md)).
- **Skills:** `.claude/skills/<name>/`; house skills are prefixed `tk-`. Rulings and load order: [`docs/design/skills.md`](docs/design/skills.md). Provenance: `.claude/skills/REGISTRY.md`.

## Engineering boundaries

- **Apps import packages; packages never import apps; apps never import each other.** Enforced by `yarn lint:boundaries` (`packages/config/eslint/boundaries.js`). Never suppress a boundaries error; an upward import means the boundary is wrong.
- Workspace packages are imported as `@pem/<name>`, never by relative path.
- Server Components by default; a client leaf has `"use client"` on line 1, in the route's `_components/`.
- Each app's `env.ts` is its only `process.env` reader; `@pem/env` holds the pure tier picker (codebase-conventions §5).

## Keeping instructions in sync

- `CLAUDE.md` holds only imports and Claude-only lines. App-level files (`apps/web/AGENTS.md`) add only app-local rules and never restate this one.
