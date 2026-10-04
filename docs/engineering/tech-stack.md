---
title: Tech stack
description: Read before adding a dependency or bumping a pinned version; the stack, the exact pins, and what is deliberately absent.
layer: engineering
status: adopted
thread: scaffold
role: Mason
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# Tech Stack

The canonical choices and their versions. Exact pins are deliberate; a pin changes only with a decision record in [`docs/decisions/records/`](../decisions/records/0003-toolchain-pinned-to-house-set.md).

## Toolchain

| Tool         | Version                                         | Pin                                                        |
| ------------ | ----------------------------------------------- | ---------------------------------------------------------- |
| Node         | 22                                              | `.nvmrc`, `engines.node >= 22`                             |
| Yarn (Berry) | 4.13.0                                          | `packageManager`, via corepack; `nodeLinker: node-modules` |
| Turborepo    | 2.x                                             | caret                                                      |
| TypeScript   | 5.9.2                                           | **exact**                                                  |
| ESLint       | 9.x (flat config)                               | caret                                                      |
| Prettier     | 3.x, with `@ianvs/prettier-plugin-sort-imports` | caret                                                      |

## Apps

| Library                                                                                     | Version                                  | Pin                                                                                                       |
| ------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Next.js                                                                                     | 16.3.8 (App Router, Turbopack)           | **exact** (apps; `@pem/brand` as a peer, for `next/font` and its static mark import)                      |
| React / React DOM                                                                           | 19.2.8                                   | **exact**                                                                                                 |
| Tailwind CSS                                                                                | 4.x, via `@tailwindcss/postcss`          | caret                                                                                                     |
| `class-variance-authority`, `clsx`, `tailwind-merge`                                        | —                                        | caret (`@pem/ui`)                                                                                         |
| `next-themes`                                                                               | 0.4.6 (verified 2026-10-03)              | **exact** (`@pem/ui` only, unpatched; D-STK-17)                                                           |
| `@t3-oss/env-nextjs`, `zod`                                                                 | 0.13.11, 4.6.5 (verified 2026-10-03)     | caret (`apps/web`: `env.ts`; D-STK-3)                                                                     |
| `drizzle-orm`, `drizzle-kit`, `postgres`                                                    | 0.45.2, 0.31.10, 3.4.9 (2026-10-03)      | **exact** (`@pem/db` only; D-STK-5, D-STK-16)                                                             |
| `supabase` CLI (`yarn db:local`, `db:local:full`; D-STK-6)                                  | 2.119.0 (verified 2026-10-04)            | **exact** (`@pem/db` devDependency; it pins the images below)                                             |
| `supabase/postgres` image, from the CLI                                                     | 17.11.0.002 (verified 2026-10-04)        | by the CLI pin (`public.ecr.aws/supabase/postgres`); listens on every interface, so `yarn db:local` warns |
| `@supabase/ssr`, `@supabase/supabase-js`                                                    | 0.12.7, 2.117.2 (verified 2026-10-04)    | **exact** (`@pem/auth` only; D-STK-7, D-STK-16)                                                           |
| `server-only`                                                                               | 0.0.1 (verified 2026-10-04)              | **exact** (`@pem/auth`'s server subpaths, `apps/web/lib/supabase`; `apps/docs` floats it)                 |
| `resend`                                                                                    | 6.32.0 (verified 2026-10-04)             | **exact** (`@pem/email` only; D-STK-12, D-STK-16)                                                         |
| Brand font placeholder: Geist, latin, variable 400 to 600                                   | from Next 16.3.8 (2026-10-04)            | a file, SIL OFL 1.1 (`packages/brand/assets/fonts/`; the brand step replaces it)                          |
| `react-markdown`, `remark-gfm`, `rehype-slug`, `@tailwindcss/typography`, `minisearch`      | —                                        | caret (`apps/docs` only)                                                                                  |
| `yaml`                                                                                      | 2.x                                      | caret (`tooling/` and `apps/docs`: frontmatter)                                                           |
| Storybook (`storybook`, `@storybook/nextjs-vite`, addons `a11y`, `themes`, `pseudo-states`) | 10.6.1 (verified 2026-10-04)             | caret (`@pem/ui` dev only; D-STK-10); `yarn ui:storybook` on 6006                                         |
| `vitest`, `jsdom` (story checks in `yarn test`), `vite`, `@tailwindcss/vite`                | 5.0.3, 30.1.1, 8.3.2, 4.3.3 (2026-10-04) | caret (`@pem/ui` dev only)                                                                                |

Next.js, React, and TypeScript are pinned exactly because a minor version of each can change behaviour the whole repo depends on. Everything else floats within its major version, held in place by `yarn.lock`.

## Deliberately absent

None of these exist yet. Every row but Tests is part of the default stack ([record 0010](../decisions/records/0010-starter-ships-default-stack.md)), and the ticket that lands one deletes its row and moves its pins into the tables above. The Synapse and Conscious Connections repos are the reference for how each is built here.

| Concern    | House choice when it arrives                                                | Ticket |
| ---------- | --------------------------------------------------------------------------- | ------ |
| API        | tRPC, thin procedures over services                                         | STK-14 |
| Validation | Zod (pinned above for `env.ts`) — one schema shared by forms and procedures | STK-13 |
| Tests      | During the item, per evidence type (ruling (h); `.claude/rules/testing.md`) | —      |
