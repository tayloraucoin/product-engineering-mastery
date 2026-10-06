# As-built — CAT-1

## Shipped against the contract

- C1: `docs/design/component-sources.md` (ruling table, base and single vendors, the registry review deltas, catalogue by job, the job index J-01 to J-42, the starter kits, open items) and record 0011 (two shelves) pass `lint:docs`; `component-sources.md` loads on request only, so no build's budget grows (`yarn budget` within every cap).
- C2: ledger section 11 holds CS-01 to CS-10, the source codes RPM and CAT are added, and SK-05's status reads "amended by CS-08 … Was: ruled"; every reference resolves.
- C3: the directory map, `docs/design/README.md` and the records index list the new files and are current.

## Deviations

- **The research was filed by its own intake commit** (`CAT: P-M research filed unchanged`), not by this ticket: `contract:init` refuses a contract that names a `docs/research/` path (A11). The file is byte-identical to the returned one (`cmp`).
- **Edit A4's `paths` also gains `packages/catalog/**`** (CS-07), so the shadcn skill, when installed in Phase 3, covers the shelf; noted in the skills changelog.
- `[ASSUMPTION]` The job index and starter kits are carried into `component-sources.md` in shortened form, because agents never load `docs/research/` and the scout needs them; the research stays the evidence.

## Not verified

- Whether `component-sources.md` and `skills.md` A2 read as one rule to a fresh agent; no trial was run.

## Next

CAT-2 adds the colour roles Vega needs to the preset.
