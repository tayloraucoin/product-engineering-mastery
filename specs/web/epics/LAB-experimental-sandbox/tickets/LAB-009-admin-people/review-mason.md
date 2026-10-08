# Review — mason on LAB-9

> Written by `yarn review:run mason LAB-9`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 4b6b41c900f3f5b577a9fb724690f6be890c5834dd9ad42f008d7d82df87884e
- criteria_sha256: 154bb6d8338f442fc5da1950bc285b78ce342d72544e5cb3fd05e0b3a26a07c6
- as_built_sha256: 4a7149a8852d9a02b9a398ec1f875456a249efd9be99a1eb60a1bc93e80da04b
- head: eff9425ea2ce895189537dccb1cc15d59d7a94c8
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-08T01:53:13Z
- run: 1 of mason on LAB-9
- tokens_input: 45
- tokens_cache_read: 5283397
- tokens_cache_write: 267935
- tokens_output: 24833
- seconds: 431.3
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason LAB-9`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket LAB-9 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

This is the only review pass unless you FAIL it, so list every finding now. A PASS is final for its round: Should-fix and Consider findings become follow-ups the builder fixes without reopening the review, and nothing you hold back is asked for later. Only a Blocking finding earns a second pass.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-009-admin-people/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised, and what you judge the changes against.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-009-admin-people/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-009-admin-people/as-built.md. What the builder says shipped, and every deviation. It is a claim to check inside the changed files, not an invitation to read the repo.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-009-admin-people/evidence/C1.log (sha256 34493a3ccb6e)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-009-admin-people/evidence/C2.log (sha256 34493a3ccb6e)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-009-admin-people/evidence/C3.log (sha256 34493a3ccb6e)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-009-admin-people/evidence/C4.log (sha256 0a485ebec3e8)
   - C5 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-009-admin-people/evidence/C5.log (sha256 b34224bb749a)
   - C6 capture: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-009-admin-people/evidence/people-confirm.png (sha256 0464f27997ba)
   - C7 manual: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-009-admin-people/evidence/C7-operator.md (sha256 0f122b436162)
   - C8 capture: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-009-admin-people/evidence/people-states.png (sha256 c62ddf23543c)
5. The changed files, this ticket's planned paths against main (other tickets share the branch): apps/web/app/admin/people/_components/people-table.tsx, apps/web/app/admin/people/actions.ts, apps/web/app/admin/people/loading.tsx, apps/web/app/admin/people/page.tsx, apps/web/lib/sandbox/admin-nav.ts, apps/web/lib/sandbox/people-data.ts, apps/web/lib/sandbox/people.test.ts, apps/web/lib/sandbox/people.ts, apps/web/lib/sandbox/state.ts, packages/db/package.json, packages/db/scripts/grant-admin.test.ts, packages/db/scripts/grant-admin.ts, packages/db/src/sandbox/actions.ts, packages/db/src/sandbox/codes.ts, packages/db/src/sandbox/comments.ts, packages/db/src/sandbox/erasure.ts, packages/db/src/sandbox/experiment.ts, packages/db/src/sandbox/experiments.ts, packages/db/src/sandbox/gate.ts, packages/db/src/sandbox/index.ts, packages/db/src/sandbox/review.ts, packages/db/src/sandbox/roles.ts, packages/db/src/sandbox/threads.ts, packages/db/src/sandbox/viewer.test.ts, packages/db/src/sandbox/viewer.ts, packages/db/test/sandbox/codes-cases.ts, packages/db/test/sandbox/codes.test.ts, packages/db/test/sandbox/comments.test.ts, packages/db/test/sandbox/erasure-cases.ts, packages/db/test/sandbox/erasure-fixtures.ts, packages/db/test/sandbox/erasure.test.ts, packages/db/test/sandbox/experiment.test.ts, packages/db/test/sandbox/fixtures.ts, packages/db/test/sandbox/isolation.test.ts, packages/db/test/sandbox/registry.ts, packages/db/test/sandbox/review.test.ts, packages/db/test/sandbox/roles.test.ts, packages/db/test/sandbox/schema.test.ts, packages/db/test/sandbox/threads-cases.ts, packages/db/test/sandbox/threads.test.ts, packages/db/test/sandbox/throttle.test.ts. Judge these changes against the criteria and the non-negotiables.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/ux/admin/people.md. Read only the parts the contract names (D-LAB-26, D-LAB-28, C-LAB-people-1, C-LAB-people-2, C-LAB-people-3, C-LAB-people-4, C-LAB-people-5, C-LAB-people-6), not the whole file.

Stay inside the changed files. Follow an import one hop out of a changed file only to confirm a Blocking finding, never to look for one, and never further than that hop.

For each criterion, say whether the evidence and the changed code show it is met. Then list every finding, graded Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL; a Should-fix or Consider finding never does.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Criteria

| # | Verdict | What the evidence and the code show |
|---|---|---|
| **C1** | **Met** | `C1.log:2206-2238` (exit 0, head `eff9425`). `changeRoleWith` writes the whole read-back `app_metadata` plus the new role (`people.ts:194-197`), so `provider`/`providers` survive either GoTrue semantics; the test asserts the exact write, including a `custom` key. One record row names the lower-cased target email, written on the lock's `tx` before the Auth write (`people.ts:193`), and `calls` is asserted as `lock, read, record, write`. Toast strings match people.md for all three targets. Nav: `admin-nav.ts:35-40` People `ready: true`, `adminOnly: true`. |
| **C2** | **Met** | `C1.log:2243-2263`. The guard is inside the lock and counts through the Auth API (`people.ts:191`, `people-data.ts:85-89` → `listAuthPeople`), refusing when `from === "admin"` and the count is ≤1 — stronger than self-demotion alone, which is what S2 actually needs. Nothing written or recorded (`calls` asserted as `lock, read, count`). With a second admin it succeeds and reports `self: true`. |
| **C3** | **Met** | `C1.log:2268-2288`. `actions.ts:21-22` opens with `requireTeamAction({ adminOnly: true })` and returns the refusal unchanged; `changeRoleWith` refuses a non-admin again before any lock or read (`people.ts:170`); `adminGate` gives a developer `not-found` on `/admin/people`, and `isAdminOnlyPath` makes the path admin-only even if a caller forgets the flag (`admin-nav.ts:59-66`). |
| **C4** | **Met** | `C4.log:1265-1281` on the local database, plus the five isolation cases at `C4.log:886-915`. `withRoleChangeLock` calls `requireAdmin` before any SQL and takes `pg_advisory_xact_lock` inside `db.transaction` (`roles.ts:32-38`) — a transaction lock, correct for the hosted transaction pooler. The admin isolation case reads `pg_locks` to prove the lock is actually held inside `fn` (`isolation.test.ts:216-224`). The local pool is `max: 5` (`client.ts:33`), so the two concurrent calls genuinely contend; the 326 ms duration against two 150 ms sleeps shows serialization. |
| **C5** | **Met** | `C5.log:44-76`. Over `fetch` in `local-users.ts`'s shape: unknown email refused with a fixed message that doesn't echo it and sends no write (`grant-admin.ts:98`), idempotent (`:101`), `redirect: "error"` on every request (`:80`), and errors are built from status only — the test feeds back a 401 body containing the key and asserts the message doesn't carry it. `db:grant-admin` is wired in `package.json:59` and covered by the `test` glob. |
| **C6** | **Met** | `people-confirm.png`: five changes (to admin, to developer, remove developer, remove admin, own demotion with another admin) at 390/834/1440, light and dark. Copy matches `people.md:22-25`, including the appended "You'll lose access to People." on self-demotion. |
| **C7** | **Deferred, correctly** | `C7-operator.md` is a keyboard-and-DOM walk re-run at `eff9425`, with the screen-reader half handed over. Recorded `--verdict deferred`; the as-built lists it under "Not verified". That is the contract's own instruction, met. |
| **C8** | **Met** | `people-states.png`: all nine `PEOPLE_STATE_KEYS` at three widths, light and dark. Every key is registered `team` in `state.ts:44-52` and has a view, asserted exhaustively (`people.test.ts:386-410`), including that every "(you)" row is the synthetic `PEOPLE_FIXTURE_VIEWER` and no non-`example.com` address appears in a fixture. |

Non-negotiables hold: the lock is the action's, not the UI's; roles are written only through `lib/supabase/admin.ts` (`people-data.ts:18, 90-96`) and no other `app_metadata` key moves; `recordAction` structurally refuses `targetEmail` on anything but `role-change` (`actions.ts:58-71`), with the name exported once from `@pem/db/sandbox` and registered in the isolation suite; the heading line is R11's verbatim. Boundaries are clean — `@pem/db/sandbox` is reached only from `apps/web/lib/sandbox`, and the client leaf's `@pem/db/rls` import is type-only, so drizzle stays out of the browser. UI uses `@pem/ui` and scale utilities only; I found no raw colour, spacing, radius or duration value, and no emoji-as-icon.

## Findings

**Should-fix — the lock spans unbounded network I/O.** `people-data.ts:74-99` with `roles.ts:33-38`: the transaction holds a pooled connection *and* the global advisory lock across up to 52 Auth-API calls (`readPerson`, `countAdmins` → `listAuthPeople` at up to 50 pages, `writeAppMetadata`), none of which has a timeout. A hung Auth API pins a pooler slot and blocks every other role change until the socket gives up. Counting inside the lock is the contract's non-negotiable, so the fix is a bound, not a move: an `AbortSignal.timeout` on the Auth calls, or `set local statement_timeout` / `idle_in_transaction_session_timeout` inside `withRoleChangeLock`.

**Should-fix — the as-built claims verdicts the ledger does not hold.** `as-built.md:39-51` records "Mason: PASS" and "Warden: PASS" while `results.json:107-116` has both `review:*` criteria `FAIL` with `run: null`. At Q3 a reviewer's verdict exists only where `yarn review:run` writes it; those were in-thread passes and should say so. Same line of defect at `as-built.md:35`: "which mason confirmed as the named reviewer" — no record carries that confirmation. What actually settles people.md's open timing assumption is the contract's non-negotiable and R11, which is what the code and test match; cite those.

**Should-fix — the promotion list misses the component swap.** `people.md:18` says the table is `data-table`, paginated at 50; the code uses `@pem/ui/table` with the page's own pager (`people-table.tsx:40-48, 296-320`). The swap is recorded as a deviation but is not in the list at `as-built.md:35` that `yarn truth:promote LAB` folds into people.md, so the living truth will still name `data-table` after promotion. Add it alongside the strings.

**Consider — a no-op change reports success.** `people.ts:190` returns `changed` with the success toast and writes nothing when the person already holds the role. The page guards it (`people-table.tsx:250`), but a stale page — another admin got there first — gets a toast saying a change happened, with no record behind it. Return a distinct outcome.

**Consider — the page index is clamped only on filter change.** `people-table.tsx:154-158`: if the row count shrinks under a `router.refresh()` while on a later page, `shown` is empty and the table renders headers with no rows. Clamp `page` to `pages - 1` when `rows` changes.

**Consider — the route skeleton forks a string.** `loading.tsx:7` hardcodes `"People"` and drops the timing line, so it differs from `page.tsx:29-32` and the heading has two homes. Use `PEOPLE_WORDS.heading` and render the same line.

**Consider — two assertions read source text.** `people.test.ts:290-297, 309-316` regex-match `actions.ts` and `page.tsx` as strings. They do catch a dropped guard, and LAB-8's C6 scan is the prior art, but they assert spelling rather than behaviour (testing.md's first rule) and break on a reformat. Replace with a call-through once the action can be driven in a test.

Clean work on the part that mattered most: the guard is where the contract put it, it counts from the Auth API rather than the session, it fails closed on a partial list, and the lock is proven to be held rather than assumed.

VERDICT: PASS
