"use client";

/**
 * "Your comments" (pin-list.md; D-LAB-13): the bar's Comments button and
 * the list it opens, a Sheet from the right at 768px and wider, a bottom
 * Drawer below. It reads LAB-12's pins and queue through the pins provider
 * and has no query or action of its own.
 *
 * - Sheet or Drawer is chosen when the list opens, never at render, so the
 *   server's HTML and the client's agree while it is closed.
 * - A dialog named by its title, which takes focus on open; focus is
 *   trapped, Escape closes (an edit in progress first), and focus returns
 *   to the Comments button, except after Show on page or Start commenting,
 *   which run once the list has closed.
 * - Opened by keyboard it appears at once (A-15); under reduced motion the
 *   primitives already drop their transition.
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Button } from "@pem/ui/button";
import { cn } from "@pem/ui/cn";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@pem/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@pem/ui/sheet";

import {
  commentsButtonView,
  type DesignOption,
} from "../../../../../lib/sandbox/client/experiment-view";
import {
  focusAfterDelete,
  groupComments,
  listOrder,
  showOnPagePlan,
  LIST_WORDS as W,
  type ListItem as ListItemData,
} from "../../../../../lib/sandbox/client/pin-list";
import { heldReason } from "../../../../../lib/sandbox/client/pins-view";
import { usePins } from "../pins/pins-provider";
import { ListBody } from "./list-body";

export type PinListProps = {
  /** In switcher order. */
  designs: readonly DesignOption[];
  shown: string;
  /** LAB-11's switch, so a Show on page switch is logged and announced like any other. */
  onSwitch(design: string): void;
  /** A list `?state=` fixture: open on arrival, with this announcement. */
  fixture: { announcement: string | null } | null;
};

