# Product Engineering Mastery — agent contract

The canonical instructions for every agent (Claude Code, Cursor, Codex). `CLAUDE.md` is a shim that imports this file and `docs/index.md`. Shared guidance is written only here.

## Start here

1. **What this is:** a universal product-engineering toolkit and the repo that proves it. The practice (roles, design canon, templates, decisions, workflows, prompts) lives in `docs/`; `apps/web` is the demo app that holds every template's filled example and is the critic's target; `apps/docs` renders `docs/` in a browser. No product lives here.
2. **Current work:** the starter's default stack (STK) and component catalog (CAT) epics. Live state is `specs/_status.md`.
3. **Read [`docs/index.md`](docs/index.md) first, every session.** It is the map: the layers, the precedence ladder, what loads always, by path, by trigger and never, and the token budget.
4. **Before any UI work, read [`docs/design/canon.md`](docs/design/canon.md)** and, when the product has one, its design layer (`DESIGN.md`, `tokens.md`, `components.md`, `anti-patterns.md`, `states.md`, `coverage-gaps.md` under `apps/<app>/docs/design/`; this repo has none yet). In Claude Code, `.claude/rules/ui.md` also fires on UI files.
5. **State the exact file paths before implementing.** Placement is decided by one question, who imports this ([`docs/engineering/codebase-conventions.md`](docs/engineering/codebase-conventions.md) §1).
6. **Verify the way CI does:** `yarn verify`.

## Work loop

- **Work starts at the prompt builder** ([`docs/workflows/prompt-builder.md`](docs/workflows/prompt-builder.md), `tk-prompt`): it settles the track, cast, QA level, pace, involvement and branch with the operator, then prints the prompt. Handed work with no prompt and no ticket, run the builder first; tiny work takes its fast lane.
- **The track sets the path** ([`docs/workflows/tracks/`](docs/workflows/tracks/README.md)). A ticket and contract exist when the track or the operator calls for one (`yarn contract:init`); otherwise the prompt is the brief.
- **The QA level sets proof, review and paperwork** ([`docs/workflows/qa-levels.md`](docs/workflows/qa-levels.md)). Q0: nothing extra. Q1: run the criteria, one `yarn verify`. Q2: plus one fresh-context reviewer, findings in the thread. Q3 (money, auth, schema, personal data, agent permissions): recorded proofs in `results.json`, written only by tooling, the specialists the operator confirmed, review files kept. Flag a critical path below Q3 once. Raise any named part when the operator asks.
- **Take the work to done yourself** (`tk-batch` for tickets): build, prove, fix and prove again, review at the level, one `yarn verify`, a report of six lines at most. You run every command and decide what is reversible; stop only as the chosen involvement says. The operator gets what a person alone can do: a choice that cannot be undone, money, growing scope, a credential, a protected file, the merge. Never hand the operator a command to run.
- **Stay in your own work.** Never re-prove, re-review or commit another ticket's files; a commit to a shared file reopens nothing.
- **Never filed:** prompt files, evidence logs, review files below Q3.
- **`specs/<app>/ux/` is the living truth** of how the app works now. Work that changes behaviour updates it in the same change; an epic proposes in its own `ux/` and shipping promotes it.

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
