# As-built — STK-4

## Shipped against the contract

- **C1:** `@pem/env/pick` exports `pickTiered(source, name, tier)`. It returns the tier's own variable (`_LOCAL`, `_STAGING`, or the unsuffixed name for production), falls back to the unsuffixed value when the tier's own value is absent or empty, and returns undefined when neither is set. Production never reads a suffixed value. `@pem/env/tier`'s `parseTier` defaults to `local` and throws on any other value, naming `DATABASE_ENVIRONMENT`. Proof: 6 tests in `packages/env/src/pick.test.ts`, run by `yarn test` (14 tests in all).
- **C2:** `@pem/env/key-mode`'s `keyModeProblem(name, value, tier)` returns a message naming the variable in three cases: a live key (`sk_live_`, `pk_live_`, `rk_live_`) on `local` or `staging`; a test key on `production`; and a key with neither prefix. Proof: 4 tests in `packages/env/src/key-mode.test.ts`.
- **C3:** `packages/config/eslint/boundaries.js` adds the `env` element. `env` may import `config` only, and apps may import `env`. `yarn lint:boundaries` passes.
- **C4:** `yarn check-types` passes across apps and packages. `yarn check-types:tooling` also passes for the new tooling script.
- **C5:** `yarn check-client-bundle --scan` fails on a fixture chunk holding a sentinel, naming the variable and the file. It also fails on a missing folder ("no build output") and on a folder with no JavaScript, and passes on a clean chunk. Proof: 4 tests in `tooling/check-client-bundle.test.ts`, with fixtures in `tooling/fixtures/client-bundle/`.
- **C6:** `yarn verify` now runs `yarn test` and `yarn check-client-bundle` (root `package.json`). The bundle check reads every server-only name in `.env.example` and sets each to a unique random sentinel. It then builds `apps/web` and scans what the browser receives: `.next/static` JavaScript, and the prerendered `.html` and `.rsc` files under `.next/server/app`. Its last run planted 3 sentinels and found none in 25 files. C6 PASS at batch close (2026-10-03).

Against the non-negotiables:

1. **`DATABASE_ENVIRONMENT` defaults to `local`.** `parseTier(undefined)` and `parseTier("")` return `local`; there is no production default anywhere.
2. **`@pem/env` never reads `process.env`.** Its `eslint.config.mjs` adds `no-restricted-properties` on `process.env`; a probe file holding `process.env.EXAMPLE_API_KEY` failed `yarn lint` (checked 2026-10-03, then removed).
3. **`apps/web/env.ts` is the app's only `process.env` reader.** It reads each variable once into one object. `next.config.ts` imports `nextConfigEnv` from it, so the environment is validated once, at build. That object comes from `nextPublicEnv()` (`@pem/env/next-public`), which throws on any name without the `NEXT_PUBLIC_` prefix.
4. **A Stripe key whose prefix does not match the tier fails validation:** the guard is in `@pem/env/key-mode`, proven by C2. No Stripe variable is wired into `env.ts` yet; see Deviations.
5. **The site URL is localhost outside a deployment.** `isDeployed(VERCEL_ENV)` is true only for `production` and `preview`, and `resolveSiteUrl` returns `http://localhost:3000` otherwise. Builds on Next.js 16.3.8, checked 2026-10-03, with the page temporarily rendering `process.env.NEXT_PUBLIC_SITE_URL` (reverted, never committed):
   - A local build with the unsuffixed production URL set inlined `http://localhost:3000`.
   - A build with `DATABASE_ENVIRONMENT=staging` and `VERCEL_ENV=preview` inlined the `_STAGING` URL.

   So next.config's `env` block overrides `process.env` for `NEXT_PUBLIC_*` names.

6. **`.env.example` lists every variable,** each with a comment saying what breaks without it: `NODE_ENV`, `DATABASE_ENVIRONMENT`, `VERCEL_ENV`, `NEXT_PUBLIC_SITE_URL` and its tier forms, and `EXAMPLE_API_KEY` and its tier forms. `turbo.json`'s `globalEnv` listed the same names at STK-4's close; since STK-9 it also lists the six `DATABASE_*` URL names, which `.env.example` does not yet (Taylor adds them). `turbo/no-undeclared-env-vars` passes in `yarn lint`.
7. **`yarn verify` runs `yarn test` and `yarn check-client-bundle`.**

