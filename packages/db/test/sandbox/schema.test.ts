/**
 * The sandbox schema against the local database (`yarn test:db`; never part
 * of `yarn test`), LAB-1: the slug and author checks refuse bad rows,
 * deleting one access takes every row that came through it and nothing else,
 * and a bridged user, admin included, reaches no sandbox row.
 */

import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { after, before, describe, test } from "node:test";
import { eq, inArray, sql } from "drizzle-orm";
import { getTableConfig, type PgTable } from "drizzle-orm/pg-core";
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
import { createRlsClient } from "../../src/rls.ts";
import {
  sandboxAccesses,
  sandboxActions,
  sandboxComments,
  sandboxGateAttempts,
  sandboxReviewers,
  sandboxReviewVersions,
  sandboxViewEvents,
} from "../../src/schema/index.ts";

const run = randomUUID().slice(0, 8);
const slug = `lab-schema-${run}`;
const teamUser = randomUUID();

let admin: postgres.Sql | undefined;
let db: Db;

before(async () => {
  const tier = requireTier();
  if (tier !== "local") {
    throw new Error(
      `yarn test:db runs only against the local image; DATABASE_ENVIRONMENT is ${tier}.`,
    );
  }
  const url = migrationUrl();
  const client = openMigrationClient(url, tier);
  assertLoopbackClient(client);
  try {
    await client`select 1`;
  } catch (error) {
    await client.end({ timeout: 0 });
    throw new Error(
      `The local Supabase image is not reachable at ${describeUrl(url)}. Prepare your own Postgres with yarn db:setup:local, or start Docker's with yarn db:local, then rerun yarn test:db. (${error instanceof Error ? error.message : String(error)})`,
    );
  }
  admin = client;
  await runMigrations(client);
  await applySetup(client);
  await client`insert into auth.users (id, email) values (${teamUser}, 'team@example.test')`;
  db = createDb({ url: runtimeUrl(), tier });
  assertLoopbackClient(db.$client);
});

after(async () => {
  await db?.$client.end();
  if (!admin) return;
  await admin`delete from public.sandbox_reviewers where slug like ${`%${run}%`}`;
  await admin`delete from public.sandbox_comments where slug like ${`%${run}%`}`;
  await admin`delete from public.sandbox_actions where slug like ${`%${run}%`}`;
  await admin`delete from public.sandbox_gate_attempts where key_hash = ${hash(`gate-${run}`)}`;
  await admin`delete from auth.users where id = ${teamUser}`;
  await admin.end();
});

function hash(text: string): Buffer {
  return createHash("sha256").update(text).digest();
}

async function reviewer(onSlug = slug) {
  const [row] = await db
    .insert(sandboxReviewers)
    .values({ slug: onSlug, label: "R", codeHash: hash(randomUUID()) })
    .returning({ id: sandboxReviewers.id });
  return row!.id;
}

async function access(reviewerId: string, email: string) {
  const [row] = await db
    .insert(sandboxAccesses)
    .values({ reviewerId, email, codeVersion: 1 })
    .returning({ id: sandboxAccesses.id });
  return row!.id;
}

const commentValues = (over: Partial<typeof sandboxComments.$inferInsert>) => ({
  id: randomUUID(),
  slug,
  design: "circle",
  number: 1,
  body: "A note",
  anchor: { id: "hero", x: 0.5, y: 0.5 },
  viewportW: 1280,
  viewportH: 800,
  clientCreatedAt: new Date(),
  ...over,
});

/** Inserts through every child table for one access; returns the ids. */
async function rowsThrough(reviewerId: string, accessId: string, n: number) {
  const view = await db
    .insert(sandboxViewEvents)
    .values({ reviewerId, accessId, slug, kind: "load", design: "circle" })
    .returning({ id: sandboxViewEvents.id });
  const comment = randomUUID();
  await db
    .insert(sandboxComments)
    .values(commentValues({ id: comment, reviewerId, accessId }));
  const version = randomUUID();
  await db.insert(sandboxReviewVersions).values({
    id: version,
    reviewerId,
    accessId,
    slug,
    number: n,
    coreVersion: "v1",
    answers: {},
    triage: {},
  });
  return { view: view[0]!.id, comment, version };
}

async function refused(statement: Promise<unknown>, constraint: string) {
  await assert.rejects(statement, (error: unknown) => {
    const cause = (error as { cause?: { constraint_name?: string } }).cause;
    const name =
      cause?.constraint_name ??
      (error as { constraint_name?: string }).constraint_name;
    assert.equal(name, constraint);
    return true;
  });
}

