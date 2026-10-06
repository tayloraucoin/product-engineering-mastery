/**
 * Sign-out (STK-24). A POST only: Next answers any other method with 405, so
 * no link, prefetch or image tag can end a session. A form posts here:
 * `<form method="post" action="/auth/sign-out">`.
 *
 * `signOut` revokes this browser's refresh token on Supabase (local scope:
 * the user's other devices stay signed in) and deletes every session cookie
 * on the redirect, so `getAuthContext` returns null on the next request. If
 * Supabase cannot be reached the cookies still go, and the failure is logged.
 *
 * A POST whose Origin is another site is refused: the session cookie is
 * SameSite=Lax, so a cross-site post carries none anyway, but a same-site
 * neighbour (another port on localhost, a sibling subdomain) would.
 */

import type { NextRequest } from "next/server";

import { afterSignInUrl } from "@pem/auth/redirect";
import { signOut } from "@pem/auth/session";
import { createLogger } from "@pem/observability/logger";

import { env } from "../../../env";
import { supabaseConfig } from "../../../lib/supabase/config";
import { redirectNoStore } from "../redirect-no-store";

const log = createLogger("auth");

/** The request came from this app's own pages, or from a client that sends no Origin. */
function isOwnOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (origin === null) return true;
  return (
    origin === request.nextUrl.origin ||
    origin === new URL(env.NEXT_PUBLIC_SITE_URL).origin
  );
}

export async function POST(request: NextRequest) {
  if (!isOwnOrigin(request))
    return Response.json({ error: "forbidden" }, { status: 403 });
  // 303: the browser follows with a GET, never re-posting the form.
  const response = redirectNoStore(
    afterSignInUrl(env.NEXT_PUBLIC_SITE_URL, "/auth/sign-in"),
    303,
  );
  if (!supabaseConfig) return response;

  const result = await signOut(supabaseConfig, {
    getAll: () => request.cookies.getAll(),
    setAll: (written, headers) => {
      for (const { name, value, options } of written)
        response.cookies.set(name, value, options);
      for (const [key, value] of Object.entries(headers))
        response.headers.set(key, value);
    },
  });
  if (!result.revoked)
    log.warn("auth.sign_out_unrevoked", {
      tags: { code: result.failure ?? "unknown" },
    });
  return response;
}
