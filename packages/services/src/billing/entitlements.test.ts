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

/** The scripted database as a SystemContext, the only context these services take. */
const systemContext = (answer: Parameters<typeof fakeContext>[0]) => ({
  ...fakeContext(answer),
  system: true as const,
});
const AT = new Date("2026-10-05T12:00:00Z");

/** Answers by query: users lookup, customer link lookup, upsert. */
function script(answers: {
  user?: boolean;
  linkedTo?: string;
  /** The user's current row: customer, subscription, status. */
  link?: [string, string | null, string];
  written?: boolean;
}) {
  return (call: Call): unknown[][] => {
    if (call.sql.startsWith('select "id" from "users"'))
      return answers.user ? [[USER_ID]] : [];
    if (
      call.sql.startsWith(
        'select "stripe_customer_id", "stripe_subscription_id", "status" from "billing_entitlements"',
      )
    )
      return answers.link ? [answers.link] : [];
    if (call.sql.startsWith('select "user_id" from "billing_entitlements"'))
      return answers.linkedTo ? [[answers.linkedTo]] : [];
    if (call.sql.startsWith('insert into "billing_entitlements"'))
      return answers.written === false ? [] : [[USER_ID]];
    if (call.sql.startsWith('update "billing_entitlements"')) return [];
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
  const ctx = systemContext(script({ user: true }));
  assert.deepEqual(await completeCheckout(ctx, checkout), {
    outcome: "applied",
    userId: USER_ID,
  });
  const [insert] = inserts(ctx.calls);
  assert.ok(insert);
  assert.match(insert.sql, /on conflict \("user_id"\) do update set/);
  assert.match(
    insert.sql,
    /where \("billing_entitlements"\."stripe_event_at" < \$\d+ or/,
  );
  assert.ok(insert.params.includes(USER_ID));
  assert.ok(insert.params.includes("cus_synthetic"));
  assert.ok(insert.params.includes("active"));
});

test("an unpaid checkout records the link as incomplete, which entitles nothing", async () => {
  const ctx = systemContext(script({ user: true }));
  await completeCheckout(ctx, { ...checkout, paid: false });
  assert.ok(inserts(ctx.calls)[0]!.params.includes("incomplete"));
  assert.equal(isEntitled({ status: "incomplete" }), false);
  assert.equal(isEntitled({ status: "active" }), true);
  assert.equal(isEntitled({ status: "trialing" }), true);
  assert.equal(isEntitled(undefined), false);
});

test("a checkout for no user of this app changes nothing", async () => {
  const ctx = systemContext(script({ user: false }));
  assert.deepEqual(await completeCheckout(ctx, checkout), {
    outcome: "no-user",
  });
  assert.equal(inserts(ctx.calls).length, 0);
});

test("a customer linked to another user is never moved", async () => {
  const ctx = systemContext(script({ user: true, linkedTo: OTHER_USER }));
  assert.deepEqual(await completeCheckout(ctx, checkout), {
    outcome: "customer-mismatch",
    reason: "customer-taken",
    userId: OTHER_USER,
  });
  assert.equal(inserts(ctx.calls).length, 0);
});

test("an event older than the one applied is stale and changes nothing", async () => {
  const ctx = systemContext(script({ user: true, written: false }));
  assert.deepEqual(await completeCheckout(ctx, checkout), {
    outcome: "stale",
    userId: USER_ID,
  });
});

test("malformed input stops at the validator before any query", async () => {
  const ctx = systemContext(script({ user: true }));
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
  const ctx = systemContext(script({ linkedTo: USER_ID }));
  assert.deepEqual(await syncSubscription(ctx, subscription), {
    outcome: "applied",
    userId: USER_ID,
  });
  const [insert] = inserts(ctx.calls);
  assert.ok(insert!.params.includes("past_due"));
  assert.ok(insert!.params.includes("price_synthetic"));
});

test("an update ahead of its checkout uses the subscription's user_id metadata when that user exists", async () => {
  const ctx = systemContext(script({ user: true }));
  assert.deepEqual(
    await syncSubscription(ctx, { ...subscription, userId: USER_ID }),
    { outcome: "applied", userId: USER_ID },
  );
});

test("a subscription for a customer with no matching user changes nothing", async () => {
  for (const userId of [null, USER_ID]) {
    const ctx = systemContext(script({ user: false }));
    assert.deepEqual(await syncSubscription(ctx, { ...subscription, userId }), {
      outcome: "no-user",
    });
    assert.equal(inserts(ctx.calls).length, 0);
  }
});

test("a late subscription event is stale but fills a plan and period still empty, never overwriting them", async () => {
  const ctx = systemContext(script({ linkedTo: USER_ID, written: false }));
  assert.deepEqual(await syncSubscription(ctx, subscription), {
    outcome: "stale",
    userId: USER_ID,
  });
  const update = ctx.calls.find((call) =>
    call.sql.startsWith('update "billing_entitlements"'),
  );
  assert.ok(update);
  assert.match(
    update.sql,
    /coalesce\("billing_entitlements"\."price_id", \$\d+\)/,
  );
  assert.match(
    update.sql,
    /"price_id" is null or "billing_entitlements"\."current_period_end" is null/,
  );
  assert.doesNotMatch(update.sql, /"status"/);
});

test("a metadata user id that is not a uuid is read as no user, and the event still applies to the linked user", async () => {
  const ctx = systemContext(script({ linkedTo: USER_ID }));
  assert.deepEqual(
    await syncSubscription(ctx, {
      ...subscription,
      status: "canceled",
      userId: "legacy-42",
    }),
    { outcome: "applied", userId: USER_ID },
  );
  assert.ok(inserts(ctx.calls)[0]!.params.includes("canceled"));
});

test("a subscription naming a user who pays through another customer never moves or cancels their row", async () => {
  const ctx = systemContext(
    script({ user: true, link: ["cus_their_own", "sub_theirs", "active"] }),
  );
  assert.deepEqual(
    await syncSubscription(ctx, {
      ...subscription,
      status: "canceled",
      userId: USER_ID,
    }),
    {
      outcome: "customer-mismatch",
      reason: "entitled-elsewhere",
      userId: USER_ID,
    },
  );
  assert.equal(inserts(ctx.calls).length, 0);
});

test("a checkout never relinks a user still entitled through another customer", async () => {
  const ctx = systemContext(
    script({ user: true, link: ["cus_their_own", "sub_theirs", "active"] }),
  );
  assert.deepEqual(await completeCheckout(ctx, checkout), {
    outcome: "customer-mismatch",
    reason: "entitled-elsewhere",
    userId: USER_ID,
  });
  assert.equal(inserts(ctx.calls).length, 0);
});

test("a returning subscriber whose old entitlement ended is relinked to the new customer, and the old plan and period are cleared", async () => {
  const ctx = systemContext(
    script({ user: true, link: ["cus_old", "sub_old", "canceled"] }),
  );
  assert.deepEqual(await completeCheckout(ctx, checkout), {
    outcome: "applied",
    userId: USER_ID,
  });
  const [insert] = inserts(ctx.calls);
  assert.match(insert!.sql, /"price_id" = \$\d+/);
  assert.match(insert!.sql, /"current_period_end" = \$\d+/);
});

test("a checkout for the subscription already on the row keeps its plan and period", async () => {
  const ctx = systemContext(
    script({ user: true, link: ["cus_synthetic", "sub_synthetic", "active"] }),
  );
  await completeCheckout(ctx, checkout);
  const [insert] = inserts(ctx.calls);
  assert.doesNotMatch(insert!.sql, /"price_id" = \$/);
});

test("on a same-second tie an ending event never overwrites a granting one", async () => {
  const ending = systemContext(script({ linkedTo: USER_ID }));
  await syncSubscription(ending, { ...subscription, status: "incomplete" });
  assert.match(
    inserts(ending.calls)[0]!.sql,
    /"stripe_event_at" = \$\d+ and "billing_entitlements"\."status" not in \(\$\d+, \$\d+\)/,
  );
  const granting = systemContext(script({ linkedTo: USER_ID }));
  await syncSubscription(granting, { ...subscription, status: "active" });
  assert.match(
    inserts(granting.calls)[0]!.sql,
    /"stripe_event_at" = \$\d+ and true/,
  );
});

test("an unpaid checkout for a second subscription never downgrades a live one", async () => {
  const ctx = systemContext(
    script({ user: true, link: ["cus_synthetic", "sub_live", "active"] }),
  );
  assert.deepEqual(await completeCheckout(ctx, { ...checkout, paid: false }), {
    outcome: "stale",
    userId: USER_ID,
  });
  assert.equal(inserts(ctx.calls).length, 0);
});

test("the late fill matches the subscription, so an old one's plan never lands on its successor", async () => {
  const ctx = systemContext(script({ linkedTo: USER_ID, written: false }));
  await syncSubscription(ctx, subscription);
  const update = ctx.calls.find((call) =>
    call.sql.startsWith('update "billing_entitlements"'),
  );
  assert.match(update!.sql, /"stripe_subscription_id" = \$\d+/);
  assert.ok(update!.params.includes("sub_synthetic"));
});

test("an older subscription ending on the same customer never cancels the live one", async () => {
  const ctx = systemContext(
    script({
      linkedTo: USER_ID,
      link: ["cus_synthetic", "sub_live", "active"],
    }),
  );
  assert.deepEqual(
    await syncSubscription(ctx, {
      ...subscription,
      subscriptionId: "sub_old",
      status: "canceled",
    }),
    { outcome: "superseded", userId: USER_ID },
  );
  assert.equal(inserts(ctx.calls).length, 0);
});

test("a new subscription that entitles replaces the old one on the row", async () => {
  const ctx = systemContext(
    script({ linkedTo: USER_ID, link: ["cus_synthetic", "sub_old", "active"] }),
  );
  assert.deepEqual(
    await syncSubscription(ctx, { ...subscription, status: "active" }),
    { outcome: "applied", userId: USER_ID },
  );
});
