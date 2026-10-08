/**
 * The sandbox isolation suite (LAB-3, D-LAB-34), on the local database only
 * (`yarn test:db`). Every sandbox table is service-only, so isolation rests
 * on @pem/db/sandbox; this suite proves it. Each runtime export runs its
 * registered cases: a viewer function as every viewer kind, a gate function
 * through its named cases. The coverage guard fails for an export with no
 * case, so a surface ticket adds its cases with its function.
 */

import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { after, before, describe, test } from "node:test";
import { and, count, eq, inArray, sql } from "drizzle-orm";

// Through the package's own subpath, so a wrong `exports` entry fails here too.
import * as sandbox from "@pem/db/sandbox";

import {
  ACTION_INPUT_INVALID,
  ROLE_CHANGE_ACTION,
} from "../../src/sandbox/actions.ts";
import {
  COMMENT_BODY_INVALID,
  COMMENT_INPUT_INVALID,
} from "../../src/sandbox/comments.ts";
import {
  DESIGN_INPUT_INVALID,
  REVIEWER_NOT_FOUND,
} from "../../src/sandbox/experiment.ts";
import { EXPERIMENT_STATS_INPUT_INVALID } from "../../src/sandbox/experiments.ts";
import {
  ACCESS_INPUT_INVALID,
  EMAIL_NOT_NORMALISED,
  THROTTLE_INPUT_INVALID,
} from "../../src/sandbox/gate.ts";
import {
  REVIEW_ANSWERS_BYTES_MAX,
  REVIEW_INPUT_INVALID,
  REVIEW_TRIAGE_INVALID,
  REVIEW_VERSION_TAKEN,
} from "../../src/sandbox/review.ts";
import {
  NOT_A_REVIEWER_VIEWER,
  NOT_A_TEAM_VIEWER,
  NOT_AN_ADMIN_VIEWER,
  reviewerScope,
  type TeamViewer,
  type Viewer,
} from "../../src/sandbox/viewer.ts";
import {
  sandboxAccesses,
  sandboxActions,
  sandboxComments,
  sandboxGateAttempts,
  sandboxReviewers,
  sandboxReviewVersions,
  sandboxViewEvents,
} from "../../src/schema/index.ts";
import { codesCases } from "./codes-cases.ts";
import { erasureCases } from "./erasure-cases.ts";
import {
  buildWorld,
  codeHash,
  dropWorld,
  openSandboxTestDb,
  type TestDatabase,
  type World,
} from "./fixtures.ts";
import {
  coverageProblems,
  VIEWER_KINDS,
  type Registry,
  type ViewerKind,
} from "./registry.ts";
import { threadsCases } from "./threads-cases.ts";

let database: TestDatabase;
let world: World;

before(async () => {
  database = await openSandboxTestDb();
  world = await buildWorld(database);
});

after(async () => {
  if (database) {
    if (throttleKeys.length)
      await database.db
        .delete(sandboxGateAttempts)
        .where(inArray(sandboxGateAttempts.keyHash, throttleKeys));
    if (world) await dropWorld(database, world);
    await database.db.$client.end();
    await database.admin.end();
  }
});

const db = () => database.db;

function viewerFor(w: World, kind: ViewerKind): Viewer {
  switch (kind) {
    case "reviewer on slug A":
      return w.a1.viewer;
    case "second reviewer on slug A":
      return w.a2.viewer;
    case "reviewer on slug B":
      return w.b.viewer;
    case "developer":
      return w.developer;
    case "admin":
      return w.admin;
  }
}

/** Asserts a value is a plain object with exactly these keys: nothing more crosses. */
function exactKeys(value: unknown, keys: string[]) {
  assert.ok(value && typeof value === "object", "expected an object");
  assert.deepEqual(Object.keys(value).sort(), [...keys].sort());
}

/** Rethrows unless the error is the module's own, with exactly this message. */
function refusedWith(message: string) {
  return (error: unknown) => {
    assert.ok(error instanceof sandbox.SandboxAccessError, String(error));
    assert.equal((error as Error).message, message);
    return true;
  };
}

async function actionsBy(actor: string) {
  return db()
    .select()
    .from(sandboxActions)
    .where(eq(sandboxActions.actorUserId, actor));
}

async function actionRowCount() {
  const [row] = await db().select({ n: count() }).from(sandboxActions);
  return row!.n;
}

const recordAsReviewer = (kind: ViewerKind) => async (w: World) => {
  const before = await actionRowCount();
  await assert.rejects(
    sandbox.recordAction(db(), viewerFor(w, kind), {
      action: "erase-email",
      slug: w.slugA,
    }),
    refusedWith(NOT_A_TEAM_VIEWER),
  );
  assert.equal(await actionRowCount(), before, "a refused call wrote a row");
};

/** A role change names the changed team member, and nothing else. */
async function roleChangeAs(w: World, viewer: TeamViewer) {
  const target = `promoted-${viewer.role}-${w.run}@example.test`;
  await sandbox.recordAction(db(), viewer, {
    action: ROLE_CHANGE_ACTION,
    targetEmail: target,
  });
  const rows = (await actionsBy(viewer.userId)).filter(
    (row) => row.action === ROLE_CHANGE_ACTION && row.targetEmail === target,
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0]!.slug, null);
  await db().delete(sandboxActions).where(eq(sandboxActions.id, rows[0]!.id));
}

const recordAsTeam = (kind: "developer" | "admin") => async (w: World) => {
  const viewer = viewerFor(w, kind) as TeamViewer;
  const action = `probe-${kind}`;
  await sandbox.recordAction(db(), viewer, {
    action,
    slug: w.slugA,
    counts: { comments: 2, accesses: 1 },
  });
  const rows = (await actionsBy(viewer.userId)).filter(
    (row) => row.action === action,
  );
  assert.equal(rows.length, 1);
  const [row] = rows;
  exactKeys(row, [
    "id",
    "at",
    "actorUserId",
    "actorEmail",
    "action",
    "slug",
    "targetEmail",
    "counts",
  ]);
  assert.equal(row!.actorUserId, viewer.userId);
  assert.equal(row!.actorEmail, viewer.email);
  assert.equal(row!.slug, w.slugA);
  assert.equal(row!.targetEmail, null);
  assert.deepEqual(row!.counts, { comments: 2, accesses: 1 });
  // Nothing a reviewer gave lands in the record.
  const text = JSON.stringify(row);
  for (const r of [w.a1, w.a2, w.b])
    for (const secret of [r.label, r.email, r.code, r.viewer.reviewerId])
      assert.ok(secret && !text.includes(secret));
  await roleChangeAs(w, viewer);
};

/** withRoleChangeLock (LAB-9): only an admin runs `fn`, and runs it holding the lock. */
const lockRefused = (kind: ViewerKind, message: string) => async (w: World) => {
  let ran = false;
  await assert.rejects(
    sandbox.withRoleChangeLock(db(), viewerFor(w, kind), async () => {
      ran = true;
    }),
    refusedWith(message),
  );
  assert.equal(ran, false, "a refused viewer's fn ran");
};

async function lockAsAdmin(w: World) {
  const held = await sandbox.withRoleChangeLock(db(), w.admin, async (tx) => {
    const rows = await tx.execute<{ n: number }>(
      sql`select count(*)::int as n from pg_locks where locktype = 'advisory' and pid = pg_backend_pid() and granted`,
    );
    return rows[0]!.n;
  });
  assert.equal(held, 1, "fn ran without the advisory lock");
}

