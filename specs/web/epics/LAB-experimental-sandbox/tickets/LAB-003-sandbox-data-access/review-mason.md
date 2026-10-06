# Review — mason on LAB-3

> Written by `yarn review:run mason LAB-3`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: d2e24e81b694f829d2a4cbfac9a66c874b0ef5633412b7c73e0ddc881d682eec
- as_built_sha256: 1e088088b0f1f6bed52293e0ae5a29e11c1268bade6eb378de985d8211c25178
- head: 0688ea0e0044a4ef31106c09d2ce3dfbd9e86829
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T19:38:39Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason LAB-3`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket LAB-3 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/evidence/C1.log (sha256 fd58c1b6f92b)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/evidence/C2.log (sha256 fd58c1b6f92b)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/evidence/C3.log (sha256 fd58c1b6f92b)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/evidence/C4.log (sha256 fd58c1b6f92b)
   - C5 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/evidence/C5.log (sha256 c88c22fe20e5)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): packages/config/eslint/boundaries.js, packages/db/package.json, packages/db/src/sandbox/actions.ts, packages/db/src/sandbox/gate.ts, packages/db/src/sandbox/index.ts, packages/db/src/sandbox/viewer.test.ts, packages/db/src/sandbox/viewer.ts, packages/db/test/sandbox/fixtures.ts, packages/db/test/sandbox/isolation.test.ts, packages/db/test/sandbox/registry.ts, packages/db/test/sandbox/schema.test.ts, tooling/boundaries.test.ts.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/technical/data-contract.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Criteria

**C1 — every export, every viewer kind — met.** `isolation.test.ts:602` drives the registry: `recordAction` runs as all five kinds (`isolation.test.ts:499-507`), the four gate functions through named cases, `SandboxAccessError` through its refusal case. The substance of "no row crosses" is `isolation.test.ts:617-651`: each of the four reviewers (including the signed-in one) sees exactly their own row in `sandbox_view_events`, `sandbox_comments` and `sandbox_review_versions`; a viewer with its slug swapped sees nothing, so both predicates must match; both team viewers throw. C1.log suites 8–9, 25 tests, exit 0.

**C2 — coverage guard — met.** `registry.ts:52`. Run on the real subpath it returns `[]` (`isolation.test.ts:554`); the synthetic module asserts the exact seven problems (`isolation.test.ts:589`), including both default-parameter evasions the earlier reviews raised — `fakeGate` is refused because `GATE_GROUP` (`registry.ts:23`) is now a closed list, `fakeSupport` because a plain function may not be filed as support. The guard's scope is the `@pem/db/sandbox` subpath's runtime exports, which is the right boundary: index.ts re-exports exactly the six keys the registry holds.

**C3 — gate group — met.** `gate.ts` takes `(db, input)` throughout and returns only ids, versions, flags, or the access email; `exactKeys` pins every return shape. Every null path is exercised: foreign slug, revoked code, stale `code_version`, a signed-in access read by another user id or signed out, and malformed input that never reaches a query (`gate.ts:30`, `:65`, `:101`, `:136`). `data-contract.md:54` carries the `(db, input)` exception, as the as-built claims.

**C4 — recordAction — met.** One row, with the exact key set asserted (`isolation.test.ts:154-163`), `targetEmail` null on the ordinary path, and the serialized row proven to contain no reviewer label, email, code or id (`isolation.test.ts:170-173`). All three reviewer viewers are refused with `NOT_A_TEAM_VIEWER` and write nothing (`isolation.test.ts:123`). `role-change` is the only action admitting an address (`actions.ts:64`).

**C5 — boundaries — met.** `db-sandbox` is in `NOT_FOR_APPS` (`boundaries.js:176`), so only `web-sandbox` among app files may import it; no package but `db` lists it. C5.log tests 53–65: nine refusals, four allowed, covering both `apps/web/app/admin/zz-probe.ts` (zero intervening segments) and `apps/web/app/experimental/[slug]/zz-probe.ts`, so the route override's glob is proven at both depths. Test 58 shows the override keeps apps/web's SDK bans rather than replacing them, and the `@/lib/sandbox/team` allow-probes resolve against real files, so they are not passing on `unresolvableAlias`.

The second element is the right call: eslint-plugin-boundaries matches paths, not package subpaths, so `@pem/db/sandbox` cannot be named by a rule without one. Putting `db-sandbox` in `TRANSPORT_FREE` converts "imports neither next nor react" from prose into a lint rule.

## Findings

**Should-fix — `packages/db/test/sandbox/registry.ts:74`.** The `support` group escapes the check that closed `gate`. The docstring at `registry.ts:17` promises "`support` holds only classes and values", but the guard only rejects a *plain* function: `isClass` short-circuits `isFunction` (`registry.ts:68`), so a class with a static unscoped read, or `export const reviewerQueries = { getById }`, ships with one token case and no per-viewer coverage. This is the same hole, one door over, that the second review closed for `gate` by making the list closed. Fix it the same way — a closed `SUPPORT_GROUP`, or reject a support entry whose value has any function-valued property.

**Should-fix — `packages/db/src/sandbox/viewer.test.ts:83`.** `readdirSync(dir)` is non-recursive, so the `getDb|createDb|closeDb` scan covers only the four files currently in `src/sandbox/`. The contract hands the file split to the builder (`contract.md:13`), so a later ticket adding `src/sandbox/reviews/queries.ts` escapes the one check that enforces "db is always an argument" — the next/react half is covered by the lint glob, this half is not. `readdirSync(dir, { recursive: true })` closes it.

**Consider — `packages/db/src/sandbox/actions.ts:58-71`.** `targetEmail` is held to a normalised address on `role-change` only, but nothing establishes it is a *team* member's. `sandbox_actions` is retention-kept and untouched by erasure (`actions.ts:8`), so a role-change caller passing a reviewer's address is the one path by which a reviewer email outlives its own erasure. The module could refuse an address matching a live reviewer label — the erasure semantics already compare labels to emails case-insensitively (`data-contract.md:37`), so the lookup is available. Failing that, LAB-9 should carry it as a named criterion.

**Consider — `packages/db/src/sandbox/gate.ts:80-87`.** The raw `insert … select` hard-codes `reviewer_id, email, user_id, code_version` as SQL text. The atomicity reason is sound and I would keep the raw statement, but a rename in `schema/sandbox/accesses.ts` now fails only in the isolation suite, and only on a local database — not in `check-types`. A comment naming the coupling, or interpolating the column objects as the `where` clause already does, keeps the two in step.

Note for the close, not a finding: `review:warden` in `results.json` is recorded at `1da0d7d`, behind the code head `1b7f5b4`; its re-record is warden's run.

VERDICT: PASS
