/**
 * LAB-25 C1 to C6 and C8, on the local database (`yarn test:db`): threads in
 * a collaborate experiment and the same calls on a private one. Each test
 * builds its own slug with two reviewers, Ana and Ben, and a team member, on
 * synthetic fixtures; the isolation cases for the same functions, as every
 * viewer kind, are in threads-cases.ts.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { eq } from "drizzle-orm";

import * as sandbox from "@pem/db/sandbox";

import type { ReviewerViewer, TeamViewer } from "../../src/sandbox/viewer.ts";
import { sandboxComments } from "../../src/schema/index.ts";
import { seedCode, seedEntry, seedTeamNote } from "./erasure-fixtures.ts";
import { openSandboxTestDb, type TestDatabase } from "./fixtures.ts";

let database: TestDatabase;
const slugs: string[] = [];
const users: string[] = [];

before(async () => {
  database = await openSandboxTestDb();
});

after(async () => {
  if (database) {
    for (const slug of slugs) {
      await database.admin`delete from public.sandbox_reviewers where slug = ${slug}`;
      await database.admin`delete from public.sandbox_comments where slug = ${slug}`;
      await database.admin`delete from public.sandbox_actions where slug = ${slug}`;
    }
    for (const id of users) {
      await database.admin`delete from public.sandbox_actions where actor_user_id = ${id}`;
      await database.admin`delete from auth.users where id = ${id}`;
    }
    await database.db.$client.end();
    await database.admin.end();
  }
});

const db = () => database.db;

type Person = {
  viewer: ReviewerViewer;
  email: string;
  label: string;
  displayName: string;
  commentId: string;
};

type Review = {
  slug: string;
  ana: Person;
  ben: Person;
  team: TeamViewer;
  admin: TeamViewer;
  teamNoteId: string;
};

/** A slug with Ana and Ben, each entered by email with one comment, a team member and a team note. */
async function buildReview(): Promise<Review> {
  const run = randomUUID().slice(0, 8);
  const slug = `threads-${run}`;
  slugs.push(slug);
  const teamUserId = randomUUID();
  const teamEmail = `taylor-${run}@example.com`;
  users.push(teamUserId);
  await database.admin`insert into auth.users (id, email) values (${teamUserId}, ${teamEmail})`;

  async function person(label: string, displayName: string, email: string) {
    const reviewerId = await seedCode(db(), { slug, label, displayName });
    const entry = await seedEntry(db(), {
      slug,
      reviewerId,
      identity: { email },
    });
    const viewer: ReviewerViewer = {
      kind: "reviewer",
      slug,
      reviewerId,
      accessId: entry.accessId,
    };
    return { viewer, email, label, displayName, commentId: entry.commentId };
  }

  const ana = await person("Ana Ruiz", "Ana R.", `ana-${run}@example.com`);
  const ben = await person("Ben Okafor", "Ben O.", `ben-${run}@example.com`);
  const teamNoteId = await seedTeamNote(db(), { slug, teamUserId });
  const team: TeamViewer = {
    kind: "team",
    userId: teamUserId,
    email: teamEmail,
    role: "developer",
  };
  return {
    slug,
    ana,
    ben,
    team,
    admin: { ...team, role: "admin" },
    teamNoteId,
  };
}

function reply(parentId: string, body: string, id = randomUUID()) {
  return {
    id,
    parentId,
    body,
    clientCreatedAt: new Date(),
    mode: "collaborate" as const,
  };
}

async function row(id: string) {
  const [found] = await db()
    .select()
    .from(sandboxComments)
    .where(eq(sandboxComments.id, id));
  return found;
}

