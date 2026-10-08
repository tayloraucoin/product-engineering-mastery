/**
 * Deleting an experiment's data and erasing a reviewer in /admin (LAB-16,
 * data.md; S27, S28, D-LAB-26 to 28). Pure behind a deps seam, as the
 * Stripe webhook's _lib/handle.ts: `admin-data-data.ts` binds the registry,
 * the Auth admin API (lib/supabase/admin.ts) and @pem/db/sandbox; this file
 * holds the rules, so it runs under `node --test`.
 *
 * - Delete is an admin's only: a developer is refused here before the store
 *   is touched, as the action's guard and the database function each refuse
 *   it too (D-LAB-26). The typed confirm must equal the slug exactly; the
 *   store is never called otherwise.
 * - Erase and find take the email from a POST body only, trimmed and
 *   lower-cased here. The signed-in reviewer is matched by account email:
 *   the account ids are looked up before the store's transaction, since the
 *   lookup is a network call, and passed in.
 * - Nothing here logs an email, a label or a store's error text.
 */

import type { TeamMember } from "../shared/team-check.ts";
import {
  confirmMatches,
  DATA_WORDS,
  recordWords,
  type DataCounts,
  type DataTabView,
  type ErasedCounts,
  type ErasureFoundView,
  type RecordView,
  type ReviewerView,
} from "./admin-data-view.ts";

/** What the rules need of an experiment's config. */
export type DataExperiment = {
  slug: string;
  title: string;
  closedOn: string | null;
};

/** @pem/db/sandbox's erasure functions, bound to the database and the member. */
export type DataStore = {
  countExperimentData(
    member: TeamMember,
    input: { slug: string },
  ): Promise<DataCounts>;
  deleteExperimentData(
    member: TeamMember,
    input: { slug: string },
  ): Promise<{ reviewers: number }>;
  findErasure(
    member: TeamMember,
    input: { email: string; userIds: string[] },
  ): Promise<{
    experiments: number;
    comments: number;
    versions: number;
    views: number;
    nameLabels: { reviewerId: string; slug: string; label: string }[];
  } | null>;
  findReviewerEmails(
    member: TeamMember,
    input: { reviewerId: string },
  ): Promise<{
    slug: string;
    emails: {
      email: string;
      comments: number;
      versions: number;
      views: number;
    }[];
    accounts: {
      userId: string;
      comments: number;
      versions: number;
      views: number;
    }[];
  } | null>;
  eraseEmail(
    member: TeamMember,
    input: { email: string; userIds: string[]; clearLabels: string[] },
  ): Promise<ErasedCounts | null>;
  listActions(
    member: TeamMember,
    input: { page: number },
  ): Promise<{
    rows: {
      id: string;
      at: Date;
      actorEmail: string;
      action: string;
      slug: string | null;
      targetEmail: string | null;
      counts: Record<string, number> | null;
    }[];
    page: number;
    total: number;
  }>;
};

export type DataDeps = {
  /** The registry: an unknown slug never reaches the store. */
  findExperiment(slug: string): DataExperiment | null;
  /** The accounts whose email is this one (trimmed, lower-cased), through the Auth admin API. */
  findAccountIds(email: string): Promise<string[]>;
  /** One account's email, lower-cased, or null when it is gone. */
  findAccountEmail(userId: string): Promise<string | null>;
  store: DataStore;
};

export type DeleteDataResult =
  | { outcome: "deleted"; reviewers: number }
  | { outcome: "mismatch"; message: string }
  | { outcome: "failed"; message: string }
  | { outcome: "refused" };

export type FindReviewerResult =
  | { outcome: "found"; found: ErasureFoundView }
  | { outcome: "no-match"; message: string }
  | { outcome: "invalid"; message: string }
  | { outcome: "failed"; message: string }
  | { outcome: "refused" };

