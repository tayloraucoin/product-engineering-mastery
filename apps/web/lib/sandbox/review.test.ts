/**
 * LAB-17's review behind its seams: goal fit before the comments (C2), the
 * triage playback and "matters most" (C3), the required gaps and the
 * server's invalid (C4), what a valid send stores and what is refused (C5),
 * queued pins sent first (C7), closed before the send (C8), and the team
 * sent away and never stored (C12). Stubs that throw when called prove
 * nothing is written where nothing may be. Also the draft over a fake
 * Storage and the eleven review keys, for the team only.
 */

import assert from "node:assert/strict";
import { describe, test } from "node:test";

import type { ReviewerViewer, TeamViewer } from "@pem/db/sandbox";

import type { ExperimentConfig } from "../../app/experimental/_experiments/registry.ts";
import type { ViewerResult } from "./access-check.ts";
import { designOption } from "./client/experiment-view.ts";
import {
  createPinSender,
  createQueueStore,
  type QueueEntry,
  type SendResult,
  type StorageLike,
} from "./client/queue.ts";
import { CORE_VERSION, REVIEW_CORE } from "./client/review-core.ts";
import {
  clearDraft,
  commentsOpen,
  draftKey,
  draftOf,
  emptyForm,
  formFromVersion,
  mattersMostView,
  readDraft,
  requiredGaps,
  toPayload,
  withoutComment,
  writeDraft,
  type ReviewForm,
} from "./client/review-form.ts";
import { sendReviewFlow } from "./client/review-send.ts";
import {
  commentPlayback,
  editedPin,
  fixtureComments,
  REVIEW_STATE_KEYS,
  reviewFixture,
} from "./client/review-view.ts";
import {
  REVIEW_ANSWERS_BYTES_MAX,
  reviewPageView,
  sendReviewWith,
  type ReviewDeps,
} from "./review.ts";
import { readSandboxState } from "./state.ts";

const SLUG = "pricing-2026";
const loader = async () => () => null;
const CONFIG = {
  slug: SLUG,
  title: "Pricing page, 2026",
  designs: [{ id: "circle", shape: "circle", component: loader }],
  goals: ["A synthetic goal", "Another synthetic goal"],
  targetedQuestion: {
    text: "How clear is the price of each plan?",
    labels: ["Not clear", "Slightly", "Moderately", "Very", "Completely"],
  },
  questions: [
    {
      id: "missing-detail",
      text: "What did the page not tell you?",
      kind: "text",
      required: true,
    },
    {
      id: "plan",
      text: "Which plan would you pick?",
      kind: "choice",
      options: ["Free", "Team"],
      required: false,
    },
  ],
  mode: "private",
  coreVersion: "v1",
  closedOn: null,
} as unknown as ExperimentConfig;

const reviewer: ReviewerViewer = {
  kind: "reviewer",
  slug: SLUG,
  reviewerId: "00000000-0000-4000-8000-0000000000a1",
  accessId: "00000000-0000-4000-8000-0000000000b1",
};
const team: TeamViewer = {
  kind: "team",
  userId: "00000000-0000-4000-8000-0000000000c1",
  email: "team@example.test",
  role: "developer",
};

const PINS = fixtureComments("circle");
const [P1, P2, P3] = PINS.map((p) => p.id) as [string, string, string];
const VERSION_ID = "00000000-0000-4000-8000-0000000000f1";

const asReviewer: ViewerResult = {
  kind: "reviewer",
  viewer: reviewer,
  experiment: CONFIG,
};

/** Every required answer given, over the three fixture pins. */
function complete(): ReviewForm {
  return {
    ...emptyForm(),
    overall: "very",
    triage: { [P1]: "must", [P2]: "fine", [P3]: "fine" },
    blockersNone: true,
    questions: { "missing-detail": "Whether seats can be added mid-month." },
    nextStep: "approve",
  };
}

function never(name: string) {
  return async () => {
    throw new Error(`${name} must not be called`);
  };
}

function deps(over: Partial<ReviewDeps> = {}): ReviewDeps {
  return {
    resolveViewer: async () => asReviewer,
    listMyComments: async () => PINS.map(({ id, number }) => ({ id, number })),
    saveReviewVersion: never("saveReviewVersion"),
    ...over,
  };
}

function sendInput(form: ReviewForm = complete()) {
  return { versionId: VERSION_ID, ...toPayload(form, PINS) };
}

