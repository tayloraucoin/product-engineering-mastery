"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { useDemoStore } from "../../../_components/demo-store";
import type { RecordSummary } from "../../../_lib/record";

/**
 * Holds the content of the records table constant across the three directions:
 * the same heading, the same fixture rows in the same order, the same words.
 * Only the layout strategy inside `children` differs. Populated state only.
 */
export function DirectionFrame({
  direction,
  children,
}: {
  direction: string;
  children: (rows: readonly RecordSummary[]) => ReactNode;
}) {
  const { state } = useDemoStore();
  const rows = [...state.records].sort((a, b) =>
    a.vendor.localeCompare(b.vendor),
  );
  return (
    <main
      data-demo-state="default"
      data-diverge-direction={direction}
      className="mx-auto flex w-full max-w-(--container-6xl) flex-col gap-6 px-4 py-6 md:px-8"
    >
      <header className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">
          Direction: {direction} (layout strategy) ·{" "}
          <Link href="/demo/records" className="underline">
            Current records table
          </Link>
        </p>
        <h1 className="text-xl font-semibold">Records</h1>
        <p className="text-sm text-muted-foreground">
          Vendor contracts, synthetic demo data
        </p>
      </header>
      {children(rows)}
    </main>
  );
}
