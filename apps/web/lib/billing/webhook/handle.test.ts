import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import Stripe from "stripe";

import type { StripeEventClaim } from "@pem/db/stripe-event-ledger";

import type { WebhookHandlers } from "./dispatch.ts";
import {
  handleStripeWebhook,
  RETRYABLE_STATUS,
  type WebhookLedger,
} from "./handle.ts";

const SECRET = "whsec_synthetic_test_secret";

/** A synthetic event, signed the way Stripe signs a delivery. */
function signedDelivery(
  event: { id: string; type: string },
  secret: string = SECRET,
) {
  const body = JSON.stringify({
    id: event.id,
    object: "event",
    type: event.type,
    api_version: "2026-01-01",
    created: 1_790_000_000,
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    data: { object: { id: "cs_synthetic", object: "checkout.session" } },
  });
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload: body,
    secret,
  });
  return { body, signature };
}

/** The ledger's contract in memory: claim, mark processed, release. */
function memoryLedger() {
  const rows = new Map<string, "processing" | "processed">();
  const calls: string[] = [];
  const ledger: WebhookLedger = {
    async claim({ id }): Promise<StripeEventClaim> {
      calls.push(`claim ${id}`);
      const status = rows.get(id);
      if (status === "processed") return "processed";
      if (status === "processing") return "in-flight";
      rows.set(id, "processing");
      return "claimed";
    },
    async markProcessed(id) {
      calls.push(`mark ${id}`);
      if (rows.get(id) === "processing") rows.set(id, "processed");
    },
    async release(id) {
      calls.push(`release ${id}`);
      if (rows.get(id) === "processing") rows.delete(id);
    },
  };
  return { ledger, rows, calls };
}

/** A fixture handler map that records which handler saw which event. */
function fixtureHandlers(options: { failOn?: string } = {}) {
  const seen: string[] = [];
  const handlers: WebhookHandlers = {
    "checkout.session.completed": async (event) => {
      if (options.failOn === event.id) throw new Error("synthetic failure");
      seen.push(`checkout.session.completed ${event.id}`);
    },
    "customer.subscription.deleted": async (event) => {
      seen.push(`customer.subscription.deleted ${event.id}`);
    },
  };
  return { handlers, seen };
}

let store: ReturnType<typeof memoryLedger>;
beforeEach(() => {
  store = memoryLedger();
});

describe("C1: an unverified webhook is rejected and a replay is ignored", () => {
  test("a signature made with another secret is rejected before anything is read or written", async () => {
    const { handlers, seen } = fixtureHandlers();
    const delivery = signedDelivery(
      { id: "evt_forged", type: "checkout.session.completed" },
      "whsec_someone_else",
    );
    const result = await handleStripeWebhook(delivery, {
      webhookSecret: SECRET,
      handlers,
      ledger: store.ledger,
    });
    assert.equal(result.status, 400);
    assert.equal(result.body.outcome, "rejected");
    assert.deepEqual(seen, []);
    assert.deepEqual(store.calls, []);
  });

  test("a body changed after signing is rejected", async () => {
    const { handlers, seen } = fixtureHandlers();
    const delivery = signedDelivery({
      id: "evt_tampered",
      type: "checkout.session.completed",
    });
    const result = await handleStripeWebhook(
      { ...delivery, body: delivery.body.replace("cs_synthetic", "cs_other") },
      { webhookSecret: SECRET, handlers, ledger: store.ledger },
    );
    assert.equal(result.status, 400);
    assert.deepEqual(seen, []);
    assert.deepEqual(store.calls, []);
  });

  test("a delivery with no signature header is rejected", async () => {
    const { handlers } = fixtureHandlers();
    const { body } = signedDelivery({
      id: "evt_unsigned",
      type: "checkout.session.completed",
    });
    const result = await handleStripeWebhook(
      { body, signature: null },
      { webhookSecret: SECRET, handlers, ledger: store.ledger },
    );
    assert.equal(result.status, 400);
    assert.deepEqual(store.calls, []);
  });

  test("a replayed event id is acknowledged and its handler does not run again", async () => {
    const { handlers, seen } = fixtureHandlers();
    const delivery = signedDelivery({
      id: "evt_replayed",
      type: "checkout.session.completed",
    });
    const deps = { webhookSecret: SECRET, handlers, ledger: store.ledger };

    const first = await handleStripeWebhook(delivery, deps);
    const replay = await handleStripeWebhook(delivery, deps);

    assert.equal(first.status, 200);
    assert.equal(first.body.outcome, "processed");
    assert.equal(replay.status, 200);
    assert.equal(replay.body.outcome, "duplicate");
    assert.deepEqual(seen, ["checkout.session.completed evt_replayed"]);
  });

  test("an event another delivery is still handling gets a retryable non-2xx", async () => {
    const { handlers, seen } = fixtureHandlers();
    store.rows.set("evt_busy", "processing");
    const result = await handleStripeWebhook(
      signedDelivery({ id: "evt_busy", type: "checkout.session.completed" }),
      { webhookSecret: SECRET, handlers, ledger: store.ledger },
    );
    assert.equal(result.status, 409);
    assert.deepEqual(seen, []);
  });

  test("with no signing secret configured nothing is verified, and Stripe is told to retry", async () => {
    const { handlers, seen } = fixtureHandlers();
    const result = await handleStripeWebhook(
      signedDelivery({ id: "evt_early", type: "checkout.session.completed" }),
      { webhookSecret: undefined, handlers, ledger: store.ledger },
    );
    assert.equal(result.status, RETRYABLE_STATUS);
    assert.deepEqual(seen, []);
    assert.deepEqual(store.calls, []);
  });
});

