import type { DemoPrefs } from "./record.ts";

export type DemoEntryPath = "/demo/welcome" | "/demo/records";

/**
 * Where `/demo` sends a visitor (D-DEMO-3): onboarding until it is finished
 * or skipped, then the records. Pass `parseDemoPrefs(cookie)`, which reads a
 * missing or invalid cookie as not onboarded.
 */
export function demoEntryPath(prefs: DemoPrefs): DemoEntryPath {
  return prefs.onboarded ? "/demo/records" : "/demo/welcome";
}
