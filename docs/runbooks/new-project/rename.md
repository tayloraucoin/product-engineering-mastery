---
title: New project — renaming the scope, the repo and the prefixes
description: Follow from step 2 of the new-project guide, after the strip. Lists every place the toolkit's names appear (the package scope, the repo name, the work-id prefixes, the product name, the owner's name), which to change, which to leave, and the order that keeps yarn verify green.
layer: runbooks
status: draft
thread: "PEM"
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-05
supersedes:
load_when:
---

# Renaming

> **Run from:** step 2 of [`README.md`](README.md), after [`strip.md`](strip.md), with the interview's answers A2 to A5; part 5 runs from step 6, with E1.
> **Built from:** a search of this repo on 2026-10-05, at commit `1c0fb5f`. A count below that no longer matches is a sign the toolkit moved; trust the search command, not the count.
> **Not yet run cold.** The dry run (STK-20) times it and corrects it.

## The one trap

Replace the scope with its slash, never the bare letters. The three letters also appear as the file extension of private keys: `Read(**/*.pem)` and `./**/*.pem` in `.claude/settings.json`, `*.pem` in `.gitignore`, the same patterns in `tooling/check-settings.ts`, in `docs/engineering/templates/settings.template.json` and in twelve settings fixtures under `tooling/fixtures/settings/`. Those lines keep agents away from key files. A replace that touches them removes a guard, and `yarn check-settings` fails.

## Where the names are

Searched outside the folders the strip deletes and outside `docs/decisions/`.

| Name                                  | Where                                                                                                                                                                                                                                                                                                                                           | Files            |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| The scope, as `@pem/…`                | Package manifests and imports in `apps/web` (37), `apps/docs` (10) and every package (the catalog alone is 113, the kit 17); `toolkit.json`, the root `package.json`, `eslint.config.mjs`, `prettier.config.mjs`, `.env.example`, `README.md`, `AGENTS.md`; seven files in `tooling/`; two rules in `.claude/rules/`; nineteen files in `docs/` | 292              |
| The scope with an escaped slash       | The message patterns in `tooling/boundaries.test.ts`                                                                                                                                                                                                                                                                                            | 1, counted above |
| The scope with no slash               | One comment in `packages/config/eslint/workspace-resolver.cjs`                                                                                                                                                                                                                                                                                  | 1                |
| The scope in the lockfile             | `yarn.lock`, rewritten by `yarn install`, never by hand                                                                                                                                                                                                                                                                                         | 1                |
| The repo name                         | `name` in the root `package.json`; two lines of `yarn.lock`                                                                                                                                                                                                                                                                                     | 2                |
| The repo-wide prefixes `PEM` and `PJ` | `toolkitPrefixes` in `toolkit.json`                                                                                                                                                                                                                                                                                                             | 1                |
| The app prefixes `WEB` and `DOC`      | `apps.web.prefix` and `apps.docs.prefix` in `toolkit.json`                                                                                                                                                                                                                                                                                      | 1                |
| The local database's name             | `project_id` in `packages/db/supabase/config.toml`                                                                                                                                                                                                                                                                                              | 1                |
| The product name and short name       | `packages/brand/src/brand.ts`, the text in `packages/brand/assets/logo.svg`, the title of `AGENTS.md`, the title of `README.md`, the demo page                                                                                                                                                                                                  | 5                |

## The order

Each part ends on a check. Do not start the next part on a failed check.

### 1. The scope

1. Replace `@pem/` with the new scope in every tracked file except the lockfile, the decision files and this folder. This one command covers both the plain and the escaped form, and cannot touch a `.pem` line:

   ```sh
   git grep -lz -e '@pem/' -e '@pem\\/' -- . ':!yarn.lock' ':!docs/decisions' ':!docs/runbooks/new-project' \
     | xargs -0 perl -pi -e 's{\@pem(\\?/)}{\@<scope>$1}g'
   ```

   Write `<scope>` without the `@`. If the shell guard refuses the command, make the same replacement with the edit tool, file by file, from the list `git grep -l` prints.

2. Edit the one comment in `packages/config/eslint/workspace-resolver.cjs` that names the scope with no slash.
3. Run `yarn install`, so the lockfile follows the manifests.
4. Run `yarn format`. A scope of a different length moves line breaks and table columns, and `yarn verify` starts with a format check.
5. Run `yarn directory-map`, and `yarn check-catalog --write` while the catalog is present.

`docs/decisions/` is left alone: records are history and keep their wording. This folder is left alone so the guide still says what it replaced.

**Check:** this prints nothing:

```sh
git grep -n -e '@pem' -- . ':!docs/decisions' ':!docs/runbooks/new-project'
```

Then `yarn check-types`, `yarn lint`, `yarn lint:boundaries` and `yarn test` exit 0. If `yarn budget` fails, the longer scope pushed an always-loaded file over its cap: shorten the scope or report it; never raise the cap.

### 2. The repo name

Set `name` in the root `package.json` to the folder name (A2), then run `yarn install`.

