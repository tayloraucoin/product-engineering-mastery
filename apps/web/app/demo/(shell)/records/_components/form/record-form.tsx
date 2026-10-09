"use client";

import { useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { buttonVariants } from "@pem/ui/button";

import { NEW_VALUES, valuesFromRecord } from "../../_lib/record-input";
import { useDemoStore } from "../../../../_components/demo-store";
import { FormBody } from "./form-body";
import { FormHeader, type Crumb } from "./form-header";
import { FormSkeleton } from "./form-skeleton";

const RECORDS: Crumb = { href: "/demo/records", label: "Records" };

const TERMS_HELPER = {
  new: "Optional. Saving with terms creates version 1.",
  edit: "Optional. Each save keeps a version you can compare.",
  empty:
    "Optional. This record has no terms yet; saving with terms creates version 1.",
} as const;

/**
 * Both form routes. The h1 names the record from the index (D-DEMO-20), so
 * `loading` is named too. A record made this visit lives only in the client
 * store, so an unknown id is decided here.
 */
export function RecordForm({
  mode,
  id,
  state,
}: {
  mode: "new" | "edit";
  id?: string;
  state: string | null;
}) {
  const router = useRouter();
  const titleId = useId();
  const { state: store } = useDemoStore();
  const summary =
    mode === "edit" ? store.records.find((r) => r.id === id) : undefined;

  if (mode === "edit" && !summary) {
    return (
      <section
        data-demo-state={state ?? undefined}
        className="mx-auto flex w-full max-w-(--container-xl) flex-col gap-4"
      >
        <h1 className="text-xl font-semibold">No record with this link</h1>
        <p className="text-sm text-muted-foreground">
          Nothing matches {id}. It may have been deleted, and demo data resets
          when you reload.
        </p>
        <div>
          <Link
            href="/demo/records"
            className={buttonVariants({ variant: "outline" })}
          >
            Back to records
          </Link>
        </div>
      </section>
    );
  }

  const detail: Crumb | null = summary
    ? { href: `/demo/records/${summary.id}`, label: summary.vendor }
    : null;
  const crumbs = detail ? [RECORDS, detail] : [RECORDS];
  const backHref = (detail ?? RECORDS).href;
  const body = summary ? store.bodies[summary.id] : undefined;
  const noTerms = state === "empty" || (summary && !body?.versions.length);
  const initial = summary
    ? {
        ...valuesFromRecord(summary, body),
        ...(state === "empty" ? { terms: "" } : null),
      }
    : NEW_VALUES;

  return (
    <div
      data-demo-state={state ?? undefined}
      className="mx-auto flex w-full max-w-(--container-xl) flex-col"
    >
      <FormHeader
        crumbs={crumbs}
        current={mode === "new" ? "New record" : "Edit"}
        title={mode === "new" ? "New record" : `Edit ${summary!.vendor}`}
        titleId={titleId}
      />
      {state === "loading" ? (
        <FormSkeleton onCancel={() => router.push(backHref)} />
      ) : (
        <FormBody
          key={summary?.id ?? "new"}
          mode={mode}
          recordId={summary?.id ?? null}
          initial={initial}
          state={state}
          termsHelper={
            mode === "new"
              ? TERMS_HELPER.new
              : noTerms
                ? TERMS_HELPER.empty
                : TERMS_HELPER.edit
          }
          backHref={backHref}
          titleId={titleId}
        />
      )}
    </div>
  );
}
