/**
 * LAB-12 C4, C7 and C8, on the local database (`yarn test:db`): one row per
 * comment id however often it is sent, an edit and an Undo under the same
 * id, another reviewer's id left alone, a reviewer's load holding only their
 * own pins, and the 500 cap counted inside the save. The isolation cases for
 * the same functions, as every viewer kind, are in isolation.test.ts.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { and, count, eq } from "drizzle-orm";

import * as sandbox from "@pem/db/sandbox";

import { COMMENT_BODY_INVALID } from "../../src/sandbox/comments.ts";
import { sandboxComments } from "../../src/schema/index.ts";
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

function pin(number = 2) {
  return {
    id: randomUUID(),
    number,
    design: "square",
    kind: null,
    body: "The annual toggle is hard to find.",
    anchor: { marked: "compare", x: 0.1, y: 0.9, place: "Comparison table" },
    viewportW: 1440,
    viewportH: 900,
    clientCreatedAt: new Date("2026-10-07T09:00:00Z"),
  };
}

async function rowsWith(id: string) {
  return db().select().from(sandboxComments).where(eq(sandboxComments.id, id));
}

async function ownCount(reviewerId: string) {
  const [row] = await db()
    .select({ n: count() })
    .from(sandboxComments)
    .where(eq(sandboxComments.reviewerId, reviewerId));
  return row!.n;
}

test("C4: the same id saved twice gives one row; an edit updates it; a delete then Undo restores it under the same id", async () => {
  const viewer = world.a1.viewer;
  const comment = pin();
  try {
    assert.equal(await sandbox.saveComment(db(), viewer, comment), "saved");
    // A retry after a lost ok: the same id, the same body.
    assert.equal(await sandbox.saveComment(db(), viewer, comment), "saved");
    assert.equal((await rowsWith(comment.id)).length, 1);

    // An edit under the id changes the type and text, nothing else.
    const edited = {
      ...comment,
      kind: "suggestion" as const,
      body: "Move it up.",
    };
    assert.equal(await sandbox.saveComment(db(), viewer, edited), "saved");
    const [row] = await rowsWith(comment.id);
    assert.equal(row!.body, "Move it up.");
    assert.equal(row!.kind, "suggestion");
    assert.equal(row!.number, comment.number);
    assert.deepEqual(row!.anchor, comment.anchor);
    assert.equal((await rowsWith(comment.id)).length, 1);

    // Delete, then Undo: the same id comes back, once.
    await sandbox.deleteComment(db(), viewer, { id: comment.id });
    assert.equal((await rowsWith(comment.id)).length, 0);
    assert.equal(await sandbox.saveComment(db(), viewer, edited), "saved");
    const restored = await rowsWith(comment.id);
    assert.equal(restored.length, 1);
    assert.equal(restored[0]!.body, "Move it up.");
  } finally {
    await db()
      .delete(sandboxComments)
      .where(eq(sandboxComments.id, comment.id));
  }
});

test("C4: the same id sent by another reviewer changes nothing and is taken, which the app answers as not-saved", async () => {
  const comment = pin();
  try {
    await sandbox.saveComment(db(), world.a1.viewer, comment);
    const before = await rowsWith(comment.id);
    for (const other of [
      world.a2.viewer,
      world.b.viewer,
      world.signedIn.viewer,
    ])
      assert.equal(
        await sandbox.saveComment(db(), other, {
          ...comment,
          body: "Mine now",
        }),
        "taken",
      );
    // Their delete under the id is a no-op too.
    await sandbox.deleteComment(db(), world.a2.viewer, { id: comment.id });
    assert.deepEqual(await rowsWith(comment.id), before);
  } finally {
    await db()
      .delete(sandboxComments)
      .where(eq(sandboxComments.id, comment.id));
  }
});

test("C4: a retry racing its first send still lands one row", async () => {
  const comment = pin();
  try {
    const results = await Promise.all(
      Array.from({ length: 8 }, () =>
        sandbox.saveComment(db(), world.a1.viewer, comment),
      ),
    );
    assert.deepEqual(new Set(results), new Set(["saved"]));
    assert.equal((await rowsWith(comment.id)).length, 1);
  } finally {
    await db()
      .delete(sandboxComments)
      .where(eq(sandboxComments.id, comment.id));
  }
});

test("C7: a reviewer's load returns only their own pins on this slug, never a team note", async () => {
  const comment = pin();
  try {
    await sandbox.saveComment(db(), world.a2.viewer, comment);
    const mine = await sandbox.listMyComments(db(), world.a2.viewer, {});
    assert.deepEqual(
      mine.map((c) => c.id).sort(),
      [world.a2.commentId, comment.id].sort(),
    );
    for (const viewer of [
      world.a1.viewer,
      world.b.viewer,
      world.signedIn.viewer,
    ]) {
      const theirs = await sandbox.listMyComments(db(), viewer, {});
      assert.ok(!theirs.some((c) => c.id === comment.id));
      assert.ok(!theirs.some((c) => c.id === world.teamNoteId));
    }
  } finally {
    await db()
      .delete(sandboxComments)
      .where(eq(sandboxComments.id, comment.id));
  }
});

test("C8: the 501st comment and a 2,001-character body are refused; deleting one lets the next in", async () => {
  const viewer = world.b.viewer;
  const held = await ownCount(viewer.reviewerId);
  const filler = Array.from({ length: 500 - held }, (_, i) => ({
    ...pin(i + 10),
    slug: viewer.slug,
    reviewerId: viewer.reviewerId,
    accessId: viewer.accessId,
  }));
  try {
    await db().insert(sandboxComments).values(filler);
    assert.equal(await ownCount(viewer.reviewerId), 500);

    const next = pin(600);
    assert.equal(await sandbox.saveComment(db(), viewer, next), "limit");
    assert.equal((await rowsWith(next.id)).length, 0);
    assert.equal(await ownCount(viewer.reviewerId), 500);

    // An edit of a held comment is not a new one: it still saves at the cap.
    assert.equal(
      await sandbox.saveComment(db(), viewer, {
        ...filler[0]!,
        body: "Edited",
      }),
      "saved",
    );

    await assert.rejects(
      sandbox.saveComment(db(), viewer, {
        ...pin(601),
        body: "x".repeat(2001),
      }),
      (error: unknown) =>
        error instanceof sandbox.SandboxAccessError &&
        error.message === COMMENT_BODY_INVALID,
    );

    await sandbox.deleteComment(db(), viewer, { id: filler[0]!.id });
    assert.equal(await sandbox.saveComment(db(), viewer, next), "saved");
    assert.equal(await ownCount(viewer.reviewerId), 500);

    // Two new comments at once with one place left: one lands, one is refused.
    await sandbox.deleteComment(db(), viewer, { id: next.id });
    const racing = await Promise.all([
      sandbox.saveComment(db(), viewer, pin(700)),
      sandbox.saveComment(db(), viewer, pin(701)),
    ]);
    assert.deepEqual(racing.sort(), ["limit", "saved"]);
    assert.equal(await ownCount(viewer.reviewerId), 500);
  } finally {
    await db()
      .delete(sandboxComments)
      .where(
        and(
          eq(sandboxComments.reviewerId, viewer.reviewerId),
          eq(sandboxComments.slug, viewer.slug),
        ),
      );
  }
});
