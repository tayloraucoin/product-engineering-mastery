import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { demoEntryPath } from "./_lib/entry";
import { DEMO_PREFS_COOKIE, parseDemoPrefs } from "./_lib/prefs";

/** Renders nothing: the visitor is sent on before any HTML (D-DEMO-3). */
export default async function DemoEntryPage() {
  const jar = await cookies();
  redirect(demoEntryPath(parseDemoPrefs(jar.get(DEMO_PREFS_COOKIE)?.value)));
}
