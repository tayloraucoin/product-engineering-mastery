# Review — vigil on STK-4

> Written by `yarn review:run vigil STK-4`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: db07be97c45119b2c225fa5d746d1be093caf2258b16bc12bda576e1db822d2b
- as_built_sha256: 35661d08540697a80b9ab41bd6b2ecfcd9b5efad141be7248cba3ba76cd9834a
- head: 4561b04bcb7302b92dfc376dbbec4421ff576eb9
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T05:09:54Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-4`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-4 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/evidence/C1.log (sha256 dd89447e843c)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/evidence/C2.log (sha256 1c7a31534a56)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/evidence/C3.log (sha256 74dc735048de)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/evidence/C4.log (sha256 0465bb05625e)
   - C5 test: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/evidence/C5.log (sha256 05c31001ca72)
   - C6 check: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/evidence/C6.log (sha256 3906de98cd26)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, AGENTS.md, apps/web/env.ts, apps/web/next.config.ts, apps/web/package.json, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, package.json, packages/config/eslint/boundaries.js, packages/env/eslint.config.mjs, packages/env/package.json, packages/env/src/key-mode.test.ts, packages/env/src/key-mode.ts, packages/env/src/next-public.test.ts, packages/env/src/next-public.ts, packages/env/src/pick.test.ts, packages/env/src/pick.ts, packages/env/src/site-url.test.ts, packages/env/src/site-url.ts, packages/env/src/tier.ts, packages/env/tsconfig.json, tooling/check-client-bundle.test.ts, tooling/check-client-bundle.ts, tooling/fixtures/client-bundle/clean/static/chunks/app-synthetic.js, tooling/fixtures/client-bundle/empty/static/README.md, tooling/fixtures/client-bundle/leak/static/chunks/app-synthetic.js, tooling/fixtures/client-bundle/registry/env.example, tooling/fixtures/client-bundle/registry/turbo.json, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Review — STK-4 env-module (vigil, fresh context)

**Verdict: Pass with conditions.** No Blocking finding. Three Should-fix items, five Consider; all are documentation parity, contract hygiene or future-coverage notes, none of them a defect in the shipped seam.

What I could not exercise, stated up front: I have Read/Grep/Glob only. `.env.example` sits in a permission-denied directory, so I verified its contents **indirectly** (see C6 below) and **cannot** verify the "comment saying what breaks without it" half of non-negotiable 6. I cannot run git, so I cannot independently confirm no planned path moved after head `c5eb5db`; I judged the recorded evidence against the files as they stand, and they agree.

---

### Criterion by criterion

**C1 — the picker across tiers and the unsuffixed fallback. Met.**
`pick.ts:36-42` resolves tier-suffix first, unsuffixed second, `undefined` third, with `present()` (`pick.ts:29-30`) treating whitespace as absent. `SUFFIX.production = ""` (`pick.ts:13-17`) is what makes "production never reads a suffixed value" structural, not incidental. The six tests in `pick.test.ts` assert exactly the criterion's four clauses plus the suffix grammar and the `local` default; `pick.test.ts:55-64` is the one that matters most and it is a real assertion (`undefined`, not a truthy check). Evidence `C1.log:140-175` shows tests 7-12 passing at exit 0. Verified in code and in the log.

**C2 — mode/tier mismatch fails, naming the variable. Met, with the scope the contract set.**
`key-mode.ts:33-41` orders the branches so an unrecognised prefix fails first — a mode the guard cannot read is not one it can vouch for, which is the user-protective reading and the right one. `key-mode.test.ts` covers live-on-local, live-on-staging, test-on-production, matching modes, and no-prefix across all three tiers, each asserting the message *starts* with the variable name (`key-mode.test.ts:16-18, 33-35`). `C2.log:15-34` confirms. The guard is not yet wired into `env.ts`; the contract puts Stripe variables out of scope ("they arrive with their tickets", `contract.md:46`), and the as-built says so plainly (`as-built.md:42`). Correctly scoped, not a gap.

**C3 — boundaries pass with `@pem/env` below every reader. Met.**
`boundaries.js:55-60`: `env: ["config"]`, `db: ["config", "env"]`, apps get every package type (`boundaries.js:72, 129`). `env` can reach nothing but `config`, and the default is `disallow` (`boundaries.js:196`), so an undeclared edge fails by construction. `C3.log` is exit 0 with empty output, which is what a clean eslint run looks like.

**C4 — types pass across apps and packages. Met.** `C4.log:22` — 5 of 5 tasks, exit 0. Fully cached, which is legitimate for a type check at a fixed head.

**C5 — the bundle check fails a planted fixture chunk and fails with no build output. Met, and the test is honest about both failure shapes.**
`check-client-bundle.test.ts:29-37` asserts exit 1 *and* that the output names both the variable and the chunk path. `:39-49` covers the two distinct "nothing to scan" cases — missing directory (`check-client-bundle.ts:122-123`) and a directory with no JavaScript (`:126-129`) — which is the difference between "clean" and "proved nothing." `:60-64` refuses a scan with no sentinel. `C5.log:8-33` confirms tests 1-5 at exit 0.

**C6 — the full chain passes; the sentinel build finds nothing browser-facing. Met, and this is the strongest evidence in the ticket.**
`C6.log:497`: 9 server-only values, none in 25 browser-facing files under `.next/static` and `.next/server/app`. The 9 reconcile exactly to the two registries (3 `EXAMPLE_API_KEY` forms from `.env.example`, 6 `DATABASE_*` forms from `turbo.json:15-20`), which is my indirect confirmation of what `.env.example` declares.

Two things raise this above a passing checkbox. First, the negative control (`evidence/C6-control-leak.txt`) shows the scanner actually firing on a real leak through four prerendered artifacts — a green check from an instrument never seen to go red is not evidence, and the builder closed that hole. Second, the scan deliberately covers prerendered `.html` and `.rsc` (`check-client-bundle.ts:200`), which is where a Server Component actually leaks, not a chunk. I also checked the cache-blindness failure mode: the sentinel build runs `yarn workspace web build` directly (`:187`), bypassing turbo, so it cannot be silently satisfied by a cache hit.

Non-negotiables 1, 2, 3, 5 and 7 all hold against the code: `parseTier` defaults to `local` and never to production (`tier.ts:22-29`); nothing under `packages/env` reads `process.env` and its own lint rule rejects a read (`eslint.config.mjs:9-18`); `apps/web/env.ts:26-33` is the app's only reader (grep across `apps/` returns that file and nothing else); `resolveSiteUrl` returns the local origin whenever `deployed` is false (`site-url.ts:21`); `verify` runs both `yarn test` and `yarn check-client-bundle` (`package.json:13`).

---

### Findings

**Should-fix — `as-built.md:10` contradicts the evidence it cites.** It says "Its last run planted 3 sentinels and found none in 25 files." `evidence/C6.log:497` records **9** server-only values in those same 25 files. The 3 predates the plant-from-both-registries change the as-built itself describes at `:38`. The as-built is the durable record; a reader reconciling it against the log finds a number that does not match. One-line fix. Owner: builder.

**Should-fix — `turbo.json` and `.env.example` are out of parity on the branch now.** `turbo.json:15-20` declares six `DATABASE_*` names that `.env.example` does not carry (`C6.log:496`). That makes non-negotiable 6 ("turbo.json lists the same names") and `codebase-conventions.md:122` untrue as the branch stands. I am **not** filing this against STK-4: the as-built discloses it at `:24`, attributes it to STK-9 landing on the shared branch, and STK-4 is the ticket that built the detector that found it. But the detector warns rather than fails (`check-client-bundle.ts:95-100`), so nothing will catch this if the fill is forgotten, and the drift line will sit in every `yarn verify` until it is. Owner: STK-9 / Taylor.

**Should-fix — C6 is a `yarn verify` criterion, which the harness rule forbids.** `contract.md:72` sets C6's command to `yarn verify`; `.claude/rules/specs.md` says "`yarn verify` is never a criterion: it runs once at batch close." The cost is not theoretical — C6's own log shows the treadmill it creates (`C6.log:27`: "C6's PASS no longer holds"), and a verify run that warns its own proof is stale is a circular record. Substance was honored (the chain did pass at close); the contract shape should be reconciled with the rule in one place rather than both. Owner: Taylor / contract author.

**Consider — wildcard env declarations are skipped by the plan.** `check-client-bundle.ts:69` keeps only exact `[A-Za-z_][A-Za-z0-9_]*` names, so a future `"STRIPE_*"` in `turbo.json` plants nothing and reports no drift. It is documented at `:55`, and the `registry` fixture even exercises the skip (`fixtures/client-bundle/registry/turbo.json:9`). Worth a line on STK-16's contract so the first vendor keys are declared by exact name.

**Consider — drift detection is one-directional.** `check-client-bundle.ts:89-91` reports only names `turbo.json` has that `.env.example` lacks. The reverse — declared in `.env.example`, missing from `turbo.json` — breaks the cache key and goes unreported, though `codebase-conventions.md:122` requires both. `turbo/no-undeclared-env-vars` partially covers it for variables actually read in code.

**Consider — the sentinel build only ever exercises the local tier.** `check-client-bundle.ts:185-186` deletes `VERCEL_ENV` and pins `DATABASE_ENVIRONMENT=local`. Per-name coverage still holds, because all three suffix forms are planted simultaneously and all are scanned, so any inlining path would surface whichever form it touched. But no production- or preview-tier build is ever scanned, and production is the tier where the unsuffixed secrets resolve. The as-built is honest about the adjacent limit (`:63`).

**Consider — C6 proves the current module graph, not the guard.** Nothing in `apps/web` imports `env.ts` except `next.config.ts` importing `nextConfigEnv` (`next.config.ts:5`). So "none in 25 browser-facing files" is a true statement about a graph with no client consumer of `env` in it. The standing guard for a future `"use client"` leaf importing `env` is t3-env's client-side throw, documented at `env.ts:8-11` but not itself covered by a test. Worth re-running the sentinel check deliberately on the first ticket that adds a client consumer.

**Consider — the prior `review:vigil` record is superseded, not wrong.** `results.json:95-108` holds a PASS at head `793574d` against as-built sha `943b1f`; the as-built has changed twice since (mason saw `35661d`, the current file is newer, carrying the `:38` deviation). This run supersedes it. No action beyond the re-record this run performs.

---

### Conversations

None for product experience — this ticket has no user-facing surface. One for the team: the `.env.example` / `turbo.json` parity rule is now asserted in three places (the non-negotiable, `codebase-conventions.md:122`, and the check's own warning text) but enforced by none of them. The deliberate choice to warn rather than fail is the right call *today*, because `.env.example` is mid-fill and a hard failure would block every ticket on the branch. The question is what flips it to a failure, and who owns that flip — if the answer is "STK-9 fills the names and then someone remembers," it will not happen. Is there a ticket that should carry "make the drift warning fatal" as its last line?

### For the human to verify by hand, ordered by risk

1. The site URL on a real Vercel deployment, production and preview. The as-built flags this itself (`:63`); `VERCEL_ENV` has only ever been set on a local build, and this is the one path where getting it wrong puts a localhost URL into production metadata or an absolute link.
2. `.env.example`'s comments — that every variable carries one saying what breaks without it. I could not read the file.
3. That `c5eb5db` is still the head for STK-4's planned paths, or let `check-specs` say so at close.

Clean, careful work on the parts that matter most: the picker is pure and the purity is lint-enforced, the one `process.env` reader really is one, and the leak check was proven to fail before it was trusted to pass.

VERDICT: PASS
