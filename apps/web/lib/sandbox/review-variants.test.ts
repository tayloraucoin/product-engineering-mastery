/**
 * LAB-18's review with several designs, behind its seams: the choice locked
 * until every design is rated and its unlocking announced (C2), the order a
 * pure, unbiased function of slug and reviewer with the anchors last (C3),
 * nothing pre-selected (C4), a design never viewed disabled (C5), the
 * changed-after-choosing flag (C6), strength required and the follow-ups per
 * choice (C7), and the server's order and last design stored (C10).
 */

import assert from "node:assert/strict";
import { describe, test } from "node:test";

import type { ReviewerViewer } from "@pem/db/sandbox";

import type { ExperimentConfig } from "../../app/experimental/_experiments/registry.ts";
import type { ViewerResult } from "./access-check.ts";
import { designOption } from "./client/experiment-view.ts";
import {
  draftOf,
  emptyForm,
  formFromVersion,
  readDraft,
  requiredGaps,
  toPayload,
  variantDesigns,
  type ReviewForm,
} from "./client/review-form.ts";
import {
  blockersQuestion,
  CHOICE_ANCHORS,
  choiceLock,
  choiceOptions,
  chooseOption,
  emptyVariants,
  followUps,
  rateDesign,
  unlockAnnouncement,
  unviewed,
  VARIANTS_WORDS,
  type VariantsAnswers,
} from "./client/review-variants-form.ts";
import { reviewFixture, VARIANTS_STATE_KEYS } from "./client/review-view.ts";
import { designOrder, switcherOrder } from "./review-variants.ts";
import { sendReviewWith, type ReviewDeps } from "./review.ts";
import { readSandboxState } from "./state.ts";

const SLUG = "pricing-2026";
const loader = async () => () => null;
const DESIGNS = [
  { id: "circle", shape: "circle", component: loader },
  { id: "square", shape: "square", component: loader },
] as const;
const CONFIG = {
  slug: SLUG,
  title: "Pricing page, 2026",
  designs: DESIGNS,
  goals: ["A synthetic goal"],
  questions: [],
  mode: "private",
  coreVersion: "v1",
  closedOn: null,
} as unknown as ExperimentConfig;
const THREE = [
  ...DESIGNS,
  { id: "triangle", shape: "triangle", component: loader },
] as unknown as ExperimentConfig["designs"];

const LABELS = variantDesigns(CONFIG.designs);
const [CIRCLE, SQUARE] = LABELS as [(typeof LABELS)[0], (typeof LABELS)[0]];

const reviewer: ReviewerViewer = {
  kind: "reviewer",
  slug: SLUG,
  reviewerId: "00000000-0000-4000-8000-0000000000a1",
  accessId: "00000000-0000-4000-8000-0000000000b1",
};
const VERSION_ID = "00000000-0000-4000-8000-0000000000f1";

/** Every required answer given on two designs, with no comments. */
function complete(v: Partial<VariantsAnswers> = {}): ReviewForm {
  return {
    ...emptyForm(),
    blockersNone: true,
    nextStep: "approve",
    variants: {
      ...emptyVariants(),
      ratings: { circle: "very", square: "cant-judge" },
      choice: "square",
      strength: "clear",
      lastViewed: "square",
      ...v,
    },
  };
}

function send(form: ReviewForm) {
  return { versionId: VERSION_ID, ...toPayload(form, [], CONFIG.designs) };
}

/** A send's deps: the reviewer on an open experiment, the store recorded. */
function depsFor(viewer: ReviewerViewer = reviewer) {
  const saved: Parameters<ReviewDeps["saveReviewVersion"]>[1][] = [];
  const result: ViewerResult = {
    kind: "reviewer",
    viewer,
    experiment: CONFIG,
  };
  const deps: ReviewDeps = {
    resolveViewer: async () => result,
    listMyComments: async () => [],
    saveReviewVersion: async (_viewer, input) => {
      saved.push(input);
      return { number: saved.length, createdAt: new Date() };
    },
  };
  return { deps, saved };
}

