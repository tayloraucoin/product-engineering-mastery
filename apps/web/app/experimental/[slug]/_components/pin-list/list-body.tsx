"use client";

/**
 * The list's body (pin-list.md, Layout and States): the lines at the top
 * (the load error, offline, the unsent line with Retry, and below 768px the
 * bar's save status), then one section per design, each a list of items,
 * or the empty line with "Start commenting", or the static skeleton.
 *
 * The unsent line sits in a polite live region; Retry's outcome is read in
 * a second one, so "2 comments sent." is heard as the line clears.
 */
import { useId } from "react";

import { Button } from "@pem/ui/button";
import { ItemGroup } from "@pem/ui/item";
import { Skeleton } from "@pem/ui/skeleton";

import {
  EXPERIMENT_WORDS,
  type BarData,
} from "../../../../../lib/sandbox/client/experiment-view";
import {
  LIST_WORDS as W,
  type GroupedList,
  type ListItem as ListItemData,
} from "../../../../../lib/sandbox/client/pin-list";
import { ListItem } from "./list-item";

export function ListBody({
  list,
  designCount,
  load,
  online,
  bar,
  reason,
  reasonId,
  said,
  register,
  onShow,
  onEdit,
  onDelete,
  onRetry,
  onStart,
}: {
  list: GroupedList;
  designCount: number;
  load: "loading" | "ok" | "error";
  online: boolean;
  bar: BarData;
  /** Why Edit, Delete and Retry are disabled (closed or revoked), or null. */
  reason: string | null;
  reasonId: string;
  /** Retry's outcome, read politely. */
  said: string;
  register(id: string, element: HTMLElement | null): void;
  onShow(item: ListItemData): void;
  onEdit(item: ListItemData, editButton: HTMLElement | null): void;
  onDelete(item: ListItemData): void;
  onRetry(): void;
  onStart(): void;
}) {
  const id = useId();
  const items = list.groups.flatMap((g) => g.items);
  // Only what is still queued: an edit being saved is "sending", not unsent.
  const unsent = items.filter((i) => i.sync === "unsent").length;
  const retryHeld = !!reason || !online;
  const showUnsent = unsent > 0 && load !== "error";

  const retry = (
    <Button
      variant="outline"
      className="h-11 px-4 data-disabled:opacity-50"
      disabled={retryHeld}
      // Focusable while disabled, so its reason is reached and read.
      focusableWhenDisabled={!!reason}
      aria-describedby={reason ? reasonId : undefined}
      onClick={onRetry}
    >
      {W.retry}
    </Button>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6">
      {reason ? (
        <p id={reasonId} className="text-sm text-muted-foreground">
          {reason}
        </p>
      ) : null}
      {!online ? <p className="text-sm">{W.offline}</p> : null}
      {load === "error" ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm">{W.loadError}</p>
          {retry}
        </div>
      ) : null}
      {/* Always mounted, so the line is announced as it changes. */}
      <div
        className={
          showUnsent ? "flex flex-wrap items-center gap-3" : "contents"
        }
      >
        <p
          role="status"
          className={showUnsent ? "text-sm font-medium" : "sr-only"}
        >
          {showUnsent ? W.unsent(unsent) : null}
        </p>
        {showUnsent ? retry : null}
      </div>
      <p aria-live="polite" className="sr-only">
        {said}
      </p>
      {/* Below 768px the bar's save status lives here (pin-list.md, Layout). */}
      {bar.status.kind === "saved" ? (
        <p className="text-sm text-muted-foreground md:hidden">
          {EXPERIMENT_WORDS.saved}
        </p>
      ) : null}

      {load === "loading" ? (
        <ListSkeleton groups={designCount} headed={designCount > 1} />
      ) : items.length === 0 && load === "ok" ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-base">{W.empty}</p>
          <Button
            variant="outline"
            className="h-11 px-4 data-disabled:opacity-50"
            disabled={!!reason}
            focusableWhenDisabled
            aria-describedby={reason ? reasonId : undefined}
            onClick={onStart}
          >
            {W.startCommenting}
          </Button>
        </div>
      ) : (
        list.groups.map((group, index) => {
          const headingId = `${id}-group-${index}`;
          const rows = (
            <ItemGroup className="gap-2">
              {group.items.map((item) => (
                <ListItem
                  key={item.id}
                  item={item}
                  reason={reason}
                  reasonId={reasonId}
                  register={register}
                  onShow={onShow}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </ItemGroup>
          );
          return list.headed ? (
            <section
              key={group.design?.id ?? "other"}
              aria-labelledby={headingId}
              className="flex flex-col gap-2"
            >
              <h3
                id={headingId}
                className="flex items-baseline gap-2 text-sm font-semibold"
              >
                {group.heading}
                <span className="font-normal text-muted-foreground">
                  <span className="sr-only">, </span>
                  {W.count(group.items.length)}
                </span>
              </h3>
              {rows}
            </section>
          ) : (
            <div key="only">{rows}</div>
          );
        })
      )}
    </div>
  );
}

/** Static rows in the final layout's shape, three per group, no shimmer (A-14). */
function ListSkeleton({ groups, headed }: { groups: number; headed: boolean }) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      {Array.from({ length: groups }, (_, g) => (
        <div key={g} className="flex flex-col gap-2">
          {headed ? <Skeleton className="h-4 w-32 animate-none" /> : null}
          {Array.from({ length: 3 }, (_, r) => (
            <div key={r} className="flex gap-3 rounded-md border p-3">
              <Skeleton className="size-7 shrink-0 animate-none rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/5 animate-none" />
                <Skeleton className="h-4 w-full animate-none" />
                <Skeleton className="h-4 w-3/4 animate-none" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
