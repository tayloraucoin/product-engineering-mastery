"use client";

/**
 * One pin (pins.md, Pin; Access): a numbered circle in inverse neutral
 * tokens, 28px to see and 44px to hit, dashed while not sent. It is a button
 * named "Comment 3, Problem, on Pricing table" (plus "not sent"). Selecting
 * it opens a popover with the type, the text, the time, Edit and Delete.
 * Once the review has closed or access has ended, Edit and Delete stay
 * focusable but disabled, each tied to its reason.
 */
import { useId } from "react";

import { Button } from "@pem/ui/button";
import { cn } from "@pem/ui/cn";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@pem/ui/popover";

import {
  heldReason,
  pinName,
  pinTime,
  PIN_WORDS as W,
  type Pin,
} from "../../../../../lib/sandbox/client/pins-view";
import { usePins } from "./pins-provider";

/** Popovers appear with opacity only, and not at all under keyboard modality (A-15). */
export const POPOVER_MOTION =
  "w-80 max-w-[calc(100vw-(--spacing(8)))] data-open:zoom-in-100 data-closed:zoom-out-100 data-[side=bottom]:slide-in-from-top-0 data-[side=top]:slide-in-from-bottom-0 data-[side=left]:slide-in-from-right-0 data-[side=right]:slide-in-from-left-0 has-focus-visible:animate-none";

/** The circle itself: 28px inside a 44px target, centred on its point. */
export function PinDot({
  number,
  unsent,
}: {
  number: number;
  unsent: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-7 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background tabular-nums shadow-raised",
        unsent &&
          "outline-2 outline-offset-2 outline-foreground outline-dashed",
      )}
    >
      {number}
    </span>
  );
}

export const PIN_BUTTON =
  "pointer-events-auto absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring";

export function PinMarker({
  pin,
  at,
}: {
  pin: Pin;
  at: { left: number; top: number };
}) {
  const { openPin, setOpenPin, startEdit, deletePin, held, registerPin } =
    usePins();
  const reasonId = useId();
  const reason = heldReason(held);
  const name = pinName(pin);

  return (
    <Popover
      open={openPin === pin.id}
      onOpenChange={(open) => setOpenPin(open ? pin.id : null)}
    >
      <PopoverTrigger
        ref={(element: HTMLButtonElement | null) =>
          registerPin(pin.id, element)
        }
        aria-label={name}
        className={PIN_BUTTON}
        style={{ left: at.left, top: at.top }}
      >
        <PinDot number={pin.number} unsent={pin.sync !== "sent"} />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="center" className={POPOVER_MOTION}>
        <div className="flex flex-col gap-1">
          <PopoverTitle>
            {pin.kind
              ? `Comment ${pin.number}, ${W.kinds[pin.kind]}`
              : `Comment ${pin.number}`}
          </PopoverTitle>
          <p className="text-base whitespace-pre-wrap break-words">
            {pin.body}
          </p>
          <p className="text-sm text-muted-foreground">
            {pinTime(pin.createdAt ?? pin.clientCreatedAt)}
          </p>
        </div>
        {reason ? (
          <p id={reasonId} className="text-sm text-muted-foreground">
            {reason}
          </p>
        ) : null}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-11 px-4"
            disabled={!!reason}
            focusableWhenDisabled
            aria-describedby={reason ? reasonId : undefined}
            onClick={() => startEdit(pin)}
          >
            {W.edit}
          </Button>
          <Button
            variant="outline"
            className="h-11 px-4"
            disabled={!!reason}
            focusableWhenDisabled
            aria-describedby={reason ? reasonId : undefined}
            onClick={() => deletePin(pin)}
          >
            {W.delete}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
