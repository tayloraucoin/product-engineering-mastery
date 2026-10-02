---
title: "PJ primer v2: file the engineering layer and workflows, then build it"
description: "Run in Claude Code (Lorimer) to start the PJ thread: preflight, file the PJ inputs, then execute pj-engineering-layer.md from J0 with amendments A1 to A12 and the owner's stop points."
layer: prompts
status: draft
thread: P-J
role: Lorimer
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when: on request
---
# PJ primer v2: file the engineering layer and workflows, then build it

**Venue:** Claude Code, on the deepest available model, in `~/lighthouse/product-engineering-mastery`.

You are Lorimer, the agent harness engineer. Before acting, read `docs/roles/engineering/lorimer-agent-harness-engineer.md` and `docs/prompts/00-shared-context.md`. Consult Warden, Touchstone, Quartermaster, Usher, Scribe and Mason by function, without co-piloting. Usher owns the workflow docs and the prompt builder (J14).

## Attached

**Required:**
- `@~/Downloads/pj-engineering-layer-lorimer.md`: the PJ report. Rulings, the asset checklist E-01 to E-55, budget, build order and tests.
- `@~/Downloads/pj-engineering-layer.md`: the build prompt, steps J0 to J13.
- `@~/Downloads/pj-conventions-locked.md`: Taylor's locked conventions, and amendments A4 to A12.
- `@~/Downloads/workflows-index.md`, `@~/Downloads/workflows-one-off.md`, `@~/Downloads/workflows-epic.md` and `@~/Downloads/workflows-glossary.md`: the workflow docs.

**Optional.** If any is missing, skip it and note that in the changelog entry.
- `@~/Downloads/pj-engineering-research-lorimer.md`: message 1, the research, methodology table, inventory and conflicts.
- `@~/Downloads/pj-crucible-review.md`: message 2, Crucible's red-team review.
- `@~/Downloads/spec-system-guide.md`: Taylor's previous ticket system, used as context for the tickets stage file.

**Precedence for this thread.** The report is the law. The amendments (A1 to A3 below, and A4 to A12 in the conventions file) change it where they say so. Where the build prompt and the report disagree, the report wins. Record each such case in the changelog.

## Phase 0: preflight (no changes)

1. Confirm you are in `~/lighthouse/product-engineering-mastery` with a clean tree on `main`. If the tree is dirty, stop and show me `git status`.
2. Run `yarn verify` and `yarn budget`. Record the always-on token count and each build row as the baseline. If verify is red before you touch anything, stop and report it.
3. Read `pj-conventions-locked.md` in full. List any amendment you think conflicts with the report in a way it does not acknowledge. If you find one, stop and show me.
4. Create the work branch `agent/PJ` from `main`. All PJ work happens on this branch. Never push.

## Phase 1: file the inputs (one commit)

Follow record 0006's filing rules exactly.

1. **The report.** File `pj-engineering-layer-lorimer.md` byte-identical at `docs/research/pj-engineering-layer-lorimer.md`. Add its entry to `docs/_generated/filing-manifest.json` and its "Filed verbatim" ignore line.
2. **The conventions file.** File `pj-conventions-locked.md` the same way at `docs/research/pj-conventions-locked.md`. It already carries PEM frontmatter.
3. **The optional inputs.** File whichever are attached into `docs/research/` the same way. Add PEM frontmatter only if the filing rules allow it without altering the body; otherwise wrap them per record 0006. Use these descriptions:
   - research: "Read only to trace a PJ methodology verdict or the inventory behind docs/engineering/index.md."
   - review: "Read only to trace which PJ verdicts Crucible changed and why."
   - spec guide: "Read only to trace the ticket-writing rules the tickets stage file adapts; its examples belong to another product."
4. **The build prompt.** File `pj-engineering-layer.md` at `docs/prompts/pj-engineering-layer.md` and add its row to `docs/prompts/index.md`. Then replace its "Amendments in force: none yet." blockquote with the block below. This is the only change to its body.

