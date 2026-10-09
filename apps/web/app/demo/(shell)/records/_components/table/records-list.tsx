import Link from "next/link";

import { cn } from "@pem/ui/cn";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@pem/ui/item";
import { Skeleton } from "@pem/ui/skeleton";

import { StatusBadge } from "../../../../_components/status-badge";
import type { RecordSummary } from "../../../../_lib/record";
import { metaWords, recordHref } from "./cells";

const ROW = "rounded-none border-0 border-b border-border px-0";
const SKELETON_ROWS = 6;
const SKELETON_TITLE = ["w-37", "w-32", "w-42", "w-35", "w-40", "w-34"];
const SKELETON_META = ["w-65", "w-60", "w-70", "w-62", "w-57", "w-67"];

/** The 390 list, below `md`: each row one link, named by its vendor. */
export function RecordsList({
  rows,
  compact,
  ownerLoaded,
}: {
  rows: readonly RecordSummary[];
  compact: boolean;
  ownerLoaded: (record: RecordSummary) => boolean;
}) {
  return (
    <ul className="border-t md:hidden">
      {rows.map((record) => {
        const vendorId = `${record.id}-vendor`;
        return (
          <li key={record.id} data-record-id={record.id}>
            <Item
              render={<Link href={recordHref(record)} />}
              aria-labelledby={vendorId}
              aria-describedby={`${record.id}-status ${record.id}-meta`}
              className={cn(
                ROW,
                compact ? "py-1.5" : "py-3",
                "transition-none [a]:transition-none [a]:hover:bg-hover",
              )}
            >
              <ItemContent className="gap-1">
                <div className="flex items-start justify-between gap-3">
                  <ItemTitle id={vendorId} className="line-clamp-none">
                    {record.vendor}
                  </ItemTitle>
                  <span id={`${record.id}-status`}>
                    <StatusBadge status={record.status} />
                  </span>
                </div>
                <ItemDescription
                  id={`${record.id}-meta`}
                  className="line-clamp-none tabular-nums"
                >
                  {metaWords(record, ownerLoaded(record))}
                </ItemDescription>
              </ItemContent>
            </Item>
          </li>
        );
      })}
    </ul>
  );
}

/** `loading` at 390: the list's final layout, still. */
export function RecordsListSkeleton({ compact }: { compact: boolean }) {
  return (
    <ul className="border-t md:hidden" aria-busy="true">
      {Array.from({ length: SKELETON_ROWS }, (_, i) => (
        <li
          key={i}
          className={cn(
            "flex flex-col gap-2 border-b",
            compact ? "py-1.5" : "py-3",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <Skeleton
              className={cn("h-4 animate-none rounded-full", SKELETON_TITLE[i])}
            />
            <Skeleton className="h-5 w-16 animate-none rounded-full" />
          </div>
          <Skeleton
            className={cn("h-4 animate-none rounded-full", SKELETON_META[i])}
          />
        </li>
      ))}
    </ul>
  );
}
