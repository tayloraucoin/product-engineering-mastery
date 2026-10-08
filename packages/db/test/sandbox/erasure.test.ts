/**
 * Deleting an experiment's data and erasing an email (LAB-16 C1, C2, C4, C5,
 * C7; S27, S28, D-LAB-26 to 28), on the local database only
 * (`yarn test:db`). Each test builds its own slugs; the sweep reads every
 * `sandbox_` table that information_schema lists, row by row as text, so a
 * table added later is swept too.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, test } from "node:test";
import { and, eq, inArray, isNull } from "drizzle-orm";

import * as sandbox from "@pem/db/sandbox";

import {
  NOT_AN_ADMIN_VIEWER,
  type TeamViewer,
} from "../../src/sandbox/viewer.ts";
import {
  sandboxAccesses,
  sandboxActions,
  sandboxComments,
  sandboxReviewers,
  sandboxReviewVersions,
  sandboxViewEvents,
} from "../../src/schema/index.ts";
import {
  seedCode,
  seedEntry,
  seedTeamNote,
  type Entry,
} from "./erasure-fixtures.ts";
import { openSandboxTestDb, type TestDatabase } from "./fixtures.ts";

let database: TestDatabase;
const run = randomUUID().slice(0, 8);
const teamUser = randomUUID();
const signedInUser = randomUUID();
const slugs: string[] = [];
const developer: TeamViewer = {
  kind: "team",
  userId: teamUser,
  email: `team-${run}@example.test`,
  role: "developer",
};
const admin: TeamViewer = { ...developer, role: "admin" };

before(async () => {
  database = await openSandboxTestDb();
  await database.admin`insert into auth.users (id, email) values
    (${teamUser}, ${developer.email}),
    (${signedInUser}, ${`signed-in-${run}@example.test`})`;
});

after(async () => {
  if (!database) return;
  const { admin: sql } = database;
  for (const slug of slugs) {
    await sql`delete from public.sandbox_reviewers where slug = ${slug}`;
    await sql`delete from public.sandbox_comments where slug = ${slug}`;
  }
  await sql`delete from public.sandbox_actions where actor_user_id = ${teamUser}`;
  await sql`delete from auth.users where id in (${teamUser}, ${signedInUser})`;
  await database.db.$client.end();
  await database.admin.end();
});

const db = () => database.db;

function slug(name: string): string {
  const value = `${name}-${run}`;
  slugs.push(value);
  return value;
}

const email = (name: string) => `${name}-${run}@example.com`;

/** Every public `sandbox_` table, from the catalogue, never a list kept here. */
async function sandboxTables(): Promise<string[]> {
  const rows = await database.admin<{ table_name: string }[]>`
    select table_name from information_schema.tables
    where table_schema = 'public' and table_name like 'sandbox\\_%'
    order by table_name`;
  return rows.map((r) => r.table_name);
}

/** The tables holding `needle` anywhere in a row, ignoring case, with how many rows. */
async function sweep(needle: string): Promise<Record<string, number>> {
  const found: Record<string, number> = {};
  for (const table of await sandboxTables()) {
    const [row] = await database.admin.unsafe<{ n: number }[]>(
      `select count(*)::int as n from public."${table}" as t where position($1 in lower(t::text)) > 0`,
      [needle.toLowerCase()],
    );
    if (row!.n > 0) found[table] = row!.n;
  }
  return found;
}

/** Every row on these slugs, in every table that has a slug, plus their accesses. */
async function rowsOn(on: string[]) {
  const reviewers = await db()
    .select()
    .from(sandboxReviewers)
    .where(inArray(sandboxReviewers.slug, on))
    .orderBy(sandboxReviewers.id);
  const ids = reviewers.map((r) => r.id);
  return {
    reviewers,
    accesses:
      ids.length === 0
        ? []
        : await db()
            .select()
            .from(sandboxAccesses)
            .where(inArray(sandboxAccesses.reviewerId, ids))
            .orderBy(sandboxAccesses.id),
    views: await db()
      .select()
      .from(sandboxViewEvents)
      .where(inArray(sandboxViewEvents.slug, on))
      .orderBy(sandboxViewEvents.id),
    comments: await db()
      .select()
      .from(sandboxComments)
      .where(inArray(sandboxComments.slug, on))
      .orderBy(sandboxComments.id),
    versions: await db()
      .select()
      .from(sandboxReviewVersions)
      .where(inArray(sandboxReviewVersions.slug, on))
      .orderBy(sandboxReviewVersions.id),
  };
}

