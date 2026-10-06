/**
 * Where a sign-in email's link lands (D-STK-7, D-STK-8: auth callbacks are
 * Route Handlers). It trades the link's one-time code for a session, which the
 * server client writes into cookies, then sends the browser on.
 *
 * Redirect rules (@pem/auth/redirect): the origin is always this app's site
 * URL from env.ts, which is localhost whenever the code runs outside a
 * deployment, so a staging sign-in started on localhost comes back to
 * localhost; `next` is honoured only as a path on that origin.
 */

import type { NextRequest } from "next/server";

import { afterSignInUrl } from "@pem/auth/redirect";

import { env } from "../../../env";
import { supabaseConfig } from "../../../lib/supabase/config";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { redirectNoStore } from "../redirect-no-store";

const SIGN_IN_PATH = "/auth/sign-in";

/** The link's two shapes: a PKCE `code`, or a `token_hash` from a custom email template. */
const EMAIL_LINK_TYPES = ["email", "magiclink", "signup", "invite"] as const;
type EmailLinkType = (typeof EMAIL_LINK_TYPES)[number];

function isEmailLinkType(value: string | null): value is EmailLinkType {
  return (EMAIL_LINK_TYPES as readonly (string | null)[]).includes(value);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  // Unconfigured, the sign-in page says so; it is not an expired link.
  if (!supabaseConfig)
    return redirectNoStore(
      afterSignInUrl(env.NEXT_PUBLIC_SITE_URL, SIGN_IN_PATH),
    );
  const failed = afterSignInUrl(env.NEXT_PUBLIC_SITE_URL, SIGN_IN_PATH);
  failed.searchParams.set("state", "expired");

  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type");
  const supabase = await createSupabaseServerClient();

  let error: unknown = new Error("the link carried no code");
  if (code) ({ error } = await supabase.auth.exchangeCodeForSession(code));
  else if (tokenHash && isEmailLinkType(type))
    ({ error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    }));

  if (error) return redirectNoStore(failed);
  return redirectNoStore(
    afterSignInUrl(env.NEXT_PUBLIC_SITE_URL, params.get("next")),
  );
}
