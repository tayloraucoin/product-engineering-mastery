# Pre-flight — LAB

> Written by `yarn review:run vigil LAB` (the Tickets gate). Never edit it: `contract:init` starts a ticket only on its PASS line, and only while the contract's hash still matches.

- head: 79eba019a478c941bb735e00af3e1be8506cc941
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T15:30:55Z

## Verdicts

- LAB-1: PASS (contract 455093e9b6b3)
- LAB-2: PASS (contract dd7b301a78b8)
- LAB-3: PASS (contract 4a749b9c7cde)
- LAB-4: PASS (contract 8545fc5406ee)
- LAB-5: PASS (contract c16754c888bf)
- LAB-6: PASS (contract 8098af8d8466)
- LAB-7: PASS (contract e2bd92ce1431)
- LAB-8: PASS (contract fe0f5a79a7d5)
- LAB-9: PASS (contract 82889a23d711)
- LAB-10: PASS (contract f4e5c1c2c378)
- LAB-11: PASS (contract 67336f650839)
- LAB-12: PASS (contract 3a774eede473)
- LAB-13: PASS (contract 4ede352b0a72)
- LAB-14: PASS (contract 29b80002709a)
- LAB-15: PASS (contract 78f60ffae8ee)
- LAB-16: PASS (contract b200f6d428ae)
- LAB-17: PASS (contract 6225dde7ee8f)
- LAB-18: PASS (contract fee69ed13df0)
- LAB-19: PASS (contract 9ae151ef2548)
- LAB-20: PASS (contract 32a78090a7cb)
- LAB-21: PASS (contract bf680b5055d7)
- LAB-22: PASS (contract d54b22072167)
- LAB-23: PASS (contract 26c6d1df69c9)
- LAB-24: PASS (contract 486ab0003a10)
- LAB-25: PASS (contract a02960cfbc7c)
- LAB-26: PASS (contract 75bec8a93be9)

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil LAB`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, running the Tickets gate's pre-flight for epic LAB in fresh context. Judge only from the files.

Read the brief (specs/web/epics/LAB-experimental-sandbox/brief.md), the approved UX proposals under specs/web/epics/LAB-experimental-sandbox/ux/, specs/web/epics/LAB-experimental-sandbox/technical.md if it exists, and each drafted contract:
- LAB-1: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/contract.md
- LAB-2: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-002-developer-role/contract.md
- LAB-3: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-003-sandbox-data-access/contract.md
- LAB-4: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-004-experiment-registry/contract.md
- LAB-5: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/contract.md
- LAB-6: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/contract.md
- LAB-7: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/contract.md
- LAB-8: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-008-admin-shell/contract.md
- LAB-9: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-009-admin-people/contract.md
- LAB-10: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-010-admin-experiments/contract.md
- LAB-11: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-011-experiment-page/contract.md
- LAB-12: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-012-pins/contract.md
- LAB-13: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-013-pin-list/contract.md
- LAB-14: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-014-team-layer/contract.md
- LAB-15: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-015-admin-access-codes/contract.md
- LAB-16: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/contract.md
- LAB-17: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-017-review/contract.md
- LAB-18: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-018-review-variants/contract.md
- LAB-19: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-019-review-sent/contract.md
- LAB-20: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-020-confirmation-email/contract.md
- LAB-21: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-021-review-ended/contract.md
- LAB-22: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-022-admin-reviewers/contract.md
- LAB-23: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-023-admin-results/contract.md
- LAB-24: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-024-stack-entry-removal/contract.md
- LAB-25: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/contract.md
- LAB-26: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-026-threads-ui/contract.md

For each contract, check: every criterion is testable and names the right evidence type; it cites one surface and the criterion IDs it builds; every state and unhappy path of that surface is covered by this or another ticket; planned paths and depends_on are plausible; nothing is out of the epic's appetite.

Write one line per ticket, exactly in this form, then your findings:
LAB-1: PASS or FAIL, with the reason
LAB-2: PASS or FAIL, with the reason
LAB-3: PASS or FAIL, with the reason
LAB-4: PASS or FAIL, with the reason
LAB-5: PASS or FAIL, with the reason
LAB-6: PASS or FAIL, with the reason
LAB-7: PASS or FAIL, with the reason
LAB-8: PASS or FAIL, with the reason
LAB-9: PASS or FAIL, with the reason
LAB-10: PASS or FAIL, with the reason
LAB-11: PASS or FAIL, with the reason
LAB-12: PASS or FAIL, with the reason
LAB-13: PASS or FAIL, with the reason
LAB-14: PASS or FAIL, with the reason
LAB-15: PASS or FAIL, with the reason
LAB-16: PASS or FAIL, with the reason
LAB-17: PASS or FAIL, with the reason
LAB-18: PASS or FAIL, with the reason
LAB-19: PASS or FAIL, with the reason
LAB-20: PASS or FAIL, with the reason
LAB-21: PASS or FAIL, with the reason
LAB-22: PASS or FAIL, with the reason
LAB-23: PASS or FAIL, with the reason
LAB-24: PASS or FAIL, with the reason
LAB-25: PASS or FAIL, with the reason
LAB-26: PASS or FAIL, with the reason

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

I built the surface × criterion-ID × state matrix from `brief.md`, all 22 approved `ux/` proposals and `technical.md` with its three detail files before opening any contract. I then verified every command, glob, reviewer row and seat the criteria name against the code. The `_preflight.md` on disk is a prior run at head `79eba01`; several contracts have changed since (LAB-7 now carries C11/C12, LAB-8 a `@pem/ui` criterion, LAB-11 and LAB-15 are `medium`, LAB-26 C2 gained a source scan), so I judged fresh and reused none of its verdicts.

LAB-1: PASS — seven tables, cascades, check constraints, the no-reviewer-column rule and the auth-schema guard are each a separate criterion; C1 lands in `packages/db/src/schema/index.test.ts` (declared in planned_paths, and inside `@pem/db`'s `src/**/*.test.ts` glob), C2–C4 in `test/sandbox/` under `test:db`, C5 is `check` on `yarn check-migrations`; `none:` truth_files is right for schema-only work and `depends_on: []` is correct as the graph's root.
LAB-2: PASS — the role constant plus proof that both surviving admin-only checks still refuse a developer; `APP_ROLES = ["user","admin"]` at `rls.ts:15` is as cited, and C1–C5 each land in a suite that exists (`@pem/auth` and `@pem/api` both run `src/**/*.test.ts`); no policy twin, per R3.
LAB-3: PASS — the isolation suite with a coverage guard that fails an unregistered export is the right shape for door 4; C5 proves the `web-sandbox` element through `yarn test:boundaries`, and `web-ai-route` is really the first element in `boundaries.js`, so "listed before `app-web`" is buildable as written; the gate group's "ids, versions and flags only" is a criterion, not a hope.
LAB-4: PASS — config validation, the London close-date edge at 23:30 UTC, the region markers and the team-gated `?state=` reader are each binary; moving `state.ts` here before the parallel waves is sound sequencing and makes every later writer a descendant of its creator.
LAB-5: PASS — C4's throwing database stub turns "no read before the cookie verifies" into a test; generated inputs cover normalisation both ways; C7 is now a source scan rather than an import of `next.config.ts`, which is the only way it could run; C8 uses the one script that catches bundle planting and `turbo.json`/`.env.example` drift.
LAB-6: PASS — thresholds, HMAC-only keys, global keying, the concurrency case and row expiry are each proven; C7 is honestly `manual` with a stated reason and Taylor's dated condition, not a claimed test. See Consider 5 on its single reviewer.
LAB-7: PASS — cites `gate.md` alone, builds all nine of its criterion IDs, carries `gate-server-error` in C2, and now closes both gaps the shape left: C11 tests the experimental layout's `robots` metadata and C12 records the served-HTML diff for a real and an unknown slug. `operator_review: true` puts the first surface a client meets in front of Taylor.
LAB-8: PASS — all seven shell criteria built; C6's source scan for `requireTeamPage`/`requireTeamAction` is the right guard against a page trusting the layout, and C9 now runs in `@pem/ui`'s own suite, which exists and will pick up a story in the declared sidebar folder. See Should-fix 2.
LAB-9: PASS — the last-admin guard is proven inside the action under an advisory lock (C4), not only in the UI; C1 asserts the other `app_metadata` keys survive and that the nav's People entry becomes a link; the first-admin script has its own stubbed-API criterion landing in `@pem/db`'s `scripts/**/*.test.ts` glob.
LAB-10: PASS — stats are numbers-and-one-date only with a reviewer viewer refused (C5), the London day-count edge is C6, and the unknown-slug 404-before-read is C7 against a throwing stub. See Should-fix 1.
LAB-11: PASS — the draw is proven uniform (C3) and stable under a concurrent first visit (C2), C5's throwing stub proves no team view is written, and all nine `exp` criterion IDs are built; `medium` now matches the work. See Should-fix 3 on C4's first clause.
LAB-12: PASS — queue identity, one row per id, cross-design anchor resolution, the 500 and 2,000 limits and the closed/revoked freeze each have a criterion; this is the epic's riskiest slice and the queue contract is the part that has to be exactly right, which C3 and C4 pin.
LAB-13: PASS — no new query or action, and the unhappy paths that matter (partial retry, focus after delete) are tests rather than captures; C4 is the one that stops Retry overclaiming. See Should-fix 3 on C2 and C5.
LAB-14: PASS — C4 proves no reviewer read or count returns a team note, C6 proves the team cannot touch a reviewer's row, C8 proves no view is written, and all seven team criterion IDs are built.
LAB-15: PASS — "in clear only in the one response" is C1, replace-in-place keeps the reviewer's rows (C3), closed refuses make and replace against a throwing stub while revoke stays open (C5), revoke and replace scope by slug and reviewer id together, and assay is on the dialog-heavy surface; `medium` now matches.
LAB-16: PASS — erasure by access with the two-email, two-slug case (C4), the label and "Emails used" scrub (C5), the record sweep (C7) and the nav-link assertion (C9) cover D-LAB-26 to D-LAB-28 properly; the admin-only delete is refused inside the function (C2), not only in the page; the Build-notes cross-reference to C4's sweep is now correct.
LAB-17: PASS — server-side judging of core v1, version idempotency and numbering, "queued pins first" and the goal-fit-before-pins rule are each tests; the `questionnaire.tsx` assumption was checked at a named commit and resolved rather than left open.
LAB-18: PASS — order is a deterministic hash proven unbiased and stable (C3, C10), nothing pre-selected (C4), the unviewed-design lock is C5, and the changed-after-choosing flag is stored per design (C6).
LAB-19: PASS — the injected email result keeps a failed email from reading as a failed review (C3), the bound stub returns `failed` until LAB-20 lands so no page claims an email that never went, and C5 bars the word "version".
LAB-20: PASS — C3 proves no answers, title, code or email in any URL, C5 pins BST and GMT formatting independent of the process zone, C6 keeps a thrown mailer from undoing the version; depends on LAB-19's seam as declared.
LAB-21: PASS — reachability is fenced from both sides (C1, C2), and the queue and draft cleanup is scoped to one slug with malformed and throwing storage handled; the five renderable `ended` keys match the UX file's own N/A markings.
LAB-22: PASS — `depends_on` carries LAB-14 and LAB-15 beside LAB-10 and LAB-17, so `emails-used.ts` and `client/team-layer.ts` are both ancestors of the ticket that edits them; C5 proves a reviewer id from another slug returns null, and C4 proves no email reaches a URL. See Should-fix 1 and Consider 6.
LAB-23: PASS — the reading rules are a pure module with the threshold as one constant, C2 and C3 pin the two ways a percentage could overstate (under 10, across wordings), C6 keeps team notes out of every count, `tally` is a real seat, and `operator_review: true` puts the surface the brief's metric rests on in front of Taylor. See Should-fix 1.
LAB-24: PASS — the runbook is proven end to end in a throwaway worktree, the edit list is built from the code rather than copied from contracts, the `sandbox_actions` warning precedes the drop, and it declares all 23 beat-1 predecessors. Its `dependencies: []` reads correctly against `toolkit.json`, where that field is the package list, not part ordering; the brief's "depends on db, auth and email" is met by the removal-order row.
LAB-25: PASS — the widening lives in LAB-3's one scope helper, both modes are crossed in the isolation suite, the removed-root case is C5, and "no migration in beat 2" is a non-negotiable; depending on LAB-24 is how S31's "after beat 1 passes" is encoded.
LAB-26: PASS — door 8's words are verbatim, `threads.md`'s remaining three criterion IDs are built here, and C2 now pairs `noticeDue` with a source scan proving the notice branch mounts nothing and calls no action, which is what makes the door-8 promise provable rather than asserted.

## Findings

**Blocking**

None. I walked every shared file in the cut — `state.ts`, `[slug]/page.tsx`, `actions.ts`, `review-bar.tsx`, `admin-nav.ts`, `validators.ts`, `registry.ts`, `sandbox/index.ts`, `viewer.ts`, `comments.ts`, `team.ts`, `review.ts`, `isolation.test.ts`, `emails-used.ts`, `client/team-layer.ts`, the four `_components/` trees, `packages/db/package.json`, `rls.ts`, `boundaries.js`, `next.config.ts`, `toolkit.json` — and every writer is a proper descendant of its file's creator, with no cycle. Every placeholder a ticket leaves behind (LAB-7's experiment and ended branches, LAB-8's experiments page and two `ready: false` entries, LAB-10's results page, LAB-17's sent slot, LAB-19's stubbed confirm) names a replacing ticket inside the cut, and both nav flips are asserted (LAB-9 C1, LAB-16 C9), so beat 1 ends with none surviving. All 18 surfaces' criterion IDs are built: gate 1–9 (LAB-7), exp 1–9 (LAB-11), pins 1–9 (LAB-12), list 1–7 (LAB-13), team 1–7 (LAB-14), review 1–10 (LAB-17), variants 1–9 (LAB-18), sent 1–4 (LAB-19), email 1–5 (LAB-20), ended 1–7 (LAB-21), shell 1–7 (LAB-8), people 1–6 (LAB-9), expts 1–6 (LAB-10), codes 1–7 (LAB-15), data 1–7 (LAB-16), reviewer 1–5 (LAB-22), results 1–8 (LAB-23), threads 1–6 (LAB-25) with 7–9 (LAB-26). Every criterion names an evidence type its mechanism matches, and every command exists: `yarn workspace {web,@pem/db,@pem/auth,@pem/api,@pem/ui} test`, `@pem/db test:db`, `web lint`, and the root `test:boundaries`, `check-migrations`, `check-client-bundle`, `check-stack`, `lint:docs`, `check-refs`. Each contract cites exactly one surface file, so no `waiver:` is owed, and every decision and criterion ID it cites is present in that file — the condition `check-specs` enforces at lines 1311–1316. No contract exceeds seven non-negotiables. Every path-based reviewer row in `toolkit.json` is satisfied (`**/schema/**`, `**/migrations/**`, `boundaries.js`, `packages/*/package.json` all carry mason), and no ticket touches `apps/*/app/api/**`. No Q3 draft needs a `review:<role>` criterion: `contract:init` adds those (`tooling/contract.ts:866`).

**Should-fix**

1. **Four tickets add functions to the one module the epic's residual risk rests on, with neither mason nor warden reviewing.** `technical.md`'s door table assigns door 4 (`packages/db/src/sandbox/**`) to mason and warden, and notes that no `toolkit.json` row matches that glob, so "the Tickets stage names these reviewers by hand". LAB-10 (`listExperimentStats`), LAB-21 (`latestSentAt`) and LAB-22 (`listReviewers`, `readReviewer`) are `reviewers: [assay]`; LAB-23 (`readResults`) is `[assay, tally]`. LAB-22's `readReviewer` returns a reviewer's emails used and every version's answers; LAB-23's `readResults` returns every reviewer's answers. Isolation here rests on the module rather than RLS — that is the accepted residual risk on the record (R2) — and assay is the UI critic. The mitigation is real and I weighed it: each of the four carries its own isolation criterion (LAB-10 C5, LAB-21 C5, LAB-22 C5, LAB-23 C8) landing in LAB-3's coverage-guarded suite, which fails any export with no registered case. So the mechanism catches an unregistered function whoever reviews. But reviewer assignment is the operator's confirmation, not mine, and this is the one place where the cut is thinner than the technical stage asked for by hand. One line from Taylor either way.

2. **LAB-8's C9 is runnable, but only through a story, and the contract does not say so.** `yarn workspace @pem/ui test` is `vitest run --config .storybook/vitest.config.ts`, whose `include` is `[".storybook/**/*.test.ts"]` (verified) — it runs `stories.test.ts` and `story-coverage.test.ts` over every story, in jsdom. A plain unit file under `src/` would not be collected. The declared paths do allow the right route (`packages/ui/src/primitives/navigation/sidebar/**` holds `sidebar.stories.tsx`), so C9's statement — the default stays 768px and moves to 1024px only where the option is passed — is provable as two stories with no new file and no config change. Worth one line in the Build notes naming that seam, so the builder does not reach for the config instead. The criterion itself is right to exist: it is the difference between a backward-compatible option and a silent 256px shift for every other consumer of a shared primitive.

