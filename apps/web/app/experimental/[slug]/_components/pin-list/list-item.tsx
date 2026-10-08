"use client";

/**
 * One comment in the list (pin-list.md, Each item): the number, the type
 * and the place; the text clamped to three lines with "Show all"; "Not
 * sent" or the not-found line; and Show on page, Edit and Delete, each
 * named with the number. Edit turns the text into LAB-12's composer in
 * place. Closed or revoked leaves Edit and Delete focusable but disabled,
 * each tied to its reason (pins.md).
 */
import { useId, useLayoutEffect, useRef, useState } from "react";

import { Button } from "@pem/ui/button";
import { cn } from "@pem/ui/cn";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from "@pem/ui/item";

import {
  actionName,
  LIST_WORDS as W,
  type ListItem as ListItemData,
} from "../../../../../lib/sandbox/client/pin-list";
import {
  PIN_WORDS,
  placeOf,
} from "../../../../../lib/sandbox/client/pins-view";
import { Composer } from "../pins/composer";
import { PinDot } from "../pins/pin-marker";
import { usePins } from "../pins/pins-provider";

export function ListItem({
  item,
  reason,
  reasonId,
  register,
  onShow,
  onEdit,
  onDelete,
}: {
  item: ListItemData;
  /** Why Edit and Delete are disabled, or null. */
  reason: string | null;
  reasonId: string;
  register(id: string, element: HTMLElement | null): void;
  onShow(item: ListItemData): void;
  onEdit(item: ListItemData, editButton: HTMLElement | null): void;
  onDelete(item: ListItemData): void;
}) {
  const pins = usePins();
  const editing = pins.listDraft?.id === item.id ? pins.listDraft : null;
  const bodyId = useId();
  const textRef = useRef<HTMLParagraphElement>(null);
  const editRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);

  // "Show all" only when three lines do not hold the text.
  useLayoutEffect(() => {
    const text = textRef.current;
    if (!text || expanded) return;
    const measure = () => setClamped(text.scrollHeight > text.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(text);
    return () => observer.disconnect();
  }, [item.body, expanded, editing]);

  const unsent = item.sync !== "sent";

  return (
    <Item
      ref={(element: HTMLDivElement | null) => register(item.id, element)}
      role="listitem"
      tabIndex={-1}
      variant="outline"
      size="sm"
      aria-labelledby={`${bodyId}-title`}
      className="items-start"
    >
      <ItemMedia>
        <PinDot number={item.number} unsent={unsent} />
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle id={`${bodyId}-title`} className="line-clamp-none">
          {item.kind
            ? `Comment ${item.number}, ${PIN_WORDS.kinds[item.kind]}`
            : `Comment ${item.number}`}
        </ItemTitle>
        <ItemDescription className="line-clamp-none">
          {PIN_WORDS.on(placeOf(item.anchor))}
        </ItemDescription>
        {editing ? (
          <div className="pt-2">
            <Composer
              draft={editing}
              inList
              onChange={pins.updateDraft}
              onSave={pins.saveDraft}
              onCancel={() => pins.dismissDraft("cancel")}
            />
          </div>
        ) : (
          <>
            <p
              ref={textRef}
              id={`${bodyId}-text`}
              className={cn(
                "text-base whitespace-pre-wrap break-words",
                !expanded && "line-clamp-3",
              )}
            >
              {item.body}
            </p>
            {clamped || expanded ? (
              <Button
                variant="link"
                className="h-11 w-fit px-0"
                aria-expanded={expanded}
                aria-controls={`${bodyId}-text`}
                onClick={() => setExpanded((e) => !e)}
                aria-label={
                  expanded
                    ? W.showLessOf(item.number)
                    : W.showAllOf(item.number)
                }
              >
                {expanded ? W.showLess : W.showAll}
              </Button>
            ) : null}
            {item.detached ? (
              <p className="text-sm text-muted-foreground">{W.notFound}</p>
            ) : unsent ? (
              <p className="text-sm font-medium">{W.notSent}</p>
            ) : null}
          </>
        )}
      </ItemContent>
      {editing ? null : (
        <ItemFooter className="flex-wrap justify-start pl-10">
          {item.detached ? null : (
            <Button
              variant="outline"
              className="h-11 px-4"
              onClick={() => onShow(item)}
              aria-label={actionName("show", item.number)}
            >
              {W.showOnPage}
            </Button>
          )}
          <Button
            ref={editRef}
            variant="outline"
            data-list-edit={item.id}
            // Focusable while disabled, so it needs the disabled look itself.
            className="h-11 px-4 data-disabled:opacity-50"
            disabled={!!reason}
            focusableWhenDisabled
            aria-describedby={reason ? reasonId : undefined}
            onClick={() => onEdit(item, editRef.current)}
            aria-label={actionName("edit", item.number)}
          >
            {W.edit}
          </Button>
          <Button
            variant="outline"
            className="h-11 px-4 data-disabled:opacity-50"
            disabled={!!reason}
            focusableWhenDisabled
            aria-describedby={reason ? reasonId : undefined}
            onClick={() => onDelete(item)}
            aria-label={actionName("delete", item.number)}
          >
            {W.delete}
          </Button>
        </ItemFooter>
      )}
    </Item>
  );
}
