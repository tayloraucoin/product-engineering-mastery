# Review — vigil on STK-3

> Written by `yarn review:run vigil STK-3`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: fec182cad4b000ba34ac49a6c13d31ff7948395c6634833c62cc9f9456c1dc72
- as_built_sha256: 36a9593c62be63ff0dfb8030c5713ba8a1c470eb8257313da0a8f813caefa515
- head: 02847c890c0568bdc54214188bece5893f74052f
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T02:58:46Z
- verdict: FAIL

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-3`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-3 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 check: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C1.log (sha256 a5e017a3f063)
   - C2 check: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C2.log (sha256 fc6aae415389)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C3.log (sha256 ea10c782e52e)
   - C4 manual: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C4.md (sha256 9639f96220d7)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): README.md, docs/_generated/directory-map.md, docs/prompts/phases/engineering-layer.md, docs/prompts/phases/port-dry-run.md, docs/runbooks/README.md, docs/runbooks/new-project.md, docs/runbooks/remove-ai.md, docs/runbooks/remove-api.md, docs/runbooks/remove-billing.md, docs/runbooks/remove-error-monitoring.md, docs/runbooks/remove-supabase-auth.md, docs/runbooks/remove-supabase-database.md, tooling/refs-pending.json.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

I cannot fix it: this run has Read, Grep and Glob only — no Edit and no Bash — so I can neither rewrite the file nor run `yarn format`. Here is the exact fix, located.

**File:** `tooling/check-client-bundle.test.ts:52`. The line is 85 characters, over Prettier's 80, and it is the only `assert.match` in the file that is not already wrapped (compare `:31-34`, `:40-43`). Prettier wants:

```ts
  assert.match(
    r.out,
    /1 server-only value\(s\), none in 1 browser-facing file\(s\)/,
  );
```

Two notes for whoever applies it. The file is not STK-3's: its header says `check-client-bundle (STK-4, C5)`, it is absent from this contract's `planned_paths`, and the untracked-format failure is therefore another ticket's work arriving on the shared branch — the same class of cross-ticket noise `as-built.md:66-71` already discloses for `check-specs` and `budget`. Running `yarn format` writes only that one file, so it will not disturb any STK-3 path or any recorded evidence hash; C1 to C3 do not need re-proving because of it.

My review stands unchanged: the Blocking finding is `docs/runbooks/new-project.md:76` naming a `prefers-color-scheme: dark` block that `packages/config/tailwind/preset.css` does not have (dark mode is `.dark`, `preset.css:57-70`), with step 3's own check unable to see the miss.

VERDICT: FAIL