export function PinList({ designs, shown, onSwitch, fixture }: PinListProps) {
  const pins = usePins();
  const view = commentsButtonView(pins.bar);
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<"sheet" | "drawer">("sheet");
  const [instant, setInstant] = useState(false);
  const [said, setSaid] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const items = useRef(new Map<string, HTMLElement>());
  // Run once the list has closed; focus then goes there, not to the button.
  const afterClose = useRef<(() => void) | null>(null);
  const reasonId = useId();

  const list = groupComments(pins.pins, designs, pins.detached);
  const order = listOrder(list);
  const reason = heldReason(pins.held);

  // Cleared first, so the same words twice in a row are read twice.
  const say = useCallback((text: string | null) => {
    if (!text) return;
    setSaid("");
    setTimeout(() => setSaid(text), 50);
  }, []);

  const openList = useCallback((keyboard: boolean) => {
    setVariant(
      window.matchMedia("(min-width: 768px)").matches ? "sheet" : "drawer",
    );
    setInstant(keyboard);
    setOpen(true);
  }, []);

  // A list fixture opens on arrival, after hydration.
  const opened = useRef(false);
  useEffect(() => {
    if (!fixture || opened.current) return;
    opened.current = true;
    openList(false);
    say(fixture.announcement);
  }, [fixture, openList, say]);

  const closeThen = (then: () => void) => {
    afterClose.current = then;
    setOpen(false);
  };

  const onOpenChange = (
    next: boolean,
    details: { reason?: string; cancel?: () => void },
  ) => {
    // Escape in an edit closes the composer first, as on the pin.
    if (!next && details.reason === "escape-key" && pins.listDraft) {
      details.cancel?.();
      pins.dismissDraft("escape");
      return;
    }
    setOpen(next);
  };

  const onOpenChangeComplete = (isOpen: boolean) => {
    if (isOpen) return;
    const then = afterClose.current;
    afterClose.current = null;
    then?.();
  };

  const focusItemOrTitle = (target: { item: string } | { title: true }) => () =>
    ("item" in target ? items.current.get(target.item) : null) ??
    titleRef.current;

  const onShow = (item: ListItemData) => {
    const plan = showOnPagePlan(item, shown);
    if (!plan) return;
    closeThen(() => {
      if (plan.switchTo) onSwitch(plan.switchTo);
      pins.reveal(plan.openPin);
    });
  };

  const onEdit = (item: ListItemData, editButton: HTMLElement | null) => {
    pins.startEdit(item, {
      returnTo: editButton,
      refocus: () =>
        document.querySelector<HTMLElement>(
          `[data-list-edit="${CSS.escape(item.id)}"]`,
        ) ?? titleRef.current,
    });
    // Into the composer's text, once it has replaced the item's, at its end.
    setTimeout(() => {
      const text = items.current.get(item.id)?.querySelector("textarea");
      text?.focus();
      text?.setSelectionRange(text.value.length, text.value.length);
    }, 0);
  };

  const onDelete = (item: ListItemData) => {
    pins.deletePin(item, {
      refocus: focusItemOrTitle(focusAfterDelete(order, item.id)),
    });
  };

  const onRetry = async () => {
    const outcome = await pins.retryFromList();
    say(outcome?.announcement ?? null);
  };

  const onStart = () =>
    closeThen(() => {
      pins.toggleMode();
      pins.toggleRef.current?.focus();
    });

  const body = (
    <ListBody
      list={list}
      designCount={designs.length}
      load={pins.load}
      online={pins.online}
      bar={pins.bar}
      reason={reason}
      reasonId={reasonId}
      said={said}
      register={(id, element) => {
        if (element) items.current.set(id, element);
        else items.current.delete(id);
      }}
      onShow={onShow}
      onEdit={onEdit}
      onDelete={onDelete}
      onRetry={() => void onRetry()}
      onStart={onStart}
    />
  );

  const countLine = pins.load === "ok" ? W.count(pins.pins.length) : null;
  // A static entrance under keyboard modality (A-15).
  const motion = instant ? "transition-none" : undefined;
  const focus = {
    initialFocus: titleRef,
    finalFocus: () => (afterClose.current ? false : buttonRef.current),
  };

  return (
    <>
      <Button
        ref={buttonRef}
        variant="outline"
        disabled={view.disabled}
        className="h-11 px-4"
        aria-haspopup="dialog"
        aria-expanded={open}
        // A press from the keyboard has no pointer, so its detail is 0.
        onClick={(event) => openList(event.detail === 0)}
      >
        {view.label}
      </Button>
      {variant === "sheet" ? (
        <Sheet
          open={open}
          onOpenChange={onOpenChange}
          onOpenChangeComplete={onOpenChangeComplete}
        >
          <SheetContent
            ref={pins.setToastHost}
            side="right"
            {...focus}
            // Opacity only, no slide (pin-list.md, Access).
            className={cn(
              "w-full gap-0 data-[side=right]:data-ending-style:translate-x-0 data-[side=right]:data-starting-style:translate-x-0 data-[side=right]:sm:max-w-md",
              motion,
            )}
          >
            <SheetHeader className="pr-14">
              <SheetTitle
                ref={titleRef}
                tabIndex={-1}
                className="text-lg outline-none"
              >
                {W.title}
              </SheetTitle>
              {countLine ? (
                <SheetDescription>{countLine}</SheetDescription>
              ) : null}
            </SheetHeader>
            {body}
          </SheetContent>
        </Sheet>
      ) : (
        <Drawer
          open={open}
          onOpenChange={onOpenChange}
          onOpenChangeComplete={onOpenChangeComplete}
        >
          <DrawerContent ref={pins.setToastHost} {...focus} className={motion}>
            <DrawerHeader className="pb-4 group-data-[swipe-axis=y]/drawer-popup:text-left">
              <DrawerTitle
                ref={titleRef}
                tabIndex={-1}
                className="text-lg outline-none"
              >
                {W.title}
              </DrawerTitle>
              {countLine ? (
                <DrawerDescription>{countLine}</DrawerDescription>
              ) : null}
            </DrawerHeader>
            {body}
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
