import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { CodesExperiment } from "../../../../../lib/sandbox/admin-codes";
import {
  findCodesExperiment,
  loadCodesView,
} from "../../../../../lib/sandbox/admin-codes-data";
import { requireTeamPage } from "../../../../../lib/sandbox/admin-guard";
import { readSandboxState } from "../../../../../lib/sandbox/state";
import type { TeamMember } from "../../../../../lib/sandbox/team-check";
import { CodesSkeleton, CodesTable } from "./_components/codes-table";

export const metadata: Metadata = { title: "Access codes" };

/**
 * An experiment's Access codes tab (access-codes.md): developers and admins
 * (S3). The page lists codes and never holds one: a code reaches the browser
 * only in the make or replace action's answer.
 */
export default async function AccessCodesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const member = await requireTeamPage(`/admin/experiments/${slug}/codes`);
  const query = await searchParams;
  const experiment = findCodesExperiment(slug);
  if (!experiment) notFound();
  const state = readSandboxState(query.state, "team");
  return (
    // The skeleton shows while the list loads, as codes-loading shows it.
    <Suspense fallback={<CodesSkeleton />}>
      <CodesList member={member} experiment={experiment} state={state} />
    </Suspense>
  );
}

async function CodesList({
  member,
  experiment,
  state,
}: {
  member: TeamMember;
  experiment: CodesExperiment;
  state: string | null;
}) {
  return <CodesTable view={await loadCodesView(member, experiment, state)} />;
}
