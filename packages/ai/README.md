# @pem/ai

AI through the AI SDK and Anthropic, wired for three standard cases (D-STK-12). Only this package imports `ai` and `@ai-sdk/*` (D-STK-16), and only `@pem/services` and the app's streaming route (`apps/web/app/api/ai/`) import this package; the boundaries lint holds both. A removable module: [`docs/runbooks/remove-ai.md`](../../docs/runbooks/remove-ai.md).

- **`@pem/ai/client`**: `createAi({ tier, apiKey, deployed })` returns `extractContact(text)`, `summarize(text)` and `streamChat(messages)`, and `parseChatRequest(body)`, the chat route's input gate. The app builds it once from its `env.ts` (`apps/web/app/api/ai/ai.ts`); this package never reads `process.env`, and the key is handed to the SDK, which never looks for its own.
- **`@pem/ai/models`**: the default model per case, and `MODELS_CHOSEN_ON`, the day they were chosen. No other file names a model.
- **`@pem/ai/prompts`**: every prompt, each with a `version`. Prompts live in `src/prompts/` and nowhere else.

## The three cases

| Case     | Call                   | Returns                                                                  |
| -------- | ---------------------- | ------------------------------------------------------------------------ |
| extract  | `extractContact(text)` | a `Contact`, parsed by the Zod `contactSchema` before the caller sees it |
| generate | `summarize(text)`      | one sentence                                                             |
| chat     | `streamChat(messages)` | a `Response` streaming UI messages, for `useChat` on the client          |

Each is a plain function over a model in `src/cases/`, so a product adds a fourth by copying one: a prompt in `src/prompts/`, a case, a fixture, an eval.

## Which model answers

- **A key is set** (`ANTHROPIC_API_KEY` for the tier): Anthropic, on the model `models.ts` names.
- **No key, local tier, not a deployment**: the case's recorded fixture (`src/fixtures/`). Nothing leaves the process and nothing is spent; each call logs `[ai] fixture` with the case and prompt version.
- **No key anywhere else**: every call throws `AiNotConfiguredError`, and the chat route answers 503. A deployment never serves a fixture as an answer.

The chat route answers 401 when the call would reach the vendor and nobody is signed in, and its gate takes text only, at most 40 turns and 20,000 characters.

## Fixtures and evals

A fixture (`src/fixtures/<case>.ts`) holds one input, the model's text for it, the prompt version and model it answers, the day it was recorded, and `source`: `synthetic` until it has been recorded against the vendor. Each case's eval (`src/evals.ts`) says what a good answer to that input looks like.

- `yarn workspace @pem/ai test` runs every case on its fixture and every eval on the result, and fails when a fixture's prompt version or model is stale (C1, C2).
- `yarn workspace @pem/ai record [case ...]` calls the live model with each fixture's input, runs the eval, and rewrites the fixture only when the answer passes. It reads `ANTHROPIC_API_KEY` from `packages/ai/.env.local` or the shell, and spends a few cents per case. Run it after changing a prompt (bump its `version` first) or a model.

## Calling it from a service

A service takes an `Ai` from its caller rather than building one, as it takes a database handle:

```ts
// packages/services/src/contacts/import-contact.ts
import type { Ai } from "@pem/ai/client";

export async function importContact(ctx: { ai: Ai }, input: { text: string }) {
  const contact = await ctx.ai.extractContact(input.text);
  // ...store it
  return contact;
}
```
