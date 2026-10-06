# Review — warden on LAB-3

> Written by `yarn review:run warden LAB-3`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: d2e24e81b694f829d2a4cbfac9a66c874b0ef5633412b7c73e0ddc881d682eec
- as_built_sha256: 1a3937228520a54700616ee1f41a7e87bf72f4740d60e423444f0677952b9175
- head: 9dad4a39cf24e1df0e4ec49b4a791b73655e473c
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T19:07:35Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden LAB-3`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket LAB-3 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Criteria

**C1 — every export, every viewer kind — met.** `isolation.test.ts:558-571` drives the registry; the C1 log shows 24 cases plus the reviewer-scope suite, all passing at head `19bb3d8`. The five viewer kinds are real rows, not stubs (`fixtures.ts:165-225`): two reviewers on slug A, one on slug B, a signed-in reviewer, a team note, each with an access, a view, a comment and a version. `reviewerScope` is proven to return each reviewer exactly their own row in all three child tables, to return nothing when the slug is swapped, and to refuse both team viewers (`isolation.test.ts:573-607`). One caveat the as-built states honestly: `recordAction` is the only viewer function that exists yet, so C1's breadth today is the gate group plus one.

**C2 — the coverage guard — met.** `coverageProblems` (`registry.ts:37-63`) flags an unregistered export, a viewer entry missing any of the five kinds, and an entry for nothing exported; the synthetic module proves all three (`isolation.test.ts:534-555`). See finding 2 for the hole it does not close.

**C3 — the gate group — met.** `gate.ts` takes `(db, input)` throughout and returns ids, versions and the one sanctioned email; `exactKeys` pins the exact return shape of each (`isolation.test.ts:83-86`). Hash matching is scoped to the slug and to `revoked_at is null` (`gate.ts:42-48`); `checkAccess` holds the slug, the revocation, the `code_version` equality and the signed-in user id (`gate.ts:114-123`), each with its own case. Malformed ids and hashes return null before any query (`gate.ts:31-35, 101, 136`) — the right instinct, since Postgres echoes a bad uuid back in its error.

**C4 — `recordAction` — met as written.** It refuses all three reviewer viewers with a fixed message and writes nothing (`isolation.test.ts:109-119`), and the proven row carries actor, action, slug and counts with `targetEmail` null; the case then scans the row for every reviewer label, email, code and id (`isolation.test.ts:150-153`). The row shape is right. The field that could break it is unguarded — finding 1.

**C5 — the boundaries — met.** The C5 log shows `@pem/db/sandbox` refused from `apps/web/app/**`, from `apps/web/lib/**` outside `lib/sandbox`, from the experimental route and from `@pem/services`; `@pem/db/client` and `@pem/db/schema` refused in both route trees; `next` and `react` refused inside the module; and `lib/sandbox` → `@pem/db/sandbox` allowed. The element order is correct — `web-sandbox` before `app-web` (`boundaries.js:83-87`), `db-sandbox` before `db` (`boundaries.js:95-103`) — and `db-sandbox` sits in `NOT_FOR_APPS` (`boundaries.js:176`), so the allowance is an explicit edge rather than an absence. A bonus the as-built does not claim: `postgres` stays owned by `db`, so the module cannot open its own connection even if it tried.

Two notes on the record rather than the code. The as-built's "`yarn lint:boundaries` passes on the whole repo" is not in `results.json` (C5's command is `yarn test:boundaries`); by rule that pass belongs to the batch close. And `src/sandbox/viewer.test.ts`, which the as-built offers as backing for "never the getDb singleton", runs under `yarn test`, not under either recorded command — I verified that invariant by reading instead: `viewer.ts:19` imports `type { Db }` only, and no file in the module imports the client at runtime.

## Findings

**Should-fix — `recordAction` writes `target_email` with no check of any kind.** `actions.ts:66` passes `input.targetEmail` straight through; `actions.ts:36` types it as an optional string and nothing validates its type, shape or the action it accompanies. Every other field is guarded — the action name (`actions.ts:46`), the slug (`actions.ts:48-54`), the count names and values (`actions.ts:55-60`) — and the count *keys* are a closed list for precisely this reason, stated at `src/schema/sandbox/actions.ts:27-30`: "an erased email as a key would outlive its own erasure here." `target_email` is the same risk in plain text, one column over (`src/schema/sandbox/actions.ts:60`), in the one table erasure never touches and retention keeps forever (`src/schema/sandbox/actions.ts:8-9`, `data-contract.md:21`). The invariant "a team member's, never a reviewer's" is asserted in three documents and enforced in no code. The path: a later caller writes `recordAction(db, admin, { action: "erase-email", targetEmail: <the address just erased> })`, the row lands, and the address outlives the erasure it records — the person who asked to be forgotten stays named in a permanent log. No isolation case passes a `targetEmail` at all, so the secret scan at `isolation.test.ts:150-153` proves nothing about this field; `isolation.test.ts:147` only asserts it is null when unset. Nothing calls `recordAction` yet, which is why this is not Blocking, but the guard must land before the first caller does (LAB-16's erasure row, the role-change surface) because a written row cannot be erased by design. The control belongs here, not in the caller: admit `targetEmail` only with the actions that may carry it, require the same normalised-email shape `createAccess` already demands (`gate.ts:74`), and register a case that a reviewer's email is refused. While you are in `requireTeam` (`viewer.ts:49-56`), it admits a team viewer with an empty or malformed `userId` — the one gate-input class you already decided to check before Postgres sees it.

**Should-fix — the coverage guard trusts the self-declared `group`.** `registry.ts:51-57` requires the five viewer kinds only when the entry says `group: "viewer"`; a `"gate"` or `"support"` entry needs one case of any kind. Nothing checks that a function registered as `"gate"` really takes `(db, input)`. So a later reviewer-scoped read can ship with a single happy-path case and never run against the five kinds — escaping the exact control D-LAB-34's recorded risk acceptance rests on ("Isolation is proven by tests"). The fix is structural and cheap: assert arity in `coverageProblems` — a gate function is `(db, input)` and has `length === 2`, a viewer function `(db, viewer, input)` and has `length === 3` — so the group cannot be mislabelled by accident.

**Consider — `findAccessEmail` ignores `code_version` while `checkAccess` enforces it.** `gate.ts:144-149` checks the slug and `revoked_at` but not the version equality that `gate.ts:119` requires. Declared at `as-built.md:27` with a rationale I accept for the common case. The asymmetry matters only if replacing a code (D-LAB-23 bumps the version rather than revoking) is ever how the team cuts off a particular person: a stale link then grants no access but still discloses the address. The holder of the link is normally the owner of the address, so the impact is small — but if replace is meant to cut someone off, the email should follow `checkAccess`.

**Consider — nothing in the module distinguishes a verified `findAccessEmail` call from an unverified one.** `gate.ts:132-136` takes `(accessId, slug)` and is the only gate function returning personal data; the Tickets-gate ruling placed it there deliberately, so this is a residual to record rather than a defect. Token verification is LAB-5's, and it is the only thing between a leaked access id and an email address. Give it a named verification item in LAB-5's checklist rather than leaving it to the binding's author to remember.

**Consider — the sandbox tables are still in the `@pem/db/schema` barrel.** `src/schema/index.ts:11-17` exports all seven; `boundaries.js:176` keeps only the *module* away from apps, and `boundaries.js:245-248` bans the client and the schema only under `app/experimental/**` and `app/admin/**`. So `@pem/services` and every apps/web file outside those two trees may still query reviewers' comments unscoped with `getDb`. The non-negotiable is met exactly as written and D-LAB-34 accepted "isolation rests on one module, not RLS" — I am not relitigating that acceptance, only noting that its surface is wider than the record describes and that a new route tree touching sandbox data inherits no ban. The structural fix is a boundary conversation, not an app-layer one: a `./schema/sandbox` subpath only `db-sandbox` may import would make the path allowlist unnecessary.

**Consider — the "db is always an argument" guard is narrower than the invariant.** `viewer.test.ts:81` greps for `/\bgetDb\b/`, but `db-sandbox` may import `@pem/db/client` (`boundaries.js:127`), whose `createDb` and `closeDb` open and close connections just as effectively. The module is clean today; widen the pattern to all three names so it stays that way.

**Consider — sequencing, for the epic rather than this ticket.** `gate.ts:26` is the code-guessing surface and `gate.ts:61` writes a row with a caller-supplied email, and the throttle is explicitly LAB-6's. If LAB-5 binds these over HTTP before LAB-6 lands, codes are guessable with no lockout and a code holder can write unbounded accesses carrying arbitrary addresses. Worth ordering LAB-6 before LAB-5 goes reachable, or recording the gap deliberately.

Staleness is not mine to settle: C1–C5 were proven at `19bb3d8` and HEAD is `9dad4a3`, whose message reports spec files only — `yarn check-specs --strict` is the arbiter before a merge.

VERDICT: PASS