/** listExperimentStats (LAB-10): numbers and one date per slug, for the team only. */
const statsRefused = (kind: ViewerKind) => async (w: World) => {
  await assert.rejects(
    sandbox.listExperimentStats(db(), viewerFor(w, kind), {
      slugs: [w.slugA, w.slugB],
    }),
    refusedWith(NOT_A_TEAM_VIEWER),
  );
};

const statsAsTeam = (kind: "developer" | "admin") => async (w: World) => {
  const viewer = viewerFor(w, kind);
  const unknown = `iso-none-${w.run}`;
  // A team note later than every reviewer row must not move last activity.
  const noteId = randomUUID();
  await db()
    .insert(sandboxComments)
    .values({
      id: noteId,
      slug: w.slugA,
      design: "circle",
      number: 2,
      body: "Team note",
      anchor: { id: "hero", x: 0.2, y: 0.2 },
      viewportW: 1280,
      viewportH: 800,
      clientCreatedAt: new Date("2099-01-01T00:00:00Z"),
      createdAt: new Date("2099-01-01T00:00:00Z"),
      teamUserId: w.teamUser,
    });
  try {
    const stats = await sandbox.listExperimentStats(db(), viewer, {
      slugs: [w.slugA, w.slugB, unknown],
    });
    assert.deepEqual(
      stats.map((s) => s.slug),
      [w.slugA, w.slugB, unknown],
    );
    for (const entry of stats) {
      exactKeys(entry, [
        "slug",
        "codes",
        "sent",
        "lastActivityAt",
        "reviewersHoldingData",
      ]);
      assert.ok(
        entry.lastActivityAt === null || entry.lastActivityAt instanceof Date,
      );
    }
    const [a, b, none] = stats;
    // Slug A holds a1, a2 and the signed-in reviewer, each with a version.
    assert.deepEqual([a!.codes, a!.sent, a!.reviewersHoldingData], [3, 3, 3]);
    assert.deepEqual([b!.codes, b!.sent, b!.reviewersHoldingData], [1, 1, 1]);
    assert.deepEqual(none, {
      slug: unknown,
      codes: 0,
      sent: 0,
      lastActivityAt: null,
      reviewersHoldingData: 0,
    });
    // The latest reviewer view, comment or send on each slug, and only that slug's.
    for (const [entry, slug] of [
      [a!, w.slugA],
      [b!, w.slugB],
    ] as const) {
      const [row] = await database.admin<{ at: Date | string }[]>`
        select greatest(
          (select max(at) from public.sandbox_view_events where slug = ${slug}),
          (select max(created_at) from public.sandbox_comments where slug = ${slug} and reviewer_id is not null),
          (select max(created_at) from public.sandbox_review_versions where slug = ${slug})
        ) as at`;
      assert.equal(
        entry.lastActivityAt?.getTime(),
        new Date(row!.at).getTime(),
      );
      assert.ok(entry.lastActivityAt!.getUTCFullYear() < 2099);
    }
    // Nothing a reviewer gave is in the answer.
    const text = JSON.stringify(stats);
    for (const r of [w.a1, w.a2, w.b, w.signedIn])
      for (const secret of [r.label, r.email, r.code, r.commentBody])
        assert.ok(!secret || !text.includes(secret));
    // A malformed slug list is refused without echoing it.
    for (const slugs of [["Not A Slug"], [w.a1.email!], "x" as never])
      await assert.rejects(
        sandbox.listExperimentStats(db(), viewer, { slugs }),
        refusedWith(EXPERIMENT_STATS_INPUT_INVALID),
      );
  } finally {
    await db().delete(sandboxComments).where(eq(sandboxComments.id, noteId));
  }
};

/** The reviewer row's two design columns, read past the module. */
async function designsOf(reviewerId: string) {
  const [row] = await db()
    .select({
      first: sandboxReviewers.firstDesign,
      last: sandboxReviewers.lastDesign,
    })
    .from(sandboxReviewers)
    .where(eq(sandboxReviewers.id, reviewerId));
  return row!;
}

async function setDesigns(
  reviewerId: string,
  first: string | null,
  last: string | null,
) {
  await db()
    .update(sandboxReviewers)
    .set({ firstDesign: first, lastDesign: last })
    .where(eq(sandboxReviewers.id, reviewerId));
}

/** Every reviewer row's designs and every view row, to prove a call changed nothing else. */
async function experimentSnapshot(w: World) {
  const reviewers = await db()
    .select({
      id: sandboxReviewers.id,
      first: sandboxReviewers.firstDesign,
      last: sandboxReviewers.lastDesign,
    })
    .from(sandboxReviewers)
    .where(inArray(sandboxReviewers.slug, [w.slugA, w.slugB]))
    .orderBy(sandboxReviewers.id);
  const views = await db()
    .select({ id: sandboxViewEvents.id })
    .from(sandboxViewEvents)
    .where(inArray(sandboxViewEvents.slug, [w.slugA, w.slugB]))
    .orderBy(sandboxViewEvents.id);
  return { reviewers, views };
}

function rowsFor(w: World, kind: ViewerKind) {
  return kind === "reviewer on slug A"
    ? w.a1
    : kind === "second reviewer on slug A"
      ? w.a2
      : w.b;
}

/** LAB-11 C6: the team is refused by every experiment function, and nothing changes. */
const experimentRefused =
  (name: "readReviewerDesigns" | "claimFirstDesign" | "recordViewEvent") =>
  (kind: "developer" | "admin") =>
  async (w: World) => {
    const before = await experimentSnapshot(w);
    const viewer = viewerFor(w, kind);
    const call =
      name === "readReviewerDesigns"
        ? sandbox.readReviewerDesigns(db(), viewer, {})
        : name === "claimFirstDesign"
          ? sandbox.claimFirstDesign(db(), viewer, { design: "circle" })
          : sandbox.recordViewEvent(db(), viewer, {
              kind: "load",
              design: "circle",
            });
    await assert.rejects(call, refusedWith(NOT_A_REVIEWER_VIEWER));
    assert.deepEqual(await experimentSnapshot(w), before);
  };

const readDesignsAs = (kind: ViewerKind) => async (w: World) => {
  const own = rowsFor(w, kind).viewer;
  const everyone = [w.a1, w.a2, w.b].map((r) => r.viewer.reviewerId);
  try {
    // Each reviewer row gets its own designs, so a read of another's shows.
    for (const [i, id] of everyone.entries())
      await setDesigns(id, `first-${i}`, `last-${i}`);
    const mine = everyone.indexOf(own.reviewerId);
    const read = await sandbox.readReviewerDesigns(db(), own, {});
    exactKeys(read, ["firstDesign", "lastDesign", "hasSent"]);
    assert.deepEqual(read, {
      firstDesign: `first-${mine}`,
      lastDesign: `last-${mine}`,
      hasSent: true,
    });
    // hasSent is the viewer's own: with their version gone it reads false,
    // while every other reviewer, each still holding one, reads true.
    const [version] = await db()
      .select()
      .from(sandboxReviewVersions)
      .where(eq(sandboxReviewVersions.reviewerId, own.reviewerId));
    await db()
      .delete(sandboxReviewVersions)
      .where(eq(sandboxReviewVersions.id, version!.id));
    try {
      assert.equal(
        (await sandbox.readReviewerDesigns(db(), own, {})).hasSent,
        false,
      );
      for (const r of [w.a1, w.a2, w.b, w.signedIn].filter(
        (r) => r.viewer.reviewerId !== own.reviewerId,
      ))
        assert.equal(
          (await sandbox.readReviewerDesigns(db(), r.viewer, {})).hasSent,
          true,
        );
    } finally {
      await db().insert(sandboxReviewVersions).values(version!);
    }
    // Another slug, or a reviewer id from another slug, reads nothing.
    const other = own.slug === w.slugA ? w.b.viewer : w.a1.viewer;
    for (const crossed of [
      { ...own, slug: other.slug },
      { ...own, reviewerId: other.reviewerId },
    ])
      await assert.rejects(
        sandbox.readReviewerDesigns(db(), crossed, {}),
        refusedWith(REVIEWER_NOT_FOUND),
      );
  } finally {
    for (const id of everyone) await setDesigns(id, null, null);
  }
};

