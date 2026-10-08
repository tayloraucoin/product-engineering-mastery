# Review — warden on LAB-15

> Written by `yarn review:run warden LAB-15`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: d02e7956794c6e474115abfac2022a9a98c1003f27822a81121a61e101c2b5d5
- criteria_sha256: 4057d645cf8be1994997c61086765730faebcec90d0bd29571b06f726059f80a
- as_built_sha256: 891a1b17edd958f7490b294523f413ba9849e7b2082d95c0aeae91f8b8e2c9e4
- head: eff9425ea2ce895189537dccb1cc15d59d7a94c8
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-08T02:03:54Z
- run: 1 of warden on LAB-15
- tokens_input: 35
- tokens_cache_read: 4105054
- tokens_cache_write: 164744
- tokens_output: 19838
- seconds: 318.5
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden LAB-15`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket LAB-15 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

This is the only review pass unless you FAIL it, so list every finding now. A PASS is final for its round: Should-fix and Consider findings become follow-ups the builder fixes without reopening the review, and nothing you hold back is asked for later. Only a Blocking finding earns a second pass.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-015-admin-access-codes/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised, and what you judge the changes against.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-015-admin-access-codes/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-015-admin-access-codes/as-built.md. What the builder says shipped, and every deviation. It is a claim to check inside the changed files, not an invitation to read the repo.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-015-admin-access-codes/evidence/C1.log (sha256 f3670c44cf6d)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-015-admin-access-codes/evidence/C2.log (sha256 b3d52ff0e5c3)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-015-admin-access-codes/evidence/C3.log (sha256 b3d52ff0e5c3)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-015-admin-access-codes/evidence/C4.log (sha256 f3670c44cf6d)
   - C5 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-015-admin-access-codes/evidence/C5.log (sha256 f3670c44cf6d)
   - C6 capture: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-015-admin-access-codes/evidence/codes-closed.png (sha256 44e3f055bab4)
   - C7 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-015-admin-access-codes/evidence/C7.log (sha256 f3670c44cf6d)
   - C8 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-015-admin-access-codes/evidence/C8.log (sha256 b3d52ff0e5c3)
   - C9 manual: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-015-admin-access-codes/evidence/C9-operator.md (sha256 ce34dd847c03)
   - C10 capture: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-015-admin-access-codes/evidence/codes-states.png (sha256 eab2f4a2faa9)
5. The changed files, this ticket's planned paths against main (other tickets share the branch): apps/web/app/admin/experiments/[slug]/codes/_components/code-dialogs.tsx, apps/web/app/admin/experiments/[slug]/codes/_components/codes-table.tsx, apps/web/app/admin/experiments/[slug]/codes/actions.ts, apps/web/app/admin/experiments/[slug]/codes/loading.tsx, apps/web/app/admin/experiments/[slug]/codes/page.tsx, apps/web/lib/sandbox/admin-codes-data.ts, apps/web/lib/sandbox/admin-codes-view.ts, apps/web/lib/sandbox/admin-codes.test.ts, apps/web/lib/sandbox/admin-codes.ts, apps/web/lib/sandbox/emails-used.test.ts, apps/web/lib/sandbox/emails-used.ts, apps/web/lib/sandbox/state.ts, packages/db/src/sandbox/codes.ts, packages/db/src/sandbox/index.ts, packages/db/test/sandbox/codes-cases.ts, packages/db/test/sandbox/codes.test.ts, packages/db/test/sandbox/comments.test.ts, packages/db/test/sandbox/erasure-cases.ts, packages/db/test/sandbox/erasure-fixtures.ts, packages/db/test/sandbox/erasure.test.ts, packages/db/test/sandbox/experiment.test.ts, packages/db/test/sandbox/fixtures.ts, packages/db/test/sandbox/isolation.test.ts, packages/db/test/sandbox/registry.ts, packages/db/test/sandbox/review.test.ts, packages/db/test/sandbox/roles.test.ts, packages/db/test/sandbox/schema.test.ts, packages/db/test/sandbox/threads-cases.ts, packages/db/test/sandbox/threads.test.ts, packages/db/test/sandbox/throttle.test.ts. Judge these changes against the criteria and the non-negotiables.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/ux/admin/access-codes.md. Read only the parts the contract names (D-LAB-16, D-LAB-23, D-LAB-28, C-LAB-codes-1, C-LAB-codes-2, C-LAB-codes-3, C-LAB-codes-4, C-LAB-codes-5, C-LAB-codes-6, C-LAB-codes-7), not the whole file.

Stay inside the changed files. Follow an import one hop out of a changed file only to confirm a Blocking finding, never to look for one, and never further than that hop.

For each criterion, say whether the evidence and the changed code show it is met. Then list every finding, graded Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL; a Should-fix or Consider finding never does.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

# Warden — LAB-15 review (round 1)

## Criteria

| ID | Verdict | Basis |
|---|---|---|
| **C1** | Met | `admin-codes.ts:140-185` draws, hashes and returns the code only in a `made` result; `assertMade` (`admin-codes.test.ts:185-198`) pins the result to exactly `{outcome, code, link}` and the link to the site URL with no `?r=`. The round-trip test (`:217-257`) asserts no list read or row view holds the code, its normalised form, or the hash in hex or base64. The source scan (`:301-346`) bans storage, `console`, `history`, `URLSearchParams`, router pushes and `createLogger` under the route, and asserts `makeCode`/`replaceCode` never revalidate or redirect — confirmed in `actions.ts:23-45`. The client holds it in `shown` state only and drops it in `done()` before `router.refresh()` (`codes-table.tsx:183-188`). C1.log: exit 0, 388 pass / 0 fail. |
| **C2** | Met | `codes.test.ts:79-100` on the local database: the access passes, revoke, `checkAccess` → null, the old hash finds nothing, comment and version still carry the reviewer's id, other reviewers untouched. C2.log ok 7. |
| **C3** | Met | `codes.test.ts:102-165`, both the live and the already-revoked case: `code_version` + 1, `revoked_at` cleared, same row id, old hash finds nothing and its access fails, new hash finds the same reviewer, a fresh access passes, sent data kept. |
| **C4** | Met | `admin-codes.ts:116-137` and tests `:350-443`: collaborate refuses null/empty/whitespace with the store never called; private stores null whatever the form sent; `"Enter who this code is for."` verbatim; both length limits refused with their own field. `code-dialogs.tsx:247` omits the field entirely on a private experiment. |
| **C5** | Met | `admin-codes.ts:159, 200` refuse before the store; `:239` leaves revoke open. Test `:447-486` uses a throwing store wrapped in a call counter and asserts `called() === 0`, then revokes successfully on the same closed slug. |
| **C6** | Met | `codes-closed.png`: "Make a code" disabled with "This experiment is closed." beside it, and the row menu's "Replace code" disabled with the same reason while "Revoke code" stays live — all six viewports. Matches `codes-table.tsx:196-210, 275-301`. |
| **C7** | Met | `emails-used.ts:28-40` and `emails-used.test.ts`: two typed emails → `"2 emails used with this code"`; case- and space-insensitive de-duplication; an email label flags only a genuine difference; five name-shaped labels (`"@ana"`, `"ana@"` included) never flagged. |
| **C8** | Met | `codes-cases.ts` registers all four functions plus `CODE_ACTIONS` with a case per viewer kind; C2.log ok 20 items 1-21 show each refused for all three reviewer viewers and exercised for developer and admin, with slug-B isolation, foreign-id null answers and `CODES_INPUT_INVALID` on malformed input. The coverage guard (ok 19) proves nothing was registered short. |
| **C9** | Not verified — deferred, as the contract provides | `C9-operator.md` records the builder's keyboard walk (focus into "Label", then to "Copy code", Escape returns to "Make a code", menus return focus to their trigger) and states plainly that "Code copied." could not be heard because the pane refuses the clipboard. Recorded `--verdict deferred`. This is the one outstanding operator check. |
| **C10** | Met | `codes-states.png`: all eleven `codes-*` keys at 390 / 834 / 1440, light and dark. |

**Non-negotiables** all hold, including the two I weighed hardest: every write shares one transaction with its `recordAction` (`codes.ts:197-206, 224-243, 260-279`), and `assertBareRecord` (`codes-cases.ts:84-99`) proves each record row carries the action and slug with `targetEmail` and `counts` null and no label, display name, reviewer id or hash anywhere in the serialised row — D-LAB-28 enforced, not asserted.

## Findings

**Should-fix — `as-built.md:43`.** The "Not verified" section states that C1, C4, C5 and C7 "are recorded failing in `results.json`" and must be re-run once LAB-11 lands. `results.json` records all four PASS, exit 0, 473 tests, at the same head (`eff9425`). The paperwork now tells a future reader four criteria are unproven when they are proven; at Q3 the as-built is the record, and a stale claim invites a needless re-open.

**Should-fix — `apps/web/lib/sandbox/admin-codes.test.ts:302-304`.** The source scan — the structural guard behind this ticket's headline protection — walks only `app/admin/experiments/[slug]/codes/`. The two files where the code actually exists in clear are outside it: `admin-codes.ts` (the generated code is a local, and the `made` result passes through) and `admin-codes-data.ts` (which already imports `createLogger`). There is no repo-wide `no-console` rule in `packages/config/eslint`, so a later `console.log(result)` or a `log.warn(..., { code })` in the rules module would break the non-negotiable with nothing to catch it. Extend the walk to `lib/sandbox/admin-codes*.ts` and `emails-used.ts`. Nothing is wrong today; the control simply sits narrower than the risk.

**Consider — `packages/db/src/sandbox/codes.ts:273-276`.** Revoke's `UPDATE` is scoped by `id` alone. The preceding `SELECT … FOR UPDATE` (`:261-271`) does carry both `id` and `slug` and returns null otherwise, so behaviour is correct today because `id` is the primary key — but the contract's own rule is that revoke and replace "scope by `slug` and `reviewer_id` together", and `replaceCode:233-238` does exactly that. Add `eq(sandboxReviewers.slug, slug)` to the update so the scoping cannot be lost if the select is ever refactored.

**Consider — `apps/web/app/admin/experiments/[slug]/codes/_components/code-dialogs.tsx:350-357`.** A clipboard write that throws returns silently: the button does not change, nothing is announced, no line appears. On a shown-once surface an operator can read that as "nothing happened", press Done, and lose the code — recoverable only by Replace. The field stays selectable, so impact is low, but a short line ("Couldn't copy. Select the code and copy it.") costs the happy path nothing.

**Consider — `apps/web/lib/sandbox/admin-codes.ts:182, 221, 248`.** The three `catch {}` blocks swallow the error whole. `admin-codes-data.ts:118-123` logs a failed *list*, but a failed make, replace or revoke leaves no trace at all, and `recordAction` runs only on success — so a burst of failing credential actions on this surface is invisible to the team. One `log.warn("sandbox.code_action_failed", { action, error: error.name })` at the data seam gives detection while holding nothing sensitive, consistent with what that file already logs.

Nothing here is Blocking. The protection the ticket exists for — a code that lives in clear for exactly one response and one dialog — holds end to end, at the right layers, and is proven rather than asserted at both the rules and the database.

VERDICT: PASS
