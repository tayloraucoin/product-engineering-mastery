# Review — vigil on STK-11

> Written by `yarn review:run vigil STK-11`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: efd2f37963742150cd7b8f01b4b37485de98411896332a3152159dab5e08ec04
- as_built_sha256: d7f32fbd5ae3d707719fa92474504b10eb789521753211db0c0deab2224a32c2
- head: c19369cb0d0de39268cbc0fb5f65e212e6f9acd2
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T23:30:07Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-11`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-11 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 capture: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/test-db.txt (sha256 4068f2af91d8)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/C2.log (sha256 60265fe5e5d4)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/C3.log (sha256 c2dce1b9693f)
   - C4 manual: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/C4-operator.md (sha256 babd1f230390)
   - C5 manual: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/C5-operator.md (sha256 5b4554942813)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, docs/engineering/tech-stack.md, docs/runbooks/new-project.md, docs/runbooks/remove-supabase-auth.md, docs/runbooks/remove-supabase-database.md, package.json, packages/db/.env.example, packages/db/package.json, packages/db/scripts/auth-ddl.test.ts, packages/db/scripts/auth-ddl.ts, packages/db/scripts/auth-writers.test.ts, packages/db/scripts/check-migrations.ts, packages/db/scripts/database.ts, packages/db/scripts/env.ts, packages/db/scripts/local-auth-marker.ts, packages/db/scripts/local-full.ts, packages/db/scripts/local-image.ts, packages/db/scripts/local-users.test.ts, packages/db/scripts/local-users.ts, packages/db/scripts/local.ts, packages/db/scripts/migrate.ts, packages/db/scripts/reset-local-db.test.ts, packages/db/scripts/reset-local-db.ts, packages/db/scripts/seed-users.ts, packages/db/scripts/setup.ts, packages/db/scripts/supabase-cli.test.ts, packages/db/scripts/supabase-cli.ts, packages/db/src/local-auth-mirror.test.ts, packages/db/src/local-auth-mirror.ts, packages/db/supabase/.gitignore, packages/db/supabase/config.toml, packages/db/supabase/setup/04_users_backfill.sql, packages/db/test/local-auth-mirror.test.ts, packages/db/test/reset-local-db.test.ts, packages/db/test/rls.test.ts, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Review — STK-11 local-auth-mirror (vigil, fresh context)

**Verdict: Pass with conditions.** Three Should-fix findings, three Consider. No Blocking finding: every non-negotiable is verified in code, and the two deferred criteria are deferred by a sanctioned mechanism with honest operator write-ups.

### Non-negotiables, checked against code first

| Non-negotiable | Verdict |
| --- | --- |
| CLI pinned exact; `db:local` starts the database only; `db:local:full` starts the stack | Verified. `packages/db/package.json:61` `"supabase": "2.119.0"`; `scripts/local.ts:27` `["db","start"]`; `scripts/local-full.ts:39` `["start"]`. Row present in `docs/engineering/tech-stack.md:40` (deps.md). |
| `src/local-auth-mirror.ts` is the only writer to `auth.users`; never reads `process.env` | Verified. No `process.env` in `local-auth-mirror.ts` or `loopback.ts`; the package's only reader is `scripts/env.ts:22`. Enforced by `scripts/auth-writers.test.ts:35`, which now asserts the *negative* over `src`, `scripts`, `supabase`, `migrations` — so it still holds after the auth runbook deletes the mirror. |
| The INSERT itself refuses when `auth.identities` exists or the marker is absent | Verified. `local-auth-mirror.ts:91-108`: the guard CTE is inside the statement, the `select … from guard where guard.open` yields no row when closed, so no caller can skip it. Proven in `test/local-auth-mirror.test.ts:198-220` with `authCount` = 0 inside a rolled-back transaction. |
| `applyLocalAuthMirror` refuses a non-loopback host | Verified. `local-auth-mirror.ts:76` → `loopback.ts:33-43`, before the first query. Proven by socket-attempt counting (`src/local-auth-mirror.test.ts:36-38`, `attempts() === 0`). |
| `db:seed-users` refuses when the auth URL is not loopback | Verified. `scripts/local-users.ts:36` before any `fetch`; `local-users.test.ts:19-38` proves zero fetch calls for hosted, private-network (`10.0.0.5`), look-alike (`localhost.example.com`) and unset. |
| `config.toml` disables CLI migrations and seeds; Drizzle owns public | Verified. `supabase/config.toml:23-27`. |
| The `_LOCAL` auth variables select the mode; no mode variable | Verified. `scripts/env.ts:61-75`, `.env.example:49-57`, `packages/db/.env.example:22-28`, `new-project.md:127`. |

Adversarial note on the guard stack: a tunnel that presents a hosted project on `127.0.0.1` passes guard 1, and is then refused by guards 2 and 3. The three guards are genuinely independent, not three readings of one check. That is the right design for this seam.

### Criteria

- **C1 — met.** `evidence/test-db.txt` shows 15/15, skipped 0, against `public.ecr.aws/supabase/postgres:17.11.0.002` in Mode A. I traced every TAP line to `packages/db/test/local-auth-mirror.test.ts`: the test names match one-for-one, "id and email only" is a real assertion (`deepEqual(filled, ["email","id"])`, line 116), the email upsert reads back both tables (160-170), and both refusal cases assert zero rows and run inside `rolledBack` (179-189). Limitation, stated honestly in the as-built: the capture names code at `be5bdc5` while the run record stamps `d034a273`, and no check can re-derive the log. The shipped test and the shipped guard are consistent with it, which is as far as code inspection reaches.
- **C2 — met.** `yarn test` exit 0, 113 tests, matching `results.json`. Both refusals are proven *before* I/O, by counting, not by asserting a message: `applyLocalAuthMirror / refuses a non-loopback host before connecting` and `seedLocalUsers / refuses a non-loopback auth URL before sending anything` are both in `C2.log`, and the paired positive test (`passes the host check on loopback and only then connects`) rules out a guard that refuses everything.
- **C3 — met as recorded, but the criterion should not exist.** `yarn verify` exit 0 with `check-migrations`, `check-stack`, boundaries probes and `lint:docs` all green. See Should-fix 2.
- **C4 — not verified; deferral is correct.** It needs STK-12's seam and a human staging sign-in; `C4-operator.md` names the four steps and is honest about what C1 does and does not cover. The database half (insert → trigger → `public.users`, and restoration after a reset) is genuinely proven by C1 plus `supabase/setup/04_users_backfill.sql`.
- **C5 — not verified; deferral is correct, but the criterion has no oracle.** See Should-fix 3.

### Findings

**Should-fix 1 — the loopback guard ships at a path the contract never declared.** `packages/db/src/loopback.ts:33` now holds `assertLoopbackClient`, the enforcement of non-negotiable 4, and `packages/db/src/loopback.test.ts` holds its tests. Neither is in `contract.md:24-42` (`src/local-auth-mirror.ts` and `src/local-auth-mirror.test.ts` are named individually; there is no `src/**` glob), and the as-built's path-addition deviation (`as-built.md:35`) lists four other files while omitting these two — so the omission is an oversight, not a choice. Consequence, per `tooling/lib/specs.ts:563-574` and `tooling/review-run.ts:198`: a later edit to `loopback.ts` stales no STK-11 proof, and the changed-file list handed to this ticket's door reviewers excludes it. The tier and reviewer set are unaffected (`packages/db/scripts/**` already reaches the door) and `toolkit.json:246` covers the file by folder, which is why this is not Blocking. Owner: builder, via `planned_paths` on the contract. Expected per `.claude/rules/specs.md` (planned paths are the declared surface) and the as-built's own deviation discipline.

**Should-fix 2 — `yarn verify` is used as a criterion command.** `contract.md:58-60` makes C3 `yarn verify`. `.claude/rules/specs.md` states plainly: "`yarn verify` is never a criterion: it runs once at batch close." The cost is visible inside the evidence itself — `evidence/C3.log:18-20` is `check-specs` reporting that C3, C4 and C5 had already gone stale against "16 more changed" files, which is the predictable result of binding a proof to the whole repo on a shared branch. Not retroactively fixable (`results.json` is write-only through the harness), so the actionable fix is the epic's remaining contracts and, if Taylor wants C3 closed cleanly, a narrower replacement criterion via `contract:add`. Owner: Taylor / contract author.

**Should-fix 3 — C5 is recorded PASS on a statement the builder states cannot pass as worded.** `contract.md:66` asks that "grep for drizzle and supabase" come back empty after `remove-supabase-database.md`. `as-built.md:61` and `evidence/C5-operator.md:7` both say that is impossible while Supabase Auth stays, and propose a grep scope that is "not yet settled by Taylor." The `--verdict deferred` route is sanctioned and the disclosure is exactly what I want to see — but the operator has been handed a check with no agreed oracle, so whoever runs it cannot pass or fail it. This is the escalation case: it needs Taylor to settle the scope (the proposed `git grep -il 'drizzle\|supabase' -- ':!docs' ':!specs'` with the two kept auth variables allowed, or "run `remove-supabase-auth.md` first") before the rehearsal is runnable. Owner: Taylor. Note the runbooks themselves are correct and self-consistent on this point — `remove-supabase-database.md:55` is precise about keeping the two variables while an `auth` entry exists and deleting them when it does not.

**Consider 1 — stale `last_reviewed` on a doc this ticket edited.** `docs/runbooks/remove-supabase-database.md:9` says `last_reviewed: 2026-10-03`, but line 55 ("Keep `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` while Supabase Auth stays…") is this ticket's 10-04 work. Its sibling `remove-supabase-auth.md:9` was updated. `lint:docs` does not enforce date freshness, so nothing caught it.

**Consider 2 — the 23505 path may carry an email into a log.** `packages/db/src/local-auth-mirror.ts:66-70` documents the unique violation thrown when a re-created staging user reuses an email. Postgres's detail line on a unique violation names the conflicting value, so whatever STK-12's seam logs around that throw may carry a user's address. It is local-only by construction (the loopback guard) and `@pem/observability` redacts personal data, so this is a note for STK-12's catch block rather than a defect here.

**Consider 3 — the `db:local` network warning is advice the tool cannot enforce.** `scripts/local.ts:44-48` warns, correctly and specifically, that port 54322 is reachable from the LAN with password `postgres` while holding mirrored staging emails. The deviation at `as-built.md:30` routes the accept/reject to Taylor, which is right. Worth confirming that decision is on the record before the starter is ported, since in Mode A the exposed data is real users' email addresses, not synthetic ones.

### Conversations

One, on behalf of the developer who inherits this starter. Mode A's failure mode after a staging user is deleted and re-created is a thrown unique violation that resolves only by hand-deleting a row in the local `auth.users` (`local-auth-mirror.ts:66-70`). The mirror documents it and replaying deletions is explicitly out of scope, so this is not a defect. But the person who hits it will be mid-task, looking at a 23505 from a file they have never read, and the fix is not in either runbook or `new-project.md`. A single line in step 6 of `new-project.md` naming the symptom and the one-line `delete from auth.users where email = …` would turn a confusing dead end into a thirty-second fix. Question for the epic owner: is that worth a line now, or does it wait for STK-12, which owns the error path a developer actually sees?

### Runtime checklist (ordered by risk)

1. C4, once STK-12 lands: `yarn db:local`, `yarn db:local:reset`, sign in on hosted staging via localhost, confirm the row in `public.users` on 127.0.0.1:54322. Record the id and date in `C4-operator.md`.
2. Settle the C5 grep scope, then run the removal rehearsal on a scratch copy and record both exits.
3. Confirm, on the record, the accept/reject of the LAN exposure of port 54322 in Mode A.
4. Mode B round trip, after the Mode A checks: `db:local:full`, `db:seed-users`, then `db:stop --no-backup` and `db:local` to confirm Mode A reopens (the as-built reports this was walked on 2026-10-04; it is not machine-proven).

Assumptions I made: that the file list I was handed is `review-run`'s `planned_paths` intersection (it matches `contract.md` exactly), which is how I noticed `src/loopback.ts` was outside it; and that where the contract is silent I test to the most user-protective reading — hence treating the mirrored data as real user email addresses throughout.

VERDICT: PASS