const claimAs = (kind: ViewerKind) => async (w: World) => {
  const own = rowsFor(w, kind).viewer;
  const before = await experimentSnapshot(w);
  try {
    assert.equal(
      await sandbox.claimFirstDesign(db(), own, { design: "square" }),
      "square",
    );
    // A later claim never overwrites the first.
    assert.equal(
      await sandbox.claimFirstDesign(db(), own, { design: "circle" }),
      "square",
    );
    assert.deepEqual(await designsOf(own.reviewerId), {
      first: "square",
      last: null,
    });
    // No other reviewer row and no view row changed.
    const after = await experimentSnapshot(w);
    assert.deepEqual(after.views, before.views);
    assert.deepEqual(
      after.reviewers.filter((r) => r.id !== own.reviewerId),
      before.reviewers.filter((r) => r.id !== own.reviewerId),
    );
    // A slug that is not the viewer's matches no row and claims nothing.
    await assert.rejects(
      sandbox.claimFirstDesign(
        db(),
        { ...own, slug: own.slug === w.slugA ? w.slugB : w.slugA },
        { design: "circle" },
      ),
      refusedWith(REVIEWER_NOT_FOUND),
    );
    // A malformed design is refused without a write or an echo.
    for (const design of ["Circle", "", "a".repeat(25), w.a1.email, 3])
      await assert.rejects(
        sandbox.claimFirstDesign(db(), own, { design: design as string }),
        refusedWith(DESIGN_INPUT_INVALID),
      );
  } finally {
    await setDesigns(own.reviewerId, null, null);
  }
  assert.deepEqual(await experimentSnapshot(w), before);
};

const recordViewAs = (kind: ViewerKind) => async (w: World) => {
  const rows = rowsFor(w, kind);
  const own = rows.viewer;
  const before = await experimentSnapshot(w);
  try {
    await sandbox.recordViewEvent(db(), own, {
      kind: "switch",
      design: "square",
    });
    const mine = await db()
      .select()
      .from(sandboxViewEvents)
      .where(eq(sandboxViewEvents.reviewerId, own.reviewerId));
    const added = mine.filter((row) => row.id !== rows.viewId);
    assert.equal(added.length, 1);
    assert.equal(added[0]!.accessId, own.accessId);
    assert.equal(added[0]!.slug, own.slug);
    assert.equal(added[0]!.kind, "switch");
    assert.equal(added[0]!.design, "square");
    assert.equal((await designsOf(own.reviewerId)).last, "square");
    const after = await experimentSnapshot(w);
    assert.deepEqual(
      after.reviewers.filter((r) => r.id !== own.reviewerId),
      before.reviewers.filter((r) => r.id !== own.reviewerId),
    );
    await db()
      .delete(sandboxViewEvents)
      .where(eq(sandboxViewEvents.id, added[0]!.id));
    // Another slug, another reviewer's id or another's access writes nothing.
    const other = own.slug === w.slugA ? w.b.viewer : w.a1.viewer;
    for (const crossed of [
      { ...own, slug: other.slug },
      { ...own, reviewerId: other.reviewerId },
      { ...own, accessId: other.accessId },
    ]) {
      await assert.rejects(
        sandbox.recordViewEvent(db(), crossed, {
          kind: "load",
          design: "circle",
        }),
        refusedWith(REVIEWER_NOT_FOUND),
      );
    }
    for (const input of [
      { kind: "scroll", design: "circle" },
      { kind: "load", design: "Not A Design" },
    ])
      await assert.rejects(
        sandbox.recordViewEvent(db(), own, input as never),
        refusedWith(DESIGN_INPUT_INVALID),
      );
  } finally {
    await setDesigns(own.reviewerId, null, null);
  }
  assert.deepEqual(await experimentSnapshot(w), before);
};

/** Every comment on both slugs, team notes included, to prove a call changed nothing else. */
async function commentsSnapshot(w: World) {
  return db()
    .select()
    .from(sandboxComments)
    .where(inArray(sandboxComments.slug, [w.slugA, w.slugB]))
    .orderBy(sandboxComments.id);
}

function newComment(design = "circle") {
  return {
    id: randomUUID(),
    number: 7,
    design,
    kind: "problem" as const,
    body: "Probe comment",
    anchor: { marked: "plans", x: 0.25, y: 0.75, place: "Plans" },
    viewportW: 390,
    viewportH: 844,
    clientCreatedAt: new Date("2026-10-07T10:00:00Z"),
  };
}

/** LAB-12 C7: the team is refused by every comments function, and nothing changes. */
const commentsRefused =
  (name: "listMyComments" | "saveComment" | "deleteComment") =>
  (kind: "developer" | "admin") =>
  async (w: World) => {
    const before = await commentsSnapshot(w);
    const viewer = viewerFor(w, kind);
    const call =
      name === "listMyComments"
        ? sandbox.listMyComments(db(), viewer, {})
        : name === "saveComment"
          ? sandbox.saveComment(db(), viewer, newComment())
          : sandbox.deleteComment(db(), viewer, { id: w.teamNoteId });
    await assert.rejects(call, refusedWith(NOT_A_REVIEWER_VIEWER));
    assert.deepEqual(await commentsSnapshot(w), before);
  };

/** A reviewer reads their own comments on their slug: never another's, never a team note. */
const listCommentsAs = (kind: ViewerKind) => async (w: World) => {
  const rows = rowsFor(w, kind);
  const own = rows.viewer;
  const read = await sandbox.listMyComments(db(), own, {});
  assert.equal(read.length, 1);
  exactKeys(read[0], [
    "id",
    "number",
    "design",
    "kind",
    "body",
    "anchor",
    "viewportW",
    "viewportH",
    "clientCreatedAt",
    "createdAt",
  ]);
  assert.equal(read[0]!.id, rows.commentId);
  assert.equal(read[0]!.body, rows.commentBody);
  const text = JSON.stringify(read);
  for (const other of [w.a1, w.a2, w.b, w.signedIn].filter(
    (r) => r.viewer.reviewerId !== own.reviewerId,
  ))
    assert.ok(!text.includes(other.commentBody));
  assert.ok(!text.includes("Team note"));
  // A crossed slug or reviewer id reads nothing.
  const other = own.slug === w.slugA ? w.b.viewer : w.a1.viewer;
  for (const crossed of [
    { ...own, slug: other.slug },
    { ...own, reviewerId: other.reviewerId },
  ])
    assert.deepEqual(await sandbox.listMyComments(db(), crossed, {}), []);
  await assert.rejects(
    sandbox.listMyComments(db(), own, { slug: w.slugB } as never),
    refusedWith(COMMENT_INPUT_INVALID),
  );
};

