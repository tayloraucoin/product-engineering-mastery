/**
 * Fixtures for this package's tests: a synthetic project, a forged session
 * cookie in the shape @supabase/ssr 0.12.7 writes, and a fetch that records
 * each call. Every value is synthetic.
 */

import type { AuthConfig } from "./config.ts";
import type { Cookie, CookieStore, CookieWrite } from "./cookies.ts";

export const STAGING: AuthConfig = {
  url: "https://stagingref0000000000.supabase.co",
  publishableKey: "sb_publishable_synthetic_staging",
};

export const LOCAL_STACK: AuthConfig = {
  url: "http://127.0.0.1:54321",
  publishableKey: "sb_publishable_synthetic_local",
};

export const USER_ID = "00000000-0000-4000-8000-000000000001";

function base64url(text: string): string {
  return Buffer.from(text).toString("base64url");
}

/** A JWT-shaped token that no Auth server signed. */
export function forgedAccessToken(userId = USER_ID): string {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return [
    base64url(JSON.stringify({ alg: "HS256", typ: "JWT" })),
    base64url(
      JSON.stringify({
        sub: userId,
        exp,
        role: "authenticated",
        aud: "authenticated",
      }),
    ),
    "forged-signature",
  ].join(".");
}

/** The session cookie a browser would send, claiming `userId` as an admin. */
export function forgedSessionCookie(
  config: AuthConfig,
  userId = USER_ID,
): Cookie {
  const ref = new URL(config.url).hostname.split(".")[0];
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  const session = {
    access_token: forgedAccessToken(userId),
    refresh_token: "synthetic-refresh-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: expiresAt,
    user: {
      id: userId,
      aud: "authenticated",
      role: "authenticated",
      email: "ana@example.test",
      app_metadata: { role: "admin" },
      user_metadata: {},
      created_at: "2026-10-04T00:00:00Z",
    },
  };
  return {
    name: `sb-${ref}-auth-token`,
    value: `base64-${base64url(JSON.stringify(session))}`,
  };
}

/** A cookie store over `initial` that records every batch written to it. */
export function memoryStore(initial: Cookie[]): CookieStore & {
  batches: CookieWrite[][];
} {
  const batches: CookieWrite[][] = [];
  return {
    batches,
    getAll: () => [...initial],
    setAll: (cookies) => {
      batches.push(cookies);
    },
  };
}

/** A fetch that answers every call with `status` and `body`, and records the URLs. */
export function recordingFetch(
  status: number,
  body: unknown,
): typeof fetch & { urls: string[] } {
  const urls: string[] = [];
  const fake = (async (input: string | URL | Request) => {
    urls.push(String(input instanceof Request ? input.url : input));
    return new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch & { urls: string[] };
  fake.urls = urls;
  return fake;
}
