import type { Metadata } from "next";

import { requireTeamPage } from "../../../lib/sandbox/admin-guard";

export const metadata: Metadata = { title: "Experiments" };

/** A placeholder until LAB-10 builds the list. */
export default async function ExperimentsPage() {
  await requireTeamPage("/admin/experiments");
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Experiments</h1>
      <p className="text-muted-foreground">
        The list of experiments arrives with LAB-10.
      </p>
    </>
  );
}
