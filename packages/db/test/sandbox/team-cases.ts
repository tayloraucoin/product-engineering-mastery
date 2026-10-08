/**
 * The isolation cases for team.ts (LAB-14), spread into the suite's
 * REGISTRY, and C4's sweep: `TEAM_NOTE_PROBES` names every viewer function
 * of `@pem/db/sandbox`, so a function added later without a line here fails
 * the sweep's coverage test.
 *
 * - A reviewer is refused by every team function and nothing changes.
 * - The team reads the slug's codes and roots, reviewers by label and notes
 *   by email, never a reply and never another slug; it saves and deletes only
 *   its own notes.
 * - The sweep plants team notes on both slugs, then reads every read again:
 *   a reviewer's reads return exactly what they returned before and hold no
 *   note, and the team's counts and reads count none (except the reads whose
 *   subject is the team's notes, which say so).
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";

import * as sandbox from "@pem/db/sandbox";

import type { Db } from "../../src/client.ts";
import { COMMENT_INPUT_INVALID } from "../../src/sandbox/comments.ts";
import {
  NOT_A_TEAM_VIEWER,
  type TeamViewer,
  type Viewer,
} from "../../src/sandbox/viewer.ts";
import { sandboxComments } from "../../src/schema/index.ts";
import type { World } from "./fixtures.ts";
import type { Registry, ViewerKind } from "./registry.ts";

type Deps = { db: () => Db; viewerFor: (w: World, kind: ViewerKind) => Viewer };
type TeamKind = "developer" | "admin";

function refusedWith(message: string) {
  return (error: unknown) => {
    assert.ok(error instanceof sandbox.SandboxAccessError, String(error));
    assert.equal((error as Error).message, message);
    return true;
  };
}

function newNote(slug: string) {
  return {
    id: randomUUID(),
    slug,
    number: 1,
    design: "circle",
    body: "Team probe note",
    anchor: { marked: "plans", x: 0.2, y: 0.8, place: "Plans" },
    viewportW: 1440,
    viewportH: 900,
    clientCreatedAt: new Date("2026-10-07T10:00:00Z"),
  };
}

export function teamCases({ db, viewerFor }: Deps): Registry<World> {
  async function snapshot(w: World) {
    return db()
      .select()
      .from(sandboxComments)
      .where(inArray(sandboxComments.slug, [w.slugA, w.slugB]))
      .orderBy(sandboxComments.id);
  }

  /** LAB-14 C4: a reviewer is refused by a team function, and nothing changes. */
  const refused =
    (call: (w: World, viewer: Viewer) => Promise<unknown>) =>
    (kind: ViewerKind) =>
    async (w: World) => {
      const before = await snapshot(w);
      await assert.rejects(
        call(w, viewerFor(w, kind)),
        refusedWith(NOT_A_TEAM_VIEWER),
      );
      assert.deepEqual(await snapshot(w), before);
    };

  const reviewersRefused = (
    call: (w: World, viewer: Viewer) => Promise<unknown>,
  ) => ({
    "reviewer on slug A": refused(call)("reviewer on slug A"),
    "second reviewer on slug A": refused(call)("second reviewer on slug A"),
    "reviewer on slug B": refused(call)("reviewer on slug B"),
  });

  /** The team reads slug A's codes and roots, labelled; never slug B's. */
  const listAs = (kind: TeamKind) => async (w: World) => {
    const team = viewerFor(w, kind) as TeamViewer;
    const read = await sandbox.listTeamComments(db(), team, {
      slug: w.slugA,
    });
    assert.deepEqual(
      read.reviewers.map((r) => r.label).sort(),
      [w.a1.label, w.a2.label, w.signedIn.label].sort(),
    );
    const ids = read.comments.map((c) => c.id).sort();
    assert.deepEqual(
      ids,
      [
        w.a1.commentId,
        w.a2.commentId,
        w.signedIn.commentId,
        w.teamNoteId,
      ].sort(),
    );
    const note = read.comments.find((c) => c.id === w.teamNoteId)!;
    // The world's note is the developer's account, so both read it as theirs.
    assert.deepEqual(note.author, {
      kind: "team",
      email: w.developer.email,
      self: true,
    });
    const text = JSON.stringify(read);
    assert.ok(!text.includes(w.b.commentBody), "slug B crossed");
    assert.ok(!text.includes(w.b.label), "slug B's code crossed");
    for (const r of [w.a1, w.a2, w.b])
      if (r.email) assert.ok(!text.includes(r.email), "an email crossed");
    // Only the slug: anything else in the input is refused.
    for (const bad of [
      {},
      { slug: "Not A Slug" },
      { slug: w.slugA, mode: "x" },
    ])
      await assert.rejects(
        sandbox.listTeamComments(db(), team, bad as never),
        refusedWith(COMMENT_INPUT_INVALID),
      );
  };

  /** The team saves, retries and edits its own note; a reviewer's id is taken. */
  const saveAs = (kind: TeamKind) => async (w: World) => {
    const team = viewerFor(w, kind) as TeamViewer;
    const before = await snapshot(w);
    const note = newNote(w.slugA);
    try {
      const saved = await sandbox.saveTeamNote(db(), team, note);
      assert.ok(saved !== "taken");
      assert.deepEqual(await sandbox.saveTeamNote(db(), team, note), saved);
      const [stored] = await db()
        .select()
        .from(sandboxComments)
        .where(eq(sandboxComments.id, note.id));
      assert.equal(stored!.teamUserId, team.userId);
      assert.equal(stored!.reviewerId, null);
      assert.equal(stored!.accessId, null);
      assert.equal(stored!.kind, null);
      for (const id of [w.a1.commentId, w.b.commentId])
        assert.equal(
          await sandbox.saveTeamNote(db(), team, {
            ...note,
            id,
            body: "Overwritten",
          }),
          "taken",
        );
      for (const bad of [
        { ...note, id: "not-a-uuid" },
        { ...note, slug: "Not A Slug" },
        { ...note, kind: null },
        { ...note, anchor: { x: 0.5, y: 0.5 } },
      ])
        await assert.rejects(
          sandbox.saveTeamNote(db(), team, bad as never),
          refusedWith(COMMENT_INPUT_INVALID),
        );
    } finally {
      await db().delete(sandboxComments).where(eq(sandboxComments.id, note.id));
    }
    assert.deepEqual(await snapshot(w), before);
  };

  /** The team deletes its own note; a reviewer's comment is taken and kept. */
  const deleteAs = (kind: TeamKind) => async (w: World) => {
    const team = viewerFor(w, kind) as TeamViewer;
    const before = await snapshot(w);
    const note = newNote(w.slugB);
    try {
      await sandbox.saveTeamNote(db(), team, note);
      for (const id of [w.a1.commentId, w.b.commentId])
        assert.equal(await sandbox.deleteTeamNote(db(), team, { id }), "taken");
      assert.equal(
        await sandbox.deleteTeamNote(db(), team, { id: note.id }),
        "deleted",
      );
      assert.deepEqual(await snapshot(w), before);
      await assert.rejects(
        sandbox.deleteTeamNote(db(), team, { id: "nope" }),
        refusedWith(COMMENT_INPUT_INVALID),
      );
    } finally {
      await db().delete(sandboxComments).where(eq(sandboxComments.id, note.id));
    }
  };

  return {
    listTeamComments: {
      group: "viewer",
      criteria: ["LAB-14 C4"],
      byViewer: {
        ...reviewersRefused((w, v) =>
          sandbox.listTeamComments(db(), v, { slug: w.slugA }),
        ),
        developer: listAs("developer"),
        admin: listAs("admin"),
      },
    },
    saveTeamNote: {
      group: "viewer",
      criteria: ["LAB-14 C3", "LAB-14 C4", "LAB-14 C6"],
      byViewer: {
        ...reviewersRefused((w, v) =>
          sandbox.saveTeamNote(db(), v, newNote(w.slugA)),
        ),
        developer: saveAs("developer"),
        admin: saveAs("admin"),
      },
    },
    deleteTeamNote: {
      group: "viewer",
      criteria: ["LAB-14 C4", "LAB-14 C6"],
      byViewer: {
        ...reviewersRefused((w, v) =>
          sandbox.deleteTeamNote(db(), v, { id: w.teamNoteId }),
        ),
        developer: deleteAs("developer"),
        admin: deleteAs("admin"),
      },
    },
  };
}

