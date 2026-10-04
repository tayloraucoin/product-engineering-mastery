# Review — vigil on STK-3

> Written by `yarn review:run vigil STK-3`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: fec182cad4b000ba34ac49a6c13d31ff7948395c6634833c62cc9f9456c1dc72
- as_built_sha256: 1bc04077ec21838619801eea90453110a14b2db5a7f2a802cab52d48f28acefe
- head: e2a6f359e231b58fc49eca03ad26ae5aa2d97dd8
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T05:35:23Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-3`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-3 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 check: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C1.log (sha256 9308d6add264)
   - C2 check: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C2.log (sha256 b73f28a3b9ed)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C3.log (sha256 a06180b77830)
   - C4 manual: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C4-reread.md (sha256 976aa7867777)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): README.md, docs/_generated/directory-map.md, docs/prompts/phases/engineering-layer.md, docs/prompts/phases/port-dry-run.md, docs/runbooks/README.md, docs/runbooks/new-project.md, docs/runbooks/remove-ai.md, docs/runbooks/remove-api.md, docs/runbooks/remove-billing.md, docs/runbooks/remove-error-monitoring.md, docs/runbooks/remove-supabase-auth.md, docs/runbooks/remove-supabase-database.md, tooling/refs-pending.json.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

# Vigil review — STK-3 new-project-guide

**Verdict: Pass.** All four criteria are met by the evidence and hold up against the tree. Two Should-fix items, three Consider; none is STK-3's to fix, and both Should-fix items are already routed to Taylor in the as-built.

I read the contract, `results.json`, the as-built, the four evidence files and the cited surface (`technical.md`), then checked the claims against the tree rather than taking them. Where the as-built asserts a file's content, I opened the file.

## Criteria

**C1 — frontmatter and names for the seven new runbooks. Met.**
`evidence/C1.log` exit 0 at `3f1e2df` (189 files). Independently: all seven carry the full frontmatter block (`layer: runbooks`, `status: draft`, `thread: "STK-3"`, `role: Usher`, `date`, `last_reviewed`, `supersedes`, `load_when`) and kebab-case names — `new-project.md:1-12`, `remove-supabase-auth.md:1-12`, `remove-supabase-database.md:1-12`, `remove-billing.md:1-12`, `remove-api.md:1-12`, `remove-ai.md:1-12`, `remove-error-monitoring.md:1-12`.

**C2 — every path and command resolves or is pending with its ticket. Met.**
`evidence/C2.log` exit 0; 41 pending, including `"docs/runbooks/port.md": "superseded by docs/runbooks/new-project.md (STK-3)"` (`tooling/refs-pending.json:4`), which is required because the body of `docs/prompts/phases/engineering-layer.md:217,226` still names it. I hand-verified the high-risk references the slice names as its own risk class:

- every yarn command in the guide and the db runbook exists in `package.json:19-48`, and `verify` still contains `yarn check-migrations &&` (`package.json:13`), as `remove-supabase-database.md:28` says;
- `toolkit.json:21` has `migrationsDir`, and `toolkit.json:205-212` has the `db` entry, `locked: false`, `runbook` pointing back at the runbook — so `new-project.md:99` ("one of the six is built … not locked") is true today;
- `boundaries.js:50,58,64-65,6` carry exactly the `workspacePackage("db","db")` line, the `PACKAGE_IMPORTS` entry, the `postgres` and `drizzle-kit` `SDK_OWNERS` entries and the layer-order comment named in `remove-supabase-database.md:49`;
- `codebase-conventions.md` §4 is "Packages and the import graph" (`:73`) and holds the `@pem/db` row (`:89`) and the SDK-owner sentence (`:98`); `tech-stack.md:39-40` holds both rows named;
- the vendor-side names are real: `LOCAL_CONTAINER = "pem-db-local"` (`packages/db/scripts/local-image.ts:10`), triggers `on_auth_user_created` / `on_auth_user_email_changed` (`supabase/setup/02_auth_triggers.sql:7,14`), functions `set_updated_at`, `handle_new_auth_user`, `handle_auth_user_email_change` (`01_functions.sql:6,22,37`), `public.users` and `packages/db/src/schema/notes/notes.ts`;
- `remove-supabase-database.md:45` "no other workspace lists them" is true: `drizzle-orm`, `postgres`, `drizzle-kit` appear only in `packages/db/package.json:41-47`;
- the Verify sections rest on a real mechanism: `tooling/check-stack.ts:163-192` reads `removed` and fails on leftovers, so "set `"removed": true`, then `check-stack`" is not an invented field;
- `specs/_status.md`, `apps/web/app/page.tsx`, `docs/design/templates/`, record 0010 and the `apps/web/AGENTS.md` sections named in step 5 all exist (`apps/web/AGENTS.md:5,9,20`).

**C3 — the generated map lists the new runbooks and is current. Met.**
`evidence/C3.log` exit 0; `docs/_generated/directory-map.md:408,412-417` and the generated table in `docs/runbooks/README.md:28,32-37` list all seven, and the hand-written lines above the generated marker point a new repo at the guide (`docs/runbooks/README.md:20`).

**C4 — a cold reader can name every step and the closing check. Met, at the level the criterion sets.**
`evidence/C4.md` records two fresh-context reads with method, briefings, the 13 and 9 gaps found and what each fix was; the second reader named steps 0–7 and each check. `evidence/C4-reread.md` (the recorded evidence) covers the STK-9 drift honestly and shows why step 4's old "none of the six is built" line was false. The guide does carry exactly eight `**Check:**` lines, one per step (`new-project.md:39,63,72,82,101,114,124,135`), and "Done means" (`:18`) agrees with step 7's check (`:135`). Limits, correctly disclosed in the as-built: the readers were agents, not a person; nothing in the guide has been executed; STK-20 owns the timed run.

**Non-negotiables.** All six hold. Order matches D-STK-14 and the last checks are `check-stack` then `verify` (`:129-131`); the six removal runbooks carry the identical seven headings; the five unbuilt ones say "Not built yet: STK-n fills this" and name the manifest field, inventing nothing; both Supabase runbooks carry the "When both Supabase modules go" paragraph with the D-STK-1 ordering (`remove-supabase-auth.md:20`, `remove-supabase-database.md:20`); the README section is duplicate-then-remove pointing at the guide (`README.md:40-42`) with the `port.md` entry reworded; and each prompt gained one dated blockquote (`port-dry-run.md:15`, `engineering-layer.md:32`).

## Findings

**Should-fix — `docs/index.md:16` still states the retired porting rule.** "A product repo copies what it needs, following `docs/runbooks/onboard-agent.md` and the port runbook in `README.md`." This is always-on session context contradicting EN-10, record 0010, `README.md:42` and the new guide, and it is now the only place an agent is told the old rule. Outside STK-3's planned paths, needs plan mode, already under Next. Owner: Taylor, one line before the stack merges.

**Should-fix — the EN-10 account in `docs/decisions/changelog.md:67` now misreads.** It says "`README.md` and the porting line in `docs/index.md` still state the old rule"; after this ticket only the index does. The changelog is a running log, so the fix is a new line when the index is corrected, not an edit to history. Owner: whoever lands the index fix, same edit.

**Consider — `docs/runbooks/new-project.md:118` claims `turbo.json` lists the same names as `.env.example`.** It does not today: `turbo.json:15-20` carries the six `DATABASE_*` names and `.env.example` does not yet (STK-9 as-built `:18`; the warning is in STK-9's `evidence/C4.log:487`). Same drift makes `remove-supabase-database.md:36`'s "From `.env.example` and …" a partial no-op. Harmless — removing an absent name changes nothing, `check-stack` only fails on leftovers, and step 6's own check runs `check-client-bundle`, which prints the drift by name. Resolves when Taylor adds the variables.

**Consider — step 3's check can pass with a toolkit description left in place.** `new-project.md:82` greps only "Product Engineering Mastery" and "PEM"; the docs app's description (`apps/docs/app/layout.tsx:15-16`) names neither, so it can stay describing the practice and the check still prints nothing. The prose at `:80` does tell the reader to change it; one clause in the check would close the gap.

**Consider — non-negotiable 12 is verified by reading, not by diff.** This venue has no git. Each prompt has one dated blockquote and a body still asking for the superseded thing (`port-dry-run.md:19` still says "write the port runbook into the README"), which is what an untouched body looks like — but `git diff main -- docs/prompts/phases/` is the actual proof.

## Conversation

Step 1 tells an agent that `yarn hooks:install` will exit 1 from a sandboxed shell and that "a person runs that one line" (`new-project.md:57`), then goes on. It never says what to do when no person is available. A solo agent run then reaches step 7 with no hooks installed, commits successfully because nothing is guarding the branch, and reports a clean finish — the one state where the guide's own safety rail ("the hooks refuse commits on `main`", `:59`) is silently absent and the report doesn't say so. Not a dead end, and not a defect against the contract. Worth asking whether step 1's check should name the hooks-installed state out loud so the step-7 report carries it. STK-20 will meet this first.

## Runtime checklist

1. `git diff main -- docs/prompts/phases/port-dry-run.md docs/prompts/phases/engineering-layer.md` — confirm only the added blockquote (non-negotiable 12).
2. Decide `docs/index.md:16` in plan mode before the stack merges; add the changelog line in the same edit.
3. Add the six `DATABASE_*` names to `.env.example` with comments (Taylor's, from STK-9), then `yarn check-client-bundle` and confirm the drift warning is gone — that is what makes step 6's sentence true.
4. Clear the two pre-existing `yarn verify` failures named in the as-built (`check-specs` staleness on the stack; the evaluator-budget row at 7,075/7,000) before merge; neither is STK-3's.
5. STK-20: run the guide cold on a duplicate, starting with the four open questions in the as-built's Not verified.

Assumptions: no git, no execution, read-only — every "verified" above means verified in the files; `.env.example` is permission-denied to me as it was to the builder, so its contents rest on STK-4's and STK-9's as-builts, labelled as such. The prior `review:vigil` FAIL in `results.json` was recorded at an earlier head against an earlier contract hash; the Blocking item it names (step 3's `prefers-color-scheme` block versus D-STK-17) is fixed in the shipped text at `new-project.md:78,82`, which is why this run lands differently.

VERDICT: PASS
