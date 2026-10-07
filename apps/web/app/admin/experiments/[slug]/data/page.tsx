import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { DataExperiment } from "../../../../../lib/sandbox/admin-data";
import {
  findDataExperiment,
  loadDataTab,
} from "../../../../../lib/sandbox/admin-data-data";
import { dataTabStateView } from "../../../../../lib/sandbox/admin-data-view";
import { requireTeamPage } from "../../../../../lib/sandbox/admin-guard";
import { readSandboxState } from "../../../../../lib/sandbox/state";
import type { TeamMember } from "../../../../../lib/sandbox/team-check";
import { DataTab, DataTabSkeleton } from "./_components/data-tab";

export const metadata: Metadata = { title: "Data" };

/**
 * An experiment's Data tab (data.md): developers and admins see what it
 * holds; only an admin gets the delete (D-LAB-26), open or closed.
 */
export default async function DataTabPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const member = await requireTeamPage(`/admin/experiments/${slug}/data`);
  const query = await searchParams;
  const experiment = findDataExperiment(slug);
  if (!experiment) notFound();
  const state = readSandboxState(query.state, "team");
  const fixture = dataTabStateView(state, {
    slug: experiment.slug,
    title: experiment.title,
    open: experiment.closedOn === null,
  });
  if (fixture) return <DataTab view={fixture} />;
  return (
    // The skeleton shows while the counts load, as data-tab-loading shows it.
    <Suspense fallback={<DataTabSkeleton />}>
      <DataCounts member={member} experiment={experiment} />
    </Suspense>
  );
}

async function DataCounts({
  member,
  experiment,
}: {
  member: TeamMember;
  experiment: DataExperiment;
}) {
  return <DataTab view={await loadDataTab(member, experiment)} />;
}
