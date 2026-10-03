Venue: Claude Code, in product-engineering-mastery, branch agent/STK

# STK tickets gate — run Vigil's pre-flight on all twenty drafts and fix what it fails

**Model:** Opus 5.5. A smaller model tends to soften a contract until it passes instead of fixing the defect Vigil named.

**Role.** Read `docs/roles/operations-strategy/reeve-project-manager.md` first, with `docs/prompts/shared-context.md`. You are Reeve, with Mason (`docs/roles/engineering/mason-cto-principal-dev.md`) consulted on any cut. Vigil runs in its own context through the script; never transcribe its judgment.

**Attached.**

| File                                                              | Reason                                                                                 |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `specs/_shared/epics/STK-default-stack/technical.md`              | The approved surface every ticket cites; D-STK-16 to D-STK-19 await Taylor's yes       |
| `specs/_shared/epics/STK-default-stack/tickets/STK-*/contract.md` | The twenty drafts                                                                      |
| `specs/_shared/epics/STK-default-stack/tickets/_preflight.md`     | Vigil's last verdicts and findings; read the Findings section before changing anything |
| `docs/workflows/stages/tickets.md`                                | The authoring rules and the gate                                                       |
| `.claude/rules/specs.md`                                          | The contract fields and caps                                                           |

**State on 2026-10-03.** STK-1 to STK-3 were pre-flighted once; Vigil's blocking findings were applied (C2 narrowed, generated files added to planned paths, the research reference removed, `port.md` retired for `new-project.md`) but the gate has not re-run on the amended contracts. STK-4 to STK-20 have never been pre-flighted. The script needs the `claude` CLI signed in (`claude auth login`) and runs outside the sandbox.

**Decision served.** Every drafted ticket carries a PASS line in `_preflight.md` against its current contract hash, so build threads can start in order. Taylor opens the build threads.

**The ask.**

1. Run `yarn check-specs`; it must be clean before the gate.
2. Run `yarn review:run vigil STK`. If it prints "vigil did not run", stop and tell Taylor to sign the CLI in; do not edit `_preflight.md`.
3. For each FAIL, read Vigil's reason. Fix the contract, not the verdict: narrow a criterion, add a planned path, split a ticket that is over half a day, or correct `depends_on`. A fix that needs a decision goes to Taylor as a routed call with a recommendation.
4. For each Should-fix that costs one line, apply it; list the ones you did not apply and why.
5. Re-run the gate until every line is PASS or the remaining FAILs are routed calls.
6. Confirm `yarn status --epic STK` shows the build order 1 to 20 with the critical path.

**Writes.** The amended `contract.md` files; `_preflight.md` through the script only; a short `tickets/README.md` is not wanted. If a ticket is split, the new draft goes through `yarn contract:init STK <slug> --from <file> --draft` and gets a kickoff prompt in `prompts/` following the existing ones.

**Gate.** `_preflight.md` holds a PASS line for every ticket against its current hash, and `yarn check-specs` is clean.

**Handoff.** Print the build order from `yarn status --epic STK` and the path of the first kickoff prompt: `specs/_shared/epics/STK-default-stack/prompts/05-build-STK-1.md`. Say: open a new thread per ticket, in that order, each on its own branch.

**Evidence rules.** Cite Vigil's finding number for every change. Label judgment as judgment.

**Not wanted.**

- Editing `_preflight.md`, `results.json` or `technical.md`'s decisions by hand.
- Weakening a criterion to `manual` because its test is hard to write; a `manual` criterion needs a reason no script can prove it.
- Starting any ticket; the gate drafts, it does not build.
- Opening the research bookshelf.

**Markers.** `[ASSUMPTION: …]`, `[NEEDS DECISION]`, `[NEEDS DECISION — BLOCKING]`, `[PROPOSED]` only.

**Standing rules.** No emoji. Synthetic data in every example.
