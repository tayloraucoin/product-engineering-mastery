/**
 * The closing review's versions (LAB-17, review.md, S20, S22). Reviewer
 * only: each takes `(db, viewer, input)`, refuses a team viewer (S18), and
 * touches only the viewer's own versions on their slug.
 *
 * - `saveReviewVersion`: one numbered version under its browser-minted id.
 *   The reviewer row is locked first, so one reviewer's sends are numbered
 *   in turn; the number is taken in the insert itself (`max + 1`), and a
 *   unique violation of the reviewer's number is retried. A retry under the
 *   same id inserts nothing and reads back the first row's number, so a lost
 *   ok never doubles a version. An id held by anyone else is refused. Every
 *   triage key must be one of the viewer's own comments on this slug. Old
 *   versions are never updated.
 * - `readMyLatestVersion`: the viewer's highest-numbered version, or null.
 *
 * Limits (data-contract.md): answers at most 64 KB. Errors are fixed strings
 * that never echo input.
 */

import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";

import {
  sandboxComments,
  sandboxReviewers,
  sandboxReviewVersions,
} from "../schema/index.ts";
import type {
  SandboxAnswers,
  SandboxTriage,
} from "../schema/sandbox/review-versions.ts";
import { REVIEWER_NOT_FOUND } from "./experiment.ts";
import {
  isUuid,
  requireReviewer,
  reviewerScope,
  SandboxAccessError,
  type SandboxDb,
  type Viewer,
} from "./viewer.ts";

export const REVIEW_INPUT_INVALID = "The review input is not valid.";
export const REVIEW_TRIAGE_INVALID =
  "The review's triage names a comment that is not the reviewer's.";
export const REVIEW_VERSION_TAKEN = "The review version id is already used.";

/** The answers' JSON, in bytes (data-contract.md). */
export const REVIEW_ANSWERS_BYTES_MAX = 64 * 1024;

const CORE_VERSION = /^v[0-9]{1,3}$/;
const TRIAGE_CHOICES: readonly unknown[] = ["must", "should", "fine"];
/** Far above the 500-comment cap, so a real triage always fits. */
const TRIAGE_ENTRIES_MAX = 1000;
/** Sends racing past the lock (none should) are retried this many times. */
const NUMBER_TRIES = 5;

export type SaveReviewVersionInput = {
  id: string;
  coreVersion: string;
  answers: SandboxAnswers;
  triage: SandboxTriage;
};

/** One version as its author reads it back. */
export type MyReviewVersion = {
  number: number;
  createdAt: Date;
  answers: SandboxAnswers;
  triage: SandboxTriage;
};

function invalid(): never {
  throw new SandboxAccessError(REVIEW_INPUT_INVALID);
}

function plainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function validTriage(value: unknown): {
  comments: Record<string, string>;
  mattersMost: string | null;
} {
  if (!plainObject(value)) invalid();
  if (Object.keys(value).some((k) => k !== "comments" && k !== "mattersMost"))
    invalid();
  const raw = value.comments ?? {};
  if (!plainObject(raw)) invalid();
  const entries = Object.entries(raw);
  if (entries.length > TRIAGE_ENTRIES_MAX) invalid();
  const comments: Record<string, string> = {};
  for (const [id, choice] of entries) {
    if (!isUuid(id) || !TRIAGE_CHOICES.includes(choice)) invalid();
    comments[id.toLowerCase()] = choice as string;
  }
  const most = value.mattersMost ?? null;
  if (most !== null && !isUuid(most)) invalid();
  return { comments, mattersMost: most === null ? null : most.toLowerCase() };
}

function validInput(input: unknown): SaveReviewVersionInput & {
  triage: ReturnType<typeof validTriage>;
} {
  if (!plainObject(input)) invalid();
  if (
    Object.keys(input).some(
      (k) => !["id", "coreVersion", "answers", "triage"].includes(k),
    )
  )
    invalid();
  if (!isUuid(input.id)) invalid();
  if (
    typeof input.coreVersion !== "string" ||
    !CORE_VERSION.test(input.coreVersion)
  )
    invalid();
  if (!plainObject(input.answers)) invalid();
  let bytes: number;
  try {
    bytes = Buffer.byteLength(JSON.stringify(input.answers));
  } catch {
    invalid();
  }
  if (bytes > REVIEW_ANSWERS_BYTES_MAX) invalid();
  return {
    id: input.id.toLowerCase(),
    coreVersion: input.coreVersion,
    answers: input.answers,
    triage: validTriage(input.triage),
  };
}

/**
 * Stores one version and returns its number and time. See the module
 * comment for numbering, retries and the triage check.
 */
