# Review — warden on LAB-1

> Written by `yarn review:run warden LAB-1`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 863a59148797fa54c42b204eac568f6e99028198a4c51d3de5dd0198d4387e45
- as_built_sha256: fbdff24e9ac39ba304550488be6e0ee4f9f236579d49ce9e8cc0217727148e3b
- head: 1da0d7dc0a32fd7ee48d0b14b1293d506934b238
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T19:31:14Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden LAB-1`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket LAB-1 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Review — LAB-1 sandbox-schema (warden, fresh context)

Read: contract, `results.json`, as-built, C1–C5 evidence, the twelve schema/migration/test files, `policies.ts`, `rls.ts`, and `technical/data-contract.md` (plus `gate.md` for what `code_hash` and `key_hash` hold).

### Criteria

**C1 — seven `sandbox_` tables, public, service-only; no reviewer column on actions; no slug or FK on gate attempts. Met.**
`schema/index.ts:11-17` exports exactly the seven. Each table file ends in `...serviceOnlyPolicies(<name>)` (`reviewers.ts:61`, `accesses.ts:61`, `view-events.ts:60`, `comments.ts:113`, `review-versions.ts:77`, `actions.ts:77`, `gate-attempts.ts:27`), and `policies.ts:88-97` is deny-all (`using false`, `with check false`) to `authenticated` only — anon gets no policy, so RLS denies it structurally. Migration `0003_sandbox_schema.sql:18,31,44,67,83,97,106` enables RLS on all seven and `:128-134` writes the seven deny policies. `index.test.ts:49-108` asserts the set, `schema: undefined` (public), exactly one `_all_denied` policy per table, `sandbox_actions` with no reviewer/access/label/display column and no FK, `sandbox_gate_attempts` at exactly four columns with no FK, and no default on the comment and version ids with `parent_id` FK-less. C1.log tests 30–33 show all four passing.

**C2 — bad/over-long slug, two-or-no-identity access, two-or-no-author comment refused. Met.**
SQL checks exist and are named: `0003:14` (slug regex + `char_length <= 48`, repeated on view events `:40`, comments `:61`, versions `:79`, actions `:93`), `:28` (`(email is null) <> (user_id is null)`), `:64` (exactly one author), `:63` (body ≤ 2000). `schema.test.ts:148-204` drives seven malformed slugs, a 49-character slug (with 48 accepted at `:182-183`), a bad slug on `sandbox_actions`, and the counts cases; `:206-260` the access and author cases including a reviewer id with no access id and a 2,001-character body. Each assertion matches on `constraint_name` (`:136-145`), so the test proves *which* constraint refused the row rather than merely that something failed. C2.log suite 10, tests 1–4.

**C3 — deleting one access removes everything through it and keeps the reviewer's other access. Met — this is the control I care most about and it is in the right layer.**
`0003:109-115`: six composite foreign keys, `(access_id, reviewer_id) → sandbox_accesses (id, reviewer_id)` and `(reviewer_id, slug) → sandbox_reviewers (id, slug)`, all `ON DELETE cascade`, with `0003:13,27` as the unique targets. Because views and versions have both columns `NOT NULL` and the one-author check forces a reviewer comment to carry both (`0003:64`), no reviewer-authored row can sit outside the cascade — there is no MATCH SIMPLE escape for them. `schema.test.ts:287-349` proves the per-access delete, the surviving reply with a dangling `parent_id`, and that deleting the reviewer leaves zero rows across four tables. C2.log suite 10, tests 6–7.

Two structural wins worth naming: `ON UPDATE no action` on the composite keys means a reviewer's `slug` cannot be changed once rows exist (data-contract.md:12 asked for this as a convention; it is now enforced), and `reviewer_id`/`access_id` being `NOT NULL` on `sandbox_view_events` makes a team view event unwritable, which is D-LAB-14 held by the schema rather than by discipline.

**C4 — a bridged user, developer and admin reach no row. Met.**
`schema.test.ts:351-446` seeds a row in all seven tables (reviewer, access, view/comment/version, team note, action, gate attempt), then for each of `user`, `developer`, `admin` asserts an unfiltered `select` returns `[]`, that `delete … returning 1` and `update … returning 1` touch zero rows, and that a well-formed insert is refused. The empty `select` (rather than a thrown "permission denied") proves the grant exists and the deny *policy* is what filters — this is a real RLS proof, not an accidental pass. `rls.ts:51-66` confirms the bridge switches to `authenticated` with a module constant and transaction-local settings, so the role the policies name is the role the test ran as. C2.log suite 10, test 8. (The insert assertion pins `42501`, which covers both "violates RLS" and "permission denied"; either reading refuses the row, so the property holds.)

**C5 — the migration touches no auth object. Met.**
`check-migrations.ts:30-34` scans the whole directory; C5.log reports four migrations, none touching auth. `0003` references only `public.users` (`:108,111`), which is the mirrored table, not `auth.users`. `_journal.json` places `0003_sandbox_schema` at idx 3 with a `when` later than `0002`, and the `0003` snapshot matches the emitted SQL including the regenerated counts check (`0003_snapshot.json:1294-1297`). `isRLSEnabled: false` in the snapshot alongside `ENABLE ROW LEVEL SECURITY` in the SQL is the pre-existing drizzle pattern for every table in this repo (`0002_snapshot.json:85,187,263,350`), not a LAB-1 deviation; no migration contains a `DISABLE ROW LEVEL SECURITY`.

**As-built claims.** Every specific claim I checked holds, including the count of bad slugs, the 48/49 boundary, "every table holds rows during the test", "all seven tables" in C4, and the regenerated single migration. No undeclared deviation found.

**One scope note, not a finding.** Erasure is complete only in combination with LAB-16: after an email's accesses are deleted, `sandbox_reviewers.label` can still be that email (`reviewers.ts:35`). The contract puts label and emails-used scrubbing out of scope explicitly, and LAB-1 ships no user-facing erasure path, so the gap is recorded and not live.

### Findings

**Consider — the `sandbox_actions` promise is floored in the writer, not in SQL.** `actions.ts:57-63` / `0003:88-94`. The log is retained forever by design (`actions.ts:9-10`, no FK on `actor_user_id`), which makes it the one place an erased address could outlive its own erasure. Three invariants that protect it live only in LAB-3's `recordAction` and in TypeScript types: `action` is free text (`actions.ts:58`); `target_email` is "role changes only, a team member's" by comment (`actions.ts:61-62`); and `counts` values are typed `number` while the SQL check bounds only the *keys* (`actions.ts:72-75`), so `{comments: "someone@example.test"}` passes the database. `index.test.ts:71-81` guards column *names*, not values, so nothing here fails if a later ticket writes the wrong thing. There is no user-reachable path today and `recordAction` is a single tested chokepoint, so this is defense in depth rather than a live defect — hence Consider, not Should-fix. If `0003` is ever regenerated for another reason, two cheap checks close most of it: `not jsonb_path_exists(counts, '$.* ? (@.type() <> "number")')`, and `target_email is null or action in (<the role-change names>)` — that second list is small and stable, unlike the full action list, which would cost a migration per admin feature and is rightly left to the writer.

**Consider — `display_name` has no named erasure path in the spec.** `reviewers.ts:37`, against data-contract.md:32-39. The erasure semantics scrub `label` ("a name label is cleared only when ticked") and say nothing about `display_name`, which is also a person's name. The column is nullable so clearing is possible, and as-built:42 routes the decision to LAB-16 — I am asking only that the route be written into `data-contract.md` so it survives this thread rather than living in one ticket's as-built.

**Consider — team-note retention is unrecorded.** `comments.ts:77-79`. A team note is deleted with its author's account (`team_user_id → users.id ON DELETE cascade`, and the one-author check forbids nulling it) and survives an email erasure entirely, since the email path deletes accesses only. Both behaviours are defensible; neither is in `data-contract.md`, which is silent on team notes outside experiment-data erasure. as-built:45 flags it for the epic — same ask: record the decision in the cited surface.

No Blocking findings. The two items the contract pointed me at — the access cascade and the absence of any reviewer or slug link on `sandbox_actions` and `sandbox_gate_attempts` — are both enforced in the database and proven by tests that would fail if the constraint were removed. `code_hash` being unsalted is sound given 80 bits from `crypto.randomBytes` (gate.md:25-27), and `key_hash` is an HMAC under `SANDBOX_SECRET` rather than a bare hash, so a database reader cannot confirm a suspected browser or address offline.

VERDICT: PASS
