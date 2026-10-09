"use server";

/**
 * The Data tab's delete (LAB-16), bound to its slug by the page. An admin's
 * only: the guard refuses a developer before anything runs, the rules refuse
 * one again, and the database function refuses one inside its own check
 * (D-LAB-26). The typed confirm travels in the POST body and is checked on
 * the server against the slug, exactly.
 */
import { revalidatePath } from "next/cache";

import type { DeleteDataResult } from "../../../../../lib/sandbox/admin/admin-data";
import { deleteExperimentDataAs } from "../../../../../lib/sandbox/admin/admin-data-data";
import {
  isTeamActionRefusal,
  requireTeamAction,
} from "../../../../../lib/sandbox/admin/admin-guard";

export async function deleteExperimentData(
  slug: string,
  _previous: DeleteDataResult | null,
  form: FormData,
): Promise<DeleteDataResult> {
  const member = await requireTeamAction({ adminOnly: true });
  if (isTeamActionRefusal(member)) return member;
  const result = await deleteExperimentDataAs(member, {
    slug,
    confirm: form.get("confirm"),
  });
  // The header's stale-data line and the tab's counts read again.
  if (result.outcome === "deleted")
    revalidatePath(`/admin/experiments/${slug}`, "layout");
  return result;
}
