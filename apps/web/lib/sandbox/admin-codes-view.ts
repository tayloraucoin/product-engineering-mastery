/**
 * The Access codes tab's words, rows and `?state=` fixtures (LAB-15,
 * access-codes.md). Pure and client-safe: it imports nothing that reaches
 * the database, node:crypto or a code, so the client table can read it. The
 * server's rules are in admin-codes.ts.
 *
 * A row never holds a code or its hash: `listCodes` returns neither, and
 * nothing here adds one. The only code in this file is the fixtures'
 * made-up one, for `codes-shown-once` and `codes-copied`.
 */

import { emailsUsedFlags, type EmailsUsedFlags } from "./emails-used.ts";

/** The form's limits `[ASSUMPTION]`: a name or an address fits; a paragraph does not. */
export const CODE_LABEL_MAX = 120;
export const CODE_DISPLAY_NAME_MAX = 60;

export const CODES_WORDS = {
  heading: "Access codes",
  caption: "Access codes",
  make: "Make a code",
  columns: {
    label: "Label",
    displayName: "Display name",
    emailsUsed: "Emails used",
    lastUsed: "Last used",
    status: "Status",
    actions: "Actions",
  },
  live: "Live",
  revoked: "Revoked",
  replace: "Replace code",
  revoke: "Revoke code",
  label: "Label",
  labelHint: "Who is it for? A name or an email.",
  labelEmpty: "Enter who this code is for.",
  // [ASSUMPTION] the UX file words only the empty label.
  labelTooLong: `Keep the label to ${CODE_LABEL_MAX} characters.`,
  displayName: "Display name",
  displayNameHint: "Other reviewers in this review see this name.",
  displayNameEmpty: "Enter the name other reviewers will see.",
  displayNameTooLong: `Keep the display name to ${CODE_DISPLAY_NAME_MAX} characters.`,
  makeButton: "Make code",
  link: "Link",
  copyCode: "Copy code",
  copyLink: "Copy link",
  copied: "Copied",
  codeCopied: "Code copied.",
  linkCopied: "Link copied.",
  shownOnce:
    "Copy this code now. It won't be shown again. Send the link and the code separately.",
  done: "Done",
  cancel: "Cancel",
  codeRevoked: "Code revoked",
  closed: "This experiment is closed.",
  empty: "No codes yet. Make one for each person who should review this.",
  error: "Couldn't load codes. Reload the page.",
  offline: "You're offline. Codes can't be changed until you're back.",
  makeFailed: "The code wasn't made. Try again.",
  replaceFailed: "The code wasn't replaced. Try again.",
  revokeFailed: "The code wasn't revoked. Try again.",
  missing: "—",
  // [ASSUMPTION] the UX file does not word a code nobody has used yet.
  notYet: "Not yet",
  noEmails: "None yet",
} as const;

export const codeFieldLabel = (label: string) => `Access code for ${label}`;
export const rowMenuLabel = (label: string) => `Actions for ${label}`;
export const shownOnceTitle = (label: string) => `Code for ${label}`;

/** The Replace dialog's question (D-LAB-23): a live code stops; a revoked one comes back. */
export function replaceConfirmation(label: string, revoked: boolean): string {
  return revoked
    ? `Give ${label} a new code? Their comments and review stay theirs.`
    : `Replace ${label}'s code? Their current code stops working. Their comments and review stay theirs.`;
}

export function revokeConfirmation(label: string): string {
  return `Revoke ${label}'s code? They won't be able to open the review again. Anything they've sent stays.`;
}

/** One code as `listCodes` returns it: never the code, never its hash. */
export type CodeListRow = {
  reviewerId: string;
  label: string;
  displayName: string | null;
  emailsUsed: string[] | null;
  lastUsedAt: Date | null;
  revoked: boolean;
};

export type CodeRowView = {
  reviewerId: string;
  label: string;
  displayName: string | null;
  /** Null when "Emails used" failed to load: the cell shows "—". */
  emailsUsed: string[] | null;
  flags: EmailsUsedFlags | null;
  /** ISO instant, or null for never used, or unread. */
  lastUsedAt: string | null;
  revoked: boolean;
};

export type CodesView = {
  slug: string;
  /** Collaborate experiments ask for, and show, a display name (D-LAB-16). */
  collaborate: boolean;
  /** Make and Replace are disabled with the reason; Revoke stays. */
  closed: boolean;
  /** The rows, or null while loading or when the list failed. */
  rows: CodeRowView[] | null;
  loading: boolean;
  error: boolean;
  offline: boolean;
  /**
   * A `?state=` fixture: the dialogs answer locally with made-up results and
   * never reach an action, so no fixture makes or changes a real code.
   */
  fixture: CodesFixture | null;
};

export type CodesFixture = {
  /** The experiment's link, for the fixture's local make and replace. */
  link: string;
  /** Opens on the shown-once step with this made-up code. */
  shownOnce: { label: string; code: string; link: string } | null;
  /** The Copy code button already reads "Copied". */
  copied: boolean;
  /** Opens the Make dialog with its failure line. */
  makeError: boolean;
};

