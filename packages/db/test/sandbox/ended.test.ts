/**
 * LAB-21 C5, on the local database (`yarn test:db`): the ended page's
 * latest-send read gives the viewer's newest version's instant, and null for
 * a reviewer who never sent. Its isolation cases, as every viewer kind, are
 * in isolation.test.ts.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { eq } from "drizzle-orm";

import * as sandbox from "@pem/db/sandbox";

import type { ReviewerViewer } from "../../src/sandbox/viewer.ts";
import {
  sandboxAccesses,
  sandboxReviewers,
  sandboxReviewVersions,
} from "../../src/schema/index.ts";
import {
  buildWorld,
  codeHash,
  dropWorld,
  openSandboxTestDb,
  type TestDatabase,
  type World,
} from "./fixtures.ts";

let database: TestDatabase;
let world: World;

before(async () => {
  database = await openSandboxTestDb();
  world = await buildWorld(database);
});

after(async () => {
  if (database) {
    // The world's slugs hold every row added here, so dropWorld removes them.
    if (world) await dropWorld(database, world);
    await database.db.$client.end();
    await database.admin.end();
  }
});

const db = () => database.db;

test("C5: a reviewer who never sent reads null", async () => {
  const [reviewer] = await db()
    .insert(sandboxReviewers)
    .values({
      slug: world.slugA,
      label: "Label never sent",
      displayName: "Name never sent",
      codeHash: codeHash(`never-sent-${randomUUID()}`),
    })
    .returning({ id: sandboxReviewers.id });
  const [access] = await db()
    .insert(sandboxAccesses)
    .values({
      reviewerId: reviewer!.id,
      codeVersion: 1,
      email: "never-sent@example.test",
    })
    .returning({ id: sandboxAccesses.id });
  const viewer: ReviewerViewer = {
    kind: "reviewer",
    slug: world.slugA,
    reviewerId: reviewer!.id,
    accessId: access!.id,
  };
  assert.equal(await sandbox.latestSentAt(db(), viewer, {}), null);
});

test("C5: after a second send the read gives the newest version's instant, not the first's", async () => {
  const own = world.a2.viewer;
  const saved = await sandbox.saveReviewVersion(db(), own, {
    id: randomUUID(),
    coreVersion: "v1",
    answers: { overall: "very" },
    triage: {},
  });
  assert.equal(saved.number, 2);
  const sentAt = await sandbox.latestSentAt(db(), own, {});
  assert.equal(sentAt?.getTime(), saved.createdAt.getTime());
  const [first] = await db()
    .select({ createdAt: sandboxReviewVersions.createdAt })
    .from(sandboxReviewVersions)
    .where(eq(sandboxReviewVersions.id, world.a2.versionId));
  assert.ok(sentAt!.getTime() >= first!.createdAt.getTime());
  // Another reviewer on the same slug still reads their own.
  const theirs = await sandbox.latestSentAt(db(), world.a1.viewer, {});
  assert.notEqual(theirs, null);
  assert.notEqual(theirs!.getTime(), sentAt!.getTime());
});
