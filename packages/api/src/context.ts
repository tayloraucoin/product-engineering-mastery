/**
 * Who is calling the API (D-STK-8). A browser sends its cookie session; a
 * script or a native client sends `Authorization: Bearer <access token>`. Both
 * go through the app's request seam (`@pem/auth/context`), so the same user
 * arrives as the same `ctx.user` whichever way they called.
 *
 * The transport reads no environment and builds no client: the app's route
 * hands it the sources below, built from its own env.ts.
 */

import type { AuthContext } from "@pem/auth/context";
import type { ServiceContext } from "@pem/services/context";

export type ApiContextSources = {
  /** Who the request's cookie session belongs to, or null. */
  fromCookies: () => Promise<AuthContext | null>;
  /** Who an access token belongs to, or null when Supabase cannot vouch for it. */
  fromBearer: (token: string) => Promise<AuthContext | null>;
  /** The context a service takes for a signed-in user; called only by a protected procedure. */
  serviceContextFor: (user: AuthContext) => ServiceContext;
};

export type ApiContext = {
  user: AuthContext | null;
  serviceContextFor: ApiContextSources["serviceContextFor"];
};

/**
 * The token in an `Authorization` header, or null when the scheme is not
 * Bearer or the token is empty.
 */
export function bearerToken(header: string): string | null {
  const match = /^Bearer[ \t]+(\S+)[ \t]*$/i.exec(header);
  return match?.[1] ?? null;
}

/**
 * The context for one request. An `Authorization` header decides alone: a
 * token Supabase refuses makes the request anonymous, and the cookie session
 * is never read in its place, so a caller always gets the identity it sent.
 */
export async function createApiContext(
  headers: Headers,
  sources: ApiContextSources,
): Promise<ApiContext> {
  const header = headers.get("authorization");
  let user: AuthContext | null;
  if (header === null) {
    user = await sources.fromCookies();
  } else {
    const token = bearerToken(header);
    user = token ? await sources.fromBearer(token) : null;
  }
  return { user, serviceContextFor: sources.serviceContextFor };
}
