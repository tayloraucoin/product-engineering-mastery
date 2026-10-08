# Pre-flight — MIG

> Written by `yarn review:run vigil MIG` (the Tickets gate). Never edit it: `contract:init` starts a ticket only on its PASS line, and only while the contract's hash still matches.

- head: 5bad2f35b36ec4764c92c9a4099cf4d0ac208161
- runner: claude 2.1.294 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5-5
- at: 2026-10-08T19:41:01Z
- tokens_input: 16
- tokens_cache_read: 344557
- tokens_cache_write: 66452
- tokens_output: 6617
- seconds: 79.2

## Verdicts

- MIG-2: PASS (contract 758133470a6b)
- MIG-3: PASS (contract f4c06ed8d707)
- MIG-8: PASS (contract 7235c8e01272)
- MIG-9: PASS (contract c141ab9313dc)
- MIG-10: PASS (contract e7a6f0dcaa18)
- MIG-11: PASS (contract cce029e6fa74)
- MIG-12: PASS (contract 3095b2098050)
- MIG-13: PASS (contract af9c67f18537)
- MIG-14: PASS (contract cd20ef671d14)
- MIG-15: PASS (contract 5de14b85b373)
- MIG-16: PASS (contract 813e124bd983)
- MIG-17: PASS (contract f865c59b3ddb)
- MIG-18: PASS (contract 96236651d965)
- MIG-19: PASS (contract 22a17a63c8b9)

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
- MIG-18: specs/_shared/epics/MIG-codebase-migration/tickets/MIG-018-assess-listings-hardening/contract.md
- MIG-19: specs/_shared/epics/MIG-codebase-migration/tickets/MIG-019-precondition-messages/contract.md

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
MIG-18: PASS or FAIL, with the reason
MIG-19: PASS or FAIL, with the reason

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

MIG-2: PASS. The last pre-flight's one Blocking finding is fixed. Non-negotiable 1 now says check-settings at overlay-local "requires neither the floor nor the tracked file itself". C10 now runs check-settings as a subprocess on the single-app repo with no tracked `.claude/settings.json` and expects exit 0, and it says what doctor must do there. The three out-of-date Build-notes quotes now include the EN-18 exception.
MIG-3: PASS. The manifest, check-refs, gen-agents and the contract loop are each tested on the single-app repo. One older Should-fix is still open: `tooling/check-specs.ts` is not a planned path, and nothing sets the order between MIG-3 and MIG-17 for `check-refs.ts`.
MIG-8: PASS. It cites T2, T4 and T5. Four criteria are checks and the prose structure is honestly typed `manual`, and every hosted step stops for the operator.
MIG-9: PASS. It cites T7. C4 reads the freeze table, the 50-file rule, the CI rule and the twelve ordered parts, and nothing in it is a codemod.
MIG-10: PASS. The three readings are typed `manual`, and C4 makes every stop either a runbook fix or a drafted follow-up. Crucible in both seats is the brief's own call.
MIG-11: PASS. The record, the ledger lines and the changelog are each checkable. Two older wording gaps are still open: the follow-up range still ends at MIG-17, and `out_of_scope` doesn't allow for the amendment block already on record 0012.
MIG-12: PASS. C3 tests the case with no manifest, and the stop-gate change is routed to MIG-15.
MIG-13: PASS. C1 tests the exact Risk 6 path (a stray Stripe import), and `check-specs.ts` is a planned path.
MIG-14: PASS. Both halves of the operator's 2026-10-08 ruling have tests (C4, C5), and the layout file's shape stays unchanged.
MIG-15: PASS. C3 keeps the verdict and the context clause whole against twenty not-run lines, and `overlay.md` is a planned path. The reviewer seat for the hooks door is a new Should-fix, below.
MIG-16: PASS. The new behaviour is typed `test` and the starter regression is typed `check`.
MIG-17: PASS. A refactor with a unit test and a byte-for-byte starter guarantee; it depends on MIG-2, and Warden is seated for the hooks door.
MIG-18: PASS. Each listing fix has a test and the band edges are named. The `out_of_scope` routing to MIG-14 and the untested HEAD fallback are still open Should-fix items.
MIG-19: PASS. The diverged-branch and `--end` paths have scratch-repo tests. The `protected-holds-fork` wording has no assertion, and the runbook's step 0 is not a planned path; both still Should-fix.

