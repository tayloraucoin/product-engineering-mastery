/**
 * A language model that never leaves the process: it answers every call with
 * one fixture's recorded text, whole for a generate call and word by word for
 * a stream. The local tier uses it when no key is set (`client.ts`), so the
 * three cases run with no account and no spend.
 */

import type {
  LanguageModelV4,
  LanguageModelV4StreamPart,
  LanguageModelV4Usage,
} from "@ai-sdk/provider";

import type { Fixture } from "./fixtures/fixture.ts";

const NO_USAGE: LanguageModelV4Usage = {
  inputTokens: {
    total: 0,
    noCache: 0,
    cacheRead: 0,
    cacheWrite: 0,
  },
  outputTokens: { total: 0, text: 0, reasoning: 0 },
};

const STOP = { unified: "stop", raw: "end_turn" } as const;

export const FIXTURE_PROVIDER = "pem-fixture";

export function createFixtureModel(fixture: Fixture): LanguageModelV4 {
  return {
    specificationVersion: "v4",
    provider: FIXTURE_PROVIDER,
    modelId: `${fixture.model} (fixture: ${fixture.case})`,
    supportedUrls: {},
    async doGenerate() {
      return {
        content: [{ type: "text", text: fixture.output }],
        finishReason: STOP,
        usage: NO_USAGE,
        warnings: [],
      };
    },
    async doStream() {
      const words = fixture.output.match(/\S+\s*/g) ?? [];
      const parts: LanguageModelV4StreamPart[] = [
        { type: "stream-start", warnings: [] },
        { type: "text-start", id: "fixture" },
        ...words.map((delta): LanguageModelV4StreamPart => ({
          type: "text-delta",
          id: "fixture",
          delta,
        })),
        { type: "text-end", id: "fixture" },
        { type: "finish", usage: NO_USAGE, finishReason: STOP },
      ];
      return {
        stream: new ReadableStream<LanguageModelV4StreamPart>({
          start(controller) {
            for (const part of parts) controller.enqueue(part);
            controller.close();
          },
        }),
      };
    },
  };
}
