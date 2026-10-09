import { readDemoState } from "@/lib/demo/states";

import { RecordForm } from "../../_components/form/record-form";

/** The server read: the id and `?state=`. The form finds the record in the client store. */
export default async function EditRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return (
    <RecordForm
      mode="edit"
      id={id}
      state={readDemoState(query.state, "record-form")}
    />
  );
}
