/**
 * Revoke and replace against the gate (LAB-15 C2, C3; D-LAB-23, S10), on the
 * local database only (`yarn test:db`). A revoked code's accesses fail
 * `checkAccess` on the next call; a replaced code's old hash finds nothing,
 * its accesses fail, and the new code finds the same reviewer, whose
 * comments and versions are still theirs.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, test } from "node:test";
import { eq } from "drizzle-orm";

import * as sandbox from "@pem/db/sandbox";

import {
  sandboxComments,
  sandboxReviewers,
  sandboxReviewVersions,
} from "../../src/schema/index.ts";
import {
  buildWorld,
  codeHash,
  dropWorld,
  openSandboxTestDb,
  type ReviewerRows,
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

const passes = (rows: ReviewerRows, userId: string | null = null) =>
  sandbox.checkAccess(db(), {
    accessId: rows.viewer.accessId,
    slug: rows.viewer.slug,
    userId,
  });

/** The reviewer's comment and version are still there, and still theirs. */
async function assertSentDataKept(rows: ReviewerRows) {
  const [comment] = await db()
    .select({ reviewerId: sandboxComments.reviewerId })
    .from(sandboxComments)
    .where(eq(sandboxComments.id, rows.commentId));
  assert.equal(comment?.reviewerId, rows.viewer.reviewerId);
  const [version] = await db()
    .select({ reviewerId: sandboxReviewVersions.reviewerId })
    .from(sandboxReviewVersions)
    .where(eq(sandboxReviewVersions.id, rows.versionId));
  assert.equal(version?.reviewerId, rows.viewer.reviewerId);
}

async function reviewer(id: string) {
  const [row] = await db()
    .select()
    .from(sandboxReviewers)
    .where(eq(sandboxReviewers.id, id));
  return row!;
}

describe("LAB-15: revoke and replace, against the gate", () => {
  test("C2: a revoked code's access fails checkAccess on the next call; the reviewer's comments and versions stay", async () => {
    const rows = world.a1;
    assert.ok(await passes(rows), "the access passed before the revoke");
    assert.deepEqual(
      await sandbox.revokeCode(db(), world.developer, {
        slug: world.slugA,
        reviewerId: rows.viewer.reviewerId,
      }),
      { revoked: true },
    );
    assert.equal(await passes(rows), null);
    assert.equal(
      await sandbox.findLiveReviewerByCodeHash(db(), {
        slug: world.slugA,
        codeHash: codeHash(rows.code),
      }),
      null,
    );
    await assertSentDataKept(rows);
    // The other reviewers on the slug are untouched.
    assert.ok(await passes(world.a2));
  });

  for (const [name, rows, revokeFirst] of [
    ["a live", () => world.a2, false],
    ["a revoked", () => world.signedIn, true],
  ] as const) {
    test(`C3: replacing ${name} code bumps code_version and clears revoked_at; the old code finds nothing and its accesses fail; the new code finds the same reviewer, whose comments and versions stay theirs`, async () => {
      const r = rows();
      const signedInUser = r === world.signedIn ? world.signedInUser : null;
      if (revokeFirst)
        await sandbox.revokeCode(db(), world.admin, {
          slug: world.slugA,
          reviewerId: r.viewer.reviewerId,
        });
      const before = await reviewer(r.viewer.reviewerId);
      assert.equal(before.revokedAt !== null, revokeFirst);

      const newCode = `replaced-${randomUUID()}`;
      const result = await sandbox.replaceCode(db(), world.admin, {
        slug: world.slugA,
        reviewerId: r.viewer.reviewerId,
        codeHash: codeHash(newCode),
      });
      assert.deepEqual(result, { codeVersion: before.codeVersion + 1 });
      const afterRow = await reviewer(r.viewer.reviewerId);
      assert.equal(afterRow.codeVersion, before.codeVersion + 1);
      assert.equal(afterRow.revokedAt, null);
      assert.equal(afterRow.id, before.id);

      // The old code finds nothing; its accesses no longer pass.
      assert.equal(
        await sandbox.findLiveReviewerByCodeHash(db(), {
          slug: world.slugA,
          codeHash: codeHash(r.code),
        }),
        null,
      );
      assert.equal(await passes(r, signedInUser), null);

      // The new code finds the same reviewer at the new version, and a new
      // access through it passes.
      const found = await sandbox.findLiveReviewerByCodeHash(db(), {
        slug: world.slugA,
        codeHash: codeHash(newCode),
      });
      assert.deepEqual(found, {
        reviewerId: r.viewer.reviewerId,
        codeVersion: afterRow.codeVersion,
      });
      const access = await sandbox.createAccess(db(), {
        reviewerId: found!.reviewerId,
        codeVersion: found!.codeVersion,
        email: `new-device-${world.run}@example.test`,
      });
      assert.ok(access);
      assert.deepEqual(
        await sandbox.checkAccess(db(), {
          accessId: access.accessId,
          slug: world.slugA,
          userId: null,
        }),
        { reviewerId: r.viewer.reviewerId, accessId: access.accessId },
      );
      await assertSentDataKept(r);
    });
  }
});
