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
