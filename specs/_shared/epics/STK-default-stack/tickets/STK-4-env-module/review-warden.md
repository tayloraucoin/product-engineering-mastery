# Review — warden on STK-4

> Written by `yarn review:run warden STK-4`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: db07be97c45119b2c225fa5d746d1be093caf2258b16bc12bda576e1db822d2b
- as_built_sha256: 943b1ff906287b29a2c11eef61e5ba5df286f98931f0671ac2162a931e276d6c
- head: 793574d73e56c07a0a18985e539101ad27180919
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T04:49:24Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-4`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-4 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Criteria

**C1 — PASS.** `pickTiered` (`packages/env/src/pick.ts:36-42`) reads the tier's own suffixed name, falls back to the unsuffixed value, and returns undefined when neither is set; empty and whitespace values count as absent (`pick.ts:29-30`). Production maps to the empty suffix (`pick.ts:13-17`), so `"production"` can never read a `_LOCAL` or `_STAGING` value — asserted directly at `pick.test.ts:55-64`. `parseTier` defaults to `local` and throws naming `DATABASE_ENVIRONMENT` (`tier.ts:22-29`). Six tests, `C1.log` ok 7–12, exit 0.

**C2 — PASS at the guard.** `keyModeProblem` (`key-mode.ts:27-42`) returns a message naming the variable for a live key on local/staging, a test key on production, and a key with neither prefix; messages carry the variable name and never the value. Four tests, `C2.log` ok 1–4. The guard is not yet called from `env.ts` — correct: the contract puts Stripe variables out of scope ("they arrive with their tickets"), and the as-built says so at line 51.

**C3 — PASS.** `boundaries.js:45-60` adds the `env` element with `env: ["config"]`, and `db: ["config", "env"]` places it below its reader; apps may import every package key (`boundaries.js:72`). `C3.log` exit 0.

**C4 — PASS.** `C4.log` exit 0 across six packages.

**C5 — PASS.** Four tests in `check-client-bundle.test.ts` drive the real script as a subprocess against committed fixtures: the leak fixture genuinely holds the sentinel (`fixtures/client-bundle/leak/static/chunks/app-synthetic.js:2`), the clean one holds only a public URL, and both the missing folder and the no-JavaScript folder fail (`check-client-bundle.ts:68-75`). `C5.log` exit 0, not a tautology.

**C6 — PASS.** `C6.log` records `yarn verify` exit 0 at head `a208417`, with `check-client-bundle — 3 server-only value(s), none in 25 browser-facing file(s)` (line 484) and `yarn test`/`check-client-bundle` present in the chain (`package.json:13`). The `check-specs` warnings at lines 18–25 are advisory by design; `.claude/rules/specs.md` reserves failure for `--strict` before merge. Note the as-built still describes C6 as FAIL — see Should-fix 2.

**Non-negotiables.** 1, 3, 5 and 7 hold: `parseTier` has no production default; `grep` confirms `apps/web/env.ts:26-33` is the app's only `process.env` reader and `next.config.ts:5` its only importer; `next.config.ts:26` takes only `nextConfigEnv`, which `nextPublicEnv` throws on for any non-`NEXT_PUBLIC_` name (`next-public.ts:16-19`); `resolveSiteUrl` returns localhost whenever `isDeployed` is false, and `isDeployed` is true only for `production`/`preview` (`site-url.ts:11-22`). 2 holds with the caveat in Consider 5. 6 I could not verify — `.env.example` is denied to my tools; see Should-fix 1.

The controls sit at the strongest layer available here: a throw in the one door into Next's `env` block, t3-env validating once at build because `next.config.ts` imports `env.ts`, a lint rule holding the package pure, and a build-time scan with a demonstrated negative control (`C6-control-leak.txt`). No secret or real key appears in any fixture, test or message.

## Findings

**Should-fix 1 — the leak check's coverage is only as complete as `.env.example`, and nothing enforces that completeness.** `tooling/check-client-bundle.ts:109-117` derives its entire plant list from `.env.example`. `codebase-conventions.md:122` and this contract's non-negotiable 6 require `turbo.json` and `.env.example` to hold the same names, but `check-stack` compares them only for *removed* modules (`tooling/check-stack.ts:178-191`) — a present module's variables are never checked against either file. The evidence suggests the two have already drifted: `turbo.json:15-20` lists six `DATABASE_URL*` names, none of which are in `UNPLANTABLE` or `NEXT_PUBLIC_`-prefixed, yet the C6 run planted 3 values (`C6.log:484`), the count of `EXAMPLE_API_KEY` alone. Path: a later ticket adds a server secret to `turbo.json` and `env.ts` but not to `.env.example` → it is never planted → `check-client-bundle` reports success while that secret is the one never tested. The six names belong to STK-9, not here, so I am not calling STK-4's own set inconsistent — `turbo.json:6-14` matches `env.ts:25-34` exactly. The fix belongs at the check: fail when a non-public name in any `turbo.json` env list is absent from `.env.example`. (I inferred the drift from the sentinel count; `.env.example` is unreadable from this seat.)

**Should-fix 2 — the as-built misstates the ticket's state.** `as-built.md:10` says "**C6 is recorded FAIL**" and `as-built.md:71` says the three reviews "have not run", against `results.json:68-79` C6 PASS and mason and vigil PASS. The Deviations narrative at `as-built.md:37` says verify "exits at `check-specs`", while the `C6.log` it cites exits 0. Both mason and vigil reviewed this same text (`as_built_sha256` 943b1ff in both records). The as-built is the merge-time record and immutable except `applied:` once merged, so correct it before merge.

**Consider 1 — no positive control that the plant reached the build.** `check-client-bundle.ts:140-146` scans for sentinels but never asserts one arrived anywhere. Nothing in `apps/web` reads `env.EXAMPLE_API_KEY` today, so a pass is equally consistent with the value never having been compiled in. The negative control is a one-time manual artifact. Asserting each sentinel appears somewhere under `.next/server` would make a silently vacuous pass impossible.

**Consider 2 — the scan is build-time only.** `check-client-bundle.ts:141-145` covers `.next/static` and prerendered `.html`/`.rsc`. A secret passed as a Client Component prop on a dynamically rendered route reaches the browser in the request-time RSC stream, which no build artifact holds. Say so in the docstring (`check-client-bundle.ts:1-17`) so a later ticket does not over-trust it.

**Consider 3 — `.next` is not cleared before the sentinel build** (`check-client-bundle.ts:130`), so the scan can read files an earlier build left. Harmless today, since stale files hold stale random sentinels and a real leak lands in freshly written output, but a clean removal first makes the 25-file count mean something.

**Consider 4 — `UNPLANTABLE` is a denylist that will invite the wrong fix.** `check-client-bundle.ts:29`. The first real vendor secret will fail the sentinel build, because a random sentinel cannot satisfy `keyModeProblem`'s prefix rule (`key-mode.ts:35`) or a zod format — and the tempting repair is to add the name to `UNPLANTABLE`, silently removing the most important secret from the leak check. Prefer a per-variable sentinel shape (`sk_test_` + random) over an exemption.

**Consider 5 — the purity lint has known syntactic bypasses.** `packages/env/eslint.config.mjs:9-18` uses `no-restricted-properties`, which by design does not catch `const { env } = process` or `process["env"]`. Purity is load-bearing for non-negotiable 2; a grep check over `packages/env/src/**` in `yarn verify` would hold it where syntax cannot route around it.

**Consider 6 — the production fallback is the seam's footgun, and nothing names it.** On `local`, a missing `_LOCAL` value resolves to the unsuffixed production variable (`pick.ts:41`). This is ratified (C1, D-STK-3) and correctly neutered for the site URL (`site-url.ts:21`), and `keyModeProblem` is the mitigation for keys — but it ships unwired. When STK-16 wires it, use `pickedName` (`pick.ts:45`) in the failure message so a developer sees that local resolved to the production variable rather than guessing.

VERDICT: PASS