3. **Three `test` criteria still state a rendered or interaction-level fact that the named command cannot settle.** `yarn workspace web test` is `node --test "lib/**/*.test.ts"` (verified, `apps/web/package.json:12`) and the app has no DOM runner, no jsdom and no testing library. The contracts are mostly explicit that a pure module carries the logic and a `manual` criterion carries the real path, which is the right design — LAB-8 C6 and LAB-26 C2 show the sanctioned route of pairing the statement with a source scan. Three remain where a recorded PASS would say more than it knows: **LAB-11 C4** ("A switch shows the new design with no request before paint" — the clamp, the log and the announcement are provable from `client/switcher.ts`; "before paint" is not, and its real proof is a Build-notes DOM check in the as-built), **LAB-13 C2** ("puts focus inside that pin's popover" — proven by `showOnPagePlan`, with the real focus path deferred to C8) and **LAB-13 C5** ("focus goes to the next item" — `focusAfterDelete`). Either name the seam in the statement or point the clause at a scan, as LAB-8 and LAB-26 do.

4. **LAB-8 is the only authorization surface in the cut below Q3 — flagged once, as the brief asks.** LAB-1, 2, 3, 5, 6, 7, 9, 15, 16 and 25 are Q3. LAB-8 — which decides who reaches `/admin`, whether a page may trust the layout, and whether a stranger learns `/admin` exists — is Q2, and it also edits a shared `@pem/ui` primitive. The brief flagged "the role list" for Q3 and `qa-levels.md` puts auth there. Related, and weighed lower because the operator's default for this epic was Q2: LAB-11, 12, 17, 22 and 23 read or write reviewers' personal data at Q2. The level is the operator's call and the rule is flag, not block; this is the once.

