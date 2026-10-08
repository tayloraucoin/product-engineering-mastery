# Review — assay on LAB-15

> Written by `yarn review:run assay LAB-15`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 7a255dd0bfb069434cdb17807d22026cf9a7665c1eac5f406fa32d9cda824683
- criteria_sha256: 4057d645cf8be1994997c61086765730faebcec90d0bd29571b06f726059f80a
- as_built_sha256: 891a1b17edd958f7490b294523f413ba9849e7b2082d95c0aeae91f8b8e2c9e4
- head: eff9425ea2ce895189537dccb1cc15d59d7a94c8
- runner: claude 2.1.232 (Claude Code) (agent assay; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-08T01:56:57Z
- run: 1 of assay on LAB-15
- tokens_input: 31
- tokens_cache_read: 1213807
- tokens_cache_write: 120772
- tokens_output: 17222
- seconds: 293.8
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run assay LAB-15`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are assay, reviewing ticket LAB-15 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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
5. The changed files, this ticket's planned paths against main (other tickets share the branch): apps/web/lib/sandbox/admin-codes-data.ts, apps/web/lib/sandbox/admin-codes-view.ts, apps/web/lib/sandbox/admin-codes.test.ts, apps/web/lib/sandbox/admin-codes.ts, apps/web/lib/sandbox/emails-used.test.ts, apps/web/lib/sandbox/emails-used.ts, apps/web/lib/sandbox/state.ts, packages/db/src/sandbox/codes.ts, packages/db/src/sandbox/index.ts, packages/db/test/sandbox/codes-cases.ts, packages/db/test/sandbox/codes.test.ts, packages/db/test/sandbox/comments.test.ts, packages/db/test/sandbox/erasure-cases.ts, packages/db/test/sandbox/erasure-fixtures.ts, packages/db/test/sandbox/erasure.test.ts, packages/db/test/sandbox/experiment.test.ts, packages/db/test/sandbox/fixtures.ts, packages/db/test/sandbox/isolation.test.ts, packages/db/test/sandbox/registry.ts, packages/db/test/sandbox/review.test.ts, packages/db/test/sandbox/roles.test.ts, packages/db/test/sandbox/schema.test.ts, packages/db/test/sandbox/threads-cases.ts, packages/db/test/sandbox/threads.test.ts, packages/db/test/sandbox/throttle.test.ts. Judge these changes against the criteria and the non-negotiables.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/ux/admin/access-codes.md. Read only the parts the contract names (D-LAB-16, D-LAB-23, D-LAB-28, C-LAB-codes-1, C-LAB-codes-2, C-LAB-codes-3, C-LAB-codes-4, C-LAB-codes-5, C-LAB-codes-6, C-LAB-codes-7), not the whole file.

Stay inside the changed files. Follow an import one hop out of a changed file only to confirm a Blocking finding, never to look for one, and never further than that hop.

For each criterion, say whether the evidence and the changed code show it is met. Then list every finding, graded Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL; a Should-fix or Consider finding never does.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Coverage

Read: contract, `results.json`, as-built, all ten evidence files (both PNGs viewed in full), the 25 changed files' substance — `packages/db/src/sandbox/codes.ts`, `admin-codes.ts`, `admin-codes-data.ts`, `admin-codes-view.ts`, `emails-used.ts`, `state.ts`, `codes-cases.ts`, `codes.test.ts`, `admin-codes.test.ts`, `emails-used.test.ts`, `registry.ts`'s guard — and the cited parts of `ux/admin/access-codes.md`.

Not seen: the five files under `apps/web/app/admin/experiments/[slug]/codes/` (planned path, contract.md:36). They exist on disk but were absent from the changed-file list handed to this pass, so I did not read them. Finding 2.

Both evidence runs are green at head `eff9425`: `C1.log:3022-3025` (`# tests 388`, `# fail 0`), `C2.log:1523-1526` (`# tests 232`, `# fail 0`).

## Criteria

| | Met | Evidence |
|---|---|---|
| C1 | Yes | `C1.log:494-526`, five subtests. The store is sent only the SHA-256 (`admin-codes.test.ts:211-214`); the list's keys are asserted exactly, and code, normalised code, hex and base64 hash are all absent from two successive reads (`:234-256`); the route scan bans storage, `console.`, `createLogger`, `URLSearchParams`, `history`/`router` and proves make and replace neither revalidate nor redirect (`:301-346`). `codes.ts` returns no hash anywhere. Client-side drop: see finding 2. |
| C2 | Yes | `C2.log:149-150`; `codes.test.ts:79-100` — `checkAccess` passes, revoke, `checkAccess` null, `findLiveReviewerByCodeHash` null, comment and version still the reviewer's, other reviewers untouched. |
| C3 | Yes | `C2.log:155-162`; `codes.test.ts:102-165` for both a live and a revoked code: version +1, `revoked_at` null, same row id, old hash finds nothing and its access fails, new hash finds the same reviewer, a fresh access passes, sent data kept. |
| C4 | Yes | `C1.log:531-563`; `admin-codes.test.ts:350-443`. Collaborate refuses `null`/`""`/`"   "` with the store untouched; private stores null whatever was sent; empty label gives exactly "Enter who this code is for."; both limits have their own line. |
| C5 | Yes | `C1.log:568-576`; `admin-codes.test.ts:447-486` — a counting throwing store, `called() === 0`, and revoke succeeds on the closed slug. `admin-codes.ts:159,200` refuse before the store; revoke (`:227-251`) has no closed check. |
| C6 | Yes | `codes-closed.png`: "Make a code" disabled with "This experiment is closed." beside it, the row menu's "Replace code" disabled with the same reason and "Revoke code" live, at 390/834/1440, light and dark. See finding 5. |
| C7 | Yes | `C1.log:1796-1834`; `emails-used.test.ts` covers two typed emails, one email in two cases, an email label that differs, one that matches in another case, five name labels never flagged, and none typed. Words match access-codes.md:19. |
| C8 | Yes | `C2.log:298-413`; `codes-cases.ts` registers all four functions as `group: "viewer"`, and `registry.ts:84-86` fails the suite if any of the five viewer kinds lacks a case. Three reviewer kinds are refused with `NOT_A_TEAM_VIEWER`, with row counts and record counts unchanged; `listCodes` on slug B returns only B's; `assertBareRecord` proves the record row carries action, slug and actor only — no label, display name, id or hash (D-LAB-28 honoured). |
| C9 | **Not verified** — deferred by design (`results.json` `deferred: true`, contract.md:86). The builder's keyboard walk is recorded (`C9-operator.md:5-28`); "Code copied." was never heard, the pane refused the clipboard. A person with a screen reader still owes this. |
| C10 | Yes | `codes-states.png`: all eleven keys of access-codes.md:47-57 × 390/834/1440 × light/dark. `CODES_STATE_KEYS` (admin-codes-view.ts:147-159) matches that table exactly and every key is registered `team` (state.ts:66-76), asserted at `admin-codes.test.ts:575-584`. |

Non-negotiables: all seven hold in the code I read. `(db, viewer, input)` with `requireTeam` first on every function; write and `recordAction` in one `db.transaction`; replace rewrites hash, raises version, clears `revoked_at` on the same row; the display-name rule; `requireTeamAction` on the actions is covered by the route-guard scan that passed in the same run (`C1.log:1033-1056`).

## Findings

**1 — Should-fix. `as-built.md:40-43` contradicts the ledger.** "Not verified" says C1, C4, C5 and C7 "are recorded failing in `results.json`" and tells the reader to re-run once LAB-11 lands. `results.json` records all four PASS at exit 0, head `eff9425`, and `C1.log:3025` reads `# fail 0`. The re-run already happened. A Q3 reader takes `as-built.md` as the account of what shipped. Smallest fix: replace that paragraph with one line saying the earlier exit 1 was LAB-11's two tests and the suite is green at `eff9425`.

**2 — Should-fix. The route files were not in the review set, and the non-negotiable's last clause rests on deferred evidence.** `page.tsx`, `loading.tsx`, `actions.ts`, `_components/code-dialogs.tsx` and `_components/codes-table.tsx` are a planned path (contract.md:36) and the as-built claims them (as-built.md:18-20), but none reached this pass. So "the client drops it on Done or Escape" (contract.md:7) is supported only by a source scan that checks for banned APIs rather than for the state being cleared (`admin-codes.test.ts:301-346`) and by `C9-operator.md:17-18`, which is deferred. Smallest fix: hand warden those five files by name — its focus line is exactly this — or add one client test asserting the dialog's code state is empty after Done and after Escape.

**3 — Consider. `packages/db/src/sandbox/codes.ts:273-276`: revoke's UPDATE is scoped by id alone.** The gotcha asks revoke and replace to scope by slug and reviewer id together (contract.md:127). It is correct today: the `FOR UPDATE` select at `:261-270` matches both inside the transaction, so a foreign id returns null first. The write still carries no slug. Smallest fix: add `eq(sandboxReviewers.slug, slug)` to the update's where, as `replaceCode` does at `:236`.

**4 — Consider. `apps/web/lib/sandbox/admin-codes.ts:182, 221, 248`: a failed action is silent.** All three catches swallow the store's error into `failed` with no log, while the list read logs its error's name (`admin-codes-data.ts:119-121`). A run of failing makes leaves nothing behind. Smallest fix: an optional `log(name: string)` dep called in the three catches with `error.name` only — never the form, per the gotcha.

**5 — Consider. `codes-closed.png`: the header reads "Open" above "This experiment is closed."** in all six panes. Documented (as-built.md:38) as LAB-10's layout reading the real experiment while the key closes only the tab, but the captured screen contradicts itself and that is the artefact C6 rests on. Smallest fix: register one closed experiment in the fixture registry and point the key at it.

**Cut (polish, no reply needed):** at 390 the table puts Status and Actions behind a horizontal scroll with no visible affordance (`codes-closed.png`, 390 light/dark) — reachable, as the second row of panes shows. `isEmailLabel` treats `ana@example` as an address (`emails-used.ts:20`). The evidence headers record 473 and 249 tests where the TAP footers read 388 and 232 (`C1.log:5` vs `:3022`; `C2.log:5` vs `:1523`) — the harness's own count, consistent across both files. `codesStateView` forces `collaborate: true` for every key (`admin-codes-view.ts:237`), which is what makes the Display name column capturable at all.

**Contract gap (for whoever owns the next ticket on this dialog):** no criterion names the client's in-memory drop of the code; C1 stops at the list read and the rendered rows, and C9 — the only walk that touches it — is manual and deferred by design. The strongest line in the non-negotiable has no automated criterion. Worth one when LAB-22 or LAB-25 next opens `code-dialogs.tsx`.

VERDICT: PASS
