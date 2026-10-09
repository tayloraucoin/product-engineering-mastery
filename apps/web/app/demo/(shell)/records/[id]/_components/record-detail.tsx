"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@pem/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@pem/ui/breadcrumb";
import { Button, buttonVariants } from "@pem/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@pem/ui/empty";
import { Skeleton } from "@pem/ui/skeleton";
import { toast } from "@pem/ui/toast";

import {
  useDemoRecord,
  useDemoStore,
} from "../../../../_components/demo-store";
import { StatusBadge } from "../../../../_components/status-badge";
import { DEMO_TODAY, relativeDay } from "../../../../_lib/clock";
import { HALVORSEN_ID, OWNERS } from "../../../../_lib/fixtures";
import { formatDate, formatUsd } from "../../../../_lib/format";
import type {
  RecordBody,
  RecordId,
  RecordSummary,
  Version,
} from "../../../../_lib/record";
import type { DemoEvent } from "../../../../_lib/store";
import { HistoryList } from "./history-list";
import { TermsSection } from "./terms-section";

export type DetailState =
  | "diff"
  | "no-history"
  | "empty"
  | "loading"
  | "error"
  | "not-found"
  | "partial"
  | "offline"
  | "saved"
  | null;

const RECORDS_HREF = "/demo/records";
const NOTICE_ID = "record-notice";
const FIELD_LABELS: Record<string, string> = {
  vendor: "Name",
  ownerId: "Owner",
  status: "Status",
  annualValueUsd: "Annual value",
  renewsOn: "Renewal date",
  endedOn: "End date",
};

function BackLink() {
  return (
    <Link
      href={RECORDS_HREF}
      className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground md:hidden"
    >
      <ChevronLeft aria-hidden="true" className="size-4" />
      Records
    </Link>
  );
}