async function recordOn(on: string) {
  return db().select().from(sandboxActions).where(eq(sandboxActions.slug, on));
}

/** The erasure rows this file's team wrote, newest last. */
async function erasureRows() {
  return db()
    .select()
    .from(sandboxActions)
    .where(
      and(
        eq(sandboxActions.actorUserId, teamUser),
        eq(sandboxActions.action, sandbox.ERASURE_ACTIONS.reviewerErased),
      ),
    )
    .orderBy(sandboxActions.at);
}

async function reviewer(id: string) {
  const [row] = await db()
    .select()
    .from(sandboxReviewers)
    .where(eq(sandboxReviewers.id, id));
  return row!;
}

async function exists(
  table:
    | typeof sandboxComments
    | typeof sandboxViewEvents
    | typeof sandboxReviewVersions,
  id: string,
) {
  const rows = await db()
    .select({ id: table.id })
    .from(table)
    .where(eq(table.id, id));
  return rows.length === 1;
}

/** A reply through an existing access, pointing at its root (beat 2). */
async function reply(
  on: string,
  reviewerId: string,
  accessId: string,
  parentId: string,
) {
  const id = randomUUID();
  await db()
    .insert(sandboxComments)
    .values({
      id,
      slug: on,
      design: "circle",
      number: 2,
      body: "A reply",
      anchor: { id: "hero", x: 0.5, y: 0.5 },
      viewportW: 1280,
      viewportH: 800,
      clientCreatedAt: new Date(),
      reviewerId,
      accessId,
      parentId,
    });
  return id;
}

/** A record row holds the action, the experiment, counts and the team member: nothing a reviewer gave. */
function assertCountsOnly(
  row: typeof sandboxActions.$inferSelect,
  secrets: string[],
) {
  assert.equal(row.targetEmail, null);
  const names: readonly string[] = [
    "reviewers",
    "accesses",
    "viewEvents",
    "comments",
    "reviewVersions",
    "teamNotes",
    "labelsScrubbed",
    "reviewersRevoked",
  ];
  for (const [key, value] of Object.entries(row.counts ?? {})) {
    assert.ok(names.includes(key), `count name ${key}`);
    assert.ok(Number.isInteger(value));
  }
  const text = JSON.stringify(row).toLowerCase();
  for (const secret of secrets)
    assert.ok(!text.includes(secret.toLowerCase()), "the record names input");
}

