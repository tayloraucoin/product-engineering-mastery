---
epic: DEMO
status: draft
---

# DEMO — placement

> Detail for D-DEMO-26 (`../technical.md`). Placement follows one question, who imports this (codebase-conventions §1). `demo/` is a single section, so every importer set below resolves inside it, and nothing reaches `apps/web/components/` except the one shared-chrome edit at the end. Mason, 2026-10-08.

## Routes

The route group `(shell)` keeps every URL as the UX files give it and keeps onboarding out of the shell, which is full-bleed with no shell.

| What                     | Path                                                                                                                                        | Consumer          | Why here                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| Home link                | `apps/web/app/page.tsx`: one text link to `/demo`                                                                                           | home              | D-DEMO-2. The STK-18 `?state=error` throw on home stays as it is                                       |
| `/demo` redirect         | `app/demo/page.tsx`, a Server Component reading the prefs cookie and calling `redirect()`                                                   | `/demo`           | It renders nothing. It goes to `/demo/welcome` until onboarding is finished, otherwise `/demo/records` |
| Demo root                | `app/demo/layout.tsx`: a `data-demo` marker, the store provider and the kit `ToastProvider` (the root layout mounts none)                   | every demo route  | Onboarding and the shell routes share the store                                                        |
| Onboarding               | `app/demo/welcome/page.tsx`, `welcome/_components/`                                                                                         | `/demo/welcome`   | One segment                                                                                            |
| Shell                    | `app/demo/(shell)/layout.tsx`, `(shell)/_components/demo-shell.tsx` and `demo-nav.tsx`. The nav is a `"use client"` leaf for `aria-current` | records, settings | Every shell route sits under it                                                                        |
| Table                    | `(shell)/records/page.tsx`, `records/_components/table/`, `records/_lib/query.ts`                                                           | `/demo/records`   | One segment                                                                                            |
| Form                     | `records/new/page.tsx`, `records/[id]/edit/page.tsx`, `records/_components/form/`, `records/_lib/record-input.ts` (validation)              | new, edit         | `records/` is the deepest segment holding both. Domain sub-folders are allowed (§3)                    |
| Detail and delete dialog | `records/[id]/page.tsx`, `[id]/_components/`                                                                                                | detail            | The dialog is `?dialog=delete` on this page (D-DEMO-4)                                                 |
| Settings                 | `(shell)/settings/page.tsx`, `settings/_components/`                                                                                        | `/demo/settings`  | One segment                                                                                            |

## Shared inside the section

| What                                      | Path                                                                                                                                    | Importers                                                                                    |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Confirm dialog layout (delete, reset)     | `app/demo/(shell)/_components/confirm-dialog.tsx`                                                                                       | `[id]`, `settings`                                                                           |
| P-1 Diff (R3)                             | `app/demo/_components/diff.tsx`                                                                                                         | `[id]`, `welcome` (illustration)                                                             |
| Status badge (word plus shape)            | `app/demo/_components/status-badge.tsx`                                                                                                 | table, detail, welcome                                                                       |
| Store provider and hooks (`"use client"`) | `app/demo/_components/demo-store.tsx`                                                                                                   | every data surface                                                                           |
| Pure modules                              | `app/demo/_lib/`: `fixtures/`, `record.ts` (types), `store.ts` (reducer), `diff.ts`, `clock.ts`, `format.ts`, `prefs.ts` (cookie codec) | the demo's routes and components                                                             |
| State registry and reader                 | `apps/web/lib/demo/states.ts`                                                                                                           | demo pages and the capture harness (R1). That is two places in one app, so it goes in `lib/` |

## Outside the app tree

| What                         | Path                                                                                                                                            | Why                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| e2e and capture harness (R1) | `apps/web/playwright.config.ts`, `apps/web/e2e/demo/<surface>.spec.ts`, `apps/web/e2e/capture.ts`, run as `yarn web:e2e` and `yarn web:capture` | One consumer app. The critic skill and CI call the script and never reimplement it        |
| P-2 (R2)                     | `packages/ui/src/primitives/control/button/button.variants.ts` and its story; the token in `packages/config/tailwind/preset.css`                | Kit and token. Three dialogs use it                                                       |
| Design layer                 | `apps/web/docs/design/` (`DESIGN.md`, `tokens.md`, `components.md`, `anti-patterns.md`, `states.md`, `coverage-gaps.md`, `refs/`)               | Named by `apps/web/AGENTS.md`                                                             |
| Skills                       | `.claude/skills/tk-ui-critic/`, `tk-ui-diverge/`, `tk-motion/`, rows in `REGISTRY.md`                                                           | Sandbox-protected path: the build thread's writes prompt Taylor                           |
| Critic CI (R4)               | `.github/workflows/critic.yml`                                                                                                                  | Kept apart from `ci.yml` so `yarn verify` needs no key                                    |
| Shared chrome edit           | `apps/web/components/shell/floating-theme-toggle.tsx` gains `[body:has([data-demo])_&]:hidden`                                                  | The demo shell has its own toggle, and onboarding has none. Made by the foundation ticket |

No stack entry: the demo is the proving app, not a default-stack feature. A product repo deletes `app/demo/` and `lib/demo/` (judgment).
