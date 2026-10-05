# Review — warden on STK-17

> Written by `yarn review:run warden STK-17`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: bc0cd80bf178a2c348aabe1310948d30931a46055b979a7a025b6879b53c688d
- as_built_sha256: 79c43f1b403b21e64a28fbf7138b6910ec8169bfd4ba76b026f9319e7f2330bd
- head: 79eba019a478c941bb735e00af3e1be8506cc941
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-05T21:50:55Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-17`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-17 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-17-ai-package/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-17-ai-package/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-17-ai-package/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-17-ai-package/evidence/C1.log (sha256 0a20e82c8b5b)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-17-ai-package/evidence/C2.log (sha256 0a20e82c8b5b)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-17-ai-package/evidence/C3.log (sha256 1f8c049d51cb)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-17-ai-package/evidence/C4.log (sha256 54ccb4a1ff0e)
   - C5 manual: specs/_shared/epics/STK-default-stack/tickets/STK-17-ai-package/evidence/C5-operator.md (sha256 5f765ae35a73)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/app/api/ai/ai.ts, apps/web/app/api/ai/chat/route.ts, apps/web/env.ts, apps/web/next.config.ts, apps/web/package.json, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, docs/runbooks/remove/ai.md, packages/ai/README.md, packages/ai/eslint.config.mjs, packages/ai/package.json, packages/ai/scripts/record.ts, packages/ai/src/cases/chat.test.ts, packages/ai/src/cases/chat.ts, packages/ai/src/cases/extract.ts, packages/ai/src/cases/generate.ts, packages/ai/src/cases/options.ts, packages/ai/src/chat-handler.test.ts, packages/ai/src/client.test.ts, packages/ai/src/client.ts, packages/ai/src/evals.ts, packages/ai/src/fixture-model.ts, packages/ai/src/fixtures/chat.ts, packages/ai/src/fixtures/extract.ts, packages/ai/src/fixtures/fixture.ts, packages/ai/src/fixtures/generate.ts, packages/ai/src/fixtures/index.ts, packages/ai/src/models.ts, packages/ai/src/prompts/chat.ts, packages/ai/src/prompts/extract-contact.ts, packages/ai/src/prompts/index.ts, packages/ai/src/prompts/summarize.ts, packages/ai/tsconfig.json, packages/config/eslint/boundaries.js, packages/config/eslint/workspace-resolver.cjs, tooling/boundaries.test.ts, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Review — STK-17 ai-package (warden)

I read the contract, `results.json`, the as-built, all five evidence files, the package and app code, the boundary rules and the cited surface (`technical.md`, D-STK-12 / D-STK-16 / D-STK-13). I cast the adversaries before reading the controls: the signed-in user who wants a free LLM, the anonymous prober, the attacker site a signed-in user visits, the client that forges its own transcript, and the next engineer who adds a tool to this route.

### Criteria

**C1 — three cases return their expected shape from the fixture; extraction is Zod-validated. Met.**
`yarn test` exit 0 at `79eba01`; the `@pem/ai` suite ran (cache miss) and its 27 tests pass, including `C1: extraction returns a Zod-validated contact that passes its eval` (C1.log:1630), the generate and chat cases (1642, 1648), and `C1: an extraction answer that breaks the schema is refused` (1636). The code backs it: `packages/ai/src/cases/extract.ts:32` parses through `contactSchema` before returning, and `client.test.ts:111` proves a malformed answer rejects rather than reaching the caller. The fixtures are `source: "synthetic"` (`src/fixtures/extract.ts:9`), not recordings — the builder says so plainly in "Not verified", and C5 carries the conversion. Met as a shape proof; the live-model behaviour is honestly marked unproven.

**C2 — a missing key on the local tier falls back to the fixture and never calls the vendor. Met.**
`aiMode` (`src/client.ts:81`) returns `fixture` only for `tier === "local" && !deployed`; anything else with no key throws `AiNotConfiguredError`. C1.log:1654 and :1666 prove both halves, with the stand-in installed as the global `fetch` as well as the provider's (`client.test.ts:44`), so a request bypassing the provider would still be seen — that is the right way to prove a negative. `src/fixture-model.ts` never opens a socket. The fail-closed direction is correct: a deployment left on `tier: local` resolves to `unconfigured`, not to a fixture served as an answer.

**C3 — no edge to `ai` from `ui` or from any `apps/web` file outside `app/api/ai`; lint passes with the route. Met.**
`boundaries.js:151` puts `ai` in `NOT_FOR_APPS`, `ui` may import only `config` (`:108`), and the `web-ai-route` element (`:66`, matched before `app-web`) is the sole app edge (`:264`). `ai` and `@ai-sdk/*` are in `SDK_OWNERS` (`:131`). C3.log exit 0, and the probes in C4.log prove the rules bite rather than merely existing: `@pem/ai/client` refused from `apps/web/app`, `apps/web/lib` and `packages/ui` (ok 26, 27, 30), `streamText` from `"ai"` refused even inside the route folder (ok 31), `@ai-sdk/anthropic` refused in services (ok 32), and the three intended edges still pass (ok 51–53). The `@/` alias fix matters most here: before `workspace-resolver.cjs:48`, `@/app/api/ai/ai` resolved to nothing and passed every rule as unknown, so the route's keyed client was reachable from any app file. That is a control moved to the layer that holds it, and ok 28–29 pin it.

**C4 — types and build pass with the route mounted. Met.**
`yarn verify` exit 0; C4.log:2883 and :2894 show `@pem/ai` and `web` `check-types` executing (cache miss, not replayed), :2923 compiles, and :2944 lists `ƒ /api/ai/chat` in the route table. The staleness warning at C4.log:18 is the in-flight self-reference (`check-specs` ran inside the verify that was being recorded); `results.json` now records C4 at the same HEAD with a matching evidence hash, so it is resolved, not outstanding.

**C5 — operator steps before a key reaches a hosted tier. Correctly deferred.**
`evidence/C5-operator.md` names the three steps with an observable outcome each, and `results.json` records it `--verdict deferred`. This is the right shape and I am not refiling it: the spend limit and the retention/training check are the only controls that bound real money and real privacy exposure here, and they cannot be made by code. The trigger is explicit ("before a key reaches a hosted tier"), which is what makes this an accepted risk rather than a forgotten one.

**Non-negotiables.** Model ids in one file with `MODELS_CHOSEN_ON` (`src/models.ts:12`); prompts versioned (`src/prompts/chat.ts:8`) with a test that fails a stale fixture (C1.log:1624); `toolkit.json:306` complete with `locked: false`; `remove/ai.md` complete, including the vendor-side step for data already sent (`:54`) — that step is the one most removal runbooks forget, and it is the one that matters to a person. The key is tiered and server-only (`apps/web/env.ts:168`, never a `NEXT_PUBLIC_` name), handed to the SDK rather than read by it (`src/client.ts:93`), and `@pem/ai/client` is `server-only` with a test pinning the import.

### Findings

No Blocking findings.

**Consider — `[ai] vendor` is logged before the input cap is checked, so the spend record over-counts.** `packages/ai/src/client.ts:121` evaluates `modelFor("extract", options)` — which logs at `:99` — before `extractContact` runs `checkInput` (`cases/extract.ts:24`). A user posting an over-long text produces an `[ai] vendor` line with their id and no spend. README:25 sells these lines as how spend is traced to a user; over-counting is the safe direction (nothing spent goes unlogged), which is why this is not higher. Moving the log to after `checkInput`, or into the case, would make the record mean what the README says.

**Consider — the per-user rate window never evicts a user.** `packages/ai/src/client.ts:194`: `admit()` prunes timestamps within an entry but no code deletes a key, so a long-lived instance keeps one entry per user who has ever chatted. Adversary: time, or an authenticated user with many accounts. Impact is memory growth in the chat process, not disclosure. A sweep of empty entries, or capping the map, closes it.

**Consider — a provider error is handed to the reporter as caught, and `APICallError` carries the request body.** `packages/ai/src/cases/chat.ts:84` passes the AI SDK error into `logger.error`. The printed line is safe today: `packages/observability/src/redact.ts:120` keeps only name, scrubbed message, stack and cause, and drops an Error's other own properties. But `reportError` receives the error unmodified (`logger.ts:65`), and an `APICallError`'s own `requestBodyValues` is the whole transcript. Nothing ships it off the host today, and Sentry's defaults do not serialize arbitrary own properties — but one `extraErrorDataIntegration` away, a chat transcript leaves for an observability vendor. This belongs in STK-18's reporter, not here; worth recording as a named dependency of that ticket rather than fixing in `@pem/ai`.

**Consider — in `unconfigured` mode an anonymous caller reaches the parser, and the 503 names the configuration.** `packages/ai/src/client.ts:213` calls `currentUserId` only when `mode === "vendor"`, so on a hosted tier with no key an unauthenticated request gets up to 256 KB read and `safeValidateUIMessages` run before the 503 at `:246`, whose body is `"AI is not configured"`. The exposure is modest (no spend, no data), but the test at `chat-handler.test.ts:117` is named "naming nothing about the configuration" while asserting a body that names exactly that — the assertion is right, the name overclaims. Either reword the test or make the body generic.

**Consider — the 401 gate's dependence on the session cookie staying `SameSite=Lax` is not written down.** `createChatHandler` is the repo's first cookie-authenticated POST that spends money, and `JSON.parse` on an unconstrained body means a cross-site `text/plain` form could shape a valid request. The path does not complete today: `packages/auth/src/cookies.ts:18` leaves `sameSite` to Supabase's `Lax` default, so a cross-site POST arrives anonymous and gets 401. That makes the control implicit. One line in `packages/ai/README.md` beside the 401 paragraph — that the gate assumes a same-site-only session cookie, and that a route behind `sameSite: "none"` needs an origin check — keeps the next engineer from removing the thing holding it.

### Residual risk

Everything proven here is proven against a stand-in: no call has reached Anthropic, so `effort`, structured output on `claude-opus-5-5`, and the real cost per case are unverified, and the as-built says so. The per-user window is per process, so a multi-instance deployment allows a multiple of it — stated at `client.ts:179` and in the README, and bounded only by the Console spend limit, which is C5 step 1. The transcript is client-owned by design; that is harmless while the route offers no tools and no private context, and both `cases/chat.ts:5` and README:29 name the condition under which it stops being harmless. The honest summary is that the code's gates are sound and the remaining exposure is entirely the three operator steps in C5, which are recorded with an owner and a trigger.

VERDICT: PASS
