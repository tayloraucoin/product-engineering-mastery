/**
 * LAB-9 C4, on the local database (`yarn test:db`): withRoleChangeLock
 * refuses a reviewer and a developer, and two concurrent role changes run one
 * after the other. Each change here counts the admins, waits, then demotes
 * its own admin unless it is the last one: the read-then-write the People
 * action does through the Auth API. Under the lock two admins demoting each
 * other leave one admin; the same race without it leaves none.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import * as sandbox from "@pem/db/sandbox";

import {
  NOT_A_TEAM_VIEWER,
  NOT_AN_ADMIN_VIEWER,
  type TeamViewer,
} from "../../src/sandbox/viewer.ts";
import { openSandboxTestDb, type TestDatabase } from "./fixtures.ts";

let database: TestDatabase;

before(async () => {
  database = await openSandboxTestDb();
});

after(async () => {
  if (database) {
    await database.db.$client.end();
    await database.admin.end();
  }
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function team(role: TeamViewer["role"], name: string): TeamViewer {
  return {
    kind: "team",
    userId: randomUUID(),
    email: `${name}@example.test`,
    role,
  };
}

/** One People change: count the admins, wait, then demote `me` unless they are the last. */
function demoteSelf(admins: Set<string>, me: string) {
  return async () => {
    const before = admins.size;
    await sleep(150);
    if (before <= 1) return "last-admin" as const;
    admins.delete(me);
    return "changed" as const;
  };
}

test("C4: withRoleChangeLock refuses a reviewer and a developer before running anything", async () => {
  let ran = false;
  const fn = async () => {
    ran = true;
  };
  await assert.rejects(
    sandbox.withRoleChangeLock(
      database.db,
      {
        kind: "reviewer",
        slug: "pricing-2026",
        reviewerId: randomUUID(),
        accessId: randomUUID(),
      },
      fn,
    ),
    { message: NOT_A_TEAM_VIEWER },
  );
  await assert.rejects(
    sandbox.withRoleChangeLock(database.db, team("developer", "dev"), fn),
    { message: NOT_AN_ADMIN_VIEWER },
  );
  assert.equal(ran, false);
});

test("C4: two admins demoting themselves at once run one after the other and leave one admin", async () => {
  const ana = team("admin", "ana");
  const ben = team("admin", "ben");
  const admins = new Set([ana.userId, ben.userId]);
  const results = await Promise.all([
    sandbox.withRoleChangeLock(
      database.db,
      ana,
      demoteSelf(admins, ana.userId),
    ),
    sandbox.withRoleChangeLock(
      database.db,
      ben,
      demoteSelf(admins, ben.userId),
    ),
  ]);
  assert.deepEqual([...results].sort(), ["changed", "last-admin"]);
  assert.equal(admins.size, 1);
});

test("C4: the same race without the lock leaves no admin, so the lock is what holds the guard", async () => {
  const admins = new Set(["ana", "ben"]);
  await Promise.all([demoteSelf(admins, "ana")(), demoteSelf(admins, "ben")()]);
  assert.equal(admins.size, 0);
});
