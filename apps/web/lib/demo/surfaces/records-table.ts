import type { DemoSurface } from "./types.ts";

export const recordsTable: DemoSurface = {
  id: "records-table",
  route: "/demo/records",
  samplePath: "/demo/records",
  keys: [
    "empty",
    "no-results",
    "loading",
    "error",
    "partial",
    "offline",
    "deleted",
  ],
};
