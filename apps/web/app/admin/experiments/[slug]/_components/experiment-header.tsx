"use client";

/**
 * One experiment's heading, status word, stale-data line and tabs. A layout
 * gets no search params, so this leaf reads the header's `?state=` keys
 * (team-only, like every /admin key) and shows the synthetic header for them.
 */
import { useSearchParams } from "next/navigation";

import { StaleMarkerLine } from "../../_components/experiments-table";
import {
  experimentHeaderStateView,
  EXPERIMENTS_WORDS,
  type ExperimentHeader as Header,
} from "../../../../../lib/sandbox/admin/admin-experiments";
import { readSandboxState } from "../../../../../lib/sandbox/shared/state";
import type { TeamRole } from "../../../../../lib/sandbox/shared/team-check";
import { ExperimentTabs } from "./experiment-tabs";

export function ExperimentHeader({
  header,
  role,
}: {
  header: Header;
  role: TeamRole;
}) {
  const state = readSandboxState(
    useSearchParams().get("state") ?? undefined,
    "team",
  );
  const shown = experimentHeaderStateView(state, role, new Date()) ?? header;
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{shown.title}</h1>
        <p className="text-muted-foreground">{shown.status}</p>
        {shown.marker ? <StaleMarkerLine marker={shown.marker} /> : null}
        {shown.partial ? (
          <p className="text-muted-foreground">{EXPERIMENTS_WORDS.partial}</p>
        ) : null}
      </div>
      <ExperimentTabs tabs={shown.tabs} />
    </>
  );
}
