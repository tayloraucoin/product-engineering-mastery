Venue: Claude Code, in product-engineering-mastery, branch agent/STK

# STK-1 build — rulings-on-record

**Model:** Opus 5.5. A smaller model tends to restate the old rule beside the new one and leave both standing.

**Role.** None: a build thread has no lead role. The contract is the oracle.

**Attached.**

| File                                                                                                     | Reason                                            |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `specs/_shared/epics/STK-default-stack/tickets/STK-1-rulings-on-record/contract.md`                      | The contract; read it first                       |
| `specs/_shared/epics/STK-default-stack/technical.md`                                                     | The one cited file: D-STK-1, D-STK-2, D-STK-3     |
| `specs/_shared/epics/STK-default-stack/prompts/03-technical.md`                                          | Taylor's nineteen rulings, in his order           |
| `docs/decisions/records/0005-two-packages-and-boundaries-lint.md`, `docs/decisions/decision.template.md` | The record being superseded and the record format |

**Decision served.** STK-1 merged: the default-stack rulings are written law. Taylor merges.

**The ask.**

1. Run `/tk-kickoff STK rulings-on-record`; a refusal is the next instruction.
2. State the planned paths and what each will hold before writing anything.
3. Build in small commits, each `STK-1: <outcome>`, until `yarn status STK-1` shows nothing left but reviews.
4. Run `/tk-close`.

**Writes.** The contract's `planned_paths`; `results.json` through the scripts only; `as-built.md` from `docs/engineering/templates/as-built.template.md`.

**Gate.** `yarn contract:run STK-1` all PASS, the reviews recorded by `yarn review:run`, then Taylor.

**Handoff.** Print the merge instruction and the next prompt's path: `prompts/06-build-STK-2.md`.

**Evidence rules.** A claim about a tool's behaviour carries the version and date verified. Not found is marked, never filled.

**Not wanted.**

- Any path outside the contract's `planned_paths`; add one to the contract first.
- A criterion edited by hand, or a result written by hand.
- Opening the research bookshelf; a build thread never loads it.
- Work belonging to a later ticket in `technical.md`'s ticket order.

**Markers.** `[ASSUMPTION: …]`, `[NEEDS DECISION]`, `[NEEDS DECISION — BLOCKING]`, `[PROPOSED]` only.

**Standing rules.** No emoji. Synthetic data in every example.

Kickoff

- Ticket: STK-1, in `specs/_shared/epics/STK-default-stack/tickets/STK-1-rulings-on-record/`; contract at contract.md (read it first; it is the oracle)
- Branch: agent/STK-1; first move: `yarn contract:init STK rulings-on-record`
- Cites: `specs/_shared/epics/STK-default-stack/technical.md`; truth files: none: no living UX file covers this work
- Reviewers: vigil, plus any `contract:init` computes from the planned paths; your close runs /tk-close
- Do not: edit results.json; commit on main; push; widen settings; start a second ticket on this branch
- Done: results all PASS with run records, as-built written, status shows nothing left
