/**
 * LAB-13's list, pure: C2 (Show on page's plan), C3 and C4 (Retry through
 * LAB-12's queue and sender, under the ids it was queued with), C5 (focus
 * after a delete, and the count), plus the grouping and the `?state=` keys.
 * Storage and the network are fakes; the pins are synthetic.
 */

import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { SANDBOX_STATE_KEYS } from "../state.ts";
import { designOption } from "./experiment-view.ts";
import {
  actionName,
  focusAfterDelete,
  groupComments,
  isListStateKey,
  LIST_STATE_KEYS,
  LIST_WORDS,
  listFixture,
  listOrder,
  retryOutcome,
  runRetry,
  showOnPagePlan,
} from "./pin-list.ts";
import type { Pin } from "./pins-view.ts";
import {
  createPinSender,
  createQueueStore,
  queueKey,
  type QueueEntry,
  type SendResult,
  type StorageLike,
} from "./queue.ts";

const circle = designOption({ id: "circle", shape: "circle" });
const square = designOption({ id: "square", shape: "square" });

function pin(number: number, design: string, sync: Pin["sync"] = "sent"): Pin {
  return {
    id: `0b7b0c1e-0000-4000-8000-00000000000${number}`,
    number,
    design,
    kind: null,
    body: `Comment body ${number}`,
    anchor: { marked: "plans", x: 0.5, y: 0.5, place: "Plans" },
    viewportW: 390,
    viewportH: 844,
    clientCreatedAt: "2026-10-07T10:00:00.000Z",
    sync,
  };
}