export type EraseReviewerResult =
  | { outcome: "erased"; counts: ErasedCounts }
  | { outcome: "no-match"; message: string }
  | { outcome: "invalid"; message: string }
  | { outcome: "failed"; message: string }
  | { outcome: "refused" };

export const DATA_ACTION_REFUSED = Object.freeze({
  outcome: "refused",
} as const);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+$/;
/** The longest address the form takes. */
export const DATA_EMAIL_MAX = 254;
/** More labels than one erasure lists; a longer list is refused. */
const CLEAR_LABELS_MAX = 500;
const PAGE_SIZE = 50;

const isTeam = (member: TeamMember) =>
  member?.role === "developer" || member?.role === "admin";

const failed = () =>
  ({ outcome: "failed", message: DATA_WORDS.actionFailed }) as const;
const noMatch = () =>
  ({ outcome: "no-match", message: DATA_WORDS.noMatch }) as const;
const invalid = () =>
  ({ outcome: "invalid", message: DATA_WORDS.emailInvalid }) as const;

/** The email as the gate stores it, or null when it is not one. */
export function parseEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= DATA_EMAIL_MAX && EMAIL.test(email) ? email : null;
}

/** The ticked reviewer ids, or null when the list is not one. */
function parseClearLabels(values: unknown): string[] | null {
  if (!Array.isArray(values) || values.length > CLEAR_LABELS_MAX) return null;
  if (!values.every((v) => typeof v === "string" && UUID.test(v))) return null;
  return [...new Set(values as string[])];
}

/** The accounts whose email is `email`: Auth stores it as typed, so both sides are trimmed and lower-cased. */
export function accountIdsFor(
  people: readonly { id: string; email: string | null }[],
  email: string,
): string[] {
  return people
    .filter((p) => p.email !== null && p.email.trim().toLowerCase() === email)
    .map((p) => p.id);
}

const titleOf = (deps: DataDeps) => (slug: string) =>
  deps.findExperiment(slug)?.title ?? slug;

/**
 * Deletes an experiment's data as `member`. A developer is refused before
 * anything is read (D-LAB-26); a confirm that is not the slug, exactly, is
 * refused before the store is called.
 */
export async function deleteExperimentDataWith(
  deps: DataDeps,
  member: TeamMember,
  input: { slug: unknown; confirm: unknown },
): Promise<DeleteDataResult> {
  if (member?.role !== "admin") return DATA_ACTION_REFUSED;
  const experiment =
    typeof input.slug === "string" ? deps.findExperiment(input.slug) : null;
  if (!experiment) return failed();
  if (
    typeof input.confirm !== "string" ||
    !confirmMatches(input.confirm, experiment.slug)
  )
    return { outcome: "mismatch", message: DATA_WORDS.mismatch };
  try {
    const counts = await deps.store.deleteExperimentData(member, {
      slug: experiment.slug,
    });
    return { outcome: "deleted", reviewers: counts.reviewers };
  } catch {
    return failed();
  }
}

/** What an email holds, everywhere, for the erase section; reads only. */
export async function findReviewerWith(
  deps: DataDeps,
  member: TeamMember,
  input: { email: unknown },
): Promise<FindReviewerResult> {
  if (!isTeam(member)) return DATA_ACTION_REFUSED;
  const email = parseEmail(input.email);
  if (!email) return invalid();
  try {
    const userIds = await deps.findAccountIds(email);
    const found = await deps.store.findErasure(member, { email, userIds });
    if (!found) return noMatch();
    const title = titleOf(deps);
    return {
      outcome: "found",
      found: {
        email,
        totals: {
          experiments: found.experiments,
          comments: found.comments,
          versions: found.versions,
          views: found.views,
        },
        nameLabels: found.nameLabels.map((l) => ({
          reviewerId: l.reviewerId,
          label: l.label,
          title: title(l.slug),
        })),
      },
    };
  } catch {
    return failed();
  }
}

/**
 * Erases an email everywhere it reached. The account ids are looked up again
 * here, never taken from the client, so the erasure matches the account as
 * it is now.
 */
