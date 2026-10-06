import type { Metadata } from "next";

import { requireTeamPage } from "../../../lib/sandbox/admin-guard";
import {
  PEOPLE_WORDS,
  peopleRows,
  peopleStateView,
  type PeopleView,
} from "../../../lib/sandbox/people";
import { listAuthPeople } from "../../../lib/sandbox/people-data";
import { readSandboxState } from "../../../lib/sandbox/state";
import { PeopleTable } from "./_components/people-table";

export const metadata: Metadata = { title: "People" };

/** Admins only (S2): a developer gets the app's 404. */
export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const member = await requireTeamPage("/admin/people", { adminOnly: true });
  const params = await searchParams;
  const state = readSandboxState(params.state, "team");
  const view =
    peopleStateView(state, { id: member.userId, email: member.email }) ??
    (await loadPeople(member.userId));
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {PEOPLE_WORDS.heading}
        </h1>
        <p className="text-muted-foreground">{PEOPLE_WORDS.timing}</p>
      </div>
      <PeopleTable view={view} />
    </>
  );
}

async function loadPeople(me: string): Promise<PeopleView> {
  const view: PeopleView = {
    rows: null,
    loading: false,
    error: false,
    offline: false,
    query: "",
    changeFailed: false,
  };
  try {
    return { ...view, rows: peopleRows(await listAuthPeople(), me) };
  } catch {
    return { ...view, error: true };
  }
}
