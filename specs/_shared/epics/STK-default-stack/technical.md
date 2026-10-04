---
epic: STK
status: approved
---

# STK — technical notes

## Appetite verdict

Possible in ten working days with every ticket under half a day.

## Decisions

- **D-STK-1 Package graph.** Low to high: `config → constants, env, brand, observability → validators → db → auth → email, ai → services → api → ui → apps`. `utils`, `types` and `hooks` ship as README-only folders stating their convention; each becomes a package with its first module. No `lib` or `helpers` package.
- **D-STK-2 Rulings on record.** Record 0010 supersedes 0005. Conventions rule 9 becomes "a seam ships with a default consumer or a README that states its convention". The tech-stack "Deliberately absent" table is retired as each module lands. The README's porting rule becomes "duplicate, then remove".
- **D-STK-3 Tier switch.** `DATABASE_ENVIRONMENT`, `local | staging | production`, default `local`. Suffix grammar: `_LOCAL`, `_STAGING`, unsuffixed is production. `@pem/env` holds the pure per-tier picker; it never reads `process.env`. Each app's `env.ts` (t3-env, zod) and each package's `scripts/env.ts` are the only readers. Where the code runs is derived, never set: it fixes the site URL to localhost and picks the local Stripe webhook secret.
- **D-STK-4 Secrets.** `next.config.ts` collapses `NEXT_PUBLIC_*` names only. `env.ts` rejects a live-mode Stripe key on `local` or `staging` and a test-mode key on `production`, by prefix.
- **D-STK-5 Database.** `@pem/db`: Drizzle on Supabase, `src/schema/<domain>/<table>.ts`, policies beside tables from three factories, the bridge in `src/rls.ts`, setup SQL in `supabase/setup/`, `migrationsDir: packages/db/migrations`. `authUsers` is imported from `drizzle-orm/supabase` and never exported; `check-migrations` fails on DDL against `auth`.
- **D-STK-6 Local users.** Mode A is the default: `supabase db start` for the local database, sign-in on hosted staging, and one file, `packages/db/src/local-auth-mirror.ts`, guarded inside its own SQL. Mode B (`supabase start`) is documented, with one shared `config.toml`. The mode is the value of the `_LOCAL` auth variables; no mode variable.
- **D-STK-7 Auth.** `@pem/auth`: server, browser, admin and `updateSession` factories; one request seam that returns the `AuthContext` and calls the mirror; refresh in `proxy.ts`.
- **D-STK-8 API.** `@pem/api` on tRPC 11 is on by default and holds transport only; each procedure body is one call into `@pem/services`. Webhooks, AI streaming, cron and auth callbacks are Route Handlers calling services. `hooks` never imports `api`. A product that is one simple Next.js app removes `api` by runbook.
- **D-STK-9 Brand.** `@pem/brand`: `brand.ts` (name, URLs, contact, asset paths, the two theme colours) and `assets/` (logos, fonts). Colour and font tokens stay in `packages/config/tailwind/preset.css`; a check fails when `brand.ts` and the preset disagree. Manifest, metadata, emails and stories read `@pem/brand`.
- **D-STK-10 Workshop.** Storybook in `packages/ui`, stories beside components, `yarn ui:storybook` on port 6006, the `.dark` class toolbar, assets from `@pem/brand`. Version and framework are verified on the day of that ticket.
- **D-STK-11 Billing.** Stripe has one consumer, so it lives in `apps/web`: `app/api/webhooks/stripe/route.ts`, a dispatcher and `lib/billing/webhook/handlers/<event>.ts`, one file per event, with idempotency. Entitlement logic is a service.
- **D-STK-12 Email, AI, observability.** `@pem/email` (Resend, one default HTML template, locked in). `@pem/ai` (AI SDK, imported only by services and the streaming route). `@pem/observability`: `createLogger` and a vendor-free error reporter; analytics is a stub until P-G. Sentry is wired in `apps/web` only, per `research/error-monitoring.md` E3.
- **D-STK-13 Removal protocol.** `toolkit.json` gains a `stack` block: one entry per module with its `files`, `env`, `dependencies`, `boundaries` names, `locked` flag and `runbook`. `yarn check-stack` fails when a listed file is missing, or when a module marked removed still has a file, variable or dependency present. Runbooks: `docs/runbooks/remove-supabase-auth.md`, `remove-supabase-database.md`, `remove-billing.md`, `remove-api.md`, `remove-ai.md`, `remove-error-monitoring.md`.
- **D-STK-14 Guide.** `docs/runbooks/new-project.md`: duplicate; rename scope and prefixes; set the brand; choose modules and run each removal runbook; clear the demo content, `docs/research/` and this repo's `specs/`; fill `.env.example` values; `yarn check-stack`; `yarn verify`.
- **D-STK-15 UX level waived** for this epic; tickets cite this file.
- **D-STK-16 Boundaries and SDK owners (added after approval).** Each package ticket adds its row to the layer matrix in `packages/config/eslint/boundaries.js`, and each vendor SDK is pinned to one owner: `postgres` and `drizzle-kit` to `db`, `@supabase/*` to `auth`, `stripe` and `@sentry/nextjs` to `apps/web`, `resend` to `email`, `ai` and `@ai-sdk/*` to `ai`, `@trpc/server` to `api`.
- **D-STK-17 Theme switch (added).** The preset moves from `prefers-color-scheme` to a `.dark` class with three token layers (raw, semantic, shadcn bridge). `@pem/ui` ships a theme provider on `next-themes`, unpatched, and a toggle; "system" stays an option.
- **D-STK-18 Agent guardrails for the database (added).** `.claude/settings.json` denies reset and drop commands and asks before migrate, push, seed and setup; the agent writes SQL and stops. Reset refuses any tier but `local`.
- **D-STK-19 Carried helpers and deploy (added).** The LAN dev-origins helper, the contrast audit on the preset, and `apps/web/vercel.json` for a Yarn workspace build. Any doc names an unbuilt module by its ticket number only, never as present; the ticket that makes a line untrue updates it.

