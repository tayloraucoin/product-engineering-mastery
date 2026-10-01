# Tech Stack

The canonical choices and their versions. Exact pins are deliberate; a pin changes only with an entry in [`TECHNICAL-DECISIONS.md`](../decisions/TECHNICAL-DECISIONS.md).

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

| Library                                                                  | Version                         | Pin                      |
| ------------------------------------------------------------------------ | ------------------------------- | ------------------------ |
| Next.js                                                                  | 16.3.8 (App Router, Turbopack)  | **exact**                |
| React / React DOM                                                        | 19.2.8                          | **exact**                |
| Tailwind CSS                                                             | 4.x, via `@tailwindcss/postcss` | caret                    |
| `class-variance-authority`, `clsx`, `tailwind-merge`                     | —                               | caret (`@pem/ui`)        |
| `react-markdown`, `remark-gfm`, `rehype-slug`, `@tailwindcss/typography` | —                               | caret (`apps/docs` only) |

Next.js, React, and TypeScript are pinned exactly because a minor version of each can change behaviour the whole repo depends on. Everything else floats within its major version, held in place by `yarn.lock`.

## Deliberately absent

None of these exist yet. Each arrives with its first real consumer and a decision entry. The Synapse and Conscious Connections repos are the reference for how each is built here.

| Concern            | House choice when it arrives                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| Database           | Postgres (Supabase) + Drizzle (`drizzle-orm` 0.45.2 / `drizzle-kit` 0.31.10, exact), RLS deny-by-default |
| Auth               | Supabase Auth, session refresh in `proxy.ts`                                                             |
| API                | tRPC, thin procedures over services                                                                      |
| Validation         | Zod — one schema shared by forms and procedures                                                          |
| Env                | `@t3-oss/env-nextjs`, one `env.ts` per app                                                               |
| Component workshop | Storybook for `@pem/ui`                                                                                  |
| Tests              | Added as a separate pass, not during feature work                                                        |
