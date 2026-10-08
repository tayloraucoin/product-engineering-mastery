"use server";

/**
 * Access codes' three actions (LAB-15), each bound to its slug by the page.
 * The guard comes first and its refusal goes back unchanged. Make and
 * replace answer with the code, once: neither revalidates nor redirects, so
 * no render runs with the code in scope; the client refreshes after Done.
 * Revoke answers with no code and revalidates the tab.
 */
import { revalidatePath } from "next/cache";

import type { CodeActionResult } from "../../../../../lib/sandbox/admin/admin-codes";
import {
  makeCodeAs,
  replaceCodeAs,
  revokeCodeAs,
} from "../../../../../lib/sandbox/admin/admin-codes-data";
import {
  isTeamActionRefusal,
  requireTeamAction,
} from "../../../../../lib/sandbox/admin/admin-guard";

export async function makeCode(
  slug: string,
  _previous: CodeActionResult | null,
  form: FormData,
): Promise<CodeActionResult> {
  const member = await requireTeamAction();
  if (isTeamActionRefusal(member)) return member;
  return makeCodeAs(member, {
    slug,
    label: form.get("label"),
    displayName: form.get("displayName"),
  });
}

export async function replaceCode(
  slug: string,
  _previous: CodeActionResult | null,
  form: FormData,
): Promise<CodeActionResult> {
  const member = await requireTeamAction();
  if (isTeamActionRefusal(member)) return member;
  return replaceCodeAs(member, { slug, reviewerId: form.get("reviewerId") });
}

export async function revokeCode(
  slug: string,
  _previous: CodeActionResult | null,
  form: FormData,
): Promise<CodeActionResult> {
  const member = await requireTeamAction();
  if (isTeamActionRefusal(member)) return member;
  const result = await revokeCodeAs(member, {
    slug,
    reviewerId: form.get("reviewerId"),
  });
  if (result.outcome === "revoked")
    revalidatePath(`/admin/experiments/${slug}/codes`);
  return result;
}