5. **The arithmetic does not fit the 5-day appetite.** The cut is 24 beat-1 tickets against Mason's "roughly 16 half-day tickets … two parallel waves". Seventeen beat-1 tickets read `small` and seven `medium` (LAB-9, 11, 12, 15, 16, 17, 23), which is 12 to 22 days serially; holding 5 days needs roughly three to four sustained parallel lanes, not two. The two sizes raised since the last pre-flight (LAB-11, LAB-15) were raised honestly and make the arithmetic worse, not better — that is the right trade. Nothing here is out of scope: I checked every pinned item (CSV export, email verification, creating experiments in the UI, a team email per submission, analytics, pin screenshots, resolve or status on pins, the developer/admin split, code expiry, the scheduled purge) and both Out items (random A/B assignment, comments on product pages), and none is built; LAB-10, LAB-16, LAB-20 and LAB-23 each name their nearest pinned neighbour as out of bounds. The appetite risk is arithmetic, not scope, and it should be said now so Mason's day-3 checkpoint ("the cut is Taylor's call") fires against the real number.

**Consider**

6. **LAB-6 carries one reviewer on a door-3 glob.** `technical.md`'s door table lists door 3 (which includes `apps/web/lib/sandbox/**` and ratification R8, the throttle) as warden and mason; LAB-6 is `reviewers: [warden]`. The brief's own QA table — the operator's instruction — says "Warden on the gate and codes", so this follows it, and I am not contradicting the operator. Noting the difference once so it is a choice rather than a drift.

