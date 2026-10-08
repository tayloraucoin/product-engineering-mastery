# Pre-flight — MIG

> Written by `yarn review:run vigil MIG` (the Tickets gate). Never edit it: `contract:init` starts a ticket only on its PASS line, and only while the contract's hash still matches.

- head: 36d0541f64dc33de27004f5ce9fc87ba571b8999
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-08T01:09:23Z
- tokens_input: 26
- tokens_cache_read: 857794
- tokens_cache_write: 88394
- tokens_output: 16596
- seconds: 313.4

## Verdicts

- MIG-2: FAIL (contract 1e4c3973f3bd)
- MIG-3: PASS (contract 663227b081e3)
- MIG-8: PASS (contract 7235c8e01272)
- MIG-9: PASS (contract c141ab9313dc)
- MIG-10: PASS (contract e7a6f0dcaa18)
- MIG-11: PASS (contract cce029e6fa74)
- MIG-12: PASS (contract 3095b2098050)
- MIG-13: PASS (contract af9c67f18537)
- MIG-14: FAIL (contract 6e5bb894fdd4)
- MIG-15: PASS (contract 5de14b85b373)
- MIG-16: PASS (contract 813e124bd983)
- MIG-17: PASS (contract f865c59b3ddb)

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil MIG`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, running the Tickets gate's pre-flight for epic MIG in fresh context. Judge only from the files.

Read the brief (specs/_shared/epics/MIG-codebase-migration/brief.md), the approved UX proposals under specs/_shared/epics/MIG-codebase-migration/ux/, specs/_shared/epics/MIG-codebase-migration/technical.md if it exists, and each drafted contract:
- MIG-2: specs/_shared/epics/MIG-codebase-migration/tickets/MIG-002-settings-floor-and-hook-spine/contract.md
- MIG-3: specs/_shared/epics/MIG-codebase-migration/tickets/MIG-003-overlay-manifest-and-refs/contract.md
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

## Pre-flight — MIG (Tickets gate)

MIG-2: FAIL, non-negotiable 1 still carries `[NEEDS DECISION]` on the `overlay-local` floor and no criterion is written at that tier, while three shipped artifacts now answer it three incompatible ways.
MIG-3: PASS, non-negotiable 7 and C7 close the manifest-completeness hole (both MIG-8 corrections carried) and C8 covers `check-specs` under overlay; `tooling/check-specs.ts` is not a planned path, noted below.
MIG-8: PASS, five criteria over prose with the structural read honestly typed `manual`, and C1's statement now matches `lint:docs` with the table regeneration left to C3.
MIG-9: PASS, the freeze table, the 50-file rule, the CI rule and the twelve ordered parts all land in C4's read, and nothing in it is a codemod or a day-one rewrite.
MIG-10: PASS, three readings typed `manual` with the file as evidence and C4 forcing every stop to a fix or a drafted follow-up; Crucible in both seats is the brief's own call, logged.
MIG-11: PASS, record, two ledger lines and changelog each checkable, plan mode recorded, and non-negotiable 4 now names MIG-12 to MIG-17 as drafted.
MIG-12: PASS, C3 now tests the absent-manifest fallback that is its own non-negotiable 2 and the live state for most of day one, and out_of_scope routes the stop-gate change to MIG-15.
MIG-13: PASS, C1 proves the exact Risk 6 path and the devs' call is now fenced to `check-specs`, which is a planned path.
MIG-14: FAIL, the layout-file-shape one-way door is still contingent on an unanswered operator question while `tooling/lib/toolkit.ts` sits in planned_paths unconditionally and mason's seat stays conditional.
MIG-15: PASS, C3 now holds the verdict and context clause whole against twenty not-run lines, and `technical/overlay.md` is a planned path.
MIG-16: PASS, two criteria with the right split between new behaviour (`test`) and the starter regression (`check`), and the ignored-folder case carries the risk.
MIG-17: PASS, a refactor with its unit case and a byte-for-byte starter guarantee, and warden is the correct seat for the `tooling/hooks/**` door.

## Findings

**Assumptions.** The epic has no `ux/` folder; the brief's Open items resolved "no UX stage", so I read `technical.md` and its four sub-files as the surfaces and the `T<n>` calls as the criterion IDs. MIG-6 is in flight and MIG-7 has left this list; I judged them only as dependencies. I judged contracts only. MIG-1, 2, 4, 5, 6, 8, 9, 10 and 11 have as-built files and record 0012 is already in `docs/decisions/records/`; I treated that work as evidence of buildability, never as proof of a criterion. Ten of twelve prior findings were genuinely closed, and the two FAILs below are the same two unresolved operator rulings, not new defects.

### Blocking

1. **MIG-2 — the `overlay-local` floor is now contradicted three ways in shipped files, and the contract still declares it undecided.** Non-negotiable 1 reads `[NEEDS DECISION] … record 0012 and layer-1.md disagree and the operator rules`, and every criterion C1 to C9 is written at tier `overlay`. Since the last pre-flight the question did not get answered; it got answered differently in three places. Record 0012 §The modes (line 30, shipped, precedence rung 4): `overlay-local` is "a repo whose `.claude/` the team does not own: every setting goes in the operator's local file". `docs/runbooks/migrate/README.md` round 13 (line 72), the operator-facing interview: "every setting goes to the operator's local file, and the record says the floor is unenforced" — the record says no such thing, so the runbook misquotes the ruling it cites. MIG-2's as-built C1 (line 5), the code that exists: "Under `overlay` and `overlay-local` it requires in the tracked file only the floor", with a fixture `tooling/fixtures/settings/overlay-c1-pass-floor-only-overlay-local.json`. And `technical/layer-1.md` §Settings (line 34) says "The floor is never offered and is always tracked". The two readings remain incompatible in the way that matters: require the floor in a tracked file the team does not own and a client repo fails `check-settings` inside `verify` forever; waive it and the floor — env and secret reads, database drops, `git filter-branch` — is unenforced in CI on exactly the repos where we have least control. This is an agent-permissions ruling, not the builder's call, and the built code has already picked one side of it. Fix: the operator rules (escalation 1), then one non-negotiable and one criterion stating what `check-settings` and `doctor` require at `overlay-local`, the round 13 wording corrected, and record 0012 amended. Owner: operator, then Reeve.
2. **MIG-14 — the one-way door is still the builder's to trip.** `devs_call` now honestly labels it: "`[NEEDS DECISION]` … whether `node:` builtins become valid `reviewers[].imports` entries (the layout-file-shape door, mason's row; if it stays in scope mason joins the review with a focus line)". Putting it at the gate is the right move, but the gate cannot answer an operator question, and the contract is unbuildable as written: `planned_paths` lists `tooling/lib/toolkit.ts` unconditionally while `slice_type` promises "no layout-file change unless `node:` builtins are admitted", and `reviewers` is vigil alone where `technical.md`'s one-way-door table assigns "Layout file shape (tiers; `reviewers[].imports`) — `toolkit.json`, `tooling/lib/toolkit.ts`, `docs/engineering/templates/toolkit.template.json`" to mason. MIG-4, which created the field, was reviewed by vigil *and* mason. The second question ("whether type-only imports keep counting toward `@supabase/*`") decides reviewer breadth on auth files and is also labelled the operator's. Until both are answered, planned_paths and the reviewer set cannot be judged plausible. Fix: answer escalations 2 and 3; then either cut `toolkit.ts` and keep the ticket to the scanner, or keep the door and add mason with a focus line. Owner: operator, then Reeve.

### Should-fix

3. **MIG-3 — C8 exercises a script the ticket does not plan.** C8 runs `check-specs` on the single-app repo with a migration epic and a drafted gap ticket, which is exactly `technical/overlay.md`'s requirement, but `tooling/check-specs.ts` is not in `planned_paths`. If the overlay behaviour needs so much as a guard, the builder is editing an unplanned file; if it needs nothing, the criterion is a fixture and that is worth saying. MIG-13 plans the same file with no dependency either way (see 6).
4. **MIG-11 — the ruling in Blocking 1 has no landing place.** Record 0012 is already written and holds the `overlay-local` sentence the ruling will change, while MIG-11's `out_of_scope` says "Re-numbering or editing any existing record (records are immutable)" and `.claude/rules/docs.md` allows "a new file or an amendment block". Name which one carries the operator's answer, or the ruling lands nowhere and the record stays wrong.
5. **MIG-8 — round 13's text is a misquote, and it is MIG-8's file.** The runbook's interview tells the operator "the record says the floor is unenforced". Whoever fixes Blocking 1 must correct that row; flagging it against MIG-8 so it is not lost as a MIG-2-only edit.
6. **MIG-3 and MIG-17 both edit `tooling/check-refs.ts` with no dependency either way.** MIG-3 rewrites `liveFiles()` for the overlay tiers; MIG-17 moves the three-path spine filter out of the same file (its Build notes cite "around line 50"). MIG-17 depends on MIG-1 and MIG-2 only. Naming the batch order retires it.
7. **MIG-10 — Crucible authors the far walk and reviews the ticket.** The brief does seat Crucible twice ("taylor-aucoin (far, walked by Crucible as the runbook's reviewer)"), so this is logged, not a defect, and the focus line now helpfully fixes the order ("written before reading the other two"). C3's artifact still cannot be independently judged by its own author; say in the focus line that the review covers the fixes and the other two walks, not its own reading.

### Consider

8. MIG-13 and MIG-14 both cite a sibling ticket's `as-built.md` as their one surface with no criterion IDs; the finding ids they actually build (Vigil's S1; K2 to K5 and Mason's 6 and 7) live only in Build notes. Defensible for review-derived follow-ups, but it reads differently from every other contract in the epic.
9. MIG-2's C1, C2 and C8 are typed `test` on `yarn check-settings` while C3 is `check` on the same command, and C5 types new behaviour as `check`. MIG-1 set the precedent; one line of convention somewhere would settle it.
10. MIG-16's devs' call names "the fallback outside a git checkout" with no criterion. Low stakes, but it is the one branch the git-based rewrite introduces.

### Conversations

- **MIG-3 at Q1, softer than last time.** C7 now ties every derived `package.json` script to a manifest entry mechanically, which is the guard I was asking for by eye, so I am not pressing the level. Flagging once only because the manifest is the single artifact deciding what every future target installs and it still has no second reader.
- **MIG-14's breadth against the epic's proven ground.** Vue, Svelte, Astro, MDX, Deno and URL specifiers serve none of the three repos this epic is proven on — all three are TypeScript and Next — and the brief puts non-JS stacks past layer 1 out of scope. The work is real and its limits are honestly logged in MIG-4's as-built; the question is whether it belongs in a two-day appetite now or after the synapse dry run, alongside the threshold recalibration T1 already defers there. Deferring also makes the one-way-door question go away for now.

### Escalations (the gate's own batch, per `stages/tickets.md` §4)

1. At `overlay-local`, where does the settings floor live, and is an unenforced floor acceptable on a repo whose `.claude/` the team does not own? (Blocks MIG-2. Record 0012, the runbook's round 13 and MIG-2's shipped code now disagree; the code assumes tracked-at-both-tiers, so a ruling the other way changes `check-settings.ts` and its fixtures.)
2. Do `node:` builtins become valid `reviewers[].imports` entries, and do type-only imports keep counting toward `@supabase/*`? (Blocks MIG-14. The first is the layout-file-shape door, mason's row.)
3. Does MIG-14 stay in this epic or wait for the synapse dry run? (Appetite.)

### Runtime checklist for whoever fixes these

1. Get ruling 1 from the operator, then amend MIG-2 with one non-negotiable and one `overlay-local` criterion, correct round 13's misquote in `docs/runbooks/migrate/README.md`, and name the record-amendment path in MIG-11.
2. Get rulings 2 and 3, then either cut `tooling/lib/toolkit.ts` from MIG-14 or add mason with a focus line; reconcile `slice_type` with `planned_paths` either way.
3. Add `tooling/check-specs.ts` to MIG-3's planned paths or state that C8 is fixture-only, and name the MIG-3 / MIG-13 / MIG-17 order for `check-refs.ts` and `check-specs.ts`.
4. The Should-fix wording changes on MIG-8, MIG-10 and MIG-11 can ride in the same pass.
5. Re-run `yarn review:run vigil MIG`; MIG-2 and MIG-14 are the only lines that need to move.

VERDICT: FAIL
