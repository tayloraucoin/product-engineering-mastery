# Review — mason on LAB-3

> Written by `yarn review:run mason LAB-3`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: d2e24e81b694f829d2a4cbfac9a66c874b0ef5633412b7c73e0ddc881d682eec
- as_built_sha256: 1a3937228520a54700616ee1f41a7e87bf72f4740d60e423444f0677952b9175
- head: 9dad4a39cf24e1df0e4ec49b4a791b73655e473c
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T19:02:06Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason LAB-3`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket LAB-3 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/evidence/C1.log (sha256 cdc0a9e7c5e5)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/evidence/C2.log (sha256 cdc0a9e7c5e5)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/evidence/C3.log (sha256 cdc0a9e7c5e5)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/evidence/C4.log (sha256 cdc0a9e7c5e5)
   - C5 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/evidence/C5.log (sha256 6a5aa8c65099)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): packages/config/eslint/boundaries.js, packages/db/package.json, packages/db/src/sandbox/actions.ts, packages/db/src/sandbox/gate.ts, packages/db/src/sandbox/index.ts, packages/db/src/sandbox/viewer.test.ts, packages/db/src/sandbox/viewer.ts, packages/db/test/sandbox/fixtures.ts, packages/db/test/sandbox/isolation.test.ts, packages/db/test/sandbox/registry.ts, packages/db/test/sandbox/schema.test.ts, tooling/boundaries.test.ts.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/technical/data-contract.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Verdict up top

**PASS.** C1–C5 are met by the evidence and by the code; nothing Blocking. Three Should-fix findings, none of which touches a one-way door already walked through: one unvalidated field, one self-declared classification in the coverage guard, one stale line in the cited surface.

I read the working-tree files and they match the test names in `C1.log` and `C5.log` exactly; the recorded head `19bb3d8` is the code commit and the only later commit (`9dad4a3`) is the paperwork, so the proofs are not stale against what I read. `packages/db/test/sandbox/schema.test.ts` is LAB-1's and I did not review it.

## Criteria

**C1 — met.** `evidence/C1.log:167-329`: 24 registered cases plus the scope sweep, all `ok`, `fail 0`. The world (`test/sandbox/fixtures.ts:165-225`) is the contract's five kinds — two reviewers on slug A, one on B, developer, admin — plus a signed-in reviewer on A, each with an access, a view, a comment and a version, and a team note. `recordAction` runs as all five kinds; the three reviewer kinds are refused *and* `actionRowCount()` is compared before and after (`isolation.test.ts:109-119`), so a refusal is proven to write nothing. `reviewerScope` is proven against real rows on all three reviewer tables for all four reviewers, returning exactly the one own row each (`isolation.test.ts:573-607`); the team note is excluded by the same filter, which is the collaborate-mode guard LAB-25 will widen. A viewer with its slug swapped sees nothing, so both columns are load-bearing. Only one viewer-group export exists yet; the as-built says so under "Not verified", correctly.

**C2 — met.** `registry.ts:37-63` flags all three classes, and the synthetic-module test asserts the exact problem list, including four missing viewer kinds and a registered-but-unexported entry (`isolation.test.ts:534-555`). Run against the real module it returns `[]` (`C1.log:148-162`).

**C3 — met.** `src/gate.ts` is `(db, input)` throughout and every return is pinned by `exactKeys` in its case: `{reviewerId, codeVersion}`, `{accessId}`, `{reviewerId, accessId}`, or the email. No label, `display_name` or feedback row is selected anywhere in the file. Every clause of the statement has a case and all pass: own-slug-only hash hit, foreign slug, revoked code, stale `code_version`, signed-in access read by `otherUser`, read signed out, read with a malformed id, unknown ids. The documented deviations hold up: `createAccess` is one guarded `insert … select` (`gate.ts:80-87`), so a code revoked or replaced between lookup and insert grants nothing — stronger than the contract asked for — and `findAccessEmail` returning null on a revoked code (`gate.ts:148`) matches gate.md's "say no more than an unknown slug does".

**C4 — met, with one gap.** One row, `exactKeys` over its columns, actor id and email, slug and counts asserted, `targetEmail` null, and a JSON scan of the row proving no reviewer label, email, code or reviewer id appears (`isolation.test.ts:134-153`). Refusals cover free text, an email as the action, a bad slug, an unnamed count, a negative and a fractional count, each with the one fixed message. The gap is `targetEmail` — see Should-fix 1.

**C5 — met.** `C5.log`: 65/65, `fail 0`. Probes 34-42 and 62-65 are precisely this criterion: `@pem/db/sandbox` refused from `apps/web/app/**` and from `apps/web/lib/**` outside `lib/sandbox`, `@pem/db/client` refused in `app/experimental/[slug]/`, `@pem/db/schema` refused in `app/admin/`, and `lib/sandbox` importing the subpath allowed. The second element is the right call — the plugin matches paths, not subpaths — and putting `db-sandbox` in `NOT_FOR_APPS` (`boundaries.js:176`) plus the explicit `web-sandbox → db-sandbox` edge (`:316-320`) is the narrow form. `db-sandbox` in `TRANSPORT_FREE` (`:168`) makes "neither next nor react" a lint rule, proven by probes 41-42. I checked the obvious way around the route override: `@pem/db` has no root export, and `@pem/db/rls` hands out no client of its own (`createRlsClient(db, context)` takes one), so `client` and `schema` are the only doors and both are shut.

## Findings

**Should-fix**

1. `packages/db/src/sandbox/actions.ts:66` — `targetEmail` reaches the insert unchecked, while `action`, `slug` and `counts` each get a validator and a fixed refusal. The only thing enforcing "a team member's email, never a reviewer's" (contract gotcha; D-LAB-28; `data-contract.md:21`) is the comment on line 35. This module *is* the enforcement layer for personal data in the sandbox — a comment is not it. Validate as `createAccess` validates email (string, non-empty, already trimmed and lower-cased), and add the refusal to the `SandboxAccessError` entry at `test/sandbox/isolation.test.ts:489`.

2. `packages/db/test/sandbox/registry.ts:26-32` — the group is self-declared, so a later `(db, viewer, input)` read registered as `group: "support"` with one trivial case passes the guard without ever running against the five viewer kinds. The guard honestly catches a *missing* entry; it cannot catch a *mis-filed* one, and every surface ticket from here on files its own entry. Derive it instead: in `coverageProblems`, require any export with `fn.length >= 3` to be in the `viewer` group, and add that case to the synthetic module at `isolation.test.ts:534`. One line now, versus the one unscoped read this ticket exists to prevent.

3. `specs/web/epics/LAB-experimental-sandbox/technical/data-contract.md:49` — "Every function in `@pem/db/sandbox` takes `(db, viewer, input)`" is now false: the gate group takes `(db, input)` under the Tickets-gate ruling. The cited surface contradicts the shipped module with no note, so the next reader either writes the wrong signature for a gate-like function or files `gate.ts` as a violation. One line in that section naming the gate group fixes it.

**Consider**

4. `packages/db/test/sandbox/isolation.test.ts:19` — the suite imports `../../src/sandbox/index.ts`, not the `@pem/db/sandbox` subpath it is meant to pin, so a wrong `exports` entry would not fail the guard. The stripe-ledger test does the same, so this is a house pattern rather than drift; worth changing both together, or not at all.

5. `tooling/boundaries.test.ts:245,259` — the LAB-3 probes run under test names prefixed `C1:`/`C2:`, which are WEB-2's criterion ids. `C5.log` therefore reads as "C1/C2 passed" for a C5 proof. A per-probe criterion label, as the isolation registry does with `criteria`, would make the log self-evident.

6. `packages/db/src/sandbox/viewer.test.ts:74` — the "never the `getDb` singleton" half of non-negotiable 3 is proven only here, and neither `test:db` nor `test:boundaries` runs this file; it rides on `yarn verify`'s `yarn test`. I confirmed by grep that no `getDb` and no `next`/`react` import exists in `src/sandbox/`, and the next/react half is independently covered by C5 probes 41-42, so this is a note about where the evidence lives, not a hole.

VERDICT: PASS