describe("LAB-16: deleting an experiment's data", () => {
  test("C1: an admin's delete of pricing-2026 hard-deletes every code, access, view, comment, version and team note on it, leaves another slug untouched, and writes one record row with the counts", async () => {
    const pricing = slug("pricing-2026");
    const other = slug("other");
    const labelled = await seedCode(db(), { slug: pricing, label: "Ana Ruiz" });
    const ana = await seedEntry(db(), {
      slug: pricing,
      reviewerId: labelled,
      identity: { email: email("ana") },
    });
    await seedEntry(db(), {
      slug: pricing,
      reviewerId: labelled,
      identity: { email: email("ben") },
    });
    const chloe = await seedCode(db(), {
      slug: pricing,
      label: email("chloe"),
    });
    await seedEntry(db(), {
      slug: pricing,
      reviewerId: chloe,
      identity: { email: email("chloe") },
    });
    await reply(
      pricing,
      chloe,
      (await rowsOn([pricing])).accesses.find((a) => a.reviewerId === chloe)!
        .id,
      ana.commentId,
    );
    await seedCode(db(), { slug: pricing, label: "Unused" });
    await seedTeamNote(db(), { slug: pricing, teamUserId: teamUser });
    const otherCode = await seedCode(db(), { slug: other, label: "Dee" });
    await seedEntry(db(), {
      slug: other,
      reviewerId: otherCode,
      identity: { email: email("dee") },
    });
    await seedTeamNote(db(), { slug: other, teamUserId: teamUser });
    const otherBefore = await rowsOn([other]);

    const held = await sandbox.countExperimentData(db(), developer, {
      slug: pricing,
    });
    const counts = await sandbox.deleteExperimentData(db(), admin, {
      slug: pricing,
    });
    const expected = {
      reviewers: 3,
      codes: 3,
      views: 3,
      comments: 4,
      reviews: 2,
      versions: 3,
      teamNotes: 1,
    };
    assert.deepEqual(held, expected, "the tab's counts are what goes");
    assert.deepEqual(counts, expected);

    const left = await rowsOn([pricing]);
    for (const [kind, rows] of Object.entries(left))
      assert.deepEqual(rows, [], `${kind} left on pricing-2026`);
    const orphanAccesses = await db()
      .select()
      .from(sandboxAccesses)
      .where(eq(sandboxAccesses.reviewerId, labelled));
    assert.deepEqual(orphanAccesses, []);
    assert.deepEqual(
      await rowsOn([other]),
      otherBefore,
      "the other slug changed",
    );

    const record = await recordOn(pricing);
    assert.equal(record.length, 1);
    assert.equal(record[0]!.action, "data-deleted");
    assert.equal(record[0]!.actorUserId, admin.userId);
    assert.deepEqual(record[0]!.counts, {
      reviewers: 3,
      accesses: 3,
      viewEvents: 3,
      comments: 4,
      reviewVersions: 3,
      teamNotes: 1,
    });
    assertCountsOnly(record[0]!, [
      "Ana Ruiz",
      "Unused",
      email("ana"),
      email("ben"),
      email("chloe"),
    ]);
    assert.deepEqual(await recordOn(other), []);

    // Deleting again finds nothing and writes no second row.
    assert.ok(
      Object.values(
        await sandbox.deleteExperimentData(db(), admin, { slug: pricing }),
      ).every((n) => n === 0),
    );
    assert.equal((await recordOn(pricing)).length, 1);
  });

  test("C2: deleteExperimentData called with a developer viewer is refused and every row stays", async () => {
    const held = slug("held");
    const code = await seedCode(db(), { slug: held, label: "Eve" });
    await seedEntry(db(), {
      slug: held,
      reviewerId: code,
      identity: { email: email("eve") },
    });
    await seedTeamNote(db(), { slug: held, teamUserId: teamUser });
    const before = await rowsOn([held]);
    for (const viewer of [
      developer,
      { ...developer, role: "Admin" } as unknown as TeamViewer,
      { ...developer, role: undefined } as unknown as TeamViewer,
    ])
      await assert.rejects(
        sandbox.deleteExperimentData(db(), viewer, { slug: held }),
        (error: unknown) => error instanceof sandbox.SandboxAccessError,
      );
    await assert.rejects(
      sandbox.deleteExperimentData(db(), developer, { slug: held }),
      { message: NOT_AN_ADMIN_VIEWER },
    );
    assert.deepEqual(await rowsOn([held]), before);
    assert.deepEqual(await recordOn(held), []);
  });
});