## One-way doors

| Door                         | Path glob                                                         | Record or ratification  | Reviewer                |
| ---------------------------- | ----------------------------------------------------------------- | ----------------------- | ----------------------- |
| Package graph                | `packages/config/eslint/boundaries.js`, `packages/*/package.json` | REC 0010 (STK-1)        | mason                   |
| Environment seam             | `**/env.ts`                                                       | ratify D-STK-3, D-STK-4 | warden                  |
| Schema, migrations, policies | `packages/db/**`                                                  | ratify D-STK-5, D-STK-6 | mason, warden           |
| Auth topology                | `packages/auth/**`, `**/proxy.ts`                                 | ratify D-STK-7          | mason, warden           |
| Billing                      | `**/billing/**`, `**/webhooks/**`                                 | ratify D-STK-11         | mason, warden, chancery |

## Calls routed to Taylor

1. Ratified D-STK-1 to D-STK-15 on 2026-10-03, and D-STK-16 to D-STK-19, added after that approval, later the same day.
2. `[NEEDS DECISION]` Sentry data region, permanent once chosen. Recommended: US. Needed before the error-monitoring ticket only.
3. Ratified 2026-10-03: `@pem/services` is its own package, so the lint gets an edge to enforce.

## Test shape per risk

Pure logic (tier picker, key guard, mirror guard, `check-stack`): unit tests on Node's runner. Policies and the bridge: integration tests on the local Supabase image. Webhook dispatch: unit tests with signed synthetic events. UI: stories with captures.

## Ticket order

1. Rulings on record (D-STK-2). 2. Stack manifest and `check-stack` (D-STK-13). 3. Guide and removal runbooks (D-STK-14). 4. `@pem/env`, `env.ts`, `.env.example`, `turbo.json`. 5. `constants`, `observability`, README seams. 6. Preset layers, theme provider and toggle (D-STK-17). 7. `brand`. 8. Workshop. 9. `db`. 10. Database guardrails (D-STK-18). 11. Local mirror. 12. `auth`. 13. `validators`, `services`. 14. `api`. 15. `email`. 16. Billing. 17. `ai`. 18. Error monitoring. 19. Helpers and `vercel.json` (D-STK-19). 20. Removal dry-run on a duplicate. Every package ticket carries its D-STK-16 boundaries rows and its manifest entry.

## Rabbit holes

Out of bounds: domain code carried from a product repo; PostHog wiring (P-G owns it); React Native.
