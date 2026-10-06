# Review — warden on LAB-1

> Written by `yarn review:run warden LAB-1`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 863a59148797fa54c42b204eac568f6e99028198a4c51d3de5dd0198d4387e45
- as_built_sha256: d3da8d6f11c074cbfa9209dd70c90f1c5b49c7106cd1411be798dbde82b0728d
- head: d1a5a03f3b9f1e5892e6b635215e958f9549c39c
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T18:56:20Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden LAB-1`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket LAB-1 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

Read in the required order; then the code, the policy factory, the setup SQL, the migration-scanner, and `gate.md` to ground the hash questions.

## Criteria

**C1 — met.** `src/schema/index.ts:11-17` exports exactly the seven tables; `index.test.ts:49-65` asserts the set is exactly seven, each in `public`, each carrying exactly one policy named `<table>_all_denied`, `for: "all"`, `to: authenticated`, with `using` and `withCheck` both `false` — matching `serviceOnlyPolicies` (`src/policies.ts:88-97`) and migration lines 127-133. `index.test.ts:67-73` holds `sandbox_actions` to no column matching `/reviewer|access|label|display/` and no foreign key (`actions.ts:49-71` confirms: `actor_user_id` carries no reference); `index.test.ts:75-82` pins `sandbox_gate_attempts` to exactly four columns and no foreign key (`gate-attempts.ts:16-29`). C1.log tests 25-28 pass.

**C2 — met, and asserted by constraint name rather than by any rejection.** `test/sandbox/schema.test.ts:136-145` compares `constraint_name`, so each row is refused for the right reason. Seven malformed slugs plus a 49-character slug hit `sandbox_reviewers_slug_check`, a 48-character slug is accepted (`:148-184`); `Not_A_Slug` on `sandbox_actions` hits its own check (`:174-181`, and `actions.ts:64-67` correctly allows null). Both-and-neither identity hits `sandbox_accesses_one_identity_check` (`:186-205`, migration line 28). Two authors, no author, and reviewer-without-access all hit `sandbox_comments_one_author_check` (`:207-233`, migration line 64), and a 2,001-character body hits the body check.

**C3 — met.** `view-events.ts:48-57`, `comments.ts:97-106` and `review-versions.ts:65-74` each carry `(access_id, reviewer_id) → sandbox_accesses(id, reviewer_id)` and `(reviewer_id, slug) → sandbox_reviewers(id, slug)`, both `on delete cascade` (migration lines 108-114). The test (`:267-315`) deletes one of two accesses and asserts the first access's view, comment and version are gone, the second's are kept, the reviewer stays, and a reply to the erased root survives — the tombstone-free thread behaviour `data-contract.md:24` promises. `:317-329` proves reviewer deletion takes everything. The composite keys are stronger than the contract asked for: a row cannot claim another reviewer's access or another slug, and `:242-265` proves both refusals.

**C4 — met, and wider than the criterion.** `:331-426` inserts a live row into all seven tables as the singleton, then for each of `user`, `developer` and `admin` asserts an unfiltered select returns `[]`, that delete and update return zero rows, and that a well-formed insert fails with `42501` specifically — not merely "rejected". Seven tables asserted by count (`:390`). Reachability outside the bridge is closed and proven elsewhere in the same run: `supabase/setup/03_public_tables.sql:22-27` revokes everything from `anon` and grants DML only to `authenticated`, data-driven so the new tables are covered without edit, and `test/rls.test.ts:121-132` asserts zero public tables without RLS.

**C5 — met.** `0003_sandbox_schema.sql` names only `public.users` and `public.sandbox_*`; `scripts/auth-ddl.ts:50-57` would flag any other `auth.` reference, and C5.log reports four migrations, none touching auth. `migrations/meta/_journal.json` is internally consistent: `0003` is last, `when` monotonic after `0002`'s 1791253971852, matching the as-built's account of the local drift. I cannot diff against `main` with read-only tools, so "no applied migration edited" rests on mason's focus item, not mine.

The erasure shape holds end to end. `auth.users → public.users` (`schema/account/users.ts:17-19`) → `sandbox_accesses.user_id` (`accesses.ts:39-41`) → views, comments and versions means deleting an account takes the signed-in reviewer's whole trail; erasure by email deletes the access rows and the cascade does the rest. `gate.md:27,44` settles the hash questions I came to ask: codes are 80 random bits (unsalted by a recorded, reasoned decision), and `key_hash` is an HMAC under `SANDBOX_SECRET` over a cookie id or network address, never an email.

## Findings

**Should-fix — `sandbox_actions.counts` is bounded only in TypeScript, and the as-built records that wrongly.** `src/schema/sandbox/actions.ts:45-47` types `counts` as `Partial<Record<SandboxActionCountName, number>>`, and `as-built.md:20` concludes "No SQL check is possible (warden)." A check of this shape is valid and immutable: `check (counts is null or counts - '{reviewers,accesses,viewEvents,reviewVersions,comments,teamNotes,labelsScrubbed,reviewersRevoked}'::text[] = '{}'::jsonb)`. The type is also weaker than the line claims — `Record<string, number>` is assignable to a `Partial<Record<Union, …>>`, so `counts: Object.fromEntries(entries)` typechecks and can carry any key. Adversary: no attacker, just a later ticket; path: a key built from the value acted on, in the one sandbox table with no erasure path and indefinite retention (`actions.ts:8-9`); impact: an erased email surviving its own erasure in the audit log. The runtime guard at `src/sandbox/actions.ts:55-60` (LAB-3, not this ticket's path) closes the only sanctioned seam, which is why this is not blocking — but the window to add the constraint without a second migration closes when the operator applies `0003` to a hosted project, and the false line will stop a later ticket from reconsidering.

**Consider — `target_email` is unbounded in both SQL and the write seam.** `actions.ts:60` comments "never a reviewer's", and `data-contract.md:21` makes that a promise, but nothing enforces it; `src/sandbox/actions.ts:66` passes the caller's string straight through unvalidated. A check cannot express "is a team member", so this is genuinely code-only. `as-built.md:37` already promises LAB-16 will assert its erasure row holds no value matching the erased email; worth making sure that assertion covers `target_email` and not only `counts`.

**Consider — a team note dies with its author's account, by a foreign key the spec never asked for.** `comments.ts:77-79` cascades `team_user_id` from `public.users`, so deleting a team member's account silently deletes their notes. `actions.ts:54` deliberately takes the opposite choice for the same reason stated in reverse ("the record outlives the account"). The cascade is the simplest correct option here — `sandbox_comments_one_author_check` forbids setting it null, so keeping the note would need a tombstone — and `as-built.md:14` declares it. But `data-contract.md` is silent on team-note retention, so flag it to the epic rather than let a foreign key decide it quietly.

No Blocking findings. Every non-negotiable in the contract is present in the code and exercised by evidence, and the two deviations that matter (composite keys, the `public.users` references) make the shape stricter than promised rather than looser.

VERDICT: PASS
