"use client";

/**
 * The pins region (pins.md, Access): "Your comments on this design", after
 * `main` in DOM order and before the review bar, its pins in number order.
 * It spans the page at the document's origin, so each pin sits over its
 * spot in the design while the region itself takes no room and no clicks.
 * Only the shown design's pins are drawn; one whose anchor is not found is
 * left out here and listed by LAB-13. The draft pin carries the composer.
 */
import { Popover, PopoverContent, PopoverTrigger } from "@pem/ui/popover";

import {
  pinName,
  PIN_WORDS as W,
} from "../../../../../lib/sandbox/client/pins-view";
import { Composer } from "./composer";
import { PIN_BUTTON, PinDot, PinMarker, POPOVER_MOTION } from "./pin-marker";
import { usePins } from "./pins-provider";

export function PinsLayer() {
  const pins = usePins();
  const { draft, draftAt } = pins;

  return (
    <>
      <div
        ref={pins.regionRef}
        role="region"
        aria-label={W.region}
        tabIndex={-1}
        className="pointer-events-none absolute top-0 left-0 z-30 h-0 w-full outline-none"
      >
        {pins.drawn.map(({ pin, at }) =>
          at ? <PinMarker key={pin.id} pin={pin} at={at} /> : null,
        )}
        {draft && draftAt ? (
          <Popover
            open
            onOpenChange={(open, details) => {
              if (open) return;
              pins.dismissDraft(
                details.reason === "escape-key" ? "escape" : "outside",
              );
            }}
          >
            <PopoverTrigger
              aria-label={pinName({
                number: draft.number,
                kind: draft.pinKind,
                anchor: draft.anchor,
                sync: "unsent",
              })}
              className={PIN_BUTTON}
              style={{ left: draftAt.left, top: draftAt.top }}
            >
              <PinDot number={draft.number} unsent />
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="center"
              finalFocus={false}
              className={POPOVER_MOTION}
            >
              <Composer
                draft={draft}
                onChange={pins.updateDraft}
                onSave={pins.saveDraft}
                onCancel={() => pins.dismissDraft("cancel")}
              />
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
      <p aria-live="polite" className="sr-only">
        {pins.announcement}
      </p>
    </>
  );
}
