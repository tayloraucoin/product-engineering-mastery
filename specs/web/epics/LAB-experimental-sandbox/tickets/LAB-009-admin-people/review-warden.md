# Review — warden on LAB-9

> Written by `yarn review:run warden LAB-9`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 4b6b41c900f3f5b577a9fb724690f6be890c5834dd9ad42f008d7d82df87884e
- criteria_sha256: 154bb6d8338f442fc5da1950bc285b78ce342d72544e5cb3fd05e0b3a26a07c6
- as_built_sha256: 4a7149a8852d9a02b9a398ec1f875456a249efd9be99a1eb60a1bc93e80da04b
- head: eff9425ea2ce895189537dccb1cc15d59d7a94c8
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-08T02:00:47Z
- run: 1 of warden on LAB-9
- tokens_input: 38
- tokens_cache_read: 4732741
- tokens_cache_write: 173580
- tokens_output: 24426
- seconds: 437.6
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden LAB-9`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket LAB-9 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

| ID | Verdict | What the evidence and the code show |
| --- | --- | --- |
| **C1** | Met | `C1.log` ok 115 (5 subtests): the role is written, `provider`/`providers`/`custom` survive, one record names `ben@example.com`, the toast is people.md's, and the nav's People entry is a link for an admin. The code writes the whole object it read inside the lock (`people.ts:194-197`), so the GoTrue-merge assumption no longer has to hold. |
| **C2** | Met | `C1.log` ok 116. `people.test.ts:214` asserts the call order `["lock","read","count"]` — the count happens inside the lock, through the Auth API, and nothing is written or recorded on refusal (`people.ts:191-192`). With a second admin the change succeeds and reports `self: true`. |
| **C3** | Met | `C1.log` ok 117, and ok 62/64/72 from LAB-8's guards in the same run. Three layers: `actions.ts:21-22`, `people.ts:170`, and `requireAdmin` inside `withRoleChangeLock` (`roles.ts:32`). A developer on `/admin/people` is not-found; the page's guard is asserted from source (`people.test.ts:313-316`). |
| **C4** | Met | `C4.log` ok 25 (reviewer and developer refused before `fn` runs), ok 26 (two admins demoting themselves leave one admin), ok 27 (the same race without the lock leaves none — the control, not the coincidence). Isolation cases ok 99–103, with the admin case reading `pg_locks` to prove the lock is held inside `fn` (`isolation.test.ts:216-224`). `pg_advisory_xact_lock` in one transaction, as the pooler requires. |
| **C5** | Met | `C5.log` ok 7 (5 subtests): grants, keeps other `app_metadata` keys, refuses an unknown email with a fixed message that does not echo it and sends no PUT, is idempotent, sets `redirect: "error"` on every request, keeps the key out of every message (both key forms), and refuses a missing email/URL/key before sending anything. |
| **C6** | Met | `people-confirm.png`: five changes (to admin, to developer, two removals, own demotion with another admin) at 390/834/1440, light and dark, words verbatim from people.md; `C1.log` ok 1 under "people.md's words and states" asserts the strings. |
| **C7** | Deferred, correctly | Recorded `--verdict deferred` with the reason the contract gives. The keyboard half is walked at `eff9425` and the wiring is in the code: `aria-label` from `roleSelectLabel`, `aria-describedby` → the last-admin reason, `finalFocus={returnTo}` returning focus to the row's trigger, a polite live region (`people-table.tsx:209-211, 256-262, 360`). The screen-reader half stays unverified, as the contract intends. |
| **C8** | Met | `people-states.png`: all nine `people-*` keys at three widths, light and dark. Every key is `team` in `state.ts:44-52`, and the fixtures are synthetic — `people.test.ts:405-409` pins "(you)" to `PEOPLE_FIXTURE_VIEWER` and refuses any address outside `example.com`. |

**Non-negotiables.** All met. The service-role seam is the only writer of `app_metadata` in the app (`people-data.ts:18` is the sole `createSupabaseAdminClient` write path; LAB-16's use is a read). The record names the actor and the lower-cased team member's email and nothing else (`actions.ts:78-85`). Nothing logs an email or the key. The heading line is R11's and every other string matches people.md.

**Adversaries I cast and did not find a path for:** a developer (page 404, action refused three times over, `?state=` unreachable); a demoted admin on a stale session (R11's per-request `getUser()`); a forged form (`parseRoleChange` takes the actor from the session, never the form); an admin playing with a `?state=` key (the fixture viewer is synthetic, so a confirm on a fixture row reaches a non-existent id and fails); the last-admin race (C4 proves the lock holds it).

## Findings

All Consider. None blocking.

1. **Consider — the global role-change lock and a pooled connection are held across unbounded external I/O.** `roles.ts:33-38` opens a transaction and takes the advisory lock, and `people-data.ts:76-96` then makes up to 52 Auth API calls inside it (`getUserById`, `countAdmins` → `listAuthPeople`'s 50 pages, `updateUserById`) with no `AbortSignal` and no statement or lock timeout. A hung Auth call holds the one lock and one pooler connection indefinitely, and every other role change queues behind it. Admin-only, self-inflicted and recoverable, which is why it is not higher — but the smallest control is a timeout on the admin calls, at the seam, so a hung upstream cannot wedge role management.

2. **Consider — two different admin counts, and the authoritative one is the looser.** `people.ts:221-224` counts admins only among accounts that have an email; `people-data.ts:85-89` counts every account whose role is `admin`. An admin-role account with no email (phone or anonymous sign-up) counts for the server guard but not for the row lock, so the server would permit a demotion that leaves only an admin `db:grant-admin <email>` cannot restore. Filtering `countAdmins` to accounts with an email makes the guard count only the recoverable admins, which is the direction the non-negotiable wants.

3. **Consider — the whole-object `app_metadata` write serializes against People, not against GoTrue.** `people.ts:194-197` writes back the copy read at `people.ts:179`. The lock stops two role changes colliding, but a key GoTrue adds in that window (an identity link extending `providers`) is overwritten with the stale copy. One Auth round trip wide, and the alternative (a merge write) has its own failure mode — worth naming in the file beside the existing note rather than reworking.

4. **Consider — `recordAction`'s role-change branch is gated by `requireTeam`, not `requireAdmin`.** `actions.ts:48` and `:64`: the only check on a row that names a person is that the action is `role-change`, so a future developer-reachable caller could write any address into `target_email` and D-LAB-28's "a team member, never a reviewer" would depend on the caller's discipline. No such caller exists today. `requireAdmin` on that branch moves the guarantee to the layer that cannot be forgotten.

5. **Consider — the as-built and the ledger disagree about this review.** `as-built.md:45` records "Warden: PASS, six Consider items" while `results.json:129-133` holds `review:warden` as `FAIL` with `run: null`. Reconcile the as-built with whatever this run records, so the Q3 ledger is the single account of who reviewed what.

Two items the as-built already carries as recorded acceptances — a commit failure after a successful Auth write leaving a change with no record (under-counting only, never over-counting, which `people.ts:193-197` does hold), and a no-op change returning `changed` — I am not refiling. The direction of the first is correct as written and LAB-16 should read the record as a floor.

VERDICT: PASS
