/**
 * The isolation cases for threads.ts (LAB-25), spread into the suite's
 * REGISTRY. Every case runs in both modes. A reviewer reads only their own
 * rows in private mode and the slug's reviewer rows and team replies in
 * collaborate mode, never a team note, never another slug, and no email,
 * label or id beyond the rows' own; the team reads labels and emails. Each
 * case writes its replies, and a team reply under the team note inserted
 * past the module (which a save refuses), then removes them, so the world
 * stays as other cases expect.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";

import * as sandbox from "@pem/db/sandbox";

import type { Db } from "../../src/client.ts";
import { REVIEWER_NOT_FOUND } from "../../src/sandbox/experiment.ts";
import {
  REPLY_BODY_INVALID,
  THREAD_INPUT_INVALID,
} from "../../src/sandbox/threads.ts";
import {
  type ReviewerViewer,
  type TeamViewer,
  type Viewer,
} from "../../src/sandbox/viewer.ts";
import { sandboxComments } from "../../src/schema/index.ts";
import type { ReviewerRows, World } from "./fixtures.ts";
import type { Registry, ViewerKind } from "./registry.ts";

type Deps = { db: () => Db; viewerFor: (w: World, kind: ViewerKind) => Viewer };
type ReviewerKind = Exclude<ViewerKind, "developer" | "admin">;
type TeamKind = "developer" | "admin";

const MODES = ["private", "collaborate"] as const;

function refusedWith(message: string) {
  return (error: unknown) => {
    assert.ok(error instanceof sandbox.SandboxAccessError, String(error));
    assert.equal((error as Error).message, message);
    return true;
  };
}

export function threadsCases({ db, viewerFor }: Deps): Registry<World> {
  function rowsFor(w: World, kind: ReviewerKind): ReviewerRows {
    return kind === "reviewer on slug A"
      ? w.a1
      : kind === "second reviewer on slug A"
        ? w.a2
        : w.b;
  }

  /** The slug's reviewers, as the world holds them. */
  function onSlug(w: World, slug: string): ReviewerRows[] {
    return [w.a1, w.a2, w.signedIn, w.b].filter((r) => r.viewer.slug === slug);
  }

  /** The display name the world gives a reviewer ("Name a1" for "Label a1"). */
  function displayNameOf(r: ReviewerRows): string {
    return r.label.replace(/^Label /, "Name ");
  }

  /** Every comment row's id and body on the world's slugs, for "nothing changed". */
  async function snapshot(w: World) {
    return db()
      .select({ id: sandboxComments.id, body: sandboxComments.body })
      .from(sandboxComments)
      .where(inArray(sandboxComments.slug, [w.slugA, w.slugB]))
      .orderBy(sandboxComments.id);
  }

  /** A row inserted past the module, as a reply under `parent`, for the reads to meet. */
  async function plantReply(
    slug: string,
    parentId: string,
    author: { teamUserId: string } | ReviewerViewer,
    body: string,
  ): Promise<string> {
    const id = randomUUID();
    await db()
      .insert(sandboxComments)
      .values({
        id,
        slug,
        design: "circle",
        number: 0,
        body,
        anchor: { id: "hero", x: 0.5, y: 0.5 },
        viewportW: 1280,
        viewportH: 800,
        clientCreatedAt: new Date(),
        parentId,
        ...("teamUserId" in author
          ? { teamUserId: author.teamUserId }
          : { reviewerId: author.reviewerId, accessId: author.accessId }),
      });
    return id;
  }

  async function removeRows(ids: string[]) {
    if (ids.length)
      await db()
        .delete(sandboxComments)
        .where(inArray(sandboxComments.id, ids));
  }

  /** What no reviewer-facing payload may hold. */
  function assertNothingLeaks(w: World, me: ReviewerViewer, payload: unknown) {
    const text = JSON.stringify(payload);
    for (const r of [w.a1, w.a2, w.b, w.signedIn]) {
      assert.ok(!text.includes(r.label), "a label crossed");
      if (r.email) assert.ok(!text.includes(r.email), "an email crossed");
      assert.ok(!text.includes(r.viewer.accessId), "an access id crossed");
      assert.ok(!text.includes(r.viewer.reviewerId), "a reviewer id crossed");
    }
    for (const id of [w.teamUser, w.signedInUser, w.developer.email])
      assert.ok(!text.includes(id), "a team or user identity crossed");
    assert.ok(!text.includes("Team note"), "a team note crossed");
  }

  /** listThread as a reviewer: own rows in private; the slug's reviewer rows and team replies in collaborate. */
  const listThreadAs = (kind: ReviewerKind) => async (w: World) => {
    const rows = rowsFor(w, kind);
    const me = rows.viewer;
    const planted: string[] = [];
    try {
      const peer = onSlug(w, me.slug).find(
        (r) => r.viewer.reviewerId !== me.reviewerId,
      );
      const teamReplyBody = `Team reply ${randomUUID()}`;
      if (peer)
        planted.push(
          await plantReply(
            me.slug,
            peer.commentId,
            { teamUserId: w.teamUser },
            teamReplyBody,
          ),
        );
      // Under the team note: a save refuses it, and no read may show it.
      const hiddenBody = `Reply under the team note ${randomUUID()}`;
      planted.push(
        await plantReply(
          w.slugA,
          w.teamNoteId,
          { teamUserId: w.teamUser },
          hiddenBody,
        ),
      );

      for (const mode of MODES) {
        const read = await sandbox.listThread(db(), me, { mode });
        assertNothingLeaks(w, me, read);
        assert.ok(!JSON.stringify(read).includes(hiddenBody));
        const ids = read.map((root) => root.id).sort();
        const expected =
          mode === "private"
            ? [rows.commentId]
            : onSlug(w, me.slug).map((r) => r.commentId);
        assert.deepEqual(ids, [...expected].sort(), `${mode} roots`);
        for (const root of read) {
          assert.ok(!("removed" in root));
          const mine = root.id === rows.commentId;
          assert.equal("number" in root, mine, `${mode}: number on own only`);
          const writer = onSlug(w, me.slug).find(
            (r) => r.commentId === root.id,
          )!;
          assert.deepEqual(
            root.author,
            mine ? "self" : { reviewer: displayNameOf(writer) },
          );
        }
        const replies = read.flatMap((root) => root.replies);
        if (mode === "collaborate" && peer) {
          assert.equal(replies.length, 1);
          assert.equal(replies[0]!.body, teamReplyBody);
          assert.equal(replies[0]!.author, "team");
        } else assert.equal(replies.length, 0, `${mode} replies`);
      }
      // A reviewer never names a slug, nor reads one by a crossed viewer.
      await assert.rejects(
        sandbox.listThread(db(), me, {
          mode: "collaborate",
          slug: w.slugB,
        }),
        refusedWith(THREAD_INPUT_INVALID),
      );
      const other = me.slug === w.slugA ? w.slugB : w.slugA;
      assert.deepEqual(
        await sandbox.listThread(
          db(),
          { ...me, slug: other },
          { mode: "private" },
        ),
        [],
      );
      for (const bad of [{}, { mode: "open" }, null])
        await assert.rejects(
          sandbox.listThread(db(), me, bad as never),
          refusedWith(THREAD_INPUT_INVALID),
        );
    } finally {
      await removeRows(planted);
    }
  };

  /** listThread as the team: the slug's reviewer comments by label, replies by label or email; never a team note. */
  const listThreadAsTeam = (kind: TeamKind) => async (w: World) => {
    const me = viewerFor(w, kind) as TeamViewer;
    const planted: string[] = [];
    try {
      const reviewerReply = await plantReply(
        w.slugA,
        w.a1.commentId,
        w.a2.viewer,
        "A reviewer's reply",
      );
      planted.push(reviewerReply);
      planted.push(
        await plantReply(
          w.slugA,
          w.teamNoteId,
          { teamUserId: w.teamUser },
          "Hidden reply",
        ),
      );
      for (const mode of MODES) {
        const read = await sandbox.listThread(db(), me, {
          mode,
          slug: w.slugA,
        });
        const text = JSON.stringify(read);
        assert.ok(
          !text.includes("Team note") && !text.includes("Hidden reply"),
        );
        assert.deepEqual(
          read.map((root) => root.id).sort(),
          onSlug(w, w.slugA)
            .map((r) => r.commentId)
            .sort(),
        );
        const a1 = read.find((root) => root.id === w.a1.commentId)!;
        assert.ok(!("removed" in a1));
        assert.deepEqual(a1.author, { reviewer: w.a1.label });
        assert.equal(a1.number, 1);
        assert.deepEqual(
          a1.replies.map((r) => [r.id, r.author]),
          mode === "collaborate"
            ? [[reviewerReply, { reviewer: w.a2.label }]]
            : [],
        );
      }
      await assert.rejects(
        sandbox.listThread(db(), me, { mode: "collaborate" }),
        refusedWith(THREAD_INPUT_INVALID),
      );
      // Slug B holds nothing of slug A.
      const b = await sandbox.listThread(db(), me, {
        mode: "collaborate",
        slug: w.slugB,
      });
      assert.deepEqual(
        b.map((root) => root.id),
        [w.b.commentId],
      );
    } finally {
      await removeRows(planted);
    }
  };

  /** listReplies as a reviewer: the replies under a root they may read, none under a team note or in private. */
  const listRepliesAs = (kind: ReviewerKind) => async (w: World) => {
    const me = rowsFor(w, kind).viewer;
    const planted: string[] = [];
    try {
      const peer = onSlug(w, me.slug).find(
        (r) => r.viewer.reviewerId !== me.reviewerId,
      );
      const root = peer?.commentId ?? rowsFor(w, kind).commentId;
      const teamReply = await plantReply(
        me.slug,
        root,
        { teamUserId: w.teamUser },
        "From the team",
      );
      planted.push(teamReply);
      planted.push(
        await plantReply(
          w.slugA,
          w.teamNoteId,
          { teamUserId: w.teamUser },
          "Hidden reply",
        ),
      );
      const collaborate = await sandbox.listReplies(db(), me, {
        rootId: root,
        mode: "collaborate",
      });
      assertNothingLeaks(w, me, collaborate);
      assert.deepEqual(
        collaborate.map((r) => [r.id, r.author]),
        [[teamReply, "team"]],
      );
      assert.deepEqual(
        await sandbox.listReplies(db(), me, { rootId: root, mode: "private" }),
        [],
      );
      for (const mode of MODES)
        assert.deepEqual(
          await sandbox.listReplies(db(), me, {
            rootId: w.teamNoteId,
            mode,
          }),
          [],
        );
      // Another slug's root reads nothing.
      const far = me.slug === w.slugA ? w.b.commentId : w.a1.commentId;
      assert.deepEqual(
        await sandbox.listReplies(db(), me, {
          rootId: far,
          mode: "collaborate",
        }),
        [],
      );
      await assert.rejects(
        sandbox.listReplies(db(), me, { rootId: "x", mode: "collaborate" }),
        refusedWith(THREAD_INPUT_INVALID),
      );
    } finally {
      await removeRows(planted);
    }
  };

  const listRepliesAsTeam = (kind: TeamKind) => async (w: World) => {
    const me = viewerFor(w, kind) as TeamViewer;
    const planted: string[] = [];
    try {
      const reply = await plantReply(
        w.slugA,
        w.a1.commentId,
        w.a2.viewer,
        "A reviewer's reply",
      );
      planted.push(reply);
      const read = await sandbox.listReplies(db(), me, {
        rootId: w.a1.commentId,
        mode: "collaborate",
        slug: w.slugA,
      });
      assert.deepEqual(
        read.map((r) => [r.id, r.author]),
        [[reply, { reviewer: w.a2.label }]],
      );
      assert.deepEqual(
        await sandbox.listReplies(db(), me, {
          rootId: w.a1.commentId,
          mode: "private",
          slug: w.slugA,
        }),
        [],
      );
      // Named on the wrong slug, the root's replies are not there.
      assert.deepEqual(
        await sandbox.listReplies(db(), me, {
          rootId: w.a1.commentId,
          mode: "collaborate",
          slug: w.slugB,
        }),
        [],
      );
    } finally {
      await removeRows(planted);
    }
  };

  /** saveReply as a reviewer: refused in private, under a team note or across slugs; stored under the root otherwise. */
  const saveReplyAs = (kind: ReviewerKind) => async (w: World) => {
    const rows = rowsFor(w, kind);
    const me = rows.viewer;
    const before = await snapshot(w);
    const id = randomUUID();
    const reply = (parentId: string, mode: "private" | "collaborate") => ({
      id,
      parentId,
      body: "Agreed, the toggle is hard to find.",
      clientCreatedAt: new Date(),
      mode,
    });
    try {
      const far = me.slug === w.slugA ? w.b.commentId : w.a1.commentId;
      for (const mode of MODES) {
        for (const parent of [w.teamNoteId, far, randomUUID()])
          assert.equal(
            await sandbox.saveReply(db(), me, reply(parent, mode)),
            "not-saved",
          );
        if (mode === "private")
          assert.equal(
            await sandbox.saveReply(db(), me, reply(rows.commentId, mode)),
            "not-saved",
          );
        assert.deepEqual(await snapshot(w), before, `${mode}: nothing written`);
      }
      assert.equal(
        await sandbox.saveReply(db(), me, reply(rows.commentId, "collaborate")),
        "ok",
      );
      const [stored] = await db()
        .select()
        .from(sandboxComments)
        .where(eq(sandboxComments.id, id));
      assert.equal(stored!.parentId, rows.commentId);
      assert.equal(stored!.reviewerId, me.reviewerId);
      assert.equal(stored!.accessId, me.accessId);
      assert.equal(stored!.slug, me.slug);
      // Another reviewer's id cannot be edited through a reply.
      for (const other of [w.a1, w.a2, w.b].filter(
        (r) => r.viewer.reviewerId !== me.reviewerId,
      ))
        assert.equal(
          await sandbox.saveReply(db(), me, {
            ...reply(rows.commentId, "collaborate"),
            id: other.commentId,
          }),
          "not-saved",
        );
      // A crossed slug or access writes nothing.
      const far2 = (me.slug === w.slugA ? w.b : w.a1).viewer;
      for (const crossed of [
        { ...me, slug: far2.slug },
        { ...me, accessId: far2.accessId },
      ])
        await assert.rejects(
          sandbox.saveReply(db(), crossed, {
            ...reply(rows.commentId, "collaborate"),
            id: randomUUID(),
          }),
          refusedWith(REVIEWER_NOT_FOUND),
        );
      await assert.rejects(
        sandbox.saveReply(db(), me, {
          ...reply(rows.commentId, "collaborate"),
          slug: me.slug,
        } as never),
        refusedWith(THREAD_INPUT_INVALID),
      );
      for (const body of ["", "  ", "x".repeat(2001)])
        await assert.rejects(
          sandbox.saveReply(db(), me, {
            ...reply(rows.commentId, "collaborate"),
            body,
          }),
          refusedWith(REPLY_BODY_INVALID),
        );
    } finally {
      await removeRows([id]);
    }
    assert.deepEqual(await snapshot(w), before);
  };

  const saveReplyAsTeam = (kind: TeamKind) => async (w: World) => {
    const me = viewerFor(w, kind) as TeamViewer;
    const before = await snapshot(w);
    const id = randomUUID();
    const reply = (
      parentId: string,
      mode: "private" | "collaborate",
      slug = w.slugA,
    ) => ({
      id,
      parentId,
      body: "Thanks, we'll look.",
      clientCreatedAt: new Date(),
      mode,
      slug,
    });
    try {
      assert.equal(
        await sandbox.saveReply(db(), me, reply(w.a1.commentId, "private")),
        "not-saved",
      );
      assert.equal(
        await sandbox.saveReply(db(), me, reply(w.teamNoteId, "collaborate")),
        "not-saved",
      );
      assert.equal(
        await sandbox.saveReply(
          db(),
          me,
          reply(w.a1.commentId, "collaborate", w.slugB),
        ),
        "not-saved",
      );
      assert.deepEqual(await snapshot(w), before);
      assert.equal(
        await sandbox.saveReply(db(), me, reply(w.a1.commentId, "collaborate")),
        "ok",
      );
      const [stored] = await db()
        .select()
        .from(sandboxComments)
        .where(eq(sandboxComments.id, id));
      assert.equal(stored!.teamUserId, me.userId);
      assert.equal(stored!.reviewerId, null);
      assert.equal(stored!.parentId, w.a1.commentId);
      // A reviewer's comment is never the team's to edit.
      assert.equal(
        await sandbox.saveReply(db(), me, {
          ...reply(w.a2.commentId, "collaborate"),
          id: w.a1.commentId,
        }),
        "not-saved",
      );
      await assert.rejects(
        sandbox.saveReply(db(), me, {
          ...reply(w.a1.commentId, "collaborate"),
          slug: undefined,
        }),
        refusedWith(THREAD_INPUT_INVALID),
      );
    } finally {
      await removeRows([id]);
    }
    assert.deepEqual(await snapshot(w), before);
  };

  /** deleteReply: the viewer's own reply only; a root, another's reply or a team note stays. */
  const deleteReplyAs = (kind: ViewerKind) => async (w: World) => {
    const me = viewerFor(w, kind);
    const before = await snapshot(w);
    const planted: string[] = [];
    try {
      const reviewerMe = me.kind === "reviewer" ? me : null;
      const slug = reviewerMe?.slug ?? w.slugA;
      const root = onSlug(w, slug)[0]!.commentId;
      const mine = await plantReply(
        slug,
        root,
        reviewerMe ?? { teamUserId: (me as TeamViewer).userId },
        "Mine",
      );
      // Another team member's reply, and another reviewer's.
      const peer = onSlug(w, slug).find(
        (r) => r.viewer.reviewerId !== reviewerMe?.reviewerId,
      );
      const others = [
        await plantReply(slug, root, { teamUserId: w.otherUser }, "Theirs"),
        ...(peer
          ? [await plantReply(slug, root, peer.viewer, "A peer's")]
          : []),
      ];
      planted.push(mine, ...others);
      for (const id of [...others, root, w.teamNoteId, w.a1.commentId])
        await sandbox.deleteReply(db(), me, { id });
      const left = (await snapshot(w)).map((row) => row.id);
      for (const id of [mine, ...others, ...before.map((row) => row.id)])
        assert.ok(left.includes(id));
      await sandbox.deleteReply(db(), me, { id: mine });
      assert.ok(!(await snapshot(w)).some((row) => row.id === mine));
      await assert.rejects(
        sandbox.deleteReply(db(), me, { id: "nope" }),
        refusedWith(THREAD_INPUT_INVALID),
      );
    } finally {
      await removeRows(planted);
    }
    assert.deepEqual(await snapshot(w), before);
  };

  return {
    listThread: {
      group: "viewer",
      criteria: ["C2", "C3", "C6", "C8"],
      byViewer: {
        "reviewer on slug A": listThreadAs("reviewer on slug A"),
        "second reviewer on slug A": listThreadAs("second reviewer on slug A"),
        "reviewer on slug B": listThreadAs("reviewer on slug B"),
        developer: listThreadAsTeam("developer"),
        admin: listThreadAsTeam("admin"),
      },
    },
    listReplies: {
      group: "viewer",
      criteria: ["C2", "C3", "C6"],
      byViewer: {
        "reviewer on slug A": listRepliesAs("reviewer on slug A"),
        "second reviewer on slug A": listRepliesAs("second reviewer on slug A"),
        "reviewer on slug B": listRepliesAs("reviewer on slug B"),
        developer: listRepliesAsTeam("developer"),
        admin: listRepliesAsTeam("admin"),
      },
    },
    saveReply: {
      group: "viewer",
      criteria: ["C3", "C4", "C6"],
      byViewer: {
        "reviewer on slug A": saveReplyAs("reviewer on slug A"),
        "second reviewer on slug A": saveReplyAs("second reviewer on slug A"),
        "reviewer on slug B": saveReplyAs("reviewer on slug B"),
        developer: saveReplyAsTeam("developer"),
        admin: saveReplyAsTeam("admin"),
      },
    },
    deleteReply: {
      group: "viewer",
      byViewer: {
        "reviewer on slug A": deleteReplyAs("reviewer on slug A"),
        "second reviewer on slug A": deleteReplyAs("second reviewer on slug A"),
        "reviewer on slug B": deleteReplyAs("reviewer on slug B"),
        developer: deleteReplyAs("developer"),
        admin: deleteReplyAs("admin"),
      },
    },
  };
}
