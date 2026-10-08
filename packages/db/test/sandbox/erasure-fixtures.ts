/**
 * Seeds for erasure's tests (LAB-16): a code on a slug, and an entry through
 * it, by email or by a signed-in account, with a view, a comment and a
 * version. Each test builds its own slugs, so the shared world's rows stay as
 * the isolation suite expects.
 */

import { randomBytes, randomUUID } from "node:crypto";

import type { Db } from "../../src/client.ts";
import {
  sandboxAccesses,
  sandboxComments,
  sandboxReviewers,
  sandboxReviewVersions,
  sandboxViewEvents,
} from "../../src/schema/index.ts";

/** One gate entry and what came through it. */
export type Entry = {
  accessId: string;
  viewId: string;
  commentId: string;
  versionId: string;
};

export async function seedCode(
  db: Db,
  input: { slug: string; label: string; displayName?: string },
): Promise<string> {
  const [row] = await db
    .insert(sandboxReviewers)
    .values({
      slug: input.slug,
      label: input.label,
      displayName: input.displayName ?? null,
      codeHash: randomBytes(32),
    })
    .returning({ id: sandboxReviewers.id });
  return row!.id;
}

let versionNumber = 0;

export async function seedEntry(
  db: Db,
  input: {
    slug: string;
    reviewerId: string;
    identity: { email: string } | { userId: string };
    /** A reply's root, for a comment in a thread (beat 2). */
    parentId?: string;
  },
): Promise<Entry> {
  const [access] = await db
    .insert(sandboxAccesses)
    .values({ reviewerId: input.reviewerId, codeVersion: 1, ...input.identity })
    .returning({ id: sandboxAccesses.id });
  const accessId = access!.id;
  const [view] = await db
    .insert(sandboxViewEvents)
    .values({
      reviewerId: input.reviewerId,
      accessId,
      slug: input.slug,
      kind: "load",
      design: "circle",
    })
    .returning({ id: sandboxViewEvents.id });
  const commentId = randomUUID();
  await db.insert(sandboxComments).values({
    id: commentId,
    slug: input.slug,
    design: "circle",
    number: 1,
    body: "A pin on the hero",
    anchor: { id: "hero", x: 0.5, y: 0.5 },
    viewportW: 1280,
    viewportH: 800,
    clientCreatedAt: new Date(),
    reviewerId: input.reviewerId,
    accessId,
    parentId: input.parentId ?? null,
  });
  const versionId = randomUUID();
  await db.insert(sandboxReviewVersions).values({
    id: versionId,
    reviewerId: input.reviewerId,
    accessId,
    slug: input.slug,
    number: ++versionNumber,
    coreVersion: "v1",
    answers: { overall: "Clear" },
    triage: {},
  });
  return { accessId, viewId: view!.id, commentId, versionId };
}

export async function seedTeamNote(
  db: Db,
  input: { slug: string; teamUserId: string },
): Promise<string> {
  const id = randomUUID();
  await db.insert(sandboxComments).values({
    id,
    slug: input.slug,
    design: "circle",
    number: 1,
    body: "Team note",
    anchor: { id: "hero", x: 0.1, y: 0.1 },
    viewportW: 1280,
    viewportH: 800,
    clientCreatedAt: new Date(),
    teamUserId: input.teamUserId,
  });
  return id;
}
