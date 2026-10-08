/**
 * The check env.ts runs on SANDBOX_SECRET (D-LAB-32). It sits apart from
 * secret.ts because env.ts reaches the browser bundle, so this file imports
 * nothing from node. The message names the variable and never the value.
 */

export const SANDBOX_SECRET_MIN_BYTES = 32;

/** Why a SANDBOX_SECRET value is refused, or null when it is long enough. */
export function sandboxSecretProblem(value: string): string | null {
  return new TextEncoder().encode(value).length < SANDBOX_SECRET_MIN_BYTES
    ? `SANDBOX_SECRET must be at least ${SANDBOX_SECRET_MIN_BYTES} bytes; generate one with \`openssl rand -base64 48\`.`
    : null;
}
