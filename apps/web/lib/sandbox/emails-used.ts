/**
 * "Emails used" flags (access-codes.md, S7): the gate never compares what a
 * reviewer types with anything, so /admin shows the mismatch. Pure and
 * client-safe; the Reviewers tab (LAB-22) reuses it.
 *
 * - `several`: more than one distinct email was typed with the code.
 * - `differsFromLabel`: the label is itself an email address and a typed one
 *   differs from it, ignoring case and spaces at either end. A label that is
 *   a name is never compared, so never flagged.
 */

export type EmailsUsedFlags = { several: boolean; differsFromLabel: boolean };

export const EMAILS_USED_WORDS = {
  several: (n: number) => `${n} emails used with this code`,
  differsFromLabel: "Email differs from the label",
} as const;

/** One `@` with something on each side and no spaces: an address, not a name. */
const EMAIL = /^[^\s@]+@[^\s@]+$/;

const normal = (value: string) => value.trim().toLowerCase();

export function isEmailLabel(label: string): boolean {
  return EMAIL.test(label.trim());
}

export function emailsUsedFlags(
  label: string,
  emails: readonly string[],
): EmailsUsedFlags {
  const distinct = new Set(emails.map(normal).filter(Boolean));
  const labelEmail = isEmailLabel(label) ? normal(label) : null;
  return {
    several: distinct.size > 1,
    differsFromLabel:
      labelEmail !== null &&
      [...distinct].some((email) => email !== labelEmail),
  };
}