test("C1: on a collaborate slug each reviewer reads both reviewers' comments; only the reader's own carry a number", async () => {
  const r = await buildReview();
  for (const [me, other] of [
    [r.ana, r.ben],
    [r.ben, r.ana],
  ] as const) {
    const read = await sandbox.listThread(db(), me.viewer, {
      mode: "collaborate",
    });
    assert.deepEqual(
      read.map((root) => root.id).sort(),
      [me.commentId, other.commentId].sort(),
    );
    const own = read.find((root) => root.id === me.commentId)!;
    const theirs = read.find((root) => root.id === other.commentId)!;
    assert.ok("number" in own && own.number === 1);
    assert.ok(!("number" in theirs));
    assert.equal("author" in own && own.author, "self");
  }
});

test("C2: reviewer reads name others by display name and team replies as the team, and carry no email, label or id", async () => {
  const r = await buildReview();
  assert.equal(
    await sandbox.saveReply(db(), r.team, {
      ...reply(r.ana.commentId, "We'll look at the toggle."),
      slug: r.slug,
    }),
    "ok",
  );
  assert.equal(
    await sandbox.saveReply(
      db(),
      r.ben.viewer,
      reply(r.ana.commentId, "Same here."),
    ),
    "ok",
  );
  const read = await sandbox.listThread(db(), r.ana.viewer, {
    mode: "collaborate",
  });
  const ben = read.find((root) => root.id === r.ben.commentId)!;
  assert.ok("author" in ben);
  assert.deepEqual(ben.author, { reviewer: "Ben O." });
  const ana = read.find((root) => root.id === r.ana.commentId)!;
  assert.deepEqual(
    ana.replies.map((x) => [x.body, x.author]),
    [
      ["We'll look at the toggle.", "team"],
      ["Same here.", { reviewer: "Ben O." }],
    ],
  );
  const opened = await sandbox.listReplies(db(), r.ana.viewer, {
    rootId: r.ana.commentId,
    mode: "collaborate",
  });
  for (const payload of [read, opened]) {
    const text = JSON.stringify(payload);
    for (const secret of [
      r.ana.email,
      r.ben.email,
      r.ana.label,
      r.ben.label,
      r.team.email,
      r.team.userId,
      r.ana.viewer.reviewerId,
      r.ben.viewer.reviewerId,
      r.ana.viewer.accessId,
      r.ben.viewer.accessId,
      "example.com",
    ])
      assert.ok(!text.includes(secret), `the read holds ${secret}`);
  }
});

test("C3: a team note is in no reviewer read and a reply under it is refused; a team reply under a reviewer comment reads as from the team", async () => {
  const r = await buildReview();
  for (const mode of ["private", "collaborate"] as const)
    for (const me of [r.ana, r.ben]) {
      const read = await sandbox.listThread(db(), me.viewer, { mode });
      assert.ok(!read.some((root) => root.id === r.teamNoteId));
      assert.ok(!JSON.stringify(read).includes("Team note"));
      assert.deepEqual(
        await sandbox.listReplies(db(), me.viewer, {
          rootId: r.teamNoteId,
          mode,
        }),
        [],
      );
    }
  for (const [viewer, extra] of [
    [r.ana.viewer, {}],
    [r.team, { slug: r.slug }],
  ] as const) {
    const id = randomUUID();
    assert.equal(
      await sandbox.saveReply(db(), viewer, {
        ...reply(r.teamNoteId, "Under the note", id),
        ...extra,
      }),
      "not-saved",
    );
    assert.equal(await row(id), undefined);
  }
  const teamReply = reply(r.ben.commentId, "Thanks, noted.");
  assert.equal(
    await sandbox.saveReply(db(), r.team, { ...teamReply, slug: r.slug }),
    "ok",
  );
  const read = await sandbox.listThread(db(), r.ana.viewer, {
    mode: "collaborate",
  });
  const ben = read.find((root) => root.id === r.ben.commentId)!;
  assert.deepEqual(
    ben.replies.map((x) => [x.id, x.author]),
    [[teamReply.id, "team"]],
  );
});

