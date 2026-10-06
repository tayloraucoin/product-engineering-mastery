import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { StaleMarkerLine } from "../_components/experiments-table";
import { resolveExperimentHeader } from "../../../../lib/sandbox/admin-experiments";
import {
  findExperimentSummary,
  loadExperimentStats,
} from "../../../../lib/sandbox/admin-experiments-data";
import { requireTeamPage } from "../../../../lib/sandbox/admin-guard";
import { ExperimentTabs } from "./_components/experiment-tabs";

/**
 * One experiment: its title, status word, stale-data line and tabs. The team
 * guard runs first, with this experiment's path, so a signed-out visitor is
 * sent to sign-in whether or not the slug exists; then an unregistered slug
 * is the app's 404 before any database read.
 */
export default async function ExperimentLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = await requireTeamPage(`/admin/experiments/${slug}`);
  const result = await resolveExperimentHeader(
    {
      findExperiment: findExperimentSummary,
      loadStats: async (s) =>
        (await loadExperimentStats(member, [s]))?.[0] ?? null,
    },
    slug,
    member.role,
    new Date(),
  );
  if (result.kind === "not-found") notFound();
  const { header } = result;
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {header.title}
        </h1>
        <p className="text-muted-foreground">{header.status}</p>
        {header.marker ? <StaleMarkerLine marker={header.marker} /> : null}
      </div>
      <ExperimentTabs tabs={header.tabs} />
      {children}
    </>
  );
}