/** A reviewer saves under a new id, retries and edits it; another's id and a team note's are never touched. */
const saveCommentAs = (kind: ViewerKind) => async (w: World) => {
  const rows = rowsFor(w, kind);
  const own = rows.viewer;
  const before = await commentsSnapshot(w);
  const comment = newComment();
  try {
    assert.equal(await sandbox.saveComment(db(), own, comment), "saved");
    assert.equal(await sandbox.saveComment(db(), own, comment), "saved");
    const stored = await db()
      .select()
      .from(sandboxComments)
      .where(eq(sandboxComments.id, comment.id));
    assert.equal(stored.length, 1);
    assert.equal(stored[0]!.reviewerId, own.reviewerId);
    assert.equal(stored[0]!.accessId, own.accessId);
    assert.equal(stored[0]!.slug, own.slug);
    assert.equal(stored[0]!.teamUserId, null);

    // Another reviewer's id, or a team note's, is taken: nothing changes, nothing is said about it.
    const others = [w.a1, w.a2, w.b]
      .filter((r) => r.viewer.reviewerId !== own.reviewerId)
      .map((r) => r.commentId);
    for (const id of [...others, w.teamNoteId])
      assert.equal(
        await sandbox.saveComment(db(), own, {
          ...comment,
          id,
          body: "Overwritten",
        }),
        "taken",
      );

    // A crossed slug or access writes nothing.
    const other = own.slug === w.slugA ? w.b.viewer : w.a1.viewer;
    for (const crossed of [
      { ...own, slug: other.slug },
      { ...own, accessId: other.accessId },
    ])
      await assert.rejects(
        sandbox.saveComment(db(), crossed, newComment()),
        refusedWith(REVIEWER_NOT_FOUND),
      );

    // Malformed input is refused with a fixed message that echoes nothing.
    for (const bad of [
      { ...comment, id: "not-a-uuid" },
      { ...comment, design: "Not A Design" },
      { ...comment, kind: "praise" },
      { ...comment, anchor: { x: 0.5, y: 0.5 } },
      { ...comment, anchor: { marked: "a", id: "b", x: 0.5, y: 0.5 } },
      { ...comment, anchor: { marked: "a", x: 1.5, y: 0.5 } },
      { ...comment, anchor: { path: "x".repeat(3000), x: 0, y: 0 } },
      { ...comment, anchor: { marked: "a", x: 0, y: 0, email: w.a1.email } },
      { ...comment, number: 0 },
      { ...comment, viewportW: -1 },
      { ...comment, clientCreatedAt: "yesterday" },
    ])
      await assert.rejects(
        sandbox.saveComment(db(), own, bad as never),
        refusedWith(COMMENT_INPUT_INVALID),
      );
    for (const body of ["", "   ", "x".repeat(2001)])
      await assert.rejects(
        sandbox.saveComment(db(), own, { ...comment, body }),
        refusedWith(COMMENT_BODY_INVALID),
      );
  } finally {
    await db()
      .delete(sandboxComments)
      .where(eq(sandboxComments.id, comment.id));
  }
  assert.deepEqual(await commentsSnapshot(w), before);
};

/** A reviewer deletes their own comment; another's id or a team note's deletes nothing. */
const deleteCommentAs = (kind: ViewerKind) => async (w: World) => {
  const own = rowsFor(w, kind).viewer;
  const before = await commentsSnapshot(w);
  const comment = newComment();
  try {
    await sandbox.saveComment(db(), own, comment);
    const others = [w.a1, w.a2, w.b, w.signedIn]
      .filter((r) => r.viewer.reviewerId !== own.reviewerId)
      .map((r) => r.commentId);
    for (const id of [...others, w.teamNoteId])
      await sandbox.deleteComment(db(), own, { id });
    // A crossed slug deletes nothing either.
    await sandbox.deleteComment(
      db(),
      { ...own, slug: own.slug === w.slugA ? w.slugB : w.slugA },
      { id: comment.id },
    );
    const after = await commentsSnapshot(w);
    assert.deepEqual(
      after.filter((row) => row.id !== comment.id),
      before,
    );
    await sandbox.deleteComment(db(), own, { id: comment.id });
    assert.deepEqual(await commentsSnapshot(w), before);
    await assert.rejects(
      sandbox.deleteComment(db(), own, { id: "nope" }),
      refusedWith(COMMENT_INPUT_INVALID),
    );
  } finally {
    await db()
      .delete(sandboxComments)
      .where(eq(sandboxComments.id, comment.id));
  }
};

/** Every version on both slugs, to prove a call changed nothing else. */
async function versionsSnapshot(w: World) {
  return db()
    .select()
    .from(sandboxReviewVersions)
    .where(inArray(sandboxReviewVersions.slug, [w.slugA, w.slugB]))
    .orderBy(sandboxReviewVersions.id);
}

function newVersion(triage: object = {}) {
  return {
    id: randomUUID(),
    coreVersion: "v1",
    answers: { overall: "very", "next-step": "approve" },
    triage,
  };
}

/** LAB-17 C11: the team is refused by both review functions, and nothing is stored. */
const reviewRefused =
  (name: "saveReviewVersion" | "readMyLatestVersion") =>
  (kind: "developer" | "admin") =>
  async (w: World) => {
    const before = await versionsSnapshot(w);
    const viewer = viewerFor(w, kind);
    await assert.rejects(
      name === "saveReviewVersion"
        ? sandbox.saveReviewVersion(db(), viewer, newVersion())
        : sandbox.readMyLatestVersion(db(), viewer, {}),
      refusedWith(NOT_A_REVIEWER_VIEWER),
    );
    assert.deepEqual(await versionsSnapshot(w), before);
  };

/**
 * A reviewer saves a version triaging their own pin, retries it under the
 * same id, and is refused another's comment, another's version id, a
 * crossed slug and answers over 64 KB. The version is removed after, so the
 * world keeps one version each.
 */
const saveVersionAs = (kind: ViewerKind) => async (w: World) => {
  const rows = rowsFor(w, kind);
  const own = rows.viewer;
  const other = [w.a1, w.a2, w.b].find(
    (r) => r.viewer.reviewerId !== own.reviewerId,
  )!;
  const version = newVersion({
    comments: { [rows.commentId]: "must" },
    mattersMost: rows.commentId,
  });
  try {
    const saved = await sandbox.saveReviewVersion(db(), own, version);
    exactKeys(saved, ["number", "createdAt"]);
    // The world holds version 1 for each reviewer.
    assert.equal(saved.number, 2);
    assert.deepEqual(
      await sandbox.saveReviewVersion(db(), own, version),
      saved,
    );
    const before = await versionsSnapshot(w);
    for (const triage of [
      { comments: { [other.commentId]: "fine" } },
      { comments: { [w.teamNoteId]: "must" } },
      { comments: {}, mattersMost: other.commentId },
    ])
      await assert.rejects(
        sandbox.saveReviewVersion(db(), own, newVersion(triage)),
        refusedWith(REVIEW_TRIAGE_INVALID),
      );
    // Another reviewer cannot take this version's id, and learns nothing of it.
    await assert.rejects(
      sandbox.saveReviewVersion(db(), other.viewer, { ...version, triage: {} }),
      refusedWith(REVIEW_VERSION_TAKEN),
    );
    await assert.rejects(
      sandbox.saveReviewVersion(
        db(),
        { ...own, slug: own.slug === w.slugA ? w.slugB : w.slugA },
        newVersion(),
      ),
      refusedWith(REVIEWER_NOT_FOUND),
    );
    for (const bad of [
      { ...newVersion(), id: "not-a-uuid" },
      { ...newVersion(), coreVersion: "core one" },
      { ...newVersion(), triage: { comments: { [rows.commentId]: "maybe" } } },
      {
        ...newVersion(),
        answers: { gaps: "x".repeat(REVIEW_ANSWERS_BYTES_MAX) },
      },
      { ...newVersion(), slug: w.slugB },
    ])
      await assert.rejects(
        sandbox.saveReviewVersion(db(), own, bad as never),
        refusedWith(REVIEW_INPUT_INVALID),
      );
    assert.deepEqual(await versionsSnapshot(w), before);
  } finally {
    await db()
      .delete(sandboxReviewVersions)
      .where(eq(sandboxReviewVersions.id, version.id));
  }
};