function BackCrumb({ name }: { name: string }) {
  return (
    <Breadcrumb aria-label="Breadcrumb" className="hidden md:block">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href={RECORDS_HREF} />}>
            Records
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function Column({
  children,
  state,
}: {
  children: ReactNode;
  state: DetailState;
}) {
  return (
    <section
      data-demo-state={state ?? "default"}
      className="mx-auto flex w-full max-w-(--container-3xl) flex-col gap-6"
    >
      {children}
    </section>
  );
}

function ErrorNotice({ retry }: { retry: () => void }) {
  return (
    <Alert variant="destructive">
      <TriangleAlert aria-hidden="true" />
      <AlertTitle>This record did not load</AlertTitle>
      <AlertDescription>
        <p>The demo data request failed. Retry, or go back to records.</p>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" onClick={retry}>
            Retry
          </Button>
          <Link
            href={RECORDS_HREF}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Back to records
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  );
}

function NotFound({ id }: { id: string }) {
  return (
    <Column state="not-found">
      <Breadcrumb aria-label="Breadcrumb" className="hidden md:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={RECORDS_HREF} />}>
              Records
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Not found</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <BackLink />
      <Empty>
        <EmptyHeader>
          <EmptyTitle>
            <h1>No record with this link</h1>
          </EmptyTitle>
          <EmptyDescription>
            Nothing matches {id}. It may have been deleted, and demo data resets
            when you reload.
          </EmptyDescription>
        </EmptyHeader>
        <Link
          href={RECORDS_HREF}
          className={buttonVariants({ variant: "outline" })}
        >
          Back to records
        </Link>
      </Empty>
    </Column>
  );
}

function LoadingBlock({ name }: { name: string }) {
  return (
    <Column state="loading">
      <BackCrumb name={name} />
      <BackLink />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{name}</h1>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex flex-col gap-2 md:flex-row-reverse">
          <Skeleton className="h-9 w-full md:w-18" />
          <Skeleton className="h-9 w-full md:w-14" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:flex md:gap-x-10">
        {["w-20", "w-24", "w-20", "w-40"].map((w, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className={`h-4 ${w}`} />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 border-t pt-4">
        <Skeleton className="h-5 w-16" />
        {["w-5/6", "w-2/3", "w-3/4", "w-4/5", "w-3/5"].map((w) => (
          <Skeleton key={w} className={`h-4 ${w}`} />
        ))}
      </div>
      <div className="flex flex-col gap-3 border-t pt-4">
        <Skeleton className="h-5 w-16" />
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </Column>
  );
}

/** What each `?state=` key changes about the data on show. */
function applyState(
  state: DetailState,
  summary: RecordSummary,
  body: RecordBody | undefined,
): { summary: RecordSummary; body: RecordBody | undefined } {
  if (state === "no-history" && body)
    return { summary, body: { ...body, versions: body.versions.slice(-1) } };
  if (state === "empty")
    return {
      summary: { ...summary, versionCount: 0 },
      body: body && { ...body, versions: [] },
    };
  if (state === "saved" && summary.id === HALVORSEN_ID)
    return {
      summary: {
        ...summary,
        annualValueUsd: 52000,
        lastChange: { on: DEMO_TODAY, by: "you" },
      },
      body,
    };
  return { summary, body };
}

function savedToast(name: string, event: DemoEvent | null) {
  if (event?.kind === "saved" && event.vendor === name) {
    const wroteTerms = event.fields.includes("clauses");
    const changed = event.fields
      .filter((f) => f !== "clauses")
      .map((f) => FIELD_LABELS[f] ?? f);
    return {
      title: `${name} saved`,
      description: wroteTerms
        ? "Terms updated, saved as a new version."
        : changed.length > 0
          ? `${changed.join(", ")} updated. Terms are unchanged, so no new version.`
          : "Nothing changed, so nothing new was saved.",
    };
  }
  return {
    title: `${name} saved`,
    description:
      "Annual value updated. Terms are unchanged, so no new version.",
  };
}

function lastChangeWords(summary: RecordSummary): string {
  const { on, by } = summary.lastChange;
  return by === "you" ? "Just now by you" : `${relativeDay(on)} by ${by}`;
}

export function RecordDetail({
  id,
  state,
  compare,
  dialog,
}: {
  id: string;
  state: DetailState;
  compare: boolean;
  /** DEMO-12 mounts the delete dialog here when `?dialog=delete`; Delete is `#record-delete`. */
  dialog?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { state: store } = useDemoStore();
  const { summary: stored, body: storedBody } = useDemoRecord(id as RecordId);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const toasted = useRef(false);

  const known = state !== "not-found" && stored !== undefined;
  const name = stored?.vendor;

  useEffect(() => {
    if (state !== "saved" || !known || !name || toasted.current) return;
    toasted.current = true;
    toast.add({ type: "success", ...savedToast(name, store.lastEvent) });
    headingRef.current?.focus();
  }, [state, known, name, store.lastEvent]);

  if (!known || !stored) return <NotFound id={id} />;
  const { summary, body } = applyState(state, stored, storedBody);

  if (state === "loading") return <LoadingBlock name={summary.vendor} />;
  if (state === "error")
    return (
      <Column state="error">
        <BackCrumb name={summary.vendor} />
        <BackLink />
        <ErrorNotice retry={() => router.replace(pathname)} />
      </Column>
    );

  const versions: Version[] = body?.versions ?? [];
  const current = versions[0];
  const previous = versions[1];
  const offline = state === "offline";
  const canCompare = state !== "partial" && previous !== undefined;
  const owner =
    OWNERS.find((o) => o.id === summary.ownerId)?.name ?? "Unassigned";

  const setView = (view: "current" | "compare") => {
    const next = new URLSearchParams(params.toString());
    if (view === "compare") next.set("view", "compare");
    else {
      next.delete("view");
      if (state === "diff") next.delete("state");
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };
  const openDelete = () => {
    const next = new URLSearchParams(params.toString());
    next.set("dialog", "delete");
    router.push(`${pathname}?${next.toString()}`);
  };
  const blocked = (event: { preventDefault: () => void }) =>
    event.preventDefault();
  const describedBy = offline ? NOTICE_ID : undefined;

  return (
    <Column state={state}>
      <BackCrumb name={summary.vendor} />
      <BackLink />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-semibold outline-none"
          >
            {summary.vendor}
          </h1>
          <StatusBadge status={summary.status} />
        </div>
        <div className="flex flex-col gap-2 md:flex-row-reverse md:justify-end">
          {offline ? (
            <Button
              aria-disabled="true"
              aria-describedby={describedBy}
              onClick={blocked}
              className="aria-disabled:opacity-50"
            >
              Edit
            </Button>
          ) : (
            <Link
              href={`${RECORDS_HREF}/${summary.id}/edit`}
              className={buttonVariants()}
            >
              Edit
            </Link>
          )}
          <Button
            id="record-delete"
            variant="destructive"
            aria-disabled={offline ? "true" : undefined}
            aria-describedby={describedBy}
            onClick={offline ? blocked : openDelete}
            className="aria-disabled:opacity-50"
          >
            Delete
          </Button>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:flex md:gap-x-10">
        {[
          ["Owner", owner],
          ["Annual value", formatUsd(summary.annualValueUsd)],
          [
            "Renews",
            summary.renewsOn ? formatDate(summary.renewsOn) : "No renewal date",
          ],
          ["Last change", lastChangeWords(summary)],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      {offline ? (
        <Alert id={NOTICE_ID}>
          <AlertTitle>You are offline</AlertTitle>
          <AlertDescription>
            This record stays readable. Edit and Delete are off until you
            reconnect.
          </AlertDescription>
        </Alert>
      ) : null}

      <TermsSection
        version={current}
        previous={previous}
        state={state}
        compare={compare && canCompare}
        canCompare={canCompare}
        onView={setView}
        retry={() => router.replace(pathname)}
      />

      <HistoryList versions={versions} />
      {dialog}
    </Column>
  );
}
