"use server";

/**
 * People's one action (LAB-9). The guard comes first and its refusal goes
 * back unchanged; `changeRoleAs` refuses a non-admin again, and runs the
 * last-admin guard inside the role-change lock.
 */
import { revalidatePath } from "next/cache";

import {
  isTeamActionRefusal,
  requireTeamAction,
} from "../../../lib/sandbox/admin/admin-guard";
import type { ChangeRoleResult } from "../../../lib/sandbox/admin/people";
import { changeRoleAs } from "../../../lib/sandbox/admin/people-data";

export async function changeRole(
  _previous: ChangeRoleResult | null,
  form: FormData,
): Promise<ChangeRoleResult> {
  const member = await requireTeamAction({ adminOnly: true });
  if (isTeamActionRefusal(member)) return member;
  const result = await changeRoleAs(member, {
    userId: form.get("userId"),
    role: form.get("role"),
  });
  if (result.outcome === "changed") revalidatePath("/admin/people");
  return result;
}
