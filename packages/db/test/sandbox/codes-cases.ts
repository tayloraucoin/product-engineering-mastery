/**
 * The isolation cases for codes.ts (LAB-15 C8), spread into the suite's
 * REGISTRY. Every write runs on a slug of its own, removed after, so the
 * world's counts stay as other cases expect.
 */

import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { and, count, eq, inArray } from "drizzle-orm";

import * as sandbox from "@pem/db/sandbox";

import type { Db } from "../../src/client.ts";
import { CODES_INPUT_INVALID } from "../../src/sandbox/codes.ts";
import {
  NOT_A_TEAM_VIEWER,
  type TeamViewer,
  type Viewer,
} from "../../src/sandbox/viewer.ts";
import { sandboxActions, sandboxReviewers } from "../../src/schema/index.ts";
import { codeHash, type World } from "./fixtures.ts";
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

const hash = () => new Uint8Array(randomBytes(32));

export function codesCases({ db, viewerFor }: Deps): Registry<World> {
  async function reviewerCount(slug: string) {
    const [row] = await db()
      .select({ n: count() })
      .from(sandboxReviewers)
      .where(eq(sandboxReviewers.slug, slug));
    return row!.n;
  }

  async function actionsOn(slug: string) {
    return db()
      .select()
      .from(sandboxActions)
      .where(eq(sandboxActions.slug, slug));
  }

  async function reviewerRow(id: string) {
    const [row] = await db()
      .select()
      .from(sandboxReviewers)
      .where(eq(sandboxReviewers.id, id));
    return row;
  }

  /** A slug of the case's own, its rows removed when `fn` ends. */
  async function onScratchSlug(
    w: World,
    fn: (slug: string) => Promise<void>,
  ): Promise<void> {
    const slug = `iso-codes-${w.run}-${randomUUID().slice(0, 6)}`;
    try {
      await fn(slug);
    } finally {
      await db()
        .delete(sandboxReviewers)
        .where(eq(sandboxReviewers.slug, slug));
      await db().delete(sandboxActions).where(eq(sandboxActions.slug, slug));
    }
  }

  /** A record row holds the action and the slug, and none of what was acted on. */
  function assertBareRecord(
    row: typeof sandboxActions.$inferSelect,
    team: TeamViewer,
    action: string,
    slug: string,
    secrets: (string | null)[],
  ) {
    assert.equal(row.action, action);
    assert.equal(row.slug, slug);
    assert.equal(row.actorUserId, team.userId);
    assert.equal(row.targetEmail, null);
    assert.equal(row.counts, null);
    const text = JSON.stringify(row);
    for (const secret of secrets)
      assert.ok(!secret || !text.includes(secret), "the record names input");
  }

  const refusedFor =
    (kind: ViewerKind, call: (w: World, viewer: Viewer) => Promise<unknown>) =>
    async (w: World) => {
      const before = await reviewerCount(w.slugA);
      const [beforeA] = await db()
        .select({ n: count() })
        .from(sandboxActions)
        .where(inArray(sandboxActions.slug, [w.slugA, w.slugB]));
      await assert.rejects(
        call(w, viewerFor(w, kind)),
        refusedWith(NOT_A_TEAM_VIEWER),
      );
      assert.equal(
        await reviewerCount(w.slugA),
        before,
        "a refused call wrote",
      );
      const [afterA] = await db()
        .select({ n: count() })
        .from(sandboxActions)
        .where(inArray(sandboxActions.slug, [w.slugA, w.slugB]));
      assert.equal(afterA!.n, beforeA!.n, "a refused call recorded");
      // Its own slug and its own id change nothing either.
      const self = viewerFor(w, kind);
      if (self.kind === "reviewer") {
        const row = await reviewerRow(self.reviewerId);
        assert.equal(row!.revokedAt, null);
        assert.equal(row!.codeVersion, 1);
      }
    };

  const byReviewer = (
    call: (w: World, viewer: Viewer) => Promise<unknown>,
  ): Record<ReviewerKind, (w: World) => Promise<void>> => ({
    "reviewer on slug A": refusedFor("reviewer on slug A", call),
    "second reviewer on slug A": refusedFor("second reviewer on slug A", call),
    "reviewer on slug B": refusedFor("reviewer on slug B", call),
  });

  // --- listCodes -----------------------------------------------------------

  const listAsTeam = (kind: "developer" | "admin") => async (w: World) => {
    const viewer = viewerFor(w, kind);
    const rows = await sandbox.listCodes(db(), viewer, { slug: w.slugA });
    for (const row of rows)
      exactKeys(row, [
        "reviewerId",
        "label",
        "displayName",
        "emailsUsed",
        "lastUsedAt",
        "revoked",
      ]);
    // Slug A's three reviewers, newest first; slug B's never.
    assert.deepEqual(
      rows.map((r) => r.reviewerId),
      [w.signedIn, w.a2, w.a1].map((r) => r.viewer.reviewerId),
    );
    const a1 = rows.find((r) => r.reviewerId === w.a1.viewer.reviewerId)!;
    assert.equal(a1.label, w.a1.label);
    assert.deepEqual(a1.emailsUsed, [w.a1.email]);
    assert.ok(a1.lastUsedAt instanceof Date);
    assert.equal(a1.revoked, false);
    // A signed-in access counts in Last used, never in Emails used.
    const signedIn = rows.find(
      (r) => r.reviewerId === w.signedIn.viewer.reviewerId,
    )!;
    assert.deepEqual(signedIn.emailsUsed, []);
    assert.ok(signedIn.lastUsedAt instanceof Date);
    // No code, no hash, nothing of slug B.
    const text = JSON.stringify(rows);
    for (const r of [w.a1, w.a2, w.signedIn]) assert.ok(!text.includes(r.code));
    for (const secret of [w.b.label, w.b.email!, w.b.viewer.reviewerId])
      assert.ok(!text.includes(secret));
    const [stored] = await db()
      .select({ codeHash: sandboxReviewers.codeHash })
      .from(sandboxReviewers)
      .where(eq(sandboxReviewers.id, w.a1.viewer.reviewerId));
    assert.ok(!text.includes(Buffer.from(stored!.codeHash).toString("hex")));
    assert.ok(!text.includes(Buffer.from(stored!.codeHash).toString("base64")));
    // Slug B lists only its own.
    const onB = await sandbox.listCodes(db(), viewer, { slug: w.slugB });
    assert.deepEqual(
      onB.map((r) => r.reviewerId),
      [w.b.viewer.reviewerId],
    );
    assert.deepEqual(
      await sandbox.listCodes(db(), viewer, { slug: `iso-none-${w.run}` }),
      [],
    );
    for (const slug of ["Not A Slug", w.a1.email!, 7 as never])
      await assert.rejects(
        sandbox.listCodes(db(), viewer, { slug }),
        refusedWith(CODES_INPUT_INVALID),
      );
  };

  // --- makeCode ------------------------------------------------------------

  const makeAsTeam = (kind: "developer" | "admin") => async (w: World) => {
    const viewer = viewerFor(w, kind) as TeamViewer;
    await onScratchSlug(w, async (slug) => {
      const label = `ana-${w.run}@example.test`;
      const displayName = `Ana ${w.run}`;
      const codeHashValue = hash();
      const made = await sandbox.makeCode(db(), viewer, {
        slug,
        label,
        displayName,
        codeHash: codeHashValue,
      });
      exactKeys(made, ["reviewerId"]);
      const reviewerId = (made as { reviewerId: string }).reviewerId;
      const row = await reviewerRow(reviewerId);
      assert.equal(row!.slug, slug);
      assert.equal(row!.label, label);
      assert.equal(row!.displayName, displayName);
      assert.deepEqual(new Uint8Array(row!.codeHash), codeHashValue);
      assert.equal(row!.codeVersion, 1);
      assert.equal(row!.revokedAt, null);
      // A private experiment's reviewer has no display name.
      const plain = await sandbox.makeCode(db(), viewer, {
        slug,
        label: "Ben",
        displayName: null,
        codeHash: hash(),
      });
      assert.equal(
        (await reviewerRow((plain as { reviewerId: string }).reviewerId))!
          .displayName,
        null,
      );
      // One bare record row per code made.
      const records = await actionsOn(slug);
      assert.equal(records.length, 2);
      for (const record of records)
        assertBareRecord(record, viewer, sandbox.CODE_ACTIONS.made, slug, [
          label,
          displayName,
          "Ben",
          reviewerId,
          Buffer.from(codeHashValue).toString("hex"),
        ]);
      // An issued hash, on any slug, is taken: nothing written, nothing recorded.
      for (const [onSlug, takenHash] of [
        [slug, codeHashValue],
        [slug, codeHash(w.b.code)],
      ] as const) {
        assert.deepEqual(
          await sandbox.makeCode(db(), viewer, {
            slug: onSlug,
            label: "Again",
            displayName: null,
            codeHash: takenHash,
          }),
          { taken: true },
        );
      }
      assert.equal(await reviewerCount(slug), 2);
      assert.equal((await actionsOn(slug)).length, 2);
      // Malformed input is refused before any write.
      const good = { slug, label: "Cy", displayName: null, codeHash: hash() };
      for (const bad of [
        { ...good, slug: "Not A Slug" },
        { ...good, label: "" },
        { ...good, label: " Cy" },
        { ...good, label: "x".repeat(501) },
        { ...good, displayName: "" },
        { ...good, displayName: 7 },
        { ...good, codeHash: new Uint8Array(31) },
        { ...good, codeHash: "abc" },
      ])
        await assert.rejects(
          sandbox.makeCode(db(), viewer, bad as never),
          refusedWith(CODES_INPUT_INVALID),
        );
      assert.equal(await reviewerCount(slug), 2);
    });
  };

  // --- replaceCode ---------------------------------------------------------

  const replaceAsTeam = (kind: "developer" | "admin") => async (w: World) => {
    const viewer = viewerFor(w, kind) as TeamViewer;
    await onScratchSlug(w, async (slug) => {
      const label = `cy-${w.run}@example.test`;
      const made = (await sandbox.makeCode(db(), viewer, {
        slug,
        label,
        displayName: null,
        codeHash: hash(),
      })) as { reviewerId: string };
      const next = hash();
      assert.deepEqual(
        await sandbox.replaceCode(db(), viewer, {
          slug,
          reviewerId: made.reviewerId,
          codeHash: next,
        }),
        { codeVersion: 2 },
      );
      const row = await reviewerRow(made.reviewerId);
      assert.deepEqual(new Uint8Array(row!.codeHash), next);
      // A revoked code is brought back by a replace.
      await sandbox.revokeCode(db(), viewer, {
        slug,
        reviewerId: made.reviewerId,
      });
      assert.deepEqual(
        await sandbox.replaceCode(db(), viewer, {
          slug,
          reviewerId: made.reviewerId,
          codeHash: hash(),
        }),
        { codeVersion: 3 },
      );
      assert.equal((await reviewerRow(made.reviewerId))!.revokedAt, null);
      // A reviewer id from another slug matches nothing, and changes nothing.
      const a1Before = await reviewerRow(w.a1.viewer.reviewerId);
      assert.equal(
        await sandbox.replaceCode(db(), viewer, {
          slug,
          reviewerId: w.a1.viewer.reviewerId,
          codeHash: hash(),
        }),
        null,
      );
      assert.equal(
        await sandbox.replaceCode(db(), viewer, {
          slug: w.slugB,
          reviewerId: w.a1.viewer.reviewerId,
          codeHash: hash(),
        }),
        null,
      );
      assert.deepEqual(await reviewerRow(w.a1.viewer.reviewerId), a1Before);
      // An issued hash is taken; nothing changes.
      assert.deepEqual(
        await sandbox.replaceCode(db(), viewer, {
          slug,
          reviewerId: made.reviewerId,
          codeHash: codeHash(w.a2.code),
        }),
        { taken: true },
      );
      assert.equal((await reviewerRow(made.reviewerId))!.codeVersion, 3);
      // Records: made, replaced, revoked, replaced; bare.
      const records = await actionsOn(slug);
      assert.deepEqual(
        records.map((r) => r.action).sort(),
        [
          sandbox.CODE_ACTIONS.made,
          sandbox.CODE_ACTIONS.replaced,
          sandbox.CODE_ACTIONS.replaced,
          sandbox.CODE_ACTIONS.revoked,
        ].sort(),
      );
      for (const record of records)
        assertBareRecord(record, viewer, record.action, slug, [
          label,
          made.reviewerId,
          Buffer.from(next).toString("hex"),
        ]);
      for (const reviewerId of ["not-a-uuid", "", 7 as never])
        await assert.rejects(
          sandbox.replaceCode(db(), viewer, {
            slug,
            reviewerId,
            codeHash: hash(),
          }),
          refusedWith(CODES_INPUT_INVALID),
        );
    });
  };

  // --- revokeCode ----------------------------------------------------------

  const revokeAsTeam = (kind: "developer" | "admin") => async (w: World) => {
    const viewer = viewerFor(w, kind) as TeamViewer;
    await onScratchSlug(w, async (slug) => {
      const made = (await sandbox.makeCode(db(), viewer, {
        slug,
        label: "Dee",
        displayName: null,
        codeHash: hash(),
      })) as { reviewerId: string };
      assert.deepEqual(
        await sandbox.revokeCode(db(), viewer, {
          slug,
          reviewerId: made.reviewerId,
        }),
        { revoked: true },
      );
      const first = (await reviewerRow(made.reviewerId))!.revokedAt;
      assert.ok(first instanceof Date);
      // Again: the same answer, the first instant kept, no second record.
      assert.deepEqual(
        await sandbox.revokeCode(db(), viewer, {
          slug,
          reviewerId: made.reviewerId,
        }),
        { revoked: true },
      );
      assert.deepEqual((await reviewerRow(made.reviewerId))!.revokedAt, first);
      const revoked = (await actionsOn(slug)).filter(
        (r) => r.action === sandbox.CODE_ACTIONS.revoked,
      );
      assert.equal(revoked.length, 1);
      assertBareRecord(
        revoked[0]!,
        viewer,
        sandbox.CODE_ACTIONS.revoked,
        slug,
        ["Dee", made.reviewerId],
      );
      // Another slug's reviewer is out of reach from this slug.
      assert.equal(
        await sandbox.revokeCode(db(), viewer, {
          slug,
          reviewerId: w.a1.viewer.reviewerId,
        }),
        null,
      );
      assert.equal(
        (await reviewerRow(w.a1.viewer.reviewerId))!.revokedAt,
        null,
      );
      await assert.rejects(
        sandbox.revokeCode(db(), viewer, { slug, reviewerId: "x" }),
        refusedWith(CODES_INPUT_INVALID),
      );
    });
  };

  return {
    listCodes: {
      group: "viewer",
      criteria: ["LAB-15 C8"],
      byViewer: {
        ...byReviewer((w, viewer) =>
          sandbox.listCodes(db(), viewer, { slug: w.slugA }),
        ),
        developer: listAsTeam("developer"),
        admin: listAsTeam("admin"),
      },
    },
    makeCode: {
      group: "viewer",
      criteria: ["LAB-15 C8"],
      byViewer: {
        ...byReviewer((w, viewer) =>
          sandbox.makeCode(db(), viewer, {
            slug: w.slugA,
            label: "Mallory",
            displayName: null,
            codeHash: hash(),
          }),
        ),
        developer: makeAsTeam("developer"),
        admin: makeAsTeam("admin"),
      },
    },
    replaceCode: {
      group: "viewer",
      criteria: ["LAB-15 C8"],
      byViewer: {
        ...byReviewer((w, viewer) =>
          sandbox.replaceCode(db(), viewer, {
            slug: w.slugA,
            reviewerId:
              viewer.kind === "reviewer"
                ? viewer.reviewerId
                : w.a1.viewer.reviewerId,
            codeHash: hash(),
          }),
        ),
        developer: replaceAsTeam("developer"),
        admin: replaceAsTeam("admin"),
      },
    },
    revokeCode: {
      group: "viewer",
      criteria: ["LAB-15 C8"],
      byViewer: {
        ...byReviewer((w, viewer) =>
          sandbox.revokeCode(db(), viewer, {
            slug: viewer.kind === "reviewer" ? viewer.slug : w.slugA,
            reviewerId:
              viewer.kind === "reviewer"
                ? viewer.reviewerId
                : w.a1.viewer.reviewerId,
          }),
        ),
        developer: revokeAsTeam("developer"),
        admin: revokeAsTeam("admin"),
      },
    },
    CODE_ACTIONS: {
      group: "support",
      criteria: ["LAB-15 C8"],
      cases: {
        "names the three code actions in the record's kebab-case, which recordAction accepts":
          async (w) => {
            assert.deepEqual(Object.values(sandbox.CODE_ACTIONS), [
              "code-made",
              "code-replaced",
              "code-revoked",
            ]);
            assert.ok(Object.isFrozen(sandbox.CODE_ACTIONS));
            const slug = `iso-codes-${w.run}-names`;
            try {
              for (const action of Object.values(sandbox.CODE_ACTIONS))
                await sandbox.recordAction(db(), w.admin, { action, slug });
              assert.equal((await actionsOn(slug)).length, 3);
            } finally {
              await db()
                .delete(sandboxActions)
                .where(and(eq(sandboxActions.slug, slug)));
            }
          },
      },
    },
  };
}
