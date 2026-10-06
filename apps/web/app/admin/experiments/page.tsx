import type { Metadata } from "next";

import {
  experimentRows,
  EXPERIMENTS_WORDS,
  experimentsStateView,
  type ExperimentsView,
} from "../../../lib/sandbox/admin-experiments";
import {
  loadExperimentStats,
  registeredExperiments,
} from "../../../lib/sandbox/admin-experiments-data";
import { requireTeamPage } from "../../../lib/sandbox/admin-guard";
import { readSandboxState } from "../../../lib/sandbox/state";
import type { TeamMember } from "../../../lib/sandbox/team-check";
import { ExperimentsTable } from "./_components/experiments-table";

export const metadata: Metadata = { title: "Experiments" };

/** Every experiment, its status and counts, and which closed ones still hold reviewers' data. */
export default async function ExperimentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const member = await requireTeamPage("/admin/experiments");
  const params = await searchParams;
  const now = new Date();
  const state = readSandboxState(params.state, "team");
  const view =
    experimentsStateView(state, member.role, now) ??
    (await loadExperiments(member, now));
  const headerLine = view.list?.headerLine ?? null;
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {EXPERIMENTS_WORDS.heading}
        </h1>
        {headerLine ? <p>{headerLine}</p> : null}
      </div>
      <ExperimentsTable view={view} />
    </>
  );
}

async function loadExperiments(
  member: TeamMember,
  now: Date,
): Promise<ExperimentsView> {
  const view = { list: null, loading: false, error: false, offline: false };
  try {
    const configs = registeredExperiments();
    const stats = await loadExperimentStats(
      member,
      configs.map((c) => c.slug),
    );
    return { ...view, list: experimentRows(configs, stats, member.role, now) };
  } catch {
    return { ...view, error: true };
  }
}