function fakeStorage(seed: Record<string, string> = {}) {
  const data = new Map(Object.entries(seed));
  const storage: StorageLike = {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
  return { storage, data };
}

const throwing: StorageLike = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
  removeItem: () => {
    throw new Error("blocked");
  },
};

describe("C2: goal fit comes first", () => {
  test("C2: on a first send the comments stay shut until goal fit is answered; Can't judge yet counts", () => {
    assert.equal(commentsOpen({ overall: null }, false), false);
    assert.equal(commentsOpen({ overall: "cant-judge" }, false), true);
    assert.equal(commentsOpen({ overall: "slightly" }, false), true);
  });

  test("C2: in edit mode the comments are open", () => {
    assert.equal(commentsOpen({ overall: null }, true), true);
  });

  test("C2: the locked line is review.md's, and holds no comment text", () => {
    assert.equal(
      REVIEW_CORE.comments.locked,
      "Answer the question above to see your comments.",
    );
    for (const pin of PINS)
      assert.ok(!REVIEW_CORE.comments.locked.includes(pin.body));
  });
});

describe("C3: the triage playback", () => {
  test("C3: three pins are each played back in number order with their place, type and a three-way triage", () => {
    const rows = commentPlayback([...PINS].reverse(), [
      designOption({ id: "circle", shape: "circle" }),
    ]);
    assert.deepEqual(
      rows.map((r) => r.meta),
      [
        "Comment 1 · Plans · Problem",
        "Comment 2 · Comparison table · Question",
        "Comment 3 · Questions · Keep this",
      ],
    );
    assert.equal(
      rows[2]!.triageGroup,
      "Comment 3: Must change, Should change or Fine either way",
    );
  });

  test("C3: with several designs, each comment names its design", () => {
    const rows = commentPlayback(
      [{ ...PINS[0]!, design: "square" }],
      [
        designOption({ id: "circle", shape: "circle" }),
        designOption({ id: "square", shape: "square" }),
      ],
    );
    assert.equal(rows[0]!.meta, "Comment 1 · ■ Square · Plans · Problem");
  });

  test("C3: a text edit saves that pin under its own id, through LAB-12's sender", async () => {
    const sent: QueueEntry[] = [];
    const sender = createPinSender({
      queue: createQueueStore(null, "test"),
      online: () => true,
      save: async (entry) => {
        sent.push(entry);
        return "ok";
      },
      remove: never("remove"),
    });
    const entry = editedPin(PINS[1]!, "Do guest seats cost extra?");
    assert.ok(entry);
    assert.equal(await sender.save(entry), "ok");
    assert.equal(sent.length, 1);
    assert.equal(sent[0]!.id, P2);
    assert.equal(sent[0]!.number, 2);
    assert.equal(sent[0]!.body, "Do guest seats cost extra?");
    // Unchanged, empty or too long: nothing to send.
    assert.equal(editedPin(PINS[1]!, PINS[1]!.body), null);
    assert.equal(editedPin(PINS[1]!, "   "), null);
    assert.equal(editedPin(PINS[1]!, "x".repeat(2001)), null);
  });

  test("C3: with exactly one Must or Should, matters most is set to it and hidden", () => {
    const one = mattersMostView(
      {
        triage: { [P1]: "fine", [P2]: "should", [P3]: "fine" },
        mattersMost: null,
      },
      PINS,
    );
    assert.deepEqual([one.shown, one.value], [false, P2]);
    assert.equal(
      toPayload(
        {
          ...complete(),
          triage: { [P1]: "fine", [P2]: "should", [P3]: "fine" },
        },
        PINS,
      ).triage.mattersMost,
      P2,
    );
  });

  test("C3: with two or more it is asked among them; with none it is neither asked nor set", () => {
    const two = mattersMostView(
      {
        triage: { [P1]: "must", [P2]: "should", [P3]: "fine" },
        mattersMost: P3,
      },
      PINS,
    );
    assert.equal(two.shown, true);
    assert.equal(two.value, null);
    assert.deepEqual(
      two.choices.map((c) => c.id),
      [P1, P2],
    );
    const none = mattersMostView(
      { triage: { [P1]: "fine" }, mattersMost: P1 },
      PINS,
    );
    assert.deepEqual([none.shown, none.value], [false, null]);
  });

  test("C3: a deleted comment's triage goes, and matters most with it", () => {
    const form = withoutComment(
      {
        ...complete(),
        triage: { [P1]: "must", [P2]: "must" },
        mattersMost: P1,
      },
      P1,
    );
    assert.deepEqual(form.triage, { [P2]: "must" });
    assert.equal(form.mattersMost, null);
  });
});

