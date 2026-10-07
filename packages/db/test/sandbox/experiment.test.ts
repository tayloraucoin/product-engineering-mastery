/**
 * LAB-11 C2, on the local database (`yarn test:db`): the first design is
 * claimed once per reviewer. Two first visits at once store one design and
 * both return it, and a later claim never overwrites it. The isolation cases
 * for the same functions are in isolation.test.ts (C6).
 */

import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { eq } from "drizzle-orm";

import * as sandbox from "@pem/db/sandbox";

import { sandboxReviewers } from "../../src/schema/index.ts";
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
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function storedFirst(reviewerId: string) {
  const [row] = await db()
    .select({ first: sandboxReviewers.firstDesign })
    .from(sandboxReviewers)
    .where(eq(sandboxReviewers.id, reviewerId));
  return row!.first;
}

async function clearFirst(reviewerId: string) {
  await db()
    .update(sandboxReviewers)
    .set({ firstDesign: null })
    .where(eq(sandboxReviewers.id, reviewerId));
}

test("C2: two first visits at once store one first design, and both return it", async () => {
  const viewer = world.a1.viewer;
  await clearFirst(viewer.reviewerId);
  try {
    // The first claim holds its row lock while the second arrives; the
    // second waits, re-checks `first_design is null`, and reads back.
    const held = db().transaction(async (tx) => {
      const claimed = await sandbox.claimFirstDesign(tx, viewer, {
        design: "circle",
      });
      await sleep(300);
      return claimed;
    });
    await sleep(50);
    const racing = sandbox.claimFirstDesign(db(), viewer, {
      design: "square",
    });
    const [first, second] = await Promise.all([held, racing]);
    assert.equal(first, "circle");
    assert.equal(second, "circle");
    assert.equal(await storedFirst(viewer.reviewerId), "circle");
  } finally {
    await clearFirst(viewer.reviewerId);
  }
});

test("C2: many claims at once, each with its own draw, all return the one stored design", async () => {
  const viewer = world.a2.viewer;
  await clearFirst(viewer.reviewerId);
  try {
    const designs = ["circle", "square", "triangle", "diamond"];
    const results = await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        sandbox.claimFirstDesign(db(), viewer, {
          design: designs[i % designs.length]!,
        }),
      ),
    );
    const stored = await storedFirst(viewer.reviewerId);
    assert.ok(stored && designs.includes(stored));
    assert.deepEqual(new Set(results), new Set([stored]));
  } finally {
    await clearFirst(viewer.reviewerId);
  }
});

test("C2: a later claim never overwrites the first design", async () => {
  const viewer = world.b.viewer;
  await clearFirst(viewer.reviewerId);
  try {
    assert.equal(
      await sandbox.claimFirstDesign(db(), viewer, { design: "square" }),
      "square",
    );
    for (const design of ["circle", "square", "diamond"])
      assert.equal(
        await sandbox.claimFirstDesign(db(), viewer, { design }),
        "square",
      );
    // A switch moves the last design, never the first.
    await sandbox.recordViewEvent(db(), viewer, {
      kind: "switch",
      design: "circle",
    });
    assert.equal(await storedFirst(viewer.reviewerId), "square");
    assert.deepEqual(await sandbox.readReviewerDesigns(db(), viewer, {}), {
      firstDesign: "square",
      lastDesign: "circle",
      hasSent: true,
    });
  } finally {
    await clearFirst(viewer.reviewerId);
  }
});
