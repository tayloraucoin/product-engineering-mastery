# Review — mason on LAB-3

> Written by `yarn review:run mason LAB-3`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: d2e24e81b694f829d2a4cbfac9a66c874b0ef5633412b7c73e0ddc881d682eec
- as_built_sha256: edd18c91d00a0947bf8cf03e5b7dd81368aab865425a5c71e5644368fa993502
- head: cbe33b58a2e5290342efccbf8dff03f4045e72a8
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T19:25:59Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason LAB-3`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket LAB-3 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Per-criterion

**C1 — every export, as every viewer kind: MET.**
`VIEWER_KINDS` (`packages/db/test/sandbox/registry.ts:19-25`) is exactly the contract's five, and `fixtures.ts:165-224` builds them against real rows: two reviewers on slug A, one on slug B, a signed-in reviewer on slug A, a team note, and developer/admin viewers. `recordAction` — the only viewer function that exists — runs as all five (`isolation.test.ts:499-507`; C1.log tests 19-23). `reviewerScope`, the single helper every later reviewer read will filter by, is proven against real rows for all four reviewers across `sandbox_view_events`, `sandbox_comments` and `sandbox_review_versions`, returns nothing when the slug is swapped, and refuses both team viewers (`isolation.test.ts:608-641`; C1.log suite 9). The team note on slug A is correctly excluded by the `reviewer_id` predicate. Gate functions carry named cases instead of viewer cases, which is what `technical/data-contract.md:54` sanctions.

**C2 — the coverage guard: MET.**
`coverageProblems` (`registry.ts:41-77`) flags an unregistered export, a `viewer` entry missing any of the five kinds, a misfiled group, and an entry for nothing exported. Run against the real namespace it returns `[]`; the synthetic module asserts the exact problem list, misfiling included (`isolation.test.ts:554-590`; C1.log suite 7). Importing through `@pem/db/sandbox` (`isolation.test.ts:15`) means a wrong `exports` entry fails here too, and `package.json:39-42` is the one subpath.

**C3 — the gate group: MET.**
`gate.ts` takes `(db, input)` throughout and returns only `{reviewerId, codeVersion}`, `{accessId}`, `{reviewerId, accessId}` or an email; `exactKeys` pins each return shape. Every state the criterion names is covered and passing: live code on its own slug, foreign slug, revoked code, stale `code_version`, and a signed-in access read by another user id or signed out (C1.log tests 1-18). Malformed ids and hashes are rejected before any query (`gate.ts:31-35, 101, 136`), which is the right call given Postgres echoes a bad uuid.

**C4 — recordAction: MET.**
One row with actor id and email, action, slug and counts, and nothing else (`actions.ts:78-85`); the test asserts the row's exact key set and that no reviewer label, email, code or id appears anywhere in it (`isolation.test.ts:154-173`). All three reviewer viewers are refused with a fixed message and write nothing — the test compares the table count across the refusal (`isolation.test.ts:115-123`). `targetEmail` is admitted only with `role-change` and only normalised (`actions.ts:58-71`), so an erasure cannot record the address it erased.

**C5 — the boundary: MET.**
`web-sandbox` and `db-sandbox` are listed before their parents (`boundaries.js:82-86, 95-103`), `db-sandbox` is in `NOT_FOR_APPS` (`:176`) so only `web-sandbox` reaches it, and the route override bans `@pem/db/client` and `@pem/db/schema` under `apps/web/app/experimental/**` and `apps/web/app/admin/**` while keeping the SDK bans (`:244-264`). Nine refusals and four allowances pass, including `services` refused and `next`/`react` refused inside the module (C5.log tests 53-65, exit 0).

The as-built's claims check out against the code, including the second-review items (`targetEmail` on role change only, the arity check, the `@pem/db/sandbox` import, the `createDb`/`closeDb` ban at `viewer.test.ts:89`, nine-plus-four probes, and `data-contract.md:54` naming the exception). The two declared deviations — the `db-sandbox` element and `createAccess` returning null on a stale or revoked code — are both improvements on the contract's shape, and `grep` confirms no `getDb`/`createDb`/`closeDb` anywhere in `src/sandbox/`.

Two evidence observations, neither a finding: C1-C4 share one log because they share one command, and the identical sha256 is correct. The log footer reports 60 tests and 10 suites while `results.json` records 70 — the recorder is counting suites as tests; only tooling writes that file.

## Findings

**Should-fix — the guard's arity check is defeated by a default parameter.** `registry.ts:56-64` infers a function's group from `Function.length`, so a reviewer-scoped read declared `(db, viewer, input = {})` reports arity 2 and may be filed as `gate`, which is precisely the misfiling the check exists to catch — and a `gate` entry never runs against the five viewer kinds. Nothing today is misfiled, but the next ticket to add a scoped read is the one that would discover it. The Tickets-gate ruling makes the gate group closed (four functions now, LAB-6's throttle later), so pin `gate` to a named list of members and let the guard refuse any other export into that group.

**Consider — nothing writes `last_seen_at`.** The column is `notNull().defaultNow()` (`packages/db/src/schema/sandbox/accesses.ts:47-49`) and the data contract commits to it, but neither this module nor LAB-5's contract claims the write, so an access would read as last seen at creation forever. `checkAccess` is the natural home; worth naming in LAB-5 rather than discovered by admin people.md.

**Consider — a db handle is still reachable from the route trees.** The override closes `@pem/db/client` and `@pem/db/schema`, as the contract asks, but an experimental or admin file can still import an apps/web module that re-exports one (`apps/web/lib/trpc/context.ts:23`, `apps/web/lib/billing/webhook/ledger.ts:28`), and the seven tables stay in the `@pem/db/schema` barrel. The `./schema/sandbox` subpath warden suggested closes the table half; a ban on app-local db-handle modules in `SANDBOX_ROUTE_FILES` would close the rest.

**Consider — the role-change case depends on case order.** `roleChangeAs` (`isolation.test.ts:128-138`) uses the same target address for both team viewers and relies on the developer's row being deleted before the admin's runs, so `rows.length === 1` holds only in `VIEWER_KINDS` order. Putting the role in the address makes the case independent of its neighbours.

VERDICT: PASS
