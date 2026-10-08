"use client";

/**
 * What this browser held when the review closed (ended.md, D-LAB-8): after
 * mount it reads this slug and reviewer's pin queue and review draft, removes
 * the draft at once and the queue on `pagehide`, and shows the draft line and
 * the unsent comments' text, read-only. It touches no other key and sends
 * nothing. A fixture shows its state and touches no storage.
 */
import { useEffect, useState } from "react";

import { buttonVariants } from "@pem/ui/button";
import { cn } from "@pem/ui/cn";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@pem/ui/collapsible";

import {
  arriveEnded,
  ENDED_WORDS,
  NOTHING_IN_BROWSER,
  type EndedBrowserSource,
  type EndedBrowserState,
} from "../../../../../lib/sandbox/review/ended";

function localStorageOrNull(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function EndedBrowser({ source }: { source: EndedBrowserSource }) {
  const [state, setState] = useState<EndedBrowserState>(
    source.kind === "fixture" ? source.state : NOTHING_IN_BROWSER,
  );
  const [open, setOpen] = useState(false);

  const live = source.kind === "live";
  const slug = live ? source.slug : null;
  const reviewerId = live ? source.reviewerId : null;
  useEffect(() => {
    if (slug === null || reviewerId === null) return;
    const arrival = arriveEnded(localStorageOrNull(), window, slug, reviewerId);
    // A second run (React's development double effect) finds the draft gone;
    // the line stays once a draft was cleared.
    setState((prev) => ({
      unsent: arrival.state.unsent,
      draftCleared: prev.draftCleared || arrival.state.draftCleared,
    }));
    return arrival.stop;
  }, [slug, reviewerId]);

  const count = state.unsent.length;
  return (
    <>
      {state.draftCleared ? (
        <p className="text-muted-foreground">{ENDED_WORDS.draft}</p>
      ) : null}
      {count ? (
        <Collapsible
          open={open}
          onOpenChange={setOpen}
          className="flex flex-col gap-3 pt-3"
        >
          <p className="text-muted-foreground">{ENDED_WORDS.unsent(count)}</p>
          <CollapsibleTrigger
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 self-start px-4",
            )}
          >
            {open ? ENDED_WORDS.hide : ENDED_WORDS.show}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="flex flex-col gap-3 border-l border-border pl-4">
              {state.unsent.map((text, i) => (
                <li key={i}>
                  <p className="break-words whitespace-pre-wrap select-text">
                    {text}
                  </p>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </>
  );
}
