/**
 * LAB-14 C3, C4 and C6, on the local database (`yarn test:db`): team notes.
 * Each test builds its own slug with two reviewers, Ana and Ben, and two
 * team members, Taylor and Sam, on synthetic fixtures. The isolation cases
 * for the same functions, as every viewer kind, are in team-cases.ts, and
 * the registry-wide sweep that no reviewer read or count meets a team note
 * is in isolation.test.ts.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { eq } from "drizzle-orm";

import * as sandbox from "@pem/db/sandbox";

import type { ReviewerViewer, TeamViewer } from "../../src/sandbox/viewer.ts";
import { sandboxComments } from "../../src/schema/index.ts";
import { seedCode, seedEntry } from "./erasure-fixtures.ts";
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
    }
    for (const id of users)
      await database.admin`delete from auth.users where id = ${id}`;
    await database.db.$client.end();
    await database.admin.end();
  }
});

const db = () => database.db;

type Slug = {
  slug: string;
  ana: { viewer: ReviewerViewer; commentId: string };
  ben: { viewer: ReviewerViewer; commentId: string };
  taylor: TeamViewer;
  sam: TeamViewer;
};

async function teamMember(
  run: string,
  name: string,
  role: TeamViewer["role"],
): Promise<TeamViewer> {
  const userId = randomUUID();
  const email = `${name}-${run}@example.com`;
  users.push(userId);
  await database.admin`insert into auth.users (id, email) values (${userId}, ${email})`;
  return { kind: "team", userId, email, role };
}

async function buildSlug(): Promise<Slug> {
  const run = randomUUID().slice(0, 8);
  const slug = `team-${run}`;
  slugs.push(slug);
  async function reviewer(label: string, email: string) {
    const reviewerId = await seedCode(db(), {
      slug,
      label,
      displayName: label,
    });
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
    return { viewer, commentId: entry.commentId };
  }
  return {
    slug,
    ana: await reviewer("Ana Ruiz", `ana-${run}@example.com`),
    ben: await reviewer("Ben Okafor", `ben-${run}@example.com`),
    taylor: await teamMember(run, "taylor", "developer"),
    sam: await teamMember(run, "sam", "admin"),
  };
}

function note(slug: string, number = 1, body = "Move the price up.") {
  return {
    id: randomUUID(),
    slug,
    number,
    design: "circle",
    body,
    anchor: { marked: "plans", x: 0.4, y: 0.6, place: "Plans" },
    viewportW: 1440,
    viewportH: 900,
    clientCreatedAt: new Date("2026-10-07T10:00:00Z"),
  };
}

async function row(id: string) {
  const [found] = await db()
    .select()
    .from(sandboxComments)
    .where(eq(sandboxComments.id, id));
  return found;
}

async function allRows(slug: string) {
  return db()
    .select()
    .from(sandboxComments)
    .where(eq(sandboxComments.slug, slug))
    .orderBy(sandboxComments.id);
}

test("C3: a team note is stored as team, with no reviewer, access or kind", async () => {
  const s = await buildSlug();
  const n = note(s.slug);
  assert.deepEqual(await sandbox.saveTeamNote(db(), s.taylor, n), {
    number: 1,
  });
  const stored = await row(n.id);
  assert.equal(stored!.teamUserId, s.taylor.userId);
  assert.equal(stored!.reviewerId, null);
  assert.equal(stored!.accessId, null);
  assert.equal(stored!.kind, null);
  assert.equal(stored!.parentId, null);
  // A note has no type.
  await assert.rejects(
    sandbox.saveTeamNote(db(), s.taylor, {
      ...note(s.slug),
      kind: "problem",
    } as never),
    sandbox.SandboxAccessError,
  );
});

test("C3: notes by two team members on one slug are T1 and T2, fixed by the server", async () => {
  const s = await buildSlug();
  // Both browsers propose T1.
  const first = note(s.slug, 1);
  const second = note(s.slug, 1);
  assert.deepEqual(await sandbox.saveTeamNote(db(), s.taylor, first), {
    number: 1,
  });
  assert.deepEqual(await sandbox.saveTeamNote(db(), s.sam, second), {
    number: 2,
  });
  // A free provisional number is kept.
  const fifth = note(s.slug, 5);
  assert.deepEqual(await sandbox.saveTeamNote(db(), s.sam, fifth), {
    number: 5,
  });
  // A reviewer's comment numbers never clash with T-numbers.
  assert.equal((await row(s.ana.commentId))!.number, 1);
});

test("C3: racing first saves on one slug never share a T-number", async () => {
  const s = await buildSlug();
  const notes = Array.from({ length: 6 }, () => note(s.slug, 1));
  const results = await Promise.all(
    notes.map((n, i) =>
      sandbox.saveTeamNote(db(), i % 2 ? s.sam : s.taylor, n),
    ),
  );
  const numbers = results.map((r) => (r === "taken" ? 0 : r.number));
  assert.deepEqual(
    [...numbers].sort((a, b) => a - b),
    [1, 2, 3, 4, 5, 6],
  );
});

test("C3: a retry under the same id gives one row and keeps its number; an edit changes only the text", async () => {
  const s = await buildSlug();
  const n = note(s.slug, 1);
  await sandbox.saveTeamNote(db(), s.taylor, n);
  await sandbox.saveTeamNote(db(), s.sam, note(s.slug, 2));
  assert.deepEqual(await sandbox.saveTeamNote(db(), s.taylor, n), {
    number: 1,
  });
  // A retry racing itself still lands once.
  await Promise.all([
    sandbox.saveTeamNote(db(), s.taylor, n),
    sandbox.saveTeamNote(db(), s.taylor, n),
  ]);
  assert.equal((await allRows(s.slug)).filter((r) => r.id === n.id).length, 1);
  assert.deepEqual(
    await sandbox.saveTeamNote(db(), s.taylor, {
      ...n,
      number: 9,
      design: "square",
      body: "Edited",
    }),
    { number: 1 },
  );
  const stored = await row(n.id);
  assert.equal(stored!.body, "Edited");
  assert.equal(stored!.number, 1);
  assert.equal(stored!.design, "circle");
});

test("C4: a reviewer's own read and their thread read hold no team note; the team's read holds both, labelled", async () => {
  const s = await buildSlug();
  const n = note(s.slug, 1, "Team only: drop the banner");
  await sandbox.saveTeamNote(db(), s.taylor, n);
  for (const r of [s.ana, s.ben]) {
    const mine = await sandbox.listMyComments(db(), r.viewer, {});
    assert.deepEqual(
      mine.map((c) => c.id),
      [r.commentId],
    );
    for (const mode of ["private", "collaborate"] as const) {
      const thread = await sandbox.listThread(db(), r.viewer, { mode });
      assert.ok(!JSON.stringify(thread).includes(n.id));
      assert.ok(!JSON.stringify(thread).includes("Team only"));
    }
  }
  const team = await sandbox.listTeamComments(db(), s.sam, { slug: s.slug });
  assert.deepEqual(
    team.reviewers.map((r) => r.label),
    ["Ana Ruiz", "Ben Okafor"],
  );
  const theNote = team.comments.find((c) => c.id === n.id)!;
  assert.deepEqual(theNote.author, {
    kind: "team",
    email: s.taylor.email,
    self: false,
  });
  const anas = team.comments.find((c) => c.id === s.ana.commentId)!;
  assert.deepEqual(anas.author, {
    kind: "reviewer",
    reviewerId: s.ana.viewer.reviewerId,
    label: "Ana Ruiz",
  });
  // The author reads their own note as theirs.
  const own = await sandbox.listTeamComments(db(), s.taylor, {
    slug: s.slug,
  });
  assert.equal(
    own.comments.find((c) => c.id === n.id)!.author.kind === "team" &&
      (own.comments.find((c) => c.id === n.id)!.author as { self: boolean })
        .self,
    true,
  );
});

test("C4: a team note is counted apart from the reviewer comments", async () => {
  const s = await buildSlug();
  const n = note(s.slug);
  await sandbox.saveTeamNote(db(), s.taylor, n);
  const counts = await sandbox.countExperimentData(db(), s.sam, {
    slug: s.slug,
  });
  assert.equal(counts.comments, 2);
  assert.equal(counts.teamNotes, 1);
});

test("C4: each team function refuses a reviewer viewer, and nothing changes", async () => {
  const s = await buildSlug();
  const before = await allRows(s.slug);
  const as = s.ana.viewer;
  for (const call of [
    () => sandbox.listTeamComments(db(), as, { slug: s.slug }),
    () => sandbox.saveTeamNote(db(), as, note(s.slug)),
    () => sandbox.deleteTeamNote(db(), as, { id: s.ana.commentId }),
  ])
    await assert.rejects(call(), (error: unknown) => {
      assert.ok(error instanceof sandbox.SandboxAccessError);
      assert.equal((error as Error).message, "This needs a team member.");
      return true;
    });
  assert.deepEqual(await allRows(s.slug), before);
});

test("C6: a team save or delete naming a reviewer's comment, or another member's note, changes nothing and is taken", async () => {
  const s = await buildSlug();
  const samsNote = note(s.slug, 1, "Sam's note");
  await sandbox.saveTeamNote(db(), s.sam, samsNote);
  const before = await allRows(s.slug);
  for (const id of [s.ana.commentId, s.ben.commentId, samsNote.id]) {
    assert.equal(
      await sandbox.saveTeamNote(db(), s.taylor, {
        ...note(s.slug),
        id,
        body: "Overwritten",
      }),
      "taken",
    );
    assert.equal(await sandbox.deleteTeamNote(db(), s.taylor, { id }), "taken");
  }
  assert.deepEqual(await allRows(s.slug), before);
  // Their own note goes; a second delete finds it already gone.
  const mine = note(s.slug, 2);
  await sandbox.saveTeamNote(db(), s.taylor, mine);
  assert.equal(
    await sandbox.deleteTeamNote(db(), s.taylor, { id: mine.id }),
    "deleted",
  );
  assert.equal(
    await sandbox.deleteTeamNote(db(), s.taylor, { id: mine.id }),
    "deleted",
  );
  assert.deepEqual(await allRows(s.slug), before);
  // Undo: the same id comes back under its number.
  assert.deepEqual(await sandbox.saveTeamNote(db(), s.taylor, mine), {
    number: 2,
  });
});

test("C6: a reviewer's save or delete naming a team note's id changes nothing", async () => {
  const s = await buildSlug();
  const n = note(s.slug);
  await sandbox.saveTeamNote(db(), s.taylor, n);
  const before = await allRows(s.slug);
  assert.equal(
    await sandbox.saveComment(db(), s.ana.viewer, {
      ...note(s.slug),
      id: n.id,
      kind: null,
      body: "Overwritten",
    } as never),
    "taken",
  );
  await sandbox.deleteComment(db(), s.ana.viewer, { id: n.id });
  assert.deepEqual(await allRows(s.slug), before);
});
