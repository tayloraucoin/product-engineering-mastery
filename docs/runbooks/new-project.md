---
title: New project — duplicate this repo, then remove what the product does not use
description: Follow when a product repo starts from this one, holding a briefing; duplicate, rename the scope and prefixes, set the brand, run a removal runbook per dropped module, clear the toolkit's own content, and end on yarn check-stack and yarn verify.
layer: runbooks
status: draft
thread: "STK-3"
role: Usher
date: 2026-10-03
last_reviewed: 2026-10-03
supersedes:
load_when:
---

# New project

> **Who runs it:** an agent or a person holding a one-paragraph briefing; Taylor reviews the result.
> **When:** a product repo starts from this one. The rule is duplicate, then remove ([record 0010](../decisions/records/0010-starter-ships-default-stack.md), D-STK-2): the product starts with the whole default stack and deletes what it does not use.
> **Done means:** step 7's two checks exit 0 in the new repo.
> **Status:** draft until the dry-run ticket (STK-20) runs it cold on a duplicate and times each step.

Every step ends on a check. A step whose check fails is fixed before the next one starts.

## 0. Read the briefing

The briefing supplies five inputs. Find each before step 1; if one is missing, stop at the step that needs it and ask. Never invent a name, a prefix or a vendor choice.

| Input                     | Example (synthetic)                    | Step |
| ------------------------- | -------------------------------------- | ---- |
| Product name              | Northwind Ledger                       | 2, 3 |
| Package scope             | `@northwind`                           | 2    |
| Work-id prefix per app    | `NWL` for the web app                  | 2    |
| Brand: the theme colours  | a primary and its foreground, in OKLCH | 3    |
| Modules the product drops | billing, AI                            | 4    |

## 1. Duplicate

```sh
git clone <toolkit-url> <product-dir>
cd <product-dir>
rm -rf .git
git init -b main
corepack enable
yarn install
yarn hooks:install
yarn doctor
```

[ASSUMPTION: the product starts its own history. Whether it keeps the toolkit as a second remote, to pull later fixes, is for the dry-run (STK-20) to settle.]

**Check:** `yarn doctor` names nothing broken.

## 2. Rename the scope and the prefixes

1. **Scope.** `git grep -l "@pem/"` lists every file that names the scope: package manifests, imports, the ESLint and Prettier configs, `toolkit.json`, and the rules and docs that state the convention. Replace `@pem/` with the briefing's scope in each. Leave `docs/decisions/`, `docs/prompts/` and `docs/research/` alone: they are history, byte-preserved, or cleared in step 5. Then run `yarn install` so `yarn.lock` follows.
2. **Root name.** The `name` in the root `package.json` becomes the product's.
3. **Prefixes.** In `toolkit.json`, each app's `prefix` becomes the briefing's work-id prefix for that app. `toolkitPrefixes` lists the work-ids for changes that belong to no app; replace `PEM` and `PJ` with the product's own.

**Check:** `git grep -n "@pem/" -- . ':!docs/decisions' ':!docs/prompts' ':!docs/research'` prints nothing, and `yarn check-types` exits 0.

## 3. Set the brand

`@pem/brand` (STK-7) will hold the name, URLs, contact, asset paths and the two theme colours, with logos and fonts in its own folder, and a check will fail when it and the token preset disagree (D-STK-9). STK-7 rewrites this step. Until it lands, the brand lives in three places:

- the theme colour tokens in `packages/config/tailwind/preset.css`, light and dark. Change values only; the token names are the design system's (`docs/design/canon.md`);
- the `metadata` title in `apps/web/app/layout.tsx`;
- the `metadata` title in `apps/docs/app/layout.tsx`.

**Check:** `yarn build` exits 0, and `git grep -n "Product Engineering Mastery" -- apps/web/app/layout.tsx apps/docs/app/layout.tsx` prints nothing. The demo page still names the toolkit until step 5.

## 4. Choose the modules

`toolkit.json`'s `stack` block lists one entry per module: its `files`, `env`, `dependencies`, `boundaries` names, `locked` flag and `runbook` (D-STK-13). A `locked` module stays. For each module the briefing drops, follow the entry's `runbook` from top to bottom; its last section marks the entry `"removed": true` and runs the check.

| Module                    | Runbook                                                      | Built by |
| ------------------------- | ------------------------------------------------------------ | -------- |
| Billing (Stripe)          | [`remove-billing.md`](remove-billing.md)                     | STK-16   |
| Error monitoring (Sentry) | [`remove-error-monitoring.md`](remove-error-monitoring.md)   | STK-18   |
| API (tRPC)                | [`remove-api.md`](remove-api.md)                             | STK-14   |
| AI                        | [`remove-ai.md`](remove-ai.md)                               | STK-17   |
| Supabase Auth             | [`remove-supabase-auth.md`](remove-supabase-auth.md)         | STK-12   |
| Supabase database         | [`remove-supabase-database.md`](remove-supabase-database.md) | STK-9    |

Remove in the table's order, from the top of the package graph down (D-STK-1), so no module still present imports one already gone.

Today the `stack` block holds only `config` and `ui`, both locked, and none of the six modules is built. A module that is not in the duplicate has nothing to remove: skip its row.

**Check:** `yarn check-stack` exits 0 after each runbook.

## 5. Clear the toolkit's own content

1. **The demo.** `apps/web` becomes the product's app; what it holds as the toolkit's demo goes. Today that is one page: replace `apps/web/app/page.tsx` with the product's first page. Rewrite `apps/web/AGENTS.md` for the product: it describes the demo. From Phase 3, the demo's routes, its design layer (`apps/web/docs/design/`) and its specs go too.
2. **Research.** Delete everything under `docs/research/` except its `README.md`. Then run `yarn check-refs`: it names each live file that still links to a deleted file. Remove the link, or list it in `tooling/refs-pending.json` with the reason.
3. **Specs.** Delete everything under `specs/`: this repo's epics, tickets and `_status.md`. The product's first `yarn spec:init` or `yarn contract:init` starts its own.

**Check:** `yarn check-refs` and `yarn check-specs` exit 0.

## 6. Fill `.env.example`

STK-4 creates `.env.example`, with the tier grammar of D-STK-3, and rewrites this step. Until it lands, the duplicate has no `.env.example`, no app reads a variable, and this step is empty. Whatever lands, a secret never goes in `.env.example`.

**Check:** `yarn check-stack` exits 0: no variable of a removed module is left.

## 7. Check

```sh
yarn check-stack
yarn verify
```

Both exit 0. Then record the run: the date, the briefing and the minutes per step. STK-20 turns that record into this runbook's trial log.
