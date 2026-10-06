# Review — mason on LAB-1

> Written by `yarn review:run mason LAB-1`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 863a59148797fa54c42b204eac568f6e99028198a4c51d3de5dd0198d4387e45
- as_built_sha256: d3da8d6f11c074cbfa9209dd70c90f1c5b49c7106cd1411be798dbde82b0728d
- head: d7d57077699ddc5679d9f96ef5639cb0699f903b
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T18:49:43Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason LAB-1`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket LAB-1 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C1.log (sha256 c5cafa66b508)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C2.log (sha256 eeece9b84f74)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C3.log (sha256 eeece9b84f74)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C4.log (sha256 eeece9b84f74)
   - C5 check: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C5.log (sha256 7f60ba0c6872)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): packages/db/migrations/0000_example_schema.sql, packages/db/migrations/0001_stripe_events.sql, packages/db/migrations/0002_billing_entitlements.sql, packages/db/migrations/0003_sandbox_schema.sql, packages/db/migrations/meta/0000_snapshot.json, packages/db/migrations/meta/0001_snapshot.json, packages/db/migrations/meta/0002_snapshot.json, packages/db/migrations/meta/0003_snapshot.json, packages/db/migrations/meta/_journal.json, packages/db/src/schema/index.test.ts, packages/db/src/schema/index.ts, packages/db/src/schema/sandbox/accesses.ts, packages/db/src/schema/sandbox/actions.ts, packages/db/src/schema/sandbox/columns.ts, packages/db/src/schema/sandbox/comments.ts, packages/db/src/schema/sandbox/gate-attempts.ts, packages/db/src/schema/sandbox/review-versions.ts, packages/db/src/schema/sandbox/reviewers.ts, packages/db/src/schema/sandbox/view-events.ts, packages/db/test/sandbox/schema.test.ts.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/technical/data-contract.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Review — LAB-1 sandbox-schema (mason, fresh context)

**Verdict up top: pass.** Seven non-negotiables, all met; the one defect I found is mechanical and does not touch the shape.

### Criteria

**C1 — met.** `C1.log` exit 0 (60 tests + 8 suites = the 68 in `results.json`), with the four C1 tests at `ok 25–28`. The code backs it: `packages/db/src/schema/index.ts:11-17` exports all seven; `index.test.ts:53` is a `deepEqual` against a sorted list of exactly seven `sandbox_` names, so an eighth table fails the test, not just a missing one; `:57-63` pins each to one policy named `<table>_all_denied`, `for all`, `to authenticated`, `using false`, `with check false`, and `:56` holds it in `public`. `:67-73` asserts no column on `sandbox_actions` matching `/reviewer|access|label|display/` and no foreign key — `actions.ts:49-71` has neither, and `actor_user_id` is deliberately unreferenced. `:75-82` pins `sandbox_gate_attempts` to exactly four columns with no foreign key (`gate-attempts.ts:16-29`). `:84-98` asserts no default on `sandbox_comments.id` and `sandbox_review_versions.id` (`comments.ts:56`, `review-versions.ts:44`) and `parent_id` present with no key (`comments.ts:81`). The migration agrees: `0003_sandbox_schema.sql:127-133` creates all seven denial policies, with `ENABLE ROW LEVEL SECURITY` on each table.

**C2 — met.** `test/sandbox/schema.test.ts:148-265`. The `refused` helper (`:136-145`) asserts the *constraint name*, so a row rejected for the wrong reason fails the test — that is what makes this evidence worth something. Covered: seven malformed slugs and a 49-character one (`:149-172`), a bad slug on `sandbox_actions` (`:173-181`), a 48-character slug accepted (`:182-183`), both-or-neither identity (`:186-205`), three bad comment-author shapes including `reviewer_id` with no `access_id` (`:207-225`), and a 2,001-character body (`:226-233`). Each maps to SQL in `0003:14, 28, 61-64, 93`.

**C3 — met.** `:267-317` deletes one of two accesses and asserts the view, comment and version through it are gone, the second access's three rows survive, a reply whose root was erased survives, and the reviewer stays; `:319-331` asserts deleting the reviewer leaves zero. The cascades are `0003:108-114`. The property that matters for erasure holds in SQL rather than in code: `sandbox_comments_one_author_check` (`0003:64`) makes `reviewer_id` and `access_id` non-null together, so no reviewer's comment can exist outside the access cascade — under MATCH SIMPLE that was the real hole, and it is closed.

**C4 — met, and broader than the criterion asks.** `:333-428` loops `user`, `developer`, `admin` across all seven tables: select returns `[]`, delete and update touch zero rows, and insert is rejected with `42501` specifically, not merely rejected. `assert.equal(forged.length, 7)` (`:392`) stops a table quietly dropping off the list, and every table holds rows before the loop (`:334-349`), so "reads nothing" is not vacuous. `src/rls.ts:61` does `set local role authenticated`, so the policies genuinely apply — had the role switch not taken, the selects would have returned rows.

**C5 — met.** `check-migrations` exit 0 over 4 migrations; `0003` names only `public` objects (`:107`, `:110` are foreign keys to `public.users`). The checker is itself covered by `C1.log ok 1-6`, including "DDL against auth fails" and "a foreign key to auth.users is allowed", so the pass means something. Forward-only: `0003` is `CREATE TABLE` / `ALTER TABLE … ADD CONSTRAINT` / `CREATE INDEX` / `CREATE POLICY` only, no `DROP`; journal `idx 3`, `when 1791310212020` after `0002`'s `1791253971852`; `0003_snapshot.prevId` equals `0002_snapshot.id`, so the chain is intact.

*Limit of this review:* read-only tools, so I could not diff `0000`–`0002` against main. The chain is consistent and the as-built's own account puts `0002`'s rewrite in its own ticket before LAB-1 (the drifted local copy, `as-built.md:23`), so I record "no applied migration edited" as unfalsified, not independently proven.

The deviations check out against the code: composite `(access_id, reviewer_id)` and `(reviewer_id, slug)` keys are stricter than the contract's single-column requirement and are proven by `:242-265`; `columns.ts` sits inside the planned `schema/sandbox/**`; the frontmatter added to the three `technical/` detail files inherits `status: approved` from `technical.md:3`, which is what it says it does.

### Findings

**Should-fix — `packages/db/src/schema/index.test.ts:57` and `:71` will fail `yarn format:check`.** Both exceed `printWidth: 80` (`packages/config/prettier/index.js:12`) as breakable call arguments, which Prettier reformats; the file is not in `.prettierignore`. They are the only such lines in `packages/db` — every other over-80 line in these tests is an unbreakable template literal or a `test("…", fn)` call Prettier preserves. `format:check` is the first step of `yarn verify` (`package.json:14`), so batch close fails until `yarn format` runs. I could not run Prettier to confirm; this is inference from config plus the outlier, and it is one command to settle.

**Should-fix — the `review:warden` record predates the fixes it asked for.** `results.json:77-87` records warden PASS at head `34d619b` with an older `contract_sha256`/`as_built_sha256`, i.e. before `a48b777`, the commit that widened C4 to all seven tables with `42501` and `developer`, and added `SANDBOX_ACTION_COUNT_NAMES` (`actions.ts:31-40`) — the as-built attributes all three to warden (`as-built.md:18-21`). Warden's PASS therefore does not cover them. Not mine to re-run; `yarn check-specs --strict` is the gate before merge, and `yarn review:run warden LAB-1` is the fix.

**Consider — `bytea` is a package-wide primitive living in a domain folder** (`src/schema/sandbox/columns.ts:24-26`). Two sandbox consumers justify the file today, but the first non-sandbox table needing raw bytes will import across domains from `sandbox/`. Move it to a schema-level module at that point, not before.

**Consider — leave the two redundant uniques alone.** `sandbox_reviewers_id_slug_key` (`reviewers.ts:59`) and `sandbox_accesses_id_reviewer_key` (`accesses.ts:57`) are supersets of their primary keys and exist only as composite-FK targets; both carry a comment saying so. Worth the write cost for the integrity they buy — flagging it so a later index-pruning pass does not drop them and take six foreign keys with them.

VERDICT: PASS
