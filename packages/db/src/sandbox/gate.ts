/**
 * The gate group (Tickets-gate ruling, 2026-10-05): the reads and writes that
 * run before any viewer exists. Each takes `(db, input)` and returns only
 * ids, versions and flags, or, for a verified link token, the access's email;
 * the throttle's three (LAB-6) return only counts and instants.
 * None returns a feedback row, a label or a name; the isolation suite
 * (test/sandbox/isolation.test.ts) proves it. A malformed input is "not
 * found" (null), never a query and never an error carrying the input.
 *
 * The caller hashes and normalises: `codeHash` is SHA-256 of the normalised
 * code (gate.md), and an email arrives trimmed and lower-cased (LAB-5).
 */

import { and, eq, gt, inArray, isNull, max, sql } from "drizzle-orm";

import { sandboxAccesses } from "../schema/sandbox/accesses.ts";
import { sandboxGateAttempts } from "../schema/sandbox/gate-attempts.ts";
import { sandboxReviewers } from "../schema/sandbox/reviewers.ts";
import { isUuid, SandboxAccessError, type SandboxDb } from "./viewer.ts";

const CODE_HASH_BYTES = 32;

export const EMAIL_NOT_NORMALISED =
  "The email must arrive trimmed and lower-cased.";
export const ACCESS_INPUT_INVALID = "The access input is not valid.";
export const THROTTLE_INPUT_INVALID = "The throttle input is not valid.";

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

/*
 * The wrong-code throttle (gap 3, D-LAB-33, technical/gate.md). A row is one
 * key's failures: the key is an HMAC the app computes (a browser id or a
 * network address, never stored raw), and the row holds no slug and no link
 * to any feedback. Time comes from the caller's `now`, never SQL `now()`, so
 * a test can fix it. Every write first deletes the rows past the later of
 * their window and their lock.
 */

const KEY_HASH_BYTES = 32;

function isKeyHash(value: unknown): value is Uint8Array {
  return value instanceof Uint8Array && value.length === KEY_HASH_BYTES;
}

function isInstant(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/** A Date as a timestamptz parameter; raw SQL gets no column encoder. */
function instant(value: Date) {
  return sql`${value.toISOString()}::timestamptz`;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

/** Deletes every row whose window and lock have both ended by `now`. */
async function pruneGateAttempts(db: SandboxDb, now: Date): Promise<void> {
  const t = sandboxGateAttempts;
  await db
    .delete(t)
    .where(
      sql`greatest(${t.windowEndsAt}, coalesce(${t.lockedUntil}, ${t.windowEndsAt})) <= ${instant(now)}`,
    );
}

/** The latest lock still running at `now` on any of these keys, or null. */
export async function readGateLock(
  db: SandboxDb,
  input: { keyHashes: readonly Uint8Array[]; now: Date },
): Promise<{ lockedUntil: Date | null }> {
  if (
    !Array.isArray(input.keyHashes) ||
    !input.keyHashes.every(isKeyHash) ||
    !isInstant(input.now)
  )
    throw new SandboxAccessError(THROTTLE_INPUT_INVALID);
  if (input.keyHashes.length === 0) return { lockedUntil: null };
  const [row] = await db
    .select({ lockedUntil: max(sandboxGateAttempts.lockedUntil) })
    .from(sandboxGateAttempts)
    .where(
      and(
        inArray(
          sandboxGateAttempts.keyHash,
          input.keyHashes.map((hash) => Buffer.from(hash)),
        ),
        gt(sandboxGateAttempts.lockedUntil, input.now),
      ),
    );
  return { lockedUntil: row?.lockedUntil ?? null };
}

/**
 * One wrong try on one key, as a single atomic upsert, so parallel tries
 * each count. Inside the window the count goes up by one; past it the count
 * starts again at 1 with a new window. Reaching `limit` locks the key until
 * `now + lockMs`. Returns the count and the lock, if any.
 */
export async function recordGateFailure(
  db: SandboxDb,
  input: {
    keyHash: Uint8Array;
    limit: number;
    windowMs: number;
    lockMs: number;
    now: Date;
  },
): Promise<{ failures: number; lockedUntil: Date | null }> {
  if (
    !isKeyHash(input.keyHash) ||
    !isPositiveInteger(input.limit) ||
    !isPositiveInteger(input.windowMs) ||
    !isPositiveInteger(input.lockMs) ||
    !isInstant(input.now)
  )
    throw new SandboxAccessError(THROTTLE_INPUT_INVALID);
  const key = Buffer.from(input.keyHash);
  const now = input.now;
  const windowEnds = new Date(now.getTime() + input.windowMs);
  const lockEnds = new Date(now.getTime() + input.lockMs);
  const t = sandboxGateAttempts;
  const expired = sql`${t.windowEndsAt} <= ${instant(now)}`;
  const next = sql`case when ${expired} then 1 else ${t.failures} + 1 end`;

  return db.transaction(async (tx) => {
    await pruneGateAttempts(tx, now);
    const [row] = await tx
      .insert(t)
      .values({
        keyHash: key,
        failures: 1,
        windowEndsAt: windowEnds,
        lockedUntil: input.limit <= 1 ? lockEnds : null,
      })
      .onConflictDoUpdate({
        target: t.keyHash,
        set: {
          failures: next,
          windowEndsAt: sql`case when ${expired} then ${instant(windowEnds)} else ${t.windowEndsAt} end`,
          lockedUntil: sql`case when ${next} >= ${input.limit} then greatest(${t.lockedUntil}, ${instant(lockEnds)}) else ${t.lockedUntil} end`,
        },
      })
      .returning({ failures: t.failures, lockedUntil: t.lockedUntil });
    return { failures: row!.failures, lockedUntil: row!.lockedUntil };
  });
}

/** Forgets one key's failures (a success clears the browser key). */
export async function clearGateKey(
  db: SandboxDb,
  input: { keyHash: Uint8Array; now: Date },
): Promise<{ cleared: number }> {
  if (!isKeyHash(input.keyHash) || !isInstant(input.now))
    throw new SandboxAccessError(THROTTLE_INPUT_INVALID);
  return db.transaction(async (tx) => {
    await pruneGateAttempts(tx, input.now);
    const rows = await tx
      .delete(sandboxGateAttempts)
      .where(eq(sandboxGateAttempts.keyHash, Buffer.from(input.keyHash)))
      .returning({ keyHash: sandboxGateAttempts.keyHash });
    return { cleared: rows.length };
  });
}
