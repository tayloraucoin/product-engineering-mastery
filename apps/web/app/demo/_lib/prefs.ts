import type { DemoPrefs } from "./record.ts";

export const DEMO_PREFS_COOKIE = "pem_demo_prefs";

const SORTS: readonly DemoPrefs["defaultSort"][] = [
  "vendor-asc",
  "renews-asc",
  "value-desc",
];

export const DEFAULT_DEMO_PREFS: Readonly<DemoPrefs> = Object.freeze({
  v: 1,
  onboarded: false,
  compactRows: false,
  defaultSort: "vendor-asc",
});

/** URL-encoded JSON, the cookie's value. */
export function serializeDemoPrefs(prefs: DemoPrefs): string {
  return encodeURIComponent(JSON.stringify(prefs));
}

/** Tolerant: anything that is not a valid v1 prefs object reads as the defaults. */
export function parseDemoPrefs(raw: string | null | undefined): DemoPrefs {
  if (typeof raw !== "string" || raw === "") return { ...DEFAULT_DEMO_PREFS };
  try {
    const value: unknown = JSON.parse(decodeURIComponent(raw));
    if (
      value !== null &&
      typeof value === "object" &&
      (value as { v?: unknown }).v === 1
    ) {
      const { onboarded, compactRows, defaultSort } = value as Record<
        string,
        unknown
      >;
      if (
        typeof onboarded === "boolean" &&
        typeof compactRows === "boolean" &&
        SORTS.includes(defaultSort as DemoPrefs["defaultSort"])
      ) {
        return {
          v: 1,
          onboarded,
          compactRows,
          defaultSort: defaultSort as DemoPrefs["defaultSort"],
        };
      }
    }
  } catch {
    // fall through to the defaults
  }
  return { ...DEFAULT_DEMO_PREFS };
}

/** Client only: writes the cookie the `/demo` redirect reads. */
export function writeDemoPrefs(prefs: DemoPrefs): void {
  document.cookie = `${DEMO_PREFS_COOKIE}=${serializeDemoPrefs(prefs)}; Path=/demo; SameSite=Lax; Max-Age=31536000`;
}
