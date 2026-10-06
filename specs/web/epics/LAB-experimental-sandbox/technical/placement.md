---
epic: LAB
status: approved
---

# LAB — placement and the stack entry

> Detail for D-LAB-35, D-LAB-39 and D-LAB-43 (`../technical.md`). Decided by one question, who imports this (codebase-conventions §1). Mason, 2026-10-05.

## Placement

| What | Path | Consumer | Why here |
| --- | --- | --- | --- |
| Tables and policies | `packages/db/src/schema/sandbox/<table>.ts`, exported from `schema/index.ts` | migrations, `@pem/db/sandbox` | Schema lives in `@pem/db` (D-STK-5); drizzle-kit is `db`'s alone (D-STK-16) |
| Viewer-scoped queries | `packages/db/src/sandbox/*.ts`, one subpath export `@pem/db/sandbox` | `apps/web/lib/sandbox/` only | The billing precedent: service-only queries in `@pem/db` (`src/billing/stripe-event-ledger.ts`), bound in the app (`apps/web/lib/billing/webhook/ledger.ts`). Real-Postgres tests sit beside them in `packages/db/test/` |
| The data-access module: `resolveViewer`, the cookie, codes, the throttle, the link token | `apps/web/lib/sandbox/` (`access.ts`, `cookie.ts`, `code.ts`, `throttle.ts`, `link.ts`) | every sandbox page and action | One consumer, `apps/web`. It needs cookies, `getAuthContext()` and the registry, which are the app's. It cannot be `@pem/services`, which never reaches the singleton (D-STK-8) |
| Experiments | `apps/web/app/experimental/_experiments/<slug>/` (config and design components) and `_experiments/registry.ts` | the routes below | "One folder per experiment" (S13); a private folder, never a route |
| Experiment routes | `apps/web/app/experimental/[slug]/page.tsx`, `[slug]/review/page.tsx`, `_components/`, `actions.ts` | reviewers, the team | One dynamic route, so an unknown slug renders the same gate (S12b) |
| Admin routes | `apps/web/app/admin/` (`layout.tsx`, `experiments/`, `experiments/[slug]/{reviewers,codes,data}/`, `data/`, `people/`) | the team | One consumer |
| Confirmation email | `apps/web/app/experimental/[slug]/review/send-confirmation.ts` | the review action | Calls `mailer` from `apps/web/lib/email.ts`, one function per message (`packages/email/README.md`) |
| Role writes | the People action, through `apps/web/lib/supabase/admin.ts` | People only | The existing service-role seam |
| Input validators | `apps/web/lib/sandbox/validators.ts` | sandbox actions only | One consumer; `@pem/validators` takes them when a second consumer appears |

**Transport (D-LAB-43).** Server actions only, each thin: validate, `resolveViewer`, one call, return a fixed result. No route handler and no tRPC procedure, so no new public API shape (`apps/*/app/api/**` stays untouched).

**Enforced, not hoped (door 4).** A lint rule lets only `apps/web/lib/sandbox/**` import `@pem/db/sandbox`, and keeps `getDb` and the sandbox schema off every other sandbox file. It is a `boundaries.js` element in the `web-ai-route` pattern, named `web-sandbox`. The isolation tests then prove what the one module does.

## Roles (door 1, D-LAB-35)

- `APP_ROLES` gains `developer` (`packages/db/src/rls.ts:15`), so `roleOf` and the bridge accept it (`:37-48`).
- Outside the sandbox a developer is a `user`: `appUserIsAdmin` is an exact `'admin'` match (`packages/db/src/policies.ts:23`), and the tRPC admin tier refuses anything but `admin` (`packages/api/src/trpc.ts:60`). Both verified 2026-10-05.
- **No developer-or-admin policy twin in v1.** Every sandbox table is service-only, so no policy would read it. A seam ships with its first consumer (conventions rule 9, EN-05). The team check is a TypeScript test of the role in `apps/web/lib/sandbox/team.ts` (`getTeamMember()`, LAB-2), which `access.ts` calls first; the twin arrives with the first table that needs it.
- People writes `app_metadata.role` through the service-role client.
  - The last-admin guard runs in the action, inside a Postgres advisory lock.
  - Two admins demoting each other in the same instant is an accepted, recoverable race: the runbook's first-admin script restores an admin.

## The stack entry (door 5, D-LAB-39)

`toolkit.json` `stack["experimental-sandbox"]`, modelled on `billing` and `ai`:

- `files`: `apps/web/app/experimental`, `apps/web/app/admin`, `apps/web/lib/sandbox`, `packages/db/src/schema/sandbox`, `packages/db/src/sandbox`, `packages/db/test/sandbox`
- `env`: `SANDBOX_SECRET`
- `dependencies`: none
- `boundaries`: `web-sandbox`
- `locked`: false
- `runbook`: `docs/runbooks/remove/experimental-sandbox.md`

No new package and no new dependency, so no record and no Quartermaster.

**What removal undoes in shared files:**

| Shared edit | Removal |
| --- | --- |
| `next.config.ts` noindex headers, the `env.ts`, `turbo.json` and `.env.example` lines, the `schema/index.ts` exports, the `@pem/db/sandbox` export, the `web-sandbox` element | Undone by the runbook; `check-stack` proves it |
| The sandbox tables | Dropped by a new forward migration; applied migrations are never edited |
| `developer` in `APP_ROLES` | Undone only when no other feature reads it. Holders fall back to `user` through `roleOf` (`context.ts:65-70`), so no data change is forced; the runbook offers a script to clear the value |
| `sandbox_actions` rows | Dropped with the tables; the runbook says so before the drop, since the record goes too |
| Roles held in `app_metadata` | Stay. `admin` predates LAB |
