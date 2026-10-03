Venue: Claude Code, in product-engineering-mastery, branch agent/STK

# STK-3 build — new-project-guide

**Model:** Opus 5.5. A smaller model tends to invent file lists for modules that are not built yet.

**Role.** None: a build thread has no lead role. The contract is the oracle.

**Attached.**

| File                                                                                | Reason                                                     |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/contract.md` | The contract; read it first                                |
| `specs/_shared/epics/STK-default-stack/technical.md`                                | The one cited file: D-STK-13, D-STK-14                     |
| `docs/runbooks/onboard-agent.md`                                                    | The house runbook shape                                    |
| `toolkit.json`                                                                      | The `stack` block STK-2 added; runbook paths must match it |

**Decision served.** STK-3 merged: an agent can configure a duplicate of this repo from a briefing. Taylor merges.

**The ask.**

1. Run `/tk-kickoff STK new-project-guide`; a refusal is the next instruction.
2. State the planned paths and what each will hold before writing anything.
3. Build in small commits, each `STK-3: <outcome>`, until `yarn status STK-3` shows nothing left but reviews.
4. Run `/tk-close`.

**Writes.** The contract's `planned_paths`; `results.json` through the scripts only; `as-built.md` from `docs/engineering/templates/as-built.template.md`.

**Gate.** `yarn contract:run STK-3` all PASS, the reviews recorded by `yarn review:run`, then Taylor.

**Handoff.** Print the merge instruction and the next prompt's path: `none yet: the Tickets stage cuts tickets 4 to 6 next`.

**Evidence rules.** A claim about a tool's behaviour carries the version and date verified. Not found is marked, never filled.

**Not wanted.**

- Any path outside the contract's `planned_paths`; add one to the contract first.
- A criterion edited by hand, or a result written by hand.
- Opening the research bookshelf; a build thread never loads it.
- Work belonging to a later ticket in `technical.md`'s ticket order.

**Markers.** `[ASSUMPTION: …]`, `[NEEDS DECISION]`, `[NEEDS DECISION — BLOCKING]`, `[PROPOSED]` only.

**Standing rules.** No emoji. Synthetic data in every example.

Kickoff

- Ticket: STK-3, in `specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/`; contract at contract.md (read it first; it is the oracle)
- Branch: agent/STK-3; first move: `yarn contract:init STK new-project-guide`
- Cites: `specs/_shared/epics/STK-default-stack/technical.md`; truth files: none: no living UX file covers this work
- Reviewers: vigil, plus any `contract:init` computes from the planned paths; your close runs /tk-close
- Do not: edit results.json; commit on main; push; widen settings; start a second ticket on this branch
- Done: results all PASS with run records, as-built written, status shows nothing left
