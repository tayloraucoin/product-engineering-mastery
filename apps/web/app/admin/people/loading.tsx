import { PeopleSkeleton } from "./_components/people-table";

/** A static skeleton of the table while the list loads (`people-loading`). */
export default function PeopleLoading() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">People</h1>
      <PeopleSkeleton />
    </>
  );
}
