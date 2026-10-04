# Review — mason on STK-4

> Written by `yarn review:run mason STK-4`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: db07be97c45119b2c225fa5d746d1be093caf2258b16bc12bda576e1db822d2b
- as_built_sha256: 797d4e5ffd27e6d826dd84856fdf442cb3454ace9432c4e9043d94c1409e3961
- head: 9e80f7e50fc6221e5b222323da03d30a4043f367
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T04:55:05Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason STK-4`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket STK-4 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/evidence/C1.log (sha256 bedfa847d671)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/evidence/C2.log (sha256 5aeef66bfc8e)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/evidence/C3.log (sha256 a082dcbbbdaf)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/evidence/C4.log (sha256 f41b14998f6b)
   - C5 test: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/evidence/C5.log (sha256 a85cdce3587b)
   - C6 check: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/evidence/C6.log (sha256 1a98ebccb5c5)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, AGENTS.md, apps/web/env.ts, apps/web/next.config.ts, apps/web/package.json, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, package.json, packages/config/eslint/boundaries.js, packages/env/eslint.config.mjs, packages/env/package.json, packages/env/src/key-mode.test.ts, packages/env/src/key-mode.ts, packages/env/src/next-public.test.ts, packages/env/src/next-public.ts, packages/env/src/pick.test.ts, packages/env/src/pick.ts, packages/env/src/site-url.test.ts, packages/env/src/site-url.ts, packages/env/src/tier.ts, packages/env/tsconfig.json, tooling/check-client-bundle.test.ts, tooling/check-client-bundle.ts, tooling/fixtures/client-bundle/clean/static/chunks/app-synthetic.js, tooling/fixtures/client-bundle/empty/static/README.md, tooling/fixtures/client-bundle/leak/static/chunks/app-synthetic.js, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Review — STK-4 env-module (mason, tier 2)

**Verdict up top: PASS.** No Blocking finding. The seam is placed correctly, the one-way doors it touches are each covered by a record or a ratified decision, and the strongest piece of evidence in the ticket — the negative control at `evidence/C6-control-leak.txt` — proves the leak check actually fires on the real path, not just on fixtures.

**One limit to declare:** this session's permissions deny reading `.env.example` (both Read and Grep refused). Non-negotiable 6 is therefore not directly verifiable from my seat; what I could establish about it indirectly is marked as inference below.

### Criteria

| | | |
|---|---|---|
| **C1** | **Met** | `pick.ts:36-42` returns the tier's own variable, falls back to the unsuffixed one, and treats empty/whitespace as absent (`pick.ts:29-30`). Production reads no suffix (`SUFFIX.production = ""`, `pick.ts:16`), asserted directly at `pick.test.ts:55-64`. `parseTier` defaults to `local` and never to production (`tier.ts:22-29`), asserted at `pick.test.ts:80-86`. Six tests, `C1.log` TAP `ok 7`–`ok 12`, exit 0. The tests assert observable behavior with synthetic values, not internals. |
| **C2** | **Met** | `key-mode.ts:27-42` names the variable in all three cases, including a key with neither prefix — the right default for a mode it cannot vouch for. Messages carry the variable name and never the value. `key-mode.test.ts:12,31,38,47`; `C2.log` `ok 1`–`ok 4`. Scoped correctly: the contract puts Stripe variables out of scope, so the guard ships without a caller (see Should-fix 3). |
| **C3** | **Met** | `boundaries.js:49` adds the `env` element and `:57` gives it `["config"]` only; `db` gets `["config","env"]` at `:58`; apps reach every package via `APP_IMPORTS` (`:72`). `env` can no longer be imported by `config`, and every undeclared edge stays disallowed by default (`:196`). `C3.log` exit 0. Matches conventions §4 step 2 and the §4 table at `codebase-conventions.md:85`. |
| **C4** | **Met** | `C4.log` exit 0 across all five typed workspaces, `@pem/env` included. `yarn check-types:tooling` is also in `verify` (`package.json:13`), covering the new tooling script. |
| **C5** | **Met** | `check-client-bundle.test.ts:27-35` fails the leak fixture naming both variable and chunk; `:37-47` covers both "no build output" (missing directory) and "no client chunks" (directory with no JS) — the second is the one that matters, since a scan of nothing would otherwise exit 0. `:58` refuses a scan with no sentinel. `C5.log` `ok 1`–`ok 4`, exit 0. |
| **C6** | **Met as recorded** | `C6.log` exit 0 at head `a208417`, full chain, with `check-client-bundle — 3 server-only value(s), none in 25 browser-facing file(s)` at `:484`. The three sentinels are consistent with `EXAMPLE_API_KEY` plus its two tier forms after the filter at `check-client-bundle.ts:111-113` — which is my only handle on `.env.example`'s contents, and it corroborates as-built item 6 for the names this ticket owns. The scan covers prerendered `.html`/`.rsc` as well as `.next/static`, correctly: `C6-control-leak.txt:3-6` shows a Server Component leak surfacing there and nowhere else. Coverage caveat in Should-fix 1. |

### Non-negotiables

1. **Local default** — met (`tier.ts:22-29`); no production default anywhere in the package.
2. **`@pem/env` is pure** — met. Grep finds no `process.env` in `packages/env/src/`; `eslint.config.mjs:9-18` enforces it and `@pem/env:lint` runs in `verify` (`C6.log:454`). Bypass noted as Consider 2.
3. **One reader per app** — met. `apps/web/env.ts:26-33` is the only `process.env` read in `apps/`; `next.config.ts:26` takes `nextConfigEnv`, which is `nextPublicEnv({NEXT_PUBLIC_SITE_URL})` (`env.ts:69-71`), so the `env` block cannot carry a non-public name (`next-public.ts:16-19`). Importing `env.ts` from `next.config.ts` also makes a bad value a build failure, which is the right place for it.
4. **Key-prefix guard** — met at the guard, out of scope at the call site (Should-fix 3).
5. **Localhost outside a deployment** — met. `isDeployed` is true only for `production`/`preview` (`site-url.ts:11-13`), and `resolveSiteUrl` returns the local origin otherwise, ignoring whatever is configured (`:21`), asserted at `site-url.test.ts:10-22`. The `VERCEL_ENV`-not-`VERCEL` reading is right and the host assumption is labeled in the as-built.
6. **`.env.example` ↔ `turbo.json`** — **not verifiable from my seat.** `turbo.json:5-21` lists every name `env.ts` reads and `turbo/no-undeclared-env-vars` passes in lint; the comments are checked by nothing mechanical. See Should-fix 1 and 2.
7. **`verify` runs both** — met: `package.json:13` chains `yarn test` and `yarn check-client-bundle`.

### Findings

**Blocking:** none.

**Should-fix 1 — the sentinel set comes from half the registry.** `tooling/check-client-bundle.ts:109-117` derives every sentinel from `.env.example` alone, while `check-stack.ts:116` treats `turbo.json` ∪ `.env.example` as the registry. `turbo.json:15-20` carries six server-only `DATABASE_*` names that, per `STK-9/as-built.md:18`, are not in `.env.example` — so they are never planted, the check reports three values and exit 0, and nothing fails. Harmless today (`apps/web` does not import `@pem/db`), but the failure is silent and in the safe-looking direction, which is the property worth fixing rather than today's instance. Fix: union the two sources, or fail when a non-`NEXT_PUBLIC_` `globalEnv` name is missing from `.env.example`.

**Should-fix 2 — an as-built claim that is no longer true.** `as-built.md:24`: "`turbo.json`'s `globalEnv` lists the same names." It holds in one direction only; at batch close `turbo.json` carries six names `.env.example` does not. Correct the sentence before merge — this file becomes immutable on merge and is what the next session reads as ground truth.

**Should-fix 3 — a guard with no caller and nothing scheduling one.** `packages/env/src/key-mode.ts:27` has no consumer in the repo, and `STK-16-billing-stripe/contract.md` never names `@pem/env/key-mode` (grep across `specs/` returns only STK-4's own files). The sharpest logic in the ticket protects nothing, and its wiring depends on a builder twelve tickets out rediscovering it. One line in STK-16's Build notes costs nothing now.

**Consider 1 — the test count in the evidence is not reproducible.** `package.json:29` drops Turbo's log prefix, which interleaves the two packages' concurrent TAP streams (visible at `C1.log:94-105`). The same cached output was recorded as `tests: 26` in `C1.log:5` and `tests: 27` in `C2.log:5`, one second apart. Exit status and the 27 `ok` lines are intact, so nothing is misreported as passing — but a count that drifts is a weak input to the zero-tests gate. Per-package logs or `--concurrency=1` for `test` would fix it.

**Consider 2 — the purity rule has a known bypass.** `packages/env/eslint.config.mjs:9-18` catches `process.env.X` but not `process["env"]` or `const { env } = process`. The source is clean today; the rule is the thing that keeps it clean as agents edit the package.

**Consider 3 — `UNPLANTABLE` will invite the wrong repair.** `check-client-bundle.ts:29`. The first real vendor secret cannot satisfy a random sentinel and a prefix rule at once (`key-mode.ts:35`), and the cheap fix will look like adding the name to the denylist — which would quietly remove the most important secret from the leak check. A per-variable sentinel shape (`sk_test_` + random) is the durable answer.

### Notes

No doc defect found: `codebase-conventions.md:27` (rule 6), `:85`, `:112-122`, `AGENTS.md:54` and `tech-stack.md:38` all match what shipped, and the caret pin on `@t3-oss/env-nextjs`/`zod` is a recorded ruling in that row, not drift. The unused planned path `apps/web/lib/env/**` is declared in Deviations and correctly dropped — the resolution has one consumer, so `env.ts` is where it belongs.

VERDICT: PASS
