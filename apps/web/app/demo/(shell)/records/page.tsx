import { cookies } from "next/headers";

import { readDemoState } from "@/lib/demo/states";

import { DEMO_PREFS_COOKIE, parseDemoPrefs } from "../../_lib/prefs";
import {
  RecordsView,
  type RecordsState,
} from "./_components/table/records-view";

/**
 * The server read: `?state=` and the prefs cookie, so an absent `?sort=`
 * opens on the person's default with no flash. Filters and sort themselves
 * are read from the URL by the view.
 */
export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [query, jar] = await Promise.all([searchParams, cookies()]);
  const prefs = parseDemoPrefs(jar.get(DEMO_PREFS_COOKIE)?.value);
  return (
    <RecordsView
      state={readDemoState(query.state, "records-table") as RecordsState}
      defaultSort={prefs.defaultSort}
      compact={prefs.compactRows}
    />
  );
}