export async function eraseReviewerWith(
  deps: DataDeps,
  member: TeamMember,
  input: { email: unknown; clearLabels: unknown },
): Promise<EraseReviewerResult> {
  if (!isTeam(member)) return DATA_ACTION_REFUSED;
  const email = parseEmail(input.email);
  if (!email) return invalid();
  const clearLabels = parseClearLabels(input.clearLabels);
  if (!clearLabels) return failed();
  try {
    const userIds = await deps.findAccountIds(email);
    const counts = await deps.store.eraseEmail(member, {
      email,
      userIds,
      clearLabels,
    });
    if (!counts) return noMatch();
    return {
      outcome: "erased",
      counts: {
        comments: counts.comments,
        versions: counts.versions,
        views: counts.views,
      },
    };
  } catch {
    return failed();
  }
}

/** The Data tab for `member`: the counts, or the error state. A null count is the partial state. */
export async function loadDataTabWith(
  deps: DataDeps,
  member: TeamMember,
  experiment: DataExperiment,
): Promise<DataTabView> {
  const view: DataTabView = {
    slug: experiment.slug,
    title: experiment.title,
    open: experiment.closedOn === null,
    role: member.role,
    counts: null,
    loading: false,
    error: false,
    offline: false,
    toast: null,
    fixture: false,
  };
  try {
    const counts = await deps.store.countExperimentData(member, {
      slug: experiment.slug,
    });
    if (Object.values(counts).every((n) => n === null))
      return { ...view, error: true };
    return { ...view, counts };
  } catch {
    return { ...view, error: true };
  }
}

/**
 * The erase view opened from a reviewer (R6): each email used with the code,
 * a signed-in account's by its account email. Null for an id that is not a
 * reviewer's: the no-match line. Reads only; erases nothing.
 */
export async function loadReviewerWith(
  deps: DataDeps,
  member: TeamMember,
  reviewerId: unknown,
): Promise<ReviewerView | null> {
  if (typeof reviewerId !== "string" || !UUID.test(reviewerId)) return null;
  const found = await deps.store.findReviewerEmails(member, { reviewerId });
  if (!found) return null;
  const emails = new Map<
    string,
    { comments: number; versions: number; views: number }
  >();
  const add = (
    email: string,
    held: { comments: number; versions: number; views: number },
  ) => {
    const sum = emails.get(email) ?? { comments: 0, versions: 0, views: 0 };
    emails.set(email, {
      comments: sum.comments + held.comments,
      versions: sum.versions + held.versions,
      views: sum.views + held.views,
    });
  };
  for (const entry of found.emails) add(entry.email, entry);
  for (const account of found.accounts) {
    const email = await deps.findAccountEmail(account.userId);
    // An account deleted since: its accesses went with it.
    if (email) add(email, account);
  }
  return {
    reviewerId,
    title: titleOf(deps)(found.slug),
    emails: [...emails].map(([email, held]) => ({ email, ...held })),
  };
}

/** A `?page=` value as a page number: anything else is the first page. */
export function parsePage(raw: unknown): number {
  const value = typeof raw === "string" ? Number(raw) : NaN;
  return Number.isInteger(value) && value >= 1 && value <= 10_000 ? value : 1;
}

/** One page of the record, newest first, in words; a page past the end reads the last one. */
export async function loadRecordWith(
  deps: DataDeps,
  member: TeamMember,
  page: number,
): Promise<RecordView> {
  let read = await deps.store.listActions(member, { page });
  const pages = Math.max(1, Math.ceil(read.total / PAGE_SIZE));
  if (page > pages)
    read = await deps.store.listActions(member, { page: pages });
  const title = titleOf(deps);
  return {
    rows: read.rows.map((row) => ({
      id: row.id,
      at: row.at.toISOString(),
      who: row.actorEmail,
      what: recordWords(row, title),
    })),
    page: Math.min(page, pages),
    pages,
  };
}
