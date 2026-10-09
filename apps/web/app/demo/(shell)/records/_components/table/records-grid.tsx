"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@pem/ui/button";
import { cn } from "@pem/ui/cn";
import { Skeleton } from "@pem/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pem/ui/table";

import { ownerName, type RecordsSort, type SortColumn } from "../../_lib/query";
import { StatusBadge } from "../../../../_components/status-badge";
import type { RecordSummary } from "../../../../_lib/record";
import { formatValue, recordHref, renewsWords } from "./cells";

const COLUMNS: {
  id: SortColumn;
  title: string;
  /** 3 : 2 : 1.33 : 1.67 : 2 as fractions of the table from lg (the canvas);
   * below lg the value column takes room from vendor so its header fits. */
  width: string;
  numeric?: boolean;
}[] = [
  { id: "vendor", title: "Vendor", width: "w-1/4 lg:w-3/10" },
  { id: "owner", title: "Owner", width: "w-1/5" },
  { id: "status", title: "Status", width: "w-2/15" },
  {
    id: "value",
    title: "Annual value (USD)",
    width: "w-1/5 lg:w-1/6",
    numeric: true,
  },
  { id: "renews", title: "Renews", width: "w-1/5" },
];

const SKELETON_ROWS = 14;
const SKELETON_VENDOR = [
  "w-42",
  "w-32",
  "w-49",
  "w-37",
  "w-45",
  "w-32",
  "w-40",
];
const SKELETON_OWNER = ["w-26", "w-21", "w-30"];

function SortHeader({
  title,
  numeric,
  sorted,
  disabled,
  onSort,
}: {
  title: string;
  numeric?: boolean;
  sorted: RecordsSort["direction"] | null;
  disabled?: boolean;
  onSort: () => void;
}) {
  const Chevron = sorted === "desc" ? ChevronDown : ChevronUp;
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={disabled}
      onClick={onSort}
      className={cn(
        "font-medium disabled:opacity-100",
        numeric ? "-mr-2.5 flex-row-reverse" : "-ml-2.5",
      )}
    >
      {title}
      <Chevron
        aria-hidden="true"
        className={cn(
          "size-3.5",
          sorted
            ? "opacity-100"
            : "opacity-0 group-hover/button:opacity-100 group-focus-visible/button:opacity-100",
        )}
      />
    </Button>
  );
}

function SortableHead({
  sort,
  onSort,
  disabled,
}: {
  sort: RecordsSort;
  onSort?: (column: SortColumn) => void;
  disabled?: boolean;
}) {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        {COLUMNS.map((column) => {
          const sorted = sort.column === column.id ? sort.direction : null;
          return (
            <TableHead
              key={column.id}
              aria-sort={
                sorted === "asc"
                  ? "ascending"
                  : sorted === "desc"
                    ? "descending"
                    : undefined
              }
              className={cn(column.width, column.numeric && "text-right")}
            >
              <SortHeader
                title={column.title}
                numeric={column.numeric}
                sorted={sorted}
                disabled={disabled}
                onSort={() => onSort?.(column.id)}
              />
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
}

/** The 1440 table, from `md` up: a real table whose vendor cell is the row's link. */
export function RecordsGrid({
  rows,
  sort,
  onSort,
  compact,
  ownerLoaded,
}: {
  rows: readonly RecordSummary[];
  sort: RecordsSort;
  onSort: (column: SortColumn) => void;
  compact: boolean;
  ownerLoaded: (record: RecordSummary) => boolean;
}) {
  const router = useRouter();
  const cell = cn("whitespace-normal", compact ? "py-1" : "py-2");

  // A click anywhere on the row forwards to its link; the link itself and
  // a modified click keep their own behaviour.
  function forward(event: MouseEvent<HTMLTableRowElement>, href: string) {
    if ((event.target as Element).closest("a, button")) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    router.push(href);
  }

  return (
    <Table className="table-fixed">
      <TableCaption className="sr-only">Records</TableCaption>
      <SortableHead sort={sort} onSort={onSort} />
      <TableBody>
        {rows.map((record) => {
          const href = recordHref(record);
          return (
            <TableRow
              key={record.id}
              data-record-id={record.id}
              onClick={(event) => forward(event, href)}
              className="cursor-pointer transition-none"
            >
              <TableCell className={cn(cell, "font-medium")}>
                <Link
                  href={href}
                  className="rounded-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {record.vendor}
                </Link>
              </TableCell>
              <TableCell className={cn(cell, "text-muted-foreground")}>
                {ownerLoaded(record) ? (
                  ownerName(record.ownerId)
                ) : (
                  <em>Not loaded</em>
                )}
              </TableCell>
              <TableCell className={cell}>
                <StatusBadge status={record.status} />
              </TableCell>
              <TableCell className={cn(cell, "text-right tabular-nums")}>
                {formatValue(record.annualValueUsd)}
              </TableCell>
              <TableCell
                className={cn(cell, "text-muted-foreground tabular-nums")}
              >
                {renewsWords(record)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

/** `loading` at 1440: the headers as they will be, the rows as still skeletons. */
export function RecordsGridSkeleton({
  sort,
  compact,
}: {
  sort: RecordsSort;
  compact: boolean;
}) {
  const cell = compact ? "py-1" : "py-2";
  return (
    <Table className="table-fixed" aria-busy="true">
      <TableCaption className="sr-only">Records</TableCaption>
      <SortableHead sort={sort} disabled />
      <TableBody>
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <TableRow key={i} className="hover:bg-transparent">
            <TableCell className={cell}>
              <Skeleton
                className={cn(
                  "h-5 animate-none rounded-full",
                  SKELETON_VENDOR[i % SKELETON_VENDOR.length],
                )}
              />
            </TableCell>
            <TableCell className={cell}>
              <Skeleton
                className={cn(
                  "h-5 animate-none rounded-full",
                  SKELETON_OWNER[i % SKELETON_OWNER.length],
                )}
              />
            </TableCell>
            <TableCell className={cell}>
              <Skeleton className="h-5 w-17 animate-none rounded-full" />
            </TableCell>
            <TableCell className={cell}>
              <Skeleton className="ml-auto h-5 w-14 animate-none rounded-full" />
            </TableCell>
            <TableCell className={cell}>
              <Skeleton className="h-5 w-22 animate-none rounded-full" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
