/**
 * Fixtures for the sandbox isolation suite (LAB-3), on the local database
 * only. `openSandboxTestDb` migrates and refuses anything but this machine;
 * `buildWorld` writes two reviewers on one slug, a third on another, a
 * signed-in reviewer, and a team note, each with an access, a view, a comment
 * and a review version, and returns every viewer kind the suite runs as.
 */

import { createHash, randomUUID } from "node:crypto";
import type postgres from "postgres";

import {
  applySetup,
  openMigrationClient,
  runMigrations,
} from "../../scripts/database.ts";
import { migrationUrl, requireTier, runtimeUrl } from "../../scripts/env.ts";
import { createDb, type Db } from "../../src/client.ts";
import { describeUrl } from "../../src/connection.ts";
import { assertLoopbackClient } from "../../src/loopback.ts";
import type { ReviewerViewer, TeamViewer } from "../../src/sandbox/viewer.ts";
import {
  sandboxAccesses,
  sandboxComments,
  sandboxReviewers,
  sandboxReviewVersions,
  sandboxViewEvents,
} from "../../src/schema/index.ts";

export type TestDatabase = { admin: postgres.Sql; db: Db };

export async function openSandboxTestDb(): Promise<TestDatabase> {
  const tier = requireTier();
  if (tier !== "local") {
    throw new Error(
      `yarn test:db runs only against the local image; DATABASE_ENVIRONMENT is ${tier}.`,
    );
  }
  const url = migrationUrl();
  const admin = openMigrationClient(url, tier);
  assertLoopbackClient(admin);
  try {
    await admin`select 1`;
  } catch (error) {
    await admin.end({ timeout: 0 });
    throw new Error(
      `The local Supabase image is not reachable at ${describeUrl(url)}. Prepare your own Postgres with yarn db:setup:local, or start Docker's with yarn db:local, then rerun yarn test:db. (${error instanceof Error ? error.message : String(error)})`,
    );
  }
  await runMigrations(admin);
  await applySetup(admin);
  const db = createDb({ url: runtimeUrl(), tier });
  assertLoopbackClient(db.$client);
  return { admin, db };
}

export function codeHash(code: string): Buffer {
  return createHash("sha256").update(code).digest();
}

/** One reviewer's rows: what isolation must keep theirs. */
export type ReviewerRows = {
  viewer: ReviewerViewer;
  code: string;
  label: string;
  email: string | null;
  viewId: string;
  commentId: string;
  commentBody: string;
  versionId: string;
};

export type World = {
  run: string;
  slugA: string;
  slugB: string;
  a1: ReviewerRows;
  a2: ReviewerRows;
  b: ReviewerRows;
  /** A reviewer on slug A who entered signed in, as `signedInUser`. */
  signedIn: ReviewerRows;
  signedInUser: string;
  otherUser: string;
  teamUser: string;
  teamNoteId: string;
  developer: TeamViewer;
  admin: TeamViewer;
};

async function reviewerRows(
  db: Db,
  slug: string,
  name: string,
  identity: { email: string } | { userId: string },
): Promise<ReviewerRows> {
  const code = `${name}-${randomUUID()}`;
  const label = `Label ${name}`;
  const [reviewer] = await db
    .insert(sandboxReviewers)
    .values({
      slug,
      label,
      displayName: `Name ${name}`,
      codeHash: codeHash(code),
    })
    .returning({ id: sandboxReviewers.id });
  const [access] = await db
    .insert(sandboxAccesses)
    .values({ reviewerId: reviewer!.id, codeVersion: 1, ...identity })
    .returning({ id: sandboxAccesses.id });
  const viewer: ReviewerViewer = {
    kind: "reviewer",
    slug,
    reviewerId: reviewer!.id,
    accessId: access!.id,
  };
  const [view] = await db
    .insert(sandboxViewEvents)
    .values({
      reviewerId: viewer.reviewerId,
      accessId: viewer.accessId,
      slug,
      kind: "load",
      design: "circle",
    })
    .returning({ id: sandboxViewEvents.id });
  const commentId = randomUUID();
  const commentBody = `Comment by ${name}`;
  await db.insert(sandboxComments).values({
    id: commentId,
    slug,
    design: "circle",
    number: 1,
    body: commentBody,
    anchor: { id: "hero", x: 0.5, y: 0.5 },
    viewportW: 1280,
    viewportH: 800,
    clientCreatedAt: new Date(),
    reviewerId: viewer.reviewerId,
    accessId: viewer.accessId,
  });
  const versionId = randomUUID();
  await db.insert(sandboxReviewVersions).values({
    id: versionId,
    reviewerId: viewer.reviewerId,
    accessId: viewer.accessId,
    slug,
    number: 1,
    coreVersion: "v1",
    answers: { overall: name },
    triage: {},
  });
  return {
    viewer,
    code,
    label,
    email: "email" in identity ? identity.email : null,
    viewId: view!.id,
    commentId,
    commentBody,
    versionId,
  };
}

export async function buildWorld({ admin, db }: TestDatabase): Promise<World> {
  const run = randomUUID().slice(0, 8);
  const slugA = `iso-a-${run}`;
  const slugB = `iso-b-${run}`;
  const signedInUser = randomUUID();
  const otherUser = randomUUID();
  const teamUser = randomUUID();
  await admin`insert into auth.users (id, email) values
    (${signedInUser}, ${`signed-in-${run}@example.test`}),
    (${otherUser}, ${`other-${run}@example.test`}),
    (${teamUser}, ${`team-${run}@example.test`})`;

  const a1 = await reviewerRows(db, slugA, "a1", {
    email: `a1-${run}@example.test`,
  });
  const a2 = await reviewerRows(db, slugA, "a2", {
    email: `a2-${run}@example.test`,
  });
  const b = await reviewerRows(db, slugB, "b", {
    email: `b-${run}@example.test`,
  });
  const signedIn = await reviewerRows(db, slugA, "signed-in", {
    userId: signedInUser,
  });

  const teamNoteId = randomUUID();
  await db.insert(sandboxComments).values({
    id: teamNoteId,
    slug: slugA,
    design: "circle",
    number: 1,
    body: "Team note",
    anchor: { id: "hero", x: 0.1, y: 0.1 },
    viewportW: 1280,
    viewportH: 800,
    clientCreatedAt: new Date(),
    teamUserId: teamUser,
  });

  const developer: TeamViewer = {
    kind: "team",
    userId: teamUser,
    email: `team-${run}@example.test`,
    role: "developer",
  };
  return {
    run,
    slugA,
    slugB,
    a1,
    a2,
    b,
    signedIn,
    signedInUser,
    otherUser,
    teamUser,
    teamNoteId,
    developer,
    admin: { ...developer, role: "admin" },
  };
}

export async function dropWorld({ admin }: TestDatabase, world: World) {
  for (const slug of [world.slugA, world.slugB]) {
    await admin`delete from public.sandbox_reviewers where slug = ${slug}`;
    await admin`delete from public.sandbox_comments where slug = ${slug}`;
    await admin`delete from public.sandbox_actions where slug = ${slug}`;
  }
  await admin`delete from public.sandbox_actions where actor_user_id = ${world.teamUser}`;
  await admin`delete from auth.users where id in (${world.signedInUser}, ${world.otherUser}, ${world.teamUser})`;
}
