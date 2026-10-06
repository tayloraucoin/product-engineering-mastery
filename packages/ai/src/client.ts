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
 * caller passes one, the user's id. The line is written only once the input
 * has passed every check before the model, so it counts calls that can spend.
 *
 * Server-only: it builds the keyed client, so a client component that imports
 * it fails to build rather than relying on the bundle scan.
 */

import "server-only";

import { createAnthropic } from "@ai-sdk/anthropic";
import type { LanguageModel, UIMessage } from "ai";

import type { Tier } from "@pem/env/tier";
import { createLogger, type Logger } from "@pem/observability/logger";

import { parseChatRequest, streamChat } from "./cases/chat.ts";
import { extractContact, type Contact } from "./cases/extract.ts";
import { summarize } from "./cases/generate.ts";
import { checkInput } from "./cases/options.ts";
import { createFixtureModel } from "./fixture-model.ts";
import { FIXTURES } from "./fixtures/index.ts";
import { CASE_MODELS, type CaseId } from "./models.ts";

export { CHAT_LIMITS, parseChatRequest } from "./cases/chat.ts";
export type { ChatRequest } from "./cases/chat.ts";
export { contactSchema, type Contact } from "./cases/extract.ts";
export { AiInputTooLongError } from "./cases/options.ts";

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

/** Why a call cannot be served: for the server's log, never a response body. */
const NOT_CONFIGURED =
  "AI is not configured: set ANTHROPIC_API_KEY for this tier (packages/ai/README.md).";

/** A chat transcript `parseChatRequest` refuses, passed to `streamChat` directly. */
export class AiChatRejectedError extends Error {
  constructor(reason: string) {
    super(`chat: ${reason}`);
    this.name = "AiChatRejectedError";
  }
}

export class AiNotConfiguredError extends Error {
  constructor() {
    super(NOT_CONFIGURED);
    this.name = "AiNotConfiguredError";
  }
}

/** Who a call is for: the signed-in user's id, logged with every vendor call so spend is attributable. */
export type CallOptions = { userId?: string | null };

export type Ai = {
  mode: AiMode;
  extractContact(text: string, options?: CallOptions): Promise<Contact>;
  summarize(text: string, options?: CallOptions): Promise<string>;
  /** A streamed UI message response. The transcript is checked again here, so a caller that skips `parseChatRequest` is refused with AiChatRejectedError before any model is called. */
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

  // Every case's input check runs before modelFor writes `[ai] vendor`; an
  // input the case refuses is never logged as spend.
  return {
    mode,
    extractContact: async (text, options) => {
      checkInput("extract", text);
      return extractContact(modelFor("extract", options), text);
    },
    summarize: async (text, options) => {
      checkInput("generate", text);
      return summarize(modelFor("generate", options), text);
    },
    streamChat: async (messages, options) => {
      const parsed = await parseChatRequest({ messages });
      if (!parsed.ok) throw new AiChatRejectedError(parsed.error);
      return streamChat(
        modelFor("chat", options),
        parsed.messages,
        logger,
        options,
      );
    },
  };
}

/** Per signed-in user, per process: a burst bound. The Anthropic Console's spend limit bounds the month. */
export const CHAT_RATE = { requests: 20, windowMs: 60_000 } as const;

export type RateWindow = {
  /** Records a call for `userId`, or returns false when the window is full. */
  admit(userId: string): boolean;
  /** Users with a call still inside the window: the most the map holds. */
  size(): number;
};

/**
 * A sliding window per user, in this process. Each admit drops every call
 * that has left the window and every user left with none, so the map holds
 * only the users active in the last `windowMs`, never everyone who has ever
 * chatted.
 */
