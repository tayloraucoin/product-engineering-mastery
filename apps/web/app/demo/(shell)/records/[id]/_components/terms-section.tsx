"use client";

import { TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@pem/ui/alert";
import { Button } from "@pem/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@pem/ui/empty";
import { Separator } from "@pem/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@pem/ui/toggle-group";

import { Diff } from "../../../../_components/diff";
import { diffClauses } from "../../../../_lib/diff";
import { formatDate } from "../../../../_lib/format";
import type { Version } from "../../../../_lib/record";
import type { DetailState } from "./record-detail";

const SUBTITLE_ID = "terms-subtitle";

function subtitle(
  state: DetailState,
  version: Version,
  previous: Version | undefined,
  compare: boolean,
): string {
  if (state === "partial")
    return `Version ${version.n}. Compare needs the terms.`;
  if (!previous)
    return `Version ${version.n}, the only version. Compare needs two.`;
  if (compare)
    return `Version ${version.n} (current) compared with version ${previous.n}`;
  return `Version ${version.n}, current since ${formatDate(version.on)}`;
}

export function TermsSection({
  version,
  previous,
  state,
  compare,
  canCompare,
  onView,
  retry,
}: {
  version: Version | undefined;
  previous: Version | undefined;
  state: DetailState;
  compare: boolean;
  canCompare: boolean;
  onView: (view: "current" | "compare") => void;
  retry: () => void;
}) {
  if (!version)
    return (
      <section aria-labelledby="terms-heading" className="flex flex-col gap-3">
        <h2 id="terms-heading" className="text-base font-semibold">
          Terms
        </h2>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No terms yet</EmptyTitle>
            <EmptyDescription>
              Add the contract terms with Edit. Each save keeps a version you
              can compare.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </section>
    );

  const diff =
    compare && previous ? diffClauses(previous.clauses, version.clauses) : null;

  return (
    <section aria-labelledby="terms-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="terms-heading" className="text-base font-semibold">
            Terms
          </h2>
          <p id={SUBTITLE_ID} className="text-sm text-muted-foreground">
            {subtitle(state, version, previous, compare)}
          </p>
        </div>
        <ToggleGroup
          aria-label="Terms view"
          variant="outline"
          spacing={0}
          value={[compare ? "compare" : "current"]}
          onValueChange={(next) => {
            const view = next[0];
            if (view === "current") onView("current");
            if (view === "compare" && canCompare) onView("compare");
          }}
        >
          <ToggleGroupItem
            value="current"
            className="aria-pressed:bg-muted aria-pressed:text-foreground aria-pressed:hover:bg-muted aria-pressed:hover:text-foreground"
          >
            Current
          </ToggleGroupItem>
          <ToggleGroupItem
            value="compare"
            aria-disabled={canCompare ? undefined : "true"}
            aria-describedby={canCompare ? undefined : SUBTITLE_ID}
            className="aria-pressed:bg-muted aria-pressed:text-foreground aria-pressed:hover:bg-muted aria-pressed:hover:text-foreground aria-disabled:opacity-50"
          >
            Compare
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <Separator />
      {state === "partial" ? (
        <Alert>
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>The terms document did not load</AlertTitle>
          <AlertDescription>
            <p>
              The record&apos;s fields are complete and you can still edit them.
            </p>
            <div className="mt-3">
              {/* Edit is this view's one primary; foreground text keeps Retry from reading as disabled. */}
              <Button
                variant="outline"
                size="sm"
                onClick={retry}
                className="text-foreground"
              >
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : diff ? (
        <>
          <Diff rows={diff.rows} label="Changes in the terms" />
          <Separator />
          <p className="text-sm text-muted-foreground">{diff.summary}</p>
        </>
      ) : (
        <>
          <ol className="flex list-none flex-col gap-3">
            {version.clauses.map((clause, i) => (
              <li key={i}>{clause}</li>
            ))}
          </ol>
          <Separator />
        </>
      )}
    </section>
  );
}
