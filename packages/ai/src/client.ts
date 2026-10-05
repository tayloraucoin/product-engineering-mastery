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
 *
 * Every vendor call logs `[ai] vendor` with the case, the model and, when the
 * caller passes one, the user's id.
 */

import { createAnthropic } from "@ai-sdk/anthropic";
import type { LanguageModel, UIMessage } from "ai";

import type { Tier } from "@pem/env/tier";
import { createLogger, type Logger } from "@pem/observability/logger";

import { parseChatRequest, streamChat } from "./cases/chat.ts";
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

/** Who a call is for: the signed-in user's id, logged with every vendor call so spend is attributable. */
export type CallOptions = { userId?: string | null };

export type Ai = {
  mode: AiMode;
  extractContact(text: string, options?: CallOptions): Promise<Contact>;
  summarize(text: string, options?: CallOptions): Promise<string>;
  /** A streamed UI message response; pass messages that `parseChatRequest` returned. */
  streamChat(messages: UIMessage[], options?: CallOptions): Promise<Response>;
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

  function modelFor(caseId: CaseId, options: CallOptions = {}): LanguageModel {
    if (anthropic) {
      const { model } = CASE_MODELS[caseId];
      logger.info("vendor", {
        case: caseId,
        model,
        ...(options.userId ? { userId: options.userId } : {}),
      });
      return anthropic(model);
    }
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
    extractContact: async (text, options) =>
      extractContact(modelFor("extract", options), text),
    summarize: async (text, options) =>
      summarize(modelFor("generate", options), text),
    streamChat: async (messages, options) =>
      streamChat(modelFor("chat", options), messages, logger),
  };
}

/** Per signed-in user, per process: a burst bound. The Anthropic Console's spend limit bounds the month. */
export const CHAT_RATE = { requests: 20, windowMs: 60_000 } as const;

/** A body larger than this is refused before it is parsed (the text cap is 20,000 characters). */
export const MAX_CHAT_BODY_BYTES = 256 * 1024;

/**
 * The streamed chat route's whole body: the app's route file is one line, and
 * these gates are tested here.
 * - 401 when the call would reach the vendor and `currentUserId` finds nobody:
 *   a live model spends money, so it answers only a user. The local fixtures
 *   cost nothing and answer anyone.
 * - 429 when that user has made `rate.requests` vendor calls in the window.
 *   The count lives in this process, so a deployment running several
 *   instances allows a multiple of it; it stops a loop, not a determined
 *   spender, which is the Console limit's job.
 * - 413 for a body over MAX_CHAT_BODY_BYTES; 400 when it fails `parseChatRequest`.
 * - 503 when no key is set where fixtures may not answer.
 */
export function createChatHandler(deps: {
  ai: Ai;
  currentUserId: () => Promise<string | null>;
  rate?: { requests: number; windowMs: number };
  now?: () => number;
  logger?: Logger;
}): (request: Request) => Promise<Response> {
  const rate = deps.rate ?? CHAT_RATE;
  const now = deps.now ?? Date.now;
  const logger = deps.logger ?? createLogger("ai");
  const recent = new Map<string, number[]>();

  /** Records a call for `userId`, or returns false when the window is full. */
  function admit(userId: string): boolean {
    const at = now();
    const kept = (recent.get(userId) ?? []).filter(
      (time) => at - time < rate.windowMs,
    );
    if (kept.length >= rate.requests) {
      recent.set(userId, kept);
      return false;
    }
    kept.push(at);
    recent.set(userId, kept);
    return true;
  }

  return async (request) => {
    let userId: string | null = null;
    if (deps.ai.mode === "vendor") {
      userId = await deps.currentUserId();
      if (!userId)
        return Response.json({ error: "sign in to chat" }, { status: 401 });
      if (!admit(userId)) {
        logger.warn("chat.limited", { userId });
        return Response.json(
          { error: "too many requests" },
          {
            status: 429,
            headers: { "retry-after": String(Math.ceil(rate.windowMs / 1000)) },
          },
        );
      }
    }
    const declared = Number(request.headers.get("content-length") ?? 0);
    if (declared > MAX_CHAT_BODY_BYTES)
      return Response.json({ error: "body too large" }, { status: 413 });
    const text = await request.text();
    if (text.length > MAX_CHAT_BODY_BYTES)
      return Response.json({ error: "body too large" }, { status: 413 });
    let body: unknown = null;
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
    const parsed = await parseChatRequest(body);
    if (!parsed.ok)
      return Response.json({ error: parsed.error }, { status: 400 });
    try {
      return await deps.ai.streamChat(parsed.messages, { userId });
    } catch (error) {
      if (error instanceof AiNotConfiguredError)
        return Response.json(
          { error: "AI is not configured" },
          { status: 503 },
        );
      throw error;
    }
  };
}
