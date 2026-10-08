/**
 * LAB-25's thread actions behind their deps seam: C7's mode read from the
 * registry by slug, never from the request, and the fixed results for a
 * closed, revoked or unknown slug. Stubs that throw when called prove
 * nothing is read or written where nothing may be.
 */

import assert from "node:assert/strict";
import { describe, test } from "node:test";

import type { ReviewerViewer, TeamViewer } from "@pem/db/sandbox";

import type { ExperimentConfig } from "../../app/experimental/_experiments/registry.ts";
import type { ViewerResult } from "./access-check.ts";
import {
  deleteReplyWith,
  listRepliesWith,
  listThreadWith,
  saveReplyWith,
  type ThreadsDeps,
} from "./threads.ts";

const SLUG = "pricing-2026";
const loader = async () => () => null;
const config = (mode: "private" | "collaborate") =>
  ({
    slug: SLUG,
    title: "Pricing page, 2026",
    designs: [{ id: "circle", shape: "circle", component: loader }],
    goals: ["One", "Two"],
    questions: [],
    mode,
    coreVersion: "v1",
    closedOn: null,
  }) as ExperimentConfig;

const REVIEWER: ReviewerViewer = {
  kind: "reviewer",
  slug: SLUG,
  reviewerId: "6f1c1f9e-1111-4111-8111-111111111111",
  accessId: "6f1c1f9e-2222-4222-8222-222222222222",
};
const TEAM: TeamViewer = {
  kind: "team",
  userId: "6f1c1f9e-3333-4333-8333-333333333333",
  email: "taylor@example.com",
  role: "developer",
};

const REPLY = {
  id: "0b7b0c1e-0000-4000-8000-000000000001",
  parentId: "0b7b0c1e-0000-4000-8000-000000000002",
  body: "Agreed, the annual toggle is hard to find.",
  clientCreatedAt: "2026-10-07T10:00:00.000Z",
};
const ROOT = { rootId: REPLY.parentId };

const never = (name: string) => async () => {
  throw new Error(`${name} must not be called`);
};

/** Deps where nothing may be called, then the overrides. */
function deps(overrides: Partial<ThreadsDeps>): ThreadsDeps {
  return {
    resolveViewer: never("resolveViewer"),
    findExperiment: () => {
      throw new Error("findExperiment must not be called");
    },
    listThread: never("listThread"),
    listTeamThread: never("listTeamThread"),
    listReplies: never("listReplies"),
    listTeamReplies: never("listTeamReplies"),
    saveReply: never("saveReply"),
    deleteReply: never("deleteReply"),
    ...overrides,
  };
}

/** The request resolves with a collaborate experiment attached; the registry says private. */
function privateRegistry(viewer: "reviewer" | "team") {
  const looked: string[] = [];
  const calls: { name: string; viewer: unknown; input: unknown }[] = [];
  const record =
    (name: string, value: unknown = []) =>
    async (v: unknown, input: unknown) => {
      calls.push({ name, viewer: v, input });
      return value as never;
    };
  const resolved: ViewerResult =
    viewer === "reviewer"
      ? {
          kind: "reviewer",
          viewer: REVIEWER,
          experiment: config("collaborate"),
        }
      : { kind: "team", viewer: TEAM, experiment: config("collaborate") };
  return {
    looked,
    calls,
    deps: deps({
      resolveViewer: async () => resolved,
      findExperiment: (slug) => {
        looked.push(slug);
        return config("private");
      },
      listThread: record("listThread"),
      listTeamThread: record("listTeamThread"),
      listReplies: record("listReplies"),
      listTeamReplies: record("listTeamReplies"),
      saveReply: record("saveReply", "not-saved"),
      deleteReply: record("deleteReply", undefined),
    }),
  };
}

describe("C7: the thread actions take the mode from the registry by slug", () => {
  test("a reviewer's read, replies and save reach the database as private, with no slug of their own", async () => {
    const world = privateRegistry("reviewer");
    assert.deepEqual(await listThreadWith(world.deps, SLUG), {
      kind: "ok",
      face: "reviewer",
      threads: [],
    });
    await listRepliesWith(world.deps, SLUG, ROOT);
    assert.deepEqual(await saveReplyWith(world.deps, SLUG, REPLY), {
      kind: "not-saved",
    });
    assert.deepEqual(world.looked, [SLUG, SLUG, SLUG]);
    assert.deepEqual(
      world.calls.map((c) => [c.name, c.viewer, c.input]),
      [
        ["listThread", REVIEWER, { mode: "private" }],
        ["listReplies", REVIEWER, { mode: "private", rootId: ROOT.rootId }],
        [
          "saveReply",
          REVIEWER,
          {
            ...REPLY,
            clientCreatedAt: new Date(REPLY.clientCreatedAt),
            mode: "private",
          },
        ],
      ],
    );
  });

  test("the team's calls carry the route's slug and the registry's mode", async () => {
    const world = privateRegistry("team");
    await listThreadWith(world.deps, SLUG);
    await listRepliesWith(world.deps, SLUG, ROOT);
    await saveReplyWith(world.deps, SLUG, REPLY);
    assert.deepEqual(
      world.calls.map((c) => [c.name, c.input]),
      [
        ["listTeamThread", { mode: "private", slug: SLUG }],
        [
          "listTeamReplies",
          { mode: "private", slug: SLUG, rootId: ROOT.rootId },
        ],
        [
          "saveReply",
          {
            ...REPLY,
            clientCreatedAt: new Date(REPLY.clientCreatedAt),
            mode: "private",
            slug: SLUG,
          },
        ],
      ],
    );
  });

  test("a request that names a mode, a slug or a design is refused before the database", async () => {
    const world = privateRegistry("reviewer");
    for (const extra of [
      { mode: "collaborate" },
      { slug: "other-review" },
      { design: "circle" },
    ]) {
      assert.deepEqual(
        await saveReplyWith(world.deps, SLUG, { ...REPLY, ...extra }),
        { kind: "not-saved" },
      );
      assert.deepEqual(
        await listRepliesWith(world.deps, SLUG, { ...ROOT, ...extra }),
        { kind: "failed" },
      );
    }
    assert.deepEqual(world.calls, []);
  });

  test("a slug the registry no longer holds is refused before the database", async () => {
    const d = deps({
      resolveViewer: async () => ({
        kind: "reviewer",
        viewer: REVIEWER,
        experiment: config("collaborate"),
      }),
      findExperiment: () => null,
    });
    assert.deepEqual(await listThreadWith(d, SLUG), { kind: "failed" });
    assert.deepEqual(await saveReplyWith(d, SLUG, REPLY), {
      kind: "not-saved",
    });
  });
});

