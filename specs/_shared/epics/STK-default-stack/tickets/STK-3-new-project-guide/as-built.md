# As-built — STK-3

## Shipped against the contract

- **C1:** seven new runbooks with full frontmatter (`layer: runbooks`, `status: draft`, `thread: "STK-3"`, `role: Usher`) and kebab-case names:
  - `docs/runbooks/new-project.md`;
  - `remove-supabase-auth.md`, `remove-supabase-database.md`, `remove-billing.md`, `remove-api.md`, `remove-ai.md`, `remove-error-monitoring.md`.

  `yarn lint:docs` passes.

- **C2:** every path and command the runbooks, the README and the amendment blocks name resolves. The only pending entry this ticket touches is `docs/runbooks/port.md`, which stays in `tooling/refs-pending.json`, reworded to "superseded by docs/runbooks/new-project.md (STK-3)" (non-negotiable 5). Unbuilt modules are named by their ticket only, never by a path (D-STK-19). `yarn check-refs` passes.
- **C3:** `yarn directory-map` regenerated `docs/_generated/directory-map.md` and the table in `docs/runbooks/README.md`; the README's hand-written lines now point a new product repo at `new-project.md`. `yarn directory-map --check` passes.
- **C4:** two fresh-context cold readers, each holding only the guide and a synthetic one-paragraph briefing. The second named steps 0 to 7 and each closing check. The gaps both found were fixed in the guide or are listed for STK-20. Record: `evidence/C4.md`.

Against the non-negotiables:

1. **The guide follows D-STK-14 in order:** duplicate; rename scope and prefixes; set the brand; choose modules and run each removal runbook; clear the demo, `docs/research/` and `specs/`; fill `.env.example`; `yarn check-stack`; `yarn verify`. The additions are listed under Deviations.
2. **The six removal runbooks have identical sections**, in this order: Files to delete, Files to edit, Variables, Dependencies, Boundaries entries, Vendor-side steps, Verify.
3. **No module is built,** so every list reads "Not built yet: STK-n fills this", naming the manifest field it will come from. Each header names the module from `technical.md`'s decisions and the ticket that builds it. Only Verify is live today: set `"removed": true` on the `stack` entry, then `yarn check-stack` and `yarn verify`, both of which exist.
4. **Supabase Auth and the Supabase database each have their own runbook,** and each states what happens when both go. Auth is removed first, because it sits above the database in D-STK-1. With both gone, the vendor steps of both apply and the D-STK-18 guardrails guard nothing. The mirror and the policies are left to STK-11, STK-9 and STK-12.
5. **The README's section is "Starting a product from this repo":** duplicate, then remove, pointing to the guide. `new-project.md` replaces the planned `port.md`, whose pending entry stays, reworded.
6. **`port-dry-run.md` and `engineering-layer.md` each gained one dated amendment block** (2026-10-03, STK-3, applying EN-10). Their bodies are unchanged. `engineering-layer.md`'s block sits where its own text says later rulings go.

## Deviations

- **The guide adds what D-STK-14 leaves implicit.** These came from the cold readers, and the step order is unchanged (devs_call):
  - a step 0 that lists the seven briefing inputs, with its own check;
  - the `agent/<repo-wide-prefix>` branch, from step 1;
  - step 5.4, which rewrites the README's opening and `AGENTS.md` Start-here items 1 and 2 for the product;
  - a commit after the final checks in step 7.

  The last checks run are still `yarn check-stack` and `yarn verify`; the commit and the report to Taylor follow them.

