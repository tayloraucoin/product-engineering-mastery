/**
 * The entitlement service (D-STK-11, STK-21): the only code that writes
 * `billing_entitlements`. Stripe's verified events reach it through one
 * handler file each (apps/web/app/api/webhooks/stripe/_lib/handlers); each
 * function takes a SystemContext and raw input, validates the input, and
 * writes in one transaction.
 *
 * - A user is named only by the checkout the app created for them
 *   (`client_reference_id`) or by an existing link from their Stripe
 *   customer. An event that names no user of this app changes nothing and
 *   says so; the handler logs it.
 * - Every write is an upsert keyed by the user, guarded by when Stripe
 *   created the event: a retried event writes the same row again, and an
 *   older event delivered late changes nothing.
 * - A customer already linked to another user is never moved to a new one,
 *   and a user still entitled through one customer is never relinked or
 *   overwritten from another: both are `customer-mismatch`, logged. Once that
 *   entitlement has ended, a new customer may take its place (a returning
 *   subscriber whose checkout made a fresh customer).
 * - On a tie (two events in the same second, Stripe's granularity), an event
 *   that would end an entitlement never overwrites one that grants it.
 *
 * There is no read here yet. The first gate that needs one reads the row for
 * the signed-in user's own id (a ServiceContext's `userId`), never for an id
 * a caller passes in: the table sits outside row-level security.
 */

import { and, eq, isNull, lt, notInArray, or, sql } from "drizzle-orm";

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
 * - `customer-mismatch`: nothing changed, for one of two reasons:
 *   `customer-taken`, the event's customer is linked to another user (the
 *   `userId` is that other user, who holds the link); or `entitled-elsewhere`,
 *   the event's own user is still entitled through another customer (the
 *   `userId` is the event's user, who may have paid twice).
 * - `superseded`: the event would end a subscription the row has moved past
 *   while another still entitles the user; nothing changed.
 */
export type EntitlementOutcome =
  | { outcome: "applied" | "stale" | "superseded"; userId: string }
  | { outcome: "no-user" }
  | {
      outcome: "customer-mismatch";
      reason: "customer-taken" | "entitled-elsewhere";
      userId: string;
    };

async function userExists(tx: RlsTransaction, userId: string) {
  const [row] = await tx
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row !== undefined;
}

/** The user's current link: customer, subscription and status, or undefined. */
async function currentLink(tx: RlsTransaction, userId: string) {
  const [row] = await tx
    .select({
      customerId: billingEntitlements.stripeCustomerId,
      subscriptionId: billingEntitlements.stripeSubscriptionId,
      status: billingEntitlements.status,
    })
    .from(billingEntitlements)
    .where(eq(billingEntitlements.userId, userId))
    .limit(1);
  return row;
}

/** The user is still entitled through a customer other than `customerId`. */
function entitledElsewhere(
  link: { customerId: string; status: string } | undefined,
  customerId: string,
) {
  return (
    link !== undefined && link.customerId !== customerId && isEntitled(link)
  );
}

const ENTITLED = ENTITLED_STATUSES as unknown as string[];

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
      setWhere: or(
        lt(billingEntitlements.stripeEventAt, write.stripeEventAt),
        and(
          eq(billingEntitlements.stripeEventAt, write.stripeEventAt),
          // A tie never downgrades: an ending event loses to a granting one.
          ENTITLED.includes(write.status)
            ? sql`true`
            : notInArray(billingEntitlements.status, ENTITLED),
        ),
      ),
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
      return {
        outcome: "customer-mismatch",
        reason: "customer-taken",
        userId: owner,
      };
    const link = await currentLink(tx, checkout.userId);
    if (entitledElsewhere(link, checkout.customerId))
      return {
        outcome: "customer-mismatch",
        reason: "entitled-elsewhere",
        userId: checkout.userId,
      };
    // An unpaid checkout for a second subscription (a delayed payment method)
    // never downgrades a live one; the new subscription's own events apply
    // once it is paid.
    if (
      !checkout.paid &&
      link !== undefined &&
      isEntitled(link) &&
      link.subscriptionId !== checkout.subscriptionId
    )
      return { outcome: "stale", userId: checkout.userId };
    // A new subscription's plan and period arrive with its own events; the
    // last one's must not be read as this one's meanwhile.
    const fresh = link?.subscriptionId !== checkout.subscriptionId;
    return upsert(tx, {
      userId: checkout.userId,
      stripeCustomerId: checkout.customerId,
      stripeSubscriptionId: checkout.subscriptionId,
      status: checkout.paid ? "active" : "incomplete",
      ...(fresh ? { priceId: null, currentPeriodEnd: null } : {}),
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
      // The metadata names a user who still pays through another customer:
      // never move or cancel their row from a subscription that is not theirs.
      if (
        entitledElsewhere(
          await currentLink(tx, userId),
          subscription.customerId,
        )
      )
        return {
          outcome: "customer-mismatch",
          reason: "entitled-elsewhere",
          userId,
        };
    }
    // One row per user: an older subscription ending (a plan change or a
    // resubscribe on the same customer) never cancels the live one it gave way to.
    const link = await currentLink(tx, userId);
    if (
      link !== undefined &&
      isEntitled(link) &&
      link.subscriptionId !== null &&
      link.subscriptionId !== subscription.subscriptionId &&
      !isEntitled(subscription)
    )
      return { outcome: "superseded", userId };
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
            // Only the same subscription: an old one's late plan never lands on its successor.
            eq(
              billingEntitlements.stripeSubscriptionId,
              subscription.subscriptionId,
            ),
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
