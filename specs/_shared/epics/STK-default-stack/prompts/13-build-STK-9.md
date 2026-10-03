Venue: Claude Code, in product-engineering-mastery, branch agent/STK

# STK-9 build — db-package

**Model:** Opus 5.5. A smaller model tends to query through the singleton and bypass row-level security.

**Role.** None: a build thread has no lead role. The contract is the oracle.

**Attached.**

| File                                                                         | Reason                                         |
| ---------------------------------------------------------------------------- | ---------------------------------------------- |
| `specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/contract.md` | The contract; read it first                    |
| `specs/_shared/epics/STK-default-stack/technical.md`                         | The one cited file:                            |
| `docs/engineering/codebase-conventions.md`                                   | Placement and the package graph                |
| `docs/engineering/tech-stack.md`                                             | Pins; update the line this ticket makes untrue |

**Decision served.** STK-9 merged: @pem/db on Drizzle and Supabase with policies beside tables, the bridge and the setup SQL. Taylor merges.

**The ask.**

1. Run `/tk-kickoff STK db-package`; a refusal is the next instruction. Depends on: STK-4.
2. State the planned paths and what each will hold before writing anything. Use plan mode before touching a package boundary, `docs/decisions/` or `.claude/settings.json`.
3. Build in small commits, each `STK-9: <outcome>`, until `yarn status STK-9` shows nothing left but reviews.
4. Add this module's manifest entry to `toolkit.json` and its boundaries rows, if the contract lists them.
5. Run `/tk-close`.

**Writes.** The contract's `planned_paths`; `results.json` through the scripts only; `as-built.md` from `docs/engineering/templates/as-built.template.md`, with every version pinned and dated.

**Gate.** `yarn contract:run STK-9` all PASS, the reviews recorded by `yarn review:run`, then Taylor.

**Handoff.** Print the merge instruction and the next prompt's path: `prompts/14-build-STK-10.md`.

**Evidence rules.** A claim about a tool's behaviour carries the version and date verified. Not found is marked, never filled.

**Not wanted.**

- Any path outside the contract's `planned_paths`; add one to the contract first.
- A criterion edited by hand, or a result written by hand.
- Opening the research bookshelf; a build thread never loads it.
- Domain code copied from a product repo; carry shapes, re-scoped to `@pem/*`.
- Work belonging to a later ticket in `technical.md`'s ticket order.

**Markers.** `[ASSUMPTION: …]`, `[NEEDS DECISION]`, `[NEEDS DECISION — BLOCKING]`, `[PROPOSED]` only.

**Standing rules.** No emoji. Synthetic data in every example.

Kickoff

- Ticket: STK-9, in `specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/`; contract at contract.md (read it first; it is the oracle)
- Branch: agent/STK-9; first move: `yarn contract:init STK db-package`
- Cites: `specs/_shared/epics/STK-default-stack/technical.md`; truth files: none: no living UX file covers the starter's own stack
- Reviewers: vigil, plus any `contract:init` computes from the planned paths; your close runs /tk-close
- Do not: edit results.json; commit on main; push; widen settings; start a second ticket on this branch
- Done: results all PASS with run records, as-built written, status shows nothing left
