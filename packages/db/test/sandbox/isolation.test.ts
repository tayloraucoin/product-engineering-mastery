/**
 * The sandbox isolation suite (LAB-3, D-LAB-34), on the local database only
 * (`yarn test:db`). Every sandbox table is service-only, so isolation rests
 * on @pem/db/sandbox; this suite proves it. Each runtime export runs its
 * registered cases: a viewer function as every viewer kind, a gate function
 * through its named cases. The coverage guard fails for an export with no
 * case, so a surface ticket adds its cases with its function.
 */

import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { and, count, eq, sql } from "drizzle-orm";

import { ACTION_INPUT_INVALID } from "../../src/sandbox/actions.ts";
import {
  ACCESS_INPUT_INVALID,
  EMAIL_NOT_NORMALISED,
} from "../../src/sandbox/gate.ts";
import * as sandbox from "../../src/sandbox/index.ts";
import {
  NOT_A_TEAM_VIEWER,
  reviewerScope,
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

let database: TestDatabase;
let world: World;

before(async () => {
  database = await openSandboxTestDb();
  world = await buildWorld(database);
});

after(async () => {
  if (database) {
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
};

/** Registered cases for every runtime export of @pem/db/sandbox. */
const REGISTRY: Registry<World> = {
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
          ])
            await assert.rejects(
              sandbox.recordAction(db(), w.admin, input as never),
              refusedWith(ACTION_INPUT_INVALID),
            );
        },
    },
  },
};

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
    const synthetic = {
      covered: async () => null,
      uncovered: async () => null,
      halfCovered: async () => null,
    };
    const registry: Registry<null> = {
      covered: { group: "gate", cases: { "a case": () => {} } },
      halfCovered: {
        group: "viewer",
        byViewer: { developer: () => {} } as never,
      },
      gone: { group: "support", cases: { "a case": () => {} } },
    };
    assert.deepEqual(coverageProblems(synthetic, registry), [
      "uncovered has no isolation case",
      ...VIEWER_KINDS.filter((kind) => kind !== "developer").map(
        (kind) => `halfCovered has no case for the ${kind}`,
      ),
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
