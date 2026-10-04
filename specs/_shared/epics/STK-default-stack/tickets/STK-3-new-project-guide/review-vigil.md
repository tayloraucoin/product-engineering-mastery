# Review — vigil on STK-3

> Written by `yarn review:run vigil STK-3`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: fec182cad4b000ba34ac49a6c13d31ff7948395c6634833c62cc9f9456c1dc72
- as_built_sha256: 27f154fc55b03bb0724773ac1f6aa4451dbcc165c6870e77639be569199ceb73
- head: 930129e639fc7cd25c3b1efed36b98ca20ebeb85
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T03:08:00Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-3`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-3 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 check: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C1.log (sha256 ff8423fcc843)
   - C2 check: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C2.log (sha256 c4bfe7f5eb71)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C3.log (sha256 85dd220ea58e)
   - C4 manual: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C4.md (sha256 9639f96220d7)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): README.md, docs/_generated/directory-map.md, docs/prompts/phases/engineering-layer.md, docs/prompts/phases/port-dry-run.md, docs/runbooks/README.md, docs/runbooks/new-project.md, docs/runbooks/remove-ai.md, docs/runbooks/remove-api.md, docs/runbooks/remove-billing.md, docs/runbooks/remove-error-monitoring.md, docs/runbooks/remove-supabase-auth.md, docs/runbooks/remove-supabase-database.md, tooling/refs-pending.json.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

The Stop hook's `verify:fast` output names nothing I can act on and nothing that changes the review:

- **STK-2's four stale PASSes and its C7/reviews** belong to a different ticket. STK-2 is still closing on the shared branch; `package.json` and `toolkit.json` moved under it (STK-4 landed `check-client-bundle` in `package.json:13,41` and the `stack`/env names in `toolkit.json`). That is STK-2's re-record to run, and the as-built for STK-3 already discloses it (`as-built.md:75`: `check-specs` reads STK-1's and STK-2's PASSes as stale). It is not a STK-3 defect and does not touch any of STK-3's planned paths.
- **"STK-3 … review:vigil (last run exited 0) is not PASS"** is this criterion, in the state it must be in while the review is still running: `results.json:53-66` holds the earlier FAIL at head `02847c8`, and `yarn review:run vigil STK-3` writes the new record from this output. It clears when this run is recorded; it is not something a reviewer fixes.

My tools here are Read, Grep and Glob only — I cannot edit or run, and by design I should not: a reviewer who repairs the tree he is judging is no longer a reviewer. Nothing in the hook output alters a criterion assessment or a finding above, and I am not revising severity on the strength of a gate that is reporting a sibling ticket's staleness.

Standing: four criteria met on their evidence and in the files; four Should-fix findings (step 5's missing `yarn directory-map`, step 6's now-untrue state claim, step 3's branding coverage gap, `docs/index.md:16`), three Considers, no Blocking.

VERDICT: PASS