test("C4: a reply to a reply is stored under the root with its design and anchor; the same id sent twice gives one row", async () => {
  const r = await buildReview();
  const root = await row(r.ana.commentId);
  const first = reply(r.ana.commentId, "Which toggle?");
  assert.equal(await sandbox.saveReply(db(), r.ben.viewer, first), "ok");
  const second = reply(first.id, "The annual one.");
  assert.equal(await sandbox.saveReply(db(), r.ana.viewer, second), "ok");
  // A retry after a lost ok: the same id, once.
  assert.equal(await sandbox.saveReply(db(), r.ana.viewer, second), "ok");
  const stored = await db()
    .select()
    .from(sandboxComments)
    .where(eq(sandboxComments.id, second.id));
  assert.equal(stored.length, 1);
  assert.equal(stored[0]!.parentId, r.ana.commentId);
  assert.equal(stored[0]!.design, root!.design);
  assert.deepEqual(stored[0]!.anchor, root!.anchor);
  // An edit under the id is the author's own; Ben cannot rewrite Ana's.
  assert.equal(
    await sandbox.saveReply(db(), r.ana.viewer, {
      ...second,
      body: "The annual price toggle.",
    }),
    "ok",
  );
  assert.equal(
    await sandbox.saveReply(db(), r.ben.viewer, {
      ...second,
      body: "Mine now",
    }),
    "not-saved",
  );
  assert.equal((await row(second.id))!.body, "The annual price toggle.");
  // One thread, oldest first.
  const replies = await sandbox.listReplies(db(), r.ben.viewer, {
    rootId: r.ana.commentId,
    mode: "collaborate",
  });
  assert.deepEqual(
    replies.map((x) => x.id),
    [first.id, second.id],
  );
  // Delete then Undo under the same id.
  await sandbox.deleteReply(db(), r.ben.viewer, { id: second.id });
  assert.ok(await row(second.id));
  await sandbox.deleteReply(db(), r.ana.viewer, { id: second.id });
  assert.equal(await row(second.id), undefined);
  assert.equal(await sandbox.saveReply(db(), r.ana.viewer, second), "ok");
  assert.equal((await row(second.id))!.parentId, r.ana.commentId);
});

test("C5: erasing Ana's email removes her comments and replies; Ben's reply stays under a removed root, which takes a new reply", async () => {
  const r = await buildReview();
  const root = await row(r.ana.commentId);
  const anaReply = reply(r.ben.commentId, "Agreed.");
  assert.equal(await sandbox.saveReply(db(), r.ana.viewer, anaReply), "ok");
  const benReply = reply(r.ana.commentId, "Same for me.");
  assert.equal(await sandbox.saveReply(db(), r.ben.viewer, benReply), "ok");

  const erased = await sandbox.eraseEmail(db(), r.admin, {
    email: r.ana.email,
    userIds: [],
    clearLabels: [],
  });
  assert.ok(erased);
  assert.equal(await row(r.ana.commentId), undefined);
  assert.equal(await row(anaReply.id), undefined);
  assert.ok(await row(benReply.id));

  const read = await sandbox.listThread(db(), r.ben.viewer, {
    mode: "collaborate",
  });
  const removed = read.find((x) => x.id === r.ana.commentId)!;
  assert.ok("removed" in removed && removed.removed);
  assert.equal(removed.design, root!.design);
  assert.deepEqual(removed.anchor, root!.anchor);
  assert.deepEqual(
    removed.replies.map((x) => x.id),
    [benReply.id],
  );
  assert.ok(!("body" in removed) && !("author" in removed));
  const ben = read.find((x) => x.id === r.ben.commentId)!;
  assert.deepEqual(ben.replies, []);

  const later = reply(r.ana.commentId, "Still true after the change.");
  assert.equal(await sandbox.saveReply(db(), r.ben.viewer, later), "ok");
  const stored = await row(later.id);
  assert.equal(stored!.parentId, r.ana.commentId);
  assert.equal(stored!.design, root!.design);
  assert.deepEqual(stored!.anchor, root!.anchor);
  // So may the team, and a reply to a reply under it joins the same thread.
  const teamLater = reply(benReply.id, "We see it.");
  assert.equal(
    await sandbox.saveReply(db(), r.team, { ...teamLater, slug: r.slug }),
    "ok",
  );
  assert.equal((await row(teamLater.id))!.parentId, r.ana.commentId);
});

