# Review — mason on LAB-16

> Written by `yarn review:run mason LAB-16`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 8c1b1605ef1938ac7b89fd2cda1d2c04bde3779008ffee28b115f8092d73367e
- criteria_sha256: 770c82a6452886aacf1fc872b14a362dd0334df30599a7c283d894af20a2f357
- as_built_sha256: 6ee5aec2e8bb7f0215bdebf91cdda875ad90ae82cd3cffb3f176231e6dc016c1
- head: eff9425ea2ce895189537dccb1cc15d59d7a94c8
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-08T02:10:12Z
- run: 1 of mason on LAB-16
- tokens_input: 35
- tokens_cache_read: 4930538
- tokens_cache_write: 228613
- tokens_output: 24122
- seconds: 375.6
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason LAB-16`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket LAB-16 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

This is the only review pass unless you FAIL it, so list every finding now. A PASS is final for its round: Should-fix and Consider findings become follow-ups the builder fixes without reopening the review, and nothing you hold back is asked for later. Only a Blocking finding earns a second pass.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised, and what you judge the changes against.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/as-built.md. What the builder says shipped, and every deviation. It is a claim to check inside the changed files, not an invitation to read the repo.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C1.log (sha256 9b1a4eaf163a)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C2.log (sha256 9b1a4eaf163a)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C3.log (sha256 3b64d7114e79)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C4.log (sha256 9b1a4eaf163a)
   - C5 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C5.log (sha256 9b1a4eaf163a)
   - C6 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C6.log (sha256 3b64d7114e79)
   - C7 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C7.log (sha256 9b1a4eaf163a)
   - C8 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C8.log (sha256 3b64d7114e79)
   - C9 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C9.log (sha256 3b64d7114e79)
   - C10 manual: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C10-operator.md (sha256 7e50d3c9545e)
   - C11 capture: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/data-states.png (sha256 8095d33f3370)
5. The changed files, this ticket's planned paths against main (other tickets share the branch): apps/web/app/admin/data/_components/erase-section.tsx, apps/web/app/admin/data/_components/record-table.tsx, apps/web/app/admin/data/actions.ts, apps/web/app/admin/data/loading.tsx, apps/web/app/admin/data/page.tsx, apps/web/app/admin/experiments/[slug]/data/_components/data-tab.tsx, apps/web/app/admin/experiments/[slug]/data/actions.ts, apps/web/app/admin/experiments/[slug]/data/loading.tsx, apps/web/app/admin/experiments/[slug]/data/page.tsx, apps/web/lib/sandbox/admin-data-data.ts, apps/web/lib/sandbox/admin-data-view.ts, apps/web/lib/sandbox/admin-data.test.ts, apps/web/lib/sandbox/admin-data.ts, apps/web/lib/sandbox/admin-nav.ts, apps/web/lib/sandbox/state.ts, packages/db/src/sandbox/erasure.ts, packages/db/src/sandbox/index.ts, packages/db/test/sandbox/codes-cases.ts, packages/db/test/sandbox/codes.test.ts, packages/db/test/sandbox/comments.test.ts, packages/db/test/sandbox/erasure-cases.ts, packages/db/test/sandbox/erasure-fixtures.ts, packages/db/test/sandbox/erasure.test.ts, packages/db/test/sandbox/experiment.test.ts, packages/db/test/sandbox/fixtures.ts, packages/db/test/sandbox/isolation.test.ts, packages/db/test/sandbox/registry.ts, packages/db/test/sandbox/review.test.ts, packages/db/test/sandbox/roles.test.ts, packages/db/test/sandbox/schema.test.ts, packages/db/test/sandbox/threads-cases.ts, packages/db/test/sandbox/threads.test.ts, packages/db/test/sandbox/throttle.test.ts. Judge these changes against the criteria and the non-negotiables.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/ux/admin/data.md. Read only the parts the contract names (D-LAB-3, D-LAB-26, D-LAB-27, D-LAB-28, C-LAB-data-1, C-LAB-data-2, C-LAB-data-3, C-LAB-data-4, C-LAB-data-5, C-LAB-data-6, C-LAB-data-7), not the whole file.

Stay inside the changed files. Follow an import one hop out of a changed file only to confirm a Blocking finding, never to look for one, and never further than that hop.

For each criterion, say whether the evidence and the changed code show it is met. Then list every finding, graded Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL; a Should-fix or Consider finding never does.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

# Review — LAB-16 admin-data (mason, fresh context)

**Verdict: PASS.** No Blocking finding. The one-way doors this ticket opens — a hard delete of personal data and an erasure that must not take the next person's rows with it — are guarded at the layer that survives a careless caller: `requireAdmin` is the first statement of `deleteExperimentData` (`packages/db/src/sandbox/erasure.ts:300`), before input validation and before the transaction, and both writes run in one transaction with their record row. Two Should-fix and five Consider findings below are follow-ups, not a second pass.

## Criteria

| ID | Met | What shows it |
| --- | --- | --- |
| C1 | yes | `erasure.test.ts:230` deletes reviewers, accesses, views, comments, versions and the team note on `pricing-2026`, asserts `rowsOn([other])` is byte-identical before and after, and pins one `data-deleted` row with exact counts. A second delete writes no second row. Log exit 0. |
| C2 | yes | `erasure.test.ts:333` plus `erasure-cases.ts:260`, which also refuses a developer viewer *dressed with the admin's `userId`* — the check reads the role, not the id. Snapshot unchanged. |
| C3 | yes | `admin-data.test.ts:104`: a store whose every function throws is never called, and the registry is not read before the refusal; `deletePanel` gives `{kind:"developer"}`, and the leaf is pinned to render `<DeleteForm>` only under `panel.kind === "admin"`, exactly once. |
| C4 | yes | `erasure.test.ts:362`. The sweep (`:89`) reads every `sandbox_` table from `information_schema` and matches each row as text — so a table added later is swept — and returns `{}` for ana. Ben's rows on both slugs survive, including his reply under ana's removed root; `emailsUsed` is `[ben]`; the record row has no slug and counts only. |
| C5 | yes | `erasure.test.ts:475`: a code used only by the erased email is revoked and relabelled; an unticked name label is unchanged and its code stays live; a ticked one goes. The ticked list is filtered to reviewers the erasure actually touched (`erasure.ts:610`), so a caller cannot blank an unrelated label — `clearLabels: [unrelated]` leaves "Quin". |
| C6 | yes (app half stubbed) | `admin-data.test.ts:205`: the normalised email reaches the stubbed lookup and its account id reaches `eraseEmail`; unknown email → "Nothing is held for that email." with zero erasures. Database half at `erasure.test.ts:535`. Real Supabase Auth is untested and declared. |
| C7 | yes | `erasure.test.ts:574` exercises all six action kinds, then asserts no row holds a reviewer email or label, that only the role change names anyone (a team member), and that every erasure row carries its counts. |
| C8 | yes | `confirmMatches` is strict equality against eight near-misses including case, leading/trailing space and a trailing newline; the server refuses a mismatch with the throwing store at 0 calls (`admin-data.test.ts:391`). |
| C9 | yes | `admin-data.test.ts:439`: `?reviewer=` merges typed and account emails with their own counts while every write in the store still throws; an unknown id gives the no-match line; the page is pinned to read `query.reviewer` and no email; nav `Data` is `ready: true` for both roles. |
| C10 | deferred, correctly | `C10-operator.md` records a keyboard walk at `eff9425` and hands the screen-reader pass over. Recorded `--verdict deferred`. |
| C11 | yes | `data-states.png` is a contact sheet of all 18 `data-*` keys at 390/834/1440, light and dark. Taken against an uncommitted scratch `team.ts`; declared. |

Non-negotiables all hold. Worth stating for the record: the Data tab page uses `requireTeamPage`, not an admin gate — that is right, not a miss. D-LAB-26 gives developers the counts; "the page holds it to admins" is satisfied by `deletePanel` withholding the field and button (`admin-data-view.ts:266`), on top of the action's `{adminOnly:true}`, the pure rules' `member?.role !== "admin"`, and `requireAdmin` in the database. Four layers, each proven.

## Findings

**Should-fix**

1. **`apps/web/lib/sandbox/admin-data.ts:139` — a second source of truth for the record's page size.** `const PAGE_SIZE = 50` computes `pages` at `:363`, while the store slices by `ACTIONS_PAGE_SIZE` exported from `packages/db/src/sandbox/erasure.ts:66`. They agree today by coincidence of literal. If the store's size ever moves, the page count and the `page > pages` clamp go wrong silently — a display bug with no test that would catch it, since both tests stub `listActions`. Pass the constant through `DataDeps` (`admin-data-data.ts` already imports from the same barrel), or take it as an argument. This is the one duplicated number that governs behaviour rather than a refusal boundary.

2. **`as-built.md:54` contradicts the recorded evidence.** It says `yarn workspace web test` "exits 1 on two tests that LAB-11's commit `9b9f6c1` broke". The run recorded for C3, C6, C8 and C9 at the same head is `exit: 0`, `# tests 388 / # pass 388 / # fail 0`, with no `not ok` line in `C3.log`. Either LAB-11's breakage was fixed before the final run or the line predates it; as written, the as-built reports a failure the ledger does not have. Correct the line so the "Not verified" section means what it says.

