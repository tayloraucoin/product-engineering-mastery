# What do the three recent product repos do for packages, environments, database, branding and the component workshop?

Audited 2026-10-03 by three read-only passes, one per repo. Every claim below is verified (read from the code) unless labelled. No `.env` file other than `.env.example` was read.

## Answer

The three repos converge on one design that got better each time: source-exported workspace packages under one scope with a shared config package and a boundaries lint; one tier switch (`local | staging | production`) that selects the database, the Supabase project, the site URL and the payment keys through suffixed variables; Supabase Postgres with Drizzle, policies declared beside each table and a transaction bridge that sets the user and role; Tailwind v4 tokens in one CSS file in three layers; and Storybook 8.6 inside the UI package with colocated stories. Synapse is the cleanest copy of everything it has. Conscious Connections is the only source for Stripe, Resend, the analytics emitter and the AI package. Cho-verse contributes the fail-safe payment-key gate and little else to carry forward.

## Evidence

| Repo                  | Path                                                                                            | Commits | Dates (2026)   |
| --------------------- | ----------------------------------------------------------------------------------------------- | ------- | -------------- |
| cho-verse             | `lighthouse/_archive/cho-ventures/cho-verse` (read from `main`; the checkout is a stale branch) | 906     | 04-10 to 08-17 |
| conscious-connections | `lighthouse/conscious-connections/conscious-connections`                                        | 326     | 05-09 to 09-08 |
| synapse               | `lighthouse/synapse`                                                                            | 96      | 09-04 to 09-29 |

### Packages

|                 | cho-verse                                           | conscious-connections                                                                    | synapse                                 |
| --------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------- |
| Scope           | `@cho-verse/*`                                      | `@cc/*`                                                                                  | `@syn/*`                                |
| Packages        | db, lib, ui, schema-types, constants, brands, theme | config, constants, types, utils, validators, observability, db, auth, ai, api, hooks, ui | the same minus ai                       |
| Shared config   | none                                                | `@cc/config` (ESLint, Prettier, Tailwind, tsconfig)                                      | `@syn/config`, same                     |
| Boundaries lint | none                                                | layer matrix plus third-party SDK owners                                                 | same                                    |
| Logic layer     | one grab-bag `lib`, about 230 export entries        | `utils` (pure), `api/services/<domain>` (server), `hooks` (headless React)               | same; `misc.ts` and `helpers.ts` banned |

Layer order in the two recent repos: `config → constants / types / observability → utils → validators → db → auth → (ai) → api → hooks → ui → apps`.

### Environment

|                | cho-verse                                                                                                                   | conscious-connections                                  | synapse                          |
| -------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------- |
| Switch         | `DATABASE_ENVIRONMENT` plus `USE_STAGING_AUTH`, `PAYMENT_USE_PRODUCTION_KEYS`, `ECOSYSTEM_SITE_URL_TIER`, `NEXT_PUBLIC_ENV` | `DATABASE_ENVIRONMENT`                                 | `DATABASE_ENVIRONMENT`           |
| Default        | production                                                                                                                  | production                                             | local                            |
| Validation     | none                                                                                                                        | t3-env and zod, one `env.ts` per app                   | same                             |
| Suffix grammar | `_TEST` / `_PROD`, `_STAGING`                                                                                               | `_LOCAL` / `_STAGING` / unsuffixed is production       | same                             |
| Stripe keys    | test unless tier is production and a flag is true                                                                           | by tier, with `_LOCAL` keys chosen by request hostname | no Stripe                        |
| Local site URL | by tier variable                                                                                                            | by variable                                            | fixed to `http://localhost:3000` |

Shared mechanics in the two recent repos: `resolveByDatabaseEnvironment(key, { local, staging, production })` in `packages/db/src/connection-env.ts`; `apps/<app>/lib/env/resolve-tier-env.ts`; resolved values spread into the `env` block of `next.config.ts`. That block also carries the service-role key and `DATABASE_URL`, which Next inlines at build time wherever the name is referenced; safe today only because no client file references them. `turbo.json` `globalEnv` has drifted from the code in all three. No repo has an env sync script.

### Database

