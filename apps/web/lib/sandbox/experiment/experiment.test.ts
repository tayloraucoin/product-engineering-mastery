import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

import type { ReviewerDesigns, ReviewerViewer } from "@pem/db/sandbox";

import type { ExperimentConfig } from "../../../app/experimental/_experiments/registry.ts";
import { EXPERIMENT_STATE_KEYS } from "../client/experiment-view.ts";
import type { ViewerResult } from "../shared/access-check.ts";
import { readSandboxState, SANDBOX_STATE_KEYS } from "../shared/state.ts";
import {
  drawFirstDesign,
  experimentDepsFor,
  openingDesignWith,
  recordViewWith,
  type OpeningDeps,
  type RandomInt,
  type RecordViewDeps,
} from "./experiment.ts";

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
  reviewerId: "00000000-0000-4000-8000-0000000000b1",
  accessId: "00000000-0000-4000-8000-0000000000a1",
};

/** A seeded generator (mulberry32): the same seed gives the same draws. */
function seeded(seed: number): RandomInt {
  let a = seed >>> 0;
  return (max) => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const unit = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return Math.floor(unit * max);
  };
}

/** One reviewer row in memory, kept as the database keeps it. */
function memoryReviewer(randomInt: RandomInt = seeded(1)) {
  const row: ReviewerDesigns = {
    firstDesign: null,
    lastDesign: null,
    hasSent: false,
  };
  const calls = { read: 0, claim: 0 };
  const deps: OpeningDeps = {
    readReviewerDesigns: async () => {
      calls.read++;
      return { ...row };
    },
    claimFirstDesign: async (_viewer, design) => {
      calls.claim++;
      row.firstDesign ??= design;
      return row.firstDesign;
    },
    randomInt,
  };
  /** What recordViewEvent does to the row. */
  const view = (design: string) => {
    row.lastDesign = design;
  };
  return { row, calls, deps, view };
}

const visit = (deps: OpeningDeps, request = {}) =>
  openingDesignWith(
    deps,
    { kind: "reviewer", viewer: REVIEWER },
    CONFIG,
    request,
  );

/** Database deps that fail the test when reached. */
const NO_DATABASE: OpeningDeps = {
  readReviewerDesigns: () => {
    throw new Error("the database was read");
  },
  claimFirstDesign: () => {
    throw new Error("the database was written");
  },
  randomInt: () => {
    throw new Error("a design was drawn");
  },
};

describe("C1: the first design is drawn once, stored, and reopened", () => {
  test("C1: a first visit draws, stores and renders a design; a reload renders it again", async () => {
    // A generator fixed on index 1 draws "square".
    const reviewer = memoryReviewer(() => 1);
    const first = await visit(reviewer.deps);
    assert.equal(first.shown, "square");
    assert.equal(reviewer.row.firstDesign, "square");
    assert.deepEqual(first.order, ["square", "circle"]);
    assert.equal(first.counted, true);
    assert.equal(first.primary, "finish");
    reviewer.view(first.shown); // the load event sets last_design

    // A reload draws nothing new: the generator now points elsewhere.
    reviewer.deps.randomInt = () => 0;
    const reload = await visit(reviewer.deps);
    assert.equal(reload.shown, "square");
    assert.deepEqual(reload.order, ["square", "circle"]);
    assert.equal(reviewer.calls.claim, 1);
  });

  test("C1: after a switch the next load opens on the last design, in the same order", async () => {
    const reviewer = memoryReviewer(() => 0);
    const first = await visit(reviewer.deps);
    assert.equal(first.shown, "circle");
    reviewer.view("circle");
    reviewer.view("square"); // a switch
    const next = await visit(reviewer.deps);
    assert.equal(next.shown, "square");
    assert.deepEqual(next.order, ["circle", "square"]);
  });

  test("C1: a ?design= link is ignored on the first visit and honoured after it", async () => {
    const reviewer = memoryReviewer(() => 0);
    const first = await visit(reviewer.deps, {
      design: "square",
      from: "review",
    });
    assert.equal(first.shown, "circle");
    reviewer.view("circle");
    const later = await visit(reviewer.deps, {
      design: "square",
      from: "review",
    });
    assert.equal(later.shown, "square");
    assert.equal(later.primary, "back");
    // An unknown design is ignored: the last design opens.
    const unknown = await visit(reviewer.deps, { design: "hexagon" });
    assert.equal(unknown.shown, "circle");
  });

  test("C1: a reviewer who has sent sees Edit your review", async () => {
    const reviewer = memoryReviewer(() => 0);
    reviewer.row.firstDesign = "circle";
    reviewer.row.hasSent = true;
    assert.equal((await visit(reviewer.deps)).primary, "edit");
  });

  test("C1: a claim that loses the race renders the stored design, not its own draw", async () => {
    const reviewer = memoryReviewer(() => 1);
    // Another first visit claimed "circle" between this one's read and claim.
    const deps: OpeningDeps = {
      ...reviewer.deps,
      readReviewerDesigns: async () => ({
        firstDesign: null,
        lastDesign: null,
        hasSent: false,
      }),
      claimFirstDesign: async () => "circle",
    };
    const opening = await visit(deps);
    assert.equal(opening.shown, "circle");
    assert.deepEqual(opening.order, ["circle", "square"]);
  });
});