7. **Three tickets widen `data-contract.md`'s "URL: the path, `?state=` and the link's `?r=` only" line, each under its own marker** — LAB-11's `?design=` and `?from=` (`[ASSUMPTION]`), LAB-22's `?reviewer=` on an `/experimental/` address (`[PROPOSED]`), LAB-23's link to `?design=`. The readings are defensible (no identity data; R6 already ratified `?reviewer=` under `/admin/data`, and none of these addresses is handed out in mail, so door 7's concern is not engaged). But one as-built should amend the line rather than leaving three tickets arguing past each other.

8. **I cannot verify the 2,500-token contract cap.** `CONTRACT_TOKEN_CAP = 2500` in `tooling/lib/specs.ts:45` counts the frontmatter plus the Build notes, and `check-specs` is the arbiter; I have Read, Grep and Glob only. By eye, LAB-5, LAB-7, LAB-9, LAB-11, LAB-12, LAB-16, LAB-17 and LAB-23 are the longest and some may straddle it. If one trips, thin the Build notes, which are advisory, and never a criterion.

9. **LAB-12 and LAB-26 invent reviewer-facing copy the UX files lack** — a failed-delete toast ("Comment 3 wasn't deleted. Try again."), "1 comment sent." (LAB-13), "A reviewer" for a missing display name, and focus placement after Continue — each flagged for assay. Flagging beats silence, but these are strings a reviewer reads in an error path; Gloss settles them faster before assay's review than after.

