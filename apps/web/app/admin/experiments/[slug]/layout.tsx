import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { resolveExperimentHeader } from "../../../../lib/sandbox/admin/admin-experiments";
import {
  findExperimentSummary,
  loadExperimentStats,
} from "../../../../lib/sandbox/admin/admin-experiments-data";
import { requireTeamPage } from "../../../../lib/sandbox/admin/admin-guard";
import { ExperimentHeader } from "./_components/experiment-header";

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
  return (
    <>
      <ExperimentHeader header={result.header} role={member.role} />
      {children}
    </>
  );
}