/** A reviewer reads their own latest version: never another's, never across slugs. */
const readLatestAs = (kind: ViewerKind) => async (w: World) => {
  const rows = rowsFor(w, kind);
  const own = rows.viewer;
  const latest = await sandbox.readMyLatestVersion(db(), own, {});
  exactKeys(latest, ["number", "createdAt", "answers", "triage"]);
  const [stored] = await db()
    .select()
    .from(sandboxReviewVersions)
    .where(eq(sandboxReviewVersions.id, rows.versionId));
  assert.equal(latest!.number, 1);
  assert.deepEqual(latest!.answers, stored!.answers);
  const other = own.slug === w.slugA ? w.b.viewer : w.a1.viewer;
  for (const crossed of [
    { ...own, slug: other.slug },
    { ...own, reviewerId: other.reviewerId },
  ])
    assert.equal(await sandbox.readMyLatestVersion(db(), crossed, {}), null);
  await assert.rejects(
    sandbox.readMyLatestVersion(db(), own, { slug: w.slugB } as never),
    refusedWith(REVIEW_INPUT_INVALID),
  );
};

/**
 * LAB-21 C5: the latest send's instant is the viewer's own version's, and
 * nothing else crosses; a crossed slug or reviewer reads null; input is
 * refused; nothing is written.
 */
const latestSentAs = (kind: ViewerKind) => async (w: World) => {
  const rows = rowsFor(w, kind);
  const own = rows.viewer;
  const before = await versionsSnapshot(w);
  const sentAt = await sandbox.latestSentAt(db(), own, {});
  assert.ok(sentAt instanceof Date);
  const [stored] = await db()
    .select({ createdAt: sandboxReviewVersions.createdAt })
    .from(sandboxReviewVersions)
    .where(eq(sandboxReviewVersions.id, rows.versionId));
  assert.equal(sentAt.getTime(), stored!.createdAt.getTime());
  const other = own.slug === w.slugA ? w.b.viewer : w.a1.viewer;
  for (const crossed of [
    { ...own, slug: other.slug },
    { ...own, reviewerId: other.reviewerId },
  ])
    assert.equal(await sandbox.latestSentAt(db(), crossed, {}), null);
  await assert.rejects(
    sandbox.latestSentAt(db(), own, { slug: w.slugB } as never),
    refusedWith(REVIEW_INPUT_INVALID),
  );
  assert.deepEqual(await versionsSnapshot(w), before);
};

/** LAB-21 C5: the team is refused the latest send, and nothing is stored. */
const latestSentRefused = (kind: "developer" | "admin") => async (w: World) => {
  const before = await versionsSnapshot(w);
  await assert.rejects(
    sandbox.latestSentAt(db(), viewerFor(w, kind), {}),
    refusedWith(NOT_A_REVIEWER_VIEWER),
  );
  assert.deepEqual(await versionsSnapshot(w), before);
};

