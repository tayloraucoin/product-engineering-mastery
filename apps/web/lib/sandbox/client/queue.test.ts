/**
 * LAB-12 C3 and C9's queue: a pin whose send fails stays queued with its id
 * and body and is resent under the same id on load, on reconnect and on
 * Retry; a delete drops its entry before the request is sent; closed or
 * revoked holds the queue as it was. Storage and the network are fakes.
 */

import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  createPinSender,
  createQueueStore,
  queueKey,
  type QueueEntry,
  type SendResult,
  type StorageLike,
} from "./queue.ts";

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

/** Lets a send already started reach its request. */
const inFlight = () => new Promise((resolve) => setImmediate(resolve));

const KEY = queueKey("pricing-2026", "6f1c1f9e-1111-4111-8111-111111111111");

function entry(number: number, body = `Comment body ${number}`): QueueEntry {
  return {
    id: `0b7b0c1e-0000-4000-8000-00000000000${number}`,
    number,
    design: "circle",
    kind: "problem",
    body,
    anchor: { marked: "plans", x: 0.5, y: 0.5, place: "Plans" },
    viewportW: 390,
    viewportH: 844,
    clientCreatedAt: "2026-10-07T10:00:00.000Z",
  };
}

/** A network that answers from a script, recording each request in order. */
function network(answers: SendResult[] = []) {
  const requests: { op: "save" | "remove"; id: string; body?: string }[] = [];
  let online = true;
  const next = () => answers.shift() ?? "ok";
  return {
    requests,
    setOnline: (value: boolean) => void (online = value),
    online: () => online,
    save: async (e: QueueEntry) => {
      requests.push({ op: "save", id: e.id, body: e.body });
      return next();
    },
    remove: async (id: string) => {
      requests.push({ op: "remove", id });
      return next();
    },
  };
}

