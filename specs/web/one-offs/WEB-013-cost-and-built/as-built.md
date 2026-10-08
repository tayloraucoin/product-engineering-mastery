# As-built — WEB-13

## Shipped against the contract

- C1: `tooling/cost.ts` (`yarn cost <id>`, `yarn cost --epic <EPIC>`) over the synthetic folder `tooling/fixtures/specs/cost-transcripts/` (two sessions, one a resumed copy, one vigil subagent, a worktree folder, another project's folder): 13 calls, 16,220 weighted, eight categories, context 6,302, two threads, no fixture text in the output; a resumed thread's first call that names nothing inherits the ticket its copied history named; two synthetic records with no real usage are not calls; the epic line counts the zero-padded `OB2-001` and the worktree's commit, and the two calls that belong to no ticket.
- C2: `--record` writes the `cost` block through `formatResults`; the schema accepts it, `contract:run` keeps it (tested; `review:run` writes through the same serializer), `yarn status <id>` prints it through the same formatter as `yarn cost`, every rule tag included; the synthetic review run counts as one headless run, 3,465 weighted.
- C3: `yarn contract:built <id>` records `built_at` after a committed build; `status`, `_status.md` and the brief line read "built" until a criterion is recorded at or after it; `contract:run`, `record` and `qa` keep the field.
- C4: `check-types:tooling` passes; the fixtures `pass-cost-block` and `pass-built-in-brief` behave in `check-specs` (a mutated brief fails it).

## Deviations

- The contract cites R4, R9 and Y3 by ID only: `contract:init` refuses a cited file that is not an approved UX surface, and the audit report is not one.
- `docs/runbooks/migrate/manifest.json` gains `tooling/cost.ts` (added to planned paths): `check-refs.test.ts` requires every script's file there.
- [ASSUMPTION] Folder: `CLAUDE_CONFIG_DIR`, else `~/.claude`, as Claude Code reads it; the tests point it at a temp copy, so no test-only variable exists.
- [ASSUMPTION] A message copied into several files belongs to the thread of the file that ended first; a reviewer subagent (by its `.meta.json` `agentType`, matched against `assay`, `vigil` and the reviewer map's roles) has every call counted as reviews; an `Agent` call to any other type is other.
- [ASSUMPTION] `contract:built` requires the planned paths committed, and re-running it moves `built_at` forward.
- Review round 1 (vigil, Q2, PASS; Tally consulted on the labels): fixed the resumed thread losing its ticket (S1), synthetic records counted as calls (S2), the status line missing rule tags (S3), `read` and `out` untagged, attribution labelled on one number only, and `git -C <path> commit` not naming a ticket; Tally's labels adopted (model-blind weights, headless a floor outside the total, thread context, threads naming it, unattributed calls on the epic line). Not fixed, named in the docstring: two subagents working different tickets at once can take each other's calls; `git commit -F <file>` names no ticket.
- `_status.md`'s proven rule is unchanged (it still counts review criteria); "built" applies only where it said "open".

## Not verified

- The real figure's fit with the audits: one run over this repo's transcripts gave LAB 2,707 calls and 92.2M weighted in-thread plus 5.7M headless on record, against the second audit's ~102M for LAB [estimate; not a criterion].
- The classifier's patterns against Claude Code's real tool names beyond those the fixture uses.

## Next

The hardening prose (R9's thread) can name `yarn contract:built` at the end of a build pass and `yarn cost <id> --record` at close.