describe("C2: the choice is locked until every design is rated", () => {
  test("C2: nothing rated reads 'Rate each design above to choose.'; one left names it", () => {
    assert.deepEqual(choiceLock(LABELS, {}), {
      locked: true,
      left: LABELS,
      line: "Rate each design above to choose.",
    });
    assert.equal(
      choiceLock(LABELS, { circle: "very" }).line,
      "Rate the ■ Square design above to choose.",
    );
  });

  test("C2: two left of three are both named", () => {
    assert.equal(
      choiceLock(variantDesigns(THREE), { circle: "slightly" }).line,
      "Rate the ■ Square and ▲ Triangle designs above to choose.",
    );
  });

  test("C2: 'Can't judge yet' counts as a rating, and the unlock is announced once", () => {
    const lock = choiceLock(LABELS, {
      circle: "cant-judge",
      square: "cant-judge",
    });
    assert.equal(lock.locked, false);
    assert.equal(lock.line, null);
    assert.equal(
      unlockAnnouncement(true, false),
      "You can now choose a design.",
    );
    // A page that opens unlocked (edit mode), and every later render, says nothing.
    assert.equal(unlockAnnouncement(false, false), null);
    assert.equal(unlockAnnouncement(true, true), null);
  });

  test("C2: the comments open only once every design has a rating", async () => {
    const { commentsOpen } = await import("./client/review-form.ts");
    const form = (ratings: Record<string, string>) => ({
      ...emptyForm(),
      variants: { ...emptyVariants(), ratings },
    });
    assert.equal(
      commentsOpen(form({ circle: "very" }), false, CONFIG.designs),
      false,
    );
    assert.equal(
      commentsOpen(
        form({ circle: "very", square: "cant-judge" }),
        false,
        CONFIG.designs,
      ),
      true,
    );
    assert.equal(commentsOpen(form({}), true, CONFIG.designs), true);
  });
});

describe("C3: the choice's order per reviewer", () => {
  const ids = ["circle", "square"];
  const reviewerIds = Array.from(
    { length: 1000 },
    (_, i) => `00000000-0000-4000-8000-${i.toString(16).padStart(12, "0")}`,
  );

  test("C3: over 1,000 synthetic reviewers each design is listed first 50% ± 5%", () => {
    const first = { circle: 0, square: 0 } as Record<string, number>;
    for (const id of reviewerIds) first[designOrder(SLUG, id, ids)[0]!]! += 1;
    for (const id of ids)
      assert.ok(
        first[id]! >= 450 && first[id]! <= 550,
        `${id} first ${first[id]} times in 1,000`,
      );
  });

  test("C3: the three anchors are always last, in their fixed order", () => {
    for (const id of reviewerIds.slice(0, 200)) {
      const options = choiceOptions(designOrder(SLUG, id, ids), LABELS);
      assert.deepEqual(
        options.slice(-3).map((o) => o.id),
        ["combine", "none", "no-preference"],
      );
      assert.deepEqual(
        options.slice(-3).map((o) => o.label),
        CHOICE_ANCHORS.map((a) => a.label),
      );
      assert.deepEqual(
        options
          .slice(0, 2)
          .map((o) => o.id)
          .sort(),
        ids,
      );
    }
  });

  test("C3: the order never draws on Math.random, and differs across slugs", () => {
    const random = Math.random;
    Math.random = () => {
      throw new Error("Math.random was called");
    };
    try {
      designOrder(SLUG, reviewer.reviewerId, ids);
    } finally {
      Math.random = random;
    }
    const orders = new Set(
      Array.from({ length: 50 }, (_, i) =>
        designOrder(`slug-${i}`, reviewer.reviewerId, ids).join(),
      ),
    );
    assert.equal(orders.size, 2);
  });

  test("C3: 'Each design' follows the switcher: the reviewer's first design first", () => {
    assert.deepEqual(
      switcherOrder(THREE, "square").map((d) => d.id),
      ["square", "circle", "triangle"],
    );
    assert.deepEqual(
      switcherOrder(THREE, null).map((d) => d.id),
      ["circle", "square", "triangle"],
    );
  });
});

