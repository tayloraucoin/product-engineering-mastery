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
> **Done means:** `yarn check-stack` and `yarn verify` exit 0 in the new repo, and the result is committed on its branch (step 7).
> **Status:** draft until the dry-run ticket (STK-20) runs it cold on a duplicate and times each step.

Every step ends on a check. A step whose check fails is fixed before the next one starts. Note the time each step starts; step 7 reports the minutes.

## 0. Read the briefing

The briefing supplies seven inputs. If one is missing, ask before step 1. Never invent a name, a prefix or a vendor choice.

| Input                       | Example (synthetic)                                                        | Step    |
| --------------------------- | -------------------------------------------------------------------------- | ------- |
| Product name                | Northwind Ledger                                                           | 3, 5    |
| Repo slug, kebab-case       | `northwind-ledger`                                                         | 1, 2    |
| Package scope               | `@northwind`                                                               | 2       |
| Work-id prefix per app      | `NWL` for `web`, `NWD` for `docs`                                          | 2       |
| Repo-wide work-id prefix    | `NW`, for changes that belong to no app                                    | 1, 2, 7 |
| Primary colour and its text | light and dark values in OKLCH, for `--primary` and `--primary-foreground` | 3       |
| Modules the product drops   | billing, AI                                                                | 4       |

The apps are the keys of `apps` in `toolkit.json`: today `web` and `docs`. Each needs a prefix. The toolkit URL is this repo's remote (`git remote get-url origin`, run in the toolkit).

**Check:** every row has a value.

## 1. Duplicate

Run these, with the slug and the repo-wide prefix from step 0:

```sh
git clone --branch main <toolkit-url> <repo-slug>
cd <repo-slug>
rm -rf .git
git init -b main
git switch -c agent/<repo-wide-prefix>
corepack enable
yarn install
yarn hooks:install
yarn doctor
```

All work goes on the `agent/<repo-wide-prefix>` branch: the hooks refuse commits on `main`, the protected branch. Taylor makes `main` from it.

[ASSUMPTION: the product starts its own history. Whether it keeps the toolkit as a second remote, to pull later fixes, and whether committing on a branch of an empty repo needs anything more, are for the dry-run (STK-20) to settle.]

**Check:** `yarn doctor` names nothing broken.

## 2. Rename the scope and the prefixes

1. **Scope.** `git grep -l "@pem/"` lists every file that names the scope: package manifests, imports, the ESLint and Prettier configs, `toolkit.json`, and the rules and docs that state the convention. Replace `@pem/` with the briefing's scope in each. Leave `docs/decisions/`, `docs/prompts/`, `docs/research/` and `specs/` alone: they are history, byte-preserved, or cleared in step 5, and a recorded contract or `results.json` is never hand-edited. Then run `yarn install` so `yarn.lock` follows.
2. **Root name.** The `name` in the root `package.json` becomes the repo slug.
3. **App prefixes.** In `toolkit.json`, each app's `prefix` becomes the briefing's prefix for that app.
4. **Repo-wide prefix.** `toolkitPrefixes` in `toolkit.json` becomes a list of one: the repo-wide prefix. `PEM` and `PJ` both go.

**Check:** `git grep -n "@pem/" -- . ':!docs/decisions' ':!docs/prompts' ':!docs/research' ':!specs'` prints nothing, and `yarn check-types` exits 0.

## 3. Set the brand

`@pem/brand` (STK-7) will hold the name, URLs, contact, asset paths and the two theme colours, with logos and fonts in its own folder, and a check will fail when it and the token preset disagree (D-STK-9). STK-7 rewrites this step. Until it lands, the brand lives in three places:

- The colours in `packages/config/tailwind/preset.css`. It has three layers (D-STK-17): a raw scale, semantic names set once under `:root` (light) and again under `.dark`, and the bridge that exposes them to Tailwind. Add the briefing's colours as new raw steps in layer 1, for example `--brand-500`. Then point `--primary` and `--primary-foreground` at them in both layer-2 blocks, `:root` and `.dark`. A raw value is written nowhere else; every other semantic name keeps its step unless the briefing names it; the bridge is not touched; token names belong to the design system (`docs/design/canon.md`).
- The `metadata` title in `apps/web/app/layout.tsx`: the product name.
- The `metadata` title in `apps/docs/app/layout.tsx`: `Docs · ` and the product name, the form it has today.

