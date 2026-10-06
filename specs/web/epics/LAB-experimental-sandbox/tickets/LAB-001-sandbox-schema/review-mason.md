# Review — mason on LAB-1

> Written by `yarn review:run mason LAB-1`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 863a59148797fa54c42b204eac568f6e99028198a4c51d3de5dd0198d4387e45
- as_built_sha256: fbdff24e9ac39ba304550488be6e0ee4f9f236579d49ce9e8cc0217727148e3b
- head: cbe33b58a2e5290342efccbf8dff03f4045e72a8
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T19:25:59Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason LAB-1`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket LAB-1 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C1.log (sha256 2a1ffd701644)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C2.log (sha256 a5418764e2ec)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C3.log (sha256 a5418764e2ec)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C4.log (sha256 a5418764e2ec)
   - C5 check: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C5.log (sha256 68157f0e2483)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): packages/db/migrations/0000_example_schema.sql, packages/db/migrations/0001_stripe_events.sql, packages/db/migrations/0002_billing_entitlements.sql, packages/db/migrations/0003_sandbox_schema.sql, packages/db/migrations/meta/0000_snapshot.json, packages/db/migrations/meta/0001_snapshot.json, packages/db/migrations/meta/0002_snapshot.json, packages/db/migrations/meta/0003_snapshot.json, packages/db/migrations/meta/_journal.json, packages/db/src/schema/index.test.ts, packages/db/src/schema/index.ts, packages/db/src/schema/sandbox/accesses.ts, packages/db/src/schema/sandbox/actions.ts, packages/db/src/schema/sandbox/columns.ts, packages/db/src/schema/sandbox/comments.ts, packages/db/src/schema/sandbox/gate-attempts.ts, packages/db/src/schema/sandbox/review-versions.ts, packages/db/src/schema/sandbox/reviewers.ts, packages/db/src/schema/sandbox/view-events.ts, packages/db/test/sandbox/schema.test.ts.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/technical/data-contract.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Verdict

PASS. Seven tables, the right cascade topology, the erasure-by-access shape the slice was risked on, service-only on every table proven at runtime, one forward migration numbered after the branch's latest. Two Should-fix items, neither a breach of a non-negotiable.

Evidence note: C2.log, C3.log and C4.log are one `test:db` run (identical sha `a5418764e2ec`), which is what the contract's commands specify — the three criteria name the same command. I read the three distinct logs (C1, C2/3/4, C5). All records are at head `829bc707`; `yarn check-specs --strict` owns the staleness check, and the recorded heads are internally consistent (the `review:mason`/`review:warden` entries at `d7d5707`/`d1a5a03` predate the second-round fixes, which is why this run exists).

## Criteria

**C1 — met.** `packages/db/src/schema/index.ts:11-17` exports exactly the seven; `index.test.ts:49-69` asserts the sorted set, `schema: undefined` (public), `policies.length === 1`, name `<table>_all_denied`, `for: "all"`, `to: authenticatedRole`, and `using`/`withCheck` both compiling to `false`. The actions guard (`index.test.ts:71-81`) tests column names against `/reviewer|access|label|display/` and asserts no foreign key — stronger than the statement, since it also blocks a `label` or `display_name` copy landing on the one table erasure never reaches. Gate-attempts is pinned to exactly four columns (`index.test.ts:85-91`), so a later ticket cannot quietly add a slug. C1.log line 455 reports 65 tests, 0 fail; the header's `tests: 73` is the runner counting its 8 suites, not a discrepancy.

**C2 — met.** `test/sandbox/schema.test.ts:136-145` asserts the *constraint name*, not merely rejection, so each refusal is attributed to the constraint that is supposed to catch it. Seven bad slug forms plus a 49-character slug plus a bad slug on `sandbox_actions`, with 48 characters accepted (`:148-184`); both-and-neither on accesses (`:206-225`); two authors, no author, and reviewer-without-access on comments, plus a 2,001-character body (`:227-260`). `:262-285` proves what the composite keys buy: a view event cannot borrow another reviewer's access, and a comment cannot claim a slug that is not its reviewer's.

**C3 — met.** `:287-335` builds two accesses for one reviewer, a full child set through each, and a reply pointing at the root that is about to die; after deleting one access, exactly the three rows through it are gone, the second access's rows and the orphaned reply survive, and the reviewer stays. `:337-349` proves the reviewer-level cascade sums to zero. The shape backs this correctly: `0003_sandbox_schema.sql:109-115` gives every child both `(access_id, reviewer_id) → sandbox_accesses(id, reviewer_id)` and `(reviewer_id, slug) → sandbox_reviewers(id, slug)`, both `on delete cascade`. A team note has null in all three author columns, so under MATCH SIMPLE neither key applies — which is required, because `data-contract.md:32` makes team notes a *separate* step of an experiment's erasure, not a reviewer cascade.

**C4 — met, and beyond the statement.** `:351-446` inserts a live row in all seven tables through the singleton, then for each of `user`, `developer`, `admin` asserts select → `[]`, delete → 0 rows, update → 0 rows, and insert → SQLSTATE `42501` on a *well-formed* row, so only RLS can be the refuser. `assert.equal(forged.length, 7)` is the right guard: adding a table without a case fails the test rather than silently skipping it.

**C5 — met.** C5.log: 4 migrations, none touching auth. 0003's only cross-schema references are `public.users` (`:108, :111`).

## One-way door, ratified

0003 was deleted and regenerated to land the `counts` check in a single migration (as-built "After the second reviews"). I ratify it: the journal chain is intact (`meta/0002_snapshot.json:2` id `0ac19aae…` → `meta/0003_snapshot.json:3` prevId `0ac19aae…`), `_journal.json:29` `when` 1791314171646 is after 0002's 1791253971852, the file never reached a hosted project (the contract's out-of-scope confirms none exists), the branch is unmerged, and the local rebuild is recorded. This is the last cheap regeneration — once the operator applies 0003 anywhere hosted, it is immutable history.

## Findings

**Should-fix — `slugIsValid` is neither verb-first nor the package's predicate form.** `packages/db/src/schema/sandbox/columns.ts:19`. `docs/engineering/codebase-conventions.md:150` requires verb-first camelCase, and the package's eleven neighbours are all `is*`/`has*` prefixed (`packages/db/src/sandbox/viewer.ts:88`, `packages/db/src/loopback.ts:11`). `slugIsValid` is the only `xIsY` in the repo, and it also reads as a boolean predicate while returning `SQL`. `checkSlug` or `buildSlugCheck` fits both the rule and the return type. Name-only, no SQL effect — but this file is the pattern the remaining LAB schema work will copy.

**Should-fix — `action` and `target_email` are unconstrained text on the one table erasure cannot reach.** `0003_sandbox_schema.sql:89,91`; the code wall is `packages/db/src/sandbox/actions.ts:27,49-71`. `sandbox_actions` is retained forever by design (`schema/sandbox/actions.ts:8-9`) and is deliberately outside every cascade, so anything that lands in a text column there outlives the erasure it recorded. `counts` was closed in SQL for exactly this reason (`0003_sandbox_schema.sql:94`) after the code-only argument was shown to be wrong; the same argument applies to the two remaining columns that can carry an address. Today `recordAction` holds `action` to `^[a-z]+(-[a-z]+)*$` (which an email cannot match) and permits `targetEmail` only when `action === "role-change"` — proven by C2.log:306-311 — but that is a promise at one entry rail, not a property of the data. A check pinning `action` to the same kebab pattern and `target_email is null or action = 'role-change'` makes it a property. The ticket's one-migration non-negotiable forbids a 0004 here, so either regenerate 0003 once more, or hand it to the first later LAB ticket that opens a migration with a ledger line naming the trigger. Do it before 0003 is applied to a hosted project, or the cheap option is gone.

**Consider — the counts check leans on AND short-circuit for scalar jsonb.** `packages/db/src/schema/sandbox/actions.ts:72-75`, emitted at `0003_sandbox_schema.sql:94`. `jsonb - text[]` errors on a scalar, so `counts: 3` is refused with `23514` only because Postgres evaluates `jsonb_typeof(...) = 'object'` first. The row is refused either way, so no data property depends on this; only the constraint name the test asserts (`schema.test.ts:195-201`) does. A `case when jsonb_typeof(...) = 'object' then … else false end` would make the SQLSTATE deterministic. Not worth a migration on its own — fold it in if the finding above reopens 0003.

**Consider — `bytea` is filed under `schema/sandbox/`.** `packages/db/src/schema/sandbox/columns.ts:24`. Correct now (sandbox is its only consumer, so co-location is the right call), but it is a schema-level primitive by nature; move it at the second domain. Already captured in as-built "Next", so this is agreement, not a new ask.

The as-built's claims check out against the code, including the ones it flags against itself: the composite-key deviation, the nullable `first_design`/`last_design`, the `public.users` references that `devs_call` hands to the builder, and the `[ASSUMPTION]` about stamping `epic`/`status` frontmatter on the three `technical/` detail files — that last one is the operator's to confirm, and it is labeled rather than buried.

VERDICT: PASS