describe("C4: a send missing a required answer", () => {
  test("C4: every gap is listed in page order, and the summary counts them", () => {
    const gaps = requiredGaps(
      toPayload(
        { ...emptyForm(), triage: { [P1]: "must", [P2]: "should" } },
        PINS,
      ),
      PINS,
      CONFIG,
    );
    assert.deepEqual(
      gaps.map((g) => g.id),
      [
        "overall",
        `triage-${P3}`,
        "matters-most",
        "blockers",
        "question-missing-detail",
        "next-step",
      ],
    );
    assert.equal(REVIEW_CORE.missing(gaps.length), "6 answers are missing");
    assert.equal(REVIEW_CORE.missing(1), "1 answer is missing");
    assert.deepEqual(gaps.map((g) => g.label).slice(0, 2), [
      "How well does this design meet the goals below?",
      "Comment 3: Must change, Should change or Fine either way",
    ]);
  });

  test("C4: Can't judge yet answers goal fit, and an unticked empty blockers is a gap", () => {
    const form = { ...complete(), overall: "cant-judge", blockersNone: false };
    assert.deepEqual(
      requiredGaps(toPayload(form, PINS), PINS, CONFIG).map((g) => g.id),
      ["blockers"],
    );
    assert.deepEqual(
      requiredGaps(
        toPayload({ ...form, blockersText: "The annual price." }, PINS),
        PINS,
        CONFIG,
      ),
      [],
    );
  });

  test("C4: nothing is sent with a gap: the server refuses the payload as invalid, naming the ids", async () => {
    const result = await sendReviewWith(
      deps(),
      SLUG,
      sendInput({ ...complete(), nextStep: null, triage: { [P1]: "must" } }),
    );
    assert.deepEqual(result, {
      kind: "invalid",
      missing: [`triage-${P2}`, `triage-${P3}`, "next-step"],
    });
  });
});

describe("C5: a valid send", () => {
  test("C5: stores one version with the answers, core version v1, and a triage for every own pin plus matters most", async () => {
    const stored: unknown[] = [];
    const result = await sendReviewWith(
      deps({
        saveReviewVersion: async (viewer, input) => {
          assert.equal(viewer, reviewer);
          stored.push(input);
          return { number: 1, createdAt: new Date("2026-10-07T10:00:00Z") };
        },
      }),
      SLUG,
      sendInput({ ...complete(), gaps: "A line on seats.", targeted: "Very" }),
    );
    assert.deepEqual(result, {
      kind: "ok",
      number: 1,
      createdAt: "2026-10-07T10:00:00.000Z",
    });
    assert.equal(stored.length, 1);
    assert.deepEqual(stored[0], {
      id: VERSION_ID,
      coreVersion: CORE_VERSION,
      answers: {
        overall: "very",
        blockers: { none: true },
        gaps: "A line on seats.",
        targeted: "Very",
        questions: {
          "missing-detail": "Whether seats can be added mid-month.",
        },
        nextStep: "approve",
      },
      triage: {
        comments: { [P1]: "must", [P2]: "fine", [P3]: "fine" },
        mattersMost: P1,
      },
    });
    assert.equal(CORE_VERSION, "v1");
  });

  test("C5: a triage key that is not the viewer's own comment is refused with a fixed result, and nothing is stored", async () => {
    const foreign = "00000000-0000-4000-8000-0000000000e9";
    for (const triage of [
      {
        comments: {
          [P1]: "must",
          [P2]: "fine",
          [P3]: "fine",
          [foreign]: "fine",
        },
        mattersMost: P1,
      },
      {
        comments: { [P1]: "must", [P2]: "fine", [P3]: "fine" },
        mattersMost: foreign,
      },
    ])
      assert.deepEqual(
        await sendReviewWith(deps(), SLUG, { ...sendInput(), triage }),
        { kind: "not-saved" },
      );
  });

  test("C5: answers over 64 KB, malformed input, and answers the config does not ask are refused with a fixed result", async () => {
    const big = { ...sendInput() };
    big.answers = {
      ...big.answers,
      gaps: "x".repeat(4000),
      questions: Object.fromEntries(
        Array.from({ length: 20 }, (_, i) => [`q-${i}`, "y".repeat(4000)]),
      ),
    };
    assert.ok(JSON.stringify(big.answers).length > REVIEW_ANSWERS_BYTES_MAX);
    const secret = "Leaked-Answer-Text";
    for (const input of [
      big,
      null,
      { ...sendInput(), versionId: "not-a-uuid" },
      { ...sendInput(), extra: secret },
      { ...sendInput(), answers: { ...sendInput().answers, overall: secret } },
      { ...sendInput(), answers: { ...sendInput().answers, targeted: secret } },
      {
        ...sendInput(),
        answers: { ...sendInput().answers, questions: { plan: "Enterprise" } },
      },
      {
        ...sendInput(),
        answers: { ...sendInput().answers, questions: { unknown: "x" } },
      },
    ]) {
      const result = await sendReviewWith(deps(), SLUG, input);
      assert.deepEqual(result, { kind: "not-saved" });
      assert.ok(!JSON.stringify(result).includes(secret));
    }
  });

  test("C5: a store that throws is not-saved, never its error", async () => {
    const result = await sendReviewWith(
      deps({
        saveReviewVersion: async () => {
          throw new Error("duplicate key value (secret detail)");
        },
      }),
      SLUG,
      sendInput(),
    );
    assert.deepEqual(result, { kind: "not-saved" });
  });
});

