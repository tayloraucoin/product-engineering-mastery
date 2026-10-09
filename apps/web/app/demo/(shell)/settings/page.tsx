import { cookies } from "next/headers";

import { DEMO_PREFS_COOKIE, parseDemoPrefs } from "../../_lib/prefs";
import { readDemoState } from "../../../../lib/demo/states";
import { SETTINGS_COPY } from "./_components/copy";
import { SettingsView } from "./_components/settings-view";

/** Instant-apply preferences (settings.md); the key and the prefs cookie are read here. */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const state = readDemoState((await searchParams).state, "settings");
  const jar = await cookies();
  const prefs = parseDemoPrefs(jar.get(DEMO_PREFS_COOKIE)?.value);
  return (
    <section
      data-demo-state={state ?? undefined}
      className="mx-auto flex w-full max-w-(--container-xl) flex-col gap-8"
    >
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          {state === "empty"
            ? SETTINGS_COPY.subtitleEmpty
            : SETTINGS_COPY.subtitle}
        </p>
      </header>
      <SettingsView state={state} prefs={prefs} />
    </section>
  );
}