/** Registered cases for every runtime export of @pem/db/sandbox. */
const REGISTRY: Registry<World> = {
  ...codesCases({ db, viewerFor }),
  ...erasureCases({ db, viewerFor }),
  ...threadsCases({ db, viewerFor }),
  findLiveReviewerByCodeHash: {
    group: "gate",
    criteria: ["C3"],
    cases: {
      "C3: a live code finds its reviewer by hash on its own slug, and returns only the id and code version":
        async (w) => {
          const found = await sandbox.findLiveReviewerByCodeHash(db(), {
            slug: w.slugA,
            codeHash: codeHash(w.a1.code),
          });
          exactKeys(found, ["reviewerId", "codeVersion"]);
          assert.deepEqual(found, {
            reviewerId: w.a1.viewer.reviewerId,
            codeVersion: 1,
          });
        },
      "C3: the same code on a foreign slug returns null": async (w) => {
        assert.equal(
          await sandbox.findLiveReviewerByCodeHash(db(), {
            slug: w.slugB,
            codeHash: codeHash(w.a1.code),
          }),
          null,
        );
      },
      "C3: a revoked code returns null": async (w) => {
        await setRevoked(w.a2.viewer.reviewerId, true);
        try {
          assert.equal(
            await sandbox.findLiveReviewerByCodeHash(db(), {
              slug: w.slugA,
              codeHash: codeHash(w.a2.code),
            }),
            null,
          );
        } finally {
          await setRevoked(w.a2.viewer.reviewerId, false);
        }
      },
      "C3: an unknown or malformed hash returns null": async (w) => {
        for (const hash of [
          codeHash("no such code"),
          codeHash(w.a1.code).subarray(0, 31),
          "not bytes" as unknown as Uint8Array,
        ])
          assert.equal(
            await sandbox.findLiveReviewerByCodeHash(db(), {
              slug: w.slugA,
              codeHash: hash,
            }),
            null,
          );
      },
    },
  },

  createAccess: {
    group: "gate",
    criteria: ["C3"],
    cases: {
      "creates an access for a normalised email, returning only its id": async (
        w,
      ) => {
        const created = await sandbox.createAccess(db(), {
          reviewerId: w.b.viewer.reviewerId,
          codeVersion: 1,
          email: `second-device-${w.run}@example.test`,
        });
        exactKeys(created, ["accessId"]);
        const [row] = await db()
          .select()
          .from(sandboxAccesses)
          .where(eq(sandboxAccesses.id, created!.accessId));
        assert.equal(row!.reviewerId, w.b.viewer.reviewerId);
        assert.equal(row!.email, `second-device-${w.run}@example.test`);
        assert.equal(row!.userId, null);
        assert.equal(row!.codeVersion, 1);
      },
      "creates an access for a signed-in reviewer's user id": async (w) => {
        const created = await sandbox.createAccess(db(), {
          reviewerId: w.signedIn.viewer.reviewerId,
          codeVersion: 1,
          userId: w.signedInUser,
        });
        exactKeys(created, ["accessId"]);
      },
      "refuses an email that is not trimmed and lower-cased, without echoing it":
        async (w) => {
          for (const email of [
            " A1@Example.test",
            "A1@example.test",
            "a1@example.test\n",
          ])
            await assert.rejects(
              sandbox.createAccess(db(), {
                reviewerId: w.a1.viewer.reviewerId,
                codeVersion: 1,
                email,
              }),
              refusedWith(EMAIL_NOT_NORMALISED),
            );
        },
      "refuses both, neither, an empty email or a malformed id, with one fixed message":
        async (w) => {
          const id = w.a1.viewer.reviewerId;
          for (const input of [
            {
              reviewerId: id,
              codeVersion: 1,
              email: "x@example.test",
              userId: w.signedInUser,
            },
            { reviewerId: id, codeVersion: 1 },
            { reviewerId: id, codeVersion: 1, email: "" },
            {
              reviewerId: "'; drop table x; --",
              codeVersion: 1,
              email: "x@example.test",
            },
            { reviewerId: id, codeVersion: 1, userId: "not-a-uuid" },
          ])
            await assert.rejects(
              sandbox.createAccess(db(), input as sandbox.CreateAccessInput),
              refusedWith(ACCESS_INPUT_INVALID),
            );
        },
      "C3: grants nothing for a stale code version or a revoked code": async (
        w,
      ) => {
        assert.equal(
          await sandbox.createAccess(db(), {
            reviewerId: w.a1.viewer.reviewerId,
            codeVersion: 2,
            email: "stale@example.test",
          }),
          null,
        );
        await setRevoked(w.a2.viewer.reviewerId, true);
        try {
          assert.equal(
            await sandbox.createAccess(db(), {
              reviewerId: w.a2.viewer.reviewerId,
              codeVersion: 1,
              email: "revoked@example.test",
            }),
            null,
          );
        } finally {
          await setRevoked(w.a2.viewer.reviewerId, false);
        }
      },
    },
  },

  checkAccess: {
    group: "gate",
    criteria: ["C3"],
    cases: {
      "a live access on its own slug returns only the reviewer and access ids":
        async (w) => {
          const checked = await sandbox.checkAccess(db(), {
            accessId: w.a1.viewer.accessId,
            slug: w.slugA,
            userId: null,
          });
          exactKeys(checked, ["reviewerId", "accessId"]);
          assert.deepEqual(checked, {
            reviewerId: w.a1.viewer.reviewerId,
            accessId: w.a1.viewer.accessId,
          });
        },
      "C3: a foreign slug returns null": async (w) => {
        assert.equal(
          await sandbox.checkAccess(db(), {
            accessId: w.a1.viewer.accessId,
            slug: w.slugB,
            userId: null,
          }),
          null,
        );
      },
      "C3: a revoked code returns null": async (w) => {
        await setRevoked(w.a2.viewer.reviewerId, true);
        try {
          assert.equal(
            await sandbox.checkAccess(db(), {
              accessId: w.a2.viewer.accessId,
              slug: w.slugA,
              userId: null,
            }),
            null,
          );
        } finally {
          await setRevoked(w.a2.viewer.reviewerId, false);
        }
      },
      "C3: a stale code_version returns null": async (w) => {
        await bumpCodeVersion(w.b.viewer.reviewerId, 1);
        try {
          assert.equal(
            await sandbox.checkAccess(db(), {
              accessId: w.b.viewer.accessId,
              slug: w.slugB,
              userId: null,
            }),
            null,
          );
        } finally {
          await bumpCodeVersion(w.b.viewer.reviewerId, -1);
        }
      },
      "C3: a signed-in reviewer's access read by another user id, or signed out, returns null":
        async (w) => {
          const input = { accessId: w.signedIn.viewer.accessId, slug: w.slugA };
          for (const userId of [w.otherUser, null, "not-a-uuid"])
            assert.equal(
              await sandbox.checkAccess(db(), { ...input, userId }),
              null,
            );
          assert.deepEqual(
            await sandbox.checkAccess(db(), {
              ...input,
              userId: w.signedInUser,
            }),
            {
              reviewerId: w.signedIn.viewer.reviewerId,
              accessId: w.signedIn.viewer.accessId,
            },
          );
        },
      "an unknown or malformed access id returns null": async (w) => {
        for (const accessId of [
          "00000000-0000-4000-8000-000000000000",
          "'; select 1; --",
          "",
        ])
          assert.equal(
            await sandbox.checkAccess(db(), {
              accessId,
              slug: w.slugA,
              userId: null,
            }),
            null,
          );
      },
    },
  },

  findAccessEmail: {
    group: "gate",
    criteria: ["C3"],
    cases: {
      "returns only the email the access was made with": async (w) => {
        assert.equal(
          await sandbox.findAccessEmail(db(), {
            accessId: w.a1.viewer.accessId,
            slug: w.slugA,
          }),
          w.a1.email,
        );
      },
      "a foreign slug, a signed-in access, a revoked code or a malformed id returns null":
        async (w) => {
          assert.equal(
            await sandbox.findAccessEmail(db(), {
              accessId: w.a1.viewer.accessId,
              slug: w.slugB,
            }),
            null,
          );
          assert.equal(
            await sandbox.findAccessEmail(db(), {
              accessId: w.signedIn.viewer.accessId,
              slug: w.slugA,
            }),
            null,
          );
          assert.equal(
            await sandbox.findAccessEmail(db(), {
              accessId: "x",
              slug: w.slugA,
            }),
            null,
          );
          await setRevoked(w.a2.viewer.reviewerId, true);
          try {
            assert.equal(
              await sandbox.findAccessEmail(db(), {
                accessId: w.a2.viewer.accessId,
                slug: w.slugA,
              }),
              null,
            );
          } finally {
            await setRevoked(w.a2.viewer.reviewerId, false);
          }
        },
      "an erased access returns null": async (w) => {
        const created = await sandbox.createAccess(db(), {
          reviewerId: w.a1.viewer.reviewerId,
          codeVersion: 1,
          email: `erased-${w.run}@example.test`,
        });
        await db()
          .delete(sandboxAccesses)
          .where(eq(sandboxAccesses.id, created!.accessId));
        assert.equal(
          await sandbox.findAccessEmail(db(), {
            accessId: created!.accessId,
            slug: w.slugA,
          }),
          null,
        );
      },
    },
  },

  readGateLock: {
    group: "gate",
    criteria: ["C6 (LAB-6)"],
    cases: {
      "returns only the latest running lock, as an instant": async () => {
        const key = throttleKey();
        await sandbox.recordGateFailure(db(), {
          keyHash: key,
          limit: 1,
          windowMs: 60_000,
          lockMs: 60_000,
          now: THROTTLE_T0,
        });
        const result = await sandbox.readGateLock(db(), {
          keyHashes: [key],
          now: THROTTLE_T0,
        });
        exactKeys(result, ["lockedUntil"]);
        assert.ok(result.lockedUntil instanceof Date);
        assert.deepEqual(
          await sandbox.readGateLock(db(), {
            keyHashes: [throttleKey()],
            now: THROTTLE_T0,
          }),
          { lockedUntil: null },
        );
      },
      "malformed input is refused with a fixed message and no query":
        async () => {
          for (const input of [
            { keyHashes: [Buffer.alloc(31)], now: THROTTLE_T0 },
            { keyHashes: "x", now: THROTTLE_T0 },
            { keyHashes: [throttleKey()], now: new Date("nope") },
          ])
            await assert.rejects(
              sandbox.readGateLock(db(), input as never),
              refusedWith(THROTTLE_INPUT_INVALID),
            );
        },
    },
  },

  recordGateFailure: {
    group: "gate",
    criteria: ["C6 (LAB-6)"],
    cases: {
      "returns only the count and the lock, and writes no slug or reviewer":
        async (w) => {
          const key = throttleKey();
          const result = await sandbox.recordGateFailure(db(), {
            keyHash: key,
            limit: 5,
            windowMs: 60_000,
            lockMs: 60_000,
            now: THROTTLE_T0,
          });
          exactKeys(result, ["failures", "lockedUntil"]);
          assert.deepEqual(result, { failures: 1, lockedUntil: null });
          const [row] = await db()
            .select()
            .from(sandboxGateAttempts)
            .where(eq(sandboxGateAttempts.keyHash, key));
          const text = JSON.stringify(row);
          for (const value of [w.slugA, w.slugB, w.a1.viewer.reviewerId])
            assert.ok(!text.includes(value));
        },
      "malformed input is refused with a fixed message and no write":
        async () => {
          const key = throttleKey();
          for (const input of [
            { keyHash: Buffer.alloc(31), limit: 5, windowMs: 1, lockMs: 1 },
            { keyHash: key, limit: 0, windowMs: 1, lockMs: 1 },
            { keyHash: key, limit: 5, windowMs: 1.5, lockMs: 1 },
            { keyHash: key, limit: 5, windowMs: 1, lockMs: -1 },
            { keyHash: "x", limit: 5, windowMs: 1, lockMs: 1 },
          ])
            await assert.rejects(
              sandbox.recordGateFailure(db(), {
                ...input,
                now: THROTTLE_T0,
              } as never),
              refusedWith(THROTTLE_INPUT_INVALID),
            );
          assert.deepEqual(
            await db()
              .select()
              .from(sandboxGateAttempts)
              .where(eq(sandboxGateAttempts.keyHash, key)),
            [],
          );
        },
    },
  },

  clearGateKey: {
    group: "gate",
    criteria: ["C6 (LAB-6)"],
    cases: {
      "returns only the count cleared, and clears that key alone": async () => {
        const key = throttleKey();
        const kept = throttleKey();
        for (const keyHash of [key, kept])
          await sandbox.recordGateFailure(db(), {
            keyHash,
            limit: 5,
            windowMs: 60_000,
            lockMs: 60_000,
            now: THROTTLE_T0,
          });
        const result = await sandbox.clearGateKey(db(), {
          keyHash: key,
          now: THROTTLE_T0,
        });
        exactKeys(result, ["cleared"]);
        assert.deepEqual(result, { cleared: 1 });
        assert.equal(
          (
            await db()
              .select()
              .from(sandboxGateAttempts)
              .where(eq(sandboxGateAttempts.keyHash, kept))
          ).length,
          1,
        );
      },
      "malformed input is refused with a fixed message": async () => {
        for (const input of [
          { keyHash: Buffer.alloc(33), now: THROTTLE_T0 },
          { keyHash: throttleKey(), now: "now" },
        ])
          await assert.rejects(
            sandbox.clearGateKey(db(), input as never),
            refusedWith(THROTTLE_INPUT_INVALID),
          );
      },
    },
  },

  withRoleChangeLock: {
    group: "viewer",
    criteria: ["LAB-9 C4"],
    byViewer: {
      "reviewer on slug A": lockRefused(
        "reviewer on slug A",
        NOT_A_TEAM_VIEWER,
      ),
      "second reviewer on slug A": lockRefused(
        "second reviewer on slug A",
        NOT_A_TEAM_VIEWER,
      ),
      "reviewer on slug B": lockRefused(
        "reviewer on slug B",
        NOT_A_TEAM_VIEWER,
      ),
      developer: lockRefused("developer", NOT_AN_ADMIN_VIEWER),
      admin: lockAsAdmin,
    },
  },

  listExperimentStats: {
    group: "viewer",
    criteria: ["LAB-10 C5"],
    byViewer: {
      "reviewer on slug A": statsRefused("reviewer on slug A"),
      "second reviewer on slug A": statsRefused("second reviewer on slug A"),
      "reviewer on slug B": statsRefused("reviewer on slug B"),
      developer: statsAsTeam("developer"),
      admin: statsAsTeam("admin"),
    },
  },

  saveReviewVersion: {
    group: "viewer",
    criteria: ["LAB-17 C11"],
    byViewer: {
      "reviewer on slug A": saveVersionAs("reviewer on slug A"),
      "second reviewer on slug A": saveVersionAs("second reviewer on slug A"),
      "reviewer on slug B": saveVersionAs("reviewer on slug B"),
      developer: reviewRefused("saveReviewVersion")("developer"),
      admin: reviewRefused("saveReviewVersion")("admin"),
    },
  },

  readMyLatestVersion: {
    group: "viewer",
    criteria: ["LAB-17 C11"],
    byViewer: {
      "reviewer on slug A": readLatestAs("reviewer on slug A"),
      "second reviewer on slug A": readLatestAs("second reviewer on slug A"),
      "reviewer on slug B": readLatestAs("reviewer on slug B"),
      developer: reviewRefused("readMyLatestVersion")("developer"),
      admin: reviewRefused("readMyLatestVersion")("admin"),
    },
  },

  latestSentAt: {
    group: "viewer",
    criteria: ["LAB-21 C5"],
    byViewer: {
      "reviewer on slug A": latestSentAs("reviewer on slug A"),
      "second reviewer on slug A": latestSentAs("second reviewer on slug A"),
      "reviewer on slug B": latestSentAs("reviewer on slug B"),
      developer: latestSentRefused("developer"),
      admin: latestSentRefused("admin"),
    },
  },

  listMyComments: {
    group: "viewer",
    criteria: ["LAB-12 C7"],
    byViewer: {
      "reviewer on slug A": listCommentsAs("reviewer on slug A"),
      "second reviewer on slug A": listCommentsAs("second reviewer on slug A"),
      "reviewer on slug B": listCommentsAs("reviewer on slug B"),
      developer: commentsRefused("listMyComments")("developer"),
      admin: commentsRefused("listMyComments")("admin"),
    },
  },

  saveComment: {
    group: "viewer",
    criteria: ["LAB-12 C7"],
    byViewer: {
      "reviewer on slug A": saveCommentAs("reviewer on slug A"),
      "second reviewer on slug A": saveCommentAs("second reviewer on slug A"),
      "reviewer on slug B": saveCommentAs("reviewer on slug B"),
      developer: commentsRefused("saveComment")("developer"),
      admin: commentsRefused("saveComment")("admin"),
    },
  },

  deleteComment: {
    group: "viewer",
    criteria: ["LAB-12 C7"],
    byViewer: {
      "reviewer on slug A": deleteCommentAs("reviewer on slug A"),
      "second reviewer on slug A": deleteCommentAs("second reviewer on slug A"),
      "reviewer on slug B": deleteCommentAs("reviewer on slug B"),
      developer: commentsRefused("deleteComment")("developer"),
      admin: commentsRefused("deleteComment")("admin"),
    },
  },

  readReviewerDesigns: {
    group: "viewer",
    criteria: ["LAB-11 C6"],
    byViewer: {
      "reviewer on slug A": readDesignsAs("reviewer on slug A"),
      "second reviewer on slug A": readDesignsAs("second reviewer on slug A"),
      "reviewer on slug B": readDesignsAs("reviewer on slug B"),
      developer: experimentRefused("readReviewerDesigns")("developer"),
      admin: experimentRefused("readReviewerDesigns")("admin"),
    },
  },

  claimFirstDesign: {
    group: "viewer",
    criteria: ["LAB-11 C6"],
    byViewer: {
      "reviewer on slug A": claimAs("reviewer on slug A"),
      "second reviewer on slug A": claimAs("second reviewer on slug A"),
      "reviewer on slug B": claimAs("reviewer on slug B"),
      developer: experimentRefused("claimFirstDesign")("developer"),
      admin: experimentRefused("claimFirstDesign")("admin"),
    },
  },

  recordViewEvent: {
    group: "viewer",
    criteria: ["LAB-11 C6"],
    byViewer: {
      "reviewer on slug A": recordViewAs("reviewer on slug A"),
      "second reviewer on slug A": recordViewAs("second reviewer on slug A"),
      "reviewer on slug B": recordViewAs("reviewer on slug B"),
      developer: experimentRefused("recordViewEvent")("developer"),
      admin: experimentRefused("recordViewEvent")("admin"),
    },
  },

  recordAction: {
    group: "viewer",
    criteria: ["C4"],
    byViewer: {
      "reviewer on slug A": recordAsReviewer("reviewer on slug A"),
      "second reviewer on slug A": recordAsReviewer(
        "second reviewer on slug A",
      ),
      "reviewer on slug B": recordAsReviewer("reviewer on slug B"),
      developer: recordAsTeam("developer"),
      admin: recordAsTeam("admin"),
    },
  },

  ROLE_CHANGE_ACTION: {
    group: "support",
    criteria: ["LAB-9"],
    cases: {
      "is the one action that may name a team member, and the package exports the name recordAction checks":
        async (w) => {
          assert.equal(sandbox.ROLE_CHANGE_ACTION, ROLE_CHANGE_ACTION);
          await assert.rejects(
            sandbox.recordAction(db(), w.admin, {
              action: "role-changed",
              targetEmail: `x-${w.run}@example.test`,
            }),
            refusedWith(ACTION_INPUT_INVALID),
          );
        },
    },
  },

  SandboxAccessError: {
    group: "support",
    criteria: ["C4"],
    cases: {
      "every refusal is a SandboxAccessError whose fixed message carries no input: recordAction refuses free text, a bad slug and an unnamed count":
        async (w) => {
          for (const input of [
            { action: w.a1.email! },
            { action: "Erase email" },
            { action: "erase", slug: "Not A Slug" },
            { action: "erase", counts: { [w.a1.email!]: 1 } },
            { action: "erase", counts: { comments: -1 } },
            { action: "erase", counts: { comments: 1.5 } },
            // targetEmail: a role change only, and only a normalised address.
            { action: "erase-email", targetEmail: w.a1.email! },
            { action: ROLE_CHANGE_ACTION, targetEmail: "Team@Example.test" },
            { action: ROLE_CHANGE_ACTION, targetEmail: " team@example.test" },
            { action: ROLE_CHANGE_ACTION, targetEmail: "not an email" },
            { action: ROLE_CHANGE_ACTION, targetEmail: "" },
          ])
            await assert.rejects(
              sandbox.recordAction(db(), w.admin, input as never),
              refusedWith(ACTION_INPUT_INVALID),
            );
        },
    },
  },
};

