/**
 * The browser client (D-STK-7). Client-safe: it imports `createBrowserClient`
 * from `@supabase/ssr` and this package's config types, and nothing from a server
 * subpath. The app builds the config from its inlined `NEXT_PUBLIC_*` literals
 * (apps/web/lib/supabase/client.ts), since Next cannot inline a value read
 * through a dynamic name, and this package never reads process.env.
 */

import { createBrowserClient } from "@supabase/ssr";

import type { AuthConfig } from "./config.ts";

/** The browser's client; `@supabase/ssr` keeps one per page and reads `document.cookie`. */
export function createBrowserAuthClient(config: AuthConfig) {
  return createBrowserClient(config.url, config.publishableKey);
}
