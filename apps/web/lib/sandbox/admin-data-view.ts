/**
 * The Data tab's and the Data page's words, view models and `?state=`
 * fixtures (LAB-16, data.md). Pure and client-safe: it imports nothing that
 * reaches the database or the Auth API, so the client leaves can read it.
 * The server's rules are in admin-data.ts.
 *
 * The record's words (D-LAB-28) never name a reviewer: a record row holds
 * an action name, a slug, counts and the team member who acted, and nothing
 * here adds more. A role change names its team member (LAB-9).
 */

import type { TeamRole } from "./team-check.ts";

/** What an experiment holds, by kind; null for a count that failed to load. */
export type DataCounts = {
  reviewers: number | null;
  codes: number | null;
  views: number | null;
  comments: number | null;
  reviews: number | null;
  versions: number | null;
  teamNotes: number | null;
};

/** What an email holds across every experiment (the find result). */
export type ErasureTotals = {
  experiments: number;
  comments: number;
  versions: number;
  views: number;
};

/** A name label the erasure leaves unless ticked (D-LAB-27), with its experiment's title. */
export type NameLabelView = {
  reviewerId: string;
  label: string;
  title: string;
};

/** One erase entry: an email and what it holds, everywhere. */
export type ErasureFoundView = {
  email: string;
  totals: ErasureTotals;
  nameLabels: NameLabelView[];
};

/** What one erasure removed (the toast). */
export type ErasedCounts = {
  comments: number;
  versions: number;
  views: number;
};

/** An email used with one code, and what came through it on that code. */
export type ReviewerEmailView = {
  email: string;
  comments: number;
  versions: number;
  views: number;
};

/** The erase view opened from a reviewer (R6): every email used with the code. */
export type ReviewerView = {
  reviewerId: string;
  title: string;
  emails: ReviewerEmailView[];
};

export type RecordRowView = {
  id: string;
  /** ISO instant. */
  at: string;
  who: string;
  what: string;
};

export type RecordView = {
  rows: RecordRowView[];
  page: number;
  pages: number;
};

export const DATA_WORDS = {
  heading: "Data",
  missing: "—",
  nothingHeld: (title: string) => `${title} holds no reviewer data.`,
  consequence: (title: string) =>
    `Deletes every access code, view, comment, review and team note for ${title}. The experiment stays in the code, empty. This can't be undone.`,
  open: "It's open: reviewers lose access at once.",
  confirmLabel: (slug: string) => `Type ${slug} to confirm`,
  // [ASSUMPTION] data.md words the rule only in the label; this names why the button waits.
  confirmHint: "The button turns on when the text matches exactly.",
  developerOnly: "Only an admin can delete this data.",
  error: "Couldn't load this. Reload the page.",
  partial:
    "Some counts didn't load, so deleting is paused. Reload to try again.",
  offline: "You're offline. Nothing can be deleted until you're back.",
  actionFailed: "Nothing was deleted. Try again.",
  // [ASSUMPTION] the server refused a confirm that no longer matched.
  mismatch: "The text didn't match the experiment's name. Nothing was deleted.",
  eraseHeading: "Erase a reviewer",
  emailLabel: "Reviewer's email",
  // [ASSUMPTION] data.md words no empty or malformed email.
  emailInvalid: "Enter the reviewer's email address.",
  find: "Find",
  noMatch: "Nothing is held for that email.",
  whatElse: "What else goes",
  whatElseEmails: 'The email is removed from every "Emails used" list.',
  whatElseOnly:
    'A code used only by this email is revoked, and its label becomes "Erased reviewer".',
  whatElseLabels: "A label that holds this email is replaced the same way.",
  clearLabel: (label: string, title: string) =>
    `Also clear the label '${label}' on ${title}`,
  undoable: "This can't be undone.",
  erase: (email: string) => `Erase everything from ${email}`,
  cancel: "Cancel",
  fromReviewer: (n: number) =>
    n === 1
      ? "This code was used with 1 email."
      : `This code was used with ${n} emails. Each is erased separately.`,
  // [ASSUMPTION] data.md words no code used with no email yet.
  fromReviewerNone: "This code hasn't been used with any email.",
  recordHeading: "Record of actions",
  recordCaption: "Record of actions",
  recordEmpty: "No actions recorded yet.",
  columns: { when: "When", who: "Who", what: "What" },
  newer: "Newer",
  older: "Older",
  pageOf: (page: number, pages: number) => `Page ${page} of ${pages}`,
} as const;

