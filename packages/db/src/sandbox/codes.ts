/**
 * Access codes in /admin (LAB-15, access-codes.md, D-LAB-23, D-LAB-28): list
 * an experiment's codes, make one, replace one in place, revoke one. Team
 * only: a reviewer viewer is refused before any query.
 *
 * Only the SHA-256 of a code reaches this module (gate.md); the code itself
 * never does, and no function returns a hash. Every write and its record row
 * share one transaction; the row names the action and the slug, never the
 * label, display name, an email, the code or its hash.
 *
 * Replace and revoke match the reviewer by id and slug together, so an id
 * from another slug changes nothing. Replace rewrites `code_hash`, raises
 * `code_version` and clears `revoked_at` on the same row (D-LAB-23): every
 * access made with the old code stops passing `checkAccess`, and the
 * reviewer's pins, comments and versions stay theirs.
 */

import { and, desc, eq, inArray, isNotNull, max, sql } from "drizzle-orm";

import { sandboxAccesses } from "../schema/sandbox/accesses.ts";
import { sandboxReviewers } from "../schema/sandbox/reviewers.ts";
import {
  SANDBOX_SLUG_MAX,
  SANDBOX_SLUG_PATTERN,
} from "../schema/sandbox/columns.ts";
import { recordAction } from "./actions.ts";
import {
  isUuid,
  requireTeam,
  SandboxAccessError,
  type SandboxDb,
  type Viewer,
} from "./viewer.ts";

/** The record's names for the three code actions; LAB-16 renders their words. */
export const CODE_ACTIONS = Object.freeze({
  made: "code-made",
  replaced: "code-replaced",
  revoked: "code-revoked",
} as const);

export const CODES_INPUT_INVALID = "The code input is not valid.";

/**
 * A bound on stored text, not the form's limit (the app words that): it
 * keeps a malformed call from writing an unbounded label.
 */
const TEXT_MAX = 500;
const CODE_HASH_BYTES = 32;
const SLUG = new RegExp(SANDBOX_SLUG_PATTERN);

export type CodeRow = {
  reviewerId: string;
  label: string;
  /** Collaborate experiments only (D-LAB-16); null on a private one. */
  displayName: string | null;
  /** Distinct emails typed at the gate, oldest first; null when they could not be read. */
  emailsUsed: string[] | null;
  /** The latest access's last sight, typed or signed in; null for unused, or unread. */
  lastUsedAt: Date | null;
  revoked: boolean;
};

function validSlug(slug: unknown): string {
  if (
    typeof slug !== "string" ||
    slug.length > SANDBOX_SLUG_MAX ||
    !SLUG.test(slug)
  )
    throw new SandboxAccessError(CODES_INPUT_INVALID);
  return slug;
}

function validText(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > TEXT_MAX ||
    value !== value.trim()
  )
    throw new SandboxAccessError(CODES_INPUT_INVALID);
  return value;
}

function validHash(value: unknown): Buffer {
  if (!(value instanceof Uint8Array) || value.length !== CODE_HASH_BYTES)
    throw new SandboxAccessError(CODES_INPUT_INVALID);
  return Buffer.from(value);
}

function validReviewerId(value: unknown): string {
  // Postgres echoes a malformed uuid in its error; refuse it first.
  if (!isUuid(value)) throw new SandboxAccessError(CODES_INPUT_INVALID);
  return value;
}

/** True when another reviewer, on any slug, already holds this hash. */
async function hashTaken(db: SandboxDb, hash: Buffer): Promise<boolean> {
  const [row] = await db
    .select({ id: sandboxReviewers.id })
    .from(sandboxReviewers)
    .where(eq(sandboxReviewers.codeHash, hash));
  return row !== undefined;
}

/**
 * An experiment's codes, newest first. A failed read of the accesses leaves
 * the rows with `emailsUsed` and `lastUsedAt` null: the page's partial state.
 */
