"use server";

/**
 * The Data page's two actions (LAB-16): find what an email holds, and erase
 * it everywhere. Developers and admins (S3, D-LAB-26). The email arrives in
 * the POST body and goes back only in the action's answer, never a URL or a
 * log (D-LAB-28). Neither revalidates: the client refreshes after an erase.
 */
import type {
  EraseReviewerResult,
  FindReviewerResult,
} from "../../../lib/sandbox/admin-data";
import {
  eraseReviewerAs,
  findReviewerAs,
} from "../../../lib/sandbox/admin-data-data";
import {
  isTeamActionRefusal,
  requireTeamAction,
} from "../../../lib/sandbox/admin-guard";

export async function findReviewer(
  _previous: FindReviewerResult | null,
  form: FormData,
): Promise<FindReviewerResult> {
  const member = await requireTeamAction();
  if (isTeamActionRefusal(member)) return member;
  return findReviewerAs(member, { email: form.get("email") });
}

export async function eraseReviewer(
  _previous: EraseReviewerResult | null,
  form: FormData,
): Promise<EraseReviewerResult> {
  const member = await requireTeamAction();
  if (isTeamActionRefusal(member)) return member;
  return eraseReviewerAs(member, {
    email: form.get("email"),
    clearLabels: form.getAll("clearLabel"),
  });
}
