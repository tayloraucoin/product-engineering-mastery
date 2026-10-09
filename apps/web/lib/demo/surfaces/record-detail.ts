import { HALVORSEN_ID } from "../../../app/demo/_lib/fixtures/index.ts";
import type { DemoSurface } from "./types.ts";

export const recordDetail: DemoSurface = {
  id: "record-detail",
  route: "/demo/records/[id]",
  samplePath: `/demo/records/${HALVORSEN_ID}`,
  keys: [
    "diff",
    "no-history",
    "empty",
    "loading",
    "error",
    "not-found",
    "partial",
    "offline",
    "saved",
  ],
};