**Consider**

3. **`apps/web/app/admin/data/_components/erase-section.tsx:111` — a fixture string living in the leaf.** `view.noMatch ? "someone@example.com" : ""` seeds the field for `?state=data-page-no-match`. Every other fixture (`FIXTURE_FOUND`, `FIXTURE_ERASED`, `FIXTURE_REVIEWER`, `fixtureRecord`) lives in `admin-data-view.ts`, and the "no fixture holds a real reviewer" guard (`admin-data.test.ts:666`) scans `dataPageStateView` only — so this string sits outside the net written to catch exactly this. Move it into the view module's fixture.

4. **`apps/web/app/admin/data/_components/record-table.tsx:42` — pagination drops `?reviewer=`.** `pageHref` rebuilds the URL from the page alone, so Older/Newer from a reviewer view silently returns to the plain page. data.md leaves it unworded; preserving the param is a two-line change.

5. **`apps/web/lib/sandbox/admin-data-view.ts:215` — role-change words differ from the cited surface.** data.md:41 gives "Made ben@example.com a developer"; the code renders "Changed the role of ben@example.com". The reason is sound and declared (the row holds no role until LAB-28), and as-built's "Next" already names the follow-up — noting it so the surface and the words are reconciled when LAB-28 lands rather than drifting.

