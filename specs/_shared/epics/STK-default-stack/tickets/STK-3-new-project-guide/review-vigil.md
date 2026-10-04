# Review — vigil on STK-3

> Written by `yarn review:run vigil STK-3`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: fec182cad4b000ba34ac49a6c13d31ff7948395c6634833c62cc9f9456c1dc72
- as_built_sha256: 61b6228c8db2637baffa4b8a61a59b8f238c3971b2fe4320495b720a879ddb49
- head: 2f78645c561eb9a421067e70ebc47c41d2ea6e81
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T05:29:03Z
- verdict: FAIL

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-3`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-3 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 check: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C1.log (sha256 ba78031e2fd3)
   - C2 check: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C2.log (sha256 79531797a882)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C3.log (sha256 d9a14fbe7e56)
   - C4 manual: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C4-reread.md (sha256 5fea327320f5)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): README.md, docs/_generated/directory-map.md, docs/prompts/phases/engineering-layer.md, docs/prompts/phases/port-dry-run.md, docs/runbooks/README.md, docs/runbooks/new-project.md, docs/runbooks/remove-ai.md, docs/runbooks/remove-api.md, docs/runbooks/remove-billing.md, docs/runbooks/remove-error-monitoring.md, docs/runbooks/remove-supabase-auth.md, docs/runbooks/remove-supabase-database.md, tooling/refs-pending.json.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

# Review — STK-3 new-project-guide (vigil, fresh context)

**Verdict: Blocked.** Five of the six non-negotiables hold cleanly and C1–C3 are met; C4 is not met against the tree as it stands. `docs/runbooks/new-project.md:97` now states a falsehood that tells a reader to skip every removal runbook — including the one module that is built and live — and `yarn check-stack` will not catch the result. The C4 evidence recorded in `results.json` is the re-read that was written specifically to assess the diff that broke it, and it reached PASS without catching it.

## Criterion by criterion

**C1 — frontmatter and file names pass for the seven new runbooks. Met.**
`evidence/C1.log` records `yarn lint:docs` exit 0 at `2656765` ("189 files, names and frontmatter clean"). Verified independently rather than taken on the log: all seven carry `title`, `description`, `layer: runbooks`, `status: draft`, `thread: "STK-3"`, `role: Usher`, `date: 2026-10-03`, `last_reviewed: 2026-10-03`, `supersedes` and `load_when`, with kebab-case names (`new-project.md`, `remove-supabase-auth.md:1-12`, `remove-supabase-database.md:1-12`, `remove-billing.md:1-12`, `remove-api.md:1-12`, `remove-ai.md:1-12`, `remove-error-monitoring.md:1-12`). `docs/runbooks/README.md:9` carries the `last_reviewed: 2026-10-03` the as-built claims.

**C2 — every path and command resolves or is pending with its ticket. Met, with a stale-head caveat.**
`evidence/C2.log` records `yarn check-refs` exit 0, 111 live files, 41 pending, and `tooling/refs-pending.json:4` carries the `port.md` entry reworded exactly as non-negotiable 5 requires. I resolved the guide's references by hand instead of trusting the check: `hooks:install`, `doctor`, `check-types`, `build`, `check-stack`, `check-refs`, `check-specs`, `check-client-bundle`, `directory-map`, `spec:init`, `contract:init`, `verify` all exist (`package.json:19-48`); `toolkit.json`'s `apps.<app>.prefix`, `toolkitPrefixes`, `migrationsDir` and `stack.<module>.{files,env,dependencies,boundaries,locked,runbook}` are all real (`toolkit.json:4-21,170-213`) and `"removed": true` behaves as the runbooks describe (`tooling/check-stack.ts:161-199`). Step 3's grep is accurate: `--primary:` and `--primary-foreground:` appear exactly four times (`preset.css:49,50,66,67`) and the bridge's `--color-primary:` does not match the pattern. Both layouts match the text (`apps/web/app/layout.tsx:10`, `apps/docs/app/layout.tsx:10-17`).

I also hand-resolved the database runbook's filled lists, which are newer than the cold-reader record: the root scripts and `yarn check-migrations &&` in `verify` (`package.json:13,43-48`), `migrationsDir` (`toolkit.json:21`), `workspacePackage("db", "db")`, the `db` entry in `PACKAGE_IMPORTS`, the `postgres` and `drizzle-kit` entries in `SDK_OWNERS` and the layer-order comment (`boundaries.js:6,50,59,64-65`), the `@pem/db` row and SDK paragraph (`codebase-conventions.md:89,98`) and both tech-stack rows (`tech-stack.md:39-40`). Every one exists. See Should-fix 1 for why that hand-check was necessary.

**C3 — the generated map lists the new runbooks and is current. Met.**
`evidence/C3.log` records `yarn directory-map --check` exit 0. All seven appear in `docs/_generated/directory-map.md:408,412-417` and in the generated table at `docs/runbooks/README.md:28-37`; the hand-written lines above the marker point a new repo at the guide (`docs/runbooks/README.md:20`).

**C4 — a reader holding only the guide can name every step and the check that ends it. Not met at the recorded head.**
The structure is sound: steps 0 to 7 each carry one `**Check:**`, the step-0 table has seven fillable rows, D-STK-14's order is followed exactly, and "Done means" (`:18`) agrees with step 7's check (`:133`). `evidence/C4.md` is an honest record of two cold reads with their gaps and fixes. But the recorded evidence is `evidence/C4-reread.md`, written at `5770423` to certify the diff that filled the database runbook, and it concluded PASS while step 4's standing claim about the tree became false in that same diff — see the Blocking finding. A reader dropping the database follows the guide to a wrong result, so the criterion fails on the file the criterion is about.

**Non-negotiables.** 2, 4, 5 and 6 hold. The six removal runbooks carry the seven prescribed sections in one identical order. Auth and database each have their own runbook and each carries the "When both Supabase modules go" paragraph in a consistent order, auth first per D-STK-1 (`remove-supabase-auth.md:20`, `remove-supabase-database.md:20`). `README.md:38-40` states duplicate-then-remove and points at the guide. Both prompt files gained one dated amendment block and nothing else, proven by their bodies still carrying the stale text the amendments correct (`engineering-layer.md:217,226`). Non-negotiable 3 holds for the five unbuilt modules, which name their ticket and invent nothing; the database runbook is filled by STK-9, which is what the non-negotiable prescribes. Non-negotiable 1's order holds; its truth does not — see Blocking.

## Findings

**Blocking — step 4 tells the reader every module row is skipped, and that is no longer true.**
`docs/runbooks/new-project.md:97`: "Today none of the six is built: the block holds only locked modules, so every row is skipped." Both clauses are false in this tree. `packages/db/package.json` exists, and `toolkit.json:205-212` holds a `db` entry with `"locked": false` and `"runbook": "docs/runbooks/remove-supabase-database.md"`. The guide's own rule two lines above (`:96`) is that only a module *with no entry* is skipped, so the database row must be followed. The failure is silent, not loud: `tooling/check-stack.ts:163-169` only checks that a present module's files exist, so a reader who drops the database, obeys line 97 and skips step 4 reaches step 7 with `packages/db/`, `DATABASE_URL*`, `drizzle-orm`, `drizzle-kit`, `postgres` and the `db` boundaries rows all still in place, and both closing checks exit 0 telling them they are done. That is the exact risk the contract's `slice_type` names, and it inverts D-STK-19 ("the ticket that makes a line untrue updates it"). The fix is one sentence. Owner: STK-9, which made the line untrue and is still closing, or STK-3 if it closes first; whichever lands it, `evidence/C4-reread.md:14-19` needs to be re-derived, because its "Does C4 still hold" section examined this diff and missed this line.

**Should-fix — C1–C3 were proven at a head that is not the head the C4 re-read examined.**
`results.json:12,24,36` record C1–C3 at `265676512147959f`; `evidence/C4-reread.md:3` works at `5770423` and describes `docs/runbooks/remove-supabase-database.md` and `docs/_generated/directory-map.md` changing after the earlier record. Nothing in the ticket's files establishes the order of those two commits, so I cannot say from the files whether `yarn check-refs` ever read the database runbook's filled text — which added roughly twenty new path references. I resolved all of them by hand (above) and all exist, so the live risk is low, but C2's recorded evidence does not demonstrably cover the runbook as it now reads. STK-9's close already lists a C1 capture as outstanding; re-running C1–C3 there closes this. Owner: STK-9.

**Should-fix — the recorded review's first finding is neither fixed nor logged.**
`review-vigil.md:61-62` (the review bound to `results.json`) raised `yarn hooks:install` at `docs/runbooks/new-project.md:53`: `tooling/hooks-install.ts:21-26` exits 1 from a sandboxed agent shell, and the guide names its runner as "an agent or a person" (`:16`) under the rule that a failing check is fixed before the next step starts (`:21`). Line 53 is unchanged and carries no clause about running it in a human terminal, and `as-built.md:52-56` — which otherwise tracks review findings carefully — does not mention it among the third review's items. A recorded finding should end in fixed, declined on the record, or routed to a ticket; this one ended in silence. One clause mirroring `hooks-install.ts:23`'s own fix text closes it. Owner: STK-3 or STK-20.

**Should-fix — `docs/index.md:16` still states the retired porting rule.**
"A product repo copies what it needs, following `docs/runbooks/onboard-agent.md` and the port runbook in `README.md`." Both halves contradict EN-10 and the README this ticket rewrote, and the README no longer contains a port runbook for it to point at. This is on the record (`docs/decisions/changelog.md:67`), outside `planned_paths`, needs plan mode, and is correctly routed under `as-built.md:92` — I re-raise it only because it is the always-on file an agent reads the porting rule from before anything else, and this ticket is what made the cross-reference dangle. Owner: Taylor.

**Consider — the guide and the billing runbook disagree on who fills billing.**
`docs/runbooks/new-project.md:88` gives Billing one builder, STK-16; `docs/runbooks/remove-billing.md:17,22-46` names STK-16 and STK-21. STK-21 is real (`tickets/STK-21-billing-entitlements/contract.md`), so nothing is invented — the table is just the thinner of the two answers.

**Consider — the README's Layout table no longer lists every package.**
`README.md:33-34` names `packages/config` and `packages/ui`; `packages/env` and `packages/db` now exist. Not STK-3's work (STK-4 and STK-9 added them), but `README.md` is this ticket's planned path and a cold reader of "Layout" is now under-informed.

**Consider — the amendment sits below the block that says "newest first".**
`docs/prompts/phases/engineering-layer.md:30` says later rulings are added "here as a blockquote, newest first"; the STK-3 block is a separate blockquote at `:32`, below. `as-built.md:22` claims it "sits where its own text says later rulings go", which is the one as-built claim I could not confirm. Harmless with one amendment, decided for free with one word now.

**Consider — the as-built names the superseded C4 record.**
`as-built.md:13` cites `evidence/C4.md`; `results.json:49` records `evidence/C4-reread.md`. Both files exist, but the as-built never names the re-read that is the recorded evidence, which is also the file that carries the Blocking miss.

## Conversations

One, for Taylor rather than the builder. This ticket has now been reviewed four times, and each review has been overwritten in the single `review-vigil.md`; `as-built.md:52` says outright that "the detail of the first three is lost from the review file, so they were re-derived from the tree." Re-deriving a reviewer's findings from the tree is how a finding like the `hooks:install` one above gets dropped without anyone deciding to drop it. A per-run review file, or an appended record, would make a carried-over finding visible instead of reconstructed. Not a defect in this ticket, and not my lane to settle.

## What I could not verify

- **`.env.example`'s contents.** Denied by this session's permissions, exactly as `as-built.md:55` says. Step 6's description of it rests on STK-4's contract. I confirmed the file must exist — `toolkit.json:180` lists it under a present, locked module and `check-stack` exits 0 — but not its comments or tier forms.
- **That the two prompt bodies are byte-identical to `main`.** No diff available. The strongest proxy holds: both still carry the stale text their amendments exist to correct (`engineering-layer.md:217,226`, `port-dry-run.md:19`).
- **The commit order of `2656765` and `5770423`.** Not derivable from the files; this is Should-fix 1.
- **Anything executed.** Nothing in the guide has been run; `as-built.md:75-84` is honest about that and about `yarn verify` exiting 1 on this branch for reasons outside STK-3.

## Runtime checklist, by risk

1. Fix `new-project.md:97`, then walk step 4 on a duplicate with the database dropped and confirm `yarn check-stack` ends on a `db` entry marked `"removed": true` with `packages/db/` gone.
2. Re-run `yarn lint:docs`, `check-refs` and `directory-map --check` at the final head of the stack, so C1–C3 cover the filled database runbook.
3. Run step 1 verbatim as an agent and confirm whether `yarn hooks:install` stops the run.
4. Decide the evaluator-pass budget row (`as-built.md:82`), then confirm `yarn verify` exits 0 on a fresh duplicate — the guide's own "Done means".
5. Walk step 2's rename and prove the check prints nothing with `docs/prompts/` still naming the old scope.

## Assumptions

`[ASSUMPTION: the precedence ladder is docs/index.md's, as supplied.]` `[ASSUMPTION: the prior review:vigil PASS in results.json is superseded — its contract and as-built hashes do not match the current files, and the SessionStart line lists this review as outstanding.]` Where the contract was silent I tested to the most user-protective reading: a cold agent that cannot ask a follow-up and will believe a sentence that says a row is skipped.

The guide itself is good work — the step-0 table, the per-step checks and the honest `[ASSUMPTION]` are the reasons a cold reader gets through it at all, and the as-built is unusually candid about what it has not proven. One sentence is out of date, and it happens to be the sentence that decides whether a product ships with a database it asked not to have.

VERDICT: FAIL