describe("LAB-16: erasing an email", () => {
  test('C4: one code used with ana and ben, and ana on a second slug: erasing ana leaves no row, label or "Emails used" entry holding ana in any sandbox table on either slug, keeps ben\'s views, comments and versions, and the record row holds counts only', async () => {
    const first = slug("erase-one");
    const second = slug("erase-two");
    const ana = email("ana");
    const ben = email("ben");
    // The label holds ana's address in another case: it still matches.
    const shared = await seedCode(db(), {
      slug: first,
      label: ana.replace("ana", "Ana").replace("example", "Example"),
      displayName: "Ana",
    });
    const anaEntry = await seedEntry(db(), {
      slug: first,
      reviewerId: shared,
      identity: { email: ana },
    });
    const benEntry = await seedEntry(db(), {
      slug: first,
      reviewerId: shared,
      identity: { email: ben },
    });
    const benReply = await reply(
      first,
      shared,
      benEntry.accessId,
      anaEntry.commentId,
    );
    const anaReply = await reply(
      first,
      shared,
      anaEntry.accessId,
      benEntry.commentId,
    );
    const anaOnly = await seedCode(db(), {
      slug: second,
      label: "Ana Ruiz",
      displayName: ` ${ana.toUpperCase()} `,
    });
    await seedEntry(db(), {
      slug: second,
      reviewerId: anaOnly,
      identity: { email: ana },
    });
    const benOnly = await seedCode(db(), { slug: second, label: "Ben" });
    const benSecond = await seedEntry(db(), {
      slug: second,
      reviewerId: benOnly,
      identity: { email: ben },
    });
    assert.ok(Object.keys(await sweep(ana)).length > 0, "the sweep sees ana");
    const tables = await sandboxTables();
    assert.ok(tables.length >= 7, `sweeps ${tables.join(", ")}`);

    const found = await sandbox.findErasure(db(), developer, {
      email: ana,
      userIds: [],
    });
    assert.deepEqual(
      { ...found, nameLabels: undefined },
      {
        experiments: 2,
        comments: 3,
        versions: 2,
        views: 2,
        nameLabels: undefined,
      },
    );
    const counts = await sandbox.eraseEmail(db(), developer, {
      email: ana,
      userIds: [],
      clearLabels: [],
    });
    assert.deepEqual(counts, {
      accesses: 2,
      comments: 3,
      versions: 2,
      views: 2,
      labelsScrubbed: 2,
      reviewersRevoked: 1,
    });

    assert.deepEqual(await sweep(ana), {}, "ana is held somewhere");
    for (const entry of [benEntry, benSecond] as Entry[]) {
      assert.ok(await exists(sandboxViewEvents, entry.viewId));
      assert.ok(await exists(sandboxComments, entry.commentId));
      assert.ok(await exists(sandboxReviewVersions, entry.versionId));
    }
    assert.ok(await exists(sandboxComments, benReply), "ben's reply stays");
    assert.ok(!(await exists(sandboxComments, anaReply)));
    // "Emails used" is the distinct emails: ben's alone now.
    const codes = await sandbox.listCodes(db(), developer, { slug: first });
    assert.deepEqual(codes[0]!.emailsUsed, [ben]);
    assert.equal(codes[0]!.label, sandbox.ERASED_LABEL);
    assert.equal(codes[0]!.revoked, false, "ben's code stays live");
    const gone = await reviewer(anaOnly);
    assert.equal(gone.label, sandbox.ERASED_LABEL);
    assert.equal(gone.displayName, sandbox.ERASED_LABEL);
    assert.notEqual(gone.revokedAt, null);
    assert.equal((await reviewer(benOnly)).label, "Ben");

    const [row] = (await erasureRows()).slice(-1);
    assert.equal(row!.slug, null, "an erasure names no experiment");
    assert.deepEqual(row!.counts, {
      accesses: 2,
      viewEvents: 2,
      comments: 3,
      reviewVersions: 2,
      labelsScrubbed: 2,
      reviewersRevoked: 1,
    });
    assertCountsOnly(row!, [ana, ben, "Ana Ruiz", shared, anaOnly]);
  });

  test('C5: a code used only by the erased email is revoked and labelled "Erased reviewer"; a name label is cleared only when its box is ticked, and is unchanged otherwise', async () => {
    const on = slug("labels");
    const alone = await seedCode(db(), { slug: on, label: "Xena Park" });
    await seedEntry(db(), {
      slug: on,
      reviewerId: alone,
      identity: { email: email("xena") },
    });
    const unticked = await seedCode(db(), { slug: on, label: "Yan Lee" });
    for (const name of ["yan", "zoe"])
      await seedEntry(db(), {
        slug: on,
        reviewerId: unticked,
        identity: { email: email(name) },
      });
    const ticked = await seedCode(db(), { slug: on, label: "Wu Chen" });
    for (const name of ["wu", "val"])
      await seedEntry(db(), {
        slug: on,
        reviewerId: ticked,
        identity: { email: email(name) },
      });
    const unrelated = await seedCode(db(), { slug: on, label: "Quin" });

    await sandbox.eraseEmail(db(), admin, {
      email: email("xena"),
      userIds: [],
      clearLabels: [],
    });
    const xena = await reviewer(alone);
    assert.equal(xena.label, "Erased reviewer");
    assert.notEqual(xena.revokedAt, null);

    const found = await sandbox.findErasure(db(), admin, {
      email: email("yan"),
      userIds: [],
    });
    assert.deepEqual(found!.nameLabels, [
      { reviewerId: unticked, slug: on, label: "Yan Lee" },
    ]);
    await sandbox.eraseEmail(db(), admin, {
      email: email("yan"),
      userIds: [],
      clearLabels: [unrelated],
    });
    const yan = await reviewer(unticked);
    assert.equal(yan.label, "Yan Lee", "an unticked name label stays");
    assert.equal(yan.revokedAt, null, "zoe still uses the code");
    assert.equal((await reviewer(unrelated)).label, "Quin");

    await sandbox.eraseEmail(db(), admin, {
      email: email("wu"),
      userIds: [],
      clearLabels: [ticked],
    });
    const wu = await reviewer(ticked);
    assert.equal(wu.label, "Erased reviewer", "a ticked name label goes");
    assert.equal(wu.revokedAt, null, "val still uses the code");
  });

  test("C6 (the database's half): the signed-in reviewer's accesses go by user id; an email that holds nothing erases nothing and records nothing", async () => {
    const on = slug("signed-in");
    const code = await seedCode(db(), { slug: on, label: "Signed in" });
    const entry = await seedEntry(db(), {
      slug: on,
      reviewerId: code,
      identity: { userId: signedInUser },
    });
    const before = (await erasureRows()).length;
    assert.equal(
      await sandbox.eraseEmail(db(), developer, {
        email: email("unknown"),
        userIds: [],
        clearLabels: [],
      }),
      null,
    );
    assert.equal((await erasureRows()).length, before);
    assert.ok(await exists(sandboxComments, entry.commentId));

    const counts = await sandbox.eraseEmail(db(), developer, {
      email: `signed-in-${run}@example.test`,
      userIds: [signedInUser],
      clearLabels: [],
    });
    assert.equal(counts!.accesses, 1);
    assert.ok(!(await exists(sandboxComments, entry.commentId)));
    assert.deepEqual(
      await db()
        .select()
        .from(sandboxAccesses)
        .where(eq(sandboxAccesses.userId, signedInUser)),
      [],
    );
    assert.notEqual((await reviewer(code)).revokedAt, null);
  });
});

