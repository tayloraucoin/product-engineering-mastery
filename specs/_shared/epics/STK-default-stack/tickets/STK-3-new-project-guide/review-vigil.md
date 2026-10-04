# Review — vigil on STK-3

> Written by `yarn review:run vigil STK-3`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: fec182cad4b000ba34ac49a6c13d31ff7948395c6634833c62cc9f9456c1dc72
- as_built_sha256: 61b6228c8db2637baffa4b8a61a59b8f238c3971b2fe4320495b720a879ddb49
- head: 3e5f1be000f9464ee009fc13f9da00e880365922
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T03:18:14Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-3`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-3 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 check: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C1.log (sha256 1db1031578b6)
   - C2 check: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C2.log (sha256 c05821a2fcdc)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C3.log (sha256 c351ddf42b7d)
   - C4 manual: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C4.md (sha256 9639f96220d7)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): README.md, docs/_generated/directory-map.md, docs/prompts/phases/engineering-layer.md, docs/prompts/phases/port-dry-run.md, docs/runbooks/README.md, docs/runbooks/new-project.md, docs/runbooks/remove-ai.md, docs/runbooks/remove-api.md, docs/runbooks/remove-billing.md, docs/runbooks/remove-error-monitoring.md, docs/runbooks/remove-supabase-auth.md, docs/runbooks/remove-supabase-database.md, tooling/refs-pending.json.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

# Review — STK-3 new-project-guide (vigil, fresh context)

**Verdict: Pass with conditions.** Every criterion is met, all six non-negotiables hold against the tree, and I found no step that names a file, field or command that does not exist. Three should-fix items and four considers follow; none is in this contract's lane as a blocker.

## Criterion by criterion

**C1 — frontmatter and file names pass for the seven new runbooks. Met.**
`evidence/C1.log` records `yarn lint:docs` exit 0 at `5703e9e` ("189 files, names and frontmatter clean"). Verified independently: all seven files carry `layer: runbooks`, `status: draft`, `thread: "STK-3"`, `role: Usher`, `date`/`last_reviewed: 2026-10-03`, and kebab-case names (`new-project.md`, `remove-supabase-auth.md`, `remove-supabase-database.md`, `remove-billing.md`, `remove-api.md`, `remove-ai.md`, `remove-error-monitoring.md`). The as-built's C1 claim checks out line for line.

**C2 — every path and command resolves or is pending with its ticket. Met.**
`evidence/C2.log` records `yarn check-refs` exit 0, 110 live files, 41 pending. I walked every reference in `new-project.md` by hand rather than trusting the check: `yarn hooks:install`, `doctor`, `check-types`, `build`, `check-stack`, `check-refs`, `check-specs`, `check-client-bundle`, `directory-map`, `spec:init`, `contract:init`, `verify` all exist in `package.json:19-41`. The `toolkit.json` fields the guide names — `apps.<app>.prefix`, `toolkitPrefixes`, `stack.<module>.{files,env,dependencies,boundaries,locked,runbook}` and `"removed": true` — are all real and behave as described (`tooling/check-stack.ts:161-199`, `tooling/lib/toolkit.ts:255-329`; `removed` is an accepted field, and a locked entry cannot be marked removed). `apps/web/app/page.tsx`, `apps/web/AGENTS.md`'s three named headings, `AGENTS.md`'s Start-here items 1 and 2, `docs/design/templates/`, `docs/research/README.md`, `docs/design/canon.md`, `turbo.json`'s variable lists and `record 0010` all exist. The sole pending entry this ticket touches is reworded exactly as the contract demands (`tooling/refs-pending.json:4`).

**C3 — the generated map lists the new runbooks and is current. Met.**
`evidence/C3.log` records `yarn directory-map --check` exit 0. All seven appear in `docs/_generated/directory-map.md:408-417` and in the generated table of `docs/runbooks/README.md:28-37`; the hand-written lines above the generated marker now point a new product repo at `new-project.md` (`docs/runbooks/README.md:18-20`).

**C4 — a cold reader can name every step and the check that ends it. Met on the shipped text, with a stale-evidence caveat.**
`evidence/C4.md` is an honest record: method stated, two reads, verdicts "No" then "Yes", 13 then 9 gaps, each gap either fixed with a commit named or routed to STK-20. It does not overclaim — it says plainly that the readers were subagents, not a person, and that nothing was timed. I re-derived the criterion against the shipped file myself: steps 0 through 7 each carry exactly one `**Check:**` line, the step-0 table has seven fillable rows, and "Done means" (`new-project.md:18`) now agrees with step 7's check line (`:133`), which was Read 2's gap 9. The caveat is in Consider 1 below: Read 2 was at `34f0b1b` and steps 2, 3, 5 and 6 changed after it.

**Non-negotiables.** All six hold. D-STK-14's order is followed exactly (duplicate → rename → brand → modules → clear → `.env.example` → `check-stack`, `verify`). The six removal runbooks carry the seven prescribed sections in one identical order. Every unbuilt list reads "Not built yet: STK-n fills this" and invents nothing; each ticket number traces to `technical.md`'s order, including STK-21, which is a real ticket split from billing at the Tickets gate (`STK-16-billing-stripe/contract.md:13`), not an invented number. Auth and database each have a runbook and each carries the "When both Supabase modules go" paragraph with a consistent order (auth first, per D-STK-1). `README.md:38-40` states duplicate-then-remove and points at the guide. Both prompt files gained one dated amendment block and nothing else — `engineering-layer.md:217` still says "Write `docs/runbooks/port.md`", which is the proof the body was not edited in place.

## Findings

**Should-fix — `yarn hooks:install` cannot succeed for the guide's primary audience, and step 1 does not say so.**
`docs/runbooks/new-project.md:53`, inside step 1's command block. `tooling/hooks-install.ts:21-26` exits 1 from a sandboxed agent shell and prints "From an agent's sandboxed shell, `.git/config` is read-only: run it in your own terminal." The guide names its runner as "an agent or a person" (`:16`) and rules that "a step whose check fails is fixed before the next one starts" (`:21`) — an agent cannot fix this one. The step's own check survives (`tooling/doctor.ts:136-145` makes it a warning, not a failure), so this is a stop, not a wrong result. One clause in step 1, mirroring doctor's fix text, closes it. Owner: STK-3 or STK-20.

**Should-fix — `docs/index.md:16` points at a port runbook the README no longer contains.**
It reads "A product repo copies what it needs, following `docs/runbooks/onboard-agent.md` and the port runbook in `README.md`." Both halves now contradict EN-10 and the README this ticket rewrote. I am filing it knowing it is on the record: `docs/decisions/changelog.md:52` logs the line as stale and scopes STK-3 to the README, so this is not an undisclosed defect and the as-built routes it correctly under Next. I raise it anyway because the file is loaded in every session, it is the one place an agent reads the porting rule before reading anything else, and the cross-reference became substantively dangling as a result of this ticket rather than before it. Outside `planned_paths` and needs plan mode. Owner: Taylor.

**Should-fix — the guide's exit condition cannot currently be met, and the reason is not STK-3's.**
`docs/runbooks/new-project.md:18` and `:128` require `yarn verify` to exit 0. The as-built reports `yarn budget` failing the evaluator-pass row at 7,075 of 7,000 tokens, a figure measured before any STK-3 edit, plus `check-specs` staleness from the unmerged stack. I verified the row exists as a CI contract (`docs/index.md`, Budget per build) and that `budget` sits inside `verify` (`package.json:13`). Nothing here is STK-3's work and the guide is correctly marked `draft` until STK-20, but the guide's "Done means" is unachievable on a duplicate taken today. This is Taylor's call to make on the record before the stack merges, not a change to this ticket.

**Consider — C4's evidence predates the text that shipped.**
`evidence/C4.md:40` places Read 2 at `34f0b1b`; `as-built.md:44-56` then records changes to step 3 (twice, for D-STK-17 and the docs titles), step 2's check, step 5.5 and step 6. The criterion still holds by inspection, and the recorded PASS is fresh at `5703e9e`, but no cold reader has read what shipped. The as-built says so and assigns it to STK-20; I would leave it there rather than re-run a third synthetic read.

**Consider — "the hooks refuse commits on `main`" is true for an agent only.**
`docs/runbooks/new-project.md:57`. `tooling/hooks/bash-guard.ts:555-559` blocks a commit on the protected branch, but that is Claude Code's PreToolUse hook; the native hook a person gets exits 0 on any non-agent branch (`tooling/git-hooks/commit-msg.ts:26`), so a person's commit on `main` is not refused. The instruction (work on `agent/<prefix>`) is right; only the rationale overstates the guard.

**Consider — step 0's Step column omits step 6 for the product name.**
`docs/runbooks/new-project.md:29` maps "Product name" to steps 3 and 5, but step 6 also needs it (`:119`, "Where an example value names the toolkit, replace it with the product's").

**Consider — the next amendment to `engineering-layer.md` inherits an ordering ambiguity.**
`:30` says later rulings are added "here as a blockquote, newest first"; the STK-3 block sits at `:32`, below the existing block rather than above it. Untestable with one later ruling, decided for free with one word now.

**Consider — `docs/decisions/changelog.md:52` now misstates its own record.**
It says "`README.md` and the porting line in `docs/index.md` still state the old rule"; the README no longer does. `docs/decisions/ledger.md:340` was updated ("README.md amended by STK-3") and the changelog was not. Outside this contract; STK-1 owns the changelog and is still closing. Owner: Taylor / STK-1.

## What I could not verify

- **`.env.example`'s contents.** This session's tools cannot reach it, so step 6's description of it (every variable commented, the tier forms, matching names in `turbo.json`) rests on the as-built's reading of STK-4's contract, which the as-built states openly. I confirmed the file must exist — `check-stack` lists it under a present, locked module and runs before the `check-specs` step that fails, so it passed — and I confirmed `turbo.json:5-14` carries the tier forms the guide describes.
- **That the two prompt files' bodies are byte-identical to `main`.** No diff available here. The strongest available proxy holds: both bodies still carry the stale text their amendments exist to correct.

## Runtime checklist, by risk

1. On a real duplicate, run step 1 verbatim as an agent and confirm whether `yarn hooks:install` stops the run (Should-fix 1).
2. Decide the evaluator-pass budget row, then confirm `yarn verify` exits 0 on a fresh duplicate (Should-fix 3).
3. Walk step 2's rename and prove the check prints nothing with `docs/prompts/` still naming the old scope — the open question STK-20 inherits.
4. Walk step 3 against the three-layer preset and confirm the grep prints exactly four lines (I confirmed `preset.css:49,50,65,66` and that `--color-primary:` in the bridge does not match the pattern).
5. Walk step 5 and confirm `check-specs` exits 0 with `specs/` emptied (`check-specs.ts:335` skips the `_status.md` drift check on an empty tree, so this should hold).

## Assumptions

`[ASSUMPTION: the precedence ladder is docs/index.md's, as supplied.]` `[ASSUMPTION: the review record in results.json at 03:08 is superseded — the as-built was edited after it, and C1–C4 were re-recorded at 03:17, so this run is the current review.]` Where the contract was silent I tested to the most user-protective reading: a cold agent that cannot ask a follow-up.

The work is solid and the as-built is unusually honest — it names its own stale cold read, its unexecuted steps, its one `[ASSUMPTION]`, and the two verify failures that are not its own. Nothing here needs relitigating; three items need Taylor's eyes, none of them blocks.

VERDICT: PASS
