/**
 * The `sandbox_access` cookie (D-LAB-32, technical/gate.md "Cookies"):
 * `v1.<accessId>.<slug>.<issuedAt>.<mac>`, where `issuedAt` is whole seconds
 * since the epoch and `mac` is HMAC-SHA256 under SANDBOX_SECRET, label
 * `access-v1`, over everything before it. Scoped to one slug's path, Lax so
 * the email link carries it, and good for 30 days fixed from issue (S10).
 *
 * Verifying reads no database: signature, slug and age only. Whether the
 * access is still live is `checkAccess`'s, after this passes (access-check.ts).
 * Pure: the caller passes the secret and the clock.
 */

import {
  encodeMac,
  isAccessId,
  isUsableSecret,
  matchesMac,
  SANDBOX_MAC_LABELS,
  sandboxMac,
} from "./secret.ts";
import { SANDBOX_SLUG } from "./slug.ts";

export const ACCESS_COOKIE = "sandbox_access";
export const ACCESS_COOKIE_VERSION = "v1";
export const ACCESS_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/** Longer than any cookie this file signs, so a giant value is refused before it is split. */
const MAX_COOKIE_LENGTH = 256;
const SECONDS = /^(0|[1-9][0-9]{0,11})$/;

export type AccessCookie = { accessId: string; slug: string; issuedAt: Date };

function macOf(secret: string, payload: string): string {
  return encodeMac(sandboxMac(secret, SANDBOX_MAC_LABELS.access, payload));
}

/** The cookie's value for one access on one slug, issued at `issuedAt`. */
export function signAccessCookie(secret: string, cookie: AccessCookie): string {
  if (!isUsableSecret(secret)) throw new Error("SANDBOX_SECRET is not usable.");
  if (!isAccessId(cookie.accessId) || !SANDBOX_SLUG.test(cookie.slug))
    throw new Error("The access cookie's fields are not valid.");
  const payload = [
    ACCESS_COOKIE_VERSION,
    cookie.accessId,
    cookie.slug,
    Math.floor(cookie.issuedAt.getTime() / 1000),
  ].join(".");
  return `${payload}.${macOf(secret, payload)}`;
}

/**
 * The access id a cookie names, or null. Null for no secret, a malformed
 * value, another version, a MAC that does not match (compared in constant
 * time), a slug other than the path's, an issue time in the future, or an
 * age of 30 days or more.
 */
export function verifyAccessCookie(
  secret: string | null | undefined,
  value: string | null | undefined,
  expected: { slug: string; now: Date },
): { accessId: string } | null {
  if (!isUsableSecret(secret)) return null;
  if (typeof value !== "string" || value.length > MAX_COOKIE_LENGTH)
    return null;
  const parts = value.split(".");
  if (parts.length !== 5) return null;
  const [version, accessId, slug, issuedAt, mac] = parts as [
    string,
    string,
    string,
    string,
    string,
  ];
  const payload = `${version}.${accessId}.${slug}.${issuedAt}`;
  if (!matchesMac(mac, macOf(secret, payload))) return null;
  if (version !== ACCESS_COOKIE_VERSION) return null;
  if (!isAccessId(accessId) || slug !== expected.slug) return null;
  if (!SECONDS.test(issuedAt)) return null;
  const ageMs = expected.now.getTime() - Number(issuedAt) * 1000;
  if (ageMs < 0 || ageMs >= ACCESS_COOKIE_MAX_AGE_SECONDS * 1000) return null;
  return { accessId };
}

/**
 * How the cookie is set: this slug's path only, HttpOnly, Lax, Secure on any
 * production runtime, and a Max-Age fixed at issue (never refreshed on use).
 * access.ts passes env's `productionRuntime`, not `deployed`, so a production
 * build served off Vercel never sends the cookie over plain HTTP.
 */
export function accessCookieOptions(slug: string, secure: boolean) {
  return {
    path: `/experimental/${slug}`,
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS,
  };
}
