/**
 * This app's Supabase project for the tier (@pem/auth, D-STK-7), from env.ts.
 * Client-safe: it reads only NEXT_PUBLIC_* values. Null when the URL or the
 * publishable key is unset, and then the app serves every request signed out.
 */

import { authConfig } from "@pem/auth/config";

import { env } from "../../env";

export const supabaseConfig = authConfig({
  url: env.NEXT_PUBLIC_SUPABASE_URL,
  publishableKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

/** The config, or a thrown error naming the variables to set. */
export function requireSupabaseConfig() {
  if (!supabaseConfig)
    throw new Error(
      "Supabase Auth is not configured for this tier: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or their _LOCAL or _STAGING forms); see .env.example.",
    );
  return supabaseConfig;
}
