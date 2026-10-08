/**
 * The pin list's words, grouping, plans and `?state=` fixtures (pin-list.md,
 * D-LAB-13), pure and client-safe: no @pem/db, next/headers or env.ts, so
 * the list imports it and `node --test` runs it.
 *
 * The list reads LAB-12's pins and queue through the pins provider; it has
 * no query and no action of its own.
 */

import type { DesignOption } from "./experiment-view.ts";
import {
  PIN_WORDS,
  pinsFixture,
  type Pin,
  type PinsFixture,
} from "./pins-view.ts";

const count = new Intl.NumberFormat("en-GB");

/** pin-list.md's Words, verbatim; the few it lacks are marked. */
export const LIST_WORDS = {
  title: "Your comments",
  count: (n: number) =>
    `${count.format(n)} ${n === 1 ? "comment" : "comments"}`,
  empty: "No comments yet. Turn on Comment and choose any part of the page.",
  startCommenting: "Start commenting",
  loadError: "Couldn't load your comments.",
  retry: "Retry",
  unsent: (n: number) => `${count.format(n)} not sent yet.`,
  offline: "You're offline. These will send when you're back.",
  // pins.md's copy, shared with the pin's popover.
  notFound: PIN_WORDS.notFound,
  notSent: "Not sent",
  // pins.md's "2 comments sent."; one reads "1 comment sent."
  // [ASSUMPTION: the contract's Gotcha; the Words give only the plural.]
  sent: PIN_WORDS.sent,
  showAll: "Show all",
  showLess: "Show less",
  showAllOf: (n: number) => `Show all of comment ${n}`,
  showLessOf: (n: number) => `Show less of comment ${n}`,
  showOnPage: "Show on page",
  edit: PIN_WORDS.edit,
  delete: PIN_WORDS.delete,
  /** "● Circle design" */
  groupHeading: (design: DesignOption) => `${design.label} design`,
  // [ASSUMPTION] a comment on a design the config no longer lists; the
  // Words have no heading for it.
  otherDesigns: "Other designs",
} as const;

/** The accessible names pin-list.md's Access gives each action, by number. */
export function actionName(
  action: "show" | "edit" | "delete",
  number: number,
): string {
  return action === "show"
    ? `Show comment ${number} on page`
    : action === "edit"
      ? `Edit comment ${number}`
      : `Delete comment ${number}`;
}

/** One list item: a pin, and whether its anchor was not found on its design. */
export type ListItem = Pin & { detached: boolean };

export type ListGroup = {
  /** The design, or null for comments on a design the config no longer lists. */
  design: DesignOption | null;
  heading: string;
  items: ListItem[];
};

export type GroupedList = {
  /** False for a single-design experiment: one list, no heading. */
  headed: boolean;
  groups: ListGroup[];
};

/**
 * One group per design that holds a comment, in switcher order, items in
 * number order. A comment on any design is listed (D-LAB-13); one on a
 * design the config no longer lists goes in a last group, not found, since
 * it can never be shown.
 */
export function groupComments(
  comments: readonly Pin[],
  designOrder: readonly DesignOption[],
  detached: ReadonlySet<string> = new Set(),
): GroupedList {
  const known = new Set(designOrder.map((d) => d.id));
  const byNumber = (a: Pin, b: Pin) => a.number - b.number;
  const groups: ListGroup[] = [];
  for (const design of designOrder) {
    const items = comments
      .filter((c) => c.design === design.id)
      .sort(byNumber)
      .map((c) => ({ ...c, detached: detached.has(c.id) }));
    if (items.length)
      groups.push({ design, heading: LIST_WORDS.groupHeading(design), items });
  }
  const others = comments
    .filter((c) => !known.has(c.design))
    .sort(byNumber)
    .map((c) => ({ ...c, detached: true }));
  if (others.length)
    groups.push({
      design: null,
      heading: LIST_WORDS.otherDesigns,
      items: others,
    });
  return { headed: designOrder.length > 1 || others.length > 0, groups };
}

/** The items in reading order, across every group. */
export function listOrder(list: GroupedList): ListItem[] {
  return list.groups.flatMap((g) => g.items);
}

export type ShowOnPagePlan = {
  /** The design to switch to through LAB-11's switch, or null when it is shown. */
  switchTo: string | null;
  /** The list closes first; focus does not return to the Comments button. */
  closeList: true;
  /** Once the design has painted and the pins re-laid: scroll to this pin and open its popover. */
  openPin: string;
};

/** What "Show on page" does, or null when the item offers none (a not-found pin). */
export function showOnPagePlan(
  comment: Pick<ListItem, "id" | "design" | "detached">,
  shown: string,
): ShowOnPagePlan | null {
  if (comment.detached) return null;
  return {
    switchTo: comment.design === shown ? null : comment.design,
    closeList: true,
    openPin: comment.id,
  };
}

