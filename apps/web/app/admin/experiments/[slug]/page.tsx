import { requireTeamPage } from "../../../../lib/sandbox/admin/admin-guard";

/** Results (R6): a placeholder until LAB-23 builds the tab. */
export default async function ExperimentResultsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireTeamPage(`/admin/experiments/${slug}`);
  return (
    <p className="text-muted-foreground">
      This experiment&apos;s results arrive with LAB-23.
    </p>
  );
}
