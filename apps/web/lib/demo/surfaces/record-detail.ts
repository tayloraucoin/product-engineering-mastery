import type { DemoSurface } from "./types.ts";
import { HALVORSEN_ID } from "../../../app/demo/_lib/fixtures/index.ts";

export const recordDetail: DemoSurface = {
  id: "record-detail",
  route: "/demo/records/[id]",
  samplePath: `/demo/records/${HALVORSEN_ID}`,
  keys: ["empty", "loading", "error", "partial", "offline"],
};
