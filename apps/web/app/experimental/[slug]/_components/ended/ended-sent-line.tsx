"use client";

/**
 * The sent line, with the latest send's date in the reader's own locale and
 * zone. Before hydration it reads in UTC, so the line is never missing its
 * date.
 */
import { useSyncExternalStore } from "react";

import {
  ENDED_WORDS,
  endedDate,
} from "../../../../../lib/sandbox/review/ended";

const noSubscription = () => () => {};

export function EndedSentLine({ sentAt }: { sentAt: string }) {
  const mounted = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
  return (
    <p className="text-muted-foreground">
      {ENDED_WORDS.sent(endedDate(sentAt, mounted))}
    </p>
  );
}
