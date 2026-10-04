# Review — vigil on STK-3

> Written by `yarn review:run vigil STK-3`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: fec182cad4b000ba34ac49a6c13d31ff7948395c6634833c62cc9f9456c1dc72
- as_built_sha256: 1bc04077ec21838619801eea90453110a14b2db5a7f2a802cab52d48f28acefe
- head: 5cbff81067ccb7db78bcb4b80e5f07f79f790a02
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T06:51:45Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-3`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-3 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 check: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C1.log (sha256 555280f1c9e8)
   - C2 check: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C2.log (sha256 26d89ffd8726)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C3.log (sha256 71923bf16c71)
   - C4 manual: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/evidence/C4-reread.md (sha256 fb5b94d51b43)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): README.md, docs/_generated/directory-map.md, docs/prompts/phases/engineering-layer.md, docs/prompts/phases/port-dry-run.md, docs/runbooks/README.md, docs/runbooks/new-project.md, docs/runbooks/remove-ai.md, docs/runbooks/remove-api.md, docs/runbooks/remove-billing.md, docs/runbooks/remove-error-monitoring.md, docs/runbooks/remove-supabase-auth.md, docs/runbooks/remove-supabase-database.md, tooling/refs-pending.json.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Review — STK-3 new-project-guide (vigil, fresh context)

**Verdict: Pass.** Every criterion is met by the evidence and confirmed against the tree; no Blocking finding.

Scope read: contract, `results.json`, `as-built.md`, all four evidence files, the thirteen planned paths, and `technical.md` (D-STK-13, D-STK-14, D-STK-16, D-STK-19, EN-10). I verified the as-built's claims against the files rather than taking them.

### Criterion by criterion

**C1 — Frontmatter and names for the seven new runbooks. Met.** `yarn lint:docs` exit 0 at `1ba84ad`; the log sha matches the one handed to me. Independently: all seven files carry the full key set (`title`, `description`, `layer: runbooks`, `status: draft`, `thread: "STK-3"`, `role: Usher`, `date`, `last_reviewed`, `supersedes`, `load_when`) and kebab-case names — e.g. `new-project.md:1-12`, `remove-ai.md:1-12`.

**C2 — Every path and command resolves or is pending with its ticket. Met.** `yarn check-refs` exit 0. The only pending entry this ticket owns is `tooling/refs-pending.json:4`, `"docs/runbooks/port.md": "superseded by docs/runbooks/new-project.md (STK-3)"` — the exact wording non-negotiable 5 requires, and it appears in the C2 log's pending list. Spot-checked beyond the tool, since `check-refs` cannot see identifiers inside files:

- Every command the guide names exists: `check-stack`, `check-client-bundle`, `check-refs`, `check-specs`, `directory-map`, `doctor`, `hooks:install`, `spec:init`, `contract:init` (`package.json:20-43`).
- Step 3's check is honest about its own target: `preset.css` has `--primary`/`--primary-foreground` under both `:root` (49-50) and `.dark` (65-66) — the grep does print four lines — and the three-layer structure the step describes is real (`preset.css:11-15, 73`).
- Step 4's module table is true today: `toolkit.json:205-212` is the one unlocked `db` entry with its runbook; the other five modules have no entry, so their rows skip (`new-project.md:99`), and `check-stack.ts:163-177` behaves exactly as steps 4, 6 and 7 claim.
- `remove-supabase-database.md`, the one filled runbook (STK-9's content, per D-STK-19), names only things that exist: `boundaries.js:6, 50, 58, 64-65`; `codebase-conventions.md:89, 98`; `tech-stack.md:39-40`; the six root scripts and `yarn check-migrations &&` in `verify` (`package.json:13, 45-50`); `migrationsDir` (`toolkit.json:21`); the container `pem-db-local` (`packages/db/scripts/local-image.ts`). Its instruction to keep `DATABASE_ENVIRONMENT` is correct — `apps/web/env.ts:26` reads it and nothing else database-related.
- The five unbuilt runbooks name no invented path, only their ticket and the manifest field it will come from (non-negotiable 3 satisfied).

**C3 — Directory map lists the new runbooks and is current. Met.** `directory-map --check` exit 0; `docs/_generated/directory-map.md:408, 412-417` lists all seven, and the regenerated table in `docs/runbooks/README.md:28, 32-37` matches, with the hand-written "Start with" line (`:20`) pointing at `new-project.md`.

**C4 — A cold reader can name every step and the closing check. Met.** The method in `evidence/C4.md:5` is sound and adversarial: two fresh-context readers, one file, nothing else opened, the builder's own judgment excluded; read 1 returned "No" and forced thirteen fixes, read 2 returned "Yes". I confirmed the property still holds in the shipped text: steps 0 through 7, each ending in exactly one `**Check:**` line, with "Done means" (`new-project.md:18`) and step 7's check (`:135`) in agreement — the disagreement read 2 found is closed. See Should-fix 2 on the evidence's currency.

**Non-negotiables.** D-STK-14's order is followed with nothing reordered (`new-project.md:23-135`); the last checks are `yarn check-stack` and `yarn verify`, with the commit after them. All six removal runbooks carry the same seven sections in the same order. Both Supabase runbooks state what changes when both go (`remove-supabase-auth.md:20`, `remove-supabase-database.md:20`) and agree that auth goes first, per D-STK-1. `README.md:3, 46-48` states duplicate-then-remove and points at the guide, matching EN-10's ledger row (`ledger.md:341`). Both prompt files gained one dated amendment block naming EN-10 and record 0010 (`port-dry-run.md:15`, `engineering-layer.md:32`), with the bodies they reference still present — a byte-for-byte diff is not available to me with Read/Grep/Glob, so "never in place" rests on inspection, not proof.

### Findings

**Should-fix 1 — `docs/index.md:16` still states the retired porting rule.** It reads "A product repo copies what it needs, following `docs/runbooks/onboard-agent.md` and the port runbook in `README.md`." Both halves are now false: EN-10 and D-STK-2 replaced "copies what it needs" with duplicate-then-remove, and there is no port runbook in the README — the README points at `docs/runbooks/new-project.md`. This line is in the always-loaded spine, so every future session reads the superseded rule. Not Blocking: `docs/index.md` is outside this contract's planned paths, and non-negotiable 5 scopes the rule change to the README. Owner: Taylor (the as-built already routes it under Next, and it needs plan mode).

**Should-fix 2 — the recorded C4 evidence predates the shipped text.** `evidence/C4-reread.md:3` is pinned at `cc95735` with an addendum for STK-19 only, while `as-built.md:44-56` lists later rewrites of step 3 (the D-STK-17 three-layer preset), step 5 (the `directory-map` sub-step) and step 6 (the `.env.example` description and `check-client-bundle`). The as-built says so plainly — "The shipped text has not had a third cold read" — which is why this is not Blocking, and I independently confirmed that what C4 actually measures (the step list and the eight closing checks) is unchanged by those edits. But the evidence file of record describes an earlier guide than the one shipping. Owner: STK-20, which already carries it; worth one line in that ticket's contract so it is not lost.

**Consider 1 — step 3's check does not cover the docs description it instructs changing.** `new-project.md:80` tells the reader to rewrite the default title, the title template *and* the description in `apps/docs/app/layout.tsx`; the check at `:82` greps only for "Product Engineering Mastery" and "PEM". The current description (`apps/docs/app/layout.tsx:15-16`, "The practice — roles, design canon, templates, decisions, prompts — rendered from `docs/`") contains neither string, so a product that follows the check and not the prose ships toolkit copy in its metadata. The guide promises at `:21` that every step ends on a check; this one is a partial net.

**Consider 2 — `docs/prompts/` is excluded from the rename and never cleared, and the guide does not say why.** Step 2 leaves it alone (`:67`) and step 5 does not list it, so a product repo keeps this toolkit's phase prompts, including one that names `agent/PJ` and J-step numbering (`engineering-layer.md:17`). Read 2 raised exactly this (`evidence/C4.md:49`) and it is correctly routed to STK-20, but the guide itself is silent where it is explicit elsewhere — step 1's `[ASSUMPTION]` block (`:61`) is the pattern. One sentence would stop the next reader re-deriving the question.

**Consider 3 — step 6 describes a file nobody on this ticket read.** `new-project.md:116-124` characterises `.env.example` from STK-4's contract and as-built, not from the file; `as-built.md:55` says so, and my own session is likewise denied `.env.*`. The file certainly exists — `check-stack.ts:164-168` would fail the locked `env` entry otherwise, and it passes — but its *contents* matching the step's description is unverified by anyone. One line for STK-20's checklist.

### What a human still has to do

1. Run the guide cold on a real duplicate and time it (STK-20). Nothing in it has been executed: not the clone, the `git grep` renames, the clearing steps, or the final `yarn verify` in a renamed tree.
2. Read `.env.example` against step 6 and against `remove-supabase-database.md`'s Variables section.
3. Decide `docs/index.md:16` before the stack merges, in plan mode.
4. Confirm by diff that `port-dry-run.md` and `engineering-layer.md` changed only by their amendment blocks; I could inspect but not diff.

**Assumptions I made, stated for the record:** that `yarn verify`'s two failures named in `as-built.md:80-84` (stale `check-specs` PASSes from the unmerged stack, and the 7,075-of-7,000 evaluator budget row measured before any STK-3 edit) are outside this ticket, since neither touches a planned path and the budget figure predates the work; and that the `.claude/settings.local.json` and `tooling/check-client-bundle.test.ts` items in the deviation log belong to PJ and STK-4 respectively, which the tree supports.

Clean, careful work on the whole — the removal runbooks hold the "nothing invented" line exactly, and the cold-read record is the real thing rather than a self-report.

VERDICT: PASS
