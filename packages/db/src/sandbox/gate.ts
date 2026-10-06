/**
 * The gate group (Tickets-gate ruling, 2026-10-05): the four reads and writes
 * that run before any viewer exists. Each takes `(db, input)` and returns only
 * ids, versions and flags, or, for a verified link token, the access's email.
 * None returns a feedback row, a label or a name; the isolation suite
 * (test/sandbox/isolation.test.ts) proves it. A malformed input is "not
 * found" (null), never a query and never an error carrying the input.
 *
 * The caller hashes and normalises: `codeHash` is SHA-256 of the normalised
 * code (gate.md), and an email arrives trimmed and lower-cased (LAB-5).
 */

import { and, eq, isNull, sql } from "drizzle-orm";

import { sandboxAccesses } from "../schema/sandbox/accesses.ts";
import { sandboxReviewers } from "../schema/sandbox/reviewers.ts";
import { isUuid, SandboxAccessError, type SandboxDb } from "./viewer.ts";

const CODE_HASH_BYTES = 32;

export const EMAIL_NOT_NORMALISED =
  "The email must arrive trimmed and lower-cased.";
export const ACCESS_INPUT_INVALID = "The access input is not valid.";

/** A live code's reviewer on this slug: its id and current code version, or null. */
export async function findLiveReviewerByCodeHash(
  db: SandboxDb,
  input: { slug: string; codeHash: Uint8Array },
): Promise<{ reviewerId: string; codeVersion: number } | null> {
  if (
    typeof input.slug !== "string" ||
    !(input.codeHash instanceof Uint8Array) ||
    input.codeHash.length !== CODE_HASH_BYTES
  )
    return null;
  const [row] = await db
    .select({
      reviewerId: sandboxReviewers.id,
      codeVersion: sandboxReviewers.codeVersion,
    })
    .from(sandboxReviewers)
    .where(
      and(
        eq(sandboxReviewers.codeHash, Buffer.from(input.codeHash)),
        eq(sandboxReviewers.slug, input.slug),
        isNull(sandboxReviewers.revokedAt),
      ),
    );
  return row ?? null;
}

export type CreateAccessInput =
  | { reviewerId: string; codeVersion: number; email: string }
  | { reviewerId: string; codeVersion: number; userId: string };

/**
 * Records one gate entry. Written only while the reviewer's code is live and
 * still at `codeVersion`, so a code replaced or revoked since the lookup
 * grants nothing (null).
 */
export async function createAccess(
  db: SandboxDb,
  input: CreateAccessInput,
): Promise<{ accessId: string } | null> {
  if (!isUuid(input.reviewerId) || !Number.isInteger(input.codeVersion))
    throw new SandboxAccessError(ACCESS_INPUT_INVALID);
  const email = "email" in input ? input.email : null;
  const userId = "userId" in input ? input.userId : null;
  if ((email === null) === (userId === null))
    throw new SandboxAccessError(ACCESS_INPUT_INVALID);
  if (email !== null) {
    if (typeof email !== "string" || email.length === 0)
      throw new SandboxAccessError(ACCESS_INPUT_INVALID);
    if (email !== email.trim().toLowerCase())
      throw new SandboxAccessError(EMAIL_NOT_NORMALISED);
  }
  if (userId !== null && !isUuid(userId))
    throw new SandboxAccessError(ACCESS_INPUT_INVALID);

  const rows = await db.execute<{ id: string }>(sql`
    insert into ${sandboxAccesses} (reviewer_id, email, user_id, code_version)
    select ${sandboxReviewers.id}, ${email}, ${userId}::uuid, ${sandboxReviewers.codeVersion}
    from ${sandboxReviewers}
    where ${sandboxReviewers.id} = ${input.reviewerId}
      and ${sandboxReviewers.codeVersion} = ${input.codeVersion}
      and ${sandboxReviewers.revokedAt} is null
    returning id`);
  const [row] = [...rows];
  return row ? { accessId: row.id } : null;
}

/**
 * Whether an access still opens its slug: the row exists, its reviewer is on
 * this slug, the code is not revoked, the access's `code_version` is the
 * reviewer's, and an access made signed in is used by that same user.
 */
export async function checkAccess(
  db: SandboxDb,
  input: { accessId: string; slug: string; userId: string | null },
): Promise<{ reviewerId: string; accessId: string } | null> {
  if (!isUuid(input.accessId) || typeof input.slug !== "string") return null;
  const userId = isUuid(input.userId) ? input.userId : null;
  const [row] = await db
    .select({
      reviewerId: sandboxAccesses.reviewerId,
      accessId: sandboxAccesses.id,
      accessUserId: sandboxAccesses.userId,
    })
    .from(sandboxAccesses)
    .innerJoin(
      sandboxReviewers,
      eq(sandboxReviewers.id, sandboxAccesses.reviewerId),
    )
    .where(
      and(
        eq(sandboxAccesses.id, input.accessId),
        eq(sandboxReviewers.slug, input.slug),
        isNull(sandboxReviewers.revokedAt),
        eq(sandboxAccesses.codeVersion, sandboxReviewers.codeVersion),
      ),
    );
  if (!row) return null;
  if (row.accessUserId !== null && row.accessUserId !== userId) return null;
  return { reviewerId: row.reviewerId, accessId: row.accessId };
}

/**
 * The email an access was made with, for a verified link token or the
 * confirmation email: null for a signed-in reviewer's access, a foreign slug,
 * an erased access or a revoked code.
 */
export async function findAccessEmail(
  db: SandboxDb,
  input: { accessId: string; slug: string },
): Promise<string | null> {
  if (!isUuid(input.accessId) || typeof input.slug !== "string") return null;
  const [row] = await db
    .select({ email: sandboxAccesses.email })
    .from(sandboxAccesses)
    .innerJoin(
      sandboxReviewers,
      eq(sandboxReviewers.id, sandboxAccesses.reviewerId),
    )
    .where(
      and(
        eq(sandboxAccesses.id, input.accessId),
        eq(sandboxReviewers.slug, input.slug),
        isNull(sandboxReviewers.revokedAt),
      ),
    );
  return row?.email ?? null;
}
