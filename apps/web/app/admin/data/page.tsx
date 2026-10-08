import type { Metadata } from "next";

import { parsePage } from "../../../lib/sandbox/admin/admin-data";
import { loadDataPage } from "../../../lib/sandbox/admin/admin-data-data";
import {
  DATA_WORDS,
  dataPageStateView,
} from "../../../lib/sandbox/admin/admin-data-view";
import { requireTeamPage } from "../../../lib/sandbox/admin/admin-guard";
import { readSandboxState } from "../../../lib/sandbox/shared/state";
import { EraseSection } from "./_components/erase-section";
import { DataPageSkeleton, RecordTable } from "./_components/record-table";

export const metadata: Metadata = { title: "Data" };

/**
 * The nav-level Data page (data.md): erase a reviewer, and the record of
 * actions. Developers and admins. Opened from a reviewer it takes the
 * reviewer's id (`?reviewer=`), never an email (R6, D-LAB-28), and erases
 * nothing on load.
 */
export default async function DataPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const member = await requireTeamPage("/admin/data");
  const query = await searchParams;
  const state = readSandboxState(query.state, "team");
  const view =
    dataPageStateView(state) ??
    (await loadDataPage(member, {
      reviewerId: typeof query.reviewer === "string" ? query.reviewer : null,
      page: parsePage(query.page),
    }));
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">
        {DATA_WORDS.heading}
      </h1>
      {view.loading ? (
        <DataPageSkeleton />
      ) : view.error ? (
        <p className="text-muted-foreground">{DATA_WORDS.error}</p>
      ) : (
        <div className="flex flex-col gap-10">
          <EraseSection view={view} />
          {view.record ? <RecordTable record={view.record} /> : null}
        </div>
      )}
    </>
  );
}
