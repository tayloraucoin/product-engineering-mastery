import { DataPageSkeleton } from "./_components/record-table";

/** A static skeleton of both sections while the page loads (`data-page-loading`). */
export default function DataLoading() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Data</h1>
      <DataPageSkeleton />
    </>
  );
}
