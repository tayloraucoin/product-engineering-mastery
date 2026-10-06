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

| #   | What                                                     | Action                                                                                                                                                                                             | Why it goes                                                                                                             |
| --- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | Everything under `specs/`                                | Delete it all: the epics, tickets, one-offs and `specs/_status.md`                                                                                                                                 | This repo's own tickets and proofs. The product's first `yarn spec:init` or `yarn contract:init` starts its own.        |
| 2   | `docs/prompts/archive/`                                  | Delete the folder. In `docs/prompts/README.md`, delete the archive row of the table, the section "The archive, and a duplicated project", and the archive clause of its frontmatter `description`. | The prompts that built the toolkit, phase by phase. `docs/prompts/shared-context.md` and `docs/prompts/research/` stay. |
| 3   | Everything under `docs/research/` except its `README.md` | Delete                                                                                                                                                                                             | The toolkit's bookshelf. A product files its own research there.                                                        |
| 4   | `docs/decisions/changelog.md`                            | Keep the file and its frontmatter; delete every entry below the opening paragraph                                                                                                                  | Each entry is a change to this repo. The guide's step 6 writes the product's first entry.                               |
| 5   | `docs/decisions/only-you.md`                             | Keep the file; delete the rows of its tables                                                                                                                                                       | Open calls about the toolkit's build, waiting on its owner                                                              |
| 6   | The demo page, `apps/web/app/page.tsx`                   | Replace with a placeholder page that names the product, built from the kit's components and tokens only                                                                                            | It presents the toolkit. Product work starts with the product's first ticket, not here.                                 |

## Cut down to what is cited

The ledger, the conflicts file and the records are the memory of how the toolkit was built. A product keeps only the rulings its remaining files cite, and starts its own ledger above them. Do this after the deletions above, so files that are already gone do not count as citing anything.

Measured in the toolkit on 2026-10-05: of 259 ledger rows about 30 are cited by a file a product keeps, of 49 conflicts 37 are, and of eleven records seven are.

1. **List what is cited.** IDs first, then records:

   ```sh
   git grep -ohwE '(CF|CS|DC|EN|LB|ME|PO|PR|PU|SK|WT)-[0-9]+[a-z]?' -- . ':!docs/decisions' ':!docs/runbooks/new-project' ':!docs/_generated' | sort -u
   git grep -ohE 'records/[0-9]{4}' -- . ':!docs/decisions' ':!docs/_generated' | sort -u
   ```

   `docs/_generated/` is excluded because its map lists every record. A range such as "CS-01 to CS-16" cites every ID in it: keep them all.

2. **`docs/decisions/ledger.md`.** Keep the frontmatter, the title and "How to read this file". Keep each row whose ID is on the list, under one heading, "Inherited from the toolkit at commit `<the commit noted in step 1>`". Delete every other row, the "Source codes" section and the emptied section headings. A row that names a package in `npmPreapprovedPackages` of `.yarnrc.yml` also stays: a test reads the ledger for it. The product's own rows go above the inherited ones, in its own ID families. Then run the Check's command below; for each new ID it prints, keep that row too, and repeat until it prints nothing new.
3. **`docs/decisions/conflicts.md`.** Keep the frontmatter, the title and each conflict whose `CF` ID is on the list, under the same heading. Delete the rest.
4. **`docs/decisions/records/`.** Delete each record whose number is not on the second list. Today that removes 0001, 0004, 0005 and 0007. If a kept record's `supersedes` field names a deleted one, empty the field. The product's first record takes the next number after the highest the toolkit used, never a freed one.
5. Both files are in `.prettierignore`; leave them there.

**Check:** `yarn check-refs`, `yarn lint:docs` and `yarn test:tooling` exit 0, and the first command in step 1, run again without the `':!docs/decisions'` exclusion, prints no ID that the first run did not.

## Keep, as inherited

These came with the toolkit and a product goes on using them, so they stay whole.

| What                                   | Why it stays                                                                                   | What the product does                                                                                            |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `docs/prompts/research/`               | Research prompts a product may still run: its first AI feature, its first instrumented feature | Nothing                                                                                                          |
| `docs/references/`                     | The distilled library                                                                          | Nothing. Its `_meta/` folder names the toolkit owner's own sources and is never loaded; deleting it is optional. |
| `docs/engineering/tooling.md`          | The reference for every check and hook the product inherits                                    | Nothing. Its timings were measured in the toolkit.                                                               |
| `docs/runbooks/`, this folder included | The remove recipes serve a later drop, and this guide is the record of how the repo was made   | Nothing                                                                                                          |
| `packages/catalog/`                    | The components thread takes from it first ([`components.md`](components.md))                   | Nothing here                                                                                                     |

**IDs that now point outside the repo.** Code comments and the remove recipes cite decisions by ID, such as D-STK-6 or D-CAT-7. Those were written in the two epics' technical files under `specs/`, which row 1 deletes. They resolve in the toolkit at the commit noted in step 1, and the set-up record names that commit so a reader can find them.

## After deleting

1. Run `yarn directory-map`: the deletions left the generated map and the folder tables stale, and a stale table names deleted files.
2. Run `yarn check-refs`. It names each live file that still links to a deleted file. Where the sentence reads without the link, remove the link. Otherwise add the deleted path to `tooling/refs-pending.json`, keyed exactly as the check printed it, with the value `"stripped by docs/runbooks/new-project/strip.md"`. The same check names any pending entry that no longer applies; delete those.

## Proof

- `git ls-files specs docs/research docs/prompts/archive` prints one line, the research folder's `README.md`.
- `yarn check-refs`, `yarn check-specs`, `yarn lint:docs`, `yarn gen:agents --check` and `yarn directory-map --check` exit 0.

`yarn check-specs` and the session-start hook accept an absent `specs/` folder: dry run 1 (STK-20) proved it on 2026-10-05.
