/**
 * LAB-17 C6 and C11, on the local database (`yarn test:db`): a second send
 * is version 2 and leaves version 1 as it was; one version id sent twice is
 * one row and one number; sends at once are numbered 1, 2, 3 with none
 * repeated. The isolation cases for the same functions, as every viewer
 * kind, are in isolation.test.ts.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { asc, eq } from "drizzle-orm";

import * as sandbox from "@pem/db/sandbox";

import { sandboxReviewVersions } from "../../src/schema/index.ts";
import {
  buildWorld,
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
    if (world) await dropWorld(database, world);
    await database.db.$client.end();
    await database.admin.end();
  }
});

const db = () => database.db;

function version(answers: Record<string, unknown>) {
  return { id: randomUUID(), coreVersion: "v1", answers, triage: {} };
}

async function versionsOf(reviewerId: string) {
  return db()
    .select()
    .from(sandboxReviewVersions)
    .where(eq(sandboxReviewVersions.reviewerId, reviewerId))
    .orderBy(asc(sandboxReviewVersions.number));
}

test("C6: a second send stores version 2, keeps version 1 unchanged, and the latest read returns 2", async () => {
  const own = world.a1.viewer;
  const [first] = await versionsOf(own.reviewerId);
  assert.equal(first!.number, 1);

  const second = version({ overall: "extremely", "next-step": "approve" });
  const saved = await sandbox.saveReviewVersion(db(), own, {
    ...second,
    triage: { comments: { [world.a1.commentId]: "should" }, mattersMost: null },
  });
  assert.equal(saved.number, 2);

  const rows = await versionsOf(own.reviewerId);
  assert.deepEqual(
    rows.map((r) => r.number),
    [1, 2],
  );
  assert.deepEqual(rows[0], first);
  assert.equal(rows[1]!.coreVersion, "v1");
  assert.deepEqual(rows[1]!.triage, {
    comments: { [world.a1.commentId]: "should" },
    mattersMost: null,
  });

  const latest = await sandbox.readMyLatestVersion(db(), own, {});
  assert.equal(latest!.number, 2);
  assert.deepEqual(latest!.answers, second.answers);
  assert.equal(latest!.createdAt.getTime(), saved.createdAt.getTime());
});

test("C11: the same version id sent twice, even at once, gives one row and one number", async () => {
  const own = world.b.viewer;
  const retried = version({ "next-step": "rethink" });
  const [a, b] = await Promise.all([
    sandbox.saveReviewVersion(db(), own, retried),
    sandbox.saveReviewVersion(db(), own, retried),
  ]);
  assert.deepEqual(a, b);
  const again = await sandbox.saveReviewVersion(db(), own, retried);
  assert.deepEqual(again, a);
  const rows = (await versionsOf(own.reviewerId)).filter(
    (r) => r.id === retried.id,
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0]!.number, a.number);
});

test("C11: two sends with different ids at once get 1 and 2, and five get 1 to 5 with none repeated", async () => {
  const own = world.a2.viewer;
  // A reviewer with no version yet.
  await db()
    .delete(sandboxReviewVersions)
    .where(eq(sandboxReviewVersions.reviewerId, own.reviewerId));

  const two = await Promise.all([
    sandbox.saveReviewVersion(db(), own, version({ n: 1 })),
    sandbox.saveReviewVersion(db(), own, version({ n: 2 })),
  ]);
  assert.deepEqual(two.map((r) => r.number).sort(), [1, 2]);

  const five = await Promise.all(
    [3, 4, 5, 6, 7].map((n) =>
      sandbox.saveReviewVersion(db(), own, version({ n })),
    ),
  );
  assert.deepEqual(
    five.map((r) => r.number).sort((x, y) => x - y),
    [3, 4, 5, 6, 7],
  );
  assert.deepEqual(
    (await versionsOf(own.reviewerId)).map((r) => r.number),
    [1, 2, 3, 4, 5, 6, 7],
  );
});