export function createRateWindow(
  rate: { requests: number; windowMs: number },
  now: () => number = Date.now,
): RateWindow {
  const recent = new Map<string, number[]>();

  function sweep(at: number): void {
    for (const [userId, times] of recent) {
      // Times are appended in order: an entry whose oldest call is still inside is untouched.
      if (at - (times[0] ?? -Infinity) < rate.windowMs) continue;
      const kept = times.filter((time) => at - time < rate.windowMs);
      if (kept.length === 0) recent.delete(userId);
      else if (kept.length !== times.length) recent.set(userId, kept);
    }
  }

  return {
    admit(userId) {
      const at = now();
      sweep(at);
      const kept = recent.get(userId) ?? [];
      if (kept.length >= rate.requests) return false;
      kept.push(at);
      recent.set(userId, kept);
      return true;
    },
    size: () => recent.size,
  };
}

/** A body larger than this is refused before it is parsed (the text cap is 20,000 characters). */
export const MAX_CHAT_BODY_BYTES = 256 * 1024;

/**
 * The body as text, or null once it passes `maxBytes`. It counts the bytes as
 * they arrive and stops reading there, so neither a missing or false
 * content-length (a chunked upload) nor multibyte text gets a larger body
 * buffered.
 */
async function readBounded(
  request: Request,
  maxBytes: number,
): Promise<string | null> {
  if (Number(request.headers.get("content-length") ?? 0) > maxBytes)
    return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

/**
 * The streamed chat route's whole body: the app's route file is one line, and
 * these gates are tested here.
 * - 401 when the call would reach the vendor and `currentUserId` finds nobody:
 *   a live model spends money, so it answers only a user. The local fixtures
 *   cost nothing and answer anyone.
 * - 429 when that user has made `rate.requests` vendor calls in the window;
 *   a refused request never counts.
 *   The count lives in this process, so a deployment running several
 *   instances allows a multiple of it; it stops a loop, not a determined
 *   spender, which is the Console limit's job.
 * - 413 for a body over MAX_CHAT_BODY_BYTES, counted as it is read; 400 when it fails `parseChatRequest`.
 * - 503 when no key is set where fixtures may not answer, answered first:
 *   nobody is asked who they are and no body is read, and the answer names
 *   nothing about the configuration. The reason is logged on the server, as a
 *   warning, so a flood of requests is not a flood of error reports.
 *
 * The 401 gate rests on the session cookie being same-site (packages/ai/README.md).
 */
export function createChatHandler(deps: {
  ai: Ai;
  currentUserId: () => Promise<string | null>;
  rate?: { requests: number; windowMs: number };
  now?: () => number;
  logger?: Logger;
}): (request: Request) => Promise<Response> {
  const rate = deps.rate ?? CHAT_RATE;
  const logger = deps.logger ?? createLogger("ai");
  const window = createRateWindow(rate, deps.now);
  const unavailable = () =>
    Response.json({ error: "chat is unavailable" }, { status: 503 });

  return async (request) => {
    if (deps.ai.mode === "unconfigured") {
      logger.warn("chat.unconfigured", { reason: NOT_CONFIGURED });
      return unavailable();
    }
    let userId: string | null = null;
    if (deps.ai.mode === "vendor") {
      userId = await deps.currentUserId();
      if (!userId)
        return Response.json({ error: "sign in to chat" }, { status: 401 });
    }
    const text = await readBounded(request, MAX_CHAT_BODY_BYTES);
    if (text === null)
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
    // Counted here, after every refusal: only a call that reaches the vendor uses the window.
    if (userId && !window.admit(userId)) {
      logger.warn("chat.limited", { userId });
      return Response.json(
        { error: "too many requests" },
        {
          status: 429,
          headers: { "retry-after": String(Math.ceil(rate.windowMs / 1000)) },
        },
      );
    }
    try {
      return await deps.ai.streamChat(parsed.messages, { userId });
    } catch (error) {
      if (error instanceof AiNotConfiguredError) {
        logger.warn("chat.unconfigured", { reason: NOT_CONFIGURED });
        return unavailable();
      }
      throw error;
    }
  };
}
