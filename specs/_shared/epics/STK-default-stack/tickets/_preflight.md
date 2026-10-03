# Pre-flight — STK

> Written by `yarn review:run vigil STK` (the Tickets gate). Never edit it: `contract:init` starts a ticket only on its PASS line, and only while the contract's hash still matches.

- head: 2e80f3ec6ba8c666e040531470b9b4e56b8cecff
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-03T22:05:28Z

## Verdicts

- STK-1: PASS (contract f52f0e124d54)
- STK-2: PASS (contract 4e26774e6d11)
- STK-3: FAIL (contract 3f7d1d67b162)

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, running the Tickets gate's pre-flight for epic STK in fresh context. Judge only from the files.

Read the brief (specs/_shared/epics/STK-default-stack/brief.md), the approved UX proposals under specs/_shared/epics/STK-default-stack/ux/, specs/_shared/epics/STK-default-stack/technical.md if it exists, and each drafted contract:
- STK-1: specs/_shared/epics/STK-default-stack/tickets/STK-1-rulings-on-record/contract.md
- STK-2: specs/_shared/epics/STK-default-stack/tickets/STK-2-stack-manifest/contract.md
- STK-3: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/contract.md

For each contract, check: every criterion is testable and names the right evidence type; it cites one surface and the criterion IDs it builds; every state and unhappy path of that surface is covered by this or another ticket; planned paths and depends_on are plausible; nothing is out of the epic's appetite.

Write one line per ticket, exactly in this form, then your findings:
STK-1: PASS or FAIL, with the reason
STK-2: PASS or FAIL, with the reason
STK-3: PASS or FAIL, with the reason

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

Plan built from `brief.md` and `technical.md` before reading any contract; every tooling claim below was traced to a file and line in this session.

**Note on process:** `tickets/_preflight.md` already held a prior run's verdicts (head `2e80f3ec`, STK-1/STK-3 FAIL). It was not on my read list and reading it risked anchoring me. The three contracts have since been revised. I re-derived every claim from the tooling myself and confirmed the eight prior findings I could test; two were fixed, one was fixed in a way that introduced a new defect.

STK-1: PASS, every criterion runs a real script, the cited surface and all three decision IDs resolve, and the generated files its own C3 forces are now in `planned_paths`; C4 is vacuous but leaves no gap behind.
STK-2: PASS, each of the six failure modes of `check-stack` has its own fixture criterion plus a pass case in C7, and all four named scripts exist.
STK-3: FAIL, because non-negotiable 5 orders the removal of the `docs/runbooks/port.md` pending entry, which makes its own C2 (`yarn check-refs`) fail on a live file that is byte-preserved and therefore not editable as a fix.

---

## Findings

### Blocking

**1. STK-3's non-negotiable 5 breaks its own C2, and the obvious repair is forbidden.** Non-negotiable 5 ends "new-project.md replaces the planned port.md (J12), whose pending entry is removed." `tooling/refs-pending.json:4` holds `"docs/runbooks/port.md": "lands in J12"`. That entry is load-bearing: `docs/prompts/threads/branding-insertion.md:26` names `` `docs/runbooks/port.md` `` in a code span, and `check-refs.ts:38-45` excludes only `docs/research/`, `docs/roles/`, `docs/_generated/`, the changelog, `docs/decisions/records/` and `docs/prompts/phases/` — `docs/prompts/threads/` is **live and scanned**. `refsIn` (`check-refs.ts:108-113`) matches that span, `exists()` is false, and with the pending key gone it lands in `missing` and exits 1 (`check-refs.ts:171-184`). So C2 fails.

The repair is not "add the file to `planned_paths`": `.claude/rules/docs.md` makes the verbatim prompts byte-preserved — "a correction is a new file or an amendment block." Reeve must either keep the entry with reworded provenance (`"superseded by docs/runbooks/new-project.md (STK-3)"`) or mandate an amendment block. As written the ticket cannot be completed. Owner: Reeve.

### Should-fix

**2. STK-3 edits two byte-preserved prompt files without saying how.** `planned_paths` lists `docs/prompts/phases/port-dry-run.md` and `docs/prompts/phases/engineering-layer.md`; the latter's J12 line (`:215`) is what STK-3 retires. Both are verbatim prompts under the `docs.md` rule. `engineering-layer.md:20` already shows the sanctioned form — a dated amendment blockquote. Say "by amendment block" in the contract so the builder doesn't rewrite line 215 in place. Neither file is scanned by `check-refs`, so no criterion would catch the violation.

**3. STK-3 cites the wrong ticket number for the dry-run.** `out_of_scope` says "ticket 17 does the dry-run." In `technical.md:56`, ticket 17 is `ai`; the removal dry-run is ticket 20. This matters more than a typo: the Notes require every removal runbook to name "its ticket number from technical.md," so the numbering is this ticket's output, and it is already off by one entry in the contract itself. Owner: Reeve.

**4. STK-1's C4 cannot observe what it claims.** C4 reads "The token budget still holds after the conventions grow," evidence `yarn budget`. `budget.ts` measures `AGENTS.md`, `CLAUDE.md`, `docs/index.md`, the skill and agent listings, `canon.md`, the product design layer, brief/package pairs, skill bodies, path rules, nested `AGENTS.md`, contract-plus-cited-spec, UX surfaces and `vigil.md` (lines 148-252). It never reads `docs/engineering/codebase-conventions.md` or `tech-stack.md`, and STK-1 puts `AGENTS.md` and `docs/index.md` out of scope — so C4 is green no matter how far the conventions grow. Non-blocking because nothing escapes through it (the growth genuinely touches no measured build), but restate it as what `budget` does cover or drop it; `yarn verify` runs `budget` regardless.

