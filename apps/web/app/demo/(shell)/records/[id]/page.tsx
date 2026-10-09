import { readDemoState } from "@/lib/demo/states";

import { RecordDetail, type DetailState } from "./_components/record-detail";

/**
 * The server read: the id, `?view=` and `?state=`. A session-made record
 * exists only in the client store, so the view decides not-found itself.
 */
export default async function RecordDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const state = readDemoState(query.state, "record-detail") as DetailState;
  const compare = query.view === "compare" || state === "diff";
  return <RecordDetail id={id} state={state} compare={compare} />;
}