describe("C3: the draw is uniform, and crypto.randomInt by default", () => {
  test("C3: over 1,000 first visits from a seeded generator, each of 2 designs is first 50% ± 5%", async () => {
    const random = seeded(20261006);
    const tally = { circle: 0, square: 0 };
    for (let i = 0; i < 1000; i++) {
      const reviewer = memoryReviewer(random);
      const { shown } = await visit(reviewer.deps);
      tally[shown as keyof typeof tally]++;
    }
    for (const count of Object.values(tally)) {
      assert.ok(count >= 450 && count <= 550, JSON.stringify(tally));
    }
  });

  test("C3: drawFirstDesign takes the generator's index over the design count", () => {
    const seen: number[] = [];
    const ids = ["circle", "square", "triangle"];
    const designs = ids.map((id) => ({ id }));
    for (const index of [0, 1, 2])
      assert.equal(
        drawFirstDesign(designs, (max) => {
          seen.push(max);
          return index;
        }),
        ids[index],
      );
    assert.deepEqual(seen, [3, 3, 3]);
    assert.throws(() => drawFirstDesign(designs, () => 3), RangeError);
  });

  test("C3: the default draw is crypto.randomInt over the design count, with no Math.random", () => {
    const source = readFileSync(
      new URL("./experiment.ts", import.meta.url),
      "utf8",
    );
    assert.match(
      source,
      /import \{ randomInt as cryptoRandomInt \} from "node:crypto";/,
    );
    assert.match(source, /randomInt: \(max\) => cryptoRandomInt\(max\)/);
    assert.doesNotMatch(source, /Math\.random\(/);
    const { randomInt } = experimentDepsFor(() => {
      throw new Error("the database was reached");
    });
    const draws = new Set<number>();
    for (let i = 0; i < 400; i++) {
      const n = randomInt(2);
      assert.ok(n === 0 || n === 1);
      draws.add(n);
    }
    assert.deepEqual([...draws].sort(), [0, 1]);
  });
});

describe("C5: the team writes nothing", () => {
  const TEAM: ViewerResult = {
    kind: "team",
    viewer: {
      kind: "team",
      userId: "00000000-0000-4000-8000-0000000000c1",
      email: "taylor@example.com",
      role: "developer",
    },
    experiment: CONFIG,
  };
  const throwingWrite: RecordViewDeps["recordViewEvent"] = () => {
    throw new Error("a view was written");
  };

  for (const role of ["developer", "admin"] as const) {
    test(`C5: a ${role} loading, reloading and switching never calls the database`, async () => {
      const team: ViewerResult = {
        ...TEAM,
        viewer: { ...(TEAM as { viewer: object }).viewer, role } as never,
      };
      // Loading and reloading: the opening reads, claims and draws nothing.
      for (let i = 0; i < 2; i++) {
        const opening = await openingDesignWith(
          NO_DATABASE,
          { kind: "team" },
          CONFIG,
          {},
        );
        assert.equal(opening.shown, "circle");
        assert.deepEqual(opening.order, ["circle", "square"]);
        assert.equal(opening.counted, false);
      }
      // A named design opens for the team, still with nothing read.
      assert.equal(
        (
          await openingDesignWith(NO_DATABASE, { kind: "team" }, CONFIG, {
            design: "square",
          })
        ).shown,
        "square",
      );
      // The view action, called for a load, a reload and a switch.
      const deps: RecordViewDeps = {
        resolveViewer: async () => team,
        recordViewEvent: throwingWrite,
      };
      for (const input of [
        { kind: "load", design: "circle" },
        { kind: "load", design: "circle" },
        { kind: "switch", design: "square" },
      ])
        assert.deepEqual(await recordViewWith(deps, SLUG, input), {
          kind: "not-counted",
        });
    });
  }

  test("C5: a closed experiment (ended) and the gate write nothing", async () => {
    for (const result of [
      { kind: "ended", viewer: REVIEWER, experiment: CONFIG },
      { kind: "gate" },
      { kind: "not-found" },
    ] as ViewerResult[])
      assert.deepEqual(
        await recordViewWith(
          { resolveViewer: async () => result, recordViewEvent: throwingWrite },
          SLUG,
          { kind: "load", design: "circle" },
        ),
        { kind: "not-counted" },
      );
  });

  test("C5: a reviewer's load is written once; a design outside the config and malformed input are not", async () => {
    const written: unknown[] = [];
    const deps: RecordViewDeps = {
      resolveViewer: async () => ({
        kind: "reviewer",
        viewer: REVIEWER,
        experiment: CONFIG,
      }),
      recordViewEvent: async (viewer, input) => {
        written.push({ viewer, input });
      },
    };
    assert.deepEqual(
      await recordViewWith(deps, SLUG, { kind: "load", design: "circle" }),
      { kind: "recorded" },
    );
    assert.deepEqual(written, [
      { viewer: REVIEWER, input: { kind: "load", design: "circle" } },
    ]);
    for (const [slug, input] of [
      [SLUG, { kind: "load", design: "hexagon" }],
      [SLUG, { kind: "scroll", design: "circle" }],
      [SLUG, null],
      ["Not A Slug", { kind: "load", design: "circle" }],
      [42, { kind: "load", design: "circle" }],
    ] as const)
      assert.deepEqual(await recordViewWith(deps, slug, input), {
        kind: "invalid",
      });
    assert.equal(written.length, 1);
    // A failed write is reported, never thrown at the page.
    assert.deepEqual(
      await recordViewWith(
        {
          ...deps,
          recordViewEvent: async () => Promise.reject(new Error("x")),
        },
        SLUG,
        { kind: "switch", design: "square" },
      ),
      { kind: "failed" },
    );
  });
});

describe("C11 (unit): every experiment.md state key is the team's", () => {
  test("each exp-* key registers as team-only and renders for no reviewer or guest", () => {
    assert.equal(EXPERIMENT_STATE_KEYS.length, 11);
    for (const key of EXPERIMENT_STATE_KEYS) {
      assert.equal(SANDBOX_STATE_KEYS[key], "team", key);
      assert.equal(readSandboxState(key, "team"), key);
      assert.equal(readSandboxState(key, "reviewer"), null);
      assert.equal(readSandboxState(key, "guest"), null);
    }
    const registered = Object.keys(SANDBOX_STATE_KEYS).filter((k) =>
      k.startsWith("exp-"),
    );
    assert.deepEqual(registered.sort(), [...EXPERIMENT_STATE_KEYS].sort());
  });
});
