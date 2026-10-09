/** The demo's `?state=` registry types. Each surface ticket edits only its own entry file. */

export const UNIVERSAL_STATE_KEYS = [
  "empty",
  "loading",
  "error",
  "partial",
  "offline",
] as const;

export type UniversalStateKey = (typeof UNIVERSAL_STATE_KEYS)[number];

export interface DemoSurface {
  /** Matches the UX file name under ux/demo/. */
  id: string;
  /** The route pattern the surface renders at. */
  route: string;
  /** A concrete path the capture harness can open. */
  samplePath: string;
  /** Every `?state=` key the surface registers. */
  keys: readonly string[];
}