Also shipped:

- **The stack manifest:** `toolkit.json` gains a `stack.env` entry (files, env, dependencies `@pem/env`, `@t3-oss/env-nextjs` and `zod`, boundaries `env`, locked, no runbook). `yarn check-stack` passes.
- **Docs made true:**
  - `AGENTS.md`'s environment line.
  - `codebase-conventions.md` rule 6, the §4 table (`@pem/env` built, may import `config`; apps may import `env`) and §5.
  - `tech-stack.md`: the env pins are added and the Env row is removed from "Deliberately absent".

## Deviations

- **C6 first failed on branch-wide state, not on this ticket:** other tickets' stale proofs failed `check-specs`, and the evaluator-pass budget was over its cap. PR-15 made `check-specs` warn on work in flight and raised the cap; C6 passed at batch close.
- **The bundle check plants from both registries (batch close, after the tier 2 reviews).** All three reviewers found that it planted only `.env.example`'s names, so a server secret listed only in `turbo.json` went untested. It now plants the server-only names of `.env.example` and the root `turbo.json`'s declared env (`globalEnv`, each task's `env`), prints any name `turbo.json` has and `.env.example` lacks, and gains `--plan` for a build-free test (`tooling/check-client-bundle.test.ts`, fixture `registry`). It warns rather than fails on that drift, so `yarn verify` stays green until `.env.example` is filled.
- **The `EXAMPLE_API_KEY` server secret (Taylor's call, 2026-10-03).** At STK-4 the only server-only variable is the tier switch. Its values are enum words that cannot carry a sentinel, so C6 would have planted nothing. This synthetic tiered secret, read by `env.ts` and listed in `.env.example`, `turbo.json` and the manifest, gives the check a real target. The first vendor ticket replaces it.
- **The check scans more than client chunks.** It also scans prerendered `.html` and `.rsc` files, because a Server Component passing a secret into rendered output leaks it there, not in a chunk. The negative control in `evidence/C6-control-leak.txt` shows it: the page temporarily rendered `env.EXAMPLE_API_KEY`, and the check failed, naming `EXAMPLE_API_KEY_LOCAL` in `index.html` and three `.rsc` files.
- **"Where the code runs" comes from `VERCEL_ENV`, not `VERCEL`.** Vercel's docs (last updated 2026-07-15, read 2026-10-03) say `VERCEL_ENV` is set at build and runtime to `production`, `preview` or `development`. Only the first two count as deployed, so a `vercel env pull` with `development` stays local. `[ASSUMPTION: Vercel is the deploy target (D-STK-19); on any host that does not set VERCEL_ENV, the code reads as local and the site URL is localhost.]`
- **No Stripe variable is wired into `env.ts`.** The guard ships in `@pem/env` with its tests (C2). The contract puts Stripe variables out of scope ("they arrive with their tickets"), so STK-16 wires the guard into `env.ts` with them.
- **`apps/web/lib/env/**` is unused.** The resolution fits in `env.ts`, and the reusable parts are in `@pem/env`.
- **Three planned paths were added after init:** `docs/engineering/tech-stack.md` (the build prompt asks for its line), `apps/web/package.json` and `yarn.lock` (the dependencies). Criteria are unchanged.
- **The root `test` script is now `turbo run test --log-prefix=none`.** Turbo's per-line prefix hid Node's TAP lines, so `contract:run` counted zero tests.
- **The reference shapes came from Conscious Connections, re-scoped to `@pem/*`:** `connection-env.ts`, `resolve-tier-env.ts` and the apps' `env.ts`. Its default is production; this one's is local, per D-STK-3.

## Ledger IDs

EN-08 (the tier switch, D-STK-3), EN-06 (the package graph, D-STK-1), PR-14 (tickets share the operator's branch). None added.

## Migrations

applied: n/a

## Test changes

none

## Not verified

- No manual criteria.
- The site URL on a real Vercel deployment: the `VERCEL_ENV` path was exercised only by setting the variable on a local build.

## Model

claude-opus-5-5, Claude Code 2.1.232.

## Next

Closed. The first vendor ticket replaces `EXAMPLE_API_KEY` and wires `keyModeProblem` (STK-16).
