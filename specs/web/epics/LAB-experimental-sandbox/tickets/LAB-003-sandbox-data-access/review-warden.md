# Review — warden on LAB-3

> Written by `yarn review:run warden LAB-3`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: d2e24e81b694f829d2a4cbfac9a66c874b0ef5633412b7c73e0ddc881d682eec
- as_built_sha256: 1e088088b0f1f6bed52293e0ae5a29e11c1268bade6eb378de985d8211c25178
- head: 95699c84f5aa85c743faab7857ef67b15de6fd47
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T19:44:30Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden LAB-3`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket LAB-3 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

Read: contract, `results.json`, as-built, all five evidence logs, the twelve changed files, `technical/data-contract.md`, plus `technical/gate.md` (the request path and the link token the as-built leans on) and the prior warden review, so I don't relitigate what was already accepted.

## LAB-3 — security and privacy review (warden, fresh context)

### Criteria

**C1 — every export, as every viewer kind: met.** `VIEWER_KINDS` (`test/sandbox/registry.ts:30-36`) is exactly the contract's five. `recordAction`, still the only viewer-facing export, runs as all five (`isolation.test.ts:499-507`); each reviewer kind is refused with `NOT_A_TEAM_VIEWER` *and* the `sandbox_actions` row count is compared before and after, so a refusal is proven to write nothing (`isolation.test.ts:114-124`). `reviewerScope` runs against real rows in `view_events`, `comments` and `review_versions` for four reviewers, each asserted to see exactly its own id, plus a slug-swap case that must return `[]` and both team viewers refused (`isolation.test.ts:617-651`). The fixtures build the cross-tenant conditions the criterion names (`fixtures.ts:177-202`), and the harness throws rather than skipping off the local tier (`fixtures.ts:33-38`), so a green run cannot be an empty one. Log: 24 registered cases plus the scope test, 0 skipped.

**C2 — the coverage guard: met, and the prior Should-fix is properly closed.** The gate group is now a closed list (`registry.ts:23-28`), checked two ways: a `gate` entry not in `GATE_GROUP` is a problem (`registry.ts:70-71`), and a `GATE_GROUP` name filed as anything else is a problem (`registry.ts:88-92`). A function filed as `support` is refused outright (`registry.ts:74-75`), so the only remaining home for a new function export is `viewer` with arity 3 and five cases. That closes the default-parameter evasion: `(db, viewer, input = {})` reports arity 2, and all three of its escape routes now fail — the synthetic module proves `misfiled`, `fakeGate` and `fakeSupport` together as an exact problem list (`isolation.test.ts:561-599`). The suite imports through `@pem/db/sandbox` (`isolation.test.ts:15`), so a wrong `exports` entry fails here too.

**C3 — the gate group: met; the one carve-out is the recorded one.** All four take `(db, input)` and return only ids, versions and flags (`gate.ts:26,61,97,132`), and every happy path asserts the return's *exact* key set (`exactKeys`, `isolation.test.ts:88-91`), so a widened select fails the suite. `checkAccess` selects `accessUserId` but drops it from the return (`gate.ts:104-124`) — the right shape. Slug scoping is in the query, never the caller: `findLiveReviewerByCodeHash` filters `slug` and `revoked_at is null`; `checkAccess` and `findAccessEmail` reach the slug only through an inner join on the reviewer row. Every null branch the criterion names is covered, including a signed-in access read under another user id, signed out, and with a non-UUID (`isolation.test.ts:390-408`).

Two properties worth naming. First, revocation is real and immediate: with `revoked_at` set, all four functions return null, and `gate.md:16` puts `checkAccess` on every request after the cheap cookie check — so revoking a code cuts a live cookie on the next request, not in 30 days. Second, `createAccess` closes the lookup-to-insert window correctly: `code_version` is taken *from the reviewer row* while the `where` pins the caller's expected version and `revoked_at is null` (`gate.ts:80-87`), so a code replaced mid-flight grants nothing. Existence-leak hygiene holds: refusals are fixed exported constants with no interpolation anywhere in the module, and a malformed UUID is rejected before Postgres can echo it (`viewer.ts:85-90`, applied at `gate.ts:65,101,136`).

`findAccessEmail` is still the one gate function returning personal data to a caller holding no viewer, behind a 128-bit truncated HMAC that lives in LAB-5 (`gate.md:58`). The Tickets-gate ruling sanctions it and the as-built routes it forward as a LAB-5 verification item (`as-built.md:53`); not refiling.

**C4 — `recordAction`: met.** The row is asserted by exact key set, then the whole row is stringified and searched for every reviewer's label, email, code and reviewer id (`isolation.test.ts:154-173`) — that is the assertion D-LAB-28 needs, not a column list. `targetEmail` is admitted only with `role-change`, only trimmed, lower-cased and containing `@` (`actions.ts:58-71`), which is what stops an erasure persisting the address it just erased; refused inputs include a reviewer's real email as the action, as a count key, and as a `targetEmail` on `erase-email` (`isolation.test.ts:514-534`). Counts are held to the closed name list in the module and again by a SQL check (`schema/sandbox/actions.ts:72-75`). Both regexes are anchored.

**C5 — the boundaries: met.** `web-sandbox` precedes `app-web` and `db-sandbox` precedes `db` in `ELEMENTS` (`boundaries.js:82-103`); `db-sandbox` is in `NOT_FOR_APPS` so it is stripped from `APP_IMPORTS`, and only `web-sandbox` re-adds it (`boundaries.js:176,316-320`). The nine refusals assert a *specific* message regex rather than any error (`tooling/boundaries.test.ts:280-335`), including the zero-directory case `apps/web/app/admin/zz-probe.ts`, which proves the override glob matches route files sitting directly in those trees; the four allowances resolve to real files (`apps/web/lib/sandbox/team.ts` exists). The route override keeps apps/web's SDK ownership intact (`boundaries.js:254`), confirmed by the `ai` refusal at test 58. `TRANSPORT_FREE` makes "imports neither next nor react" a lint rule over the whole subtree, and `viewer.test.ts:81-91` additionally bans `getDb`, `createDb` and `closeDb` — I read all four source files and there is no singleton. No file imports `@pem/db/sandbox` outside the tests yet.

The evidence logs are internally consistent (header counts reconcile with the TAP totals: 60 leaves + 10 suites = 70) and the C1–C4 sha is identical because one command proves four criteria. As-built claims check out against the code, all deviations included.

### Findings

**Should-fix — `packages/db/test/sandbox/isolation.test.ts:553-600` with `packages/db/package.json:47-48`: the coverage guard, the one mechanical control over every future sandbox export, never runs in CI.**
D-LAB-34 accepts residual risk on the record because "isolation is proven by tests" — but C2's guard lives in a `test/` file reachable only by `yarn workspace @pem/db test:db`, and `yarn verify` deliberately does not run it (`docs/runbooks/new-project/README.md:91`). The contract set that command, so this is not a deviation; the consequence is still that a surface ticket's builder who adds `getCommentsForSlug` and doesn't run `test:db` locally gets no signal at all, and the merge gate stays green. The fix is cheap because the guard is pure: `coverageProblems` and the synthetic cases touch no database, so lifting the C2 `describe` (and the registry it reads) to a `src/`-side test file would put it under `yarn test` and therefore under `yarn verify`, leaving only the real-Postgres cases in `test:db`. `packages/db/src/**` may import `packages/db/test/**` under the boundaries graph, so nothing structural is in the way.

**Consider — `packages/db/src/sandbox/viewer.test.ts:82-85`: the purity scan is not recursive.**
`readdirSync` reads only `src/sandbox/` itself, so a future `src/sandbox/<subdir>/queries.ts` escapes the `getDb`/`createDb`/`closeDb` ban. The next/react half survives, because the lint glob is recursive (`boundaries.js:168,217-222`) — only the singleton ban is the discipline-only half. The file split inside `src/sandbox/` is explicitly the dev's call (`contract.md:13`), so a subdirectory is a realistic next step; `readdirSync(dir, { recursive: true })` closes it.

**Consider — `packages/db/src/schema/sandbox/actions.ts:8,62` with `data-contract.md:21`: `target_email` still has no stated retention, and the point is now unrouted.**
`actor_email` has a documented reason to be kept forever; `target_email` inherits "Retention: kept" by silence, in a table erasure never touches. LAB-3 did the part that was its own — restricting the column's writer to `role-change` — and LAB-27 will close its *validity* in SQL, but neither addresses its *lifetime*. A team member whose role changed and then left keeps their address in that row indefinitely with no stated reason. This was raised in the first warden review and does not appear in the as-built's Next, LAB-9's contract or LAB-27's, so nobody currently owns it; it needs one line in the erasure semantics (or an explicit "kept, because") when LAB-9 or LAB-16 lands.

Carried, not refiled: the seven sandbox tables remain in the `@pem/db/schema` barrel, so any apps/web file outside the experimental and admin trees can still pair it with `@pem/db/client`. The contract scopes the ban to those two trees exactly as shipped, and the as-built already records the `./schema/sandbox` subpath as the close-out (`as-built.md:56`).

### Verdict

No Blocking findings. Every criterion is met by evidence I can trace to code; the gate group returns nothing outside the ruling's carve-out and asserts its exact key sets; revocation is enforced on the request path by `checkAccess` and proven for all four functions; every refusal is a fixed string that cannot echo input; and the module boundary and transport ban are lint rules rather than conventions. The prior review's Should-fix is genuinely closed, and the remaining weakness is in when the guard fires, not in what it checks.

VERDICT: PASS
