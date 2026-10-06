/**
 * STK-21: the entitlement service against a scripted database. Each test
 * answers the queries the service sends: whether the user exists, which user a
 * customer is linked to, and whether the guarded upsert wrote a row.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { Invalid } from "../errors.ts";
import { fakeContext, USER_ID, type Call } from "../test-context.ts";
import {
  completeCheckout,
  isEntitled,
  syncSubscription,
} from "./entitlements.ts";

const OTHER_USER = "00000000-0000-4000-8000-000000000002";
const AT = new Date("2026-10-05T12:00:00Z");

/** Answers by query: users lookup, customer link lookup, upsert. */
function script(answers: {
  user?: boolean;
  linkedTo?: string;
  written?: boolean;
}) {
  return (call: Call): unknown[][] => {
    if (call.sql.startsWith('select "id" from "users"'))
      return answers.user ? [[USER_ID]] : [];
    if (call.sql.startsWith('select "user_id" from "billing_entitlements"'))
      return answers.linkedTo ? [[answers.linkedTo]] : [];
    if (call.sql.startsWith('insert into "billing_entitlements"'))
      return answers.written === false ? [] : [[USER_ID]];
    throw new Error(`unexpected query: ${call.sql}`);
  };
}

const checkout = {
  userId: USER_ID,
  customerId: "cus_synthetic",
  subscriptionId: "sub_synthetic",
  paid: true,
  occurredAt: AT,
};

const subscription = {
  customerId: "cus_synthetic",
  subscriptionId: "sub_synthetic",
  status: "past_due",
  priceId: "price_synthetic",
  currentPeriodEnd: new Date("2026-11-05T12:00:00Z"),
  userId: null,
  occurredAt: AT,
};

const inserts = (calls: Call[]) =>
  calls.filter((call) =>
    call.sql.startsWith('insert into "billing_entitlements"'),
  );

test("a paid checkout links the user to the customer and makes them active, guarded by the event's time", async () => {
  const ctx = fakeContext(script({ user: true }));
  assert.deepEqual(await completeCheckout(ctx, checkout), {
    outcome: "applied",
    userId: USER_ID,
  });
  const [insert] = inserts(ctx.calls);
  assert.ok(insert);
  assert.match(insert.sql, /on conflict \("user_id"\) do update set/);
  assert.match(
    insert.sql,
    /where "billing_entitlements"\."stripe_event_at" <= \$\d+/,
  );
  assert.ok(insert.params.includes(USER_ID));
  assert.ok(insert.params.includes("cus_synthetic"));
  assert.ok(insert.params.includes("active"));
});

test("an unpaid checkout records the link as incomplete, which entitles nothing", async () => {
  const ctx = fakeContext(script({ user: true }));
  await completeCheckout(ctx, { ...checkout, paid: false });
  assert.ok(inserts(ctx.calls)[0]!.params.includes("incomplete"));
  assert.equal(isEntitled({ status: "incomplete" }), false);
  assert.equal(isEntitled({ status: "active" }), true);
  assert.equal(isEntitled({ status: "trialing" }), true);
  assert.equal(isEntitled(undefined), false);
});

test("a checkout for no user of this app changes nothing", async () => {
  const ctx = fakeContext(script({ user: false }));
  assert.deepEqual(await completeCheckout(ctx, checkout), {
    outcome: "no-user",
  });
  assert.equal(inserts(ctx.calls).length, 0);
});

test("a customer linked to another user is never moved", async () => {
  const ctx = fakeContext(script({ user: true, linkedTo: OTHER_USER }));
  assert.deepEqual(await completeCheckout(ctx, checkout), {
    outcome: "customer-mismatch",
    userId: OTHER_USER,
  });
  assert.equal(inserts(ctx.calls).length, 0);
});

test("an event older than the one applied is stale and changes nothing", async () => {
  const ctx = fakeContext(script({ user: true, written: false }));
  assert.deepEqual(await completeCheckout(ctx, checkout), {
    outcome: "stale",
    userId: USER_ID,
  });
});

test("malformed input stops at the validator before any query", async () => {
  const ctx = fakeContext(script({ user: true }));
  await assert.rejects(
    completeCheckout(ctx, { ...checkout, userId: "not-a-uuid" }),
    Invalid,
  );
  await assert.rejects(
    syncSubscription(ctx, { ...subscription, customerId: "acct_1" }),
    Invalid,
  );
  assert.equal(ctx.calls.length, 0);
});

test("a subscription update lands on the user its customer is linked to", async () => {
  const ctx = fakeContext(script({ linkedTo: USER_ID }));
  assert.deepEqual(await syncSubscription(ctx, subscription), {
    outcome: "applied",
    userId: USER_ID,
  });
  const [insert] = inserts(ctx.calls);
  assert.ok(insert!.params.includes("past_due"));
  assert.ok(insert!.params.includes("price_synthetic"));
});

test("an update ahead of its checkout uses the subscription's user_id metadata when that user exists", async () => {
  const ctx = fakeContext(script({ user: true }));
  assert.deepEqual(
    await syncSubscription(ctx, { ...subscription, userId: USER_ID }),
    { outcome: "applied", userId: USER_ID },
  );
});

test("a subscription for a customer with no matching user changes nothing", async () => {
  for (const userId of [null, USER_ID]) {
    const ctx = fakeContext(script({ user: false }));
    assert.deepEqual(await syncSubscription(ctx, { ...subscription, userId }), {
      outcome: "no-user",
    });
    assert.equal(inserts(ctx.calls).length, 0);
  }
});