- **This branch is stacked.** `agent/STK-3` sits on STK-1 and STK-2, both unmerged, and on `agent/PJ-stacked-start` (commits `9ef500f` and `9db344c`: `contract:init` allows stacking, and `tk-kickoff`/`tk-close` became model-invocable, at Taylor's instruction of 2026-10-03, ledger PR-13). Those commits are not STK-3's work and touch none of its planned paths. Taylor merges in that order.
- **One fact in the guide is marked, not settled:** `[ASSUMPTION]` the product starts its own git history, and a first commit on a branch of an empty repo needs nothing more. STK-20 settles both.
- **Changed after the first vigil review (PASS, four should-fix):**
  - step 2's scope rename and its check now also leave `specs/` alone, so the check can print nothing without hand-editing recorded contracts;
  - the README's opening sentence states duplicate-then-remove;
  - `remove-billing.md` reads "STK-16 and STK-21 fill this", and its Verify names both tickets;
  - the runbooks README carries `last_reviewed: 2026-10-03`.

  C1 to C3 were re-proven after these edits and the review re-run. On that re-run, C2 failed once on an environment change, not on STK-3. A `.claude/settings.local.json` appeared on Taylor's machine, and `check-refs` read its pending entry ("machine-local and untracked by design") as stale. At Taylor's choice, PJ commit `2287cea` makes a git-ignored pending entry never stale, with two tests, and C2 was re-proven. That fix lies outside STK-3's planned paths and is not STK-3's work.

- **Changed after the second vigil review (FAIL, one Blocking).** STK-6, building in parallel on this shared branch (PR-14), moved the preset to three layers with dark mode under `.dark` (D-STK-17). Step 3 still named a `prefers-color-scheme` block. Step 3 now says:
  - add the briefing's colours as raw steps in layer 1;
  - point `--primary` and `--primary-foreground` at them in the `:root` and `.dark` blocks;
  - leave the bridge alone;
  - and its check greps the four lines, so a miss is visible.

  Step 4's "today" line now says the block holds only locked modules, so it stays true as STK-4 and STK-5 add theirs. The same review noted a Prettier miss in `tooling/check-client-bundle.test.ts`. That file is STK-4's, outside this contract, and is left to that ticket. The other two should-fix findings are Taylor's, under Next. The shipped text has not had a third cold read; STK-20 reads the final text.

- **Changed after the third vigil review (PASS, four should-fix; the detail of the first three is lost from the review file, so they were re-derived from the tree):**
  - Step 3 now covers the docs layout's title template (`%s · PEM Docs`) and description as well as its title, and its check also greps `PEM`.
  - Step 5 runs `yarn directory-map` after the deletions and checks `directory-map --check`.
  - Step 6 describes the `.env.example` STK-4 shipped, taken from STK-4's contract and as-built: every variable commented, the tier forms, and `turbo.json` listing the same names. Its check adds `yarn check-client-bundle`. `.env.example` itself was not read: this session's permissions deny `.env.*`.
  - The fourth finding, `docs/index.md:16`, is Taylor's, under Next.

## Ledger IDs

- EN-10 (the porting rule; its status already names STK-3 as amending the README).
- Relied on: D-STK-1, D-STK-2, D-STK-9, D-STK-13, D-STK-14, D-STK-16, D-STK-18 and D-STK-19 (`technical.md`); record 0010.
- PR-13 (stacked starts) governs how this ticket started; it was added by the PJ commits above, not by STK-3.

## Migrations

applied: n/a

## Test changes

none

## Not verified

- **C4 is a manual criterion.** The evidence is two cold reads by fresh-context subagents (claude-opus-5-5), not a person, and nobody timed a run. STK-20 runs the guide on a real duplicate.
- **Nothing in the guide has been executed:** not the clone, the rename commands, the `git grep` checks or the clearing steps. Open questions for STK-20, from the second read:
  - whether a product keeps `docs/prompts/`;
  - which `apps/web` routes count as demo routes after Phase 3;
  - whether a dropped module that was never built is recorded anywhere;
  - the empty-repo commit.
- **`yarn verify` exits 1 on this branch, for reasons outside STK-3:**
  - `check-specs` reads STK-1's and STK-2's PASSes as stale, because later commits on the stack changed files after they were recorded, and STK-2 is still closing;
  - `yarn budget` fails the evaluator-pass row at 7,075 of 7,000 tokens, the same figure measured before any STK-3 edit.

  Every later verify step passes when run alone: `test:tooling`, `gen:agents --check`, `directory-map --check`, `lint`, `lint:boundaries`, `check-types`, `check-types:tooling` and `build`.

## Model

claude-opus-5-5, Claude Code 2.1.232

## Next

Taylor reads `review-vigil.md`, decides the evaluator-budget row before the stack merges (vigil should-fix 4), and merges STK-1, STK-2, `agent/PJ-stacked-start`, then STK-3. `docs/index.md:16` still describes the old porting rule ("copies what it needs ... the port runbook in `README.md`"). It is outside this contract and needs plan mode: a one-line follow-up for Taylor (vigil should-fix 3). Next prompt: none yet; the Tickets stage cuts tickets 4 to 6 next.