const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`;
const shown = (n: number | null, one: string, many?: string) =>
  n === null
    ? `${DATA_WORDS.missing} ${many ?? `${one}s`}`
    : plural(n, one, many);

/** "Pricing 2026 holds: 5 access codes, 41 views, 23 comments, 4 reviews (7 versions), 6 team notes." */
export function holdsLine(title: string, c: DataCounts): string {
  const reviews =
    c.reviews === null || c.versions === null
      ? `${shown(c.reviews, "review")} (${shown(c.versions, "version")})`
      : `${plural(c.reviews, "review")} (${plural(c.versions, "version")})`;
  return `${title} holds: ${shown(c.codes, "access code")}, ${shown(c.views, "view")}, ${shown(c.comments, "comment")}, ${reviews}, ${shown(c.teamNotes, "team note")}.`;
}

/** "Delete data from 5 reviewers", or the experiment's data when only team notes are held. */
export const deleteButtonLabel = (reviewers: number) =>
  reviewers > 0
    ? `Delete data from ${plural(reviewers, "reviewer")}`
    : "Delete this experiment's data";

/** The toast: "Data deleted from 5 reviewers". */
export const deletedToast = (reviewers: number) =>
  reviewers > 0
    ? `Data deleted from ${plural(reviewers, "reviewer")}`
    : "Data deleted";

/** The confirm field matches the slug exactly: case and spaces count. */
export const confirmMatches = (typed: string, slug: string) => typed === slug;

/** "14 comments, 3 review versions and 41 views", with "and" before the last. */
function erasedList(c: ErasedCounts, joinLast: string): string {
  const parts = [
    plural(c.comments, "comment"),
    plural(c.versions, "review version"),
    plural(c.views, "view"),
  ];
  return `${parts.slice(0, -1).join(", ")}${joinLast}${parts.at(-1)}`;
}

/** The toast: "Erased 14 comments, 3 review versions and 41 views." */
export const erasedToast = (c: ErasedCounts) =>
  `Erased ${erasedList(c, " and ")}.`;

/** "ana@example.com: 2 experiments, 14 comments, 3 review versions, 41 views." */
export const foundLine = (email: string, t: ErasureTotals) =>
  `${email}: ${plural(t.experiments, "experiment")}, ${erasedList(t, ", ")}.`;

/** The confirm dialog's sentence: what goes, then that it can't be undone. */
export const eraseConfirmation = (t: ErasureTotals) =>
  `This erases ${erasedList(t, " and ")} across ${plural(t.experiments, "experiment")}. ${DATA_WORDS.undoable}`;

/** A reviewer-view entry's counts: "On this code: 3 comments, 1 review version, 12 views." */
export const onThisCode = (e: ReviewerEmailView) =>
  `On this code: ${erasedList(e, ", ")}.`;

/**
 * The record's words for one row (data.md). An action name this module does
 * not know reads as the name itself `[ASSUMPTION]`, so a later ticket's row
 * shows before its words land.
 */
export function recordWords(
  row: {
    action: string;
    slug: string | null;
    targetEmail: string | null;
    counts: Record<string, number> | null;
  },
  titleOf: (slug: string) => string,
): string {
  const on = row.slug ? ` on ${titleOf(row.slug)}` : "";
  const n = (key: string) => row.counts?.[key] ?? 0;
  switch (row.action) {
    case "code-made":
      return `Made a code${on}`;
    case "code-replaced":
      return `Replaced a code${on}`;
    case "code-revoked":
      return `Revoked a code${on}`;
    case "role-change":
      // [ASSUMPTION] the row holds no role until LAB-28 records it.
      return row.targetEmail
        ? `Changed the role of ${row.targetEmail}`
        : "Changed a team member's role";
    case "data-deleted":
      return n("reviewers") > 0
        ? `Deleted data from ${plural(n("reviewers"), "reviewer")}${on}`
        : `Deleted team notes${on}`;
    case "reviewer-erased":
      return `Erased a reviewer: ${plural(n("comments"), "comment")}, ${plural(n("reviewVersions"), "review version")}, ${plural(n("viewEvents"), "view")}`;
    default:
      return row.action;
  }
}

// --- The Data tab -------------------------------------------------------------

export type DataTabView = {
  slug: string;
  title: string;
  open: boolean;
  role: TeamRole;
  /** Null while loading or when every count failed. */
  counts: DataCounts | null;
  loading: boolean;
  error: boolean;
  offline: boolean;
  /** A fixture's toast on arrival: `data-tab-deleted` or `data-tab-action-error`. */
  toast: { kind: "deleted"; reviewers: number } | { kind: "failed" } | null;
  /** A `?state=` fixture: the delete answers locally and never reaches the action. */
  fixture: boolean;
};

const isComplete = (c: DataCounts): c is { [K in keyof DataCounts]: number } =>
  Object.values(c).every((n) => n !== null);

/** True when the experiment holds anything at all; team notes alone count (data.md). */
export const holdsAnything = (c: { [K in keyof DataCounts]: number }) =>
  Object.values(c).some((n) => n > 0);

/** What the tab shows under its counts. */
export type DeletePanel =
  | { kind: "none" }
  | { kind: "nothing-held" }
  | { kind: "developer" }
  | { kind: "partial" }
  | { kind: "admin"; reviewers: number; enabled: boolean };

/** The panel under the counts: a developer never gets a field or a button (D-LAB-26). */
export function deletePanel(view: DataTabView, online = true): DeletePanel {
  if (!view.counts) return { kind: "none" };
  if (isComplete(view.counts) && !holdsAnything(view.counts))
    return { kind: "nothing-held" };
  if (view.role !== "admin") return { kind: "developer" };
  if (!isComplete(view.counts)) return { kind: "partial" };
  return {
    kind: "admin",
    reviewers: view.counts.reviewers,
    enabled: online && !view.offline,
  };
}

/** The tab's `?state=` keys (data.md), each registered as `team` in state.ts. */
export const DATA_TAB_STATE_KEYS = [
  "data-tab-empty",
  "data-tab-loading",
  "data-tab-error",
  "data-tab-partial",
  "data-tab-offline",
  "data-tab-deleted",
  "data-tab-developer",
  "data-tab-action-error",
] as const;
export type DataTabStateKey = (typeof DATA_TAB_STATE_KEYS)[number];

/** Synthetic counts, as data.md's example. */
export const FIXTURE_COUNTS: { [K in keyof DataCounts]: number } = {
  reviewers: 5,
  codes: 5,
  views: 41,
  comments: 23,
  reviews: 4,
  versions: 7,
  teamNotes: 6,
};
const ZERO_COUNTS: { [K in keyof DataCounts]: number } = {
  reviewers: 0,
  codes: 0,
  views: 0,
  comments: 0,
  reviews: 0,
  versions: 0,
  teamNotes: 0,
};

/**
 * What the tab shows for a `?state=` key that passed `readSandboxState`, or
 * null for the real tab. The experiment is the real one; the counts are
 * synthetic, and the role is an admin's except on `data-tab-developer`.
 */
export function dataTabStateView(
  state: string | null,
  experiment: { slug: string; title: string; open: boolean },
): DataTabView | null {
  if (!(DATA_TAB_STATE_KEYS as readonly unknown[]).includes(state)) return null;
  const base: DataTabView = {
    ...experiment,
    role: "admin",
    counts: { ...FIXTURE_COUNTS },
    loading: false,
    error: false,
    offline: false,
    toast: null,
    fixture: true,
  };
  switch (state as DataTabStateKey) {
    case "data-tab-empty":
      return { ...base, counts: { ...ZERO_COUNTS } };
    case "data-tab-loading":
      return { ...base, counts: null, loading: true };
    case "data-tab-error":
      return { ...base, counts: null, error: true };
    case "data-tab-partial":
      return {
        ...base,
        counts: { ...FIXTURE_COUNTS, views: null, versions: null },
      };
    case "data-tab-offline":
      return { ...base, offline: true };
    case "data-tab-deleted":
      return {
        ...base,
        counts: { ...ZERO_COUNTS },
        toast: { kind: "deleted", reviewers: FIXTURE_COUNTS.reviewers },
      };
    case "data-tab-developer":
      return { ...base, role: "developer" };
    case "data-tab-action-error":
      return { ...base, toast: { kind: "failed" } };
  }
}

// --- The Data page ------------------------------------------------------------

export type DataPageView = {
  /** Opened from a reviewer (`?reviewer=`): the code's emails, or null for no match. */
  reviewer: ReviewerView | null | undefined;
  /** The erase section opens on this result (fixtures only; a real find arrives from the action). */
  found: ErasureFoundView | null;
  /** The erase section opens on the no-match line (fixture). */
  noMatch: boolean;
  /** The record, or null while loading or when it failed. */
  record: RecordView | null;
  loading: boolean;
  error: boolean;
  offline: boolean;
  toast: { kind: "erased"; counts: ErasedCounts } | { kind: "failed" } | null;
  /** A `?state=` fixture: find and erase answer locally, never reaching an action. */
  fixture: boolean;
};

/** The page's `?state=` keys (data.md), each registered as `team` in state.ts. */
export const DATA_PAGE_STATE_KEYS = [
  "data-page-loading",
  "data-page-error",
  "data-page-offline",
  "data-page-no-match",
  "data-page-erase-found",
  "data-page-reviewer",
  "data-page-erased",
  "data-page-action-error",
  "data-page-record-empty",
  "data-page-success",
] as const;
export type DataPageStateKey = (typeof DATA_PAGE_STATE_KEYS)[number];

const fixtureId = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

/** A synthetic find for ana@example.com, as data.md's example. */
export const FIXTURE_FOUND: ErasureFoundView = {
  email: "ana@example.com",
  totals: { experiments: 2, comments: 14, versions: 3, views: 41 },
  nameLabels: [
    { reviewerId: fixtureId(1), label: "Ana Ruiz", title: "Pricing 2026" },
  ],
};

export const FIXTURE_ERASED: ErasedCounts = {
  comments: 14,
  versions: 3,
  views: 41,
};

const FIXTURE_REVIEWER: ReviewerView = {
  reviewerId: fixtureId(1),
  title: "Pricing 2026",
  emails: [
    { email: "ana@example.com", comments: 9, versions: 2, views: 30 },
    { email: "ana.ruiz@example.org", comments: 5, versions: 1, views: 11 },
  ],
};

/** Synthetic record rows: team members' emails only, never a reviewer's. */
function fixtureRecord(): RecordView {
  const at = (day: number, hour: number) =>
    new Date(Date.UTC(2026, 9, day, hour, 5)).toISOString();
  const rows: Omit<RecordRowView, "id">[] = [
    {
      at: at(6, 16),
      who: "sam@example.com",
      what: "Erased a reviewer: 14 comments, 3 review versions, 41 views",
    },
    {
      at: at(6, 11),
      who: "sam@example.com",
      what: "Deleted data from 5 reviewers on Pricing 2026",
    },
    {
      at: at(5, 15),
      who: "lee@example.com",
      what: "Changed the role of ben@example.com",
    },
    {
      at: at(5, 9),
      who: "lee@example.com",
      what: "Replaced a code on Pricing 2026",
    },
    {
      at: at(4, 14),
      who: "sam@example.com",
      what: "Revoked a code on Pricing 2026",
    },
    {
      at: at(2, 10),
      who: "sam@example.com",
      what: "Made a code on Pricing 2026",
    },
  ];
  return {
    rows: rows.map((row, i) => ({ id: fixtureId(100 + i), ...row })),
    page: 1,
    pages: 1,
  };
}

/** What the page shows for a `?state=` key that passed `readSandboxState`, or null for the real page. */
export function dataPageStateView(state: string | null): DataPageView | null {
  if (!(DATA_PAGE_STATE_KEYS as readonly unknown[]).includes(state))
    return null;
  const base: DataPageView = {
    reviewer: undefined,
    found: null,
    noMatch: false,
    record: fixtureRecord(),
    loading: false,
    error: false,
    offline: false,
    toast: null,
    fixture: true,
  };
  switch (state as DataPageStateKey) {
    case "data-page-loading":
      return { ...base, record: null, loading: true };
    case "data-page-error":
      return { ...base, record: null, error: true };
    case "data-page-offline":
      return { ...base, offline: true };
    case "data-page-no-match":
      return { ...base, noMatch: true };
    case "data-page-erase-found":
      return { ...base, found: FIXTURE_FOUND };
    case "data-page-reviewer":
      return { ...base, reviewer: FIXTURE_REVIEWER };
    case "data-page-erased":
      return { ...base, toast: { kind: "erased", counts: FIXTURE_ERASED } };
    case "data-page-action-error":
      return { ...base, found: FIXTURE_FOUND, toast: { kind: "failed" } };
    case "data-page-record-empty":
      return { ...base, record: { rows: [], page: 1, pages: 1 } };
    case "data-page-success":
      return base;
  }
}
