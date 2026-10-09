/**
 * Pure helpers for the capture harness (DEMO-6): the file naming, the key
 * walk and the render check. No browser here, so `yarn workspace web test`
 * covers them.
 */
import type { DemoSurface } from "../../lib/demo/surfaces/types.ts";

export const WIDTHS = [390, 834, 1440] as const;
export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

/** The key `next-themes` reads its stored choice from (its default). */
export const THEME_STORAGE_KEY = "theme";

/** `<surface>/<key>-<width>[-dark].png`, relative to the captures folder. */
export function captureFile(
  surface: string,
  key: string,
  width: number,
  theme: Theme,
): string {
  return `${surface}/${key}-${width}${theme === "dark" ? "-dark" : ""}.png`;
}

export interface CaptureTarget {
  surface: string;
  key: string;
  /** The path to open, `?state=<key>` included. */
  path: string;
}

/**
 * Every key of every surface, in registry order. An unknown `only` surface
 * throws: a typo must not turn into a run that captured nothing.
 */
export function walkKeys(
  surfaces: Readonly<Record<string, DemoSurface>>,
  only?: string,
): CaptureTarget[] {
  const entries = Object.values(surfaces).filter(
    (s) => only === undefined || s.id === only,
  );
  if (entries.length === 0)
    throw new Error(
      only === undefined
        ? "capture: the demo registry holds no surfaces"
        : `capture: no registered surface "${only}"`,
    );
  return entries.flatMap((s) =>
    s.keys.map((key) => ({
      surface: s.id,
      key,
      path: `${s.samplePath}${s.samplePath.includes("?") ? "&" : "?"}state=${encodeURIComponent(key)}`,
    })),
  );
}

/** Null when the page rendered the key; otherwise the reason, naming surface and key. */
export function renderProblem(
  target: Pick<CaptureTarget, "surface" | "key">,
  seen: { status: number | null; stateAttr: string | null },
): string | null {
  const who = `${target.surface} ?state=${target.key}`;
  if (seen.status !== 200)
    return `${who}: page answered ${seen.status ?? "nothing"}, not 200`;
  if (seen.stateAttr !== target.key)
    return `${who}: root data-demo-state is ${seen.stateAttr === null ? "absent" : `"${seen.stateAttr}"`}, not "${target.key}"`;
  return null;
}
