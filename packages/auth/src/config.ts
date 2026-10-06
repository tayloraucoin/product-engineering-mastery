/**
 * Which Supabase project a request talks to (D-STK-7). Client-safe: no server
 * import, no SDK, no process.env. The app's env.ts picks the tier's URL and
 * publishable key and hands them here.
 *
 * Supabase names its session cookies after the project: `sb-<ref>-auth-token`,
 * with `.0`, `.1` chunks and `-code-verifier` companions, where `<ref>` is the
 * first label of the URL's hostname (supabase-js 2.117.2, read 2026-10-04). A
 * hosted project's ref is its subdomain; the full local stack's
 * `http://127.0.0.1:54321` gives `127`.
 */

export type AuthConfig = {
  /** `NEXT_PUBLIC_SUPABASE_URL` for the tier. */
  url: string;
  /** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for the tier: the publishable key, or the legacy anon key. */
  publishableKey: string;
};

/** The config when both values are set, else null: an app without a Supabase project still builds and serves. */
export function authConfig(values: {
  url: string | undefined;
  publishableKey: string | undefined;
}): AuthConfig | null {
  if (!values.url || !values.publishableKey) return null;
  return { url: values.url, publishableKey: values.publishableKey };
}

/** The project ref Supabase writes into its cookie names for `url`. */
export function projectRef(url: string): string {
  return new URL(url).hostname.split(".")[0]!;
}

/** The storage key, and so the cookie-name stem, for `url`'s project. */
export function authCookieStem(url: string): string {
  return `sb-${projectRef(url)}-auth-token`;
}

/**
 * Why `value` cannot be the public key, or null when it can. The publishable
 * key is inlined into every browser bundle, so a secret pasted into its slot
 * is published: Supabase's `sb_secret_` keys, and legacy JWT keys whose `role`
 * claim is `service_role`, bypass every row-level-security policy (key formats
 * as STK-11 saw them from the Supabase CLI 2.119.0 and staging on 2026-10-04).
 */
export function publicKeyProblem(name: string, value: string): string | null {
  if (value.startsWith("sb_secret_"))
    return `${name} holds a secret key (sb_secret_…), and every NEXT_PUBLIC_ value reaches the browser. Use the publishable key (sb_publishable_…); the secret key belongs in SUPABASE_SERVICE_ROLE_KEY.`;
  if (jwtRole(value) === "service_role")
    return `${name} holds the service-role JWT, and every NEXT_PUBLIC_ value reaches the browser. Use the anon or publishable key; the service-role key belongs in SUPABASE_SERVICE_ROLE_KEY.`;
  return null;
}

/** The `role` claim of a JWT-shaped value, decoded without verifying; undefined for anything else. */
function jwtRole(value: string): unknown {
  const parts = value.split(".");
  if (parts.length !== 3 || !parts[1]) return undefined;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64)) as { role?: unknown };
    return payload.role;
  } catch {
    return undefined;
  }
}