describe("C2: a signed event reaches the handler its type maps to", () => {
  test("each type goes to its own handler, and the id is recorded only after", async () => {
    const { handlers, seen } = fixtureHandlers();
    const deps = { webhookSecret: SECRET, handlers, ledger: store.ledger };

    const subscription = await handleStripeWebhook(
      signedDelivery({ id: "evt_sub", type: "customer.subscription.deleted" }),
      deps,
    );
    const checkout = await handleStripeWebhook(
      signedDelivery({ id: "evt_cs", type: "checkout.session.completed" }),
      deps,
    );

    assert.equal(subscription.status, 200);
    assert.equal(checkout.status, 200);
    assert.deepEqual(seen, [
      "customer.subscription.deleted evt_sub",
      "checkout.session.completed evt_cs",
    ]);
    assert.deepEqual(store.calls, [
      "claim evt_sub",
      "mark evt_sub",
      "claim evt_cs",
      "mark evt_cs",
    ]);
    assert.equal(store.rows.get("evt_cs"), "processed");
  });
});

describe("C3: an event type with no handler is acknowledged and dispatched nowhere", () => {
  test("a 2xx, no handler runs, and the ledger is not touched", async () => {
    const { handlers, seen } = fixtureHandlers();
    const result = await handleStripeWebhook(
      signedDelivery({ id: "evt_other", type: "invoice.paid" }),
      { webhookSecret: SECRET, handlers, ledger: store.ledger },
    );
    assert.ok(result.status >= 200 && result.status < 300);
    assert.equal(result.body.outcome, "ignored");
    assert.deepEqual(seen, []);
    assert.deepEqual(store.calls, []);
  });

  test("a type named like an object property is not a handler", async () => {
    const { handlers, seen } = fixtureHandlers();
    const result = await handleStripeWebhook(
      signedDelivery({ id: "evt_proto", type: "constructor" }),
      { webhookSecret: SECRET, handlers, ledger: store.ledger },
    );
    assert.equal(result.status, 200);
    assert.equal(result.body.outcome, "ignored");
    assert.deepEqual(seen, []);
  });
});

describe("C4: a handler that throws gets a retryable 5xx and is not recorded", () => {
  test("the claim is released, the id is not processed, and the retry runs the handler", async () => {
    const failing = fixtureHandlers({ failOn: "evt_flaky" });
    const delivery = signedDelivery({
      id: "evt_flaky",
      type: "checkout.session.completed",
    });

    const failed = await handleStripeWebhook(delivery, {
      webhookSecret: SECRET,
      handlers: failing.handlers,
      ledger: store.ledger,
    });

    assert.equal(failed.status, RETRYABLE_STATUS);
    assert.ok(failed.status >= 500);
    assert.equal(failed.body.outcome, "failed");
    assert.ok(!store.calls.includes("mark evt_flaky"));
    assert.equal(store.rows.has("evt_flaky"), false);

    const healthy = fixtureHandlers();
    const retried = await handleStripeWebhook(delivery, {
      webhookSecret: SECRET,
      handlers: healthy.handlers,
      ledger: store.ledger,
    });
    assert.equal(retried.status, 200);
    assert.deepEqual(healthy.seen, ["checkout.session.completed evt_flaky"]);
    assert.equal(store.rows.get("evt_flaky"), "processed");
  });

  test("a ledger that cannot be written is retryable too", async () => {
    const { handlers, seen } = fixtureHandlers();
    const broken: WebhookLedger = {
      ...store.ledger,
      claim: async () => {
        throw new Error("synthetic: database unreachable");
      },
    };
    const result = await handleStripeWebhook(
      signedDelivery({ id: "evt_nodb", type: "checkout.session.completed" }),
      { webhookSecret: SECRET, handlers, ledger: broken },
    );
    assert.equal(result.status, RETRYABLE_STATUS);
    assert.deepEqual(seen, []);
  });
});