**Check:** `git grep -n -e "--primary:" -e "--primary-foreground:" -- packages/config/tailwind/preset.css` prints four lines (light and dark), each set to one of the new raw steps. `yarn build` exits 0. `git grep -n "Product Engineering Mastery" -- apps/web/app/layout.tsx apps/docs/app/layout.tsx` prints nothing. The demo page still names the toolkit until step 5.

## 4. Choose the modules

`toolkit.json`'s `stack` block lists one entry per module: its `files`, `env`, `dependencies`, `boundaries` names, `locked` flag and `runbook` (D-STK-13). A `locked` module stays. For each module the briefing drops, follow the entry's `runbook` from top to bottom; its last section marks the entry `"removed": true` and runs the checks.

| Module                    | Runbook                                                      | Built by |
| ------------------------- | ------------------------------------------------------------ | -------- |
| Billing (Stripe)          | [`remove-billing.md`](remove-billing.md)                     | STK-16   |
| Error monitoring (Sentry) | [`remove-error-monitoring.md`](remove-error-monitoring.md)   | STK-18   |
| API (tRPC)                | [`remove-api.md`](remove-api.md)                             | STK-14   |
| AI                        | [`remove-ai.md`](remove-ai.md)                               | STK-17   |
| Supabase Auth             | [`remove-supabase-auth.md`](remove-supabase-auth.md)         | STK-12   |
| Supabase database         | [`remove-supabase-database.md`](remove-supabase-database.md) | STK-9    |

Remove in the table's order, from the top of the package graph down (D-STK-1), so no module still present imports one already gone.

A module with no entry in the `stack` block is not in the duplicate: skip its row. Today none of the six is built: the block holds only locked modules, so every row is skipped.

**Check:** `yarn check-stack` exits 0, once after each runbook and once at the end of the step, even when no runbook ran.

## 5. Clear the toolkit's own content

1. **The demo.** `apps/web` becomes the product's app; what it holds as the toolkit's demo goes.
   - Replace `apps/web/app/page.tsx` with a placeholder page that names the product, under the UI rules in `AGENTS.md` (components from the UI package, tokens only). Product work starts with the product's first ticket, not here.
   - In `apps/web/AGENTS.md`, rewrite "What this app is" as one paragraph from the briefing, delete "The filled examples live here", and keep "App rules".
   - If `apps/web/docs/design/` exists, the duplicate is past Phase 3: its demo routes, that design layer and its `specs/web/` go too, and the product fills its own design layer from `docs/design/templates/`.
2. **Research.** Delete everything under `docs/research/` except its `README.md`. Then run `yarn check-refs`: it names each live file that still links to a deleted file. Remove the link where the sentence reads without it; otherwise add an entry to `tooling/refs-pending.json` keyed by the deleted path, exactly as `yarn check-refs` printed it: `"<deleted path>": "cleared by new-project.md step 5"`.
3. **Specs.** Delete everything under `specs/`: this repo's epics, tickets and `_status.md`. The product's first `yarn spec:init` or `yarn contract:init` starts its own.
4. **What describes the toolkit.** Rewrite the opening paragraph of `README.md`, and items 1 ("What this is") and 2 ("Current phase") of `AGENTS.md`'s Start here, for the product, from the briefing. The rest of both files is the practice the product keeps.

**Check:** `yarn check-refs` and `yarn check-specs` exit 0.

## 6. Fill `.env.example`

STK-4 creates `.env.example`, with the tier grammar of D-STK-3, and rewrites this step. Until it lands, the duplicate has no `.env.example`, no app reads a variable, and the step has nothing to do. Whatever lands, a secret never goes in `.env.example`.

**Check:** `yarn check-stack` exits 0: no variable of a removed module is left.

## 7. Check and commit

```sh
yarn check-stack
yarn verify
```

Both exit 0. Commit on `agent/<repo-wide-prefix>` as `<repo-wide-prefix>: new project from the toolkit`, and never push: Taylor pushes and makes `main`. Report to Taylor the date, the briefing and the minutes each step took. STK-20 turns those reports into this runbook's trial log.

**Check:** both commands exited 0, and `git status` shows a clean tree after the commit.
