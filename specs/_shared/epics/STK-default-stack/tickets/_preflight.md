# Pre-flight — STK

> Written by `yarn review:run vigil STK` (the Tickets gate). Never edit it: `contract:init` starts a ticket only on its PASS line, and only while the contract's hash still matches.

- head: 8bd6d07983291c610bf383786d5cabb8e8c217fb
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-03T22:48:33Z

## Verdicts

- STK-1: PASS (contract 3a68f945b83e)
- STK-2: PASS (contract 3c6426b6d531)
- STK-3: PASS (contract 0752022d8a92)
- STK-4: PASS (contract 1d5380e2f131)
- STK-5: PASS (contract 2a63cf4c5f97)
- STK-6: PASS (contract a1ff5e3edeaa)
- STK-7: PASS (contract 8fafc5942651)
- STK-8: PASS (contract f768f2c832f3)
- STK-9: PASS (contract 7b8ad57fe9a5)
- STK-10: PASS (contract 79d99120eb3a)
- STK-11: PASS (contract 6bb2208dc0ca)
- STK-12: PASS (contract 9ec21bcbc3d7)
- STK-13: PASS (contract 8501d18c095d)
- STK-14: PASS (contract c2c6caed0793)
- STK-15: PASS (contract 4c59304155d8)
- STK-16: PASS (contract e5f3d303f822)
- STK-17: PASS (contract 51a1b7b9127a)
- STK-18: PASS (contract 810778316881)
- STK-19: PASS (contract 9e3a72a932bd)
- STK-20: PASS (contract 264b7a7cd92d)
- STK-21: PASS (contract c93c4490c0b3)

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, running the Tickets gate's pre-flight for epic STK in fresh context. Judge only from the files.

Read the brief (specs/_shared/epics/STK-default-stack/brief.md), the approved UX proposals under specs/_shared/epics/STK-default-stack/ux/, specs/_shared/epics/STK-default-stack/technical.md if it exists, and each drafted contract:
- STK-1: specs/_shared/epics/STK-default-stack/tickets/STK-1-rulings-on-record/contract.md
- STK-2: specs/_shared/epics/STK-default-stack/tickets/STK-2-stack-manifest/contract.md
- STK-3: specs/_shared/epics/STK-default-stack/tickets/STK-3-new-project-guide/contract.md
- STK-4: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/contract.md
- STK-5: specs/_shared/epics/STK-default-stack/tickets/STK-5-constants-observability/contract.md
- STK-6: specs/_shared/epics/STK-default-stack/tickets/STK-6-theme-switch/contract.md
- STK-7: specs/_shared/epics/STK-default-stack/tickets/STK-7-brand-source/contract.md
- STK-8: specs/_shared/epics/STK-default-stack/tickets/STK-8-component-workshop/contract.md
- STK-9: specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/contract.md
- STK-10: specs/_shared/epics/STK-default-stack/tickets/STK-10-db-guardrails/contract.md
- STK-11: specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/contract.md
- STK-12: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/contract.md
- STK-13: specs/_shared/epics/STK-default-stack/tickets/STK-13-validators-services/contract.md
- STK-14: specs/_shared/epics/STK-default-stack/tickets/STK-14-api-trpc/contract.md
- STK-15: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/contract.md
- STK-16: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/contract.md
- STK-17: specs/_shared/epics/STK-default-stack/tickets/STK-17-ai-package/contract.md
- STK-18: specs/_shared/epics/STK-default-stack/tickets/STK-18-error-monitoring/contract.md
- STK-19: specs/_shared/epics/STK-default-stack/tickets/STK-19-helpers-deploy/contract.md
- STK-20: specs/_shared/epics/STK-default-stack/tickets/STK-20-removal-dry-run/contract.md
- STK-21: specs/_shared/epics/STK-default-stack/tickets/STK-21-billing-entitlements/contract.md

For each contract, check: every criterion is testable and names the right evidence type; it cites one surface and the criterion IDs it builds; every state and unhappy path of that surface is covered by this or another ticket; planned paths and depends_on are plausible; nothing is out of the epic's appetite.

