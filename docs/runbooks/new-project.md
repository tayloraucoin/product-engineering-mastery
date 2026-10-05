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

The briefing supplies eight inputs. If one is missing, ask before step 1. Never invent a name, a prefix or a vendor choice.

| Input                       | Example (synthetic)                                                        | Step    |
| --------------------------- | -------------------------------------------------------------------------- | ------- |
| Product name                | Northwind Ledger                                                           | 3, 5    |
| Repo slug, kebab-case       | `northwind-ledger`                                                         | 1, 2    |
| Package scope               | `@northwind`                                                               | 2       |
| Work-id prefix per app      | `NWL` for `web`, `NWD` for `docs`                                          | 2       |
| Repo-wide work-id prefix    | `NW`, for changes that belong to no app                                    | 1, 2, 7 |
| Primary colour and its text | light and dark values in OKLCH, for `--primary` and `--primary-foreground` | 3       |
| Typeface and its reason     | a variable font file the product may ship, and one line on why             | 3       |
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

`yarn hooks:install` writes `.git/config`. From an agent's sandboxed shell it exits 1, saying so; a person runs that one line in their own terminal, and the agent goes on from `yarn doctor`.

All work goes on the `agent/<repo-wide-prefix>` branch: the hooks refuse commits on `main`, the protected branch. Taylor makes `main` from it.

[ASSUMPTION: the product starts its own history. Whether it keeps the toolkit as a second remote, to pull later fixes, and whether committing on a branch of an empty repo needs anything more, are for the dry-run (STK-20) to settle.]

**Check:** `yarn doctor` names nothing broken.

## 2. Rename the scope and the prefixes

1. **Scope.** `git grep -l "@pem/"` lists every file that names the scope: package manifests, imports, the ESLint and Prettier configs, `toolkit.json`, and the rules and docs that state the convention. Replace `@pem/` with the briefing's scope in each. Leave `docs/decisions/`, `docs/prompts/`, `docs/research/` and `specs/` alone: they are history, byte-preserved, or cleared in step 5, and a recorded contract or `results.json` is never hand-edited. Then run `yarn install` so `yarn.lock` follows.
2. **Root name.** The `name` in the root `package.json` becomes the repo slug.
3. **App prefixes.** In `toolkit.json`, each app's `prefix` becomes the briefing's prefix for that app.
4. **Repo-wide prefix.** `toolkitPrefixes` in `toolkit.json` becomes a list of one: the repo-wide prefix. `PEM` and `PJ` both go.
5. **Local database name.** `project_id` in `packages/db/supabase/config.toml` becomes the repo slug. The Supabase CLI names the local containers and the data volume after it, so two repos that share an id share one local database.

**Check:** `git grep -n "@pem/" -- . ':!docs/decisions' ':!docs/prompts' ':!docs/research' ':!specs'` prints nothing, and `yarn check-types` exits 0.

## 3. Set the brand

The brand has one source, `@pem/brand` (D-STK-9). `packages/brand/src/brand.ts` holds the name, short name, description, URLs, contact, asset paths and the two theme colours; `packages/brand/assets/` holds the logo, the mark and the font. The web app's manifest, metadata, icon and Open Graph image, and the docs app's metadata, read it. No other file names the brand except the demo page, which step 5 replaces, so this step edits `brand.ts` and `assets/`, and the two colour tokens behind them.

1. **Words.** In `brand.ts`, set `name`, `shortName`, `description`, `urls` and `contact` from the briefing. The site URL per tier is not here: it is `NEXT_PUBLIC_SITE_URL` (step 6).
2. **Logo and mark.** Replace `assets/logo.svg` and `assets/mark.svg`, keeping the file names. The mark is each app's icon.
3. **Typeface.** Replace `assets/fonts/brand-sans.woff2` and its `LICENSE.txt` with the briefing's typeface, keeping the file name. It must be a variable font covering weights 400 to 600, or `src/font.ts` lists its files instead. Replace `assets/fonts/brand-sans-image.ttf` with the same typeface's regular weight as TTF, OTF or WOFF (keep the file name): the Open Graph image draws with it, and its renderer cannot read woff2. The placeholder is Geist; keeping it is the default-typeface tell (canon A-01).
4. **Colours.** In `brand.ts`, set `theme.primary` and `theme.primaryForeground`, light and dark, to the briefing's OKLCH values. The tokens themselves stay in `packages/config/tailwind/preset.css` (D-STK-9, D-STK-17), which has three layers: a raw scale, semantic names set once under `:root` (light) and again under `.dark`, and the bridge that exposes them to Tailwind. Add the same values as new raw steps in layer 1, for example `--brand-500`, and point `--primary` and `--primary-foreground` at them in both layer-2 blocks. Apart from these two mirrored in `brand.ts`, a raw colour is written nowhere else; every other semantic name keeps its step unless the briefing names it; the bridge is not touched.

**Check:** `yarn test` exits 0: the brand package's test fails, naming the token, while `brand.ts` and the preset disagree, and when an asset path in `brand.ts` has no file. `yarn contrast-audit` and `yarn build` exit 0. `git grep -n -e "Product Engineering Mastery" -e "PEM" -- apps/web/app apps/docs/app/layout.tsx packages/brand ':!apps/web/app/page.tsx'` prints nothing. The demo page still names the toolkit until step 5.

