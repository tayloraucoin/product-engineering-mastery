/**
 * STK-21 C1 and C2: each default event, signed and synthetic, goes through the
 * real webhook spine to its own handler file, which calls the entitlement
 * service with the right user and entitlement. A stand-in service records each
 * call; the service itself is tested in @pem/services.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import Stripe from "stripe";

import type { LogFields, Logger } from "@pem/observability/logger";
import type { EntitlementOutcome } from "@pem/services/billing";
import { Invalid } from "@pem/services/errors";

import { handleStripeWebhook, type WebhookLedger } from "../handle.ts";
import { createHandlers } from "./map.ts";

const SECRET = "whsec_synthetic_test_secret";
const USER_ID = "00000000-0000-4000-8000-000000000001";
const CREATED = 1_790_000_000;

function signed(id: string, type: string, object: Record<string, unknown>) {
  const body = JSON.stringify({
    id,
    object: "event",
    type,
    api_version: "2026-01-01",
    created: CREATED,
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    data: { object },
  });
  return {
    body,
    signature: Stripe.webhooks.generateTestHeaderString({
      payload: body,
      secret: SECRET,
    }),
  };
}

const ledger: WebhookLedger = {
  claim: async () => "claimed",
  markProcessed: async () => {},
  release: async () => {},
};

function standIn(
  outcome: EntitlementOutcome | Error = { outcome: "applied", userId: USER_ID },
) {
  const calls: { service: string; input: unknown }[] = [];
  const lines: { level: string; event: string; fields?: LogFields }[] = [];
  const at = (level: string) => (event: string, fields?: LogFields) =>
    lines.push({ level, event, fields });
  const log: Logger = {
    info: at("info"),
    warn: at("warn"),
    error: at("error"),
  };
  const answer = async (service: string, input: unknown) => {
    calls.push({ service, input });
    if (outcome instanceof Error) throw outcome;
    return outcome;
  };
  const handlers = createHandlers({
    completeCheckout: (input) => answer("completeCheckout", input),
    syncSubscription: (input) => answer("syncSubscription", input),
    log,
  });
  const deliver = (delivery: { body: string; signature: string }) =>
    handleStripeWebhook(delivery, {
      webhookSecret: SECRET,
      livemode: false,
      handlers,
      ledger,
    });
  return { calls, lines, deliver };
}

const subscriptionObject = (overrides: Record<string, unknown> = {}) => ({
  id: "sub_synthetic",
  object: "subscription",
  customer: "cus_synthetic",
  status: "active",
  metadata: { user_id: USER_ID },
  items: {
    object: "list",
    data: [
      {
        id: "si_synthetic",
        price: { id: "price_synthetic" },
        current_period_end: CREATED + 30 * 86_400,
      },
    ],
  },
  ...overrides,
});

test("C1: checkout.session.completed reaches its handler, which links the checkout's user to the customer", async () => {
  const { calls, deliver } = standIn();
  const result = await deliver(
    signed("evt_checkout", "checkout.session.completed", {
      id: "cs_synthetic",
      object: "checkout.session",
      mode: "subscription",
      client_reference_id: USER_ID,
      customer: "cus_synthetic",
      subscription: "sub_synthetic",
      payment_status: "paid",
    }),
  );
  assert.equal(result.status, 200);
  assert.deepEqual(calls, [
    {
      service: "completeCheckout",
      input: {
        userId: USER_ID,
        customerId: "cus_synthetic",
        subscriptionId: "sub_synthetic",
        paid: true,
        occurredAt: new Date(CREATED * 1000),
      },
    },
  ]);
});

test("C1: a payment-mode checkout is not a subscription and calls nothing", async () => {
  const { calls, deliver } = standIn();
  await deliver(
    signed("evt_payment", "checkout.session.completed", {
      id: "cs_payment",
      object: "checkout.session",
      mode: "payment",
      client_reference_id: USER_ID,
      customer: "cus_synthetic",
      subscription: null,
      payment_status: "paid",
    }),
  );
  assert.deepEqual(calls, []);
});

test("C1: customer.subscription.updated reaches its handler, which syncs status, plan and period", async () => {
  const { calls, deliver } = standIn();
  const result = await deliver(
    signed(
      "evt_updated",
      "customer.subscription.updated",
      subscriptionObject({ status: "past_due" }),
    ),
  );
  assert.equal(result.status, 200);
  assert.deepEqual(calls, [
    {
      service: "syncSubscription",
      input: {
        customerId: "cus_synthetic",
        subscriptionId: "sub_synthetic",
        status: "past_due",
        priceId: "price_synthetic",
        currentPeriodEnd: new Date((CREATED + 30 * 86_400) * 1000),
        userId: USER_ID,
        occurredAt: new Date(CREATED * 1000),
      },
    },
  ]);
});

test("C1: customer.subscription.deleted reaches its handler, which ends the entitlement", async () => {
  const { calls, deliver } = standIn();
  await deliver(
    signed(
      "evt_deleted",
      "customer.subscription.deleted",
      subscriptionObject({ status: "canceled", metadata: {} }),
    ),
  );
  assert.equal(calls.length, 1);
  const input = calls[0]!.input as { status: string; userId: string | null };
  assert.equal(calls[0]!.service, "syncSubscription");
  assert.equal(input.status, "canceled");
  assert.equal(input.userId, null);
});

test("C2: an event for a customer with no matching user changes nothing and logs once", async () => {
  const { lines, deliver } = standIn({ outcome: "no-user" });
  const result = await deliver(
    signed("evt_orphan", "customer.subscription.updated", subscriptionObject()),
  );
  assert.equal(result.status, 200);
  const warned = lines.filter((line) => line.event === "billing.no_user");
  assert.equal(warned.length, 1);
  assert.equal(warned[0]!.level, "warn");
  assert.deepEqual(warned[0]!.fields?.tags, {
    event: "customer.subscription.updated",
    eventId: "evt_orphan",
  });
});

test("an event the validator refuses is logged as an error and acknowledged, not retried for three days", async () => {
  const { lines, deliver } = standIn(
    new Invalid("Check userId", { userId: ["bad"] }),
  );
  const result = await deliver(
    signed("evt_bad", "checkout.session.completed", {
      id: "cs_bad",
      object: "checkout.session",
      mode: "subscription",
      client_reference_id: "not-a-user",
      customer: "cus_synthetic",
      subscription: "sub_synthetic",
      payment_status: "paid",
    }),
  );
  assert.equal(result.status, 200);
  assert.ok(
    lines.some(
      (line) =>
        line.event === "billing.event_invalid" && line.level === "error",
    ),
  );
});

test("a database failure in the service is retried: the delivery answers 500", async () => {
  const { deliver } = standIn(new Error("connection refused"));
  const result = await deliver(
    signed("evt_down", "customer.subscription.updated", subscriptionObject()),
  );
  assert.equal(result.status, 500);
});