|              | cho-verse                                    | conscious-connections                                                          | synapse                                                                                                          |
| ------------ | -------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| ORM          | Prisma 7                                     | Drizzle 0.45.2, kit 0.31.10, exact                                             | same                                                                                                             |
| Migrations   | 143, timestamp folders, `migrate dev` banned | 91, `NNNN_name.sql`, hand-kept journal                                         | 11, same                                                                                                         |
| RLS          | runtime role bypasses it; tier helpers inert | `pgPolicy` beside each table, eight factories, bridge in `rls.ts`              | same design, three factories                                                                                     |
| Supabase CLI | none                                         | none                                                                           | none                                                                                                             |
| Local        | remote Supabase, or local Postgres           | local Postgres with staging auth                                               | local Postgres on 54322 with staging auth                                                                        |
| Local users  | `ensure-local-user-from-supabase-auth`       | `local-dev/ensure-dev-*` shims, exported from the package                      | `local-dev/ensure-local-user-from-supabase-auth.ts`, plus a hand-edited migration `0000` that stubs `auth.users` |
| Guards       | reset confirm script                         | reset refuses unless local; agent settings deny reset and drop, ask on migrate | same                                                                                                             |

Supabase clients in the recent repos: server, browser, admin and `updateSession` factories in the auth package; session refresh in `proxy.ts`; an app-local browser client because Next cannot inline dynamically read variables.

### Branding

|                | cho-verse                                                              | conscious-connections                                                   | synapse                                                  |
| -------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| Tokens         | TS primitives generate `brands.css` per brand, plus a shared theme CSS | one `preset.css`: raw, register, shadcn bridge, `@theme inline`         | same three layers                                        |
| Dark mode      | `.dark` class from a cookie                                            | `.dark` class, patched `next-themes`                                    | `.dark` class, `next-themes` wrapped in a theme provider |
| Fonts          | per app, licensed files duplicated                                     | local files duplicated in each app's `public/`                          | `next/font/google` in the layout                         |
| Logos          | ad hoc per app                                                         | SVGs duplicated per app; the `Logo` component reads app `public/` paths | PNG icons only; default create-turbo favicon             |
| Hard-coded     | per app                                                                | hex in the manifest, layout and email HTML                              | hex in the manifest and layout                           |
| Brand constant | entity IDs                                                             | `SITE_NAME`, app URLs                                                   | `SITE_NAME`                                              |

### Component workshop

|                    | cho-verse                  | conscious-connections                             | synapse                        |
| ------------------ | -------------------------- | ------------------------------------------------- | ------------------------------ |
| Home               | separate app `ui-workshop` | `packages/ui/.storybook`                          | same                           |
| Version, framework | 8.6, `@storybook/nextjs`   | 8.6, `@storybook/react-vite`                      | same                           |
| Stories            | 60, colocated              | 111, colocated                                    | about 133, colocated           |
| Theme in preview   | brand and scheme toolbar   | `withThemeByClassName` on `.dark`                 | same                           |
| Assets             | none wired                 | `staticDirs` reaches into `apps/marketing/public` | reaches into `apps/web/public` |
| Tests, CI, deploy  | none                       | none                                              | none                           |

### Elsewhere

- Stripe (conscious-connections only): `apps/marketing/lib/billing/stripe-webhook/` with a dispatcher, one handler per event, idempotency and an entitlement upsert; `stripe` is pinned to one app by the boundaries lint.
- Email (conscious-connections): Resend, with inline HTML strings and dashboard template IDs.
- Analytics: a typed, vendor-free emitter in `@cc/observability`; no vendor wired. Logger: `createLogger` in the same package, in both recent repos.
- Error monitoring: none in any repo.
- AI (conscious-connections): `@cc/ai`, Vercel AI SDK v5 with Anthropic, Langfuse, eval scripts; apps are lint-banned from importing it.
- Tests: none in the two recent repos by rule; cho-verse uses Node's built-in runner.

## Not found

- Any env pull or sync tooling, any Supabase CLI project, any story-level test, any error-monitoring setup.
- Whether the committed `.env_prev` files in cho-verse history (`apps/foc-website`, `apps/chozen-crl`) hold keys that are still live. The values were not read.

## Promote to library

No. This is a snapshot of three repos on one date; the decisions it supports go to the ledger through the Technical stage.
