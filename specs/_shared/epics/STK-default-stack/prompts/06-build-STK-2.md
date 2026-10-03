Venue: Claude Code, in product-engineering-mastery, branch agent/STK

# STK-2 build — stack-manifest

**Model:** Opus 5.5. A smaller model tends to write a check that passes on its own fixtures and misses a leftover dependency or variable.

**Role.** None: a build thread has no lead role. The contract is the oracle.

**Attached.**

| File                                                                             | Reason                                  |
| -------------------------------------------------------------------------------- | --------------------------------------- |
| `specs/_shared/epics/STK-default-stack/tickets/STK-2-stack-manifest/contract.md` | The contract; read it first             |
| `specs/_shared/epics/STK-default-stack/technical.md`                             | The one cited file: D-STK-13            |
| `tooling/check-specs.ts`, `tooling/lib/toolkit.ts`                               | The check and fixture pattern to follow |

**Decision served.** STK-2 merged: every module has a manifest and `yarn check-stack` guards removal. Taylor merges.

**The ask.**

1. Run `/tk-kickoff STK stack-manifest`; a refusal is the next instruction.
2. State the planned paths and what each will hold before writing anything.
3. Build in small commits, each `STK-2: <outcome>`, until `yarn status STK-2` shows nothing left but reviews.
4. Run `/tk-close`.

**Writes.** The contract's `planned_paths`; `results.json` through the scripts only; `as-built.md` from `docs/engineering/templates/as-built.template.md`.

**Gate.** `yarn contract:run STK-2` all PASS, the reviews recorded by `yarn review:run`, then Taylor.

**Handoff.** Print the merge instruction and the next prompt's path: `prompts/07-build-STK-3.md`.

**Evidence rules.** A claim about a tool's behaviour carries the version and date verified. Not found is marked, never filled.

**Not wanted.**

- Any path outside the contract's `planned_paths`; add one to the contract first.
- A criterion edited by hand, or a result written by hand.
- Opening the research bookshelf; a build thread never loads it.
- Work belonging to a later ticket in `technical.md`'s ticket order.

**Markers.** `[ASSUMPTION: …]`, `[NEEDS DECISION]`, `[NEEDS DECISION — BLOCKING]`, `[PROPOSED]` only.

**Standing rules.** No emoji. Synthetic data in every example.

Kickoff

- Ticket: STK-2, in `specs/_shared/epics/STK-default-stack/tickets/STK-2-stack-manifest/`; contract at contract.md (read it first; it is the oracle)
- Branch: agent/STK-2; first move: `yarn contract:init STK stack-manifest`
- Cites: `specs/_shared/epics/STK-default-stack/technical.md`; truth files: none: no living UX file covers this work
- Reviewers: vigil, plus any `contract:init` computes from the planned paths; your close runs /tk-close
- Do not: edit results.json; commit on main; push; widen settings; start a second ticket on this branch
- Done: results all PASS with run records, as-built written, status shows nothing left