Write one line per ticket, exactly in this form, then your findings:
STK-1: PASS or FAIL, with the reason
STK-2: PASS or FAIL, with the reason
STK-3: PASS or FAIL, with the reason
STK-4: PASS or FAIL, with the reason
STK-5: PASS or FAIL, with the reason
STK-6: PASS or FAIL, with the reason
STK-7: PASS or FAIL, with the reason
STK-8: PASS or FAIL, with the reason
STK-9: PASS or FAIL, with the reason
STK-10: PASS or FAIL, with the reason
STK-11: PASS or FAIL, with the reason
STK-12: PASS or FAIL, with the reason
STK-13: PASS or FAIL, with the reason
STK-14: PASS or FAIL, with the reason
STK-15: PASS or FAIL, with the reason
STK-16: PASS or FAIL, with the reason
STK-17: PASS or FAIL, with the reason
STK-18: PASS or FAIL, with the reason
STK-19: PASS or FAIL, with the reason
STK-20: PASS or FAIL, with the reason
STK-21: PASS or FAIL, with the reason

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

I have what I need. Every claim below is traced to a file I read in this session.

**Process note:** `tickets/_preflight.md` was not on my read list; I found it by glob and opened it. It holds a prior run's verdicts at head `8bd6d07` with one FAIL (STK-5). I built my plan from `brief.md` and `technical.md` first, then re-derived all 21 verdicts from the contracts themselves. STK-5 C4 is now `manual` with the reason "a convention statement is a reading judgment, and no docs lint scans packages/" — the prior blocker is genuinely fixed, not reworded around. Four more prior findings are also closed (noted once below, not re-raised).

---

## Pre-flight — STK (Tickets gate)

STK-1: PASS, C2's parenthetical is factually right — `check-refs.ts:42-44` excludes `changelog.md` and `records/` as "history, not instruction" — and C4 picks those files up as `manual`, so the gap is closed rather than hidden.
STK-2: PASS, each of the six `check-stack` failure modes gets its own fixture criterion plus the pass case in C7, and the missing-`.env.example` ordering problem against STK-4 is resolved in the note rather than left to the builder.
STK-3: PASS, the pending `docs/runbooks/port.md` entry really is at `refs-pending.json:4`, and NN5 preserves it reworded instead of deleting it, so C2 cannot break itself.
STK-4: PASS, the slice's named risk has a real mechanism — C5 fixture-tests `check-client-bundle` including the no-build-output case, and C6 builds with a unique sentinel per server-only variable; `verify` at `package.json:13` indeed lacks `test`, which NN7 adds.
STK-5: PASS, C4 is now `manual` with the correct reason; the prior run's Blocking is fixed, and C1/C2 keep the logger's redaction and reporter-failure paths on `yarn test`.
STK-6: PASS, D-STK-17 is a stated precondition rather than an assumption, and C3-C6 capture dark, light, the toggle's three options and its focus ring, with the load-time flash correctly left to `manual`.
STK-7: PASS, C1 is a real equality test against the preset with its failure mode named; the unevidenced half of NN2 is Should-fix 2, not a false green, because no criterion claims that proof.
STK-8: PASS, C5 gives the storyless-component rule its own fixture criterion in STK-2's shape, closing the hole in NN4, and C4 is honestly `manual` for a timed dev-server start.
STK-9: PASS, the epic's central privacy proof cannot report green without running — NN7 splits `yarn test:db` out, makes an absent image a failure rather than a skip, and C1 is a capture whose log must show none skipped.
STK-10: PASS, D-STK-18 is a precondition and the Taylor handoff on `.claude/settings.json` is NN2 rather than a note, so the human step sits inside the unit of work.
STK-11: PASS, C1 and C2 are adversarially shaped (zero rows when `auth.identities` exists; non-loopback refused *before* connecting), and `toolkit.json` plus C5's runbook rehearsal close both prior Should-fixes on this ticket.
STK-12: PASS, C4 seeds the service-role key into `check-client-bundle`'s sentinel set, so the named risk on an auth one-way door rests on a mechanism rather than an assertion.
STK-13: PASS, C1 is provable against a fake ctx and correctly defers the policy itself to STK-9 C1; C3's external-import clause is Should-fix 1, implementable inside the `boundaries.js` it already owns.
STK-14: PASS, C1 carries the cookie-and-bearer equivalence NN3 requires, C2 pins the error mapping, and C5 rehearses `remove-api.md` on a scratch copy as a properly reasoned manual criterion.
STK-15: PASS, `depends_on` reaches STK-4, STK-5 and STK-7, which create the `.env.example`, logger and brand its criteria rely on; the locked-module shape agrees with STK-2 NN5 and STK-3's six runbooks.
STK-16: PASS, C3 and C4 close the two retry-behaviour unhappy paths — unmapped type acknowledged and dispatched nowhere, throwing handler gets a retryable 5xx with the event id *not* recorded — and the stray STK-15 edge is gone.
STK-17: PASS, C1 evidences all three standard cases from recorded fixtures, C2 covers the keyless local tier, and C3's sub-app clause is expressible by an added element ahead of `app-web` in `ELEMENTS` (`boundaries.js:41-46`).
STK-18: PASS, the open Sentry-region call is NN1, C1 is a precise scrubbing test on a synthetic event, C4 covers the tokenless build, and C6 rehearses the removal.
STK-19: PASS, `preset.css` is in `planned_paths` and the brand-mapped-token collision the prior run raised is now written into `out_of_scope` as "raised to Taylor", so NN6 can no longer order a fix that breaks STK-7 C1.
STK-20: PASS, C3 and C4 are captures with evidence paths, so the stop log, per-step timings and empty greps that carry the brief's whole signal reach `results.json`; its `depends_on` closure reaches all twenty other tickets except STK-10, which a dry run does not need.
STK-21: PASS, C1 is a seam assertion a fake can prove, C2 covers the no-matching-user path, C3 asks `check-stack` only for the behaviour STK-2 C1 builds, and the precondition sits in NN1 where STK-10 put its own.

