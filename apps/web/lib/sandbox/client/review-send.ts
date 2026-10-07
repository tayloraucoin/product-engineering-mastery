/**
 * Sending the review (review.md "Sending"; S21, S22), pure: the queue and
 * the server are injected. Queued pins send first, through LAB-12's one
 * sender (`client/queue.ts`), each under its own id, and the version goes
 * only once the queue is empty, so every triage key names a pin the server
 * holds. A pin that does not send leaves the version unsent.
 *
 * The browser mints the version id on Send and keeps it while the answers
 * are unchanged, so a retry after a lost ok stores nothing twice; any change
 * drops it (`nextVersionId`), so a changed retry is a new version.
 */

import type { SendOutcome } from "./queue.ts";
import type { ReviewPayload } from "./review-form.ts";

/** The send action's fixed results (`lib/sandbox/review.ts`). */
export type SendReviewResult =
  | { kind: "ok"; number: number; createdAt: string }
  | { kind: "invalid"; missing: string[] }
  | { kind: "closed" }
  | { kind: "not-saved" };

export type ReviewSendDeps = {
  /** LAB-12's sender: resends every queued pin, one at a time. */
  flushPins(): Promise<{ sent: string[]; last: SendOutcome | null }>;
  /** How many pins the queue still holds. */
  queuedPins(): number;
  sendReview(
    input: ReviewPayload & { versionId: string },
  ): Promise<SendReviewResult>;
};

/** What a send came to, for the page: sent, refused with gaps, closed, or not sent. */
export type ReviewSendOutcome =
  | { kind: "sent"; number: number; createdAt: string }
  | { kind: "invalid"; missing: string[] }
  | { kind: "closed" }
  | { kind: "send-failed" };

export async function sendReviewFlow(
  deps: ReviewSendDeps,
  versionId: string,
  payload: ReviewPayload,
): Promise<ReviewSendOutcome> {
  let flushed: { last: SendOutcome | null };
  try {
    flushed = await deps.flushPins();
  } catch {
    return { kind: "send-failed" };
  }
  if (deps.queuedPins() > 0)
    return flushed.last === "closed"
      ? { kind: "closed" }
      : { kind: "send-failed" };

  let result: SendReviewResult;
  try {
    result = await deps.sendReview({ versionId, ...payload });
  } catch {
    return { kind: "send-failed" };
  }
  switch (result.kind) {
    case "ok":
      return {
        kind: "sent",
        number: result.number,
        createdAt: result.createdAt,
      };
    case "invalid":
      return { kind: "invalid", missing: result.missing };
    case "closed":
      return { kind: "closed" };
    default:
      return { kind: "send-failed" };
  }
}

/** The version id for the next send: the one minted, while nothing has changed since. */
export function nextVersionId(
  minted: string | undefined,
  mint: () => string,
): string {
  return minted ?? mint();
}
