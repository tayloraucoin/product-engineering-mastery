"use client";

/**
 * The Experiments list (experiments.md): title, status word, designs,
 * reviewers, last activity and data held, sortable by title, status and last
 * activity. Each row's title link is its one Tab stop, plus "Delete data"
 * where an admin sees it.
 */
import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArchiveIcon,
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
} from "lucide-react";

import { Button } from "@pem/ui/button";
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
  EXPERIMENTS_WORDS,
  type ExperimentRow,
  type ExperimentsView,
  type StaleMarker,
} from "../../../../lib/sandbox/admin/admin-experiments";

const W = EXPERIMENTS_WORDS;

type SortKey = "title" | "status" | "lastActivity";
type Sort = { key: SortKey; dir: "asc" | "desc" } | null;

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function useOnline() {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
}

const sortValue: Record<SortKey, (r: ExperimentRow) => string> = {
  title: (r) => r.title.toLowerCase(),
  status: (r) => r.status,
  lastActivity: (r) => r.lastActivity?.at ?? "",
};

export function ExperimentsTable({ view }: { view: ExperimentsView }) {
  const online = useOnline();
  const [sort, setSort] = useState<Sort>(null);
  const rows = useMemo(() => {
    const list = view.list?.rows ?? [];
    if (!sort) return list;
    const value = sortValue[sort.key];
    const sign = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => sign * value(a).localeCompare(value(b)));
  }, [view.list, sort]);

  if (view.loading) return <ExperimentsSkeleton />;
  if (view.error || !view.list)
    return <p className="text-muted-foreground">{W.error}</p>;
  if (view.list.rows.length === 0)
    return <p className="text-muted-foreground">{W.empty}</p>;

  const offline = view.offline || !online;
  const toggle = (key: SortKey) =>
    setSort((s) =>
      s?.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "lastActivity" ? "desc" : "asc" },
    );
  const ariaSort = (key: SortKey) =>
    sort?.key === key
      ? sort.dir === "asc"
        ? "ascending"
        : "descending"
      : "none";

  return (
    <div className="flex flex-col gap-4">
      {offline ? (
        <p role="status" className="text-muted-foreground">
          {W.offline}
        </p>
      ) : null}
      {view.list.partial ? (
        <p className="text-muted-foreground">{W.partial}</p>
      ) : null}
      <div className="rounded-lg border">
        <Table>
          <TableCaption className="sr-only">{W.caption}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead aria-sort={ariaSort("title")}>
                <SortButton
                  label={W.columns.title}
                  sort={sort?.key === "title" ? sort.dir : null}
                  onClick={() => toggle("title")}
                />
              </TableHead>
              <TableHead aria-sort={ariaSort("status")}>
                <SortButton
                  label={W.columns.status}
                  sort={sort?.key === "status" ? sort.dir : null}
                  onClick={() => toggle("status")}
                />
              </TableHead>
              <TableHead className="text-right">{W.columns.designs}</TableHead>
              <TableHead className="text-right">
                {W.columns.reviewers}
              </TableHead>
              <TableHead aria-sort={ariaSort("lastActivity")}>
                <SortButton
                  label={W.columns.lastActivity}
                  sort={sort?.key === "lastActivity" ? sort.dir : null}
                  onClick={() => toggle("lastActivity")}
                />
              </TableHead>
              <TableHead>{W.columns.dataHeld}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.slug}>
                <TableCell className="font-medium">
                  <Link
                    href={row.href}
                    className="underline-offset-4 hover:underline"
                  >
                    {row.title}
                  </Link>
                </TableCell>
                <TableCell>
                  {row.status === "Open" ? W.open : W.closed}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.designs}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.reviewers}
                </TableCell>
                <TableCell className="tabular-nums">
                  {row.lastActivity ? (
                    <time
                      dateTime={row.lastActivity.at}
                      title={row.lastActivity.exact}
                    >
                      {row.lastActivity.relative}
                      <span className="sr-only">
                        {" "}
                        ({row.lastActivity.exact})
                      </span>
                    </time>
                  ) : (
                    W.missing
                  )}
                </TableCell>
                <TableCell>
                  {row.marker ? (
                    <StaleMarkerLine marker={row.marker} />
                  ) : (
                    W.missing
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SortButton({
  label,
  sort,
  onClick,
}: {
  label: string;
  sort: "asc" | "desc" | null;
  onClick: () => void;
}) {
  const Icon =
    sort === "asc"
      ? ArrowUpIcon
      : sort === "desc"
        ? ArrowDownIcon
        : ArrowUpDownIcon;
  return (
    <Button variant="ghost" size="sm" className="-ml-2.5" onClick={onClick}>
      {label}
      <Icon aria-hidden="true" data-icon="inline-end" />
    </Button>
  );
}

/** The stale-data marker: plain text and an icon, no alarm colour (A-19). */
export function StaleMarkerLine({ marker }: { marker: StaleMarker }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <ArchiveIcon
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
      />
      <span>{marker.text}</span>
      {marker.deleteHref ? (
        <Link href={marker.deleteHref} className="underline underline-offset-4">
          {W.deleteData}
        </Link>
      ) : null}
    </span>
  );
}

export function ExperimentsSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-lg border p-4"
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-6">
          <Skeleton className="h-4 animate-none flex-1" />
          <Skeleton className="h-4 animate-none w-16" />
          <Skeleton className="h-4 animate-none w-8" />
          <Skeleton className="h-4 animate-none w-24" />
          <Skeleton className="h-4 animate-none w-20" />
          <Skeleton className="h-4 animate-none w-40" />
        </div>
      ))}
    </div>
  );
}