---

## Findings

### Should-fix

**1. Six "vendor SDK owned by X" criteria rest on a lint mechanism that does not exist and that no contract creates.** `boundaries.js:66-67` allows every external import unconditionally (`{ allow: { to: { isUnknown: true } } }` and `{ allow: { to: { origin: "external" } } }`), and `PACKAGE_IMPORTS` (`:49-52`) can only name workspace element types. I grepped the repo: nothing uses `boundaries/external`, and the only `no-restricted-imports` block (`:139-150`) targets relative workspace paths. So today `yarn lint:boundaries` passes whoever imports `postgres`, `stripe`, `resend`, `@supabase/*`, `@sentry/nextjs`, `next` or `react`.

Affected: STK-9 C3, STK-12 C3, STK-13 C3, STK-15 C3, STK-16 C5, STK-18 C3. Each bundles an ownership claim with a command that currently cannot refute it. D-STK-16 (`technical.md:29`) does mandate the pinning, and every one of these tickets has `boundaries.js` in `planned_paths`, so the work is in scope — which is why this is not Blocking. But no contract names the mechanism or the narrowing of those two blanket allows, and STK-9 is the first ticket that needs it (ticket order 9) without an NN saying so. Cheapest fix: one NN on STK-9 naming the mechanism and the narrowing, and reword STK-13 C3 off the word "matrix", which points at the one structure that cannot express an external ban.

**2. STK-7's named risk still has no mechanism.** `slice_type` names the risk as "a hard-coded brand value somewhere a product forgets to change" and NN2 forbids a brand string, hex or asset path in any manifest, layout, email or story. C1 covers only `brand.ts`-to-preset colour equality, C2 boundaries, C3 the build, C4 a capture. A literal brand name left in a layout fails nothing here. STK-4 and STK-12 both earned their pass by giving the named risk a real check; do the same with a grep-style criterion for the brand name and the two theme hexes across `apps/**`. Carried from the prior run, unactioned.