## Findings

**Assumptions.** `ux/` holds only `.gitkeep`, and the brief rules "no UX stage" (Open items). So I treated `technical.md` and its sub-files as the surface, and its `T<n>` calls as the criterion IDs. I checked that EN-18 is in the files (ledger line 343, record 0012's amendment, `layer-1.md` line 34) and did not reopen it.

### Blocking

None. The last pre-flight's only Blocking finding (MIG-2, overlay-local tested only with a tracked file present) is fixed in non-negotiable 1, C10 and the Build notes.

### Should-fix

1. **MIG-15 seats only Mason on the hooks door.** `technical.md`'s one-way-door table puts `tooling/hooks/**` under Warden. MIG-17, which edits the same folder, seats Warden; MIG-15 edits `tooling/hooks/stop-gate.ts` with only Mason. The operator should confirm whether this is deliberate (it changes a message, not a gate) or add Warden with `yarn contract:qa MIG-15 Q2 --reviewers mason,warden`. Owner: operator.
2. **MIG-3, MIG-13 and MIG-17: no order for the shared files (carried over).** MIG-3's C8 runs `check-specs`, but `tooling/check-specs.ts` isn't planned there (MIG-13 plans it). MIG-3 and MIG-17 both edit `tooling/check-refs.ts`, and neither depends on the other. Either name the order or say that C8 needs only a fixture. Owner: Reeve.
3. **MIG-18 routes "one home for the import scanner" to MIG-14 (carried over).** Nothing in MIG-14's objective, criteria or planned paths takes it. Also, non-negotiable 4's HEAD-fallback half ("counts lines as the working-tree read does") still has no criterion. Owner: Reeve.
4. **MIG-19 (carried over).** C1 doesn't check that the `protected-holds-fork` message reads "moved past the fork point". The Gotchas point at the runbook's step 0, but `docs/runbooks/migrate/README.md` isn't planned. Either add the runbook to `planned_paths` or say that no runbook edit is expected. Owner: Reeve.
5. **MIG-11 hasn't caught up with the epic (carried over).** Non-negotiable 4 still says "MIG-12 to MIG-17"; MIG-18 and MIG-19 exist. `out_of_scope` still says "Re-numbering or editing any existing record", but record 0012 already carries the 2026-10-08 amendment block. Name the amendment block as the sanctioned form. Owner: Reeve.

### Consider

6. **MIG-2 C5 and MIG-15 C1 and C3 are typed `check` but test new behaviour.** This matches how the repo types `test:hooks` fixtures, so it is only worth noting.
7. **MIG-2 C10, doctor with no local settings file at all.** At overlay-local, doctor's case where `.claude/settings.local.json` is entirely absent (a fresh clone) isn't stated. "Every row missing" probably covers it, but one explicit line would remove the doubt.
8. **MIG-17:** the objective says `check-refs.ts` reads the spine from the probe, but the devs' call makes that optional. Pick one (carried over).
9. **MIG-14 C5:** say whether "naming the entry" means the location (`reviewers[n].imports[j]`) or the value (`node:fs`) (carried over).

### Conversations

- **MIG-14 and the appetite.** Nothing in the files answers whether the Vue, Svelte, Astro, MDX and Deno hardening stays in this epic or waits for the synapse dry run. None of the three repos the epic is proven on needs it. Is keeping it in deliberate?
- **The overlay-local floor after a fresh clone.** Under EN-18 the floor lives in one machine's disposable file. One runbook line ("run `yarn doctor` after every fresh clone or worktree") would cover most of Warden's remaining risk at no cost to MIG-2. Worth adding in MIG-8 or MIG-10?

### Runtime checklist

1. Confirm or change MIG-15's reviewer seat for the hooks door.
2. Set the order for `check-refs.ts` and `check-specs.ts` across MIG-3, MIG-13 and MIG-17.
3. Make the carried-over wording fixes in MIG-11, MIG-18 and MIG-19 before those tickets start.

The claude.ai Linear and Tally connectors need authorizing in claude.ai's connector settings before they can be used; nothing in this review needed them.

VERDICT: PASS
