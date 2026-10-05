---
title: New project — what a duplicate strips
description: Follow from step 2 of the new-project guide, before the rename. Lists what belongs to this repo's own history (its specs, build prompts, research, changelog and demo), what to do with each, what stays as inherited law, and the checks that prove nothing live still points at a deleted file.
layer: runbooks
status: draft
thread: "PEM"
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-05
supersedes:
load_when:
---

# What a duplicate strips

> **Run from:** step 2 of [`README.md`](README.md), before [`rename.md`](rename.md), using the operator's answer to E3.
> **The test for each item:** does it describe how this toolkit was built, or how a product is built with it? The first goes. The second stays.

## Delete

Work down the table. Nothing is committed until the end of the guide's step 2.

| #   | What                                                                                            | Action                                                                                                                                          | Why it goes                                                                                                             |
| --- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | Everything under `specs/`                                                                       | Delete it all: the epics, tickets, one-offs and `specs/_status.md`                                                                              | This repo's own tickets and proofs. The product's first `yarn spec:init` or `yarn contract:init` starts its own.        |
| 2   | `docs/prompts/archive/`                                                                         | Delete the folder. In `docs/prompts/README.md`, delete the archive row of the table and the section "The archive, and a duplicated project".    | The prompts that built the toolkit, phase by phase. `docs/prompts/shared-context.md` and `docs/prompts/research/` stay. |
| 3   | Everything under `docs/research/` except its `README.md`                                        | Delete                                                                                                                                          | The toolkit's bookshelf. A product files its own research there.                                                        |
| 4   | `docs/decisions/changelog.md`                                                                   | Keep the file and its frontmatter; delete every entry below the opening paragraph                                                               | Each entry is a change to this repo. The guide's step 6 writes the product's first entry.                               |
| 5   | `docs/decisions/only-you.md`                                                                    | Keep the file; delete the rows of its tables                                                                                                    | Open calls about the toolkit's build, waiting on its owner                                                              |
| 6   | The demo page, `apps/web/app/page.tsx`                                                          | Replace with a placeholder page that names the product, built from the kit's components and tokens only                                         | It presents the toolkit. Product work starts with the product's first ticket, not here.                                 |
| 7   | A role written for another business: `docs/roles/marketing-growth/drummer-sales-funnel-lead.md` | Ask the operator. On "delete": remove the file and its name from the opening line of that department's `README.md`, then run `yarn gen:agents`. | It is written for one named business, not for products in general                                                       |

## Keep, as inherited

These are also this repo's history, but the files a product keeps cite them, so they stay.

| What                                                         | Why it stays                                                                                   | What the product does                                                                                                                                     |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/decisions/records/`, records 0001 to 0011              | The practice links to them: the stack, file naming, the subagents, the catalog                 | Its first record takes the next number. Never renumber.                                                                                                   |
| `docs/decisions/ledger.md` and `docs/decisions/conflicts.md` | Rules across the practice cite their IDs (CF, CS, EN and the rest)                             | Add one line under each title: "Inherited from the toolkit at commit `<the commit noted in step 1>`". The product's own rows go above the inherited ones. |
| `docs/prompts/research/`                                     | Research prompts a product may still run: its first AI feature, its first instrumented feature | Nothing                                                                                                                                                   |
| `docs/references/`                                           | The distilled library                                                                          | Nothing. Its `_meta/` folder names the toolkit owner's own sources and is never loaded; deleting it is optional.                                          |
| `docs/engineering/tooling.md`                                | The reference for every check and hook the product inherits                                    | Nothing. Its timings were measured in the toolkit.                                                                                                        |
| `docs/runbooks/`, this folder included                       | The remove recipes serve a later drop, and this guide is the record of how the repo was made   | Nothing                                                                                                                                                   |
| `packages/catalog/`                                          | The components thread takes from it first ([`components.md`](components.md))                   | Nothing here                                                                                                                                              |

**IDs that now point outside the repo.** Code comments and the remove recipes cite decisions by ID, such as D-STK-6 or D-CAT-7. Those were written in the two epics' technical files under `specs/`, which row 1 deletes. They resolve in the toolkit at the commit noted in step 1, and the set-up record names that commit so a reader can find them.

## After deleting

1. Run `yarn check-refs`. It names each live file that still links to a deleted file. Where the sentence reads without the link, remove the link. Otherwise add the deleted path to `tooling/refs-pending.json`, keyed exactly as the check printed it, with the value `"stripped by docs/runbooks/new-project/strip.md"`. The same check names any pending entry that no longer applies; delete those.
2. Run `yarn directory-map`: the deletions left the generated map and the folder tables stale.
3. Run `yarn gen:agents` if row 7 deleted a role.

## Proof

- `git ls-files specs docs/research docs/prompts/archive` prints one line, the research folder's `README.md`.
- `yarn check-refs`, `yarn check-specs`, `yarn lint:docs`, `yarn gen:agents --check` and `yarn directory-map --check` exit 0.

[ASSUMPTION: `yarn check-specs` and the session-start hook accept an empty `specs/` folder. The earlier guide said so and no duplicate has proven it; the dry run (STK-20) does.]
