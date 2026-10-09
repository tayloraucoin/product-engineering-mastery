import { redirect } from "next/navigation";

import { requireTeamPage } from "../../lib/sandbox/admin/admin-guard";

/** `/admin` opens on Experiments. */
export default async function AdminPage() {
  await requireTeamPage("/admin");
  redirect("/admin/experiments");
}