describe("C3: a failed pin stays queued and is resent under the same id", () => {
  test("the key and fields are LAB-21's", () => {
    assert.equal(
      KEY,
      "sandbox:pin-queue:pricing-2026:6f1c1f9e-1111-4111-8111-111111111111",
    );
    const storage = memoryStorage();
    createQueueStore(storage, KEY).put(entry(1));
    const stored = JSON.parse(storage.data.get(KEY)!);
    assert.deepEqual(Object.keys(stored[0]).sort(), [
      "anchor",
      "body",
      "clientCreatedAt",
      "design",
      "id",
      "kind",
      "number",
      "viewportH",
      "viewportW",
    ]);
  });

  test("the pin is queued before it is sent, and leaves the queue only on ok", async () => {
    const storage = memoryStorage();
    const net = network(["not-saved"]);
    const queue = createQueueStore(storage, KEY);
    let queuedWhenSent = false;
    const sender = createPinSender({
      queue,
      online: net.online,
      save: async (e) => {
        queuedWhenSent = queue.get(e.id) !== undefined;
        return net.save(e);
      },
      remove: net.remove,
    });
    assert.equal(await sender.save(entry(1)), "not-saved");
    assert.ok(queuedWhenSent);
    assert.deepEqual(queue.all(), [entry(1)]);
  });

  test("on load, a new page reads the queue and resends each pin with the same id and body", async () => {
    const storage = memoryStorage();
    const first = network(["not-saved"]);
    await createPinSender({
      queue: createQueueStore(storage, KEY),
      ...first,
    }).save(entry(3, "Kept as typed"));

    const reloaded = network(["ok"]);
    const queue = createQueueStore(storage, KEY);
    const result = await createPinSender({ queue, ...reloaded }).flush();
    assert.deepEqual(result.sent, [entry(3).id]);
    assert.deepEqual(reloaded.requests, [
      { op: "save", id: entry(3).id, body: "Kept as typed" },
    ]);
    assert.deepEqual(queue.all(), []);
    assert.equal(storage.data.has(KEY), false);
  });

  test("offline, nothing is sent and the pin stays queued; on reconnect it is resent with the same id", async () => {
    const storage = memoryStorage();
    const net = network();
    net.setOnline(false);
    const queue = createQueueStore(storage, KEY);
    const sender = createPinSender({ queue, ...net });
    assert.equal(await sender.save(entry(1)), "offline");
    assert.equal(net.requests.length, 0);
    net.setOnline(true);
    const { sent } = await sender.flush();
    assert.deepEqual(sent, [entry(1).id]);
    assert.deepEqual(
      net.requests.map((r) => r.id),
      [entry(1).id],
    );
    assert.deepEqual(queue.all(), []);
  });

  test("Retry resends every failed pin, each under its own id, and a still-failing one stays", async () => {
    const net = network(["not-saved", "not-saved", "ok", "not-saved"]);
    const queue = createQueueStore(memoryStorage(), KEY);
    const sender = createPinSender({ queue, ...net });
    await sender.save(entry(1));
    await sender.save(entry(2));
    const { sent } = await sender.flush();
    assert.deepEqual(sent, [entry(1).id]);
    assert.deepEqual(
      net.requests.map((r) => r.id),
      [entry(1).id, entry(2).id, entry(1).id, entry(2).id],
    );
    assert.deepEqual(queue.all(), [entry(2)]);
  });

  test("a thrown request counts as not saved: the pin stays queued", async () => {
    const queue = createQueueStore(memoryStorage(), KEY);
    const sender = createPinSender({
      queue,
      online: () => true,
      save: async () => {
        throw new Error("network");
      },
      remove: async () => "ok",
    });
    assert.equal(await sender.save(entry(1)), "not-saved");
    assert.deepEqual(queue.all(), [entry(1)]);
  });

  test("an edit made while a send is in flight stays queued for its own send", async () => {
    let release: () => void = () => undefined;
    const gate = new Promise<void>((r) => (release = r));
    const bodies: string[] = [];
    const queue = createQueueStore(memoryStorage(), KEY);
    const sender = createPinSender({
      queue,
      online: () => true,
      save: async (e) => {
        bodies.push(e.body);
        if (bodies.length === 1) await gate;
        return "ok";
      },
      remove: async () => "ok",
    });
    const firstSend = sender.save(entry(1, "First"));
    await inFlight();
    const edit = sender.save(entry(1, "Edited"));
    release();
    await Promise.all([firstSend, edit]);
    assert.deepEqual(bodies, ["First", "Edited"]);
    assert.deepEqual(queue.all(), []);
  });

  test("a delete drops the entry before its request is sent, and waits for the send in flight", async () => {
    let release: () => void = () => undefined;
    const gate = new Promise<void>((r) => (release = r));
    const order: string[] = [];
    const queue = createQueueStore(memoryStorage(), KEY);
    let queuedAtDelete: boolean | null = null;
    const sender = createPinSender({
      queue,
      online: () => true,
      save: async () => {
        order.push("save starts");
        await gate;
        order.push("save ends");
        return "not-saved";
      },
      remove: async (id) => {
        queuedAtDelete = queue.get(id) !== undefined;
        order.push("delete");
        return "ok";
      },
    });
    const saving = sender.save(entry(1));
    await inFlight();
    const deleting = sender.remove(entry(1).id);
    // Dropped at once, before any delete request.
    assert.deepEqual(queue.all(), []);
    release();
    await Promise.all([saving, deleting]);
    assert.deepEqual(order, ["save starts", "save ends", "delete"]);
    assert.equal(queuedAtDelete, false);
    // A later retry finds nothing to bring back.
    const net = network();
    await createPinSender({ queue, ...net }).flush();
    assert.equal(net.requests.length, 0);
  });

  test("storage that throws leaves the queue in memory for the page", async () => {
    const broken: StorageLike = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {
        throw new Error("denied");
      },
    };
    const queue = createQueueStore(broken, KEY);
    const sender = createPinSender({ queue, ...network(["not-saved"]) });
    await sender.save(entry(1));
    assert.deepEqual(queue.all(), [entry(1)]);
  });

  test("a malformed stored entry is skipped, never sent", async () => {
    const storage = memoryStorage();
    storage.setItem(KEY, JSON.stringify([{ id: 4 }, entry(2), "x"]));
    assert.deepEqual(createQueueStore(storage, KEY).all(), [entry(2)]);
    storage.setItem(KEY, "{not json");
    assert.deepEqual(createQueueStore(storage, KEY).all(), []);
  });
});

describe("C3: storage that reads but refuses writes", () => {
  test("an offline pin stays queued in memory, and a later flush sends it once under its id", async () => {
    const storage = memoryStorage();
    const quota: StorageLike = {
      getItem: (key) => storage.getItem(key),
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
      removeItem: (key) => storage.removeItem(key),
    };
    const net = network();
    net.setOnline(false);
    const queue = createQueueStore(quota, KEY);
    const sender = createPinSender({ queue, ...net });
    assert.equal(await sender.save(entry(1)), "offline");
    assert.deepEqual(queue.all(), [entry(1)]);
    net.setOnline(true);
    const { sent } = await sender.flush();
    assert.deepEqual(sent, [entry(1).id]);
    assert.deepEqual(
      net.requests.map((r) => r.id),
      [entry(1).id],
    );
  });
});

