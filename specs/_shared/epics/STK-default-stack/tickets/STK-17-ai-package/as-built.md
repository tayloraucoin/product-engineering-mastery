# As-built — STK-17

## Shipped against the contract

- C1: `@pem/ai/client`'s `createAi({ tier, apiKey, deployed })` wires three cases: `extractContact` (`generateText` with `Output.object` over the Zod `contactSchema`, then `contactSchema.parse`), `summarize` (one-shot `generateText`) and `streamChat` (`streamText` answered as a UI message stream). Each has a fixture in `packages/ai/src/fixtures/` and an eval in `src/evals.ts`. `client.test.ts` runs every case on its fixture, runs every eval on the result, refuses an extraction answer that breaks the schema, and fails on a stale prompt version or model.
- C2: with no key, on the local tier, outside a deployment, each case runs on `fixture-model.ts`, a `LanguageModelV4` that replays the fixture and never leaves the process. The test passes a stand-in `fetch` and sees no request; with a key, the same call reaches the stand-in at `api.anthropic.com`. With no key in a deployment or on a hosted tier, every call throws `AiNotConfiguredError`.
- C3: `boundaries.js` adds `ai` (imports `config`, `env`, `observability`) and gives `services` an edge to it. `ai` and `@ai-sdk/*` are in `SDK_OWNERS`, and `ai` is in `NOT_FOR_APPS`. A `web-ai-route` element (`apps/web/app/api/ai/**`, before `app-web`) is the only app code allowed to import it. `ui` has no edge. Six new probes in `tooling/boundaries.test.ts` fail and three pass.
- C4: the route is `apps/web/app/api/ai/chat/route.ts`, one line over `createChatHandler`, with its client in `apps/web/app/api/ai/ai.ts`.
- Non-negotiables: the model ids are in `src/models.ts` with `MODELS_CHOSEN_ON = "2026-10-04"`. The prompts are in `src/prompts/`, each with a `version`. `toolkit.json` has the `ai` entry (`locked: false`), and `docs/runbooks/remove-ai.md` is filled in. `ANTHROPIC_API_KEY` is tiered in `env.ts`, `.env.example` and `turbo.json`. The pins are in `tech-stack.md`, and the `codebase-conventions.md` §4 row is marked built.

## Deviations

- [ASSUMPTION] devs_call: the eval runner is Node's test runner over `src/evals.ts`, the same checks on the fixture in CI and on a live answer in `yarn workspace @pem/ai record`, which rewrites a fixture only when its answer passes. No vendor eval framework (the AI SDK's `experimental_evaluate` is experimental).
- [ASSUMPTION] Every case uses `claude-opus-5-5`, the current default model. Effort is `low` for extraction and chat and `medium` for generate, and `maxOutputTokens` is 16,000 on each.
- [ASSUMPTION] `ai` 7.0.116 and `@ai-sdk/anthropic` 4.0.65 rather than the latest releases, because the repo's seven-day age gate quarantines anything newer. `@ai-sdk/provider` 4.0.18 is pinned for the fixture model's types.
- [ASSUMPTION] The chat route answers 401 when the call would reach the vendor and nobody is signed in. Local fixtures answer anyone. The input gate takes text and step-marker parts only, at most 40 turns and 20,000 characters, and the user's turn must come last.
- The SDK bans in `boundaries.js` now match exact package names (`sdkPattern`). The gitignore-style group `ai/*` also matched `@pem/ai/client` and a relative `../ai`; `stripe` and `resend` had the same latent problem.
- The planned path `apps/web/app/api/ai/**` was narrowed to the two files, and `contract:tier` dropped assay and threshold, which matched only through the glob. Planned paths added: `next.config.ts`, `apps/web/package.json`, `yarn.lock`, `tooling/boundaries.test.ts` and `codebase-conventions.md`.
- `apps/web/next.config.ts` was reformatted after another ticket's commit, because format:check failed at HEAD.

- Added after the reviews (mason, vigil and warden all passed; these are their should-fix and cheap consider items):
  - The route's gates moved into `createChatHandler` in `@pem/ai`, where `chat-handler.test.ts` proves them: 401 with no user before a vendor call, 400 on a refused body, 503 with no key, and fixtures without asking who is signed in.
  - Every vendor call logs `[ai] vendor` with the case, the model and the user's id.
  - `reasoning` parts are refused, since their text escaped the character cap.
  - The fixture-mode and no-key tests also install the stand-in as the global `fetch`.
  - The extraction eval requires an email only when the input contains an `@`.
  - The spend-limit step was added to `.env.example` and the README, and the README notes that the transcript is the client's and the extracted email is unvalidated.
  - `boundaries.js`'s layer-order comment now names `ai`, and its header notes that `web-ai-route` holds the route and its client only.

## Not verified

- The fixtures are `source: "synthetic"`: written by hand in the shape a recording takes, never recorded. No call has reached Anthropic, and the vendor path is proven only against a stand-in `fetch`.
- The `effort` provider option and structured output on `claude-opus-5-5` are not exercised against the live API.
- No client renders the chat stream yet (`useChat` is out of scope); the stream's format is proven by parsing it in the test.
- No cap on calls per user: the Console spend limit is the control, and it is an operator step.

## Next

With a staging key, run `yarn workspace @pem/ai record` once so the fixtures become real recordings, then send one chat through the route while signed in.
