/**
 * The entitlement service (D-STK-11, STK-21): the only code that writes
 * `billing_entitlements`. Stripe's verified events reach it through one
 * handler file each (apps/web/lib/billing/webhook/handlers); each function
 * takes a SystemContext and raw input, validates the input, and writes in one
 * transaction.
 *
 * - A user is named only by the checkout the app created for them
 *   (`client_reference_id`) or by an existing link from their Stripe
 *   customer. An event that names no user of this app changes nothing and
 *   says so; the handler logs it.
 * - Every write is an upsert keyed by the user, guarded by when Stripe
 *   created the event: a retried event writes the same row again, and an
 *   older event delivered late changes nothing.
 * - A customer already linked to another user is never moved to a new one.
 *
 * There is no read here yet. The first gate that needs one reads the row for
 * the signed-in user's own id (a ServiceContext's `userId`), never for an id
 * a caller passes in: the table sits outside row-level security.
 */

import { and, eq, isNull, lte, or, sql } from "drizzle-orm";

import type { RlsTransaction } from "@pem/db/rls";
import { billingEntitlements, users } from "@pem/db/schema";
import {
  completeCheckoutInput,
  ENTITLED_STATUSES,
  syncSubscriptionInput,
} from "@pem/validators/billing";

import type { SystemContext } from "../context.ts";
import { parseInput } from "../parse-input.ts";

/**
 * - `applied`: the user's entitlement now reflects the event.
 * - `stale`: a newer event was applied already; nothing changed.
 * - `no-user`: the event names no user of this app; nothing changed.
 * - `customer-mismatch`: the customer is linked to another user; nothing changed.
 */
export type EntitlementOutcome =
  | { outcome: "applied" | "stale"; userId: string }
  | { outcome: "no-user" }
  | { outcome: "customer-mismatch"; userId: string };

async function userExists(tx: RlsTransaction, userId: string) {
  const [row] = await tx
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row !== undefined;
}

async function linkedUser(tx: RlsTransaction, customerId: string) {
  const [row] = await tx
    .select({ userId: billingEntitlements.userId })
    .from(billingEntitlements)
    .where(eq(billingEntitlements.stripeCustomerId, customerId))
    .limit(1);
  return row?.userId;
}

type EntitlementWrite = Omit<
  typeof billingEntitlements.$inferInsert,
  "updatedAt"
>;

/** Inserts or updates the user's row, unless a newer event is already applied. */
async function upsert(
  tx: RlsTransaction,
  write: EntitlementWrite,
): Promise<EntitlementOutcome> {
  const { userId, ...changes } = write;
  const [row] = await tx
    .insert(billingEntitlements)
    .values(write)
    .onConflictDoUpdate({
      target: billingEntitlements.userId,
      set: { ...changes, updatedAt: sql`now()` },
      setWhere: lte(billingEntitlements.stripeEventAt, write.stripeEventAt),
    })
    .returning({ userId: billingEntitlements.userId });
  return { outcome: row ? "applied" : "stale", userId };
}

/** A completed checkout links the user to their new customer and starts the entitlement once paid. */
export async function completeCheckout(
  ctx: SystemContext,
  input: unknown,
): Promise<EntitlementOutcome> {
  const checkout = parseInput(completeCheckoutInput, input);
  return ctx.db.execute(async (tx) => {
    if (!(await userExists(tx, checkout.userId))) return { outcome: "no-user" };
    const owner = await linkedUser(tx, checkout.customerId);
    if (owner !== undefined && owner !== checkout.userId)
      return { outcome: "customer-mismatch", userId: owner };
    return upsert(tx, {
      userId: checkout.userId,
      stripeCustomerId: checkout.customerId,
      stripeSubscriptionId: checkout.subscriptionId,
      status: checkout.paid ? "active" : "incomplete",
      stripeEventAt: checkout.occurredAt,
    });
  });
}

/** A subscription's new state (updated, or deleted as `canceled`) on the user its customer is linked to. */
export async function syncSubscription(
  ctx: SystemContext,
  input: unknown,
): Promise<EntitlementOutcome> {
  const subscription = parseInput(syncSubscriptionInput, input);
  return ctx.db.execute(async (tx) => {
    // The customer's link wins; the subscription's metadata only names a user
    // when its checkout event has not arrived yet.
    let userId = await linkedUser(tx, subscription.customerId);
    if (userId === undefined) {
      if (
        subscription.userId === null ||
        !(await userExists(tx, subscription.userId))
      )
        return { outcome: "no-user" };
      userId = subscription.userId;
    }
    const result = await upsert(tx, {
      userId,
      stripeCustomerId: subscription.customerId,
      stripeSubscriptionId: subscription.subscriptionId,
      priceId: subscription.priceId,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      stripeEventAt: subscription.occurredAt,
    });
    // A late subscription event loses to a newer checkout, but the checkout
    // carries no plan or period: fill those where still empty, never overwrite.
    if (result.outcome === "stale")
      await tx
        .update(billingEntitlements)
        .set({
          priceId: sql`coalesce(${billingEntitlements.priceId}, ${subscription.priceId})`,
          currentPeriodEnd: sql`coalesce(${billingEntitlements.currentPeriodEnd}, ${subscription.currentPeriodEnd})`,
        })
        .where(
          and(
            eq(billingEntitlements.userId, userId),
            or(
              isNull(billingEntitlements.priceId),
              isNull(billingEntitlements.currentPeriodEnd),
            ),
          ),
        );
    return result;
  });
}

/** Whether a row's status grants the plan: Stripe's `active` or `trialing`. */
export function isEntitled(entitlement: { status: string } | undefined) {
  return (
    entitlement !== undefined &&
    (ENTITLED_STATUSES as readonly string[]).includes(entitlement.status)
  );
}