describe("C9: a delete waiting behind a send that comes back closed", () => {
  test("is never sent, and the pin stays queued", async () => {
    let release: () => void = () => undefined;
    const gate = new Promise<void>((r) => (release = r));
    const removed: string[] = [];
    const queue = createQueueStore(memoryStorage(), KEY);
    const sender = createPinSender({
      queue,
      online: () => true,
      save: async () => {
        await gate;
        return "closed";
      },
      remove: async (id) => {
        removed.push(id);
        return "ok";
      },
    });
    const saving = sender.save(entry(1));
    await inFlight();
    const deleting = sender.remove(entry(1).id);
    release();
    assert.equal(await saving, "closed");
    assert.equal(await deleting, "held");
    assert.deepEqual(removed, []);
    assert.deepEqual(queue.all(), [entry(1)]);
  });
});

describe("C3: two tabs for one reviewer share one queue", () => {
  test("a pin queued in each tab survives, whichever closes first", async () => {
    const storage = memoryStorage();
    const tab1 = createQueueStore(storage, KEY);
    const tab2 = createQueueStore(storage, KEY);
    tab1.put(entry(1));
    tab2.put(entry(2));
    assert.deepEqual(
      createQueueStore(storage, KEY)
        .all()
        .map((e) => e.number),
      [1, 2],
    );
  });

  test("a pin deleted in one tab is not revived by the other's reconnect", async () => {
    const storage = memoryStorage();
    const a = createQueueStore(storage, KEY);
    const b = createQueueStore(storage, KEY);
    a.put(entry(1));
    assert.ok(b.get(entry(1).id));
    await createPinSender({ queue: a, ...network() }).remove(entry(1).id);
    const net = network();
    await createPinSender({ queue: b, ...net }).flush();
    assert.deepEqual(net.requests, []);
  });

  test("an edit sent from one tab is not reverted by the other's older body", async () => {
    const storage = memoryStorage();
    const a = createQueueStore(storage, KEY);
    const b = createQueueStore(storage, KEY);
    b.put(entry(1, "Old body"));
    await createPinSender({ queue: a, ...network() }).save(
      entry(1, "New body"),
    );
    const net = network();
    await createPinSender({ queue: b, ...net }).flush();
    assert.deepEqual(net.requests, []);
  });
});

describe("C3: a delete that fails, and Undo", () => {
  test("a failed delete puts an unsent pin back in the queue", async () => {
    const queue = createQueueStore(memoryStorage(), KEY);
    const sender = createPinSender({ queue, ...network(["not-saved"]) });
    queue.put(entry(1));
    assert.equal(await sender.remove(entry(1).id), "not-saved");
    assert.deepEqual(queue.all(), [entry(1)]);
  });

  test("a failed delete of a sent pin queues nothing", async () => {
    const queue = createQueueStore(memoryStorage(), KEY);
    const sender = createPinSender({ queue, ...network(["not-saved"]) });
    await sender.remove(entry(1).id);
    assert.deepEqual(queue.all(), []);
  });

  test("Undo during an in-flight delete is sent after it, under the same id", async () => {
    let release: () => void = () => undefined;
    const gate = new Promise<void>((r) => (release = r));
    const order: string[] = [];
    const queue = createQueueStore(memoryStorage(), KEY);
    const sender = createPinSender({
      queue,
      online: () => true,
      save: async (e) => {
        order.push(`save ${e.id}`);
        return "ok";
      },
      remove: async (id) => {
        order.push(`delete ${id}`);
        await gate;
        return "ok";
      },
    });
    const deleting = sender.remove(entry(1).id);
    await inFlight();
    const undo = sender.save(entry(1));
    release();
    assert.equal(await deleting, "ok");
    assert.equal(await undo, "ok");
    assert.deepEqual(order, [`delete ${entry(1).id}`, `save ${entry(1).id}`]);
    assert.deepEqual(queue.all(), []);
  });
});

describe("C9: closed or revoked holds the queue as it was", () => {
  for (const held of ["closed", "revoked"] as const) {
    test(`a send answered ${held} sends nothing more and leaves every entry queued`, async () => {
      const storage = memoryStorage();
      const net = network([held]);
      const queue = createQueueStore(storage, KEY);
      const sender = createPinSender({ queue, ...net });
      queue.put(entry(1));
      queue.put(entry(2));
      const before = storage.data.get(KEY);
      const { last } = await sender.flush();
      assert.equal(last, held);
      assert.equal(sender.held(), held);
      assert.equal(net.requests.length, 1);
      assert.equal(storage.data.get(KEY), before);
      // Retry, a new pin and Delete all hold.
      assert.equal((await sender.flush()).sent.length, 0);
      assert.equal(await sender.save(entry(3)), "held");
      assert.equal(await sender.remove(entry(1).id), "held");
      assert.equal(net.requests.length, 1);
      assert.deepEqual(
        queue.all().map((e) => e.number),
        [1, 2, 3],
      );
    });
  }
});