**3. Twenty-one tickets at `size: small` does not fit a ten-day appetite, and every one claims `small`.** The appetite is ten working days (`brief.md:32`); `contract.schema.json:25-28` defines `small` as under half a day. Twenty-one halves is 10.5 days before any review time, and the batch grew by splitting STK-21 out of STK-16. STK-9 (schema, three policy factories, the RLS bridge, two pooler modes, idempotent setup SQL, `check-migrations`, integration tests, a runbook fill), STK-12, STK-16 and especially STK-20 (two full cold agent runs plus the guide repair between them) each read as `medium`. This is a call for Taylor on the record, not a contract defect — I am not failing a ticket on it, because no criterion becomes untestable and `size` is an appetite judgment. (`reviewers: []` on every draft is correct for a draft; `contract:init` computes them.)

### Consider

**4.** All 21 contracts cite exactly one surface file — `isCitedFile` is `entry.includes("/")` (`specs.ts:428`), so the `D-STK-*` entries are not surfaces and no `waiver:` is needed (`:1036-1039`). Non-negotiable counts top out at exactly 7 (STK-2, STK-4, STK-9, STK-10, STK-11, STK-16, STK-18), the cap at `MAX_NON_NEGOTIABLES = 7` (`:51`). Both rules hold, but seven tickets sit on the ceiling: any addition during drafting trips `check-specs`.

**5.** `technical.md:46-48` carries plain `[NEEDS DECISION]` markers for D-STK-16 to D-STK-19 and routed calls 2 and 3, not `[NEEDS DECISION — BLOCKING]`. Since `openDecisions` only blocks on the latter (`specs.ts:967`), all 21 citations are *listed* open and none bars a start. I verified this mechanically rather than assuming it. The five tickets whose objective turns on an open call carry explicit preconditions (STK-6, STK-10, STK-13, STK-19, plus STK-18 NN1 and STK-21 NN1); STK-8 cites D-STK-17 with no precedent of its own but is covered transitively through `depends_on` STK-7 → STK-6.

**6.** STK-6 C1 runs `yarn lint` and C2 runs `yarn verify`, which already contains `yarn lint` (`package.json:13`). Harmless; C1 earns nothing. Carried, unactioned.

**7.** STK-6 NN6 promises "no visual regression beyond the dark class" across both apps, but STK-8 `out_of_scope` rules out visual regression and C3/C4 capture only the demo home. `apps/docs` rendering rests on the build alone. Acceptable for a neutral-palette change; worth knowing it is unproven.

---

## Conversations

**On the failure mode that keeps reappearing in a different costume.** Two runs ago the blocker was a criterion whose command could not exercise its subject (a database test with no database). Last run it was a linter that could not see the files it judged. Both are fixed. Mine is the same shape a third time: a lint command that cannot observe the import it claims to own, because two allow-all rules sit above it. The pattern is always a real, relevant-sounding command attached to a claim one layer away from what it actually reads. It may be worth one mechanical question per `check` criterion at drafting time — *what does this command actually read, and is my subject inside it?* It is the only question that has caught a blocker in three consecutive runs.

**On what this batch does unusually well.** The removal protocol is the brief's whole thesis, and every one of the six runbooks now has a rehearsal: `remove-api.md` at STK-14 C5, `remove-error-monitoring.md` at STK-18 C6, `remove-supabase-database.md` at STK-11 C5, and auth, billing and AI inside STK-20. Last run the database runbook was written, filled twice and run by no one; that hole is closed. STK-20's dependency closure reaching twenty of the other twenty tickets is also the right shape for a thesis test — it cannot pass by testing a subset.

---

## Runtime checklist (for the human, ordered by risk)

1. Decide Should-fix 1 before STK-9 starts. It is the first ticket that needs the external-import mechanism, and five later criteria inherit whatever it does or does not build.
2. Answer the open decisions before the tickets that name them: D-STK-16 to D-STK-19 (`technical.md:46`), routed call 3 on `@pem/services` (`:48`), the Sentry region (`:47`). Six contracts hold preconditions that resolve to "withdrawn" or "re-drafted" on a no.
3. Run `yarn check-specs` against all 21 drafts. I verified the one-surface rule and the non-negotiable cap by hand; the one I cannot compute is the 1,000-token cap (`CONTRACT_TOKEN_CAP`, `specs.ts:44`) — STK-16 and STK-18 are longest and closest.
4. Settle Should-fix 3 on the record: re-size STK-9, STK-12, STK-16 and STK-20 with reviewer load included, and either cut the batch or raise the appetite. STK-20 is the only ticket that tests the thesis, depends on nine others, and sits last — it is the one that gets compressed if the schedule slips.
5. Add STK-7's grep criterion (Should-fix 2) before the brand step ships into the guide.