**Check:** `git grep -n "product-engineering-mastery" -- . ':!docs/decisions' ':!docs/prompts' ':!docs/runbooks/new-project'` prints nothing.

### 3. The prefixes

In `toolkit.json`: `toolkitPrefixes` becomes a list of one, the repo-wide work-id (A4); each app's `prefix` becomes its answer from A5. From here the commit hook admits the product's prefixes, which is why the guide's first commit comes after this part.

**Check:** `yarn check-specs` and `yarn test:hooks` exit 0.

### 4. The local database's name

Set `project_id` in `packages/db/supabase/config.toml` to the folder name. The Supabase CLI names its containers and its data volume after it, so two repos that share an id share one local database. Change it even when the project runs no local database: the add recipe then starts from a correct name. Skip this part when the database is being removed in step 4 of the guide.

**Check:** `yarn test` exits 0.

### 5. The owner's name (from the guide's step 6, only when E1 named someone new)

The toolkit names its owner, Taylor, as the person who signs. These are the places a product's builders and agents read that name as an instruction. Replace the name in each; where the text says "he" or "himself", reword so no pronoun is needed.

| Where                                                                                                                                                  | What names the owner                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `docs/decisions/README.md`, `docs/decisions/only-you.md`                                                                                               | Whose sign-off is waited for; the file's title and description                              |
| `docs/design/templates/ux-overview.template.md`                                                                                                        | Who is interviewed at the UX stage                                                          |
| `docs/engineering/templates/contract.template.md`, `docs/engineering/templates/technical.template.md`, `docs/engineering/schemas/contract.schema.json` | The operator's own look at a ticket; the heading "Calls routed to"                          |
| `docs/runbooks/postmortem/README.md`, `docs/runbooks/postmortem/convention-log.md`                                                                     | Who rules on a convention finding                                                           |
| `docs/engineering/tooling.md`, `docs/product/README.md`, `docs/prompts/research/cold-trial.md`                                                         | Who a cut, a ruling or a trial waits for                                                    |
| `tooling/hooks/bash-guard.ts`, `tooling/review-run.ts`, `packages/db/scripts/reset-local-db.ts`                                                        | Messages an agent is shown: who pushes, who runs a review, who applies a migration          |
| `tooling/contract.ts` with `tooling/contract-run.test.ts`                                                                                              | The wording of the manual criterion, and the test that matches it. Change both in one edit. |

Leave the name where it is history or a comment: `.claude/skills/REGISTRY.md`, changelog lines inside design files, comments in `tooling/`, and the inherited decision files.

**Check:** `yarn test:tooling`, `yarn test:hooks`, `yarn lint:docs` and `yarn directory-map --check` exit 0 (a template's description feeds a generated table, so run `yarn directory-map` first).

## Leave these alone

Each holds the three letters and is not the scope. Renaming any of them buys nothing and separates the product's tooling from the toolkit's, which makes a later fix harder to carry over.

| What                                                           | Where                                                                                                                                               | Why it stays                                                     |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `PEM_…` environment variables                                  | `tooling/` (the hook fixtures, the review runner, the scratch repo, the fast verify)                                                                | Internal switches between the toolkit's own scripts and tests    |
| The lint plugin's name, `pem-tokens`                           | `eslint.config.mjs`, `packages/config/eslint/tokens.js`, `tooling/token-lint.test.ts`, and one waiver comment in `apps/web/app/opengraph-image.tsx` | Four files that must agree. Rename all four in one edit or none. |
| Scratch and cache folder names                                 | `tooling/hooks/session-state.ts`, `tooling/lib/scratch-repo.ts`, `tooling/contract.ts`                                                              | Temporary folders keyed by session                               |
| The planted test secret, `pem-sentinel-…`                      | `tooling/check-client-bundle.ts`, its test and its fixture                                                                                          | Three files that must agree                                      |
| A fixture command naming the old local database                | `tooling/hooks/fixtures/bash-guard.json`                                                                                                            | It tests the guard's pattern, not a real container               |
| The old container's name                                       | `LEGACY_CONTAINER` in `packages/db/scripts/local-image.ts`, and one line of `remove/supabase-database.md`                                           | It names a container only the toolkit's own machines ever had    |
| The Storybook panel's id, `pem/provenance`                     | `packages/ui/.storybook/provenance-panel.ts`                                                                                                        | Internal to the workshop                                         |
| `thread: "PEM"` in frontmatter, and prose about `PEM:` commits | Files under `docs/`                                                                                                                                 | It records which work wrote the file                             |
| The template's example prefix                                  | `docs/engineering/templates/toolkit.template.json`                                                                                                  | A template stays blank                                           |

Two are worth changing when their part of the stack is kept, because someone outside the repo sees them: `appInfo.name` in `apps/web/lib/billing/stripe.ts` (Stripe shows it in the account's request logs) and `FIXTURE_PROVIDER` in `packages/ai/src/fixture-model.ts` (the provider name the local AI fixtures report). Neither is checked by a test.

## Proof for the whole file

`yarn verify` exits 0, run from the guide's step 2 once parts 1 to 4 are done.