**5. STK-1's non-negotiable 3 has no evidence.** "Each changed rule gets one ledger line and one changelog entry" is bound by nothing: C1 checks frontmatter and names, C2 is scoped away from the changelog by design, and C5 reads record 0010 and conventions §4/§5 only. `ledger.md` and `changelog.md` sit in `planned_paths` with no criterion asserting they changed. Widen C5's manual statement to include the ledger line and changelog entry.

**6. STK-2 has no rule for a locked module's `runbook`.** Non-negotiable 2 requires every entry to carry `runbook`; C4 fails an entry missing it; C5 fails an entry whose `runbook` path does not exist; C7 requires `yarn verify` green on the real manifest, which per the Notes holds `config` and `ui` only — and no `remove-config.md` or `remove-ui.md` will ever exist, since a locked module cannot be removed. The builder must rule that a locked entry's `runbook` may be null and that C5 applies only to non-null values. `devs_call` covers "exact field names," which stretches to this, so it is not blocking — but answer it at kickoff rather than in the implementation.

### Consider

**7.** STK-2's C2 fixture bundles three leftover classes (file, env name in `.env.example` or `turbo.json`, dependency in any `package.json`) into one criterion. Acceptable as one fixture, but note `.env.example` does not exist until ticket 4, so `check-stack` must tolerate its absence for C7 to pass.
**8.** STK-1 edits `codebase-conventions.md` and `tech-stack.md`; if either file's frontmatter `description` changes, `docs/engineering/README.md` goes stale and C3 (`directory-map --check`) fails on a path not in `planned_paths`. Retiring the "Deliberately absent" table happens per-module later, so the description probably holds — just don't touch it.
**9.** STK-3 is the heaviest of the three at thirteen planned paths. Still plausible as `small` given "headings and ticket numbers, nothing else," but it is the one to watch against the half-day default.

---

## Conversations

**On the ticket-number convention as the epic's load-bearing habit.** Finding 3 is the second time this numbering has slipped, and the epic's whole defence against documenting unbuilt things is "name a planned module by its ticket number." Those numbers live in exactly one place, an ordered prose list at `technical.md:56`, where inserting a ticket silently invalidates every reference already written into a runbook. Would Reeve consider having STK-1 or STK-2 give each planned module a stable ID that is not its ordinal — or having `check-stack` assert that each manifest entry's ticket reference matches `technical.md`? That is a question for Reeve, not a defect in any of these three.

**On what "nothing invented" costs the six runbooks.** STK-3 ships six removal runbooks that are headings plus a module name plus a ticket number. That is the right call — inventing paths for `packages/db` would be exactly the failure the brief describes. Worth saying plainly, though: a green C1/C2/C3 on STK-3 proves those files are well-formed and reference nothing broken, not that anyone can remove a vendor. The brief's actual signal — a cold agent session producing a repo that passes `yarn verify` with no leftovers — is owned by ticket 20, and the eight package tickets in between each have to come back and fill their runbook. Nobody should read STK-3's sign-off as the removal protocol working.

---

## Runtime checklist (for the human, ordered by risk)

1. Resolve finding 1 before STK-3's kickoff — decide whether the `port.md` pending entry is reworded or `branding-insertion.md` gets an amendment block, then re-run this gate for STK-3.
2. Run `yarn check-specs` on all three drafts; I read `specs.ts:1008` and `:1089` as fully checking a draft with no `[FILL]` markers while skipping the reviewer rules, so all three should be green — confirm.
3. Answer finding 6 at STK-2's kickoff, in the contract, not the code.
4. Confirm with Taylor that D-STK-16 to D-STK-19 (`technical.md:46`, still `[NEEDS DECISION]`) are not needed by these three. I read none of the three as citing them, and STK-1 puts `packages/`, `apps/` and `tooling/` out of scope, which keeps `boundaries.js` out. Plain `[NEEDS DECISION]` does not block a start.

## Assumptions

- `[ASSUMPTION]` "One surface" is satisfied by `technical.md` under D-STK-15, since `ux/` holds only `.gitkeep` by design. Verified mechanically: `isCitedFile` is `entry.includes("/")` (`specs.ts:428`), so each contract counts exactly one surface and needs no `waiver:`; every `D-STK-*` ID cited appears in `technical.md` (`specs.ts:1045-1049`). If the gate expects an approved `ux/` file per ticket, all three fail on that ground instead.
- `[ASSUMPTION]` `reviewers: []` is correct at draft stage, per the early return at `specs.ts:1089`; `vigil` is added by `contract:add` at start. No planned path in any of the three matches a `toolkit.json` reviewer glob, so `[]` is also the computed answer.
- I could not execute anything. Every criterion above is marked verified-in-code or left to the runtime checklist; none rests on "should work."

STK-1: PASS — criteria testable against real scripts, surface and decision IDs resolve, generated files covered; C4 vacuous and non-negotiable 3 unevidenced, both Should-fix.
STK-2: PASS — six failure modes each have a fixture criterion plus a pass case in C7; the locked-module `runbook` rule needs stating at kickoff, not blocking.
STK-3: FAIL — non-negotiable 5 removes the `port.md` pending entry, which fails its own C2 via a live, byte-preserved file that `planned_paths` cannot legitimately include.

VERDICT: FAIL
