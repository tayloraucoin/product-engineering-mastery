/**
 * LAB-12's actions behind their deps seam: C9's closed and revoked results,
 * C4's taken id answered as not-saved, C1's design tag checked against the
 * config, and the fixed results that never echo input. Stubs that throw when
 * called prove nothing is written where nothing may be. Also the nine pins
 * keys in state.ts, for the team only.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

import type { ReviewerViewer, SaveCommentInput } from "@pem/db/sandbox";

import type { ExperimentConfig } from "../../app/experimental/_experiments/registry.ts";
import type { ViewerResult } from "./access-check.ts";
import { PINS_STATE_KEYS } from "./client/pins-view.ts";
import {
  deleteCommentWith,
  listMyCommentsWith,
  saveCommentWith,
  type CommentsDeps,
} from "./comments.ts";
import { readSandboxState } from "./state.ts";

const SLUG = "pricing-2026";
const loader = async () => () => null;
const CONFIG = {
  slug: SLUG,
  title: "Pricing page, 2026",
  designs: [
    { id: "circle", shape: "circle", component: loader },
    { id: "square", shape: "square", component: loader },
  ],
  goals: ["One", "Two"],
  questions: [],
  mode: "private",
  coreVersion: "v1",
  closedOn: null,
} as ExperimentConfig;

const REVIEWER: ReviewerViewer = {
  kind: "reviewer",
  slug: SLUG,
  reviewerId: "6f1c1f9e-1111-4111-8111-111111111111",
  accessId: "6f1c1f9e-2222-4222-8222-222222222222",
};

const PIN = {
  id: "0b7b0c1e-0000-4000-8000-000000000001",
  number: 4,
  design: "square",
  kind: "problem",
  body: "ana@example.com says the annual toggle is hidden.",
  anchor: { marked: "compare", x: 0.2, y: 0.4, place: "Comparison table" },
  viewportW: 390,
  viewportH: 844,
  clientCreatedAt: "2026-10-07T10:00:00.000Z",
};

const throwing = async (): Promise<never> => {
  throw new Error("must not be called");
};

function deps(
  result: ViewerResult,
  overrides: Partial<CommentsDeps> = {},
): CommentsDeps & { saved: SaveCommentInput[] } {
  const saved: SaveCommentInput[] = [];
  return {
    saved,
    resolveViewer: async () => result,
    listMyComments: async () => [],
    saveComment: async (_viewer, input) => {
      saved.push(input);
      return "saved";
    },
    deleteComment: async () => undefined,
    ...overrides,
  };
}

const reviewer: ViewerResult = {
  kind: "reviewer",
  viewer: REVIEWER,
  experiment: CONFIG,
};

describe("C9: a send answered closed or revoked", () => {
  const cases: [ViewerResult, "closed" | "revoked"][] = [
    [{ kind: "ended", viewer: REVIEWER, experiment: CONFIG }, "closed"],
    [{ kind: "gate" }, "revoked"],
  ];
  for (const [result, kind] of cases) {
    test(`is ${kind}, and nothing is stored or deleted`, async () => {
      const d = deps(result, {
        saveComment: throwing,
        deleteComment: throwing,
        listMyComments: throwing,
      });
      assert.deepEqual(await saveCommentWith(d, SLUG, PIN), { kind });
      assert.deepEqual(await deleteCommentWith(d, SLUG, { id: PIN.id }), {
        kind,
      });
      assert.deepEqual(await listMyCommentsWith(d, SLUG), { kind });
    });
  }
});

describe("the save's fixed results", () => {
  test("a reviewer's pin is stored with its design tag and its time as a date", async () => {
    const d = deps(reviewer);
    assert.deepEqual(await saveCommentWith(d, SLUG, PIN), { kind: "ok" });
    assert.equal(d.saved.length, 1);
    assert.equal(d.saved[0]!.design, "square");
    assert.equal(d.saved[0]!.id, PIN.id);
    assert.ok(d.saved[0]!.clientCreatedAt instanceof Date);
  });

  test("C4: an id held by someone else is taken, answered as the fixed not-saved", async () => {
    const d = deps(reviewer, { saveComment: async () => "taken" });
    assert.deepEqual(await saveCommentWith(d, SLUG, PIN), {
      kind: "not-saved",
    });
  });

  test("C8: past the cap is limit", async () => {
    const d = deps(reviewer, { saveComment: async () => "limit" });
    assert.deepEqual(await saveCommentWith(d, SLUG, PIN), { kind: "limit" });
  });

  test("the team and an unknown slug store nothing: team notes are LAB-14's", async () => {
    for (const result of [
      {
        kind: "team",
        viewer: {
          kind: "team",
          userId: "u",
          email: "t@example.com",
          role: "admin",
        },
        experiment: CONFIG,
      },
      { kind: "not-found" },
    ] as ViewerResult[]) {
      const d = deps(result, {
        saveComment: throwing,
        deleteComment: throwing,
      });
      assert.deepEqual(await saveCommentWith(d, SLUG, PIN), {
        kind: "not-saved",
      });
      assert.deepEqual(await deleteCommentWith(d, SLUG, { id: PIN.id }), {
        kind: "not-saved",
      });
    }
  });

  test("a design outside the config, malformed input and a bad slug are not-saved, with no call and no echo", async () => {
    const d = deps(reviewer, { saveComment: throwing });
    for (const [slug, input] of [
      [SLUG, { ...PIN, design: "triangle" }],
      [SLUG, { ...PIN, id: "not-a-uuid" }],
      [SLUG, { ...PIN, body: "x".repeat(2001) }],
      [SLUG, { ...PIN, body: "   " }],
      [SLUG, { ...PIN, kind: "praise" }],
      [SLUG, { ...PIN, anchor: { x: 0.5, y: 0.5 } }],
      [SLUG, { ...PIN, anchor: { marked: "a", x: 2, y: 0 } }],
      [SLUG, { ...PIN, email: "ana@example.com" }],
      [SLUG, null],
      ["Not A Slug", PIN],
    ] as [unknown, unknown][]) {
      const result = await saveCommentWith(d, slug, input);
      assert.deepEqual(result, { kind: "not-saved" });
      assert.ok(!JSON.stringify(result).includes("ana@"));
    }
  });

  test("a store that throws is not-saved, and its error never reaches the result", async () => {
    const d = deps(reviewer, {
      saveComment: async () => {
        throw new Error(`duplicate key ${PIN.body}`);
      },
    });
    const result = await saveCommentWith(d, SLUG, PIN);
    assert.deepEqual(result, { kind: "not-saved" });
  });
});

describe("the load and the delete", () => {
  test("a reviewer's load returns their pins as the browser holds them", async () => {
    const created = new Date("2026-10-05T13:32:00Z");
    const d = deps(reviewer, {
      listMyComments: async () => [
        {
          id: PIN.id,
          number: 1,
          design: "circle",
          kind: null,
          body: "Clear.",
          anchor: { marked: "faq", x: 0.1, y: 0.1 },
          viewportW: 1440,
          viewportH: 900,
          clientCreatedAt: created,
          createdAt: created,
        },
      ],
    });
    assert.deepEqual(await listMyCommentsWith(d, SLUG), {
      kind: "ok",
      comments: [
        {
          id: PIN.id,
          number: 1,
          design: "circle",
          kind: null,
          body: "Clear.",
          anchor: { marked: "faq", x: 0.1, y: 0.1 },
          viewportW: 1440,
          viewportH: 900,
          clientCreatedAt: created.toISOString(),
          createdAt: created.toISOString(),
        },
      ],
    });
  });

  test("a failed load, the team's load and a bad slug are failed", async () => {
    assert.deepEqual(
      await listMyCommentsWith(
        deps(reviewer, { listMyComments: throwing }),
        SLUG,
      ),
      { kind: "failed" },
    );
    assert.deepEqual(
      await listMyCommentsWith(deps({ kind: "not-found" }), SLUG),
      {
        kind: "failed",
      },
    );
    assert.deepEqual(await listMyCommentsWith(deps(reviewer), "../x"), {
      kind: "failed",
    });
  });

  test("a delete takes the id only, and answers ok or not-saved", async () => {
    const ids: string[] = [];
    const d = deps(reviewer, {
      deleteComment: async (_viewer, input) => void ids.push(input.id),
    });
    assert.deepEqual(await deleteCommentWith(d, SLUG, { id: PIN.id }), {
      kind: "ok",
    });
    assert.deepEqual(ids, [PIN.id]);
    assert.deepEqual(await deleteCommentWith(d, SLUG, { id: "x" }), {
      kind: "not-saved",
    });
    assert.deepEqual(
      await deleteCommentWith(
        deps(reviewer, { deleteComment: throwing }),
        SLUG,
        {
          id: PIN.id,
        },
      ),
      { kind: "not-saved" },
    );
  });
});

describe("pins.md's ?state= keys", () => {
  test("all nine render for the team only", () => {
    for (const key of PINS_STATE_KEYS) {
      assert.equal(readSandboxState(key, "team"), key);
      assert.equal(readSandboxState(key, "reviewer"), null);
      assert.equal(readSandboxState(key, "guest"), null);
    }
  });

  test("the actions log fixed events only, never what the reviewer sent (source scan)", () => {
    const source = readFileSync(
      new URL("./comments-data.ts", import.meta.url),
      "utf8",
    );
    assert.deepEqual(
      [...source.matchAll(/log\.\w+\(\s*"([^"]+)"/g)].map((m) => m[1]),
      [
        "sandbox.comments_load_failed",
        "sandbox.comment_not_saved",
        "sandbox.comment_not_deleted",
      ],
    );
    assert.doesNotMatch(source, /log\.\w+\("[^"]+",/);
  });
});
