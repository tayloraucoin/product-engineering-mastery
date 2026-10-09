/**
 * Deleting and erasing, bound to the request's world (LAB-16): the registry,
 * the Auth admin API through lib/supabase/admin.ts (the one service-role
 * seam) and @pem/db/sandbox. The rules are in admin-data.ts. Nothing here
 * logs an email, a label or a query's error text.
 */

import "server-only";

import {
  countExperimentData,
  deleteExperimentData,
  eraseEmail,
  findErasure,
  findReviewerEmails,
  listActions,
  type TeamViewer,
} from "@pem/db/sandbox";
import { createLogger } from "@pem/observability/logger";

import { findExperiment } from "../../../app/experimental/_experiments/registry.ts";
import { createSupabaseAdminClient } from "../../supabase/admin";
import { sandboxDb } from "../shared/access.ts";
import type { TeamMember } from "../shared/team-check.ts";
import type {
  DataPageView,
  DataTabView,
  ReviewerView,
} from "./admin-data-view.ts";
import {
  accountIdsFor,
  deleteExperimentDataWith,
  eraseReviewerWith,
  findReviewerWith,
  loadDataTabWith,
  loadRecordWith,
  loadReviewerWith,
  type DataDeps,
  type DataExperiment,
  type DeleteDataResult,
  type EraseReviewerResult,
  type FindReviewerResult,
} from "./admin-data.ts";
import { listAuthPeople } from "./people-data.ts";

const log = createLogger("sandbox");

const viewerOf = (member: TeamMember): TeamViewer => ({
  kind: "team",
  ...member,
});

/** One registered experiment's title and close date, or null. Reads no database. */
export function findDataExperiment(slug: string): DataExperiment | null {
  const config = findExperiment(slug);
  return config
    ? { slug: config.slug, title: config.title, closedOn: config.closedOn }
    : null;
}

function dataDeps(): DataDeps {
  return {
    findExperiment: findDataExperiment,
    // Auth has no lookup by email: every account, page by page (people-data.ts).
    findAccountIds: async (email) =>
      accountIdsFor(await listAuthPeople(), email),
    async findAccountEmail(userId) {
      const { data, error } =
        await createSupabaseAdminClient().auth.admin.getUserById(userId);
      if (error) {
        if (error.status === 404) return null;
        throw new Error("Data: the Auth API did not read an account.");
      }
      return data.user.email ? data.user.email.trim().toLowerCase() : null;
    },
    store: {
      countExperimentData: (member, input) =>
        countExperimentData(sandboxDb(), viewerOf(member), input),
      deleteExperimentData: (member, input) =>
        deleteExperimentData(sandboxDb(), viewerOf(member), input),
      findErasure: (member, input) =>
        findErasure(sandboxDb(), viewerOf(member), input),
      findReviewerEmails: (member, input) =>
        findReviewerEmails(sandboxDb(), viewerOf(member), input),
      eraseEmail: (member, input) =>
        eraseEmail(sandboxDb(), viewerOf(member), input),
      listActions: (member, input) =>
        listActions(sandboxDb(), viewerOf(member), input),
    },
  };
}

export async function deleteExperimentDataAs(
  member: TeamMember,
  input: { slug: unknown; confirm: unknown },
): Promise<DeleteDataResult> {
  const result = await deleteExperimentDataWith(dataDeps(), member, input);
  if (result.outcome === "failed") log.warn("sandbox.data_delete_failed");
  return result;
}

export async function findReviewerAs(
  member: TeamMember,
  input: { email: unknown },
): Promise<FindReviewerResult> {
  const result = await findReviewerWith(dataDeps(), member, input);
  if (result.outcome === "failed") log.warn("sandbox.data_find_failed");
  return result;
}

export async function eraseReviewerAs(
  member: TeamMember,
  input: { email: unknown; clearLabels: unknown },
): Promise<EraseReviewerResult> {
  const result = await eraseReviewerWith(dataDeps(), member, input);
  if (result.outcome === "failed") log.warn("sandbox.data_erase_failed");
  return result;
}

export async function loadDataTab(
  member: TeamMember,
  experiment: DataExperiment,
): Promise<DataTabView> {
  const view = await loadDataTabWith(dataDeps(), member, experiment);
  if (view.error) log.warn("sandbox.data_counts_failed");
  else if (view.counts && Object.values(view.counts).includes(null))
    log.warn("sandbox.data_counts_partial");
  return view;
}

/**
 * The Data page for `member`: the record's page, and the codes' emails when
 * opened from a reviewer. A failed read is the error state.
 */
export async function loadDataPage(
  member: TeamMember,
  input: { reviewerId: string | null; page: number },
): Promise<DataPageView> {
  const view: DataPageView = {
    reviewer: undefined,
    found: null,
    noMatch: false,
    record: null,
    loading: false,
    error: false,
    offline: false,
    toast: null,
    fixture: false,
  };
  const deps = dataDeps();
  try {
    const reviewer: ReviewerView | null | undefined =
      input.reviewerId === null
        ? undefined
        : await loadReviewerWith(deps, member, input.reviewerId);
    const record = await loadRecordWith(deps, member, input.page);
    return { ...view, reviewer, record };
  } catch (error) {
    log.warn("sandbox.data_page_failed", {
      error: error instanceof Error ? error.name : "unknown",
    });
    return { ...view, error: true };
  }
}
