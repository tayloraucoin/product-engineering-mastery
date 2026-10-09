"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Info, Plus, TriangleAlert, WifiOff } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@pem/ui/alert";
import { Button, buttonVariants } from "@pem/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@pem/ui/empty";
import { useToastManager } from "@pem/ui/toast";

import {
  buildCountWords,
  buildFilterWords,
  buildRecordsSearch,
  effectiveSort,
  filterRecords,
  hasFilters,
  parseRecordsQuery,
  parseSort,
  sortRecords,
  type RecordsQuery,
  type SortColumn,
} from "../../_lib/query";
import { useDemoStore } from "../../../../_components/demo-store";
import {
  GREYFOLD_ID,
  HALVORSEN_ID,
  KESTREL_ID,
  PELLOW_ID,
} from "../../../../_lib/fixtures";
import type { DemoPrefs, RecordSummary, Status } from "../../../../_lib/record";
import { RecordsGrid, RecordsGridSkeleton } from "./records-grid";
import { RecordsList, RecordsListSkeleton } from "./records-list";
import { RecordsToolbar } from "./records-toolbar";

export type RecordsState =
  | "empty"
  | "no-results"
  | "loading"
  | "error"
  | "partial"
  | "offline"
  | "deleted"
  | null;

const NEW_RECORD_HREF = "/demo/records/new";
const NOTICE_ID = "records-notice";
/** The rows whose owner did not load on `partial` (data-contract.md). */
const OWNER_NOT_LOADED: ReadonlySet<string> = new Set([
  HALVORSEN_ID,
  KESTREL_ID,
  PELLOW_ID,
]);
/** The filters a bare `no-results` shows: they match nothing in the fixtures. */
const NO_RESULTS_FILTERS = { q: "Zephyr", status: "terminated" } as const;
/** First press on a header: highest value first, the rest A to Z or soonest. */
const FIRST_DIRECTION: Record<SortColumn, "asc" | "desc"> = {
  vendor: "asc",
  owner: "asc",
  status: "asc",
  value: "desc",
  renews: "asc",
};

function NewRecord({
  variant = "default",
  offline = false,
}: {
  variant?: "default" | "outline";
  offline?: boolean;
}) {
  const content = (
    <>
      <Plus aria-hidden="true" data-icon="inline-start" />
      New record
    </>
  );
  // A link cannot be disabled; offline it is a disabled button the notice explains.
  if (offline)
    return (
      <Button disabled aria-describedby={NOTICE_ID}>
        {content}
      </Button>
    );
  return (
    <Link href={NEW_RECORD_HREF} className={buttonVariants({ variant })}>
      {content}
    </Link>
  );
}

/**
 * The records table (records-table.md). The URL holds every filter and the
 * sort; this view reads them back on each render and changes them only with
 * `router.replace`, which also drops a forced `?state=`.
 */