/** The throttle's cases use their own random keys and a fixed clock, and remove their rows after. */
const THROTTLE_T0 = new Date("2026-10-06T09:00:00Z");
const throttleKeys: Buffer[] = [];
function throttleKey(): Buffer {
  const key = randomBytes(32);
  throttleKeys.push(key);
  return key;
}

async function setRevoked(reviewerId: string, revoked: boolean) {
  await db()
    .update(sandboxReviewers)
    .set({ revokedAt: revoked ? new Date() : null })
    .where(eq(sandboxReviewers.id, reviewerId));
}

async function bumpCodeVersion(reviewerId: string, by: number) {
  await db()
    .update(sandboxReviewers)
    .set({ codeVersion: sql`${sandboxReviewers.codeVersion} + ${by}` })
    .where(eq(sandboxReviewers.id, reviewerId));
}

describe("C2: the coverage guard", () => {
  test("C2: every runtime export of @pem/db/sandbox has its cases, and nothing extra is registered", () => {
    assert.deepEqual(
      coverageProblems(sandbox as Record<string, unknown>, REGISTRY),
      [],
    );
  });

  test("C2: an export with no registered case fails it (a synthetic module)", () => {
    // Stand-ins with the arity of a gate function and of a viewer function.
    const withArity = (length: number) =>
      Object.defineProperty(async () => null, "length", { value: length });
    const gate = withArity(2);
    const scoped = withArity(3);
    // A scoped read with a default parameter reports arity 2: it must still
    // not pass as a gate or as support.
    const defaulted = withArity(2);
    const synthetic = {
      covered: gate,
      uncovered: gate,
      halfCovered: scoped,
      misfiled: scoped,
      fakeGate: defaulted,
      fakeSupport: defaulted,
    };
    const registry: Registry<null> = {
      covered: { group: "gate", cases: { "a case": () => {} } },
      halfCovered: {
        group: "viewer",
        byViewer: { developer: () => {} } as never,
      },
      misfiled: { group: "support", cases: { "one happy path": () => {} } },
      fakeGate: { group: "gate", cases: { "one happy path": () => {} } },
      fakeSupport: { group: "support", cases: { "one happy path": () => {} } },
      gone: { group: "support", cases: { "a case": () => {} } },
    };
    assert.deepEqual(coverageProblems(synthetic, registry, ["covered"]), [
      "uncovered has no isolation case",
      ...VIEWER_KINDS.filter((kind) => kind !== "developer").map(
        (kind) => `halfCovered has no case for the ${kind}`,
      ),
      "misfiled is a function filed as support",
      "fakeGate is filed as gate but is not in the gate group",
      "fakeSupport is a function filed as support",
      "gone is registered but not exported",
    ]);
  });
});