export async function listCodes(
  db: SandboxDb,
  viewer: Viewer,
  input: { slug: string },
): Promise<CodeRow[]> {
  requireTeam(viewer);
  const slug = validSlug(input?.slug);
  const reviewers = await db
    .select({
      reviewerId: sandboxReviewers.id,
      label: sandboxReviewers.label,
      displayName: sandboxReviewers.displayName,
      revokedAt: sandboxReviewers.revokedAt,
    })
    .from(sandboxReviewers)
    .where(eq(sandboxReviewers.slug, slug))
    .orderBy(desc(sandboxReviewers.createdAt), desc(sandboxReviewers.id));
  if (reviewers.length === 0) return [];

  const ids = reviewers.map((r) => r.reviewerId);
  let emails: Map<string, string[]> | null = new Map();
  let lastUsed: Map<string, Date | null> | null = new Map();
  try {
    const typed = await db
      .select({
        reviewerId: sandboxAccesses.reviewerId,
        email: sandboxAccesses.email,
      })
      .from(sandboxAccesses)
      .where(
        and(
          inArray(sandboxAccesses.reviewerId, ids),
          isNotNull(sandboxAccesses.email),
        ),
      )
      .groupBy(sandboxAccesses.reviewerId, sandboxAccesses.email)
      .orderBy(sql`min(${sandboxAccesses.createdAt})`, sandboxAccesses.email);
    for (const row of typed) {
      const list = emails.get(row.reviewerId) ?? [];
      list.push(row.email!);
      emails.set(row.reviewerId, list);
    }
    const seen = await db
      .select({
        reviewerId: sandboxAccesses.reviewerId,
        at: max(sandboxAccesses.lastSeenAt),
      })
      .from(sandboxAccesses)
      .where(inArray(sandboxAccesses.reviewerId, ids))
      .groupBy(sandboxAccesses.reviewerId);
    for (const row of seen) lastUsed.set(row.reviewerId, row.at);
  } catch {
    emails = null;
    lastUsed = null;
  }

  return reviewers.map((r) => ({
    reviewerId: r.reviewerId,
    label: r.label,
    displayName: r.displayName,
    emailsUsed: emails ? (emails.get(r.reviewerId) ?? []) : null,
    lastUsedAt: lastUsed ? (lastUsed.get(r.reviewerId) ?? null) : null,
    revoked: r.revokedAt !== null,
  }));
}

/**
 * A new reviewer holding the code whose hash is given, recorded as
 * `code-made`. `{ taken: true }` when the hash is already issued (80 random
 * bits: the caller generates once more), with nothing written.
 */
export async function makeCode(
  db: SandboxDb,
  viewer: Viewer,
  input: {
    slug: string;
    label: string;
    displayName: string | null;
    codeHash: Uint8Array;
  },
): Promise<{ reviewerId: string } | { taken: true }> {
  requireTeam(viewer);
  const slug = validSlug(input?.slug);
  const label = validText(input.label);
  const displayName =
    input.displayName === null ? null : validText(input.displayName);
  const codeHash = validHash(input.codeHash);
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(sandboxReviewers)
      .values({ slug, label, displayName, codeHash })
      .onConflictDoNothing({ target: sandboxReviewers.codeHash })
      .returning({ reviewerId: sandboxReviewers.id });
    if (!row) return { taken: true as const };
    await recordAction(tx, viewer, { action: CODE_ACTIONS.made, slug });
    return { reviewerId: row.reviewerId };
  });
}

/**
 * Gives a reviewer a new code in place (D-LAB-23), live or revoked: the new
 * hash, `code_version` raised by one, `revoked_at` cleared, recorded as
 * `code-replaced`. Null when no reviewer has this id on this slug;
 * `{ taken: true }` when the hash is already issued.
 */
export async function replaceCode(
  db: SandboxDb,
  viewer: Viewer,
  input: { slug: string; reviewerId: string; codeHash: Uint8Array },
): Promise<{ codeVersion: number } | { taken: true } | null> {
  requireTeam(viewer);
  const slug = validSlug(input?.slug);
  const reviewerId = validReviewerId(input.reviewerId);
  const codeHash = validHash(input.codeHash);
  return db.transaction(async (tx) => {
    if (await hashTaken(tx, codeHash)) return { taken: true as const };
    const [row] = await tx
      .update(sandboxReviewers)
      .set({
        codeHash,
        codeVersion: sql`${sandboxReviewers.codeVersion} + 1`,
        revokedAt: null,
      })
      .where(
        and(
          eq(sandboxReviewers.id, reviewerId),
          eq(sandboxReviewers.slug, slug),
        ),
      )
      .returning({ codeVersion: sandboxReviewers.codeVersion });
    if (!row) return null;
    await recordAction(tx, viewer, { action: CODE_ACTIONS.replaced, slug });
    return { codeVersion: row.codeVersion };
  });
}

/**
 * Revokes a reviewer's code, recorded as `code-revoked`; their accesses fail
 * `checkAccess` from the next call, and what they sent stays. A code already
 * revoked keeps its first instant and writes no second record. Null when no
 * reviewer has this id on this slug.
 */
export async function revokeCode(
  db: SandboxDb,
  viewer: Viewer,
  input: { slug: string; reviewerId: string },
): Promise<{ revoked: true } | null> {
  requireTeam(viewer);
  const slug = validSlug(input?.slug);
  const reviewerId = validReviewerId(input.reviewerId);
  return db.transaction(async (tx) => {
    const [row] = await tx
      .select({ revokedAt: sandboxReviewers.revokedAt })
      .from(sandboxReviewers)
      .where(
        and(
          eq(sandboxReviewers.id, reviewerId),
          eq(sandboxReviewers.slug, slug),
        ),
      )
      .for("update");
    if (!row) return null;
    if (row.revokedAt !== null) return { revoked: true as const };
    await tx
      .update(sandboxReviewers)
      .set({ revokedAt: new Date() })
      .where(eq(sandboxReviewers.id, reviewerId));
    await recordAction(tx, viewer, { action: CODE_ACTIONS.revoked, slug });
    return { revoked: true as const };
  });
}