> **Amendments in force (2026-10-02, primer v2):**
> - **A1. Branch and commits.** This thread runs on branch `agent/PJ`, not `main`. Its work-id is `PJ`. Commit messages are `PJ: <step> <outcome>`, for example `PJ: J3 bash guard with fixtures`. `toolkit.json` carries `toolkitPrefixes: ["PEM", "PJ"]` (A4), so bash-guard admits this thread's own commits. Done criterion 7 reads: every commit starts with `PJ:`, the tree is clean, nothing is pushed, and `agent/PJ` is ready for Taylor to merge.
> - **A2. Hooks register when their script lands.** J2 writes `.claude/settings.json` with permissions and the sandbox only. Each hook is registered in the step that lands its script, after its fixtures pass: bash-guard in J3, results-gate in J5, stop-gate and session-start in J6. A hook is never registered to a script that does not exist. The native git hooks (A9) follow the same rule.
> - **A3. Verification sources.** For V1 to V7, use the installed version (`claude --version`) and the docs at code.claude.com, fetched now. Record each URL and the fetch date. Where the docs and observed behavior disagree, observed behavior wins; record both.
> - **A4 to A12** are in force as written in `docs/research/pj-conventions-locked.md` §2: specs layout and work-ids, contract fields, gates as checks, reviewers by risk, living UX truth, laws outside Claude Code, budget rows, the research exception, and the workflow layer (new step J14).

5. Run `yarn lint:docs`, `yarn directory-map` and `yarn verify`. Commit as `PJ: filing, report, conventions, prompt and amendments filed`.

**The workflow docs are not filed in this phase.** They use a new layer value (`workflows`), so they land in J4 after plan-mode approval (A12).

## Phase 2: execute the build prompt

Execute `docs/prompts/pj-engineering-layer.md` from J0, with A1 to A12 in force.

**Order:** J0 to J7, then J14 if I clear it, then J8 to J13.

**Stop points.** At each one, stop, report, and wait for my reply.

1. **After J0.** Report:
   - V1 to V7, each verified or not as assumed, with version and source.
   - Any mechanism you will change because of a V result. Include any A9 mechanism.
   - The J0 size counts (under half a day / half a day to two days / over two days) and your method.

   Reading `~/lighthouse/synapse` and `~/lighthouse/taylor-aucoin` is read-only `git -C <repo> log` only. Ask me before the first read if the sandbox or permissions block it. Never widen a permission to get past a prompt.
2. **Before J4.** Enter plan mode. Show the exact diffs, with measured token and line counts before and after, for:
   - `AGENTS.md`, `CLAUDE.md` and `docs/index.md`
   - the Workflows row
   - the research exception (A11)
   - the frontmatter lint's new layer value
   - the four workflow docs being filed into `docs/workflows/`

   The work-loop section (E-01) names epics and the living truth in its four lines. If it can't do that within budget, show me the trade-off.
3. **Before J5.** Show the build plan for A4 to A9:
   - the `toolkit.json` shape
   - the `specs/` tree
   - the contract and results schemas, including run records
   - each script's signature
   - the reviewer map rows
   - the fixture list

   Wait for approval. J5 is the step that is expensive to redo.
4. **After J7.** This is the end of the core. Report:
   - `yarn verify` and `yarn budget` output
   - the measured guard latency and `verify:fast` runtime
   - the throwaway cycles from J5 (one epic ticket, one one-off)
   - each amendment's status: built, partly built or deferred
   - anything built differently from the report or the amendments, and why

   I decide then whether J14, and then J8 to J13, run in this session or a fresh one.
5. **Any time a mechanism cannot be built as specified.** Build the closest mechanical equivalent, record the gap, and tell me at the next stop point. Never substitute prose for a check without saying so.

**Stop immediately if:**
- A step needs a cap raised beyond those A10 pre-authorizes.
- A step would edit a filed research body, canon content, or a role body beyond the frontmatter keys the report names.
- A step would add a third-party package. This includes Mermaid for the docs app; record it as held.
- A hook you just registered starts blocking this session's own legitimate commands. If that happens, unregister it, fix the fixture, and re-register.

## Phase 3: close

Run these after the last step you were cleared to run.

1. **Filing and records.** Do the build prompt's "Filing and records" section. The report's own filing already happened in Phase 1, so skip that item. Also:
   - Write one more record from `decision.template.md`: specs layout, work-ids and living UX truth (A4, A8), marked `[PROPOSED — needs sign-off]`.
   - Add an EN ledger line for each convention in the conventions file §1 that is marked Changed or New, citing it.
2. **The changelog's held list** carries:
   - everything in report §11
   - everything in conventions file §3
   - the open items in conventions file §4
   - any open trailing steps
3. **Final report**, at most 15 lines:
   - done criteria 1 to 7, each pass or fail with evidence
   - the always-on token count before and after
   - amendments A4 to A12: built, partly built or deferred
   - what is held for my sign-off
   - what is left to go

   Then stop. I merge `agent/PJ`.

## Standing rules for this session

- No emoji. Synthetic data only, in every fixture.
- No third-party skills, hooks or packages. The cwc patterns are re-implemented, not vendored.
- Every claim about tool behavior carries the version and date it was verified on, in this repo, on this machine.
- Every prompt you write for a human to run opens with a venue line: Claude Code, or general Claude thread.
