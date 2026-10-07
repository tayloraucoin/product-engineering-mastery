---
title: New project — the interview, then the steps that turn a duplicate into a product repo
description: Follow when a product repo starts from this one. The agent interviews the operator with option questions (names, apps, each part of the stack, the local database, the owner, brand, UX spec), then duplicates, strips, renames, brands, removes, sets the environment and verifies, and prints the prompts for the threads that follow.
layer: runbooks
status: draft
thread: "PEM"
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-06
supersedes:
load_when:
---

# New project

> **Who runs it:** an agent in Claude Code, with the operator answering questions. On the deepest model available: the interview is design work, and a smaller model turns it into a checklist.
> **When:** a product repo starts from this one. The rule is duplicate, then remove ([record 0010](../../decisions/records/0010-starter-ships-default-stack.md)).
> **Done means:** `yarn check-stack` and `yarn verify` exit 0 in the new repo, the set-up record is written, the work is committed on its branch, and the operator holds the prompts for the threads that follow (step 7).
> **Status:** draft. Dry run 1 (21 stops, 61 min) and dry run 2 (11 stops, 44 min) ran 2026-10-05, each stop fixed here; a third run follows. The desk walk at the end is a reading, not a trial.

This folder holds the guide and what it hands out:

| File | What it is |
| --- | --- |
| This file | The interview, then the ordered steps |
| [`strip.md`](strip.md) | What a duplicate deletes because it is this repo's own history (step 2) |
| [`rename.md`](rename.md) | Every place the toolkit's names appear, and the order to change them (step 2) |
| [`branding-process.md`](branding-process.md) | The three-circle pillars method: what the brand is, settled before any colour or typeface (step 3) |
| [`branding.md`](branding.md) | The files a brand must land in, and the prompt for a separate branding thread (step 3) |
| [`components.md`](components.md) | The prompt for the components thread, run after the UX spec exists (step 7) |

## The interview

Ask before anything is copied. Nothing below is guessed: a name, a prefix, a vendor choice or an owner the operator has not given is asked for.

**How to ask.**

- Use the question tool. Each question offers options, the recommended one first and marked "(Recommended)". The operator can always type their own answer.
- Ask in rounds, several questions per round, as many rounds as the answers need. A question the briefing already answers is shown with that answer as the recommended option, so the operator confirms it in one click.
- Every option says what will happen if it is chosen.
- A recommendation follows the rule in its row. Where the row says "ask", there is no recommended option: these are the operator's own words.
- Write the answers back as one table before step 1 and get a yes. That table goes into the set-up record (step 6).

### Round A: names

| # | Question | Options | Sets |
| --- | --- | --- | --- |
| A1 | What is the product called? | Ask. Free text. | The brand's `name`; its `shortName` (the app's home-screen label: the name itself when 12 characters or fewer, otherwise ask) and its one-line `description` (from the briefing, shown in the answer table); the README; the agent contract's title |
| A2 | The repo's folder name? | The product name in kebab-case (Recommended); the operator's own | The clone folder, the root package name |
| A3 | The package scope that replaces `@pem`? | A short scope of two to five letters from the name, as `@syn` and `@cc` are (Recommended, [record 0002](../../decisions/records/0002-package-scope-pem.md)); the full name; the operator's own | Every workspace package name and import |
| A4 | The work-id for changes that belong to no app? | Two or three capitals from the name (Recommended); the operator's own | The branch name, commit messages, the repo-wide prefix that replaces `PEM` and `PJ` |
| A5 | Ticket prefixes for the apps? | Keep `WEB` and `DOC` (Recommended: tickets never leave the repo, so they cannot clash); one prefix per app from the product name | Each app's `prefix` in `toolkit.json` |
| A6 | The product's home URL, support URL and contact addresses? | Ask. "Not yet" keeps the `example.com` placeholders. | `urls` and `contact` in `packages/brand/src/brand.ts` (step 3) |

The app folders keep their names (`web`, `docs`). Only the prefixes change.

### Round B: apps

The starter holds two apps. The web app always stays: it becomes the product.

