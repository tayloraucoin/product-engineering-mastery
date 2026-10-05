/**
 * The app's way in (D-STK-12). `ai` and `@ai-sdk/*` are imported in this
 * package and nowhere else (D-STK-16); a service or the app's streaming route
 * calls the three cases through `createAi`, which the app configures from its
 * env.ts.
 *
 * Which model answers:
 * - a key is set: Anthropic, on the model models.ts names for the case;
 * - no key, on the local tier, outside a deployment: the case's recorded
 *   fixture, and no request leaves the process;
 * - no key anywhere else: every call throws AiNotConfiguredError, so a
 *   deployment never serves a fixture as if it were an answer.
 */

import { createAnthropic } from "@ai-sdk/anthropic";
import type { LanguageModel, UIMessage } from "ai";

import type { Tier } from "@pem/env/tier";
import { createLogger, type Logger } from "@pem/observability/logger";

import { streamChat } from "./cases/chat.ts";
import { extractContact, type Contact } from "./cases/extract.ts";
import { summarize } from "./cases/generate.ts";
import { createFixtureModel } from "./fixture-model.ts";
import { FIXTURES } from "./fixtures/index.ts";
import { CASE_MODELS, type CaseId } from "./models.ts";

export { CHAT_LIMITS, parseChatRequest } from "./cases/chat.ts";
export type { ChatRequest } from "./cases/chat.ts";
export { contactSchema, type Contact } from "./cases/extract.ts";

export type AiConfig = {
  /** `DATABASE_ENVIRONMENT`: the tier this process talks to. */
  tier: Tier;
  /** `ANTHROPIC_API_KEY` for the tier. */
  apiKey?: string;
  /**
   * Whether this process may be serving real users: a deployment or a
   * production build (`productionRuntime` in apps/web/env.ts), never set by hand.
   */
  deployed: boolean;
};

export type AiMode = "vendor" | "fixture" | "unconfigured";

export type AiDeps = {
  logger?: Logger;
  /** The vendor's HTTP client; a test passes a stand-in to see every request. */
  fetch?: typeof globalThis.fetch;
};

export class AiNotConfiguredError extends Error {
  constructor() {
    super(
      "AI is not configured: set ANTHROPIC_API_KEY for this tier (packages/ai/README.md).",
    );
    this.name = "AiNotConfiguredError";
  }
}

export type Ai = {
  mode: AiMode;
  extractContact(text: string): Promise<Contact>;
  summarize(text: string): Promise<string>;
  /** A streamed UI message response; pass messages that `parseChatRequest` returned. */
  streamChat(messages: UIMessage[]): Promise<Response>;
};

export function aiMode(config: AiConfig): AiMode {
  if (config.apiKey) return "vendor";
  if (config.tier === "local" && !config.deployed) return "fixture";
  return "unconfigured";
}

export function createAi(config: AiConfig, deps: AiDeps = {}): Ai {
  const logger = deps.logger ?? createLogger("ai");
  const mode = aiMode(config);
  // The key is passed in, never read from process.env by the SDK.
  const anthropic =
    mode === "vendor"
      ? createAnthropic({ apiKey: config.apiKey, fetch: deps.fetch })
      : null;

  function modelFor(caseId: CaseId): LanguageModel {
    if (anthropic) return anthropic(CASE_MODELS[caseId].model);
    if (mode === "fixture") {
      const fixture = FIXTURES[caseId];
      logger.info("fixture", {
        case: caseId,
        promptVersion: fixture.promptVersion,
        source: fixture.source,
      });
      return createFixtureModel(fixture);
    }
    throw new AiNotConfiguredError();
  }

  return {
    mode,
    extractContact: async (text) => extractContact(modelFor("extract"), text),
    summarize: async (text) => summarize(modelFor("generate"), text),
    streamChat: async (messages) =>
      streamChat(modelFor("chat"), messages, logger),
  };
}
