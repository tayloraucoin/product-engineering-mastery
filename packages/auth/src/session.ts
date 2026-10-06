/**
 * Session refresh (D-STK-7), called from apps/web/proxy.ts and nowhere else.
 * Before any page renders, it asks Supabase for the user, which refreshes an
 * expired access token and writes the new cookies, so every Server Component
 * after it reads a fresh session.
 *
 * It first deletes the session cookies of any other Supabase project. Switching
 * DATABASE_ENVIRONMENT (staging to Mode B's local stack, or back) leaves the
 * old project's chunked cookies on localhost; the new project ignores them,
 * but they ride on every request until the header outgrows the server's limit.
 *
 * The proxy refreshes only; it authorizes nothing. Pages and services read the
 * request seam in `context.ts`.
 */

import "server-only";

import type { AuthConfig } from "./config.ts";
import {
  foreignSessionCookies,
  type CookieStore,
  type CookieWrite,
} from "./cookies.ts";
import { createServerAuthClient, type ServerClientOptions } from "./server.ts";

export type { CookieStore as SessionCookieStore } from "./cookies.ts";

export type SessionUpdate = {
  /** The user Supabase returned, or null when signed out or the session failed. */
  userId: string | null;
  /** Names of the other projects' cookies deleted on this request. */
  purged: string[];
};

/**
 * Refreshes the request's session and purges other projects' cookies. Every
 * write reaches `cookies.setAll` as one growing batch, so a proxy that rebuilds
 * its response on each call never drops an earlier write.
 */
/**
 * For a tier with no Supabase project: deletes every Supabase session cookie,
 * so a switch to such a tier leaves nothing behind. Returns the names deleted.
 */
export function clearSessionCookies(cookies: CookieStore): string[] {
  const purge = foreignSessionCookies(cookies.getAll(), null);
  if (purge.length) cookies.setAll(purge, {});
  return purge.map((cookie) => cookie.name);
}

export async function updateSession(
  config: AuthConfig,
  cookies: CookieStore,
  options: ServerClientOptions = {},
): Promise<SessionUpdate> {
  const pending = new Map<string, CookieWrite>();
  let pendingHeaders: Record<string, string> = {};
  const write = (list: CookieWrite[], headers: Record<string, string>) => {
    for (const cookie of list) pending.set(cookie.name, cookie);
    pendingHeaders = { ...pendingHeaders, ...headers };
    cookies.setAll([...pending.values()], pendingHeaders);
  };

  const purge = foreignSessionCookies(cookies.getAll(), config.url);
  if (purge.length) write(purge, {});
  const purged = new Set(purge.map((cookie) => cookie.name));

  const client = createServerAuthClient(
    config,
    {
      getAll: () =>
        cookies.getAll().filter((cookie) => !purged.has(cookie.name)),
      setAll: write,
    },
    options,
  );
  const { data, error } = await client.auth.getUser();
  return {
    userId: error ? null : (data.user?.id ?? null),
    purged: [...purged],
  };
}

/** Which sessions a sign-out ends: this browser's (`local`) or every device's (`global`). */
export type SignOutScope = "local" | "global";

export type SignOutResult = {
  /** Whether Supabase confirmed the revocation; false when it could not be reached or refused. */
  revoked: boolean;
  /** Names of the session cookies deleted. */
  cleared: string[];
};

/**
 * Ends the request's session (STK-24). It calls `signOut` on the server
 * client, so Supabase revokes the refresh token (this session's by default,
 * every device's with `global`), then deletes every Supabase session cookie
 * the request carries, chunks and code verifiers included, whether or not
 * Supabase answered: the browser is signed out either way. Call it only from
 * a POST, never from a GET a link prefetch could fire.
 */
export async function signOut(
  config: AuthConfig,
  cookies: CookieStore,
  options: ServerClientOptions & { scope?: SignOutScope } = {},
): Promise<SignOutResult> {
  const pending = new Map<string, CookieWrite>();
  let pendingHeaders: Record<string, string> = {};
  const write = (list: CookieWrite[], headers: Record<string, string>) => {
    for (const cookie of list) pending.set(cookie.name, cookie);
    pendingHeaders = { ...pendingHeaders, ...headers };
    cookies.setAll([...pending.values()], pendingHeaders);
  };

  const { scope = "local", ...clientOptions } = options;
  const client = createServerAuthClient(
    config,
    { getAll: () => cookies.getAll(), setAll: write },
    clientOptions,
  );
  const { error } = await client.auth.signOut({ scope });

  // Supabase deletes the cookies it can name; a stale chunk or verifier can outlive them.
  const clear = foreignSessionCookies(cookies.getAll(), null);
  if (clear.length) write(clear, {});
  return { revoked: !error, cleared: clear.map((cookie) => cookie.name) };
}