## 4. Choose the modules

`toolkit.json`'s `stack` block lists one entry per module: its `files`, `env`, `dependencies`, `boundaries` names, `locked` flag and `runbook` (D-STK-13). A `locked` module stays. For each module the briefing drops, follow the entry's `runbook` from top to bottom; its last section marks the entry `"removed": true` and runs the checks.

| Module                    | Runbook                                                      | Built by       |
| ------------------------- | ------------------------------------------------------------ | -------------- |
| Billing (Stripe)          | [`remove-billing.md`](remove-billing.md)                     | STK-16, STK-21 |
| Error monitoring (Sentry) | [`remove-error-monitoring.md`](remove-error-monitoring.md)   | STK-18         |
| API (tRPC)                | [`remove-api.md`](remove-api.md)                             | STK-14         |
| AI                        | [`remove-ai.md`](remove-ai.md)                               | STK-17         |
| Supabase Auth             | [`remove-supabase-auth.md`](remove-supabase-auth.md)         | STK-12         |
| Supabase database         | [`remove-supabase-database.md`](remove-supabase-database.md) | STK-9          |
| Component catalog         | [`remove-catalog.md`](remove-catalog.md)                     | CAT-3          |

Remove in the table's order, from the top of the package graph down (D-STK-1), so no module still present imports one already gone.

A module with no entry in the `stack` block is not in the duplicate: skip its row. Today one of the six is built: the Supabase database (STK-9) has a `db` entry that is not locked, so a briefing that drops the database follows its runbook. The other five have no entry yet, so their rows are skipped. Read the `stack` block itself rather than this line: each module ticket adds its entry.

**Check:** `yarn check-stack` exits 0, once after each runbook and once at the end of the step, even when no runbook ran.

## 5. Clear the toolkit's own content

1. **The demo.** `apps/web` becomes the product's app; what it holds as the toolkit's demo goes.
   - Replace `apps/web/app/page.tsx` with a placeholder page that names the product, under the UI rules in `AGENTS.md` (components from the UI package, tokens only). Product work starts with the product's first ticket, not here.
   - In `apps/web/AGENTS.md`, rewrite "What this app is" as one paragraph from the briefing, delete "The filled examples live here", and keep "App rules".
   - If `apps/web/docs/design/` exists, the duplicate is past Phase 3: its demo routes, that design layer and its `specs/web/` go too, and the product fills its own design layer from `docs/design/templates/`.
2. **Research.** Delete everything under `docs/research/` except its `README.md`. Then run `yarn check-refs`: it names each live file that still links to a deleted file. Remove the link where the sentence reads without it; otherwise add an entry to `tooling/refs-pending.json` keyed by the deleted path, exactly as `yarn check-refs` printed it: `"<deleted path>": "cleared by new-project.md step 5"`.
3. **Specs.** Delete everything under `specs/`: this repo's epics, tickets and `_status.md`. The product's first `yarn spec:init` or `yarn contract:init` starts its own.
4. **What describes the toolkit.** Rewrite the opening paragraph of `README.md`, and items 1 ("What this is") and 2 ("Current phase") of `AGENTS.md`'s Start here, for the product, from the briefing. The rest of both files is the practice the product keeps.
5. **The generated map.** Run `yarn directory-map`: the deletions above left `docs/_generated/directory-map.md` and the landing-page tables stale.

**Check:** `yarn check-refs`, `yarn check-specs` and `yarn directory-map --check` exit 0.

## 6. Fill `.env.example`

`.env.example` (STK-4) lists every variable, each with a comment saying what breaks without it, in the tier forms of D-STK-3 (`_LOCAL`, `_STAGING`, unsuffixed for production). `turbo.json` lists the same names (`docs/engineering/codebase-conventions.md`).

1. A removed module's variables are already gone: its runbook took them out of both files.
2. Where an example value names the toolkit, replace it with the product's. A value the briefing does not give is asked for, never guessed.
3. Keep every comment. A secret never goes in `.env.example`.
4. The `_LOCAL` Supabase auth values pick how a developer runs locally (D-STK-6); there is no mode variable. Mode A, the default: the `_STAGING` values, so sign-in runs on hosted staging, `yarn db:local` starts the database only and the local auth mirror copies each signed-in user into it. Mode B: the local stack's values, from `yarn db:local:full`, with `yarn db:seed-users` for synthetic users. The comment in `.env.example` says which values go where. The local database listens on every network interface (the Supabase CLI has no setting for it), password `postgres`, and in Mode A it holds mirrored staging emails: on a shared network, set `"ip": "127.0.0.1"` in Docker's daemon settings. `yarn db:local` warns while it is exposed. `yarn db:local:reset` keeps `auth.users`; to wipe mirrored staging emails, run `yarn db:stop --no-backup`, which drops the whole local database.

**Check:** `yarn check-stack` exits 0, so no variable of a removed module is left, and `yarn check-client-bundle` exits 0.

## 7. Check and commit

```sh
yarn check-stack
yarn verify
```

Both exit 0. Commit on `agent/<repo-wide-prefix>` as `<repo-wide-prefix>: new project from the toolkit`, and never push: Taylor pushes and makes `main`. Report to Taylor the date, the briefing and the minutes each step took. STK-20 turns those reports into this runbook's trial log.

**Check:** both commands exited 0, and `git status` shows a clean tree after the commit.