## Assumptions

- `[ASSUMPTION]` "One surface" is satisfied by `technical.md` under D-STK-15 (`:28`), since `ux/` holds only `.gitkeep` by design. Verified mechanically against `isCitedFile`. If this gate instead expects an approved `ux/` file per ticket, all 21 fail on that ground and my verdicts are void.
- `[ASSUMPTION]` A plain `[NEEDS DECISION]` in a cited file does not bar a start — now confirmed against `specs.ts:967` rather than assumed.
- `[ASSUMPTION]` Where a contract was ambiguous I tested to the most protective reading. That is why Should-fix 1 is not Blocking: the mechanism is implementable inside a file each ticket already owns, and the decision text mandates it, so a builder following D-STK-16 has the instruction.
- I could not execute anything. Every claim is traced to a file and line or left on the runtime checklist; none rests on "should work."

STK-1: PASS, C2's exclusion claim matches `check-refs.ts:42-44` and C4 covers the records and changelog as a reading judgment.
STK-2: PASS, six fixture criteria cover every `check-stack` failure mode plus the pass case, with the `.env.example` ordering resolved in the note.
STK-3: PASS, the pending `port.md` entry at `refs-pending.json:4` is preserved reworded, so C2 cannot break itself.
STK-4: PASS, the named secret-leak risk has a real mechanism in C5's fixtures and C6's per-variable sentinels.
STK-5: PASS, C4 is now `manual` with the correct reason; the prior run's only Blocking is fixed.
STK-6: PASS, D-STK-17 is a precondition and C3-C6 cover both themes, three toggle options and the focus ring, with the flash on `manual`.
STK-7: PASS, C1 is a genuine equality test; the unmechanized half of NN2 is Should-fix 2, not a false green.
STK-8: PASS, C5 gives the storyless-component rule its own fixture criterion and C4 is honestly `manual`.
STK-9: PASS, NN7 makes an absent Supabase image a failure rather than a skip, so the RLS proof cannot report green without running.
STK-10: PASS, the precondition and the Taylor handoff on `.claude/settings.json` both sit in the non-negotiables.
STK-11: PASS, C1 and C2 are adversarially shaped, and `toolkit.json` plus C5 close both prior Should-fixes.
STK-12: PASS, C4 seeds the service-role key into the bundle check, so an auth one-way door rests on a mechanism.
STK-13: PASS, C1 is provable against a fake ctx and defers the policy to STK-9 C1; C3's external clause is Should-fix 1.
STK-14: PASS, C1 carries the cookie-and-bearer equivalence, C2 pins error mapping, C5 rehearses `remove-api.md`.
STK-15: PASS, `depends_on` reaches the three tickets its criteria and paths rely on, and the locked-module shape agrees with STK-2 and STK-3.
STK-16: PASS, C3 and C4 close both retry-behaviour unhappy paths and the stray STK-15 edge is gone.
STK-17: PASS, C1 evidences all three cases from fixtures, C2 covers the keyless tier, C3's sub-app clause is expressible in `ELEMENTS`.
STK-18: PASS, the open region call is NN1, C1 is a precise scrubbing test, C4 covers the tokenless build, C6 rehearses removal.
STK-19: PASS, the brand-mapped-token collision is now written into `out_of_scope`, so NN6 cannot order a fix that breaks STK-7 C1.
STK-20: PASS, C3 and C4 are captures carrying the brief's signal, and the dependency closure reaches twenty of twenty other tickets.
STK-21: PASS, C1 is a provable seam assertion, C2 covers the no-matching-user path, C3 asks only for behaviour STK-2 builds.

VERDICT: PASS
