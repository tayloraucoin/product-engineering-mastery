/**
 * The record of actions (D-LAB-3, S12c): newest first, 50 to a page, read
 * only. Each row names the team member who acted and what was done, in
 * counts; never a reviewer or their email (D-LAB-28). Pages are links, so
 * the back button and a shared link both work.
 */
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@pem/ui/pagination";
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

import {
  DATA_WORDS,
  type RecordView,
} from "../../../../lib/sandbox/admin/admin-data-view";
import { SANDBOX_TIME_ZONE } from "../../../../lib/sandbox/shared/time";

const W = DATA_WORDS;

const WHEN = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: SANDBOX_TIME_ZONE,
});

const pageHref = (page: number) =>
  page === 1 ? "/admin/data" : `/admin/data?page=${page}`;

export function RecordTable({ record }: { record: RecordView }) {
  return (
    <section aria-labelledby="record-heading" className="flex flex-col gap-4">
      <h2 id="record-heading" className="text-lg font-semibold">
        {W.recordHeading}
      </h2>
      {record.rows.length === 0 ? (
        <p className="text-muted-foreground">{W.recordEmpty}</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableCaption className="sr-only">{W.recordCaption}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>{W.columns.when}</TableHead>
                  <TableHead>{W.columns.who}</TableHead>
                  <TableHead>{W.columns.what}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {record.rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="tabular-nums whitespace-nowrap">
                      <time dateTime={row.at}>
                        {WHEN.format(new Date(row.at))}
                      </time>
                    </TableCell>
                    <TableCell className="break-all">{row.who}</TableCell>
                    <TableCell className="min-w-64 whitespace-normal">
                      {row.what}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {record.pages > 1 ? (
            <Pagination className="justify-start">
              <PaginationContent>
                {record.page > 1 ? (
                  <PaginationItem>
                    <PaginationPrevious
                      href={pageHref(record.page - 1)}
                      text={W.newer}
                    />
                  </PaginationItem>
                ) : null}
                <PaginationItem>
                  <span className="px-2 text-sm text-muted-foreground">
                    {W.pageOf(record.page, record.pages)}
                  </span>
                </PaginationItem>
                {record.page < record.pages ? (
                  <PaginationItem>
                    <PaginationNext
                      href={pageHref(record.page + 1)}
                      text={W.older}
                    />
                  </PaginationItem>
                ) : null}
              </PaginationContent>
            </Pagination>
          ) : null}
        </>
      )}
    </section>
  );
}

/** A static skeleton of both sections while the page loads (`data-page-loading`). */
export function DataPageSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-hidden="true">
      <div className="flex flex-col gap-3">
        <Skeleton className="animate-none h-6 w-40" />
        <Skeleton className="animate-none h-4 w-32" />
        <Skeleton className="animate-none h-9 w-full max-w-md" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="animate-none h-6 w-44" />
        <div className="flex flex-col gap-3 rounded-lg border p-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-6">
              <Skeleton className="animate-none h-4 w-32" />
              <Skeleton className="animate-none h-4 w-40" />
              <Skeleton className="animate-none h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
