# Review — warden on LAB-1

> Written by `yarn review:run warden LAB-1`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 863a59148797fa54c42b204eac568f6e99028198a4c51d3de5dd0198d4387e45
- as_built_sha256: 71778c4c3c8ab7dc152f36b36658a7ab57ecebb1f12452b13a2e9b9b71e504a9
- head: 34d619b7603f4a093f0e993806b5e1e2788ca144
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T18:41:58Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden LAB-1`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket LAB-1 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C1.log (sha256 29837fb6b3f4)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C2.log (sha256 8fab0f7e663f)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C3.log (sha256 8fab0f7e663f)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C4.log (sha256 8fab0f7e663f)
   - C5 check: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C5.log (sha256 bd8dc6637c5f)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): packages/db/migrations/0000_example_schema.sql, packages/db/migrations/0001_stripe_events.sql, packages/db/migrations/0002_billing_entitlements.sql, packages/db/migrations/0003_sandbox_schema.sql, packages/db/migrations/meta/0000_snapshot.json, packages/db/migrations/meta/0001_snapshot.json, packages/db/migrations/meta/0002_snapshot.json, packages/db/migrations/meta/0003_snapshot.json, packages/db/migrations/meta/_journal.json, packages/db/src/schema/index.test.ts, packages/db/src/schema/index.ts, packages/db/src/schema/sandbox/accesses.ts, packages/db/src/schema/sandbox/actions.ts, packages/db/src/schema/sandbox/columns.ts, packages/db/src/schema/sandbox/comments.ts, packages/db/src/schema/sandbox/gate-attempts.ts, packages/db/src/schema/sandbox/review-versions.ts, packages/db/src/schema/sandbox/reviewers.ts, packages/db/src/schema/sandbox/view-events.ts, packages/db/test/sandbox/schema.test.ts.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/technical/data-contract.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Warden review — LAB-1 sandbox-schema

Judged from the files only. I could not run anything, so for "no applied migration edited" I verified what is checkable statically: the journal and snapshot chains (`meta/_journal.json:26-32`, `0003_snapshot.json:3` prevId = `0002_snapshot.json:2` id) are coherent and 0000–0002 retain their prior snapshot ids. I could not diff 0000–0002 against `main`.

### Criteria

**C1 — PASS.** `schema/index.ts:11-17` exports exactly the seven, one file each under `src/schema/sandbox/` (plus `columns.ts`, shared helpers, not a table — declared in as-built). `index.test.ts:53` asserts the set is exactly seven by `deepEqual`, and `:57-63` asserts each carries exactly one policy, `${name}_all_denied`, `for: all`, `to: authenticated`, `using` and `withCheck` both literal `false` — the `policies.length === 1` assertion is the part that matters, because it fails if anyone later adds a permissive policy. `sandbox_actions` has no reviewer/access/label column and no FK (`actions.ts:28-50`, asserted at `index.test.ts:67-73`); `sandbox_gate_attempts` is exactly four columns, no FK (`gate-attempts.ts:16-32`, asserted at `:75-82`). Evidence: C1.log tests 24-27 ok, exit 0. The log's `tests: 67` header is the harness counting 59 tests + 8 suites from the TAP summary — consistent, not inflated.

**C2 — PASS.** Every constraint named in the criterion exists in SQL and is proven by the constraint that actually fired, not by "some error": `refused()` (`schema.test.ts:136-145`) asserts `constraint_name` equality. Seven bad slugs plus a 49-character one against `sandbox_reviewers_slug_check` (`0003_sandbox_schema.sql:14`), a bad slug on `sandbox_actions_slug_check` (`:93`), both-and-neither identities against `sandbox_accesses_one_identity_check` (`:28`), and two-authors / no-author / reviewer-without-access against `sandbox_comments_one_author_check` (`:64`). The length bound is genuinely isolated: the 49-char case matches the pattern, so only `char_length` can reject it, and the 48-char slice is then accepted (`schema.test.ts:157-175`).

**C3 — PASS, and it is the cascade the focus asked for.** The composite keys `(access_id, reviewer_id) → sandbox_accesses(id, reviewer_id)` on all three child tables, `on delete cascade` (`0003_sandbox_schema.sql:108,111,113`), are what make erasure-by-access complete. `schema.test.ts:251-288` deletes one of two accesses held by the same reviewer and asserts by id that the first access's view, comment and version are gone, the second access's three survive, and the reviewer row stays — that is the "each is erased separately" promise in `data-contract.md:39` proven rather than asserted. `:290-302` proves reviewer deletion leaves zero rows anywhere. The account chain also closes: `auth.users → public.users` (`account/users.ts:19`) → `sandbox_accesses.user_id` (`accesses.ts:39-41`) → the three children, all cascade.

**C4 — PASS, and it tests the right adversary.** The bridged identity is `teamUser`, who actually authored a `sandbox_comments` team note and a `sandbox_actions` row before the loop (`schema.test.ts:308-320`). So the empty reads at `:334-338` prove the insider cannot read rows *they wrote themselves* — the strongest form of this check, not a vacuous read of an empty table. All seven tables hold at least one row when the loop runs. Deletes and updates return zero rows for both `user` and `admin`.

**C5 — PASS.** `check-migrations` reports 4 migrations, none touching auth (C5.log:6); `check-migrations.ts:30-34` is a real scan over the migrations dir, and C1.log tests 1-6 prove the scanner catches each kind of auth DDL rather than passing by silence. 0003 is numbered after 0002 with an intact prevId chain.

The as-built's claims check out against the code, and it does not overclaim: it says inserts were refused on "reviewers, comments, actions and gate attempts," which is exactly the four the test attempts, not all seven.

### Findings

**Should-fix — `sandbox_actions.counts` is unconstrained jsonb in the one table erasure never touches.** `src/schema/sandbox/actions.ts:40`. `SandboxActionCounts` (`:26`) is `Record<string, number>`, so any string is a legal key, and `$type` is erased at runtime. D-LAB-28 and the file header promise this table "never names a reviewer or an email," and the shape enforces that for columns — but not for the payload. Path: LAB-16's erasure writes one `sandbox_actions` row per erasure with counts; a key derived from what was erased (`{"alice@example.test": 3}`) puts the erased person's email into a row marked "Retention: kept" (`actions.ts:8`), which no cascade and no later erasure reaches. Impact: an erasure request becomes the thing that permanently records the email it was meant to remove. Nothing leaks today — no code writes `counts` yet — which is why this is Should-fix, not Blocking. SQL is the wrong layer here (a CHECK cannot take the subquery `jsonb_object_keys` would need), so the strongest available control is the type: narrow `SandboxActionCounts` to a closed union of count names (`Record<"reviewers" | "accesses" | "comments" | …, number>`) so a dynamic key will not compile, and say so in the header. Verification item for LAB-16: assert the erasure's `sandbox_actions` row contains no key or value matching the erased email.

**Consider — `display_name` has no scrubbing rule.** `src/schema/sandbox/reviewers.ts:37` ships a person's name, and the erasure semantics at `data-contract.md:36-38` scrub `label` and say "a name label is cleared only when ticked" without resolving whether that means `label` or `display_name`. When a reviewer is left with no access and is "revoked and relabelled," `display_name` is unstated and survives. Route to LAB-16: decide explicitly and write it into the erasure spec. (Where the reviewer still holds a live access the name staying is correct by design, so this is only the no-access case.)

**Consider — `parent_id` is deliberately unconstrained, so the read path must not trust it.** `src/schema/sandbox/comments.ts:81`; the contract requires no FK, and C3 proves a reply outlives its erased root. The consequence for LAB-3: a browser mints `parent_id`, so it can name any UUID, including a comment in another slug or another reviewer's. Reads must resolve a root only within the already-scoped result set, never by looking up `parent_id` directly — otherwise a crafted value confirms another reviewer's comment exists. Worth one line in LAB-3's contract.

**Consider — C4's role coverage stops short of `developer` and `anon`.** `test/sandbox/schema.test.ts:331` loops `["user", "admin"]`. `developer` is a third `APP_ROLE` (`src/rls.ts:15`) and is exactly the role LAB-2 introduces and that someone will later be tempted to grant sandbox read access. `anon` has no policy at all, so RLS denies it, but nothing pins that for these tables. Adding `"developer"` to the array is one token; `C1`'s single-policy assertion is the real structural guard, which is why this is only a Consider.

**Consider — inserts are attempted on four of seven tables under RLS.** `test/sandbox/schema.test.ts:348-378` forges inserts into reviewers, comments, actions and gate attempts; accesses, view events and review versions are covered only by the identical-policy argument C1 establishes. Cheap to close by looping the same `tables` array.

**Consider — `anchor`, `answers` and `triage` have no size bound at the data layer.** `comments.ts:64`, `review-versions.ts:52-53`. `data-contract.md:59` caps `answers` at 64 KB and cites `app/api/review/_lib/http.ts:12` as its enforcement point, but names no owner for the 2 KB anchor cap, and `triage` has no stated cap at all. `body`'s 2,000 is a SQL check because the contract required one; these are HTTP-layer by spec, so this is not a deviation — only a note that a gated reviewer's unbounded jsonb depends entirely on code LAB-3 has yet to write. Name the enforcement point for `anchor` and `triage` in LAB-3's contract.

No Blocking finding. The two things this ticket's shape had to get right — that deleting one access takes every row that came through it and nothing else, and that the record of actions carries no reviewer column — are both enforced in the data layer and proven by tests that assert the named constraint and the surviving ids. The composite-key deviation is stricter than the contract asked for and does not break the legitimate write path, which C3 and C4 demonstrate by inserting through all three child tables successfully.

VERDICT: PASS
