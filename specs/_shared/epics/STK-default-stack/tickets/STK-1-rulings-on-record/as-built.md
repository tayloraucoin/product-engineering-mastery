# As-built — STK-1

## Shipped against the contract

- C1: record 0010 carries the full frontmatter (`status: ruling`, `thread: STK`, `role: Mason`, `supersedes` naming record 0005). `yarn lint:docs` passes on 182 files.
- C2: `codebase-conventions.md`, `tech-stack.md` and `ledger.md` reference only paths that exist. Unbuilt modules are named by package and ticket number, never by path, so `yarn check-refs` passes without new pending entries.
- C3: `yarn directory-map` regenerated `docs/_generated/directory-map.md` and `docs/decisions/records/README.md` with record 0010, and `--check` passes.
- C4: `docs/decisions/records/0010-starter-ships-default-stack.md` records the decision, three options and a revisit trigger.
  - Conventions rule 9 is D-STK-2's seam rule, and rule 6 names both readers.
  - §4 states the D-STK-1 graph, with a Status column (built, or the ticket that builds it) and `services` marked undecided. §1 says the default stack is placed by record 0010.
  - §5 states D-STK-3.
  - `tech-stack.md` gives each "Deliberately absent" row its ticket.
  - The ledger gains EN-06 to EN-10 (EN-05 superseded), and the changelog gains one bullet for each. The reading is in `evidence/C4.md`.

## Deviations

- **Outside the planned paths, left as found:**
  - `AGENTS.md` line 52 still calls an app's `env.ts` "the only `process.env` reader". STK-4 plans `AGENTS.md`.
  - `docs/index.md` and `README.md` still state the old porting rule. STK-3 rewrites the README; no ticket plans `docs/index.md`.
  - Both are noted in the changelog entry.
- **Beyond the contract's three named sections:** conventions §1 gained one line, and §4's "Adding a package" steps were reworded. Without those changes, the "who imports this?" count and step 3 (a record per package) would contradict record 0010 inside the same file.
- **`tech-stack.md`:** the Env row now names both readers, to agree with EN-08. No rows were added for email, billing, AI or error monitoring, because those tickets add their own pins.

## Ledger IDs

EN-05 (status now superseded), EN-06, EN-07, EN-08, EN-09, EN-10. A new `STK` source code points at the epic's `technical.md`.

## Migrations

applied: n/a

## Test changes

none

## Not verified

- C4 is a reading judgment by the builder, with the reasoning in `evidence/C4.md`. Vigil reviews it.
- No check proves that later tickets keep the §4 Status column and the tech-stack Ticket column current. D-STK-19 states the duty, and it awaits Taylor's yes.
- No ticket's `planned_paths` includes `tech-stack.md` for the Env (STK-4), Validation (STK-13) or Auth (STK-12) rows, so nothing yet retires them.

## Model

claude-opus-5-5, Claude Code 2.1.232

## Next

Taylor merges STK-1. Then the next build is `prompts/06-build-STK-2.md`. Add `docs/engineering/tech-stack.md` to the STK-4, STK-12 and STK-13 contracts, and decide who amends the porting line in `docs/index.md`.
