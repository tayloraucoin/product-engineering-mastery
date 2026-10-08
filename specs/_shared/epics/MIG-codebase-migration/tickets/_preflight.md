# Pre-flight — MIG

> Written by `yarn review:run vigil MIG` (the Tickets gate). Never edit it: `contract:init` starts a ticket only on its PASS line, and only while the contract's hash still matches.

- head: 1a4337bf301f210ac6d24b6a84ddabd93a30a55f
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-08T00:55:18Z
- tokens_input: 47
- tokens_cache_read: 2120069
- tokens_cache_write: 149433
- tokens_output: 35189
- seconds: 654.2

## Verdicts

- MIG-2: FAIL (contract 9a472894c6c4)
- MIG-3: FAIL (contract f94061e19c1a)
- MIG-7: PASS (contract d267bacd50a5)
- MIG-8: PASS (contract 3c789c85386e)
- MIG-9: PASS (contract c141ab9313dc)
- MIG-10: PASS (contract e7a6f0dcaa18)
- MIG-11: PASS (contract fde36eead5ec)
- MIG-12: FAIL (contract ecc29943bc02)
- MIG-13: PASS (contract 70463b63ad1f)
- MIG-14: FAIL (contract 8a31aa6476bc)
- MIG-15: PASS (contract d172333179b4)
- MIG-16: PASS (contract 813e124bd983)
- MIG-17: PASS (contract f865c59b3ddb)

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil MIG`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, running the Tickets gate's pre-flight for epic MIG in fresh context. Judge only from the files.

Read the brief (specs/_shared/epics/MIG-codebase-migration/brief.md), the approved UX proposals under specs/_shared/epics/MIG-codebase-migration/ux/, specs/_shared/epics/MIG-codebase-migration/technical.md if it exists, and each drafted contract:
- MIG-2: specs/_shared/epics/MIG-codebase-migration/tickets/MIG-002-settings-floor-and-hook-spine/contract.md
- MIG-3: specs/_shared/epics/MIG-codebase-migration/tickets/MIG-003-overlay-manifest-and-refs/contract.md
- MIG-7: specs/_shared/epics/MIG-codebase-migration/tickets/MIG-007-assess-check-preconditions/contract.md
- MIG-8: specs/_shared/epics/MIG-codebase-migration/tickets/MIG-008-migrate-track-and-runbook/contract.md
- MIG-9: specs/_shared/epics/MIG-codebase-migration/tickets/MIG-009-migrate-verify-and-layer-3/contract.md
- MIG-10: specs/_shared/epics/MIG-codebase-migration/tickets/MIG-010-desk-walks/contract.md
- MIG-11: specs/_shared/epics/MIG-codebase-migration/tickets/MIG-011-adoption-tiers-record/contract.md
- MIG-12: specs/_shared/epics/MIG-codebase-migration/tickets/MIG-012-host-code-in-toolkit-folders/contract.md
- MIG-13: specs/_shared/epics/MIG-codebase-migration/tickets/MIG-013-diff-side-reviewer-lookup/contract.md
- MIG-14: specs/_shared/epics/MIG-codebase-migration/tickets/MIG-014-reviewer-scanner-hardening/contract.md
- MIG-15: specs/_shared/epics/MIG-codebase-migration/tickets/MIG-015-stop-gate-names-not-run/contract.md
- MIG-16: specs/_shared/epics/MIG-codebase-migration/tickets/MIG-016-budget-nested-agents-tracked-only/contract.md
- MIG-17: specs/_shared/epics/MIG-codebase-migration/tickets/MIG-017-spine-from-probe/contract.md

For each contract, check: every criterion is testable and names the right evidence type; it cites one surface and the criterion IDs it builds; every state and unhappy path of that surface is covered by this or another ticket; planned paths and depends_on are plausible; nothing is out of the epic's appetite.

Write one line per ticket, exactly in this form, then your findings:
MIG-2: PASS or FAIL, with the reason
MIG-3: PASS or FAIL, with the reason
MIG-7: PASS or FAIL, with the reason
MIG-8: PASS or FAIL, with the reason
MIG-9: PASS or FAIL, with the reason
MIG-10: PASS or FAIL, with the reason
MIG-11: PASS or FAIL, with the reason
MIG-12: PASS or FAIL, with the reason
MIG-13: PASS or FAIL, with the reason
MIG-14: PASS or FAIL, with the reason
MIG-15: PASS or FAIL, with the reason
MIG-16: PASS or FAIL, with the reason
MIG-17: PASS or FAIL, with the reason

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

MIG-2: FAIL, the contract requires "the floor in the tracked file" under *both* overlay tiers, but `overlay-local` exists precisely because the team does not own `.claude/`; no criterion names that tier, and whether the floor is tracked-anyway or unenforced there is an agent-permissions ruling, not the builder's call.
MIG-3: FAIL, no criterion proves the manifest is complete against the scripts the derived `package.json` names — `tooling/check-reviewers.ts` and `tooling/check-test-weakening.ts` are missing and `tooling/tsconfig.json` is still a `copy` entry, both logged in MIG-8's round-2 review as corrections "for MIG-3 to carry"; the surface's `check-specs` overlay row is covered by no ticket.
MIG-7: PASS, seven failures one scratch repo each, the stale-protected-branch case and the `--end` subset both have their own criteria, the Node floor is honestly typed `manual`, and the beaten `origin/HEAD` option is named.
MIG-8: PASS, five criteria over prose with the structural read typed `manual` and reasoned; C1's "both README tables regenerate without a diff" is proven by C3's command, not C1's, which is a wording fix.
MIG-9: PASS, the freeze table, the 50-file rule, the CI rule and the twelve ordered parts each land in C4's read, and nothing in it is a codemod or a day-one rewrite.
MIG-10: PASS, three readings typed `manual` with the file as evidence and C4 forcing every stop to a fix or a drafted follow-up; Crucible authoring the far walk and reviewing the ticket is a weakened seat, noted.
MIG-11: PASS, the record, two ledger lines and the changelog are each checkable and plan mode is recorded; the entry as specified names none of MIG-12 to MIG-17, so it will be short at close.
MIG-12: FAIL, its own non-negotiable 2 (manifest absent: name the file as not run, never drop it) has no criterion, and that is the live state for most of day one, before the copy step installs the manifest; out_of_scope also routes the stop-gate change to MIG-2 when it is MIG-15's.
MIG-13: PASS, C1 proves the exact Risk 6 path (a stray file importing stripe reaching mason, warden and chancery as a warning); the devs' call allows `review:run` or `contract:run` as the surface, neither of which is a planned path.
MIG-14: FAIL, the devs' call includes admitting `node:` builtins into `reviewers[].imports` — the layout-file-shape one-way door whose reviewer technical.md names as mason — with vigil as the only seat, a second item labelled "operator ruling" never put to the operator, and no criterion holding MIG-4's no-false-match property green.
MIG-15: PASS, C1 and C2 cover the green-stop-over-steps-that-never-ran risk at both tiers; the "never cut for them" clause has no criterion and the Build notes require amending `technical/overlay.md`, which is not a planned path.
MIG-16: PASS, two criteria, the right split between the new behaviour (`test`) and the starter regression (`check`), and the ignored-folder case is the one that carries the risk.
MIG-17: PASS, a refactor with its unit case and a byte-for-byte starter guarantee, and warden is the correct seat for the `tooling/hooks/**` door.

## Findings

**Assumptions.** The epic has no `ux/` folder; the brief's Open items resolved "no UX stage", so I read `technical.md` and its four sub-files as the surfaces and the `T<n>` calls as the criterion IDs. MIG-6 is `open`, not in this list, and I judged it only as a dependency. I judged contracts only; several of these tickets have as-built files in the tree, and I treated that work as evidence of buildability, never as proof of a criterion.

### Blocking

1. **MIG-2 — `overlay-local` has no ruling and no criterion.** Non-negotiables 1 and 2 say "Under the overlay tiers check-settings requires **in the tracked file** exactly the floor". Record 0012 §Decision defines `overlay-local` as "a repo whose `.claude/` the team does not own: every setting goes in the operator's local file", and `docs/runbooks/migrate/README.md` round 13 tells the operator "the record says the floor is unenforced" — which the record does not say. Every criterion (C1 to C4) is written at tier `overlay`. The two readings are incompatible: require the floor in a file we do not own and a client repo fails `check-settings` inside `verify` forever; waive it and the safety floor (env and secret reads, database drops, `filter-branch`) is silently unenforced on exactly the repos where we have least control. Expected per `layer-1.md` §Settings ("The floor is never offered and is always tracked") versus record 0012 §The modes. Fix: one non-negotiable and one criterion stating what `check-settings` and `doctor` require at `overlay-local`. Owner: operator ruling (agent permissions), then Reeve amends. Escalated below.
2. **MIG-3 — nothing proves the manifest is complete.** C1 checks that every `copy` path exists, that no not-installed root is named, and that the manifest lists itself. It does not check the converse, which is the failure that matters: a script the derived `package.json` names whose tooling file the manifest never copies. MIG-8's as-built, review round 2, records this as a red already found — "step 3 adds the `check-reviewers` and `check-test-weakening` scripts and step 5 runs them, but the manifest's tooling group copies neither file … a manifest correction for MIG-3 to carry" — and the same as-built adds that `tooling/tsconfig.json` extends `@pem/config/tsconfig/base.json`, "which no target has", so it "should carry the file as `derive`". The contract carries neither correction, and its criteria would pass without them. The target's first `yarn verify` then fails on a missing file, which is Risk 1's class. Fix: carry both corrections as non-negotiables, and add a criterion that every script in the derived `package.json` resolves to a manifest entry. Owner: Reeve.
3. **MIG-3 — `check-specs` under overlay is covered by no ticket.** `technical/overlay.md`'s T3 table requires "Works on an empty tree. One fixture with the migration epic and a drafted gap ticket". MIG-1, MIG-2 and MIG-3 name `check-refs`, `gen-agents`, `contract:init`, `status`, `budget` and `results-gate`, never `check-specs` — and `check-specs` is in `verify`, so a day-one target whose only specs content is a migration epic of drafted gap tickets must pass it. Fix: one criterion in MIG-3 (or a named out-of-scope pointer to the ticket that takes it). Owner: Reeve.
4. **MIG-12 — the absent-manifest path, which is its own named non-negotiable, has no criterion.** Non-negotiable 2 promises that with no manifest a changed host file under `tooling/` or `docs/` is "named as not run, never dropped". C1 tests only the manifest-present case ("an edit under tooling/ **that the manifest installs**"). The manifest reaches a target in step 4 of the runbook, while the stop gate runs `verify:fast` at every stop from commit 1 onward, so the untested state is the normal state for most of day one — and the untested behaviour is the silent drop this ticket exists to kill. Fix: one criterion on the no-manifest fallback. Owner: Reeve.
5. **MIG-14 — a one-way door left as the builder's call, with the wrong seat.** `devs_call` reads "whether `node:` builtins become valid module entries", and `planned_paths` includes `tooling/lib/toolkit.ts`. `technical.md`'s one-way-door table assigns "Layout file shape (tiers; `reviewers[].imports`) — `toolkit.json`, `tooling/lib/toolkit.ts`, `docs/engineering/templates/toolkit.template.json`" to **mason**; MIG-14's only reviewer is vigil. MIG-4, which created the field, was reviewed by vigil *and* mason. The same `devs_call` also names an "operator ruling on `@supabase/*` breadth" and then leaves it with the builder. Fix: put both questions to the operator at this gate (below), and add mason if the door stays in scope — or cut the `toolkit.ts` change and keep the ticket to the scanner. Owner: operator, then Reeve.

### Should-fix

6. **MIG-2 — three overlay regressions asserted in a non-negotiable, proven nowhere.** Non-negotiable 2 says `check-settings` "fails as before on a tracked `settings.local.json`, a machine path or a disabled sandbox" *under overlay*; C3 covers only the starter fixtures. The as-built shows the builder did cover it, which is exactly why the contract should ask for it.
7. **MIG-2 — `doctor`'s ports-are-a-warning row is in no criterion.** `technical/overlay.md`'s `doctor.ts` row has two changes; non-negotiable 4 and C4 carry only the operator-rows check. A target that does not run on 3000 and 3001 fails `doctor` for a cosmetic reason. One criterion, or an out-of-scope line naming where it lives.
8. **MIG-8 — C1 names evidence that cannot prove half of its statement.** "both README tables regenerate without a diff" is `yarn directory-map --check` (C3), not `yarn lint:docs`. Nothing is actually unproven; split the statement so the criterion and its command agree.
9. **MIG-15 — the "never cut" clause has no criterion.** Non-negotiable 1 promises the verdict and the context clause survive within `MESSAGE_LIMIT`; C1 proves only that two not-run lines appear. The crowding case (many not-run lines, the 1,000-character reason MIG-1's gotchas flag) is the one that loses the verdict.
10. **MIG-15 — the contract instructs an edit outside its planned paths.** The Build notes say `technical/overlay.md`'s `stop-gate.ts` row ("No change") "gains this one change; amend it in the same commit", and that file is not in `planned_paths`. Either add it, or the surface keeps saying the opposite of what shipped and the proof does not go stale when it changes.
11. **MIG-13 — the devs' call reaches past the planned paths.** "Where the warning surfaces (check-specs, `review:run`'s refusal, `contract:run`'s summary)" allows `tooling/review-run.ts` or `tooling/contract.ts`; neither is planned, so the reviewer lookup and staleness would miss the file this very ticket exists to protect.
12. **MIG-14 — no criterion holds the property the widening endangers.** Non-negotiable 1 ("a name in a comment or a string still never matches; MIG-4 C1 stays green") is the false-positive guard; C1 only asserts the new matches. MIG-1, MIG-2 and MIG-16 all give their regression its own criterion; this one should too.
13. **MIG-11 — the closing changelog entry is specified short.** Non-negotiable 4 lists ten things the epic changed, none of them MIG-12 to MIG-17, and `depends_on` is MIG-10, MIG-4, MIG-2. Either MIG-11 lands after the follow-ups, or the entry is amended at close.
14. **MIG-10 — Crucible authors the far walk and reviews the ticket.** The brief does put Crucible in both seats ("taylor-aucoin (far, walked by Crucible as the runbook's reviewer)"), so this is logged, not a defect — but C3's artifact cannot be independently judged by its own author. Name in the focus line that the review covers the fixes and the other two walks, not its own reading.

### Consider

15. MIG-2's C1 and C2 are typed `test` with `yarn check-settings` while C3 is `check` with the same command, and C5 is `check` for a new fixture case. MIG-1 set this precedent (new behaviour as `test`, regression as `check`); it reads oddly on one command and is worth one line of convention somewhere.
16. MIG-7's Build notes add an eighth start failure (`--protected` missing) that C1's "seven scratch repos" does not count.
17. MIG-7 and the in-flight MIG-6 both plan `tooling/lib/assess/**` with no dependency between them. MIG-7 adds new files, so it is a sequencing hazard rather than a conflict; naming the batch order would retire it.
18. MIG-12's exclusion list is read from manifest paths that include placeholders and globs (`specs/{app}/ux/`, `.claude/rules/house-*.md`); the devs' call mentions folder prefixes only.
19. MIG-16's devs' call names "the fallback outside a git checkout" with no criterion. Low stakes, but it is the one branch the git-based rewrite introduces.

### Conversations

- **MIG-14's breadth against the epic's proven ground.** Vue, Svelte, Astro, MDX, Deno and URL specifiers serve none of the three repos this epic is proven on — all three are TypeScript and Next — and the brief puts non-JS stacks past layer 1 out of scope. The hardening is real work and the limits are honestly logged in MIG-4's as-built; the question for the operator is whether it belongs in a two-day appetite now, or after the synapse dry run alongside the threshold recalibration T1 already defers there. Deferring it also makes the one-way-door question go away for now.
- **MIG-3 at Q1 on the file every future migration walks.** I am not relitigating the level — it is the operator's and it touches no Q3 trigger. Flagging once, as my own standing asks: the manifest is the single artifact that decides what a target installs, two of its known defects were caught only downstream in MIG-8's review, and it has no second pair of eyes. One Mason round at Q2 would be cheap relative to a target that installs a spine with missing checks.
- **MIG-17 edits a hook, the `tooling/hooks/**` one-way door, at Q2.** Warden is the right seat and the starter guarantee is byte for byte, so Q2 is defensible. Flagging once because the door is named and the change moves a check between two files.

### Escalations (the gate's own batch, per `stages/tickets.md` §4)

1. At `overlay-local`, where does the settings floor live, and is an unenforced floor acceptable on a repo whose `.claude/` the team does not own? (Blocks MIG-2. Record 0012 and `layer-1.md` disagree; `docs/runbooks/migrate/README.md` round 13 already states an answer the record does not contain.)
2. Do `node:` builtins become valid `reviewers[].imports` entries, and do type-only imports keep counting toward `@supabase/*`? (Blocks MIG-14. The first is the layout-file-shape door, mason's row.)
3. Does MIG-14 stay in this epic or wait for the synapse dry run? (Appetite.)

### Runtime checklist for whoever fixes these

1. Amend MIG-2 with the `overlay-local` ruling once the operator gives it, plus criteria for the three overlay regressions and `doctor`'s ports row.
2. Amend MIG-3: the two manifest corrections from MIG-8's as-built, a completeness criterion tying every derived script to a manifest entry, and `check-specs` under overlay.
3. Amend MIG-12 with the no-manifest criterion and repoint its out-of-scope line at MIG-15.
4. Decide MIG-14 (defer, or cut `toolkit.ts` and add mason), then add its regression criterion.
5. The Should-fix wording changes on MIG-8, MIG-11, MIG-13 and MIG-15 can ride in the same pass.
6. Re-run `yarn review:run vigil MIG` after the amendments; the four FAIL lines are the only ones that need to move.

VERDICT: FAIL