describe("C7: queued pins send first", () => {
  function queued(ids: string[]) {
    const queue = createQueueStore(null, "test");
    for (const id of ids) queue.put(PINS.find((p) => p.id === id)!);
    return queue;
  }

  test("C7: each queued pin is resent under its id, and the version goes only after every ok, triage keyed by those ids", async () => {
    const order: string[] = [];
    const queue = queued([P2, P3]);
    const sender = createPinSender({
      queue,
      online: () => true,
      save: async (entry) => {
        order.push(`pin ${entry.id}`);
        return "ok";
      },
      remove: never("remove"),
    });
    const payload = toPayload(complete(), PINS);
    const outcome = await sendReviewFlow(
      {
        flushPins: () => sender.flush(),
        queuedPins: () => queue.all().length,
        reloadComments: never("reloadComments"),
        sendReview: async (input) => {
          order.push("version");
          assert.deepEqual(
            Object.keys(input.triage.comments).sort(),
            [P1, P2, P3].sort(),
          );
          return { kind: "ok", number: 2, createdAt: "2026-10-07T10:00:00Z" };
        },
      },
      VERSION_ID,
      payload,
      PINS,
    );
    assert.deepEqual(order, [`pin ${P2}`, `pin ${P3}`, "version"]);
    assert.deepEqual(outcome, {
      kind: "sent",
      number: 2,
      createdAt: "2026-10-07T10:00:00Z",
    });
  });

  test("C7: a pin that fails leaves the version unsent and shows review-send-failed", async () => {
    const queue = queued([P2, P3]);
    const sender = createPinSender({
      queue,
      online: () => true,
      save: async (entry): Promise<SendResult> =>
        entry.id === P3 ? "not-saved" : "ok",
      remove: never("remove"),
    });
    const outcome = await sendReviewFlow(
      {
        flushPins: () => sender.flush(),
        queuedPins: () => queue.all().length,
        sendReview: never("sendReview"),
        reloadComments: never("reloadComments"),
      },
      VERSION_ID,
      toPayload(complete(), PINS),
      PINS,
    );
    assert.deepEqual(outcome, { kind: "send-failed" });
    assert.deepEqual(
      queue.all().map((e) => e.id),
      [P3],
    );
    assert.equal(
      REVIEW_CORE.sendFailed,
      "Your review didn't send. Your answers are still here. Try again.",
    );
  });

  test("C7: a pin refused because the review closed shows review-closed, and the version is not sent", async () => {
    const queue = queued([P2]);
    const sender = createPinSender({
      queue,
      online: () => true,
      save: async () => "closed",
      remove: never("remove"),
    });
    const outcome = await sendReviewFlow(
      {
        flushPins: () => sender.flush(),
        queuedPins: () => queue.all().length,
        sendReview: never("sendReview"),
        reloadComments: never("reloadComments"),
      },
      VERSION_ID,
      toPayload(complete(), PINS),
      PINS,
    );
    assert.deepEqual(outcome, { kind: "closed" });
  });
});

