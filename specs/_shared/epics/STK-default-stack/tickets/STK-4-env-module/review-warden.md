# Review — warden on STK-4

> Written by `yarn review:run warden STK-4`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: db07be97c45119b2c225fa5d746d1be093caf2258b16bc12bda576e1db822d2b
- as_built_sha256: 35661d08540697a80b9ab41bd6b2ecfcd9b5efad141be7248cba3ba76cd9834a
- head: 4561b04bcb7302b92dfc376dbbec4421ff576eb9
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T05:14:46Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-4`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-4 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## What I verified, and one limit

The repo's own settings deny reading `.env*` (`.claude/settings.json:30-31`, and `denyRead` at :93), so I could not open `.env.example`. I verified its name list indirectly: `check-client-bundle` reads it, and C6's run (`evidence/C6.log:496-497`) planted 9 plantable names of which it names 6 as turbo-only — leaving exactly `EXAMPLE_API_KEY`, `_LOCAL`, `_STAGING` from `.env.example`, consistent with the as-built. The "comment saying what breaks without it" half of that non-negotiable I cannot verify at all; it is unproven, not failed.

## Criteria

**C1 — met.** `packages/env/src/pick.ts:36-42` resolves the tier's own name then falls back to unsuffixed, with whitespace treated as absent (`:29-30`); production's suffix is `""` (`:13-17`), so production structurally cannot read a `_LOCAL`/`_STAGING` value. `tier.ts:22-29` returns `local` for unset and empty, and throws naming `DATABASE_ENVIRONMENT`. Six tests named C1 in `C1.log:140-175` cover each tier, the empty-value fallback, undefined when nothing is set, production's isolation, the suffix grammar, and the default. Code and evidence agree.

**C2 — met.** `key-mode.ts:33-41` rejects live on `local`/`staging`, test on `production`, and any key with neither prefix. Four tests (`C2.log:14`, `C1.log:59-99`) assert the message starts with the variable name. The guard is not yet wired into `env.ts`; the contract puts Stripe variables out of scope, so the criterion as written is satisfied. Worth recording as a strength: the messages name the variable and the tier and never echo the key value (`key-mode.ts:36-40`).

**C3 — met.** `boundaries.js:56-60` gives `env: ["config"]` and `db: ["config","env"]`, with `default: "disallow"` (`:196`) and packages→apps banned (`:137-140`). `@pem/env` sits below its one reader. `C3.log` exit 0.

**C4 — met.** `C4.log` exit 0 across five packages; `verify` also runs `check-types:tooling` (`package.json:13`).

**C5 — met.** Five tests in `tooling/check-client-bundle.test.ts` prove the leak fixture fails naming both variable and chunk (`:29-37`), a missing folder and a folder with no JavaScript both fail (`:39-49`), a clean chunk passes, a scan with no sentinel is refused, and the plan unions both registries while naming drift (`:66-88`). `C5.log:8-37` matches.

**C6 — met, and this is the criterion that carries the ticket.** `verify` exit 0; the check planted 9 unique random sentinels and found none in 25 browser-facing files (`C6.log:497`). Two things make this a proof rather than a vacuous pass. First, the positive control: `evidence/C6-control-leak.txt` shows a Server Component rendering the secret being caught in `index.html` and three `.rsc` files, including `index.segments/_full.segment.rsc` — a path a chunk-only scan would have missed. Second, the sentinel build is `yarn workspace web build` → `next build` (`apps/web/package.json:8`), not a turbo task, so every planted name reaches the build regardless of turbo's strict-env list, and no cache can replay a stale pass.

The seam itself holds at the right layer: the only door into Next's `env` block is a literal one-key object (`apps/web/env.ts:69-71`) passed through `nextPublicEnv`, which throws on any non-`NEXT_PUBLIC_` name (`next-public.ts:17-19`). `process.env` appears in exactly one app file (`apps/web/env.ts:26-33`), and `@pem/env` contains no read of it. A deployment with no configured URL yields `undefined` and fails `z.url()` at build rather than silently shipping localhost (`site-url.ts:22`, `env.ts:56`) — the right direction.

## Findings

**Should-fix — the as-built understates the shipped check's coverage.** `as-built.md:10` says "Its last run planted 3 sentinels and found none in 25 files," but the recorded C6 evidence plants 9 (`evidence/C6.log:497`). The deviation at `as-built.md:38` explains the two-registry change without refreshing the number. An as-built is immutable once merged, and that number is what a later reader uses to judge how much the check covers.

**Should-fix — the `.env.example` / `turbo.json` drift has a detector but no expiry.** `codebase-conventions.md:122` requires every variable in both registries; six `DATABASE_*` names are in `turbo.json:15-20` and not in `.env.example`, and `printDrift` (`tooling/check-client-bundle.ts:95-100`) warns rather than fails so `verify` stays green. No sentinel coverage is lost, because `plan()` unions both registries (`:86`); the cost is operational — an operator copying `.env.example` won't see the database URLs. STK-4 met this at its close and shipped the detector; the open item is STK-9's or Taylor's one-line addition. Give the warning an owner and a trigger to flip it to a failure, or it becomes permanent.

**Consider — the scan pattern misses source maps.** `tooling/check-client-bundle.ts:104` matches `.js/.cjs/.mjs` only. `productionBrowserSourceMaps` is off today (absent from `apps/web/next.config.ts`), so there is no current exposure, but the day someone enables it the check keeps printing a clean bill over `.map` files that hold the same inlined values. Adding `.map` to `CHUNKS` costs nothing now and keeps the control sound later.

**Consider — only the local tier is ever built.** `tooling/check-client-bundle.ts:185-186` deletes `VERCEL_ENV` and pins `DATABASE_ENVIRONMENT=local`, so of the three `EXAMPLE_API_KEY` sentinels only `_LOCAL` is actually resolved into `env`, and the staging and production resolutions are proven by unit test alone. The inlining path is tier-independent, so the generalization is strong — but the as-built's "Not verified" list should say which tier the build check exercised.

**Consider — the plant list's completeness is assumed, not checked.** `plan()` (`:78-93`) draws names from the two registries; a server variable read in `apps/web/env.ts:25-33` but declared in neither would never be planted, while the pass message (`:141-143`) reads as an absolute clean bill. The failure mode is unproven coverage rather than a leak — turbo's strict mode and `t3-env` turn an undeclared required variable into a build failure — but the strongest layer for this is a cross-check of `env.ts`'s `raw` keys against both registries.

**Consider — the purity rule is sidesteppable.** `packages/env/eslint.config.mjs:9-17` restricts `process.env` as a member expression, so `const { env } = process` or `globalThis.process.env` passes. It catches the accident, which is the realistic case, and there is no stronger layer available short of a runtime guard; noting it so the next reader doesn't over-trust the rule.

No Blocking finding. The one asset that matters here — a server secret reaching a browser — is closed structurally at the `env` block, scanned empirically across chunks and prerendered output, and demonstrated detectable by a negative control. The check also never handles a real secret value: it overrides each name with a synthetic sentinel and reports names and paths only, never values (`:98`, `:135`).

VERDICT: PASS