function memoryStorage(): StorageLike {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

/** LAB-12's queue and sender over a fake network that answers from a script. */
function retryRig(queued: QueueEntry[], answers: SendResult[] = []) {
  const queue = createQueueStore(
    memoryStorage(),
    queueKey("pricing-2026", "6f1c1f9e-1111-4111-8111-111111111111"),
  );
  for (const entry of queued) queue.put(entry);
  const saved: string[] = [];
  const sender = createPinSender({
    queue,
    online: () => true,
    save: async (entry) => {
      saved.push(entry.id);
      return answers.shift() ?? "ok";
    },
    remove: async () => "ok",
  });
  const retry = () =>
    runRetry({
      queued: () => queue.all().map((e) => e.id),
      flush: () => sender.flush(),
    });
  return { queue, saved, retry };
}

function entryOf(pin: Pin): QueueEntry {
  const entry: Partial<Pin> = { ...pin };
  delete entry.sync;
  return entry as QueueEntry;
}

describe("groupComments", () => {
  test("C1's data: pins on two designs group by design in switcher order, numbered", () => {
    const list = groupComments(
      [pin(4, "circle"), pin(3, "square"), pin(1, "circle"), pin(2, "circle")],
      [square, circle],
    );
    assert.equal(list.headed, true);
    assert.deepEqual(
      list.groups.map((g) => [g.heading, g.items.map((i) => i.number)]),
      [
        ["■ Square design", [3]],
        ["● Circle design", [1, 2, 4]],
      ],
    );
  });

  test("a single-design experiment has no heading; a design with none has no group", () => {
    assert.equal(groupComments([pin(1, "circle")], [circle]).headed, false);
    const list = groupComments([pin(1, "circle")], [circle, square]);
    assert.deepEqual(
      list.groups.map((g) => g.design?.id),
      ["circle"],
    );
  });

  test("a comment on a design the config no longer lists is still listed, not found (D-LAB-13)", () => {
    const list = groupComments([pin(1, "circle"), pin(2, "hexagon")], [circle]);
    assert.equal(list.headed, true);
    const last = list.groups.at(-1)!;
    assert.equal(last.heading, LIST_WORDS.otherDesigns);
    assert.equal(last.items[0]!.detached, true);
    assert.equal(showOnPagePlan(last.items[0]!, "circle"), null);
  });

  test("an item is marked not found from the page's own lookup", () => {
    const one = pin(1, "circle");
    const list = groupComments(
      [one, pin(2, "circle")],
      [circle],
      new Set([one.id]),
    );
    assert.deepEqual(
      listOrder(list).map((i) => i.detached),
      [true, false],
    );
  });
});

describe("C2: showOnPagePlan", () => {
  test("a pin on the other design switches to it, closes the list and targets its popover", () => {
    const target = { ...pin(3, "square"), detached: false };
    assert.deepEqual(showOnPagePlan(target, "circle"), {
      switchTo: "square",
      closeList: true,
      openPin: target.id,
    });
  });

  test("a pin on the shown design does not switch", () => {
    const target = { ...pin(1, "circle"), detached: false };
    assert.equal(showOnPagePlan(target, "circle")?.switchTo, null);
  });

  test("a not-found pin offers no Show on page", () => {
    assert.equal(
      showOnPagePlan({ ...pin(2, "circle"), detached: true }, "square"),
      null,
    );
  });

  test("each action is named with the comment's number", () => {
    assert.equal(actionName("show", 3), "Show comment 3 on page");
    assert.equal(actionName("edit", 3), "Edit comment 3");
    assert.equal(actionName("delete", 3), "Delete comment 3");
  });
});

describe("Retry", () => {
  test("C3: two queued, online: both send under their original ids, the line clears and '2 comments sent.' is announced", async () => {
    const a = pin(2, "circle", "unsent");
    const b = pin(4, "square", "unsent");
    const rig = retryRig([entryOf(a), entryOf(b)]);
    const outcome = await rig.retry();
    assert.deepEqual(rig.saved, [a.id, b.id]);
    assert.deepEqual(rig.queue.all(), []);
    assert.deepEqual(outcome, {
      unsentLine: null,
      announcement: "2 comments sent.",
      unsent: [],
    });
  });

  test("C4: two queued and one send failing: '1 not sent yet.', that item still unsent, only the one sent announced", async () => {
    const a = pin(2, "circle", "unsent");
    const b = pin(4, "circle", "unsent");
    const rig = retryRig([entryOf(a), entryOf(b)], ["not-saved", "ok"]);
    const outcome = await rig.retry();
    assert.deepEqual(rig.saved, [a.id, b.id]);
    assert.deepEqual(outcome, {
      unsentLine: "1 not sent yet.",
      announcement: "1 comment sent.",
      unsent: [a.id],
    });
    // The failed one keeps its id and text for the next Retry.
    assert.deepEqual(rig.queue.all(), [entryOf(a)]);
  });

  test("nothing sent announces nothing", () => {
    assert.deepEqual(retryOutcome(["x"], ["x"], []), {
      unsentLine: "1 not sent yet.",
      announcement: null,
      unsent: ["x"],
    });
  });
});

describe("C5: focusAfterDelete and the count", () => {
  const items = [pin(1, "circle"), pin(2, "circle"), pin(3, "square")];

  test("focus moves to the next item, across groups", () => {
    assert.deepEqual(focusAfterDelete(items, items[0]!.id), {
      item: items[1]!.id,
    });
    assert.deepEqual(focusAfterDelete(items, items[1]!.id), {
      item: items[2]!.id,
    });
  });

  test("the last item gives way to the one before it", () => {
    assert.deepEqual(focusAfterDelete(items, items[2]!.id), {
      item: items[1]!.id,
    });
  });

  test("with none left, focus goes to the title", () => {
    assert.deepEqual(focusAfterDelete([items[0]!], items[0]!.id), {
      title: true,
    });
  });

  test("the count reads '1 comment' or 'N comments'", () => {
    assert.equal(LIST_WORDS.count(1), "1 comment");
    assert.equal(LIST_WORDS.count(5), "5 comments");
    assert.equal(LIST_WORDS.count(0), "0 comments");
  });
});

describe("the list's ?state= keys", () => {
  test("every key is registered team-only", () => {
    for (const key of LIST_STATE_KEYS) {
      assert.equal(isListStateKey(key), true);
      assert.equal(SANDBOX_STATE_KEYS[key], "team", key);
    }
    assert.equal(isListStateKey("pins-success"), false);
  });

  test("the fixtures carry what each state shows", () => {
    assert.equal(listFixture("list-empty").pins.pins.length, 0);
    assert.equal(listFixture("list-loading").load, "loading");
    const error = listFixture("list-error");
    assert.equal(error.load, "error");
    assert.ok(error.pins.pins.every((p) => p.sync === "unsent"));
    assert.equal(
      listFixture("list-partial").pins.pins.filter((p) => p.sync === "unsent")
        .length,
      2,
    );
    assert.equal(listFixture("list-offline").pins.online, false);
    assert.equal(listFixture("list-retried").announcement, "2 comments sent.");
    const detached = listFixture("list-detached").pins.pins.find(
      (p) => p.number === 2,
    )!;
    assert.equal(detached.anchor.marked, "removed-section");
  });
});