describe("C7: a refused send replays the comments the server holds", () => {
  const flushDeps = {
    flushPins: async () => ({ sent: [], last: null }),
    queuedPins: () => 0,
  };
  const extra: QueueEntry = {
    ...PINS[0]!,
    id: "00000000-0000-4000-8000-000000000104",
    number: 4,
  };

  test("C7: a pin added in another tab: the refusal carries the server's comments, so its triage is asked for", async () => {
    const outcome = await sendReviewFlow(
      {
        ...flushDeps,
        sendReview: async () => ({
          kind: "invalid",
          missing: [`triage-${extra.id}`],
        }),
        reloadComments: async () => [...PINS, extra],
      },
      VERSION_ID,
      toPayload(complete(), PINS),
      PINS,
    );
    assert.equal(outcome.kind, "invalid");
    assert.ok(outcome.kind === "invalid" && outcome.comments);
    const shown = outcome.kind === "invalid" ? outcome.comments! : [];
    assert.deepEqual(
      requiredGaps(toPayload(complete(), shown), shown, CONFIG).map(
        (g) => g.id,
      ),
      [`triage-${extra.id}`],
    );
  });

  test("C7: a pin deleted in another tab: the not-saved refusal becomes a replay, never a dead end", async () => {
    const outcome = await sendReviewFlow(
      {
        ...flushDeps,
        sendReview: async () => ({ kind: "not-saved" }),
        reloadComments: async () => PINS.slice(0, 2),
      },
      VERSION_ID,
      toPayload(complete(), PINS),
      PINS,
    );
    assert.equal(outcome.kind, "invalid");
    assert.deepEqual(
      outcome.kind === "invalid" ? outcome.comments!.map((c) => c.id) : [],
      [P1, P2],
    );
  });

  test("C7: with the same comments, a not-saved stays send-failed", async () => {
    const outcome = await sendReviewFlow(
      {
        ...flushDeps,
        sendReview: async () => ({ kind: "not-saved" }),
        reloadComments: async () => PINS,
      },
      VERSION_ID,
      toPayload(complete(), PINS),
      PINS,
    );
    assert.deepEqual(outcome, { kind: "send-failed" });
  });

  test("C7: a pin the queue still holds after a send is named not sent", () => {
    const rows = commentPlayback(
      [{ ...PINS[0]!, sync: "unsent" }],
      [designOption({ id: "circle", shape: "circle" })],
    );
    assert.equal(rows[0]!.meta, "Comment 1 · Plans · Problem · not sent");
  });
});

describe("C8: closed before the send", () => {
  test("C8: the store stub, which throws when called, is never called, and the result is closed", async () => {
    const result = await sendReviewWith(
      deps({
        resolveViewer: async () => ({
          kind: "ended",
          viewer: reviewer,
          experiment: CONFIG,
        }),
        listMyComments: never("listMyComments"),
      }),
      SLUG,
      sendInput(),
    );
    assert.deepEqual(result, { kind: "closed" });
  });

  test("C8: closed renders review-closed's words and link", () => {
    assert.equal(
      REVIEW_CORE.closed,
      "This review closed before your answers arrived, so they weren't saved.",
    );
    assert.equal(REVIEW_CORE.closedLink, "See what happened");
    assert.equal(reviewFixture("review-closed", "circle").status, "closed");
  });
});

