/**
 * "Review has ended" (ux/experimental/ended.md; D-LAB-8, S12b, S16), pure:
 * its words, its `?state=` fixtures, which requests it answers, and the
 * browser-storage reads the client leaf runs. The page and the leaf bind it
 * (app/experimental/[slug]/_components/ended/).
 *
 * - Only a live access on a closed experiment reaches it (LAB-5's `ended`).
 *   The team still sees the experiment; anyone without a live code sees the
 *   gate. The team reaches it only through its fixtures.
 * - Opening it writes nothing: no view event, and no request after load.
 * - The leaf touches two keys, this slug and reviewer's, and nothing else:
 *   LAB-12's pin queue (shown read-only, removed on `pagehide`) and LAB-17's
 *   review draft (removed on arrival). Nothing is sent.
 * - Storage can throw (private windows, blocked site data): every read and
 *   remove is guarded, and a failure shows the base line only.
 */

import { brand } from "@pem/brand/brand";

import type { ViewerResult } from "./access-check.ts";
import { queueKey, type StorageLike } from "./client/queue.ts";
import { draftKey } from "./client/review-form.ts";

/** ended.md's Words, verbatim. */
export const ENDED_WORDS = {
  heading: "This review has ended",
  sent: (date: string) =>
    `The team has your review, sent on ${date}. Nothing more can be added now.`,
  notSent:
    "The team is no longer taking feedback on this one. Any comments you left before it closed have been kept.",
  // [ASSUMPTION] One comment reads in the singular; the Words give only the plural.
  unsent: (count: number) =>
    count === 1
      ? "1 comment in this browser wasn't sent before it closed."
      : `${count} comments in this browser weren't sent before it closed.`,
  show: "Show them",
  hide: "Hide them",
  draft:
    "Answers you hadn't sent couldn't be added, and have been cleared from this browser.",
  footerLead: "Questions? Email",
  email: brand.contact.email,
} as const;

/** What this browser held on arrival: the unsent comments' text, and whether a draft was cleared. */
export type EndedBrowserState = {
  unsent: string[];
  draftCleared: boolean;
};

export const NOTHING_IN_BROWSER: EndedBrowserState = {
  unsent: [],
  draftCleared: false,
};

/** Where the leaf's state comes from: this browser's storage, or a fixture that touches none. */
export type EndedBrowserSource =
  | { kind: "live"; slug: string; reviewerId: string }
  | { kind: "fixture"; state: EndedBrowserState };

/** The Ended view's props. `sentAt` is an ISO instant, formatted in the client. */
export type EndedProps = {
  sentAt: string | null;
  browser: EndedBrowserSource;
};

/** ended.md's States with something to show; loading, error and offline are N/A there. */
export const ENDED_STATE_KEYS = [
  "ended-success",
  "ended-empty",
  "ended-partial",
  "ended-draft",
  "ended-draft-partial",
] as const;

export type EndedStateKey = (typeof ENDED_STATE_KEYS)[number];

export function isEndedStateKey(value: unknown): value is EndedStateKey {
  return (ENDED_STATE_KEYS as readonly unknown[]).includes(value);
}

/** Synthetic: noon UTC on 3 October reads as 3 October from UTC-11 to UTC+11. */
const FIXTURE_SENT_AT = "2026-10-03T12:00:00.000Z";
const FIXTURE_UNSENT = [
  "The price under Pro wraps onto two lines at this width.",
  "Is the yearly toggle meant to keep my place in the table?",
];

export const ENDED_FIXTURES: Readonly<Record<EndedStateKey, EndedProps>> = {
  "ended-success": {
    sentAt: FIXTURE_SENT_AT,
    browser: { kind: "fixture", state: NOTHING_IN_BROWSER },
  },
  "ended-empty": {
    sentAt: null,
    browser: { kind: "fixture", state: NOTHING_IN_BROWSER },
  },
  "ended-partial": {
    sentAt: FIXTURE_SENT_AT,
    browser: {
      kind: "fixture",
      state: { unsent: FIXTURE_UNSENT, draftCleared: false },
    },
  },
  "ended-draft": {
    sentAt: null,
    browser: { kind: "fixture", state: { unsent: [], draftCleared: true } },
  },
  "ended-draft-partial": {
    sentAt: null,
    browser: {
      kind: "fixture",
      state: { unsent: FIXTURE_UNSENT, draftCleared: true },
    },
  },
};

