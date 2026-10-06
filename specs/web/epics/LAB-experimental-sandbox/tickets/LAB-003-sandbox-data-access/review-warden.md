# Review — warden on LAB-3

> Written by `yarn review:run warden LAB-3`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: d2e24e81b694f829d2a4cbfac9a66c874b0ef5633412b7c73e0ddc881d682eec
- as_built_sha256: edd18c91d00a0947bf8cf03e5b7dd81368aab865425a5c71e5644368fa993502
- head: 1da0d7dc0a32fd7ee48d0b14b1293d506934b238
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T19:31:04Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden LAB-3`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket LAB-3 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/evidence/C1.log (sha256 7499ea8228cd)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/evidence/C2.log (sha256 7499ea8228cd)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/evidence/C3.log (sha256 7499ea8228cd)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/evidence/C4.log (sha256 7499ea8228cd)
   - C5 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/evidence/C5.log (sha256 29047347c678)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): packages/config/eslint/boundaries.js, packages/db/package.json, packages/db/src/sandbox/actions.ts, packages/db/src/sandbox/gate.ts, packages/db/src/sandbox/index.ts, packages/db/src/sandbox/viewer.test.ts, packages/db/src/sandbox/viewer.ts, packages/db/test/sandbox/fixtures.ts, packages/db/test/sandbox/isolation.test.ts, packages/db/test/sandbox/registry.ts, packages/db/test/sandbox/schema.test.ts, tooling/boundaries.test.ts.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/technical/data-contract.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## LAB-3 — security and privacy review (warden, fresh context)

Read: contract, `results.json`, as-built, all five evidence logs, the twelve changed files, `technical/data-contract.md`, plus `technical/gate.md` for the link-token claim the as-built leans on.

### Criteria

**C1 — every export, as every viewer kind: PASS.**
`VIEWER_KINDS` (`test/sandbox/registry.ts:19-25`) is exactly the contract's five kinds. `recordAction`, the only viewer-facing export, runs as all five (`isolation.test.ts:499-507`); the three reviewer kinds are refused with `NOT_A_TEAM_VIEWER` **and** the row count is compared before and after, so a refusal is proven to write nothing (`isolation.test.ts:115-124`). `reviewerScope` is exercised against real rows across `view_events`, `comments` and `review_versions` for four reviewers, asserting each sees exactly their own id, plus a slug-swap case that must return `[]` and both team viewers refused (`isolation.test.ts:608-642`). The fixtures build the cross-tenant conditions the criterion names — two reviewers on slug A, one on B, a signed-in reviewer on A, a team note (`fixtures.ts:177-202`). The log shows 24 registered cases plus the scope test, 0 skipped, and the harness throws rather than skipping when the tier is not local (`fixtures.ts:33-38`), so a green run cannot be an empty one.

**C2 — the coverage guard: PASS.** `coverageProblems` runs clean on the real module and the synthetic module produces all four problem classes, asserted as an exact list (`isolation.test.ts:561-590`). See the Should-fix below on what the guard cannot see.

**C3 — the gate group: PASS, with the residual already on the record.** All four functions take `(db, input)` and return only ids, versions and flags (`gate.ts:26,61,97,132`); every happy-path case asserts the return's *exact* key set via `exactKeys`, so a widened select fails the suite. Slug scoping is in the query, not the caller: `findLiveReviewerByCodeHash` joins nothing and filters `slug` + `revoked_at is null`; `checkAccess` and `findAccessEmail` reach the slug only through an inner join on the reviewer row. Each null branch the criterion names is covered — foreign slug, revoked code, stale `code_version`, and a signed-in access read under another user id, signed out, or with a non-UUID (`isolation.test.ts:390-408`). `createAccess` closes the lookup-to-insert window properly: `code_version` is taken *from the reviewer row* while the `where` pins it to the caller's expected version and `revoked_at is null` (`gate.ts:80-87`), so a code replaced or revoked mid-flight grants nothing rather than writing an access that `checkAccess` would later refuse.

Existence-leak hygiene holds throughout: every refusal is a fixed exported constant, a malformed UUID is rejected before Postgres can echo it in an error (`viewer.ts:85-90`, applied at `gate.ts:65,101,136`), and wrong-slug and unknown-id both return a bare `null` after one query of the same shape — consistent with the one-face gate in `gate.md:18`.

`findAccessEmail` remains the one gate function returning personal data to a caller holding no viewer, and the control that makes it safe (the `email-link` HMAC, `gate.md:58-59`) lives in LAB-5, not here. The Tickets-gate ruling sanctions the carve-out and the as-built already routes it forward as a LAB-5 verification item (`as-built.md:50`), so I am not refiling it. I'll note only that the builder's choice to return `null` for a revoked code is stricter than `gate.md:59` requires and is the right call.

**C4 — `recordAction`: PASS.** The row is asserted by exact key set, confirming no reviewer column of any kind reaches it (`isolation.test.ts:154-163`), and then the whole row is stringified and searched for every reviewer's label, email, code and reviewer id (`isolation.test.ts:170-173`) — that is the assertion D-LAB-28 actually needs, not a column list. `targetEmail` is admitted only with `role-change` and only normalised (`actions.ts:58-71`), which is what stops an erasure from persisting the address it just erased; refused inputs include a reviewer's real email as the action, as a count key, and as a `targetEmail` on `erase-email` (`isolation.test.ts:514-534`). Counts are held to the schema's closed name list in the module and again by a SQL check.

**C5 — the boundaries: PASS.** `web-sandbox` precedes `app-web` and `db-sandbox` precedes `db` in `ELEMENTS` (first match wins), `db-sandbox` is in `NOT_FOR_APPS` so it is stripped from `APP_IMPORTS`, and only `web-sandbox` re-adds it (`boundaries.js:176,319`). The nine refusals and four allowances in the log cover the criterion's three clauses, including the zero-directory case (`apps/web/app/admin/zz-probe.ts`, test 57), which proves the `**/*` override glob matches route files sitting directly in those trees. Putting `db-sandbox` in `TRANSPORT_FREE` turns "imports neither next nor react" into a lint rule rather than a convention, and `viewer.test.ts:81-91` additionally bans `getDb`, `createDb` and `closeDb` across the module's source — so "db is always an argument" is enforced twice. No app file imports `@pem/db/sandbox` yet, as expected.

As-built claims check out against the code, including all six deviations and the post-review additions at lines 18-25.

### Findings

**Should-fix — `packages/db/test/sandbox/registry.ts:56-64`: `group: "gate"` is an unchecked label, so the guard cannot tell a gate function from an unscoped reviewer read.**
The guard verifies arity but never that a `"gate"` entry is one of `gate.ts`'s four exports. Two concrete evasions: a surface ticket adds `getCommentsForSlug(db, input)` in `comments.ts`, files it `gate` with one happy-path case, and the guard is satisfied — that unscoped getter is precisely the leak this ticket exists to prevent. Second, `Function.length` stops at the first default or rest parameter, so a scoped read written `(db, viewer, input = {})` has length 2; filed correctly as `viewer` it trips the *false* error "does not take (db, viewer, input)", which pushes a hurried builder to re-file it as `gate`, where it passes and never runs against every viewer kind. The fix is cheap and structural: import `* as gate from "../../src/sandbox/gate.ts"` in the suite and assert every `group: "gate"` name is a key of that module, so the Tickets-gate ruling's closed list of four is enforced by the suite rather than by reviewer attention on each future ticket. The module boundary is the recorded ruling; today nothing holds it.

**Consider — `boundaries.js:321-324` with `as-built.md:54`: LAB-5 must bind the gate group, never re-export it.**
`app-web` may import `web-sandbox`, and `web-sandbox` may import `db-sandbox`. An `export * from "@pem/db/sandbox"` in `apps/web/lib/sandbox/` would therefore hand `findAccessEmail` to every file in apps/web. The `@pem/db/client` ban covers only `app/experimental/**` and `app/admin/**`, so a file elsewhere — `app/api/**`, say — could hold both the re-exported gate group and a db. Nothing enforceable exists here yet because the file does not; the as-built already says LAB-5 binds in `access.ts`, which is the right shape. Worth carrying into LAB-5's contract as a named constraint rather than a convention.

**Consider — `packages/db/src/schema/sandbox/actions.ts:8,62` with `data-contract.md:21`: `target_email` has no stated retention.**
`actor_email` has a deliberate, documented reason to be kept forever ("the record outlives the account that made it") — that is a legitimate audit-log retention decision. `target_email` arrived later and inherits "Retention: kept" by silence, in a table erasure never touches. A team member whose role changed, then left, keeps their address in that row indefinitely with no stated reason or expiry; team members are data subjects too. The column is LAB-1's and the writer is LAB-9's, so this is not LAB-3's to change — it needs a line in the erasure semantics (or an explicit "kept, because" like `actor_email` has) when LAB-9 or LAB-16 lands.

### Verdict

No Blocking findings. Every criterion is met by evidence I can trace to code, the evidence is from a real local-database run that cannot silently skip, the gate group returns nothing outside the ruling's carve-out, every refusal is a fixed string, and both the module boundary and the transport ban are enforced by lint rather than by discipline. The one structural weakness is in the guard's durability for future tickets, not in what shipped.

VERDICT: PASS
