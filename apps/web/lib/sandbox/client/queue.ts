/**
 * The unsent-pin queue and its sender (pins.md "Sending", S17,
 * data-contract.md), pure: storage and the network are injected.
 *
 * - The browser mints the id and queues the pin before sending it. An entry
 *   leaves the queue only on the server's ok for exactly what was sent, or
 *   before its delete is sent, so a late retry cannot bring a deleted pin
 *   back.
 * - A failed send stays queued and is resent under the same id on load, on
 *   reconnect and on Retry (`flush`).
 * - One request at a time per id: a delete or an edit waits for the send in
 *   flight, or the earlier request could land after it.
 * - Two tabs for one reviewer share the queue: storage is read before every
 *   step, never cached.
 * - A delete that fails puts an unsent pin back in the queue.
 * - Closed or revoked holds the queue untouched and sends nothing more; it is
 *   LAB-21's to show.
 *
 * The key and fields are an interface LAB-17 and LAB-21 read:
 * localStorage `sandbox:pin-queue:<slug>:<reviewerId>`, a JSON array of
 * `{ id, number, design, kind, body, anchor, viewportW, viewportH,
 * clientCreatedAt }`, `body` as last typed. Storage can throw (private
 * windows, a full quota): the queue then lives in memory for the page.
 * Prior art, never copied: K `review-context.tsx:105-183`.
 */

import type { Anchor } from "./anchor.ts";

export const PIN_KINDS = ["problem", "question", "suggestion", "keep"] as const;
export type PinKind = (typeof PIN_KINDS)[number];

/** One pin as the browser holds it, queued or sent. */
export type QueueEntry = {
  id: string;
  number: number;
  design: string;
  kind: PinKind | null;
  body: string;
  anchor: Anchor;
  viewportW: number;
  viewportH: number;
  /** ISO 8601. */
  clientCreatedAt: string;
};

/** The comments actions' fixed results (`lib/sandbox/comments.ts`). */
export type SendResult = "ok" | "closed" | "revoked" | "limit" | "not-saved";

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function queueKey(slug: string, reviewerId: string): string {
  return `sandbox:pin-queue:${slug}:${reviewerId}`;
}

function isEntry(value: unknown): value is QueueEntry {
  const e = value as Partial<QueueEntry> | null;
  return (
    !!e &&
    typeof e.id === "string" &&
    Number.isInteger(e.number) &&
    typeof e.design === "string" &&
    (e.kind === null || (PIN_KINDS as readonly unknown[]).includes(e.kind)) &&
    typeof e.body === "string" &&
    !!e.anchor &&
    typeof e.anchor === "object" &&
    typeof e.viewportW === "number" &&
    typeof e.viewportH === "number" &&
    typeof e.clientCreatedAt === "string"
  );
}

export type QueueStore = {
  all(): QueueEntry[];
  get(id: string): QueueEntry | undefined;
  /** Adds the entry, or replaces the one with its id in place. */
  put(entry: QueueEntry): void;
  drop(id: string): void;
};

/**
 * The queue for one slug and reviewer. Read from storage once; every change
 * is written back. A storage that throws leaves the queue in memory.
 */
export function createQueueStore(
  storage: StorageLike | null,
  key: string,
): QueueStore {
  // Storage is read again before every step, so two tabs for one reviewer
  // share one queue: neither writes back an array the other has changed.
  // Memory holds the queue only when storage cannot.
  let memory: QueueEntry[] = [];
  const read = (): QueueEntry[] => {
    if (!storage) return memory;
    try {
      const raw = storage.getItem(key);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      memory = Array.isArray(parsed) ? parsed.filter(isEntry) : [];
    } catch {
      // Unreadable: keep what this page last knew.
    }
    return memory;
  };
  const write = (entries: QueueEntry[]) => {
    memory = entries;
    try {
      if (entries.length) storage?.setItem(key, JSON.stringify(entries));
      else storage?.removeItem(key);
    } catch {
      // Memory still holds it for this page.
    }
  };
  return {
    all: () => read().slice(),
    get: (id) => read().find((e) => e.id === id),
    put(entry) {
      const entries = read();
      const at = entries.findIndex((e) => e.id === entry.id);
      write(
        at === -1
          ? [...entries, entry]
          : entries.map((e, i) => (i === at ? entry : e)),
      );
    },
    drop(id) {
      write(read().filter((e) => e.id !== id));
    },
  };
}

