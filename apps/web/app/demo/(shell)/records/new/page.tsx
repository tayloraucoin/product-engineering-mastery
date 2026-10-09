import { readDemoState } from "@/lib/demo/states";

import { RecordForm } from "../_components/form/record-form";

export default async function NewRecordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  return (
    <RecordForm mode="new" state={readDemoState(query.state, "record-form")} />
  );
}