describe("C4: nothing is pre-selected", () => {
  test("C4: the choice starts empty, and no option carries more than its id and label", () => {
    assert.equal(emptyForm().variants.choice, null);
    assert.equal(emptyForm().variants.strength, null);
    for (const option of choiceOptions(["square", "circle"], LABELS))
      assert.deepEqual(Object.keys(option).sort(), ["id", "label"]);
    assert.ok(
      !choiceOptions(["square", "circle"], LABELS).some((o) =>
        /recommend/i.test(o.label),
      ),
    );
  });

  test("C4: the unlocked fixture renders the choice with nothing selected", () => {
    const fixture = reviewFixture(
      "variants-unlocked",
      "circle",
      CONFIG.designs,
    );
    assert.equal(fixture.form.variants.choice, null);
    assert.equal(
      choiceLock(LABELS, fixture.form.variants.ratings).locked,
      false,
    );
    assert.equal(
      toPayload(fixture.form, [], CONFIG.designs).answers.choice,
      undefined,
    );
  });
});

describe("C5: a design never viewed", () => {
  test("C5: its questions are disabled with the line until a view is logged", () => {
    const designs = variantDesigns(THREE);
    const triangle = designs.find((d) => d.id === "triangle")!;
    assert.equal(unviewed("triangle", { viewed: ["circle", "square"] }), true);
    assert.equal(
      VARIANTS_WORDS.unviewed(triangle.label),
      "You haven't looked at the ▲ Triangle design yet.",
    );
    assert.equal(
      VARIANTS_WORDS.lookAtItName(triangle.label),
      "Look at the ▲ Triangle design",
    );
    assert.equal(
      unviewed("triangle", { viewed: ["circle", "triangle"] }),
      false,
    );
  });

  test("C5: the unviewed fixture leaves the last design unviewed", () => {
    const fixture = reviewFixture(
      "variants-unviewed",
      "circle",
      CONFIG.designs,
    );
    assert.deepEqual(fixture.variants?.viewed, ["circle"]);
    assert.equal(unviewed("square", fixture.variants!), true);
  });
});

describe("C6: a rating changed after choosing is flagged", () => {
  test("C6: changing a rating while a choice is set flags that design only", () => {
    let v = rateDesign(emptyVariants(), "circle", "very");
    v = rateDesign(v, "square", "slightly");
    // Before any choice, a change is not flagged.
    v = rateDesign(v, "square", "moderately");
    assert.deepEqual(v.changed, {});
    v = chooseOption(v, "circle", "square");
    // The same rating again is no change.
    v = rateDesign(v, "circle", "very");
    assert.deepEqual(v.changed, {});
    v = rateDesign(v, "square", "extremely");
    const stored = toPayload(
      { ...complete(), variants: { ...v, strength: "slight" } },
      [],
      CONFIG.designs,
    ).answers.designs!;
    assert.equal(stored.square!.changedAfterChoosing, true);
    assert.equal(stored.circle!.changedAfterChoosing, false);
  });

  test("C6: the flags belong to each version: edit mode starts them false, a draft keeps them", () => {
    const answers = toPayload(
      complete({ changed: { square: true } }),
      [],
      CONFIG.designs,
    ).answers;
    assert.equal(answers.designs!.square!.changedAfterChoosing, true);
    const edit = formFromVersion({ answers, triage: {} }, []);
    assert.deepEqual(edit.variants.changed, {});
    assert.equal(edit.variants.choice, "square");
    assert.equal(edit.variants.ratings.circle, "very");

    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    };
    storage.setItem(
      "k",
      JSON.stringify(draftOf(complete({ changed: { square: true } }))),
    );
    assert.deepEqual(readDraft(storage, "k", [])!.form.variants.changed, {
      square: true,
    });
  });

  test("C6: the server stores the flag as sent", async () => {
    const { deps, saved } = depsFor();
    const result = await sendReviewWith(
      deps,
      SLUG,
      send(complete({ changed: { circle: true } })),
    );
    assert.equal(result.kind, "ok");
    assert.equal(saved[0]!.answers.designs!.circle!.changedAfterChoosing, true);
    assert.equal(
      saved[0]!.answers.designs!.square!.changedAfterChoosing,
      false,
    );
  });
});

