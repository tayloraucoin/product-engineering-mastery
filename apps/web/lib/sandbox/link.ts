/**
 * The confirmation email's link (D-LAB-38, technical/gate.md "The
 * confirmation link"): `<site URL>/experimental/<slug>?r=<token>`, where the
 * token is `<accessId>.<mac>` and `mac` is HMAC-SHA256 under SANDBOX_SECRET,
 * label `email-link`, truncated to 128 bits.
 *
 * The token fills the gate's email field and nothing else: it never grants
 * access. A bad, foreign-slug or erased token is ignored silently, so the gate
 * shows blank and says no more than an unknown slug does.
 *
 * Pure: the caller passes the secret and the site URL (access.ts binds env's).
 */

import {
  encodeMac,
  isAccessId,
  isUsableSecret,
  matchesMac,
  SANDBOX_MAC_LABELS,
  sandboxMac,
} from "./secret.ts";

const LINK_MAC_BYTES = 16;
const MAX_TOKEN_LENGTH = 128;

function macOf(secret: string, accessId: string): string {
  return encodeMac(
    sandboxMac(secret, SANDBOX_MAC_LABELS.link, accessId).subarray(
      0,
      LINK_MAC_BYTES,
    ),
  );
}

/** The `?r=` token for one access. */
export function signLinkToken(secret: string, accessId: string): string {
  if (!isUsableSecret(secret)) throw new Error("SANDBOX_SECRET is not usable.");
  if (!isAccessId(accessId)) throw new Error("The access id is not valid.");
  return `${accessId}.${macOf(secret, accessId)}`;
}

/** The access id a token names, or null for no secret or any token this file did not sign. */
export function verifyLinkToken(
  secret: string | null | undefined,
  token: unknown,
): string | null {
  if (!isUsableSecret(secret)) return null;
  if (typeof token !== "string" || token.length > MAX_TOKEN_LENGTH) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [accessId, mac] = parts as [string, string];
  if (!matchesMac(mac, macOf(secret, accessId))) return null;
  return isAccessId(accessId) ? accessId : null;
}

/** The link the confirmation email carries; `siteUrl` is env's, never the request's host. */
export function linkUrlFor(
  siteUrl: string,
  secret: string,
  slug: string,
  accessId: string,
): string {
  const url = new URL(`/experimental/${slug}`, siteUrl);
  url.searchParams.set("r", signLinkToken(secret, accessId));
  return url.toString();
}

export type LinkEmailDeps = {
  secret: string | null | undefined;
  /** The registry: an unknown slug never reaches the database. */
  isKnownSlug(slug: string): boolean;
  /** LAB-3's `findAccessEmail`, bound to the database. */
  findAccessEmail(input: {
    accessId: string;
    slug: string;
  }): Promise<string | null>;
};

/**
 * The email to prefill for a `?r=` token on this slug, or null. Null, with no
 * error, for no token, a token that does not verify, an unknown slug, or an
 * access on another slug, erased, revoked or made signed in.
 */
export async function readLinkEmailWith(
  deps: LinkEmailDeps,
  slug: string,
  token: unknown,
): Promise<string | null> {
  const accessId = verifyLinkToken(deps.secret, token);
  if (accessId === null || !deps.isKnownSlug(slug)) return null;
  return deps.findAccessEmail({ accessId, slug });
}