test("C6: on a private slug no reviewer's read returns another's rows, and a reply is refused with no write", async () => {
  const r = await buildReview();
  // Rows a collaborate review would show: Ben's reply under Ana's comment.
  const planted = reply(r.ana.commentId, "Planted.");
  assert.equal(await sandbox.saveReply(db(), r.ben.viewer, planted), "ok");
  for (const [me, other] of [
    [r.ana, r.ben],
    [r.ben, r.ana],
  ] as const) {
    const read = await sandbox.listThread(db(), me.viewer, {
      mode: "private",
    });
    const text = JSON.stringify(read);
    assert.ok(!text.includes(other.commentId));
    assert.ok(!text.includes(other.displayName));
    assert.deepEqual(
      read.filter((x) => !("removed" in x)).map((x) => x.id),
      [me.commentId],
    );
    for (const rootId of [me.commentId, other.commentId])
      for (const x of await sandbox.listReplies(db(), me.viewer, {
        rootId,
        mode: "private",
      }))
        assert.deepEqual(x.author, "self");
    const id = randomUUID();
    assert.equal(
      await sandbox.saveReply(db(), me.viewer, {
        ...reply(other.commentId, "Private reply", id),
        mode: "private",
      }),
      "not-saved",
    );
    assert.equal(await row(id), undefined);
  }
  // Ana, in private mode, never sees Ben's reply under her own comment.
  const ana = await sandbox.listThread(db(), r.ana.viewer, { mode: "private" });
  assert.ok(!JSON.stringify(ana).includes("Planted."));
});

test("C8: the team's read names reply authors by label or email, and a reviewer's own list still holds only their roots", async () => {
  const r = await buildReview();
  const anaReply = reply(r.ben.commentId, "Agreed.");
  assert.equal(await sandbox.saveReply(db(), r.ana.viewer, anaReply), "ok");
  const teamReply = reply(r.ben.commentId, "Thanks.");
  assert.equal(
    await sandbox.saveReply(db(), r.team, { ...teamReply, slug: r.slug }),
    "ok",
  );
  // A second team member reads the first by email.
  const otherId = randomUUID();
  users.push(otherId);
  const otherEmail = `sam-${otherId.slice(0, 8)}@example.com`;
  await database.admin`insert into auth.users (id, email) values (${otherId}, ${otherEmail})`;
  const other: TeamViewer = { ...r.team, userId: otherId, email: otherEmail };
  const read = await sandbox.listThread(db(), other, {
    mode: "collaborate",
    slug: r.slug,
  });
  assert.ok(!read.some((x) => x.id === r.teamNoteId));
  const ben = read.find((x) => x.id === r.ben.commentId)!;
  assert.ok("author" in ben);
  assert.deepEqual(ben.author, { reviewer: "Ben Okafor" });
  assert.deepEqual(
    ben.replies.map((x) => [x.id, x.author]),
    [
      [anaReply.id, { reviewer: "Ana Ruiz" }],
      [teamReply.id, { team: r.team.email }],
    ],
  );
  // To its author, the team reply is their own.
  const own = await sandbox.listReplies(db(), r.team, {
    rootId: r.ben.commentId,
    mode: "collaborate",
    slug: r.slug,
  });
  assert.deepEqual(
    own.map((x) => x.author),
    [{ reviewer: "Ana Ruiz" }, "self"],
  );
  // Ana's own comment list is her roots alone, never her reply.
  const mine = await sandbox.listMyComments(db(), r.ana.viewer, {});
  assert.deepEqual(
    mine.map((x) => x.id),
    [r.ana.commentId],
  );
});