| # | Question | Options | What each does |
| --- | --- | --- | --- |
| B1 | Keep the docs app, which shows the practice files in a browser? | Keep (Recommended: it is how a person reads the rules, and it costs one build). Remove. | Remove has no recipe yet. The set-up leaves the app in place, records the choice, and step 7 prints a one-off to remove it. |
| B2 | A marketing site? | Not now (Recommended). Pages inside the web app. Its own app. | "Inside the web app" needs nothing at set-up. "Its own app" has no add recipe: the choice is recorded and step 7 prints a line to open it through the prompt builder. |
| B3 | A mobile app? | Not now (Recommended). Yes. | The starter has no mobile app and no recipe for one. "Yes" is recorded as the product's first open decision and step 7 prints a line to shape it through the prompt builder. |

### Round C: the stack, one question per part

For each part: **keep** or **remove**. Recommend "remove" only when the briefing names no use for the part in the first release. Otherwise recommend "keep" and say what keeping costs. "Remove" runs the part's recipe in step 4.

| # | Part | What "keep" costs when unused | "Remove" runs | Depends on |
| --- | --- | --- | --- | --- |
| C1 | Database (Supabase Postgres, Drizzle) | A package with nothing to connect to until its URLs are set | [`remove/supabase-database.md`](../remove/supabase-database.md) | Removing it removes billing too (the event ledger lives in the database package) and the services' example domain |
| C2 | Auth (Supabase Auth) | Every request is served signed out until its keys are set | [`remove/supabase-auth.md`](../remove/supabase-auth.md) | With the database kept, its recipe also clears the local auth mirror. With the API kept, every API request is anonymous until an identity provider replaces auth. |
| C3 | API layer (tRPC) | One provider around the app | [`remove/api.md`](../remove/api.md) | Services stay; pages call them directly |
| C4 | Billing (Stripe) | Off until its keys are set; one table in the database | [`remove/billing.md`](../remove/billing.md) | Needs the database |
| C5 | Email (Resend) | Nothing: without a key the local tier logs the message and sends nothing | No recipe: the part is locked in `toolkit.json` | Tell the operator it stays, and why |
| C6 | AI (the AI SDK, Anthropic) | Nothing: without a key the local tier replays recorded answers | [`remove/ai.md`](../remove/ai.md) | None |
| C7 | Error monitoring (Sentry) | Nothing: without a DSN errors are logged and not reported | [`remove/error-monitoring.md`](../remove/error-monitoring.md) | None |
| C8 | Component catalog (the shelf beside the kit) | A folder no app imports | [`remove/catalog.md`](../remove/catalog.md) | Offer "keep until the components thread" (Recommended): that thread takes what the product needs from the shelf, then removes it |
| C9 | Experimental sandbox (gated design reviews under `/experimental`, the team's `/admin`, seven tables) | Nothing visible: without its secret every reviewer sees the gate and no code can be entered; seven empty tables and the `developer` role | [`remove/experimental-sandbox.md`](../remove/experimental-sandbox.md) | Needs the database, auth and email. Removing the database or auth removes it first. |

After the round, ask one more: **anything to add that is off by default?** Each needs a recipe in [`add/`](../add/README.md). Today there is one, the local Docker database, asked next.

### Round D: the local database (only when C1 is "keep")

| # | Question | Options | What each does |
| --- | --- | --- | --- |
| D1 | Where does the database run on a developer's machine? | A Postgres on each developer's machine, no Docker (Recommended, the default). Hosted only. Local, in Docker. | "Own Postgres": the example files already name it (`127.0.0.1:5432/pem_local`) and `yarn db:setup:local` prepares it; step 5 only renames the database. "Hosted only": step 5 sets the staging tier in the example files and nothing runs on the machine. "Docker": step 5 follows [`add/docker-local-database.md`](../add/docker-local-database.md). |
| D2 | (Hosted only) Which hosted project do developer machines use? | The staging project (Recommended, the default). A separate development project. | "Staging": one Supabase project fewer, and an unmerged migration is applied to the database a preview deployment also uses. "Separate": a second project to pay for and keep migrated, and staging only changes on merge; on a developer's machine its values go in the `_STAGING` slots of `.env.local`, and the example file says so. |

Say this plainly with D1: the database's own integration proofs (`yarn test:db`: row-level security, the billing ledger) refuse any database that is not on the machine itself, so they run on a developer's own Postgres or on Docker's, and never on "hosted only". `yarn verify` does not run them and stays green either way.

### Round E: ownership

| # | Question | Options | Sets |
| --- | --- | --- | --- |
| E1 | Who signs decisions for this product? | Taylor Aucoin, no change (Recommended when Taylor owns the product). Another person, by name. | The default owner in the decision files, the templates and the messages agents see ([`rename.md`](rename.md), part 5) |
| E2 | Where will the code live, and who sets up the accounts? | Ask. | The remote and the hosting, written into the record. A credential is never typed into a thread: the answer is who will set it. |
| E3 | This repo's own history: its specs, build prompts, research and changelog? | Remove all of it (Recommended). Keep some, named. | What [`strip.md`](strip.md) deletes in step 2 |

### Round F: brand

| # | Question | Options | What happens |
| --- | --- | --- | --- |
| F1 | Does brand material exist? | Yes, complete: colours, a typeface and a logo. Partly: a name and a colour or two. No. | "Yes": ask for the attachments below, and step 3 applies them in this thread. "Partly" or "No": step 3 sets the name only, and step 7 prints the branding prompt for its own thread. |

Never recommend an answer to F1: the operator knows what exists.

When the answer is yes, ask for these as attachments, and say which are missing before step 3 starts:

- The logo and the mark (the small square form), as SVG.
- The typeface: a variable `woff2` file covering weights 400 to 600, the regular weight as TTF, OTF or WOFF, and its licence.
- The colours, in any notation: the primary colour and the colour of text on it, for light and for dark, and the neutral greys if the brand has its own.
- Brand guidelines, if written: the voice, what the brand never does.
- The pillar card, if [`branding-process.md`](branding-process.md) has been run. If it has not, the colours and typeface can still be applied in step 3, and step 7 prints the branding prompt so the pillars are settled in their own thread.

Where each lands is one table, [`branding.md`](branding.md) "The files a brand lands in".

### Round G: the UX spec

| # | Question | Options | What happens |
| --- | --- | --- | --- |
| G1 | Does a full UX spec exist: every area, surface and state of the first release? | Yes: attach it, or name where it is. Partly. No. | "Yes": step 7 prints the components prompt with the spec's location in it. "Partly" or "No": step 7 prints the UX-spec prompt, and the components prompt waits for the spec. Also ask what the UX thread should be handed (sketches, competitors, notes, client emails); it goes in that prompt's Attach line. "Nothing yet" is an answer: the Attach line then reads "nothing; work from the briefing". |

## The steps

Each step ends on a check, and a failed check is fixed before the next step starts. From step 2 on, every step also ends with `yarn verify`, so a break is caught in the step that made it. Note when each step starts and ends: step 7 reports the minutes.

One story timing out in `packages/ui`'s stories test while the machine is loaded is not a break: rerun `yarn test` once before fixing anything.

### 1. Duplicate

In the toolkit, note two things for the record: its remote (`git remote get-url origin`) and its commit (`git rev-parse HEAD`). Then, with the folder name (A2) and the repo-wide work-id (A4):

```sh
git clone --branch main <toolkit-url> <folder-name>
cd <folder-name>
rm -rf .git
git init -b main
git switch -c agent/<work-id>
git add -A
corepack enable
yarn install
yarn hooks:install
yarn doctor
```

`yarn hooks:install` writes the git config. From an agent's sandboxed shell it may exit 1, when the duplicate sits outside the sandbox's writable folders, and says so; the operator runs that one line in their own terminal, and the agent goes on from `yarn doctor`. This is the only command in the guide a person must run.

All work goes on `agent/<work-id>`: the hooks refuse commits on `main`. Do not commit yet. The commit hook admits only the prefixes in `toolkit.json`, and step 2 changes them. Stage instead (`git add -A`), and again before each search: the strip and the rename search with `git grep`, which sees only tracked files. A staged file is deleted with `git rm -rf`; plain `git rm` refuses it.

**Proof:** `yarn doctor` names nothing broken, and `yarn verify` exits 0 before anything is changed. A duplicate that is not green at the start is a toolkit defect: stop and report it.

**Before step 2.** Open a new Claude Code session in `<folder-name>`, hand it the confirmed interview table, and run steps 2 to 7 there. A session opened in the toolkit runs the toolkit's hooks, which read the toolkit's `toolkit.json` and refuse a commit under the product's work-id.

### 2. Strip, then rename

Strip first. It deletes about 200 files that name the old scope, so the rename has less to touch.

1. Follow [`strip.md`](strip.md), using the answer to E3.
2. Follow [`rename.md`](rename.md), using A2 to A5.

**Proof:** each file ends on its own checks. Then `yarn verify` exits 0.

### 3. Brand

- **Brand material exists (F1 yes).** Apply it here: fill every row of the table in [`branding.md`](branding.md) "The files a brand lands in", in its order, from the attachments. Ask for a missing value; never pick a colour or a typeface for the operator.
- **Otherwise.** Set the words only: in `packages/brand/src/brand.ts`, the `name`, `shortName`, `description`, `urls` and `contact` from the interview, and the text in `packages/brand/assets/logo.svg`. The grey placeholder colours and the placeholder typeface stay until the branding thread replaces them.

**Proof:** `yarn test` exits 0 (the brand package's test compares `brand.ts` with the token file and checks that every asset path has a file), `yarn contrast-audit` exits 0, and `yarn verify` exits 0. With material applied, open `yarn ui:storybook` and look at one page of components in light and in dark.

### 4. Remove the parts

For each part answered "remove" in round C, follow its recipe from top to bottom. Its last section marks the part `"removed": true` in `toolkit.json` and runs its checks.

Remove in this order, from the top of the package graph down, so nothing still present imports something already gone: billing, error monitoring, API layer, AI, experimental sandbox, auth, database, catalog. The sandbox goes before auth and the database, which it needs. The catalog waits for the components thread unless C8 said "remove now".

**Proof:** `yarn check-stack` and `yarn verify` exit 0 after each recipe, and once at the end of the step even when no recipe ran.

### 5. The environment and the database

`.env.example` at the root lists every variable with a comment saying what breaks without it; `packages/db/.env.example` lists the database scripts' variables; `turbo.json` lists the same names.

1. A removed part's variables are already gone: its recipe took them out.
2. Where an example value names the toolkit, replace it with the product's. Keep every comment, renaming what it names. The local database `pem_local` becomes `<folder-name>_local`, with underscores for hyphens, so the product and the toolkit never share one database on a machine. A secret never goes in an example file.
3. **Own Postgres (D1, the default).** Nothing more to do: both example files already set `DATABASE_ENVIRONMENT=local` with the `_LOCAL` URLs naming a Postgres on the developer's machine, and `yarn db:setup:local` creates the database, the roles and the auth schema Supabase would otherwise provide, then migrates it. The database scripts refuse an unset tier rather than guessing. Tell the operator: each developer needs Postgres.app or a Homebrew Postgres running, and runs `yarn db:setup:local` once.
4. **Hosted only (D1).** In both example files set `DATABASE_ENVIRONMENT=staging` and replace the comment line above it with one saying this project runs no database on a developer's machine and uses the hosted project chosen in D2 (name which). The example file is what each developer copies to `.env.local`, so the choice travels with it. Leave `packages/db` as it is. Then read "What hosted only means" below to the operator.
5. **Local, in Docker (D1).** Follow [`add/docker-local-database.md`](../add/docker-local-database.md).
6. **Hand to the operator, by name (E2):** creating the hosted projects, and copying the example file to `.env.local` in `apps/web` and in `packages/db` with real values. The agent never asks for a value in the thread.

**What hosted only means.** The tier switch selects every service at once, not only the database. On a developer's machine at the staging tier:

| Service | What changes from the local tier |
| --- | --- |
| Database | Reads and writes the hosted project. `yarn db:migrate` and `yarn db:setup` change it, and an agent stops for the operator's yes before either. |
| Auth | Sign-in runs on the hosted project and its users are the database's users. The local auth mirror never runs. |
| Email | A send is real when the staging key is set, and throws when it is not. |
| AI | A call reaches the live model and spends when the staging key is set. No recorded answers. |
| Billing | The staging keys, which are test keys. |
| Error monitoring | Reports to the staging project when its DSN is set. |
| Not available | `yarn db:setup:local`, `yarn db:local:reset` and `yarn test:db` refuse in their first line until the tier is local; `yarn db:local` and `yarn db:local:full` refuse too, naming the add recipe. `yarn db:stop` (the bare CLI) and `yarn db:seed-users` (which refuses any auth URL that is not this machine) stay in `package.json` and need Docker. |

**Proof:** `yarn check-stack` and `yarn check-client-bundle` exit 0, then `yarn verify`. The database itself is proven later, by the operator's first `yarn db:migrate` against the hosted project; say so in the report rather than claiming it.

### 6. The owner, the record, and the files that describe the toolkit

1. **The owner (E1).** When the answer is a new name, follow part 5 of [`rename.md`](rename.md).
2. **What describes the toolkit.** Rewrite for the product, from the interview: the title and opening paragraph of the root `README.md`; the title and items 1 and 2 of "Start here" in `AGENTS.md`; and "What this app is" in `apps/web/AGENTS.md`, deleting its "The filled examples live here" section. The rest of those files is the practice the product keeps.
3. **The set-up record.** Fill [`decision.template.md`](../../decisions/decision.template.md) as the next numbered record under `docs/decisions/records/`: the interview table, every part removed and why, the database choice, the owner, the toolkit's remote and commit from step 1, and each choice that has no recipe yet (B1 to B3). Add its line to the ledger, under a heading named for the product above the inherited rows, in an ID family of two letters from the work-id (for `LRK`, `LR-01`); then the first entry of the product's own changelog.
4. Run `yarn directory-map`.

**Proof:** `yarn lint:docs`, `yarn check-refs` and `yarn directory-map --check` exit 0, then `yarn verify`.

### 7. Verify, commit, hand over

```sh
yarn check-stack
yarn verify
```

Both exit 0. Commit on `agent/<work-id>` as `<work-id>: new project from the toolkit`. It is the repo's first commit, made in the duplicate's own session. Never push: the operator pushes and makes `main`.

Then print, each in its own block so it can be copied whole:

1. **The branding prompt** from [`branding.md`](branding.md), when F1 was not "yes", or when it was "yes" and no pillar card came with the material.
2. **The UX-spec prompt** below, when G1 was not "yes".
3. **The components prompt** from [`components.md`](components.md), with a note that it runs once the UX spec exists, or now when one was attached.
4. **One line per choice with no recipe** (B1 remove, B2 its own app, B3 yes): "Open a new thread and describe this to the prompt builder: …".

The UX-spec prompt:

```text
Venue: Claude Code, in the new repo, on the branch that is checked out.
Model: the deepest available (Fable 5.1 today). A smaller model writes screens and misses states.

/tk-prompt

Build the prompt for: a full UX spec for <product>, before any feature is built.
Track: product spec. Lead: Vesper. Support: Compass for what the first release is for, Gloss for the words.
What exists: <the briefing, in three lines>. Brand: <applied / in its own thread>. Stack kept: <the list from the set-up record>.
The spec covers every area, surface and state of the first release and is written under specs/web/ux/, one overview per area and one file per surface, from docs/design/templates/ux-overview.template.md and ux-surface.template.md.
Attach: <what the operator named: sketches, a competitor, notes, client emails>.
Done when: a build thread could build any surface from its file without asking a question, and the components thread can list every component the product needs from it.
```

Report to the operator in eight lines or fewer: what was removed, what was kept, the minutes per step, each `[ASSUMPTION]` made, what waits for them (the hooks line, the accounts and `.env.local` files, the first migration, the push), and the prompts printed.

**Proof:** both commands exited 0, and `git status` shows a clean tree after the commit.

## Desk walk: a web-only app, no billing, no AI, hosted database, brand exists

Read through on 2026-10-05 against the toolkit at commit `1c0fb5f`. Nothing was run on a duplicate, so no minutes are recorded.

**The interview.** A1 "Northwind Ledger" (a made-up product). A2 `northwind-ledger`. A3 `@nwl`. A4 `NW`. A5 keep `WEB` and `DOC`. B1 remove the docs app (web-only). B2 not now. B3 not now. C1 keep. C2 keep. C3 keep. C4 remove. C5 stays, locked. C6 remove. C7 keep. C8 keep until the components thread. Nothing to add. D1 hosted only. D2 the staging project. E1 Taylor, no change. E2 the operator's GitHub and Vercel; the operator sets every credential. E3 remove all. F1 yes, complete: logo, mark, a variable font with its licence, a primary colour pair. G1 no. The table is confirmed.

**Step 1.** Remote and commit noted. Clone, fresh history, branch `agent/NW`, install, `yarn doctor`. The operator runs `yarn hooks:install` once. `yarn verify` is green before any change.

**Step 2.** `strip.md`: `specs/`, the prompt archive and the research files go; the changelog and the open-calls file are emptied; the ledger, the conflicts file and the records are cut down to the rulings the remaining files cite; the demo page becomes a placeholder; `yarn check-refs` names the links into deleted research and each is cut or listed. `rename.md`: one replace pass turns the scope into `@nwl` across about 290 files, then `yarn install`, `yarn format`, the root package name, `toolkitPrefixes` to `["NW"]`, `project_id` to `northwind-ledger`. Its grep prints nothing. `yarn verify`.

**Step 3.** Brand exists, so the table in `branding.md` is filled here: the words in `brand.ts`, the two SVGs, the three font files, the primary pair as new raw steps in the token file with the two semantic names pointed at them and mirrored in `brand.ts`, then the product's `DESIGN.md` and `tokens.md` from the templates. `yarn test`, `yarn contrast-audit`, one Storybook page in both themes, `yarn verify`.

**Step 4.** Two recipes, in order: `remove/billing.md`, then `remove/ai.md`. The billing recipe ends with a generated migration that drops its table. `yarn check-stack` and `yarn verify` after each.

**Step 5.** The Stripe and Anthropic variables are already gone. D1 was "hosted only", so both example files get `DATABASE_ENVIRONMENT=staging` and the comment line. The "hosted only" table is read to the operator. Handed over: the Supabase staging and production projects, the two `.env.local` files. `yarn check-stack`, `yarn check-client-bundle`, `yarn verify`.

**Step 6.** The owner is unchanged, so part 5 of `rename.md` is skipped. The README opening, the two "Start here" items and the web app's paragraph are rewritten. The set-up record is written, naming billing and AI as removed, the hosted database on the staging project, and the docs app as "remove, no recipe yet". `yarn directory-map`. The three docs checks, then `yarn verify`.

**Step 7.** `yarn check-stack` and `yarn verify`, one commit, `NW: new project from the toolkit`. Printed: the UX-spec prompt; the components prompt, marked "after the UX spec"; one line to open the docs app's removal through the prompt builder. No branding prompt, because the brand was applied in step 3.

**What the walk found.**

- "Web-only" cannot be finished by this guide: the docs app has no remove recipe, so it is still in the repo at the end. Either a recipe is written, or the guide stops offering "remove".
- Email was not on the operator's list of removals, and could not have been: it is locked.
- The hosted database is the one part the agent cannot prove. Its first proof is the operator's migration, after the thread has reported.
- The rename has never been run. Its counts are from a search of this repo, and whether the first `yarn verify` after it is green is exactly what the dry run must show.

<!-- Generated by `yarn directory-map` from each file's frontmatter. Everything below this line is rewritten; edit above it. -->

## In this folder

| File | What it is for |
| --- | --- |
| [`branding-process.md`](branding-process.md) | Run before any colour, typeface or logo is chosen for a product: ground the brand, dump the words, cut the ones anyone could claim, cluster the rest into three ranked pillars with guardrails, and fill the pillar card every brand, design and copy thread then reads. The source for the branding thread's interview. |
| [`branding.md`](branding.md) | Open from step 3 or step 7 of the new-project guide. Holds the one table of files a brand must fill (words, logo, typeface, colour tokens, the product design layer) with the check each must pass, and the prompt printed for a separate branding thread when no brand material exists yet. |
| [`components.md`](components.md) | Open from step 7 of the new-project guide, once the product has a UX spec. Holds the prompt for the thread that reads the spec, decides which components of the kit and the catalog the product keeps, removes the rest safely, writes the product's component inventory, then checks the kit under the brand or prints the branding prompt. |
| [`rename.md`](rename.md) | Follow from step 2 of the new-project guide, after the strip. Lists every place the toolkit's names appear (the package scope, the repo name, the work-id prefixes, the product name, the owner's name), which to change, which to leave, and the order that keeps yarn verify green. |
| [`strip.md`](strip.md) | Follow from step 2 of the new-project guide, before the rename. Lists what belongs to this repo's own history (its specs, build prompts, research, changelog and demo), what to do with each, what stays as inherited law, and the checks that prove nothing live still points at a deleted file. |