describe("the sandbox schema (LAB-1)", () => {
  test("C2: a bad or over-long slug is refused, and a good one at 48 characters is taken", async () => {
    for (const bad of [
      "Bad",
      "bad_slug",
      "-lead",
      "trail-",
      "two--hyphens",
      "a b",
      "",
    ]) {
      await refused(
        db
          .insert(sandboxReviewers)
          .values({ slug: bad, label: "R", codeHash: hash(randomUUID()) }),
        "sandbox_reviewers_slug_check",
      );
    }
    const long = `${run}-${"a".repeat(48 - run.length)}`;
    assert.equal(long.length, 49);
    await refused(
      db
        .insert(sandboxReviewers)
        .values({ slug: long, label: "R", codeHash: hash(randomUUID()) }),
      "sandbox_reviewers_slug_check",
    );
    await refused(
      db.insert(sandboxActions).values({
        actorUserId: teamUser,
        actorEmail: "team@example.test",
        action: "erase",
        slug: "Not_A_Slug",
      }),
      "sandbox_actions_slug_check",
    );
    const fortyEight = long.slice(0, 48);
    await reviewer(fortyEight);
  });

  test("C2: an action's counts take only the closed names: an email as a key, or an array, is refused", async () => {
    const action = (counts: unknown) =>
      db.insert(sandboxActions).values({
        actorUserId: teamUser,
        actorEmail: "team@example.test",
        action: "erase-email",
        slug,
        counts: counts as Record<string, number>,
      });
    for (const counts of [
      { "erased@example.test": 1 },
      { comments: 1, label: 2 },
      [1, 2],
      3,
    ])
      await refused(action(counts), "sandbox_actions_counts_check");
    await action({ comments: 2, accesses: 1, reviewersRevoked: 0 });
    await action(null);
  });

  test("C2: an access with both or neither of email and user_id is refused", async () => {
    const r = await reviewer();
    await refused(
      db.insert(sandboxAccesses).values({
        reviewerId: r,
        email: "both@example.test",
        userId: teamUser,
        codeVersion: 1,
      }),
      "sandbox_accesses_one_identity_check",
    );
    await refused(
      db.insert(sandboxAccesses).values({ reviewerId: r, codeVersion: 1 }),
      "sandbox_accesses_one_identity_check",
    );
    await access(r, "one@example.test");
    await db
      .insert(sandboxAccesses)
      .values({ reviewerId: r, userId: teamUser, codeVersion: 1 });
  });

  test("C2: a comment with two authors or none is refused", async () => {
    const r = await reviewer();
    const a = await access(r, "author@example.test");
    await refused(
      db
        .insert(sandboxComments)
        .values(
          commentValues({ reviewerId: r, accessId: a, teamUserId: teamUser }),
        ),
      "sandbox_comments_one_author_check",
    );
    await refused(
      db.insert(sandboxComments).values(commentValues({})),
      "sandbox_comments_one_author_check",
    );
    await refused(
      db.insert(sandboxComments).values(commentValues({ reviewerId: r })),
      "sandbox_comments_one_author_check",
    );
    await refused(
      db
        .insert(sandboxComments)
        .values(
          commentValues({ teamUserId: teamUser, body: "x".repeat(2001) }),
        ),
      "sandbox_comments_body_check",
    );
    await db
      .insert(sandboxComments)
      .values(commentValues({ reviewerId: r, accessId: a }));
    await db
      .insert(sandboxComments)
      .values(commentValues({ teamUserId: teamUser }));
  });

  test("C2: a row cannot claim another reviewer's access or another slug", async () => {
    const r1 = await reviewer();
    const r2 = await reviewer();
    const a2 = await access(r2, "other@example.test");
    await refused(
      db.insert(sandboxViewEvents).values({
        reviewerId: r1,
        accessId: a2,
        slug,
        kind: "load",
        design: "circle",
      }),
      "sandbox_view_events_access_fk",
    );
    const a1 = await access(r1, "mine@example.test");
    await refused(
      db
        .insert(sandboxComments)
        .values(
          commentValues({ reviewerId: r1, accessId: a1, slug: `other-${run}` }),
        ),
      "sandbox_comments_reviewer_fk",
    );
  });

  test("C3: deleting one access removes every view, comment and version through it, and keeps the reviewer's rows from their other access", async () => {
    const r = await reviewer();
    const first = await access(r, "first@example.test");
    const second = await access(r, "second@example.test");
    const gone = await rowsThrough(r, first, 1);
    const kept = await rowsThrough(r, second, 2);
    // A reply to the erased root survives it: parent_id has no foreign key.
    const reply = randomUUID();
    await db.insert(sandboxComments).values(
      commentValues({
        id: reply,
        reviewerId: r,
        accessId: second,
        parentId: gone.comment,
      }),
    );

    await db.delete(sandboxAccesses).where(eq(sandboxAccesses.id, first));

    const views = await db
      .select({ id: sandboxViewEvents.id })
      .from(sandboxViewEvents)
      .where(inArray(sandboxViewEvents.id, [gone.view, kept.view]));
    assert.deepEqual(
      views.map((v) => v.id),
      [kept.view],
    );
    const comments = await db
      .select({ id: sandboxComments.id })
      .from(sandboxComments)
      .where(inArray(sandboxComments.id, [gone.comment, kept.comment, reply]));
    assert.deepEqual(
      comments.map((c) => c.id).sort(),
      [kept.comment, reply].sort(),
    );
    const versions = await db
      .select({ id: sandboxReviewVersions.id })
      .from(sandboxReviewVersions)
      .where(inArray(sandboxReviewVersions.id, [gone.version, kept.version]));
    assert.deepEqual(
      versions.map((v) => v.id),
      [kept.version],
    );
    const reviewers = await db
      .select({ id: sandboxReviewers.id })
      .from(sandboxReviewers)
      .where(eq(sandboxReviewers.id, r));
    assert.equal(reviewers.length, 1, "the reviewer stays");
  });

  test("C3: deleting the reviewer removes every access and every row through them", async () => {
    const r = await reviewer();
    const a = await access(r, "whole@example.test");
    const rows = await rowsThrough(r, a, 1);
    await db.delete(sandboxReviewers).where(eq(sandboxReviewers.id, r));
    const [{ left }] = (await db.execute<{ left: number }>(
      sql`select (select count(*) from sandbox_accesses where reviewer_id = ${r})
        + (select count(*) from sandbox_view_events where id = ${rows.view})
        + (select count(*) from sandbox_comments where id = ${rows.comment})
        + (select count(*) from sandbox_review_versions where id = ${rows.version}) as left`,
    )) as unknown as [{ left: number }];
    assert.equal(Number(left), 0);
  });

  test("C4: a bridged user, developer or admin reads and writes no row of any sandbox table", async () => {
    const r = await reviewer();
    const a = await access(r, "rls@example.test");
    await rowsThrough(r, a, 1);
    await db
      .insert(sandboxComments)
      .values(commentValues({ teamUserId: teamUser }));
    await db.insert(sandboxActions).values({
      actorUserId: teamUser,
      actorEmail: "team@example.test",
      action: "erase",
      slug,
    });
    await db.insert(sandboxGateAttempts).values({
      keyHash: hash(`gate-${run}`),
      windowEndsAt: new Date(Date.now() + 60_000),
    });

    // One well-formed row per table, so only row-level security can refuse it.
    const forged: [PgTable, Record<string, unknown>][] = [
      [
        sandboxReviewers,
        { slug, label: "forged", codeHash: hash(randomUUID()) },
      ],
      [
        sandboxAccesses,
        { reviewerId: r, email: "forged@example.test", codeVersion: 1 },
      ],
      [
        sandboxViewEvents,
        { reviewerId: r, accessId: a, slug, kind: "load", design: "circle" },
      ],
      [sandboxComments, commentValues({ teamUserId: teamUser })],
      [
        sandboxReviewVersions,
        {
          id: randomUUID(),
          reviewerId: r,
          accessId: a,
          slug,
          number: 99,
          coreVersion: "v1",
          answers: {},
          triage: {},
        },
      ],
      [
        sandboxActions,
        {
          actorUserId: teamUser,
          actorEmail: "forged@example.test",
          action: "forged",
        },
      ],
      [
        sandboxGateAttempts,
        { keyHash: hash(randomUUID()), windowEndsAt: new Date() },
      ],
    ];
    assert.equal(forged.length, 7);

    for (const role of ["user", "developer", "admin"] as const) {
      const rls = createRlsClient(db, { userId: teamUser, role });
      for (const [table, values] of forged) {
        const name = getTableConfig(table).name;
        assert.deepEqual(
          await rls.execute((tx) => tx.select().from(table)),
          [],
          `${role} read a row of ${name}`,
        );
        const deleted = await rls.execute((tx) =>
          tx.execute(sql`delete from ${table} returning 1`),
        );
        assert.equal(deleted.length, 0, `${role} deleted a row of ${name}`);
        const column = sql.raw(firstColumn(table));
        const updated = await rls.execute((tx) =>
          tx.execute(
            sql`update ${table} set ${column} = ${column} returning 1`,
          ),
        );
        assert.equal(updated.length, 0, `${role} updated a row of ${name}`);
        await assert.rejects(
          rls.execute((tx) => tx.insert(table).values(values)),
          (error: unknown) => {
            // 42501: new row violates row-level security policy.
            assert.equal(
              codeOf(error),
              "42501",
              `${role} inserting into ${name}`,
            );
            return true;
          },
        );
      }
    }
  });
});

function codeOf(error: unknown): string | undefined {
  const cause = (error as { cause?: { code?: string } }).cause;
  return cause?.code ?? (error as { code?: string }).code;
}

function firstColumn(table: PgTable): string {
  return `"${getTableConfig(table).columns[0]!.name}"`;
}
