# Review — mason on STK-4

> Written by `yarn review:run mason STK-4`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: db07be97c45119b2c225fa5d746d1be093caf2258b16bc12bda576e1db822d2b
- as_built_sha256: 35661d08540697a80b9ab41bd6b2ecfcd9b5efad141be7248cba3ba76cd9834a
- head: 4561b04bcb7302b92dfc376dbbec4421ff576eb9
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T05:04:22Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason STK-4`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket STK-4 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

# Review — mason · STK-4 env-module

Read: contract, `results.json`, `as-built.md`, C1–C6 logs, `C6-control-leak.txt`, and the code at the current tree (`4561b04`). Evidence is recorded at `c5eb5db`; `4561b04` is the re-proof commit on top of it.

## Criteria

**C1 — picker per tier, unsuffixed fallback: MET.** `packages/env/src/pick.ts:36-42` resolves `tierName(name, tier)` then the unsuffixed name, with empty-after-trim counted as absent (`:29-30`); `SUFFIX.production` is `""` (`:13-17`), so production cannot read a suffixed value. `packages/env/src/pick.test.ts` covers each tier, absent-and-empty fallback, nothing-set, production isolation, the suffix grammar, and the `local` default via `parseTier` (`tier.ts:22-29`). C1.log shows those six as `ok 7`–`ok 12`, exit 0.

**C2 — mismatched Stripe key fails, variable named: MET at the guard.** `key-mode.ts:33-41` returns a message beginning with the variable name for live-on-local/staging, test-on-production, and no recognizable prefix. `key-mode.test.ts` asserts the name anchors (`/^STRIPE_SECRET_KEY…/`) rather than just truthiness, which is the right assertion. C2.log `ok 1`–`ok 4`. The guard is not yet wired into `env.ts` — correct per the contract's out-of-scope line, and declared in as-built:42.

**C3 — boundaries with `@pem/env` below its readers: MET.** `packages/config/eslint/boundaries.js:55-60` gives `env: ["config"]` and `db: ["config", "env"]`, with apps allowed every package type (`:72`, `:128-129`) and `packages → apps` disallowed by default plus explicitly (`:137-140`). C3.log exit 0, clean.

**C4 — types across apps and packages: MET.** C4.log, 5 of 5 tasks, exit 0. `packages/env/tsconfig.json` includes `src`, so the tests type-check too.

**C5 — scanner fails on a planted chunk and on no build output: MET.** `check-client-bundle.test.ts:29-49` drives the real script via `spawnSync` against committed fixtures and asserts exit 1 plus the variable-and-file message; the leak fixture genuinely holds the sentinel (`tooling/fixtures/client-bundle/leak/static/chunks/app-synthetic.js:2`) and the clean one does not. Missing-dir and no-JS-at-all are distinct failures (`check-client-bundle.ts:122-129`). The `registry` test (`:66-88`) pins the two-registry plan, the wildcard skip and the pass-through exclusion by asserting the exact would-plant line. C5.log `ok 1`–`ok 5`.

**C6 — full chain, sentinel build, nothing in client output: MET.** C6.log exit 0; `check-client-bundle — 9 server-only value(s), none in 25 browser-facing file(s)` (`:497`) after a real `web:build`. The negative control (`evidence/C6-control-leak.txt`) shows the check catching a rendered secret in `index.html` and three `.rsc` files, which is what makes the green run meaningful. Non-negotiable 7 holds: `package.json:13` runs `yarn test` and `yarn check-client-bundle` inside `verify`.

**Non-negotiables** all hold: `local` default with no production default anywhere (`tier.ts:22-29`); `@pem/env` pure, enforced by `no-restricted-properties` (`packages/env/eslint.config.mjs:9-18`) and confirmed by grep — the only `process.env` readers in the tree are `apps/web/env.ts:26-33` and `packages/db/scripts/env.ts`, which §5 permits; `next.config.ts:26` takes only `nextConfigEnv`, gated by `nextPublicEnv` (`next-public.ts:11-23`); localhost whenever `VERCEL_ENV` is not `production`/`preview` (`site-url.ts:11-13`).

## Findings

**Should-fix — `as-built.md:10` misstates C6's own numbers.** It says "planted 3 sentinels and found none in 25 files. C6 PASS at batch close (2026-10-03)"; the recorded C6.log says 9 values, 25 files, `2026-10-04T05:02:51Z`. Same drift at `as-built.md:5` ("14 tests in all"; `results.json` records 27 now that `@pem/db` tests). The deviation at `:38` describes the two-registry change correctly, so the record contradicts itself. Fix the three numbers before merge — this file is the durable record, and it is immutable once merged.

**Should-fix — the registry pair is out of sync with no mechanical deadline.** `turbo.json:15-20` lists six `DATABASE_*` names that `.env.example` lacks; `codebase-conventions.md:122` states the pair as absolute. `check-client-bundle.ts:95-100` only warns, deliberately and for a good reason (keeping `verify` green mid-epic), but the warning sits inside a ~550-line log with no owner condition that makes it fail. The drift is STK-9's, not this ticket's — give STK-9 the `.env.example` lines as a criterion, or add a ledger line naming the observable trigger that flips the warn to a stop.

**Should-fix — `review:vigil` and `review:warden` no longer cover what shipped.** `results.json:95-123` records both at `793574d`; the plant-from-both-registries change landed after them (`as-built.md:38` says all three reviewers found that gap), and C6.log:29-30 flags both as stale. Tier 2 needs all three on the shipped code; re-run both before merge. `check-specs --strict` gates this, so the mechanism is in place.

**Consider — `apps/web/env.ts:62-63` resolves the site URL twice.** The server path runs `resolveSiteUrl`; the browser path reads `raw.NEXT_PUBLIC_SITE_URL` and depends on `next.config.ts`'s `env` block overriding `process.env`. That behavior was verified by hand on a reverted build and has no regression guard, so if a Next upgrade stops overriding, the browser silently gets the unsuffixed (production) URL with nothing failing. One home for the rule — pass the resolved value down, or assert it from a client leaf once Phase 3 adds one.

**Consider — planted sentinels are not shaped like the values they stand in for.** `check-client-bundle.ts:178` plants `pem-sentinel-<name>-<hex>` into every plantable name, including `DATABASE_URL` and `DATABASE_MIGRATION_URL`. Harmless today because nothing in the `web` build reads them — which also means 6 of the 9 reported values are vacuous coverage, and the line overstates assurance. The day a reader in that build validates a URL with zod, `yarn verify` fails on the check, not on a leak. A shape hint per name (`postgres://…@host/db` carrying the sentinel) keeps it honest both ways.

**Consider — wildcard env entries are invisible to both the plant and the drift print** (`check-client-bundle.ts:56-72`, `:89-92`). A secret declared only as `STRIPE_*` in `turbo.json` is never planted and never named. D-STK-16 brings Stripe; either print skipped wildcards alongside the drift, or keep the rule that `.env.example` lists every name individually and make that the binding registry.

**Consider — sentinel residue in the tree.** `pem-sentinel-tmpdir-35593ab974463c82/` and `apps/web/pem-sentinel-tmpdir-35593ab974463c82/` hold `node-compile-cache` directories from a run that planted `TMPDIR`. The cause is fixed (`check-client-bundle.ts:16`, and the `registry` fixture pins the pass-through exclusion), but the directories are untracked and not ignored (`.gitignore:25` covers only `.next/`). Delete them and add `pem-sentinel-*/`, so a planted path can never be committed.

The architecture is right: one tier switch, a pure package below its readers, a single app reader, one gated door into the client bundle, and a check with a demonstrated positive control. Nothing here is load-bearing against the contract.

VERDICT: PASS