/** What a send came to: the server's result, or why nothing was sent. */
export type SendOutcome = SendResult | "offline" | "held" | "gone";

export type PinSenderDeps = {
  queue: QueueStore;
  save(entry: QueueEntry): Promise<SendResult>;
  remove(id: string): Promise<SendResult>;
  online(): boolean;
};

export type PinSender = {
  /** Queues the pin (new, edited, or restored by Undo), then sends it. */
  save(entry: QueueEntry): Promise<SendOutcome>;
  /** Resends every queued pin, one at a time; stops once held. */
  flush(): Promise<{ sent: string[]; last: SendOutcome | null }>;
  /** Drops the pin from the queue, then sends its delete after any send in flight. */
  remove(id: string): Promise<SendOutcome>;
  /** Closed or revoked once the server said so; nothing is sent after. */
  held(): "closed" | "revoked" | null;
};

const same = (a: QueueEntry, b: QueueEntry | undefined) =>
  !!b && JSON.stringify(a) === JSON.stringify(b);

export function createPinSender(deps: PinSenderDeps): PinSender {
  const chains = new Map<string, Promise<unknown>>();
  let held: "closed" | "revoked" | null = null;

  /** Runs `task` after every earlier task for this id, success or failure. */
  function inTurn<T>(id: string, task: () => Promise<T>): Promise<T> {
    const previous = chains.get(id) ?? Promise.resolve();
    const next = previous.then(task, task);
    const settled = next.catch(() => undefined);
    chains.set(id, settled);
    void settled.then(() => {
      if (chains.get(id) === settled) chains.delete(id);
    });
    return next;
  }

  function hold(result: SendResult) {
    if (result === "closed" || result === "revoked") held = result;
  }

  function send(id: string): Promise<SendOutcome> {
    return inTurn(id, async (): Promise<SendOutcome> => {
      if (held) return "held";
      const entry = deps.queue.get(id);
      if (!entry) return "gone";
      if (!deps.online()) return "offline";
      let result: SendResult;
      try {
        result = await deps.save(entry);
      } catch {
        result = "not-saved";
      }
      hold(result);
      // Only the ok for exactly what is queued clears it: an edit made
      // while this send was in flight stays queued for its own send.
      if (result === "ok" && same(entry, deps.queue.get(id)))
        deps.queue.drop(id);
      return result;
    });
  }

  return {
    save(entry) {
      deps.queue.put(entry);
      return send(entry.id);
    },
    async flush() {
      const sent: string[] = [];
      let last: SendOutcome | null = null;
      for (const entry of deps.queue.all()) {
        if (held) break;
        last = await send(entry.id);
        if (last === "ok") sent.push(entry.id);
        if (last === "offline") break;
      }
      return { sent, last };
    },
    remove(id) {
      if (held) return Promise.resolve("held");
      // Dropped before the delete is sent: a retry later finds nothing.
      const queued = deps.queue.get(id);
      deps.queue.drop(id);
      return inTurn(id, async (): Promise<SendOutcome> => {
        let result: SendResult;
        try {
          result = await deps.remove(id);
        } catch {
          result = "not-saved";
        }
        hold(result);
        // Not deleted: an unsent pin goes back in the queue, unless an Undo
        // has queued it again meanwhile.
        if (result !== "ok" && queued && !deps.queue.get(id))
          deps.queue.put(queued);
        return result;
      });
    },
    held: () => held,
  };
}
