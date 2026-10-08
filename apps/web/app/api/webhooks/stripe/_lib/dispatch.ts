/**
 * The dispatcher's shape (D-STK-11): a map from Stripe event type to the
 * handler for it, one file per event under handlers/. A type with no entry is
 * acknowledged and dispatched nowhere. A handler may run more than once for one
 * event (a crash after it succeeded and before the ledger recorded it), so each
 * handler writes idempotently: upsert by the Stripe object's id, never append.
 */

import type Stripe from "stripe";

/** The event a handler receives, narrowed to its own type. */
export type StripeEventOf<T extends Stripe.Event.Type> = Extract<
  Stripe.Event,
  { type: T }
>;

export type WebhookHandler<T extends Stripe.Event.Type> = (
  event: StripeEventOf<T>,
) => Promise<void>;

/** Each event type maps to at most one handler, typed for that event. */
export type WebhookHandlers = {
  [T in Stripe.Event.Type]?: WebhookHandler<T>;
};

/** The handler for `event`'s type, or undefined when the map has none. */
export function handlerFor(
  handlers: WebhookHandlers,
  event: Stripe.Event,
): ((event: Stripe.Event) => Promise<void>) | undefined {
  if (!Object.hasOwn(handlers, event.type)) return undefined;
  return handlers[event.type] as
    ((event: Stripe.Event) => Promise<void>) | undefined;
}
