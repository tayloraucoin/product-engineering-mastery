/**
 * The cookie helper shape every factory takes (the devs_call of STK-12), and
 * the purge of another project's session cookies. Pure: no SDK, no framework.
 * The app adapts its own cookie store (next/headers in a Server Component or
 * Route Handler, the request and response in proxy.ts) to `CookieStore`.
 */

import { projectRef } from "./config.ts";

/** Attribute options for a cookie write, as Supabase hands them over. */
export type CookieOptions = {
  domain?: string;
  path?: string;
  expires?: Date;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: boolean | "lax" | "strict" | "none";
  priority?: "low" | "medium" | "high";
  partitioned?: boolean;
};

export type Cookie = { name: string; value: string };

export type CookieWrite = Cookie & { options: CookieOptions };

/**
 * A request's cookies, read whole and written as a batch. `headers` carries
 * the no-store headers Supabase sends with a session write; a store that
 * answers an HTTP response sets them, so no cache serves one user's session
 * to another.
 */
export type CookieStore = {
  getAll(): Cookie[];
  setAll(cookies: CookieWrite[], headers: Record<string, string>): void;
};

// `sb-<ref>-auth-token`, then nothing, a chunk suffix (`.0`) or a companion
// (`-code-verifier`, `-flows-code-verifier`, `-flow-<id>-code-verifier`).
const SESSION_COOKIE = /^sb-(.+?)-auth-token(?:$|[.-])/;

/** The project ref a Supabase session cookie belongs to, or undefined for any other cookie. */
export function sessionCookieRef(name: string): string | undefined {
  return SESSION_COOKIE.exec(name)?.[1];
}

/**
 * Writes that delete every Supabase session cookie of a project other than
 * `url`'s; with no `url` (a tier with no project), every Supabase session
 * cookie.
 */
export function foreignSessionCookies(
  cookies: readonly Cookie[],
  url: string | null,
): CookieWrite[] {
  const own = url === null ? undefined : projectRef(url);
  return cookies
    .filter((cookie) => {
      const ref = sessionCookieRef(cookie.name);
      return ref !== undefined && ref !== own;
    })
    .map((cookie) => ({
      name: cookie.name,
      value: "",
      options: { path: "/", maxAge: 0, expires: new Date(0) },
    }));
}