export async function saveReviewVersion(
  db: SandboxDb,
  viewer: Viewer,
  input: SaveReviewVersionInput,
): Promise<{ number: number; createdAt: Date }> {
  const reviewer = requireReviewer(viewer);
  const version = validInput(input);
  const named = [
    ...new Set([
      ...Object.keys(version.triage.comments),
      ...(version.triage.mattersMost ? [version.triage.mattersMost] : []),
    ]),
  ];

  for (let attempt = 1; ; attempt++) {
    try {
      return await db.transaction(async (tx) => {
        // The reviewer row, locked: one reviewer's sends are numbered in turn.
        const [row] = await tx
          .select({ id: sandboxReviewers.id })
          .from(sandboxReviewers)
          .where(
            and(
              eq(sandboxReviewers.id, reviewer.reviewerId),
              eq(sandboxReviewers.slug, reviewer.slug),
            ),
          )
          .for("update");
        if (!row) throw new SandboxAccessError(REVIEWER_NOT_FOUND);

        if (named.length) {
          const own = await tx
            .select({ id: sandboxComments.id })
            .from(sandboxComments)
            .where(
              and(
                inArray(sandboxComments.id, named),
                reviewerScope(reviewer, sandboxComments),
                // Triage names the reviewer's own pins, never a reply (threads.md).
                isNull(sandboxComments.parentId),
              ),
            );
          if (own.length !== named.length)
            throw new SandboxAccessError(REVIEW_TRIAGE_INVALID);
        }

        const t = sandboxReviewVersions;
        const inserted = await tx.execute<{
          number: number;
          created_at: string | Date;
        }>(sql`
          insert into ${t}
            (id, reviewer_id, access_id, slug, number, core_version, answers, triage)
          select ${version.id}::uuid, ${reviewer.reviewerId}::uuid,
            ${reviewer.accessId}::uuid, ${reviewer.slug},
            coalesce(max(${t.number}), 0) + 1, ${version.coreVersion},
            ${JSON.stringify(version.answers)}::jsonb,
            ${JSON.stringify(version.triage)}::jsonb
          from ${t} where ${t.reviewerId} = ${reviewer.reviewerId}::uuid
          on conflict (id) do nothing
          returning number, created_at`);
        const first = Array.from(inserted)[0];
        if (first)
          return {
            number: Number(first.number),
            createdAt: new Date(first.created_at),
          };

        // A retry under the same id: the first row's number, if it is ours.
        const [held] = await tx
          .select({ number: t.number, createdAt: t.createdAt })
          .from(t)
          .where(and(eq(t.id, version.id), reviewerScope(reviewer, t)));
        if (!held) throw new SandboxAccessError(REVIEW_VERSION_TAKEN);
        return held;
      });
    } catch (error) {
      if (isNumberTaken(error) && attempt < NUMBER_TRIES) continue;
      // The composite keys refuse an access that is not this reviewer's, or
      // one erased since the request began: a fixed error, never Postgres's.
      if (pgCode(error) === "23503")
        throw new SandboxAccessError(REVIEWER_NOT_FOUND);
      throw error;
    }
  }
}

/** The viewer's own latest version on their slug, or null. Takes an empty input. */
export async function readMyLatestVersion(
  db: SandboxDb,
  viewer: Viewer,
  input: Record<string, never>,
): Promise<MyReviewVersion | null> {
  const reviewer = requireReviewer(viewer);
  if (!plainObject(input) || Object.keys(input).length) invalid();
  const [row] = await db
    .select({
      number: sandboxReviewVersions.number,
      createdAt: sandboxReviewVersions.createdAt,
      answers: sandboxReviewVersions.answers,
      triage: sandboxReviewVersions.triage,
    })
    .from(sandboxReviewVersions)
    .where(reviewerScope(reviewer, sandboxReviewVersions))
    .orderBy(desc(sandboxReviewVersions.number))
    .limit(1);
  return row ?? null;
}

function pgCode(error: unknown): unknown {
  const code = (e: unknown) => (e as { code?: unknown } | null)?.code;
  return code(error) ?? code((error as { cause?: unknown } | null)?.cause);
}

function isNumberTaken(error: unknown): boolean {
  const constraint = (e: unknown) =>
    (e as { constraint_name?: unknown; constraint?: unknown } | null)
      ?.constraint_name ?? (e as { constraint?: unknown } | null)?.constraint;
  const cause = (error as { cause?: unknown } | null)?.cause;
  return (
    pgCode(error) === "23505" &&
    (constraint(error) ?? constraint(cause)) ===
      "sandbox_review_versions_reviewer_number_key"
  );
}