describe("C1: every export, as every viewer kind", () => {
  for (const [name, entry] of Object.entries(REGISTRY)) {
    const ids = ["C1", ...(entry.criteria ?? [])].join(", ");
    if (entry.group === "viewer") {
      for (const kind of VIEWER_KINDS)
        test(`${ids}: ${name} as the ${kind}`, () =>
          entry.byViewer[kind](world));
    } else {
      for (const [label, run] of Object.entries(entry.cases))
        test(`${ids}: ${name}: ${label.replace(/^C\d+: /, "")}`, () =>
          run(world));
    }
  }
});

describe("C1: the reviewer scope", () => {
  test("C1: each reviewer reads only their own rows on their slug, and the team is refused", async () => {
    const tables = [
      [sandboxViewEvents, "viewId"],
      [sandboxComments, "commentId"],
      [sandboxReviewVersions, "versionId"],
    ] as const;
    for (const rows of [world.a1, world.a2, world.b, world.signedIn]) {
      for (const [table, key] of tables) {
        const seen = await db()
          .select({ id: table.id })
          .from(table)
          .where(reviewerScope(rows.viewer, table));
        assert.deepEqual(
          seen.map((row) => row.id),
          [rows[key]],
          `${rows.viewer.reviewerId} in ${key}`,
        );
      }
    }
    // A reviewer viewer whose slug was swapped sees nothing: both must match.
    const crossed = { ...world.a1.viewer, slug: world.slugB };
    assert.deepEqual(
      await db()
        .select({ id: sandboxComments.id })
        .from(sandboxComments)
        .where(and(reviewerScope(crossed, sandboxComments))),
      [],
    );
    for (const team of [world.developer, world.admin])
      assert.throws(() => reviewerScope(team, sandboxComments), {
        message: "This needs a reviewer.",
      });
  });
});
