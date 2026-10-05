/**
 * Where a sign-in may send the browser (the devs_call of STK-12). Client-safe
 * and pure. Two rules close the open redirect:
 *   1. the origin is always the app's own site URL, the one env.ts resolves
 *      (localhost whenever the code runs outside a deployment), never the
 *      request's Host or X-Forwarded-Host;
 *   2. `next` is a path on that origin: it starts with one `/`, and anything
 *      else (`//host`, `/\host`, `https://…`, a control character) becomes `/`.
 */

/** Where a signed-in user lands when `next` is absent or refused. */
export const DEFAULT_AFTER_SIGN_IN = "/";

/** `next` when it is a same-origin path, else the default. */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/")) return DEFAULT_AFTER_SIGN_IN;
  if (next.startsWith("//") || next.startsWith("/\\"))
    return DEFAULT_AFTER_SIGN_IN;
  // eslint-disable-next-line no-control-regex -- control characters are what this refuses
  if (/[\u0000-\u001f\u007f\\]/.test(next)) return DEFAULT_AFTER_SIGN_IN;
  return next;
}

/** The absolute URL for `next` on the site's own origin. */
export function afterSignInUrl(
  siteUrl: string,
  next: string | null | undefined,
): URL {
  const origin = new URL(siteUrl).origin;
  const url = new URL(safeNextPath(next), origin);
  // A path that still resolved elsewhere is refused, whatever it looked like.
  return url.origin === origin ? url : new URL(DEFAULT_AFTER_SIGN_IN, origin);
}

/** The callback URL a sign-in email links back to, carrying `next`. */
export function callbackUrl(
  siteUrl: string,
  callbackPath: string,
  next: string | null | undefined,
): string {
  const url = new URL(callbackPath, new URL(siteUrl).origin);
  const path = safeNextPath(next);
  if (path !== DEFAULT_AFTER_SIGN_IN) url.searchParams.set("next", path);
  return url.toString();
}