export function RecordsView({
  state,
  defaultSort,
  compact,
}: {
  state: RecordsState;
  defaultSort: DemoPrefs["defaultSort"];
  compact: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { state: store, dispatch } = useDemoStore();
  // The provider's own manager: the module one subscribes in an effect that
  // runs after this view's, so a toast added on mount would be lost.
  const toasts = useToastManager();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const urlQuery = parseRecordsQuery(params);
  const query: RecordsQuery =
    state === "no-results" && !hasFilters(urlQuery)
      ? { ...urlQuery, ...NO_RESULTS_FILTERS }
      : urlQuery;
  const sort = effectiveSort(query, defaultSort);
  const [draft, setDraft] = useState(query.q);

  // A bare `deleted` with no delete this visit shows the fixture's: Greyfold.
  const deletedEvent =
    store.lastEvent?.kind === "deleted" ? store.lastEvent : null;
  const fixtureDelete = state === "deleted" && !deletedEvent;
  const source: readonly RecordSummary[] =
    state === "empty"
      ? []
      : fixtureDelete
        ? store.records.filter((r) => r.id !== GREYFOLD_ID)
        : store.records;
  const rows = sortRecords(filterRecords(source, query), sort);
  const filtered = hasFilters(query);
  const ownerLoaded = (record: RecordSummary) =>
    state !== "partial" || !OWNER_NOT_LOADED.has(record.id);

  const announced = useRef(false);
  useEffect(() => {
    if (state !== "deleted" || announced.current) return;
    announced.current = true;
    let vendor = deletedEvent?.vendor;
    if (!vendor) {
      vendor =
        store.records.find((r) => r.id === GREYFOLD_ID)?.vendor ??
        "Greyfold Security";
      dispatch({ type: "delete", id: GREYFOLD_ID });
    }
    toasts.add({
      title: `${vendor} deleted`,
      description: "Demo data resets when you reload.",
      type: "success",
    });
    headingRef.current?.focus();
    // Once per visit to the key; the store's later changes do not re-announce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function replace(next: RecordsQuery) {
    router.replace(`${pathname}${buildRecordsSearch(next)}`, { scroll: false });
  }

  function clearFilters() {
    setDraft("");
    replace({ q: "", status: null, owner: null, sort: query.sort });
    searchRef.current?.focus();
  }

  function sortBy(column: SortColumn) {
    replace({
      ...query,
      sort:
        sort.column === column
          ? { column, direction: sort.direction === "asc" ? "desc" : "asc" }
          : { column, direction: FIRST_DIRECTION[column] },
    });
  }

  const offline = state === "offline";
  const loading = state === "loading";
  const isEmpty = !loading && state !== "error" && source.length === 0;

  return (
    <section
      data-demo-state={state ?? "default"}
      className="mx-auto flex w-full max-w-(--container-6xl) flex-col gap-6 pt-2 md:pt-4"
    >
      <header className="flex items-start justify-between gap-4 md:items-center">
        <div className="flex flex-col gap-1">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-xl font-semibold outline-none"
          >
            Records
          </h1>
          <p className="text-sm text-muted-foreground">
            Vendor contracts, synthetic demo data
          </p>
        </div>
        {isEmpty ? null : (
          <NewRecord
            variant={state === "error" ? "outline" : "default"}
            offline={offline}
          />
        )}
      </header>

      {state === "error" ? (
        <Alert variant="destructive">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>Records did not load</AlertTitle>
          <AlertDescription>
            The demo data request failed. Retry, or reload the page.
          </AlertDescription>
          <AlertAction>
            <Button size="sm" onClick={() => replace(urlQuery)}>
              Retry
            </Button>
          </AlertAction>
        </Alert>
      ) : isEmpty ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyTitle>No records yet</EmptyTitle>
            <EmptyDescription>
              Each record is one vendor contract: its owner, value, renewal date
              and terms.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NewRecord />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4 md:gap-6">
          <RecordsToolbar
            draft={draft}
            status={query.status}
            owner={query.owner}
            sort={sort}
            countWords={
              loading
                ? null
                : buildCountWords(rows.length, source.length, filtered)
            }
            disabled={loading}
            searchRef={searchRef}
            onSearch={(q) => {
              setDraft(q);
              replace({ ...query, q: q.trim() });
            }}
            onStatus={(status: Status | null) => replace({ ...query, status })}
            onOwner={(owner) => replace({ ...query, owner })}
            onSort={(value) => replace({ ...query, sort: parseSort(value) })}
          />

          {state === "partial" ? (
            <Alert role="status" id={NOTICE_ID}>
              <Info aria-hidden="true" />
              <AlertTitle>Some owners did not load</AlertTitle>
              <AlertDescription>
                {OWNER_NOT_LOADED.size} records show &quot;Not loaded&quot; for
                Owner. Those rows still open, and the rest of each record is
                complete.
              </AlertDescription>
            </Alert>
          ) : offline ? (
            <Alert role="status" id={NOTICE_ID}>
              <WifiOff aria-hidden="true" />
              <AlertTitle>You are offline</AlertTitle>
              <AlertDescription>
                These records are the last ones loaded and stay readable. New
                record is off until you reconnect.
              </AlertDescription>
            </Alert>
          ) : null}

          {loading ? (
            <>
              <div className="hidden md:block">
                <RecordsGridSkeleton sort={sort} compact={compact} />
              </div>
              <RecordsListSkeleton compact={compact} />
            </>
          ) : rows.length === 0 ? (
            <Empty className="rounded-none border-t border-solid py-16">
              <EmptyHeader>
                <EmptyTitle>No records match these filters</EmptyTitle>
                <EmptyDescription>{buildFilterWords(query)}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <>
              <div className="hidden md:block">
                <RecordsGrid
                  rows={rows}
                  sort={sort}
                  onSort={sortBy}
                  compact={compact}
                  ownerLoaded={ownerLoaded}
                />
              </div>
              <RecordsList
                rows={rows}
                compact={compact}
                ownerLoaded={ownerLoaded}
              />
            </>
          )}
        </div>
      )}
    </section>
  );
}