export function codeRowsView(rows: readonly CodeListRow[]): CodeRowView[] {
  return rows.map((row) => ({
    reviewerId: row.reviewerId,
    label: row.label,
    displayName: row.displayName,
    emailsUsed: row.emailsUsed ? [...row.emailsUsed] : null,
    flags: row.emailsUsed ? emailsUsedFlags(row.label, row.emailsUsed) : null,
    lastUsedAt: row.lastUsedAt ? row.lastUsedAt.toISOString() : null,
    revoked: row.revoked,
  }));
}

/** The tab's `?state=` keys (access-codes.md), each registered as `team` in state.ts. */
export const CODES_STATE_KEYS = [
  "codes-empty",
  "codes-loading",
  "codes-error",
  "codes-partial",
  "codes-offline",
  "codes-success",
  "codes-shown-once",
  "codes-copied",
  "codes-make-error",
  "codes-closed",
  "codes-mismatch",
] as const;
export type CodesStateKey = (typeof CODES_STATE_KEYS)[number];

/** A made-up code in the real format; it hashes to nothing issued. */
export const FIXTURE_CODE = "7KQM-29XH-PATR-4WDN";

const fixtureId = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const at = (day: number, hour = 10) =>
  new Date(`2026-09-${String(day).padStart(2, "0")}T${hour}:15:00Z`);

/** Synthetic reviewers for the state keys; never a real person. */
function fixtureRows(): CodeListRow[] {
  return [
    {
      reviewerId: fixtureId(1),
      label: "Ana Ruiz",
      displayName: "Ana",
      emailsUsed: ["ana@example.com"],
      lastUsedAt: at(28),
      revoked: false,
    },
    {
      reviewerId: fixtureId(2),
      label: "ben@example.com",
      displayName: "Ben",
      emailsUsed: ["ben@example.com"],
      lastUsedAt: at(27, 16),
      revoked: false,
    },
    {
      reviewerId: fixtureId(3),
      label: "Chloe Martin",
      displayName: "Chloe",
      emailsUsed: [],
      lastUsedAt: null,
      revoked: false,
    },
    {
      reviewerId: fixtureId(4),
      label: "dev.okafor@example.com",
      displayName: "Dev",
      emailsUsed: ["dev.okafor@example.com"],
      lastUsedAt: at(19),
      revoked: true,
    },
  ];
}

function mismatchRows(): CodeListRow[] {
  const [ana, ben, ...rest] = fixtureRows();
  return [
    { ...ana!, emailsUsed: ["ana@example.com", "ana.ruiz@example.org"] },
    { ...ben!, emailsUsed: ["benjamin@example.com"] },
    ...rest,
  ];
}

/**
 * What the tab shows for a `?state=` key that passed `readSandboxState`, or
 * null for the real tab. `slug` is the real experiment's; the rows are
 * synthetic, and on a collaborate form so every column shows.
 */
export function codesStateView(
  state: string | null,
  slug: string,
  siteUrl: string,
): CodesView | null {
  if (!(CODES_STATE_KEYS as readonly unknown[]).includes(state)) return null;
  const link = experimentLink(siteUrl, slug);
  const fixture: CodesFixture = {
    link,
    shownOnce: null,
    copied: false,
    makeError: false,
  };
  const base: CodesView = {
    slug,
    collaborate: true,
    closed: false,
    rows: codeRowsView(fixtureRows()),
    loading: false,
    error: false,
    offline: false,
    fixture,
  };
  const shownOnce = {
    label: "Ana Ruiz",
    code: FIXTURE_CODE,
    link,
  };
  switch (state as CodesStateKey) {
    case "codes-empty":
      return { ...base, rows: [] };
    case "codes-loading":
      return { ...base, rows: null, loading: true };
    case "codes-error":
      return { ...base, rows: null, error: true };
    case "codes-partial":
      return {
        ...base,
        rows: codeRowsView(
          fixtureRows().map((row) => ({
            ...row,
            emailsUsed: null,
            lastUsedAt: null,
          })),
        ),
      };
    case "codes-offline":
      return { ...base, offline: true };
    case "codes-success":
      return base;
    case "codes-shown-once":
      return { ...base, fixture: { ...fixture, shownOnce } };
    case "codes-copied":
      return { ...base, fixture: { ...fixture, shownOnce, copied: true } };
    case "codes-make-error":
      return { ...base, fixture: { ...fixture, makeError: true } };
    case "codes-closed":
      return { ...base, closed: true };
    case "codes-mismatch":
      return { ...base, rows: codeRowsView(mismatchRows()) };
  }
}

/** The link handed with a code: the site's URL plus the experiment, nothing more (no `?r=`). */
export function experimentLink(siteUrl: string, slug: string): string {
  return new URL(`/experimental/${slug}`, siteUrl).toString();
}
