/**
 * The one place the session is refreshed (D-STK-7). Before a page renders,
 * `updateSession` asks Supabase for the user, which refreshes an expired token,
 * and deletes another project's session cookies left by a tier switch. Every
 * cookie it writes goes on the request, so Server Components in this request
 * read the fresh session, and on the response, for the browser.
 *
 * It authorizes nothing: a page, action or route handler asks
 * `getAuthContext()` (lib/supabase/context.ts).
 */

import { NextResponse, type NextRequest } from "next/server";

import {
  clearSessionCookies,
  updateSession,
  type SessionCookieStore,
} from "@pem/auth/session";

import { supabaseConfig } from "./lib/supabase/config";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const cookies: SessionCookieStore = {
    getAll: () => request.cookies.getAll(),
    setAll: (written, headers) => {
      for (const { name, value } of written) {
        if (value === "") request.cookies.delete(name);
        else request.cookies.set(name, value);
      }
      // A fresh response carries the updated request; each call receives every write so far.
      response = NextResponse.next({ request });
      for (const { name, value, options } of written)
        response.cookies.set(name, value, options);
      for (const [header, value] of Object.entries(headers))
        response.headers.set(header, value);
    },
  };

  // A tier with no project still sheds the last project's cookies.
  if (!supabaseConfig) clearSessionCookies(cookies);
  else await updateSession(supabaseConfig, cookies);
  return response;
}

export const config = {
  // Every page and route, but not static files, images or Stripe's webhook,
  // which carry no session: the money path never waits on the auth seam.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks/stripe|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