6. **`packages/db/test/sandbox/erasure-fixtures.ts:43` — version numbers come from a module-global counter.** `number: ++versionNumber` means a seeded reviewer's first version can be number 7, which production never produces (numbers are per reviewer, from 1). Nothing in LAB-16 reads the number, so no criterion is affected, but a later test asserting on numbering through these seeds would be reading a fiction. Number per reviewer instead.

7. **Guard constants mirrored across the seam** — `DATA_EMAIL_MAX`/`EMAIL_MAX` (254), `CLEAR_LABELS_MAX` (500), `parsePage`'s bare `10_000` against `PAGE_MAX`, and a re-declared UUID/email regex (`admin-data.ts:133-139`, `:353`). As defence in depth at a network boundary this is defensible and the comments say so; the loose end is `parsePage`'s unnamed `10_000`, which reads as a magic number rather than a deliberate mirror. Name it, and consider a comment pointing each mirror at its twin.

One more thing worth saying plainly: the shared isolation world now carries a signed-in reviewer on slug A, which moved expected counts inside other tickets' suites (`listExperimentStats`, the comments and designs cases). That is inside `planned_paths`, the whole suite is green, and a commit to a shared file reopens nothing — but the as-built does not mention it. A line under Deviations would have saved the next reviewer the trip.

VERDICT: PASS