/**
 * C4's sweep. A read is run as `as`, before and after team notes are
 * planted; `project` keeps what must not change (the default, all of it).
 * A write names why the sweep does not run it: each write's own cases prove
 * a team note's id is refused or taken.
 */
export type TeamNoteProbe =
  | {
      read: (w: World) => { as: Viewer; call: () => Promise<unknown> };
      project?: (result: unknown) => unknown;
    }
  | { write: string };

export function teamNoteProbes(db: () => Db): Record<string, TeamNoteProbe> {
  const reviewerRead = (
    call: (d: Db, w: World) => Promise<unknown>,
  ): TeamNoteProbe => ({
    read: (w) => ({ as: w.a1.viewer, call: () => call(db(), w) }),
  });
  const write = (why: string): TeamNoteProbe => ({ write: why });
  return {
    // Reviewer reads: exactly as before, and no note.
    listMyComments: reviewerRead((d, w) =>
      sandbox.listMyComments(d, w.a1.viewer, {}),
    ),
    listThread: reviewerRead(async (d, w) => [
      await sandbox.listThread(d, w.a1.viewer, { mode: "private" }),
      await sandbox.listThread(d, w.a1.viewer, { mode: "collaborate" }),
    ]),
    listReplies: reviewerRead((d, w) =>
      sandbox.listReplies(d, w.a1.viewer, {
        rootId: w.teamNoteId,
        mode: "collaborate",
      }),
    ),
    readMyLatestVersion: reviewerRead((d, w) =>
      sandbox.readMyLatestVersion(d, w.a1.viewer, {}),
    ),
    latestSentAt: reviewerRead((d, w) =>
      sandbox.latestSentAt(d, w.a1.viewer, {}),
    ),
    listMyViewedDesigns: reviewerRead((d, w) =>
      sandbox.listMyViewedDesigns(d, w.a1.viewer, {}),
    ),
    readReviewerDesigns: reviewerRead((d, w) =>
      sandbox.readReviewerDesigns(d, w.a1.viewer, {}),
    ),
    // The team's counts and reads of reviewer data: no note counted.
    listExperimentStats: {
      read: (w) => ({
        as: w.admin,
        call: () =>
          sandbox.listExperimentStats(db(), w.admin, {
            slugs: [w.slugA, w.slugB],
          }),
      }),
    },
    listCodes: {
      read: (w) => ({
        as: w.admin,
        call: () => sandbox.listCodes(db(), w.admin, { slug: w.slugA }),
      }),
    },
    countExperimentData: {
      read: (w) => ({
        as: w.admin,
        call: () =>
          sandbox.countExperimentData(db(), w.admin, { slug: w.slugA }),
      }),
      // Team notes are counted on their own line, never as comments.
      project: (result) => {
        const rest = { ...(result as Record<string, unknown>) };
        delete rest.teamNotes;
        return rest;
      },
    },
    findErasure: {
      read: (w) => ({
        as: w.admin,
        call: () =>
          sandbox.findErasure(db(), w.admin, {
            email: w.a1.email!,
            userIds: [],
          }),
      }),
    },
    findReviewerEmails: {
      read: (w) => ({
        as: w.admin,
        call: () =>
          sandbox.findReviewerEmails(db(), w.admin, {
            reviewerId: w.a1.viewer.reviewerId,
          }),
      }),
    },
    listActions: {
      read: (w) => ({
        as: w.admin,
        call: () => sandbox.listActions(db(), w.admin, { page: 1 }),
      }),
    },
    // The team's own notes are this read's subject; reviewer rows unchanged.
    listTeamComments: {
      read: (w) => ({
        as: w.admin,
        call: () => sandbox.listTeamComments(db(), w.admin, { slug: w.slugA }),
      }),
      project: (result) =>
        (result as sandbox.TeamComments).comments.filter(
          (c) => c.author.kind === "reviewer",
        ),
    },
    saveComment: write("its cases: a team note's id is taken"),
    deleteComment: write("its cases: a team note's id deletes nothing"),
    saveReply: write("its cases: a reply under a team note is not-saved"),
    deleteReply: write("its cases: only the author's own reply"),
    saveReviewVersion: write("its cases: triage names the reviewer's roots"),
    claimFirstDesign: write("reads and writes the reviewer row only"),
    recordViewEvent: write("writes a view only"),
    recordAction: write("writes the action log only"),
    withRoleChangeLock: write("locks the role change only"),
    makeCode: write("writes a code only"),
    replaceCode: write("writes a code only"),
    revokeCode: write("writes a code only"),
    deleteExperimentData: write("its cases count notes on their own line"),
    eraseEmail: write("its cases: a team note is never erased by email"),
    saveTeamNote: write("its cases: team-cases.ts"),
    deleteTeamNote: write("its cases: team-cases.ts"),
  };
}