describe("the thread actions' fixed results", () => {
  const outcomes: [ViewerResult, string, string][] = [
    [
      { kind: "ended", viewer: REVIEWER, experiment: config("collaborate") },
      "closed",
      "closed",
    ],
    [{ kind: "gate" }, "revoked", "revoked"],
    [{ kind: "not-found" }, "failed", "not-saved"],
  ];
  for (const [resolved, read, write] of outcomes)
    test(`${resolved.kind}: reads are ${read}, writes are ${write}, and nothing is called`, async () => {
      const d = deps({ resolveViewer: async () => resolved });
      assert.deepEqual(await listThreadWith(d, SLUG), { kind: read });
      assert.deepEqual(await listRepliesWith(d, SLUG, ROOT), { kind: read });
      assert.deepEqual(await saveReplyWith(d, SLUG, REPLY), { kind: write });
      assert.deepEqual(await deleteReplyWith(d, SLUG, { id: REPLY.id }), {
        kind: write,
      });
    });

  test("malformed input and a bad slug are refused with no call", async () => {
    const d = deps({});
    for (const bad of [
      { ...REPLY, id: "nope" },
      { ...REPLY, body: "   " },
      { ...REPLY, body: "x".repeat(2001) },
      { ...REPLY, clientCreatedAt: "yesterday" },
    ])
      assert.deepEqual(await saveReplyWith(d, SLUG, bad), {
        kind: "not-saved",
      });
    assert.deepEqual(await saveReplyWith(d, "Not A Slug", REPLY), {
      kind: "not-saved",
    });
    assert.deepEqual(await deleteReplyWith(d, SLUG, { id: "nope" }), {
      kind: "not-saved",
    });
    assert.deepEqual(await listThreadWith(d, "../x"), { kind: "failed" });
  });

  test("a thrown error is not-saved or failed, and echoes nothing", async () => {
    const d = deps({
      resolveViewer: async () => ({
        kind: "reviewer",
        viewer: REVIEWER,
        experiment: config("collaborate"),
      }),
      findExperiment: () => config("collaborate"),
      listThread: async () => {
        throw new Error(`insert failed: ${REPLY.body}`);
      },
      saveReply: async () => {
        throw new Error(`insert failed: ${REPLY.body}`);
      },
    });
    assert.deepEqual(await listThreadWith(d, SLUG), { kind: "failed" });
    assert.deepEqual(await saveReplyWith(d, SLUG, REPLY), {
      kind: "not-saved",
    });
  });

  test("a collaborate read is sent to the browser with ISO times, removed roots kept", async () => {
    const at = new Date("2026-10-07T10:00:00.000Z");
    const d = deps({
      resolveViewer: async () => ({
        kind: "reviewer",
        viewer: REVIEWER,
        experiment: config("collaborate"),
      }),
      findExperiment: () => config("collaborate"),
      listThread: async (_viewer, input) => {
        assert.deepEqual(input, { mode: "collaborate" });
        const reply = {
          id: REPLY.id,
          parentId: REPLY.parentId,
          body: "Same here.",
          createdAt: at,
          author: { reviewer: "Ana R." },
        };
        return [
          {
            id: REPLY.parentId,
            design: "circle",
            anchor: { id: "hero", x: 0.5, y: 0.5 },
            createdAt: at,
            removed: true,
            replies: [reply],
          },
        ];
      },
    });
    assert.deepEqual(await listThreadWith(d, SLUG), {
      kind: "ok",
      face: "reviewer",
      threads: [
        {
          id: REPLY.parentId,
          design: "circle",
          anchor: { id: "hero", x: 0.5, y: 0.5 },
          createdAt: at.toISOString(),
          removed: true,
          replies: [
            {
              id: REPLY.id,
              parentId: REPLY.parentId,
              body: "Same here.",
              createdAt: at.toISOString(),
              author: { reviewer: "Ana R." },
            },
          ],
        },
      ],
    });
  });
});
