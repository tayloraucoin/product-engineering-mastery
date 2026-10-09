/**
 * Experiments in /admin, bound to the registry and the database (LAB-10).
 * The rules are in admin-experiments.ts. A failed count read becomes `null`,
 * which the page shows as its partial state; it never fails the page.
 */

import "server-only";

import { listExperimentStats, type TeamViewer } from "@pem/db/sandbox";
import { createLogger } from "@pem/observability/logger";

import {
  experiments,
  findExperiment,
} from "../../../app/experimental/_experiments/registry.ts";
import { sandboxDb } from "../shared/access.ts";
import type { TeamMember } from "../shared/team-check.ts";
import type {
  ExperimentCounts,
  ExperimentSummary,
} from "./admin-experiments.ts";

const log = createLogger("sandbox");

const summaryOf = (config: ExperimentSummary): ExperimentSummary => ({
  slug: config.slug,
  title: config.title,
  designs: config.designs,
  closedOn: config.closedOn,
});

/** Every registered experiment, as the list reads it. */
export function registeredExperiments(): ExperimentSummary[] {
  return experiments.map(summaryOf);
}

/** One registered experiment, or null for any other slug. Reads no database. */
export function findExperimentSummary(slug: string): ExperimentSummary | null {
  const config = findExperiment(slug);
  return config ? summaryOf(config) : null;
}

/** The counts for these slugs as `member`, or null when they could not be read. */
export async function loadExperimentStats(
  member: TeamMember,
  slugs: readonly string[],
): Promise<ExperimentCounts[] | null> {
  const viewer: TeamViewer = { kind: "team", ...member };
  try {
    return await listExperimentStats(sandboxDb(), viewer, { slugs });
  } catch (error) {
    log.warn("sandbox.experiment_stats_failed", { error });
    return null;
  }
}