describe("C7: strength is required, and the follow-ups follow the choice", () => {
  test("C7: a design gets strength, reasons and carry-over, in that order; Combine and None one each", () => {
    assert.deepEqual(followUps("circle", LABELS), [
      "strength",
      "reasons",
      "carryOver",
    ]);
    assert.deepEqual(followUps("combine", LABELS), ["combine"]);
    assert.deepEqual(followUps("none", LABELS), ["noneNeeds"]);
    assert.deepEqual(followUps("no-preference", LABELS), []);
    assert.deepEqual(followUps(null, LABELS), []);
  });

  test("C7: without strength the form names the gap, and the server answers invalid", async () => {
    const form = complete({ strength: null });
    const payload = toPayload(form, [], CONFIG.designs);
    assert.deepEqual(
      requiredGaps(payload, [], CONFIG).map((g) => g.id),
      ["strength"],
    );
    const { deps, saved } = depsFor();
    assert.deepEqual(await sendReviewWith(deps, SLUG, send(form)), {
      kind: "invalid",
      missing: ["strength"],
    });
    assert.equal(saved.length, 0);
  });

  test("C7: the choice and each rating are required; Overall is not asked", () => {
    const gaps = requiredGaps(
      toPayload(
        { ...emptyForm(), blockersNone: true, nextStep: "approve" },
        [],
        CONFIG.designs,
      ),
      [],
      CONFIG,
    );
    assert.deepEqual(
      gaps.map((g) => g.id),
      ["rating-circle", "rating-square", "choice"],
    );
    assert.equal(
      gaps[0]!.label,
      "How well does the ● Circle design meet the goals below?",
    );
  });

  test("C7: Combine and None send only their one follow-up; the server refuses another", async () => {
    const combine = toPayload(
      complete({
        choice: "combine",
        strength: "strong",
        reasons: "kept from before",
        combine: "The table from one, the plans from the other.",
      }),
      [],
      CONFIG.designs,
    ).answers.choice!;
    assert.deepEqual(Object.keys(combine).sort(), [
      "combine",
      "lastViewed",
      "option",
    ]);
    const none = toPayload(
      complete({ choice: "none", noneNeeds: "Show the yearly price." }),
      [],
      CONFIG.designs,
    ).answers.choice!;
    assert.equal(none.noneNeeds, "Show the yearly price.");
    assert.equal(none.strength, undefined);

    const { deps, saved } = depsFor();
    const forged = send(complete({ choice: "combine" }));
    forged.answers.choice = { ...forged.answers.choice!, strength: "strong" };
    assert.deepEqual(await sendReviewWith(deps, SLUG, forged), {
      kind: "not-saved",
    });
    assert.equal(saved.length, 0);
  });

  test("C7: Blockers name a chosen design, and read 'any of these' otherwise", () => {
    assert.equal(
      blockersQuestion("square", LABELS),
      "What, if anything, would stop you approving the ■ Square design as it stands?",
    );
    for (const choice of [null, "combine", "none", "no-preference"])
      assert.equal(
        blockersQuestion(choice, LABELS),
        "What, if anything, would stop you approving any of these as they stand?",
      );
  });
});

