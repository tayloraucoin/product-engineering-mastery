/**
 * The isolation cases for erasure.ts (LAB-16), spread into the suite's
 * REGISTRY. A reviewer viewer is refused every function with nothing
 * changed; a developer is refused the delete; reads run against the world;
 * every delete and erase runs on a slug of its own, removed after, with its
 * record rows, so the world stays as other cases expect.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { count, eq, inArray } from "drizzle-orm";

import * as sandbox from "@pem/db/sandbox";

import type { Db } from "../../src/client.ts";
import { ERASURE_INPUT_INVALID } from "../../src/sandbox/erasure.ts";
import {
  NOT_A_TEAM_VIEWER,
  NOT_AN_ADMIN_VIEWER,
  type TeamViewer,
  type Viewer,
} from "../../src/sandbox/viewer.ts";
import {
  sandboxAccesses,
  sandboxActions,
  sandboxComments,
  sandboxReviewers,
  sandboxReviewVersions,
  sandboxViewEvents,
} from "../../src/schema/index.ts";
import { seedCode, seedEntry, seedTeamNote } from "./erasure-fixtures.ts";
import type { World } from "./fixtures.ts";
import type { Registry, ViewerKind } from "./registry.ts";

type Deps = { db: () => Db; viewerFor: (w: World, kind: ViewerKind) => Viewer };

type ReviewerKind = Exclude<ViewerKind, "developer" | "admin">;

function refusedWith(message: string) {
  return (error: unknown) => {
    assert.ok(error instanceof sandbox.SandboxAccessError, String(error));
    assert.equal((error as Error).message, message);
    return true;
  };
}

function exactKeys(value: unknown, keys: string[]) {
  assert.ok(value && typeof value === "object", "expected an object");
  assert.deepEqual(Object.keys(value).sort(), [...keys].sort());
}

export function erasureCases({ db, viewerFor }: Deps): Registry<World> {
  /** Every row count the world's two slugs hold, and the record's size. */
  async function snapshot(w: World) {
    const slugs = [w.slugA, w.slugB];
    const counted = async (
      table:
        | typeof sandboxReviewers
        | typeof sandboxComments
        | typeof sandboxViewEvents
        | typeof sandboxReviewVersions,
    ) => {
      const [row] = await db()
        .select({ n: count() })
        .from(table)
        .where(inArray(table.slug, slugs));
      return row!.n;
    };
    const [accesses] = await db()
      .select({ n: count() })
      .from(sandboxAccesses)
      .innerJoin(
        sandboxReviewers,
        eq(sandboxAccesses.reviewerId, sandboxReviewers.id),
      )
      .where(inArray(sandboxReviewers.slug, slugs));
    const [actions] = await db().select({ n: count() }).from(sandboxActions);
    const labels = await db()
      .select({
        label: sandboxReviewers.label,
        revokedAt: sandboxReviewers.revokedAt,
      })
      .from(sandboxReviewers)
      .where(inArray(sandboxReviewers.slug, slugs))
      .orderBy(sandboxReviewers.id);
    return {
      reviewers: await counted(sandboxReviewers),
      comments: await counted(sandboxComments),
      views: await counted(sandboxViewEvents),
      versions: await counted(sandboxReviewVersions),
      accesses: accesses!.n,
      actions: actions!.n,
      labels,
    };
  }

  /** A slug of the case's own, its rows and record rows removed when `fn` ends. */
  async function onScratchSlug(
    w: World,
    fn: (slug: string) => Promise<void>,
  ): Promise<void> {
    const slug = `iso-erase-${w.run}-${randomUUID().slice(0, 6)}`;
    const [{ n: before }] = (await db()
      .select({ n: count() })
      .from(sandboxActions)) as [{ n: number }];
    const started = new Date(Date.now() - 1000);
    try {
      await fn(slug);
    } finally {
      await db()
        .delete(sandboxReviewers)
        .where(eq(sandboxReviewers.slug, slug));
      await db().delete(sandboxComments).where(eq(sandboxComments.slug, slug));
      await db().delete(sandboxActions).where(eq(sandboxActions.slug, slug));
      // An erasure's row has no slug: it is the world team's, since `started`.
      const stray = await db()
        .select({ id: sandboxActions.id, at: sandboxActions.at })
        .from(sandboxActions)
        .where(eq(sandboxActions.actorUserId, w.teamUser));
      const ours = stray.filter((r) => r.at >= started);
      if (ours.length > 0)
        await db()
          .delete(sandboxActions)
          .where(
            inArray(
              sandboxActions.id,
              ours.map((r) => r.id),
            ),
          );
      const [{ n: after }] = (await db()
        .select({ n: count() })
        .from(sandboxActions)) as [{ n: number }];
      assert.ok(after <= before, "a case left a record row behind");
    }
  }

  const refusedFor =
    (
      kind: ViewerKind,
      message: string,
      call: (w: World, viewer: Viewer) => Promise<unknown>,
    ) =>
    async (w: World) => {
      const before = await snapshot(w);
      await assert.rejects(call(w, viewerFor(w, kind)), refusedWith(message));
      assert.deepEqual(
        await snapshot(w),
        before,
        "a refused call changed rows",
      );
    };

  const byReviewer = (
    call: (w: World, viewer: Viewer) => Promise<unknown>,
  ): Record<ReviewerKind, (w: World) => Promise<void>> => ({
    "reviewer on slug A": refusedFor(
      "reviewer on slug A",
      NOT_A_TEAM_VIEWER,
      call,
    ),
    "second reviewer on slug A": refusedFor(
      "second reviewer on slug A",
      NOT_A_TEAM_VIEWER,
      call,
    ),
    "reviewer on slug B": refusedFor(
      "reviewer on slug B",
      NOT_A_TEAM_VIEWER,
      call,
    ),
  });

  const ownSlug = (w: World, viewer: Viewer) =>
    viewer.kind === "reviewer" ? viewer.slug : w.slugA;
  const ownEmail = (w: World, viewer: Viewer) =>
    viewer.kind === "reviewer" && viewer.reviewerId === w.b.viewer.reviewerId
      ? w.b.email!
      : viewer.kind === "reviewer" &&
          viewer.reviewerId === w.a2.viewer.reviewerId
        ? w.a2.email!
        : w.a1.email!;

  // --- countExperimentData ---------------------------------------------------

  const countAsTeam = (kind: "developer" | "admin") => async (w: World) => {
    const before = await snapshot(w);
    const counts = await sandbox.countExperimentData(db(), viewerFor(w, kind), {
      slug: w.slugA,
    });
    exactKeys(counts, [
      "reviewers",
      "codes",
      "views",
      "comments",
      "reviews",
      "versions",
      "teamNotes",
    ]);
    const onA = async (
      table: typeof sandboxViewEvents | typeof sandboxReviewVersions,
    ) =>
      (
        await db()
          .select({ n: count() })
          .from(table)
          .where(eq(table.slug, w.slugA))
      )[0]!.n;
    assert.equal(counts.reviewers, 3, "a1, a2 and the signed-in reviewer");
    assert.equal(counts.codes, 3);
    assert.equal(counts.comments, 3, "team notes are counted apart");
    assert.equal(counts.teamNotes, 1);
    assert.equal(counts.views, await onA(sandboxViewEvents));
    assert.equal(counts.versions, await onA(sandboxReviewVersions));
    assert.equal(counts.reviews, 3);
    assert.deepEqual(await snapshot(w), before, "counting changed rows");
    await assert.rejects(
      sandbox.countExperimentData(db(), viewerFor(w, kind), {
        slug: "Not A Slug",
      }),
      refusedWith(ERASURE_INPUT_INVALID),
    );
  };

  // --- deleteExperimentData -------------------------------------------------

  const deleteAsAdmin = async (w: World) => {
    const before = await snapshot(w);
    await onScratchSlug(w, async (slug) => {
      const reviewerId = await seedCode(db(), { slug, label: "Label one" });
      await seedEntry(db(), {
        slug,
        reviewerId,
        identity: { email: `one-${w.run}@example.test` },
      });
      await seedTeamNote(db(), { slug, teamUserId: w.teamUser });
      const counts = await sandbox.deleteExperimentData(db(), w.admin, {
        slug,
      });
      assert.deepEqual(counts, {
        reviewers: 1,
        codes: 1,
        views: 1,
        comments: 1,
        reviews: 1,
        versions: 1,
        teamNotes: 1,
      });
      const after = await sandbox.countExperimentData(db(), w.admin, { slug });
      assert.ok(Object.values(after).every((n) => n === 0));
      const rows = await db()
        .select()
        .from(sandboxActions)
        .where(eq(sandboxActions.slug, slug));
      assert.equal(rows.length, 1);
      assert.equal(rows[0]!.action, sandbox.ERASURE_ACTIONS.dataDeleted);
    });
    assert.deepEqual(await snapshot(w), before, "another slug's rows changed");
  };

  const deleteAsDeveloper = async (w: World) => {
    const before = await snapshot(w);
    await assert.rejects(
      sandbox.deleteExperimentData(db(), w.developer, { slug: w.slugA }),
      refusedWith(NOT_AN_ADMIN_VIEWER),
    );
    // A developer viewer dressed with an admin's id is still a developer.
    const dressed: TeamViewer = { ...w.developer, userId: w.admin.userId };
    await assert.rejects(
      sandbox.deleteExperimentData(db(), dressed, { slug: w.slugA }),
      refusedWith(NOT_AN_ADMIN_VIEWER),
    );
    assert.deepEqual(
      await snapshot(w),
      before,
      "a refused delete changed rows",
    );
  };

  // --- findErasure -----------------------------------------------------------

  const findAsTeam = (kind: "developer" | "admin") => async (w: World) => {
    const before = await snapshot(w);
    const viewer = viewerFor(w, kind);
    const found = await sandbox.findErasure(db(), viewer, {
      email: w.a1.email!,
      userIds: [],
    });
    exactKeys(found, [
      "experiments",
      "comments",
      "versions",
      "views",
      "nameLabels",
    ]);
    assert.equal(found!.experiments, 1);
    assert.equal(found!.comments, 1);
    assert.equal(found!.versions, 1);
    assert.ok(found!.views >= 1);
    // a1's code was used by a1 alone: its label goes anyway, so it is not offered.
    assert.deepEqual(found!.nameLabels, []);
    const signedIn = await sandbox.findErasure(db(), viewer, {
      email: `nobody-${w.run}@example.test`,
      userIds: [w.signedInUser],
    });
    assert.equal(signedIn!.comments, 1, "the signed-in reviewer, by user id");
    assert.equal(
      await sandbox.findErasure(db(), viewer, {
        email: `nobody-${w.run}@example.test`,
        userIds: [],
      }),
      null,
    );
    for (const email of [" a@b.test", "A@b.test", "no-at", "a@b@c"])
      await assert.rejects(
        sandbox.findErasure(db(), viewer, { email, userIds: [] }),
        refusedWith(ERASURE_INPUT_INVALID),
      );
    await assert.rejects(
      sandbox.findErasure(db(), viewer, {
        email: w.a1.email!,
        userIds: ["not-a-uuid"],
      }),
      refusedWith(ERASURE_INPUT_INVALID),
    );
    assert.deepEqual(await snapshot(w), before, "finding changed rows");
  };

  // --- findReviewerEmails ----------------------------------------------------

  const emailsAsTeam = (kind: "developer" | "admin") => async (w: World) => {
    const before = await snapshot(w);
    const viewer = viewerFor(w, kind);
    const found = await sandbox.findReviewerEmails(db(), viewer, {
      reviewerId: w.a1.viewer.reviewerId,
    });
    exactKeys(found, ["slug", "emails", "accounts"]);
    assert.equal(found!.slug, w.slugA);
    assert.deepEqual(
      found!.emails.map((e) => e.email),
      [w.a1.email],
      "only this code's emails",
    );
    assert.deepEqual(found!.accounts, []);
    exactKeys(found!.emails[0], ["email", "comments", "versions", "views"]);
    const signedIn = await sandbox.findReviewerEmails(db(), viewer, {
      reviewerId: w.signedIn.viewer.reviewerId,
    });
    assert.deepEqual(
      signedIn!.accounts.map((a) => a.userId),
      [w.signedInUser],
    );
    assert.equal(
      await sandbox.findReviewerEmails(db(), viewer, {
        reviewerId: randomUUID(),
      }),
      null,
    );
    await assert.rejects(
      sandbox.findReviewerEmails(db(), viewer, { reviewerId: "nope" }),
      refusedWith(ERASURE_INPUT_INVALID),
    );
    assert.deepEqual(await snapshot(w), before, "finding changed rows");
  };

  // --- eraseEmail ------------------------------------------------------------

  const eraseAsTeam = (kind: "developer" | "admin") => async (w: World) => {
    const before = await snapshot(w);
    await onScratchSlug(w, async (slug) => {
      const email = `erase-${kind}-${w.run}@example.test`;
      const reviewerId = await seedCode(db(), { slug, label: email });
      const entry = await seedEntry(db(), {
        slug,
        reviewerId,
        identity: { email },
      });
      const counts = await sandbox.eraseEmail(db(), viewerFor(w, kind), {
        email,
        userIds: [],
        clearLabels: [],
      });
      assert.deepEqual(counts, {
        accesses: 1,
        comments: 1,
        versions: 1,
        views: 1,
        labelsScrubbed: 1,
        reviewersRevoked: 1,
      });
      const [left] = await db()
        .select({ n: count() })
        .from(sandboxComments)
        .where(eq(sandboxComments.id, entry.commentId));
      assert.equal(left!.n, 0);
      assert.equal(
        await sandbox.eraseEmail(db(), viewerFor(w, kind), {
          email,
          userIds: [],
          clearLabels: [],
        }),
        null,
        "a second erase finds nothing and records nothing",
      );
    });
    assert.deepEqual(await snapshot(w), before, "the world's rows changed");
  };

  // --- listActions -----------------------------------------------------------

  const listAsTeam = (kind: "developer" | "admin") => async (w: World) => {
    const before = await snapshot(w);
    const page = await sandbox.listActions(db(), viewerFor(w, kind), {
      page: 1,
    });
    exactKeys(page, ["rows", "page", "total"]);
    assert.equal(page.page, 1);
    assert.ok(page.rows.length <= sandbox.ACTIONS_PAGE_SIZE);
    for (const row of page.rows)
      exactKeys(row, [
        "id",
        "at",
        "actorEmail",
        "action",
        "slug",
        "targetEmail",
        "counts",
      ]);
    for (let i = 1; i < page.rows.length; i++)
      assert.ok(page.rows[i - 1]!.at >= page.rows[i]!.at, "newest first");
    for (const bad of [0, -1, 1.5, Number.NaN])
      await assert.rejects(
        sandbox.listActions(db(), viewerFor(w, kind), { page: bad }),
        refusedWith(ERASURE_INPUT_INVALID),
      );
    assert.deepEqual(await snapshot(w), before, "reading changed rows");
  };

  return {
    countExperimentData: {
      group: "viewer",
      criteria: ["LAB-16 C1"],
      byViewer: {
        ...byReviewer((w, viewer) =>
          sandbox.countExperimentData(db(), viewer, {
            slug: ownSlug(w, viewer),
          }),
        ),
        developer: countAsTeam("developer"),
        admin: countAsTeam("admin"),
      },
    },
    deleteExperimentData: {
      group: "viewer",
      criteria: ["LAB-16 C1", "LAB-16 C2"],
      byViewer: {
        ...byReviewer((w, viewer) =>
          sandbox.deleteExperimentData(db(), viewer, {
            slug: ownSlug(w, viewer),
          }),
        ),
        developer: deleteAsDeveloper,
        admin: deleteAsAdmin,
      },
    },
    findErasure: {
      group: "viewer",
      criteria: ["LAB-16 C4"],
      byViewer: {
        ...byReviewer((w, viewer) =>
          sandbox.findErasure(db(), viewer, {
            email: ownEmail(w, viewer),
            userIds: [],
          }),
        ),
        developer: findAsTeam("developer"),
        admin: findAsTeam("admin"),
      },
    },
    findReviewerEmails: {
      group: "viewer",
      criteria: ["LAB-16 C9"],
      byViewer: {
        ...byReviewer((w, viewer) =>
          sandbox.findReviewerEmails(db(), viewer, {
            reviewerId:
              viewer.kind === "reviewer"
                ? viewer.reviewerId
                : w.a1.viewer.reviewerId,
          }),
        ),
        developer: emailsAsTeam("developer"),
        admin: emailsAsTeam("admin"),
      },
    },
    eraseEmail: {
      group: "viewer",
      criteria: ["LAB-16 C4"],
      byViewer: {
        ...byReviewer((w, viewer) =>
          sandbox.eraseEmail(db(), viewer, {
            email: ownEmail(w, viewer),
            userIds: [],
            clearLabels: [],
          }),
        ),
        developer: eraseAsTeam("developer"),
        admin: eraseAsTeam("admin"),
      },
    },
    listActions: {
      group: "viewer",
      criteria: ["LAB-16 C7"],
      byViewer: {
        ...byReviewer((_w, viewer) =>
          sandbox.listActions(db(), viewer, { page: 1 }),
        ),
        developer: listAsTeam("developer"),
        admin: listAsTeam("admin"),
      },
    },
    ERASURE_ACTIONS: {
      group: "support",
      criteria: ["LAB-16 C7"],
      cases: {
        "names the two erasure actions in the record's kebab-case, which recordAction accepts":
          async (w) => {
            assert.deepEqual(Object.values(sandbox.ERASURE_ACTIONS), [
              "data-deleted",
              "reviewer-erased",
            ]);
            assert.ok(Object.isFrozen(sandbox.ERASURE_ACTIONS));
            await onScratchSlug(w, async (slug) => {
              for (const action of Object.values(sandbox.ERASURE_ACTIONS))
                await sandbox.recordAction(db(), w.admin, { action, slug });
            });
          },
      },
    },
    ERASED_LABEL: {
      group: "support",
      criteria: ["LAB-16 C5"],
      cases: {
        "is the words D-LAB-27 gives an erased label": () => {
          assert.equal(sandbox.ERASED_LABEL, "Erased reviewer");
        },
      },
    },
    ACTIONS_PAGE_SIZE: {
      group: "support",
      criteria: ["LAB-16 C9"],
      cases: {
        "is 50, as data.md pages the record": () => {
          assert.equal(sandbox.ACTIONS_PAGE_SIZE, 50);
        },
      },
    },
  };
}
