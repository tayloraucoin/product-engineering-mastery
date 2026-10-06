/**
 * Sign-out (STK-24). A POST only: Next answers any other method with 405, so
 * no link, prefetch or image tag can end a session. A form posts here:
 * `<form method="post" action="/auth/sign-out">`.
 *
 * `signOut` revokes this browser's refresh token on Supabase (local scope:
 * the user's other devices stay signed in) and deletes every session cookie
 * on the redirect, so `getAuthContext` returns null on the next request. If
 * Supabase cannot be reached the cookies still go, and the failure is logged.
 */

import { NextResponse, type NextRequest } from "next/server";

import { afterSignInUrl } from "@pem/auth/redirect";
import { signOut } from "@pem/auth/session";
import { createLogger } from "@pem/observability/logger";

import { env } from "../../../env";
import { supabaseConfig } from "../../../lib/supabase/config";

const log = createLogger("auth");

export async function POST(request: NextRequest) {
  // 303: the browser follows with a GET, never re-posting the form.
  const response = NextResponse.redirect(
    afterSignInUrl(env.NEXT_PUBLIC_SITE_URL, "/auth/sign-in"),
    303,
  );
  // The response deletes the session; no cache may keep or replay it.
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate, max-age=0",
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
  if (!result.revoked) log.warn("auth.sign_out_unrevoked");
  return response;
}