describe("C10: the order and the last design viewed, stored by the server", () => {
  const ids = ["circle", "square"];

  test("C10: one reviewer gets the same order on every call", () => {
    const order = designOrder(SLUG, reviewer.reviewerId, ids);
    for (let i = 0; i < 20; i++)
      assert.deepEqual(designOrder(SLUG, reviewer.reviewerId, ids), order);
    // The config's order does not change it.
    assert.deepEqual(
      designOrder(SLUG, reviewer.reviewerId, [...ids].reverse()),
      order,
    );
  });

  test("C10: the stored version holds the server's order, the same on a second access, and the last design", async () => {
    const order = designOrder(SLUG, reviewer.reviewerId, ids);
    const first = depsFor();
    await sendReviewWith(first.deps, SLUG, send(complete()));
    const second = depsFor({
      ...reviewer,
      accessId: "00000000-0000-4000-8000-0000000000b2",
    });
    await sendReviewWith(second.deps, SLUG, send(complete()));
    for (const { saved } of [first, second]) {
      assert.deepEqual(saved[0]!.answers.choice!.order, order);
      assert.equal(saved[0]!.answers.choice!.lastViewed, "square");
      assert.equal(saved[0]!.answers.choice!.option, "square");
      assert.equal(saved[0]!.answers.choice!.strength, "clear");
    }
  });

  test("C10: the browser's order is never taken, and every design id is the config's", async () => {
    const forgedOrder = send(complete());
    (forgedOrder.answers.choice as Record<string, unknown>).order = [
      "square",
      "circle",
    ];
    const unknownRating = send(complete());
    unknownRating.answers.designs = {
      ...unknownRating.answers.designs,
      diamond: { rating: "very", changedAfterChoosing: false },
    };
    const unknownChoice = send(complete({ choice: "diamond" }));
    unknownChoice.answers.choice = { option: "diamond" };
    const unknownLast = send(complete());
    unknownLast.answers.choice = {
      ...unknownLast.answers.choice!,
      lastViewed: "diamond",
    };
    const badRating = send(complete());
    badRating.answers.designs!.circle!.rating = "brilliant";
    const overall = send(complete());
    overall.answers.overall = "very";
    for (const input of [
      forgedOrder,
      unknownRating,
      unknownChoice,
      unknownLast,
      badRating,
      overall,
    ]) {
      const { deps, saved } = depsFor();
      assert.deepEqual(await sendReviewWith(deps, SLUG, input), {
        kind: "not-saved",
      });
      assert.equal(saved.length, 0);
    }
  });

  test("C10: the last design viewed is snapshotted each time the choice is set", () => {
    let v = chooseOption(emptyVariants(), "circle", "circle");
    assert.equal(v.lastViewed, "circle");
    v = chooseOption({ ...v, strength: "strong" }, "square", "square");
    assert.equal(v.lastViewed, "square");
    // Another option clears a strength said of the one before.
    assert.equal(v.strength, null);
  });

  test("C10: a one-design review sends no designs and no choice, and the server refuses them", async () => {
    const one = {
      ...CONFIG,
      designs: [DESIGNS[0]],
    } as unknown as ExperimentConfig;
    const payload = toPayload(
      { ...complete(), overall: "very" },
      [],
      one.designs,
    );
    assert.equal(payload.answers.designs, undefined);
    assert.equal(payload.answers.choice, undefined);
    assert.equal(payload.answers.overall, "very");
    const { deps, saved } = depsFor();
    deps.resolveViewer = async () => ({
      kind: "reviewer",
      viewer: reviewer,
      experiment: one,
    });
    assert.deepEqual(await sendReviewWith(deps, SLUG, send(complete())), {
      kind: "not-saved",
    });
    assert.equal(saved.length, 0);
  });
});

describe("the seven variants keys", () => {
  test("C9: each registers for the team only and renders a fixture on two designs", () => {
    assert.equal(VARIANTS_STATE_KEYS.length, 7);
    for (const key of VARIANTS_STATE_KEYS) {
      assert.equal(readSandboxState(key, "team"), key);
      assert.equal(readSandboxState(key, "reviewer"), null);
      assert.equal(readSandboxState(key, "guest"), null);
      const fixture = reviewFixture(key, "circle", CONFIG.designs);
      assert.ok(fixture.variants);
      assert.deepEqual(
        fixture.comments.map((c) => c.design),
        ["circle", "square", "circle"],
      );
    }
    assert.equal(
      reviewFixture("variants-combine", "circle", CONFIG.designs).form.variants
        .choice,
      "combine",
    );
    assert.equal(designOption(DESIGNS[1]).label, SQUARE.label);
    assert.equal(CIRCLE.label, "● Circle");
  });
});