export type RetryOutcome = {
  /** The unsent line, or null once nothing is queued. */
  unsentLine: string | null;
  /** Read politely: the ok results only, or null when none was sent. */
  announcement: string | null;
  /** Still queued: each is marked "Not sent". */
  unsent: string[];
};

/**
 * What a Retry came to. `before` and `after` are the queued ids around the
 * resend; `sent` the ids the server answered ok. The line counts only what
 * is still queued; the announcement only what was sent.
 */
export function retryOutcome(
  before: readonly string[],
  after: readonly string[],
  sent: readonly string[],
): RetryOutcome {
  const was = new Set(before);
  const okd = sent.filter((id) => was.has(id));
  return {
    unsentLine: after.length ? LIST_WORDS.unsent(after.length) : null,
    announcement: okd.length ? LIST_WORDS.sent(okd.length) : null,
    unsent: [...after],
  };
}

/**
 * Retry: every queued comment resent through LAB-12's sender, under the ids
 * it was queued with, then the outcome read from the queue as it stands.
 */
export async function runRetry(deps: {
  queued(): string[];
  flush(): Promise<{ sent: string[] }>;
}): Promise<RetryOutcome> {
  const before = deps.queued();
  const { sent } = await deps.flush();
  return retryOutcome(before, deps.queued(), sent);
}

/**
 * Where focus goes after a delete from the list: the next item, else the
 * previous one, else the title once none is left.
 * [ASSUMPTION: the previous item when the last one goes; pin-list.md names
 * only the next item and the title.]
 */
export function focusAfterDelete(
  items: readonly { id: string }[],
  id: string,
): { item: string } | { title: true } {
  const at = items.findIndex((i) => i.id === id);
  const rest = items.filter((i) => i.id !== id);
  if (!rest.length) return { title: true };
  const next = at === -1 ? rest[0]! : (rest[at] ?? rest[at - 1]!);
  return { item: next.id };
}

/** pin-list.md's States, each reachable by `?state=` for the team only, on synthetic pins. */
export const LIST_STATE_KEYS = [
  "list-empty",
  "list-loading",
  "list-error",
  "list-partial",
  "list-offline",
  "list-success",
  "list-detached",
  "list-retried",
] as const;

export type ListStateKey = (typeof LIST_STATE_KEYS)[number];

export function isListStateKey(value: unknown): value is ListStateKey {
  return (LIST_STATE_KEYS as readonly unknown[]).includes(value);
}

/** One fixture: LAB-12's pins fixture, the load, and the list open on arrival. */
export type ListFixture = {
  pins: PinsFixture;
  load: "loading" | "ok" | "error";
  /** Read in the list's live region on arrival (`list-retried`). */
  announcement: string | null;
};

/**
 * Synthetic pins only. `list-detached` gives comment 2 an anchor the Circle
 * design does not hold, so the page's own lookup finds it missing.
 */
export function listFixture(key: ListStateKey): ListFixture {
  const base = pinsFixture("pins-success");
  const ok = (pins: PinsFixture): ListFixture => ({
    pins,
    load: "ok",
    announcement: null,
  });
  const withSync = (sync: Record<number, Pin["sync"]>) =>
    base.pins.map((p) =>
      sync[p.number] ? { ...p, sync: sync[p.number]! } : p,
    );
  switch (key) {
    case "list-empty":
      return ok({ ...base, pins: [], saved: false });
    case "list-loading":
      return { ...ok({ ...base, pins: [], saved: false }), load: "loading" };
    case "list-error":
      // The load failed; the queued comments are still listed.
      return {
        ...ok({
          ...base,
          saved: false,
          pins: withSync({ 4: "unsent" }).filter((p) => p.number === 4),
        }),
        load: "error",
      };
    case "list-partial":
      return ok({
        ...base,
        saved: false,
        pins: withSync({ 2: "unsent", 4: "unsent" }),
      });
    case "list-offline":
      return ok({
        ...base,
        saved: false,
        online: false,
        pins: withSync({ 2: "unsent", 4: "unsent" }),
      });
    case "list-success":
      return ok(base);
    case "list-detached":
      return ok({
        ...base,
        pins: base.pins.map((p) =>
          p.number === 2
            ? {
                ...p,
                anchor: {
                  marked: "removed-section",
                  x: 0.5,
                  y: 0.5,
                  place: "Plan details",
                },
              }
            : p,
        ),
      });
    case "list-retried":
      return { ...ok(base), announcement: LIST_WORDS.sent(2) };
  }
}