describe("C12: the team never sends a review", () => {
  const asTeam: ViewerResult = {
    kind: "team",
    viewer: team,
    experiment: CONFIG,
  };

  test("C12: a developer or admin without a review ?state= key is sent to the experiment page", () => {
    for (const role of ["developer", "admin"] as const) {
      const result: ViewerResult = { ...asTeam, viewer: { ...team, role } };
      assert.deepEqual(reviewPageView(result, null, SLUG), {
        kind: "redirect",
        to: "/experimental/pricing-2026",
      });
      // Another surface's key is not a review key.
      assert.deepEqual(reviewPageView(result, "exp-closed", SLUG), {
        kind: "redirect",
        to: "/experimental/pricing-2026",
      });
      assert.equal(reviewPageView(result, "review-edit", SLUG).kind, "fixture");
    }
  });

  test("C12: their send stores nothing", async () => {
    for (const role of ["developer", "admin"] as const) {
      const result = await sendReviewWith(
        deps({
          resolveViewer: async () => ({ ...asTeam, viewer: { ...team, role } }),
          listMyComments: never("listMyComments"),
        }),
        SLUG,
        sendInput(),
      );
      assert.deepEqual(result, { kind: "not-saved" });
    }
  });

  test("C12: without live access, or closed, the review sends to the experiment's address; an unknown slug is not found", () => {
    assert.deepEqual(reviewPageView({ kind: "gate" }, null, SLUG), {
      kind: "redirect",
      to: "/experimental/pricing-2026",
    });
    assert.equal(
      reviewPageView(
        { kind: "ended", viewer: reviewer, experiment: CONFIG },
        null,
        SLUG,
      ).kind,
      "redirect",
    );
    assert.equal(
      reviewPageView({ kind: "not-found" }, null, SLUG).kind,
      "not-found",
    );
    assert.equal(reviewPageView(asReviewer, null, SLUG).kind, "reviewer");
  });
});

describe("the draft in this browser", () => {
  const key = draftKey(SLUG, reviewer.reviewerId);

  test("the key is LAB-21's, and a draft round-trips with its version id", () => {
    assert.equal(
      key,
      `sandbox:review-draft:pricing-2026:${reviewer.reviewerId}`,
    );
    const { storage, data } = fakeStorage();
    writeDraft(storage, key, draftOf(complete(), VERSION_ID));
    assert.deepEqual(JSON.parse(data.get(key)!).versionId, VERSION_ID);
    const read = readDraft(storage, key, PINS);
    assert.deepEqual(read, { form: complete(), versionId: VERSION_ID });
    clearDraft(storage, key);
    assert.equal(data.has(key), false);
  });

  test("a draft whose triage lost a deleted comment drops its version id: it is new content", () => {
    const { storage } = fakeStorage();
    writeDraft(storage, key, draftOf(complete(), VERSION_ID));
    assert.equal(
      readDraft(storage, key, PINS.slice(0, 2))!.versionId,
      undefined,
    );
    assert.equal(readDraft(storage, key, PINS)!.versionId, VERSION_ID);
  });

  test("a deleted comment's triage is dropped on read; malformed or throwing storage reads as none", () => {
    const { storage } = fakeStorage();
    writeDraft(storage, key, draftOf(complete()));
    const read = readDraft(storage, key, PINS.slice(0, 1));
    assert.deepEqual(read!.form.triage, { [P1]: "must" });
    assert.equal(
      readDraft(fakeStorage({ [key]: "{not json" }).storage, key, PINS),
      null,
    );
    assert.equal(
      readDraft(fakeStorage({ [key]: "[]" }).storage, key, PINS),
      null,
    );
    assert.equal(readDraft(throwing, key, PINS), null);
    assert.doesNotThrow(() => writeDraft(throwing, key, draftOf(complete())));
    assert.doesNotThrow(() => clearDraft(throwing, key));
  });

  test("edit mode fills the latest version: comments added since are untriaged, deleted ones gone", () => {
    const form = formFromVersion(
      {
        answers: toPayload(complete(), PINS).answers,
        triage: {
          comments: {
            [P1]: "must",
            "00000000-0000-4000-8000-0000000000d0": "fine",
          },
          mattersMost: P1,
        },
      },
      PINS,
    );
    assert.deepEqual(form.triage, { [P1]: "must" });
    assert.equal(form.overall, "very");
    assert.equal(form.blockersNone, true);
  });
});

describe("the review keys", () => {
  test("every review.md ?state= key renders for the team only, and each has a fixture", () => {
    assert.equal(REVIEW_STATE_KEYS.length, 11);
    for (const key of REVIEW_STATE_KEYS) {
      assert.equal(readSandboxState(key, "team"), key);
      assert.equal(readSandboxState(key, "reviewer"), null);
      assert.equal(readSandboxState(key, "guest"), null);
      assert.ok(reviewFixture(key, "circle"));
    }
  });

  test("review-error's fixture holds exactly three gaps", () => {
    const fixture = reviewFixture("review-error", "circle");
    assert.equal(
      requiredGaps(
        toPayload(fixture.form, fixture.comments),
        fixture.comments,
        {
          questions: [],
        },
      ).length,
      3,
    );
  });
});
