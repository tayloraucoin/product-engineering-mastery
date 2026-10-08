# Review — assay on LAB-16

> Written by `yarn review:run assay LAB-16`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 8c1b1605ef1938ac7b89fd2cda1d2c04bde3779008ffee28b115f8092d73367e
- criteria_sha256: 770c82a6452886aacf1fc872b14a362dd0334df30599a7c283d894af20a2f357
- as_built_sha256: 6ee5aec2e8bb7f0215bdebf91cdda875ad90ae82cd3cffb3f176231e6dc016c1
- head: eff9425ea2ce895189537dccb1cc15d59d7a94c8
- runner: claude 2.1.232 (Claude Code) (agent assay; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-08T02:04:15Z
- run: 1 of assay on LAB-16
- tokens_input: 30
- tokens_cache_read: 1699515
- tokens_cache_write: 166994
- tokens_output: 21462
- seconds: 339.2
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run assay LAB-16`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are assay, reviewing ticket LAB-16 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Coverage

| Captured | What |
|---|---|
| Contract, results.json, as-built | read in full |
| Evidence | C1–C9 logs (two distinct runs: `test:db` 9b1a4eaf…, `web test` 3b64d711…), C10 operator note, C11 contact sheet |
| Changed files | all 10 app/lib files, `packages/db/src/sandbox/erasure.ts`, `apps/web/lib/sandbox/admin-data.test.ts`, `packages/db/test/sandbox/erasure.test.ts` |
| Surface | `ux/admin/data.md` (Layout, States, Access, C-LAB-data-1…7) |
| Not inspected | `erasure-cases.ts`, `erasure-fixtures.ts`, `registry.ts`, `fixtures.ts` and the eight other `packages/db/test/sandbox/*.test.ts` files this ticket touched — judged indirectly through the isolation/coverage-guard results in C1.log |
| Unverified by me | C11's per-cell rendering: the contact sheet is 18×6 at ~450px wide per cell; I can confirm every key × viewport × theme is present, not contrast or spacing inside a cell |

Head `eff9425` on every run; the two evidence shas match results.json; no criterion is stale against another.

## Criterion by criterion

- **C1 — met.** `erasure.test.ts:230` deletes reviewers/accesses/views/comments/versions/team notes by slug in one transaction (`erasure.ts:302`), asserts the other slug byte-identical (`rowsOn` before/after), and one `data-deleted` row with exact counts. A second delete writes no second row.
- **C2 — met.** `requireAdmin` is the first statement of `deleteExperimentData` (`erasure.ts:300`); the test rejects a developer, a `"Admin"` string role and an undefined role, and re-reads every row.
- **C3 — met.** Three layers proven: the rule refuses before the registry is read (`admin-data.ts:188`, store call count 0), the action's `{ adminOnly: true }` is pinned by source scan (`admin-data.test.ts:155`), and `deletePanel` → `{kind:"developer"}` with the leaf rendering `<DeleteForm>` only under `panel.kind === "admin"` (asserted, single occurrence).
- **C4 — met, and the strongest evidence in the ticket.** The sweep reads `information_schema` for every `sandbox_%` table and matches each row as text (`erasure.test.ts:89`); after erasing ana it is `{}`, ben's view/comment/version/reply survive on the same code, `emailsUsed` is `[ben]`, and the record row holds counts with no slug.
- **C5 — met.** `erasure.test.ts:475`: the lone-user code is revoked and relabelled; an unticked name label is unchanged and its code stays live; a ticked one becomes "Erased reviewer" without revoking.
- **C6 — met at both halves.** Database half by user id (`erasure.test.ts:535`); app half through the stubbed `findAccountIds`, with `" Ana@Example.com "` normalised before the lookup and the ids never taken from the client (`admin-data.ts:259`). Unknown email → "Nothing is held for that email.", zero erasures.
- **C7 — met.** All four action kinds written, then every row asserted against a secrets list (labels and reviewer emails), `targetEmail` null except the role change, and no erasure row with null counts.
- **C8 — met.** `confirmMatches` is `===`; eight near-miss strings rejected; the server re-checks before the store (call count 0 on mismatch).
- **C9 — met.** `loadReviewerWith` merges typed emails and account emails, a null id gives no-match with the store untouched, the page reads `query.reviewer` and never an email param (source-asserted), nav `ready: true`.
- **C10 — deferred, as the contract allows.** The builder's keyboard walk is detailed and credible; a screen-reader pass by a person has not happened. Correctly recorded `--verdict deferred`.
- **C11 — met.** All 18 `data-*` keys × 390/834/1440 × light/dark present, skeletons pinned with `animate-none`.

## Findings

**1. Should-fix — two reachable reviewer-view states have no `?state=` key, so they are in no capture.**
`erase-section.tsx:320` (`reviewer === null` → the no-match line) and `:321` (a code with no emails → "This code hasn't been used with any email.") are both reachable from `reviewer.md`'s link, and neither is in `DATA_PAGE_STATE_KEYS` (`admin-data-view.ts:375`). `data-page-reviewer` captures only the two-email form. Canon C-P08 / `AGENTS.md` app rule: a state the critic cannot reach is a state that was not built. Smallest fix: add `data-page-reviewer-none` (and reuse `data-page-no-match` for the null case by rendering it through the same fixture), register both in `state.ts`, re-capture those rows.

**2. Should-fix — the partial state removes the delete instead of disabling it.**
`data.md:54` says "The counts that loaded; '—' elsewhere; **delete disabled**". `deletePanel` returns `{kind:"partial"}` and `data-tab.tsx:105-115` renders the paused line with no field and no button, so the control and its reason never appear together. The offline state does it the spec's way (`enabled:false`, control visible), which makes the inconsistency visible in the capture. Smallest fix: render `DeleteForm` with `enabled={false}` for `partial`, keeping the paused line as the reason — or record the deviation in `as-built.md` and amend `data.md`.

**3. Should-fix — record paging drops the `?reviewer=` context.**
`record-table.tsx:42` builds `/admin/data?page=N` only. A person who arrived at `/admin/data?reviewer=<id>` and pages past 50 record rows loses the email list they came to act on (and a `?state=` capture leaves its fixture). Smallest fix: build the href from the current search params with `page` replaced.

**4. Should-fix — `as-built.md:54` contradicts this ticket's own recorded evidence.**
It states `yarn workspace web test` "exits 1 on two tests that LAB-11's commit `9b9f6c1` broke". The recorded run at the same head is green: `C3.log:3022-3025` reads `tests 388 / pass 388 / fail 0`, exit 0, and the gate source-scan suite is present and passing (`C3.log:1995`). At Q3 `results.json` is the ledger and `as-built.md` is read beside it; a stale "Not verified" line invites a reviewer to re-run or re-open. Smallest fix: delete the paragraph, or restate it as "an earlier run exited 1; fixed by LAB-11 before `eff9425`".

**5. Consider — the offline line is a live region that is mounted at the moment it has something to say.**
`data-tab.tsx:95` and `erase-section.tsx:216` render `<p role="status">` only when offline; a region inserted with its content is commonly not announced. Two lines below, the no-match line gets this right with a permanently mounted `<div role="status">` (`erase-section.tsx:254`). Smallest fix: mount the wrapper always and put the text inside it.

### Cut (polish, not worth a round)

- `admin-data.ts:345` computes `ReviewerView.title` and nothing renders it; the reviewer view never names the experiment it came from.
- `record-table.tsx:47` uses a hard-coded `aria-labelledby="record-heading"` where every sibling uses `useId`; safe at one instance per page.
- `app/admin/data/loading.tsx:7` hard-codes `"Data"` instead of `DATA_WORDS.heading`, a second home for one word.
- `as-built.md:25`: C11 was captured against an uncommitted scratch `team.ts`, so the contact sheet cannot be re-run from the committed tree. Declared, and forced by the machine having no Supabase Auth — noted so the next critic does not assume reproducibility.

### Surface gap (for the owner of `ux/admin/data.md`, not scored)

The States table has no row for the reviewer view's empty and not-found forms, which is why finding 1 had no key to land in. It also leaves the find-failed copy to double as "Nothing was deleted. Try again." after a *search*, which the builder flagged as an assumption. Both are worth a line when the proposal is promoted.

Nothing here is Blocking: every non-negotiable holds in the code I read — one transaction per erasure with counts-only records, `requireAdmin` inside `deleteExperimentData`, erasure by access rather than by reviewer, label and "Emails used" scrubbing, exact server-side confirm, and no email in a URL, log or record row.

VERDICT: PASS