type EndedViewer = Extract<ViewerResult, { kind: "ended" }>["viewer"];

export type EndedDeps = {
  /** @pem/db/sandbox's `latestSentAt`, bound to the database. */
  latestSentAt(viewer: EndedViewer): Promise<Date | null>;
};

/**
 * The Ended view's props for this request, or null when it is not the Ended
 * view: a live access on a closed experiment reads its latest send; the team
 * with an ended key gets that fixture; everyone else gets null. A failed read
 * throws, to the app's error page (ended.md's ended-error).
 */
export async function endedPageWith(
  deps: EndedDeps,
  result: ViewerResult,
  stateKey: string | null,
): Promise<EndedProps | null> {
  if (result.kind === "team")
    return isEndedStateKey(stateKey) ? ENDED_FIXTURES[stateKey] : null;
  if (result.kind !== "ended") return null;
  const sentAt = await deps.latestSentAt(result.viewer);
  return {
    sentAt: sentAt ? sentAt.toISOString() : null,
    browser: {
      kind: "live",
      slug: result.viewer.slug,
      reviewerId: result.viewer.reviewerId,
    },
  };
}

/**
 * The sent line's date: day and month in the reader's own locale and zone
 * (data-contract.md). Before hydration the server has neither, so it reads
 * in UTC until the client takes over.
 */
export function endedDate(iso: string, local: boolean): string {
  return new Intl.DateTimeFormat(local ? undefined : "en-GB", {
    day: "numeric",
    month: "long",
    ...(local ? {} : { timeZone: "UTC" }),
  }).format(new Date(iso));
}

/** What the page says, line by line, for a sent instant and what this browser held. */
export function endedLines(
  sentAt: string | null,
  browser: EndedBrowserState,
  local = true,
): { base: string; draft: string | null; unsent: string | null } {
  return {
    base: sentAt
      ? ENDED_WORDS.sent(endedDate(sentAt, local))
      : ENDED_WORDS.notSent,
    draft: browser.draftCleared ? ENDED_WORDS.draft : null,
    unsent: browser.unsent.length
      ? ENDED_WORDS.unsent(browser.unsent.length)
      : null,
  };
}

/**
 * The text of this slug and reviewer's queued comments, in queue order. Only
 * `body` strings are read; an entry without one, a malformed queue or a
 * storage that throws gives nothing.
 */
export function readUnsent(
  storage: StorageLike | null,
  slug: string,
  reviewerId: string,
): string[] {
  try {
    const raw = storage?.getItem(queueKey(slug, reviewerId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry: unknown) => (entry as { body?: unknown } | null)?.body)
      .filter(
        (body): body is string => typeof body === "string" && !!body.trim(),
      );
  } catch {
    return [];
  }
}

/** Removes this slug and reviewer's queue, and no other key. A storage that throws is left as it is. */
export function clearUnsent(
  storage: StorageLike | null,
  slug: string,
  reviewerId: string,
): void {
  try {
    storage?.removeItem(queueKey(slug, reviewerId));
  } catch {
    // Nothing more to do: the queue holds nothing that could still be sent.
  }
}

/**
 * Removes this slug and reviewer's review draft. True only when one was
 * there and is gone, so the draft line never claims a clear that failed.
 */
export function takeDraft(
  storage: StorageLike | null,
  slug: string,
  reviewerId: string,
): boolean {
  if (!storage) return false;
  const key = draftKey(slug, reviewerId);
  try {
    if (storage.getItem(key) === null) return false;
    storage.removeItem(key);
    return storage.getItem(key) === null;
  } catch {
    return false;
  }
}

type PageEvents = Pick<EventTarget, "addEventListener" | "removeEventListener">;

/**
 * Arrival, as the leaf runs it after mount: read the unsent comments, remove
 * the draft, and remove the queue on `pagehide` (never `beforeunload`, which
 * the back-forward cache and mobile Safari skip). Returns what to show and
 * the listener's removal.
 */
export function arriveEnded(
  storage: StorageLike | null,
  page: PageEvents,
  slug: string,
  reviewerId: string,
): { state: EndedBrowserState; stop: () => void } {
  const state: EndedBrowserState = {
    unsent: readUnsent(storage, slug, reviewerId),
    draftCleared: takeDraft(storage, slug, reviewerId),
  };
  const leave = () => clearUnsent(storage, slug, reviewerId);
  page.addEventListener("pagehide", leave);
  return { state, stop: () => page.removeEventListener("pagehide", leave) };
}
