/**
 * Access codes, bound to the request's world (LAB-15): the registry, LAB-5's
 * code.ts, env's site URL and @pem/db/sandbox. The rules are in
 * admin-codes.ts. Nothing here logs a code, a hash, a label, an email or a
 * query's error text (a failed insert's error carries its parameters).
 */

import "server-only";

import {
  listCodes,
  makeCode,
  replaceCode,
  revokeCode,
  type TeamViewer,
} from "@pem/db/sandbox";
import { createLogger } from "@pem/observability/logger";

import { findExperiment } from "../../../app/experimental/_experiments/registry.ts";
import { env } from "../../../env";
import { sandboxDb } from "../shared/access.ts";
import { generateCode, hashCode } from "../shared/code.ts";
import type { TeamMember } from "../shared/team-check.ts";
import {
  codeRowsView,
  codesStateView,
  type CodesView,
} from "./admin-codes-view.ts";
import {
  makeCodeWith,
  replaceCodeWith,
  revokeCodeWith,
  type CodeActionResult,
  type CodesDeps,
  type CodesExperiment,
} from "./admin-codes.ts";

const log = createLogger("sandbox");

const viewerOf = (member: TeamMember): TeamViewer => ({
  kind: "team",
  ...member,
});

/** One registered experiment's mode and close date, or null. Reads no database. */
export function findCodesExperiment(slug: string): CodesExperiment | null {
  const config = findExperiment(slug);
  return config
    ? { slug: config.slug, mode: config.mode, closedOn: config.closedOn }
    : null;
}

function codesDeps(): CodesDeps {
  return {
    findExperiment: findCodesExperiment,
    generateCode,
    hashCode,
    siteUrl: env.NEXT_PUBLIC_SITE_URL,
    store: {
      makeCode: (member, input) =>
        makeCode(sandboxDb(), viewerOf(member), input),
      replaceCode: (member, input) =>
        replaceCode(sandboxDb(), viewerOf(member), input),
      revokeCode: (member, input) =>
        revokeCode(sandboxDb(), viewerOf(member), input),
    },
  };
}

export const makeCodeAs = (
  member: TeamMember,
  input: Parameters<typeof makeCodeWith>[2],
): Promise<CodeActionResult> => makeCodeWith(codesDeps(), member, input);

export const replaceCodeAs = (
  member: TeamMember,
  input: Parameters<typeof replaceCodeWith>[2],
): Promise<CodeActionResult> => replaceCodeWith(codesDeps(), member, input);

export const revokeCodeAs = (
  member: TeamMember,
  input: Parameters<typeof revokeCodeWith>[2],
): Promise<CodeActionResult> => revokeCodeWith(codesDeps(), member, input);

/**
 * The tab for `member`: a `?state=` fixture when one was asked for, else the
 * real list. A failed list is the error state; rows whose "Emails used"
 * could not be read are the partial state.
 */
export async function loadCodesView(
  member: TeamMember,
  experiment: CodesExperiment,
  state: string | null,
): Promise<CodesView> {
  const fixture = codesStateView(
    state,
    experiment.slug,
    env.NEXT_PUBLIC_SITE_URL,
  );
  if (fixture) return fixture;
  const view: CodesView = {
    slug: experiment.slug,
    collaborate: experiment.mode === "collaborate",
    closed: experiment.closedOn !== null,
    rows: null,
    loading: false,
    error: false,
    offline: false,
    fixture: null,
  };
  try {
    const rows = await listCodes(sandboxDb(), viewerOf(member), {
      slug: experiment.slug,
    });
    if (rows.some((row) => row.emailsUsed === null))
      log.warn("sandbox.codes_emails_used_failed");
    return { ...view, rows: codeRowsView(rows) };
  } catch (error) {
    log.warn("sandbox.codes_list_failed", {
      error: error instanceof Error ? error.name : "unknown",
    });
    return { ...view, error: true };
  }
}