describe("LAB-16: the record never names a reviewer", () => {
  test("C7: after every action kind (delete, erase, LAB-9's role change and LAB-15's code actions), no sandbox_actions row contains a reviewer email or a code label", async () => {
    const on = slug("record");
    const label = `Label Seven ${run}`;
    const made = await sandbox.makeCode(db(), developer, {
      slug: on,
      label,
      displayName: null,
      codeHash: new Uint8Array(32).map(() => Math.floor(Math.random() * 256)),
    });
    assert.ok("reviewerId" in made);
    await seedEntry(db(), {
      slug: on,
      reviewerId: made.reviewerId,
      identity: { email: email("seven") },
    });
    await sandbox.replaceCode(db(), developer, {
      slug: on,
      reviewerId: made.reviewerId,
      codeHash: new Uint8Array(32).map(() => Math.floor(Math.random() * 256)),
    });
    await sandbox.revokeCode(db(), developer, {
      slug: on,
      reviewerId: made.reviewerId,
    });
    await sandbox.recordAction(db(), admin, {
      action: sandbox.ROLE_CHANGE_ACTION,
      targetEmail: `colleague-${run}@example.test`,
    });
    const erased = await seedCode(db(), { slug: on, label: email("eight") });
    await seedEntry(db(), {
      slug: on,
      reviewerId: erased,
      identity: { email: email("eight") },
    });
    await sandbox.eraseEmail(db(), developer, {
      email: email("eight"),
      userIds: [],
      clearLabels: [],
    });
    await sandbox.deleteExperimentData(db(), admin, { slug: on });

    const rows = await db()
      .select()
      .from(sandboxActions)
      .where(eq(sandboxActions.actorUserId, teamUser));
    const kinds = new Set(rows.map((r) => r.action));
    for (const kind of [
      ...Object.values(sandbox.CODE_ACTIONS),
      sandbox.ROLE_CHANGE_ACTION,
      ...Object.values(sandbox.ERASURE_ACTIONS),
    ])
      assert.ok(kinds.has(kind), `no ${kind} row`);
    // Every reviewer email and label this file used, on every row it wrote.
    const secrets = [
      label,
      "Ana Ruiz",
      "Xena Park",
      "Yan Lee",
      "Wu Chen",
      `-${run}@example.com`,
    ];
    for (const row of rows)
      assertCountsOnly(
        {
          ...row,
          targetEmail:
            row.action === sandbox.ROLE_CHANGE_ACTION ? null : row.targetEmail,
        },
        secrets,
      );
    assert.deepEqual(
      rows.filter((r) => r.targetEmail !== null).map((r) => r.action),
      [sandbox.ROLE_CHANGE_ACTION],
      "only a role change names anyone: a team member",
    );
    assert.deepEqual(
      await db()
        .select({ id: sandboxActions.id })
        .from(sandboxActions)
        .where(
          and(
            eq(sandboxActions.actorUserId, teamUser),
            isNull(sandboxActions.counts),
            inArray(
              sandboxActions.action,
              Object.values(sandbox.ERASURE_ACTIONS),
            ),
          ),
        ),
      [],
      "every erasure row has its counts",
    );
  });
});
