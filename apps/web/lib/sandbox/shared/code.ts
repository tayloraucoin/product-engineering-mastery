/**
 * Access codes (D-LAB-31, technical/gate.md "Codes"). A code is 16 symbols of
 * Crockford base32 (80 random bits), shown as four groups of four. Input is
 * forgiving: lower case, spaces, dashes and a pasted newline all work, and the
 * confusables O, I and L read as 0, 1 and 1. Anything else that does not
 * leave exactly 16 symbols is a wrong code.
 *
 * Stored and compared only as SHA-256 of the normalised symbols. Changing the
 * normalisation or the hash invalidates every issued code (door 3). A code is
 * never logged and never put in a URL.
 */

import { createHash, randomBytes } from "node:crypto";

/** Crockford's alphabet: digits and letters without I, L, O and U. */
export const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const CODE_LENGTH = 16;

const CODE_BYTES = (CODE_LENGTH * 5) / 8;
const SYMBOLS = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`);

/**
 * The 16 symbols a typed code stands for, or null for a wrong code.
 *
 * Only ASCII is upper-cased, and everything outside `0-9A-Z` is dropped
 * before the confusables are mapped: `toUpperCase` would turn `ß` into `SS`
 * and the dotless `ı` into `I`, inventing symbols the reviewer never typed.
 * `U` is not a Crockford symbol and stays a wrong code.
 */
export function normaliseCode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const symbols = input
    .replace(/[a-z]/g, (c) => c.toUpperCase())
    .replace(/[^0-9A-Z]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1");
  return SYMBOLS.test(symbols) ? symbols : null;
}

/** SHA-256 of a normalised code, as `sandbox_reviewers.code_hash` holds it. */
export function hashCode(normalised: string): Uint8Array {
  return new Uint8Array(createHash("sha256").update(normalised).digest());
}

/** Groups 16 symbols as the shown-once dialog shows them: `7KQM-29XH-PATR-4WDN`. */
export function formatCode(normalised: string): string {
  return normalised.match(/.{4}/g)!.join("-");
}

/** A new code from `crypto.randomBytes`, grouped for display. */
export function generateCode(): string {
  const bytes = randomBytes(CODE_BYTES);
  let bits = 0;
  let value = 0;
  let symbols = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      symbols += CODE_ALPHABET[(value >> bits) & 31];
    }
    value &= (1 << bits) - 1;
  }
  return formatCode(symbols);
}
