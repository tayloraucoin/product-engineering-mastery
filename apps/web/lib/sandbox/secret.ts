/**
 * SANDBOX_SECRET's one MAC (D-LAB-32). The secret keys three things, each
 * under its own label, so a MAC made for one never verifies as another: the
 * access cookie, the email-link token and the throttle's keys. Rotating the
 * secret sends every device back to the gate and voids link prefills; codes
 * are untouched.
 *
 * Pure: the caller passes the secret (access.ts reads it from env.ts). With
 * no secret, every caller fails closed, and no fallback secret exists.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

import { sandboxSecretProblem } from "./secret-check.ts";

export { sandboxSecretProblem };

export const SANDBOX_MAC_LABELS = {
  access: "access-v1",
  link: "email-link",
  throttle: "throttle",
} as const;

export type SandboxMacLabel =
  (typeof SANDBOX_MAC_LABELS)[keyof typeof SANDBOX_MAC_LABELS];

/**
 * HMAC-SHA256 under `secret` of `label`, a newline, then `data`. No label
 * holds a newline, so the label and the data never run into each other.
 */
export function sandboxMac(
  secret: string,
  label: SandboxMacLabel,
  data: string,
): Buffer {
  return createHmac("sha256", secret).update(`${label}\n${data}`).digest();
}

/** Whether the secret can key a MAC at all: set and long enough. */
export function isUsableSecret(
  secret: string | null | undefined,
): secret is string {
  return typeof secret === "string" && sandboxSecretProblem(secret) === null;
}

/**
 * A MAC as the cookie and the link carry it: base64url, no padding. Compared
 * as text, never decoded: base64url decoding ignores a final symbol's spare
 * bits, so two spellings would verify as one.
 */
export function encodeMac(mac: Uint8Array): string {
  return Buffer.from(mac).toString("base64url");
}

/** Constant-time equality of a presented MAC and the expected one; different lengths are unequal. */
export function matchesMac(presented: string, expected: string): boolean {
  const a = Buffer.from(presented, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** True for a lower-case UUID, as Postgres returns an access id. */
export function isAccessId(value: string): boolean {
  return UUID.test(value);
}
