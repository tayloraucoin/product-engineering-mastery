/**
 * A failed parse as the fields that failed (D-STK-8). A form shows each message
 * beside its field, and a service raises it as `Invalid` with the same map, so
 * both name the field the same way. Pure: no transport, no framework.
 */

import type { z } from "zod";

/** Field path, dotted (`address.city`), to its messages; `_` for the input as a whole. */
export type FieldErrors = Record<string, string[]>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