## Conversations

**The network throttle ships half-verified, and nothing in the cut carries the condition that ends it.** LAB-6's C7 — that Vercel's first `x-forwarded-for` hop is really the client — is `manual` and deferred because no staging project exists, with Taylor's dated condition in the reason: confirmed on the first deploy, before any real code is issued. That is the right shape, and the design degrades honestly: the per-browser limit of 5 holds on day one, the per-network limit of 30 rests on the assumption, and the gate's words deliberately avoid "from this browser" so neither case misleads. The open question is only sequencing. The condition binds whoever runs the first deploy, but the contract reason closes with the ticket, and LAB-24's runbook is about removal, not first deploy. If it would help, it belongs as a line in the first-deploy step rather than in a ticket that will be archived.

**Two surfaces now have Taylor's own eyes on them, and I think they are the right two.** `operator_review: true` on LAB-7 and LAB-23 covers the gate a client meets before anything else and the Results page the brief's metric turns on ("Taylor picks a direction from `/admin` alone"). The other twenty-odd surfaces close on captures and assay's review, which is a defensible ration of attention for a 5-day batch and not something I would file as a finding. The one I would keep half an eye on is `review.md` plus `review-variants.md`: it is the longest thing a reviewer touches, on a phone, in minutes, and its failure mode is silent abandonment rather than an error anyone sees.

**Credit where it is due.** LAB-4's C6 makes every non-gate sandbox state key render only for a team viewer, and LAB-7's C6 proves the same rule from the gate's side. Without that pair, the repo's own "every state reachable by `?state=`" rule (C-P08) would have handed a code-holder a way to render fixtures of other people's surfaces. Both contracts prove it rather than asserting it. In the same spirit, the throwing-database-stub pattern (LAB-5 C4, LAB-7 C2, LAB-10 C7, LAB-11 C5, LAB-14 C8, LAB-15 C5, LAB-16 C3, LAB-17 C8) turns "no read happened" from a claim into a test — the hardest class of thing to prove and the easiest to assert — and LAB-3's coverage guard, which fails an export with no registered isolation case, is the only mechanism in the cut that catches a leak nobody thought to look for. Finally, LAB-7's `out_of_scope` line putting a real, monitored `contact.email` on the operator before any real code is issued closes the one gap I would otherwise have raised about the erasure notice: the address a reviewer is told to write to is `hello@example.com` today (verified, `packages/brand/src/brand.ts:27`).

VERDICT: PASS
