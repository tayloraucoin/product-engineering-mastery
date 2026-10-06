/**
 * A redirect that no cache may keep, for the auth routes. The callback's
 * success path carries new session cookies and sign-out's carries their
 * deletion; a shared cache serving either would hand one user's session state
 * to another. These are the headers Supabase asks for with a session write.
 */

import { NextResponse } from "next/server";

export function redirectNoStore(url: URL, status?: 303): NextResponse {
  const response = NextResponse.redirect(url, status);
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate, max-age=0",
  );
  response.headers.set("Expires", "0");
  response.headers.set("Pragma", "no-cache");
  return response;
}
