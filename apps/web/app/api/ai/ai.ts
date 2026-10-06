/**
 * The app's AI client: @pem/ai, configured from env.ts. It lives beside the
 * streaming route because no other apps/web file may import @pem/ai (the
 * boundaries lint, D-STK-12); a page that needs AI calls a service that does.
 * Server-only, since it holds the Anthropic key (check-client-bundle plants a
 * sentinel for it).
 */

import "server-only";

import { createAi } from "@pem/ai/client";

import { env, productionRuntime } from "../../../env";

export const ai = createAi({
  tier: env.DATABASE_ENVIRONMENT,
  apiKey: env.ANTHROPIC_API_KEY,
  deployed: productionRuntime,
});
