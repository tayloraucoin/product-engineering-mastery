/**
 * `@pem/api/server`: what the app's route and its Server Components use.
 * `@trpc/server` is imported only inside this package (D-STK-16), so the
 * fetch adapter is wrapped here and the route hands over its request and the
 * context sources. Webhooks, AI streaming, cron and auth callbacks are not
 * served here; they are Route Handlers that call services directly.
 */

import "server-only";

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createLogger } from "@pem/observability/logger";

import { createApiContext, type ApiContextSources } from "./context.ts";
import { appRouter } from "./root.ts";
import { createCallerFactory } from "./trpc.ts";

export type { ApiContextSources } from "./context.ts";
export type { AppRouter } from "./root.ts";
export { appRouter };

const log = createLogger("api");

/** The path the route is mounted at and the client links to. */
export const API_ENDPOINT = "/api/trpc";

/** Answers one HTTP request to the API. Mount it as GET and POST at `app/api/trpc/[trpc]/route.ts`. */
export function handleApiRequest(
  request: Request,
  sources: ApiContextSources,
): Promise<Response> {
  return fetchRequestHandler({
    endpoint: API_ENDPOINT,
    req: request,
    router: appRouter,
    createContext: () => createApiContext(request.headers, sources),
    onError({ error, path }) {
      // Domain errors are answers, not faults; only a fault is logged.
      if (error.code === "INTERNAL_SERVER_ERROR")
        log.error("api.fault", { error: error.cause ?? error, path });
    },
  });
}

/**
 * The router called in-process, for a Server Component or Server Action:
 * the same procedures and tiers, no HTTP. `headers` are the request's, from
 * `next/headers`.
 */
export async function createApiCaller(
  headers: Headers,
  sources: ApiContextSources,
) {
  return createCallerFactory(appRouter)(
    await createApiContext(headers, sources),
  );
}
