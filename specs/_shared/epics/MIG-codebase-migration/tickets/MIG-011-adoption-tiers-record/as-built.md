# As-built — MIG-11

## Shipped against the contract

- C1: `docs/decisions/records/0012-adoption-tiers.md` follows `decision.template.md` with valid frontmatter (`layer: decisions`, `status: ruling`, `thread: "MIG"`, `role: Mason`); 0012 is the next free number; `yarn directory-map` listed it in the records README table. `yarn lint:docs` reports 221 files clean.
- C2: `yarn directory-map --check` reports the generated tables up to date (221 files, 43 landing pages).
- C3: `yarn check-refs` resolves every reference in the 133 live files. The ledger rows name `check-reviewers` and `toolkit.json` in words only, so no path in them can go stale; the changelog and records are history and are not scanned.
- C4: the record holds the five rulings (the modes, host docs left alone, the tracked floor and the operator's local layer, the one probe, the exit), three considered options, consequences (buys, costs, forecloses) and a revisit trigger. Two ledger lines, EN-16 and EN-17, join section 9 (Engineering, scaffold), each citing `REC 0012; MIG-4`. One changelog entry, dated 2026-10-07, heads the changelog. This thread entered plan mode before writing the record; the approved plan is the record's outline.

## Deviations

- The ticket has not started: `yarn contract:init MIG adoption-tiers-record` refuses because MIG-10 and MIG-2 have not started on this branch, as MIG-8, MIG-9 and MIG-10 recorded. `contract:run` and `contract:record` have not run; C1 to C3 were run by hand.
- [ASSUMPTION] The two ledger lines join section 9, "Engineering (scaffold)", as EN-16 and EN-17, the next ids in the global EN sequence (section 10 ends at EN-15). The ids sit out of order beside EN-05, which is the cost of keeping the sequence global.
- [ASSUMPTION] The record names the MIG ticket that built each ruling (MIG-1, MIG-2, MIG-3), never a path in a product repo, and names `tooling/lib/layout.ts` once, as the probe's home; records are history and are not scanned by `check-refs`.
- The changelog entry says "as of this entry": MIG-6 (the listings and five measured signals) and MIG-7 (the `--check`, `--end` and `--protected` preconditions) are not built, and the entry names them so. The contract says the entry "closes the epic"; the epic is not closed. The thread that builds MIG-6 and MIG-7 amends the one bullet.
- MIG-2 and MIG-3 have code committed (6bba765, aad2c02) but no results file; the record rules on what their commits and MIG-2's as-built show shipped.

## Not verified

- C4 is manual: the evidence is the record, the two ledger rows and the changelog entry. The record's account of MIG-2's floor was read from MIG-2's as-built and its fixtures, not re-run; `doctor` and `check-settings` were not run against a real target.

## Next

Build MIG-6 and MIG-7, start MIG-2, MIG-3 and MIG-10 through `contract:init` in dependency order, then amend the changelog's MIG-5 bullet and close the epic.
