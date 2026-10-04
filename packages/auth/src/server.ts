/**
 * The server client (D-STK-7): one per request, over that request's cookies.
 * `@supabase/*` is imported only inside this package (D-STK-16). Server-only
 * by use: it carries the session from the request's cookies, and nothing on a
 * client-safe subpath imports it.
 *
 * Authorization never reads this client's session: `getSession()` returns the
 * cookie's contents unverified. The request seam (`context.ts`) asks Supabase
 * for the user with `getUser()`.
 */

import { createServerClient } from "@supabase/ssr";

import type { AuthConfig } from "./config.ts";
import type { CookieStore } from "./cookies.ts";

export type ServerClientOptions = {
  /** The fetch the client sends with; tests pass one that records each call. */
  fetch?: typeof fetch;
};

/** A client for one request. Create a new one per request: Supabase sends its no-store headers with the first write only. */
export function createServerAuthClient(
  config: AuthConfig,
  cookies: CookieStore,
  options: ServerClientOptions = {},
) {
  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll: () => cookies.getAll(),
      setAll: (written, headers) => cookies.setAll(written, headers),
    },
    ...(options.fetch ? { global: { fetch: options.fetch } } : {}),
  });
}
