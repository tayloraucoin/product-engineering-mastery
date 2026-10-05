/**
 * The API's one route (D-STK-8): every tRPC procedure, batched, at /api/trpc.
 * Webhooks, AI streaming, cron and auth callbacks are Route Handlers of their
 * own and never pass through here.
 */

import { handleApiRequest } from "@pem/api/server";

import { apiContextSources } from "../../../../lib/trpc/context";

function handler(request: Request) {
  return handleApiRequest(request, apiContextSources);
}

export { handler as GET, handler as POST };
