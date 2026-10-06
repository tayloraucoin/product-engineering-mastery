/**
 * The Stripe webhook ledger against the local Supabase image (`yarn test:db`;
 * never part of `yarn test`): a claim, a replay, a live claim another delivery
 * holds, a stale claim taken over, a release, and the table closed to users.
 * The route's own logic is unit-tested with signed synthetic events in
 * apps/web/lib/billing/webhook/handle.test.ts; this proves the SQL under it.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, test } from "node:test";
import { eq, sql } from "drizzle-orm";
import type postgres from "postgres";

import {
  applySetup,
  openMigrationClient,
  runMigrations,
} from "../scripts/database.ts";
import { migrationUrl, requireTier, runtimeUrl } from "../scripts/env.ts";
import {
  claimStripeEvent,
  markStripeEventProcessed,
  pruneStripeEvents,
  releaseStripeEvent,
} from "../src/billing/stripe-event-ledger.ts";
import { createDb, type Db } from "../src/client.ts";
import { describeUrl } from "../src/connection.ts";
import { assertLoopbackClient } from "../src/loopback.ts";
import { createRlsClient } from "../src/rls.ts";
import { billingEntitlements, stripeEvents } from "../src/schema/index.ts";

const run = randomUUID().slice(0, 8);
const eventId = (name: string) => `evt_test_${run}_${name}`;
const user = randomUUID();

let admin: postgres.Sql | undefined;
let db: Db;

before(async () => {
  const tier = requireTier();
  if (tier !== "local") {
    throw new Error(
      `yarn test:db runs only against the local image; DATABASE_ENVIRONMENT is ${tier}.`,
    );
  }
  const url = migrationUrl();
  const client = openMigrationClient(url, tier);
  assertLoopbackClient(client);
  try {
    await client`select 1`;
  } catch (error) {
    await client.end({ timeout: 0 });
    throw new Error(
      `The local Supabase image is not reachable at ${describeUrl(url)}. Prepare your own Postgres with yarn db:setup:local, or start Docker's with yarn db:local, then rerun yarn test:db. (${error instanceof Error ? error.message : String(error)})`,
    );
  }
  admin = client;
  await runMigrations(client);
  await applySetup(client);
  await client`insert into auth.users (id, email) values (${user}, 'billing@example.test')`;
  db = createDb({ url: runtimeUrl(), tier });
  assertLoopbackClient(db.$client);
});

after(async () => {
  await db?.$client.end();
  if (!admin) return;
  await admin`delete from public.stripe_events where id like ${`evt_test_${run}_%`}`;
  await admin`delete from public.billing_entitlements where user_id = ${user}`;
  await admin`delete from auth.users where id = ${user}`;
  await admin.end();
});

const statusOf = async (id: string) =>
  (
    await db
      .select({ status: stripeEvents.status })
      .from(stripeEvents)
      .where(eq(stripeEvents.id, id))
  )[0]?.status;

describe("the Stripe event ledger", () => {
  test("a new event is claimed, and is processed only once marked", async () => {
    const id = eventId("new");
    assert.equal(
      await claimStripeEvent(db, { id, type: "invoice.paid" }),
      "claimed",
    );
    assert.equal(await statusOf(id), "processing");
    await markStripeEventProcessed(db, id);
    assert.equal(await statusOf(id), "processed");
  });

  test("a processed event is a duplicate, and stays processed", async () => {
    const id = eventId("replay");
    await claimStripeEvent(db, { id, type: "invoice.paid" });
    await markStripeEventProcessed(db, id);
    assert.equal(
      await claimStripeEvent(db, { id, type: "invoice.paid" }),
      "processed",
    );
    await releaseStripeEvent(db, id);
    assert.equal(await statusOf(id), "processed");
  });

  test("a live claim is in flight to a second delivery", async () => {
    const id = eventId("live");
    await claimStripeEvent(db, { id, type: "invoice.paid" });
    assert.equal(
      await claimStripeEvent(db, { id, type: "invoice.paid" }),
      "in-flight",
    );
  });

  test("a claim older than the lease is taken over", async () => {
    const id = eventId("stale");
    await claimStripeEvent(db, { id, type: "invoice.paid" });
    await db
      .update(stripeEvents)
      .set({ claimedAt: sql`now() - interval '1 hour'` })
      .where(eq(stripeEvents.id, id));
    assert.equal(
      await claimStripeEvent(db, { id, type: "invoice.paid" }, 600),
      "claimed",
    );
  });

  test("a released claim leaves no row, so the retry claims it", async () => {
    const id = eventId("release");
    await claimStripeEvent(db, { id, type: "invoice.paid" });
    await releaseStripeEvent(db, id);
    assert.equal(await statusOf(id), undefined);
    assert.equal(
      await claimStripeEvent(db, { id, type: "invoice.paid" }),
      "claimed",
    );
  });

  test("the prune drops processed rows past the retention and keeps the rest (STK-21)", async () => {
    const old = eventId("prune-old");
    const recent = eventId("prune-recent");
    const held = eventId("prune-held");
    for (const id of [old, recent, held])
      await claimStripeEvent(db, { id, type: "invoice.paid" });
    await markStripeEventProcessed(db, old);
    await markStripeEventProcessed(db, recent);
    await db
      .update(stripeEvents)
      .set({ processedAt: sql`now() - interval '31 days'` })
      .where(eq(stripeEvents.id, old));
    await db
      .update(stripeEvents)
      .set({ claimedAt: sql`now() - interval '31 days'` })
      .where(eq(stripeEvents.id, held));
    assert.ok((await pruneStripeEvents(db, 30)) >= 1);
    assert.equal(await statusOf(old), undefined);
    assert.equal(await statusOf(recent), "processed");
    assert.equal(await statusOf(held), "processing");
  });

  test("a signed-in user can neither read nor grant an entitlement, their own included (STK-21)", async () => {
    // The service writes on the singleton; a user's own row is still invisible to them.
    await db.insert(billingEntitlements).values({
      userId: user,
      stripeCustomerId: `cus_test_${run}`,
      status: "active",
      stripeEventAt: new Date(),
    });
    const rls = createRlsClient(db, { userId: user, role: "user" });
    assert.deepEqual(
      await rls.execute((tx) => tx.select().from(billingEntitlements)),
      [],
    );
    await assert.rejects(
      rls.execute((tx) =>
        tx
          .update(billingEntitlements)
          .set({ status: "active" })
          .where(eq(billingEntitlements.userId, user))
          .returning({ userId: billingEntitlements.userId })
          .then((rows) => {
            if (rows.length === 0) throw new Error("no row updated");
          }),
      ),
    );
    await db
      .delete(billingEntitlements)
      .where(eq(billingEntitlements.userId, user));
    await assert.rejects(
      rls.execute((tx) =>
        tx.insert(billingEntitlements).values({
          userId: user,
          stripeCustomerId: `cus_forged_${run}`,
          status: "active",
          stripeEventAt: new Date(),
        }),
      ),
    );
  });

  test("a signed-in user reads and writes nothing in the ledger", async () => {
    const id = eventId("rls");
    await claimStripeEvent(db, { id, type: "invoice.paid" });
    const rls = createRlsClient(db, { userId: user, role: "admin" });
    const seen = await rls.execute((tx) => tx.select().from(stripeEvents));
    assert.deepEqual(seen, []);
    await assert.rejects(
      rls.execute((tx) =>
        tx
          .insert(stripeEvents)
          .values({ id: eventId("forged"), type: "invoice.paid" }),
      ),
    );
  });
});
